import express from "express";
import bcrypt from "bcryptjs";
import User from "../../models/user.model.js";
import KaraokeBooking from "../../models/KaraokeBooking.js";
import KaraokeRoom from "../../models/KaraokeRoom.js";
import N64Booking from "../../models/N64Booking.js";
import N64Room from "../../models/N64Room.js";
import CafeBooking from "../../models/CafeBooking.js";
import CafeSettings from "../../models/CafeSettings.js";
import CafeLayout from "../../models/CafeLayout.js";
import StaffPin from "../../models/StaffPin.js";

const router = express.Router();

// Helper function to convert time string to minutes since midnight
const convertTimeToMinutes = (timeString) => {
  const match = timeString.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return 0;

  let [_, hourStr, minuteStr, period] = match;
  let hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);

  // Convert to 24-hour format
  if (period.toUpperCase() === "PM" && hour !== 12) hour += 12;
  if (period.toUpperCase() === "AM" && hour === 12) hour = 0;

  return hour * 60 + minute;
};

// Helper function to find or create user
const findOrCreateUser = async (userData) => {
  const { name, email, phone, dob } = userData;

  // Normalize email
  const normalizedEmail = email.toLowerCase().trim();

  // Check if user already exists
  let user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    // Generate a temporary password
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Create new user
    user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      ...(dob && { dob: new Date(dob) }),
    });

    console.log(
      `🆕 NEW USER CREATED - Email: ${normalizedEmail}, TempPassword: ${tempPassword}`
    );
    return { user, isNewUser: true, tempPassword };
  }

  console.log(
    `👤 EXISTING USER FOUND - Email: ${normalizedEmail}, UserID: ${user._id}`
  );
  return { user, isNewUser: false };
};

// Helper function to verify PIN and get staff info
const verifyStaffPin = async (pin) => {
  if (!pin) {
    return { isValid: false, message: "PIN is required for manual bookings" };
  }

  const staffPin = await StaffPin.findOne({
    pin,
    isActive: true,
  }).populate("adminUserId", "name email");

  if (!staffPin) {
    return { isValid: false, message: "Invalid PIN" };
  }

  return {
    isValid: true,
    staffInfo: {
      pin: staffPin.pin,
      staffName: staffPin.staffName,
      adminUserId: staffPin.adminUserId._id,
      adminName: staffPin.adminUserId.name,
      adminEmail: staffPin.adminUserId.email,
    },
  };
};

// Manual Karaoke Booking
router.post("/karaoke", async (req, res) => {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      customerDob,
      roomId,
      numberOfPeople,
      date,
      time,
      durationHours,
      status,
      staffPin, // New field for staff identification
      comments, // Include comments field
    } = req.body;

    // Validate required fields
    if (
      !customerName ||
      !customerEmail ||
      !roomId ||
      !numberOfPeople ||
      !date ||
      !time ||
      !durationHours ||
      !status ||
      !staffPin // PIN is now required for manual bookings
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields including staff PIN",
      });
    }

    // Validate status
    if (!["pending", "confirmed"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be 'pending' or 'confirmed'",
      });
    }

    // Verify staff PIN
    const pinVerification = await verifyStaffPin(staffPin);
    if (!pinVerification.isValid) {
      return res.status(400).json({
        success: false,
        message: pinVerification.message,
      });
    }

    const { staffInfo } = pinVerification;

    // Find or create user
    const { user, isNewUser, tempPassword } = await findOrCreateUser({
      name: customerName,
      email: customerEmail,
      phone: customerPhone,
      dob: customerDob,
    });

    // Get room details for pricing
    const room = await KaraokeRoom.findById(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Karaoke room not found",
      });
    }

    // Calculate total price
    // FIX: No more timezone issues - just use the date and time as provided
    console.log("🔍 Manual Karaoke Booking - Date Debug:");
    console.log("  Input date:", date);
    console.log("  Input time:", time);
    console.log("  Input durationHours:", durationHours);

    const totalPrice = room.pricePerHour * durationHours;

    // Check for conflicts using proper overlap detection
    const allBookingsForDate = await KaraokeBooking.find({
      roomId,
      date,
      status: { $in: ["pending", "confirmed"] },
    });

    // Check for time slot overlaps
    const conflictingBooking = allBookingsForDate.find((booking) => {
      // Convert times to comparable format
      const requestedStart = convertTimeToMinutes(time);
      const requestedEnd = requestedStart + durationHours * 60;

      const bookingStart = convertTimeToMinutes(booking.time);
      const bookingEnd = bookingStart + booking.durationHours * 60;

      // Check for overlap: (StartA < EndB) and (StartB < EndA)
      return requestedStart < bookingEnd && bookingStart < requestedEnd;
    });

    if (conflictingBooking) {
      return res.status(400).json({
        success: false,
        message: "Time slot conflicts with existing booking",
      });
    }

    // Use payment status from request body, default to "pending" if not provided
    const paymentStatus = req.body.paymentStatus || "pending";

    // Create booking with staff information
    const booking = await KaraokeBooking.create({
      userId: user._id,
      roomId,
      customerName,
      customerEmail: customerEmail.toLowerCase().trim(),
      customerPhone,
      numberOfPeople,
      date,
      time,
      durationHours,
      totalPrice,
      status,
      paymentStatus,
      paymentId: `admin-${Date.now()}`, // Admin booking identifier
      staffPin: staffInfo.pin,
      staffName: staffInfo.staffName,
      isManualBooking: true,
      comments, // Include comments field
    });

    const populatedBooking = await KaraokeBooking.findById(booking._id)
      .populate("userId", "name email")
      .populate("roomId", "name");

    res.status(201).json({
      success: true,
      message: "Karaoke booking created successfully",
      booking: populatedBooking,
      userInfo: {
        isNewUser,
        ...(isNewUser && { tempPassword }),
      },
      staffInfo: {
        staffName: staffInfo.staffName,
        pin: staffInfo.pin,
      },
    });
  } catch (error) {
    console.error("Error creating manual karaoke booking:", error);
    res.status(500).json({
      success: false,
      message: "Error creating booking",
    });
  }
});

