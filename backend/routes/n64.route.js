import express from "express";
import N64Room from "../models/N64Room.js";
import N64Booking from "../models/N64Booking.js";
import authenticateUser from "../middlewares/authenticateUser.js";
import { sendBookingConfirmationAsync } from "../services/emailService.js";

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

// GET /api/v1/n64-rooms - fetch all N64 booths
router.get("/", async (req, res) => {
  try {
    const booths = await N64Room.find();
    res.status(200).json({ success: true, booths });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
});

// GET /api/v1/n64-rooms/bookings - fetch all N64 bookings
router.get("/bookings", async (req, res) => {
  try {
    const { roomId } = req.query;
    let filter = {};

    // If roomId is provided, filter bookings by that room
    if (roomId) {
      filter.roomId = roomId;
    }

    // Populate booth info for each booking
    const bookings = await N64Booking.find(filter).populate("roomId");
    res.status(200).json({ success: true, bookings });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
});

// GET /api/v1/n64-rooms/my-bookings - fetch user's N64 bookings
router.get("/my-bookings", authenticateUser, async (req, res) => {
  try {
    const bookings = await N64Booking.find({ userId: req.user.id })
      .populate("roomId")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, bookings });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
});

// POST /api/v1/n64-rooms/bookings - create new N64 booking
router.post("/bookings", authenticateUser, async (req, res) => {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      numberOfPeople,
      roomId,
      roomType,
      date,
      time,
      durationHours,
      totalPrice,
      paymentId,
      paymentStatus,
      comments,
    } = req.body;

    if (
      !customerName ||
      !customerEmail ||
      !numberOfPeople ||
      !roomId ||
      !roomType ||
      !date ||
      !time ||
      !durationHours ||
      !totalPrice
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    // Parse the time and create start/end DateTime objects
    const [timeStr, period] = time.split(" ");
    const [hourStr, minuteStr] = timeStr.split(":");
    let hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);

    if (period === "PM" && hour !== 12) hour += 12;
    if (period === "AM" && hour === 12) hour = 0;

    // FIX: Store the exact time user selected without timezone conversion
    // If user books 5 PM, store 5 PM, display 5 PM everywhere
    // No need to create DateTime objects anymore - just use the strings directly

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

    // Determine booking status based on payment status
    const bookingStatus =
      paymentStatus === "completed" || paymentStatus === "COMPLETED"
        ? "confirmed"
        : "pending";

    const newBooking = new N64Booking({
      userId: req.user.id,
      customerName,
      customerEmail,
      customerPhone,
      numberOfPeople,
      roomId,
      roomType,
      date,
      time,
      durationHours,
      totalPrice,
      paymentId,
      paymentStatus: paymentStatus || "pending",
      status: bookingStatus, // Set status based on payment status
      comments,
    });

    await newBooking.save();

    // Get room name for email
    const room = await N64Room.findById(roomId);
    const roomName = room ? room.name : "N64 Gaming Booth";

    // Send confirmation email (non-blocking)
    sendBookingConfirmationAsync("n64", newBooking, { roomName });

    res.status(201).json({
      success: true,
      message: "N64 booking created successfully",
      booking: newBooking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

export default router;
