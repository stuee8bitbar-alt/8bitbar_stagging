import express from "express";
import authenticateAdmin from "../../middlewares/authenticateAdmin.js";
import KaraokeBooking from "../../models/KaraokeBooking.js";
import KaraokeRoom from "../../models/KaraokeRoom.js";

const router = express.Router();

router.use(authenticateAdmin);

// Dashboard stats endpoints
router.get("/karaoke-bookings/count", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let filter = {};

    // Add date filtering if provided
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) {
        // FIX: Use simple date string comparison - no timezone issues
        filter.date.$gte = startDate;
      }
      if (endDate) {
        // FIX: Use simple date string comparison - no timezone issues
        filter.date.$lte = endDate;
      }
    }

    const count = await KaraokeBooking.countDocuments(filter);
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: "Error fetching karaoke bookings count" });
  }
});

router.get("/karaoke-bookings/revenue", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let matchFilter = { status: { $ne: "cancelled" } };

    // Add date filtering if provided
    if (startDate || endDate) {
      matchFilter.date = {};
      if (startDate) {
        // FIX: Use simple date string comparison - no timezone issues
        matchFilter.date.$gte = startDate;
      }
      if (endDate) {
        // FIX: Use simple date string comparison - no timezone issues
        matchFilter.date.$lte = endDate;
      }
    }

    const revenue = await KaraokeBooking.aggregate([
      { $match: matchFilter },
      { $group: { _id: null, totalRevenue: { $sum: "$totalPrice" } } },
    ]);
    const totalRevenue = revenue.length > 0 ? revenue[0].totalRevenue : 0;
    res.json({ revenue: totalRevenue });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching karaoke bookings revenue" });
  }
});

router.get("/karaoke-rooms/count", async (req, res) => {
  try {
    const count = await KaraokeRoom.countDocuments();
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: "Error fetching karaoke rooms count" });
  }
});

// Karaoke Bookings Management
router.get("/karaoke-bookings", async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status && status !== "all" ? { status } : {};

    const bookings = await KaraokeBooking.find(filter)
      .populate("userId", "name email")
      .populate("roomId", "name")
      .sort({ createdAt: -1 });

    res.json({ bookings });
  } catch (error) {
    console.error("Error fetching karaoke bookings:", error);
    res.status(500).json({ message: "Error fetching karaoke bookings" });
  }
});

router.patch("/karaoke-bookings/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    // Determine payment status based on booking status
    let paymentStatus;
    switch (status) {
      case "pending":
        paymentStatus = "pending";

        break;
      case "confirmed":
        paymentStatus = "completed";

        break;
      case "cancelled":
      case "completed":
        // Keep existing payment status for cancelled/completed bookings
        const existingBooking = await KaraokeBooking.findById(req.params.id);
        paymentStatus = existingBooking.paymentStatus;
        break;
      default:
        paymentStatus = "pending";
    }

    const booking = await KaraokeBooking.findByIdAndUpdate(
      req.params.id,
      { status, paymentStatus },
      { new: true }
    )
      .populate("userId", "name email")
      .populate("roomId", "name");
    res.json({ booking });
  } catch (error) {
    res.status(500).json({ message: "Error updating booking status" });
  }
});

// Update payment status independently
router.patch("/karaoke-bookings/:id/payment-status", async (req, res) => {
  try {
    const { paymentStatus } = req.body;

    if (
      !paymentStatus ||
      !["pending", "completed", "failed", "refunded"].includes(paymentStatus)
    ) {
      return res.status(400).json({ message: "Invalid payment status" });
    }

    const booking = await KaraokeBooking.findByIdAndUpdate(
      req.params.id,
      { paymentStatus },
      { new: true }
    )
      .populate("userId", "name email")
      .populate("roomId", "name");

    res.json({ booking });
  } catch (error) {
    res.status(500).json({ message: "Error updating payment status" });
  }
});

// Delete karaoke booking
router.delete("/karaoke-bookings/:id", async (req, res) => {
  try {
    const booking = await KaraokeBooking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    await KaraokeBooking.findByIdAndDelete(req.params.id);

    console.log(`🗑️ Deleted karaoke booking: ${req.params.id}`);
    res.json({ message: "Karaoke booking deleted successfully" });
  } catch (error) {
    console.error("Error deleting karaoke booking:", error);
    res.status(500).json({ message: "Error deleting karaoke booking" });
  }
});