// Manual N64 Booking
router.post("/n64", async (req, res) => {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      customerDob,
      roomId,
      roomType,
      numberOfPeople,
      date,
      time,
      durationHours,
      status,
      staffPin, // New field for staff identification
      comments, // Include comments field
    } = req.body;

    // Validate required fields
    if (
      !customerName ||
      !customerEmail ||
      !roomId ||
      !roomType ||
      !numberOfPeople ||
      !date ||
      !time ||
      !durationHours ||
      !status ||
      !staffPin // PIN is now required for manual bookings
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields including staff PIN",
      });
    }

    // Validate status
    if (!["pending", "confirmed"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be 'pending' or 'confirmed'",
      });
    }

    // Verify staff PIN
    const pinVerification = await verifyStaffPin(staffPin);
    if (!pinVerification.isValid) {
      return res.status(400).json({
        success: false,
        message: pinVerification.message,
      });
    }

    const { staffInfo } = pinVerification;

    // Find or create user
    const { user, isNewUser, tempPassword } = await findOrCreateUser({
      name: customerName,
      email: customerEmail,
      phone: customerPhone,
      dob: customerDob,
    });

    // Get room details for pricing
    const room = await N64Room.findById(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: "N64 room not found",
      });
    }

    // Calculate total price
    // FIX: No more timezone issues - just use the date and time as provided
    const totalPrice = room.pricePerHour * durationHours;

    // Check for conflicts using proper overlap detection
    const allBookingsForDate = await N64Booking.find({
      roomId,
      date,
      status: { $in: ["pending", "confirmed"] },
    });

    // Check for time slot overlaps
    const conflictingBooking = allBookingsForDate.find((booking) => {
      // Convert times to comparable format
      const requestedStart = convertTimeToMinutes(time);
      const requestedEnd = requestedStart + durationHours * 60;

      const bookingStart = convertTimeToMinutes(booking.time);
      const bookingEnd = bookingStart + booking.durationHours * 60;

      // Check for overlap: (StartA < EndB) and (StartB < EndA)
      return requestedStart < bookingEnd && bookingStart < requestedEnd;
    });

    if (conflictingBooking) {
      return res.status(400).json({
        success: false,
        message: "Time slot conflicts with existing booking",
      });
    }

    // Use payment status from request body, default to "pending" if not provided
    const paymentStatus = req.body.paymentStatus || "pending";

    // Create booking with staff information
    const booking = await N64Booking.create({
      userId: user._id,
      roomId,
      roomType,
      customerName,
      customerEmail: customerEmail.toLowerCase().trim(),
      customerPhone,
      numberOfPeople,
      date,
      time,
      durationHours,
      totalPrice,
      status,
      paymentStatus,
      paymentId: `admin-${Date.now()}`, // Admin booking identifier
      staffPin: staffInfo.pin,
      staffName: staffInfo.staffName,
      isManualBooking: true,
      comments, // Include comments field
    });

    const populatedBooking = await N64Booking.findById(booking._id)
      .populate("userId", "name email")
      .populate("roomId", "name");

    res.status(201).json({
      success: true,
      message: "N64 booking created successfully",
      booking: populatedBooking,
      userInfo: {
        isNewUser,
        ...(isNewUser && { tempPassword }),
      },
      staffInfo: {
        staffName: staffInfo.staffName,
        pin: staffInfo.pin,
      },
    });
  } catch (error) {
    console.error("Error creating manual N64 booking:", error);
    res.status(500).json({
      success: false,
      message: "Error creating booking",
    });
  }
});

