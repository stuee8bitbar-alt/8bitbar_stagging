import express from "express";
import KaraokeRoom from "../models/KaraokeRoom.js";
import KaraokeBooking from "../models/KaraokeBooking.js";
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

// GET /api/v1/karaoke-rooms - fetch all visible and active karaoke rooms
router.get("/", async (req, res) => {
  try {
    const rooms = await KaraokeRoom.find({ isVisible: true, isActive: true });
    console.log(rooms);
    res.status(200).json({ success: true, rooms });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
});

// GET /api/v1/karaoke-bookings - fetch all karaoke bookings
router.get("/bookings", async (req, res) => {
  try {
    const { roomId } = req.query;
    let filter = {};

    // If roomId is provided, filter bookings by that room
    if (roomId) {
      filter.roomId = roomId;
    }

    const bookings = await KaraokeBooking.find(filter).populate(
      "roomId",
      "name"
    );
    res.status(200).json({ success: true, bookings });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
});

// GET /api/v1/karaoke-rooms/my-bookings - fetch user's karaoke bookings
router.get("/my-bookings", authenticateUser, async (req, res) => {
  try {
    const bookings = await KaraokeBooking.find({ userId: req.user.id })
      .populate("roomId")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, bookings });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
});

// POST /api/v1/karaoke-rooms/bookings - create new karaoke booking
router.post("/bookings", authenticateUser, async (req, res) => {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      numberOfPeople,
      date,
      time,
      durationHours,
      totalPrice,
      paymentId,
      paymentStatus,
      roomId,
      comments,
    } = req.body;

    if (
      !customerName ||
      !customerEmail ||
      !numberOfPeople ||
      !date ||
      !time ||
      !durationHours ||
      totalPrice === undefined || // Allow 0 for free bookings
      !roomId
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

    // Determine booking status - free bookings are auto-confirmed
    const bookingStatus =
      totalPrice === 0
        ? "confirmed"
        : paymentStatus === "completed" || paymentStatus === "COMPLETED"
        ? "confirmed"
        : "pending";

    const newBooking = new KaraokeBooking({
      userId: req.user.id,
      roomId,
      customerName,
      customerEmail,
      customerPhone,
      numberOfPeople,
      date,
      time,
      durationHours,
      totalPrice,
      paymentId: totalPrice === 0 ? "FREE_BOOKING" : paymentId,
      paymentStatus:
        totalPrice === 0 ? "completed" : paymentStatus || "pending",
      status: bookingStatus,
      comments,
    });

    await newBooking.save();

    // Get room name for email
    const room = await KaraokeRoom.findById(roomId);
    const roomName = room ? room.name : "Karaoke Room";

    // Send confirmation email (non-blocking)
    sendBookingConfirmationAsync("karaoke", newBooking, { roomName });

    res.status(201).json({
      success: true,
      message: "Karaoke booking created successfully",
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