// Karaoke Rooms Management
router.get("/karaoke-rooms", async (req, res) => {
  try {
    const rooms = await KaraokeRoom.find().sort({ createdAt: -1 });
    res.json({ rooms });
  } catch (error) {
    res.status(500).json({ message: "Error fetching karaoke rooms" });
  }
});

// Create new karaoke room
router.post("/karaoke-rooms", async (req, res) => {
  try {
    const {
      name,
      description,
      maxPeople,
      pricePerHour,
      timeSlots,
      weekDays,
      inclusions,
      imageUrl,
      images,
      isVisible,
      isActive,
      blockStartDate,
      blockEndDate,
      blockNote
    } = req.body;

    const newRoom = new KaraokeRoom({
      name,
      description,
      maxPeople: parseInt(maxPeople),
      pricePerHour: parseFloat(pricePerHour),
      timeSlots: timeSlots || [
        "2:00 PM",
        "3:00 PM",
        "4:00 PM",
        "5:00 PM",
        "6:00 PM",
        "7:00 PM",
        "8:00 PM",
        "9:00 PM",
        "10:00 PM",
      ],
      weekDays: weekDays || [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      inclusions: {
        microphones: inclusions?.microphones || 4,
        features: inclusions?.features || [
          "Pick-your-own songs displayed with lyrics on a large screen",
          "Professional karaoke system",
        ],
      },
      imageUrl,
      images: images || [],
      isVisible: isVisible !== undefined ? isVisible : true,
      isActive: isActive !== undefined ? isActive : true,
      blockStartDate,
      blockEndDate,
      blockNote
    });

    const savedRoom = await newRoom.save();
    res.status(201).json({ room: savedRoom });
  } catch (error) {
    console.error("Error creating karaoke room:", error);
    res.status(500).json({ message: "Error creating karaoke room" });
  }
});

router.put("/karaoke-rooms/:id", async (req, res) => {
  try {
    const room = await KaraokeRoom.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json({ room });
  } catch (error) {
    res.status(500).json({ message: "Error updating karaoke room" });
  }
});

// Delete karaoke room
router.delete("/karaoke-rooms/:id", async (req, res) => {
  try {
    await KaraokeRoom.findByIdAndDelete(req.params.id);
    res.json({ message: "Karaoke room deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting karaoke room" });
  }
});

// Get available time slots for all rooms
router.get("/time-slots", async (req, res) => {
  try {
    const rooms = await KaraokeRoom.find({}, "timeSlots name");
    const allTimeSlots = new Set();

    rooms.forEach((room) => {
      room.timeSlots.forEach((slot) => allTimeSlots.add(slot));
    });

    res.json({
      timeSlots: Array.from(allTimeSlots).sort(),
      rooms: rooms.map((room) => ({
        id: room._id,
        name: room.name,
        timeSlots: room.timeSlots,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching time slots" });
  }
});

// Add new time slot to a specific room
router.post("/karaoke-rooms/:id/time-slots", async (req, res) => {
  try {
    const { timeSlot } = req.body;
    const room = await KaraokeRoom.findById(req.params.id);

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    if (!room.timeSlots.includes(timeSlot)) {
      room.timeSlots.push(timeSlot);
      room.timeSlots.sort();
      await room.save();
    }

    res.json({ room });
  } catch (error) {
    res.status(500).json({ message: "Error adding time slot" });
  }
});

// Remove time slot from a specific room
router.delete("/karaoke-rooms/:id/time-slots/:timeSlot", async (req, res) => {
  try {
    const room = await KaraokeRoom.findById(req.params.id);

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    room.timeSlots = room.timeSlots.filter(
      (slot) => slot !== req.params.timeSlot
    );
    await room.save();

    res.json({ room });
  } catch (error) {
    res.status(500).json({ message: "Error removing time slot" });
  }
});

// Toggle room visibility
router.patch("/karaoke-rooms/:id/visibility", async (req, res) => {
  try {
    const { isVisible } = req.body;
    const room = await KaraokeRoom.findById(req.params.id);

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    room.isVisible = isVisible;
    await room.save();

    res.json({ room });
  } catch (error) {
    res.status(500).json({ message: "Error updating room visibility" });
  }
});

// Toggle room active status
router.patch("/karaoke-rooms/:id/active", async (req, res) => {
  try {
    const { isActive } = req.body;
    const room = await KaraokeRoom.findById(req.params.id);

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    room.isActive = isActive;
    await room.save();

    res.json({ room });
  } catch (error) {
    res.status(500).json({ message: "Error updating room active status" });
  }
});

export default router;