// Manual Cafe Booking
router.post("/cafe", async (req, res) => {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      customerDob,
      chairIds,
      date,
      time,
      duration,
      specialRequests,
      deviceType = "desktop",
      status,
      staffPin, // New field for staff identification
    } = req.body;

    // Validate required fields
    if (
      !customerName ||
      !customerEmail ||
      !chairIds ||
      !Array.isArray(chairIds) ||
      chairIds.length === 0 ||
      !date ||
      !time ||
      !duration ||
      !status ||
      !staffPin // PIN is now required for manual bookings
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields including staff PIN",
      });
    }

    // Validate status
    if (!["pending", "confirmed"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be 'pending' or 'confirmed'",
      });
    }

    // Verify staff PIN
    const pinVerification = await verifyStaffPin(staffPin);
    if (!pinVerification.isValid) {
      return res.status(400).json({
        success: false,
        message: pinVerification.message,
      });
    }

    const { staffInfo } = pinVerification;

    // Find or create user
    const { user, isNewUser, tempPassword } = await findOrCreateUser({
      name: customerName,
      email: customerEmail,
      phone: customerPhone,
      dob: customerDob,
    });

    // Get cafe settings for pricing
    const settings = await CafeSettings.findOne();
    if (!settings) {
      return res.status(404).json({
        success: false,
        message: "Cafe settings not found",
      });
    }

    // Calculate total cost
    const totalCost =
      chairIds.length * settings.pricePerChairPerHour * duration;

    // Check for conflicts
    const conflictingBooking = await CafeBooking.findOne({
      date,
      time,
      status: { $in: ["pending", "confirmed"] },
      chairIds: { $in: chairIds },
    });

    if (conflictingBooking) {
      return res.status(400).json({
        success: false,
        message: "One or more chairs are already booked for this time slot",
      });
    }

    // Use payment status from request body, default to "pending" if not provided
    const paymentStatus = req.body.paymentStatus || "pending";

    // Create booking with staff information
    const booking = await CafeBooking.create({
      userId: user._id,
      chairIds,
      date,
      time,
      duration,
      totalCost,
      customerName,
      customerEmail: customerEmail.toLowerCase().trim(),
      customerPhone,
      specialRequests,
      deviceType,
      status,
      paymentStatus,
      paymentId: `admin-${Date.now()}`,
      staffPin: staffInfo.pin,
      staffName: staffInfo.staffName,
      isManualBooking: true,
    });

    const populatedBooking = await CafeBooking.findById(booking._id).populate(
      "userId",
      "name email"
    );

    res.status(201).json({
      success: true,
      message: "Cafe booking created successfully",
      booking: populatedBooking,
      userInfo: {
        isNewUser,
        ...(isNewUser && { tempPassword }),
      },
      staffInfo: {
        staffName: staffInfo.staffName,
        pin: staffInfo.pin,
      },
    });
  } catch (error) {
    console.error("Error creating manual cafe booking:", error);
    res.status(500).json({
      success: false,
      message: "Error creating booking",
    });
  }
});

// Get available rooms/resources for booking
router.get("/resources", async (req, res) => {
  try {
    const [karaokeRooms, n64Rooms, cafeSettings, cafeLayout] =
      await Promise.all([
        KaraokeRoom.find({ isActive: { $ne: false } }).select(
          "name pricePerHour maxPeople"
        ),
        N64Room.find({ isActive: { $ne: false } }).select(
          "name pricePerHour maxPeople roomType"
        ),
        CafeSettings.findOne().select(
          "pricePerChairPerHour timeSlots maxDuration"
        ),
        CafeLayout.findOne({ deviceType: "desktop" })
          .sort({ updatedAt: -1 })
          .select("chairs"),
      ]);

    res.json({
      success: true,
      resources: {
        karaoke: karaokeRooms,
        n64: n64Rooms,
        cafe: {
          ...cafeSettings?.toObject(),
          chairs: cafeLayout?.chairs || [],
        },
      },
    });
  } catch (error) {
    console.error("Error fetching booking resources:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching resources",
    });
  }
});

// Get karaoke room availability for specific date/room
router.get("/karaoke/availability", async (req, res) => {
  try {
    const { date, roomId } = req.query;

    if (!date || !roomId) {
      return res.status(400).json({
        success: false,
        message: "Date and roomId are required",
      });
    }

    // Get room details
    const room = await KaraokeRoom.findById(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    // Find all bookings for the specified date and room
    // TIMEZONE FIX: Use UTC date comparison to match database storage
    const startOfDay = new Date(`${date}T00:00:00.000Z`);
    const endOfDay = new Date(`${date}T23:59:59.999Z`);

    const bookings = await KaraokeBooking.find({
      roomId,
      status: { $in: ["pending", "confirmed"] },
      date: date,
    });

    res.json({
      success: true,
      room,
      bookings,
      timeSlots: room.timeSlots,
    });
  } catch (error) {
    console.error("Error fetching karaoke availability:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching availability",
    });
  }
});

// Get N64 room availability for specific date/room
router.get("/n64/availability", async (req, res) => {
  try {
    const { date, roomId } = req.query;

    if (!date || !roomId) {
      return res.status(400).json({
        success: false,
        message: "Date and roomId are required",
      });
    }

    // Get room details
    const room = await N64Room.findById(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    // Find all bookings for the specified date and room
    // TIMEZONE FIX: Use UTC date comparison to match database storage
    const startOfDay = new Date(`${date}T00:00:00.000Z`);
    const endOfDay = new Date(`${date}T23:59:59.999Z`);

    const bookings = await N64Booking.find({
      roomId,
      status: { $in: ["pending", "confirmed"] },
      date: date,
    });

    res.json({
      success: true,
      room,
      bookings,
      timeSlots: room.timeSlots,
    });
  } catch (error) {
    console.error("Error fetching N64 availability:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching availability",
    });
  }
});

// Get chair availability for specific date/time
router.get("/cafe/chairs/availability", async (req, res) => {
  try {
    const { date, time, duration } = req.query;

    if (!date || !time || !duration) {
      return res.status(400).json({
        success: false,
        message: "Date, time, and duration are required",
      });
    }

    // Get cafe layout
    const cafeLayout = await CafeLayout.findOne({ deviceType: "desktop" })
      .sort({ updatedAt: -1 })
      .select("chairs");

    if (!cafeLayout) {
      return res.status(404).json({
        success: false,
        message: "Cafe layout not found",
      });
    }

    // Find all bookings for the specified date and time range
    const bookings = await CafeBooking.find({
      date,
      status: { $in: ["pending", "confirmed"] },
    });

    // Extract booked chair IDs for the time slot
    const bookedChairs = new Set();

    bookings.forEach((booking) => {
      const bookingStartTime = parseInt(booking.time.split(":")[0]);
      const bookingEndTime = bookingStartTime + booking.duration;
      const requestedStartTime = parseInt(time.split(":")[0]);
      const requestedEndTime = requestedStartTime + parseInt(duration);

      // Check if time slots overlap
      if (
        (requestedStartTime >= bookingStartTime &&
          requestedStartTime < bookingEndTime) ||
        (requestedEndTime > bookingStartTime &&
          requestedEndTime <= bookingEndTime) ||
        (requestedStartTime <= bookingStartTime &&
          requestedEndTime >= bookingEndTime)
      ) {
        booking.chairIds.forEach((chairId) => bookedChairs.add(chairId));
      }
    });

    // Add availability status to each chair
    const chairsWithAvailability = cafeLayout.chairs.map((chair) => ({
      ...chair.toObject(),
      isAvailable:
        !bookedChairs.has(chair.id) && !bookedChairs.has(chair._id.toString()),
    }));

    res.json({
      success: true,
      chairs: chairsWithAvailability,
      bookedChairs: Array.from(bookedChairs),
    });
  } catch (error) {
    console.error("Error fetching chair availability:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching chair availability",
    });
  }
});

export default router;
