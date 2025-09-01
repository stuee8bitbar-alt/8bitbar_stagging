import express from "express";
import CafeBooking from "../models/CafeBooking.js";
import CafeLayout from "../models/CafeLayout.js";
import CafeSettings from "../models/CafeSettings.js";
import authenticateUser from "../middlewares/authenticateUser.js";
import { sendBookingConfirmationAsync } from "../services/emailService.js";

const router = express.Router();

// GET /api/v1/cafe/settings - fetch cafe settings for active template
router.get("/settings", async (req, res) => {
  try {
    // First find the active template for booking
    const activeLayout = await CafeLayout.findOne({
      isActiveForBooking: true,
      isActive: true,
    }).sort({ updatedAt: -1 });

    if (!activeLayout) {
      return res.status(404).json({
        success: false,
        message: "No active template found for booking",
      });
    }

    // Get settings for the active template
    let settings = await CafeSettings.findOne({
      templateName: activeLayout.templateName,
    });

    // Create default settings if none exist for this template
    if (!settings) {
      settings = await CafeSettings.create({
        templateName: activeLayout.templateName,
        timeSlots: [
          "14:00",
          "15:00",
          "16:00",
          "17:00",
          "18:00",
          "19:00",
          "20:00",
          "21:00",
          "22:00",
        ],
        pricePerChairPerHour: 10,
        maxDuration: 8,
        openingTime: "14:00",
        closingTime: "23:00",
      });
    }

    res.status(200).json({
      success: true,
      settings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

// GET /api/v1/cafe/layout - fetch cafe layout for booking
router.get("/layout", async (req, res) => {
  try {
    const { deviceType = "desktop" } = req.query;

    // First try to find the active template for the requested device type
    let layout = await CafeLayout.findOne({
      deviceType,
      isActiveForBooking: true,
      isActive: true,
    }).sort({ updatedAt: -1 });

    // If not found for the specific device type, try to find any active template
    if (!layout) {
      layout = await CafeLayout.findOne({
        isActiveForBooking: true,
        isActive: true,
      }).sort({ updatedAt: -1 });
    }

    if (!layout) {
      return res.status(404).json({
        success: false,
        message: "No active layout found for booking",
      });
    }

    res.status(200).json({
      success: true,
      layout,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

// GET /api/v1/cafe/bookings/check - check chair availability
router.get("/bookings/check", async (req, res) => {
  try {
    const { date, time, duration } = req.query;

    if (!date || !time || !duration) {
      return res.status(400).json({
        success: false,
        message: "Date, time, and duration are required",
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

    res.status(200).json({
      success: true,
      bookedChairs: Array.from(bookedChairs),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

// POST /api/v1/cafe/bookings - create new booking
router.post("/bookings", authenticateUser, async (req, res) => {
  try {
    const {
      chairIds,
      date,
      time,
      duration,
      customerName,
      customerEmail,
      customerPhone,
      specialRequests,
      deviceType,
      paymentId,
      paymentStatus,
      totalCost, // Allow frontend to pass total cost for free bookings
    } = req.body;

    if (!chairIds || !chairIds.length || !date || !time || !duration) {
      return res.status(400).json({
        success: false,
        message: "Chair IDs, date, time, and duration are required",
      });
    }

    // Check availability again before booking
    const bookings = await CafeBooking.find({
      date,
      status: { $in: ["pending", "confirmed"] },
    });

    const bookedChairs = new Set();
    bookings.forEach((booking) => {
      const bookingStartTime = parseInt(booking.time.split(":")[0]);
      const bookingEndTime = bookingStartTime + booking.duration;
      const requestedStartTime = parseInt(time.split(":")[0]);
      const requestedEndTime = requestedStartTime + parseInt(duration);

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

    // Check if any requested chairs are already booked
    const conflictingChairs = chairIds.filter((chairId) =>
      bookedChairs.has(chairId)
    );

    if (conflictingChairs.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Some chairs are already booked for this time slot",
        conflictingChairs,
      });
    }

    // Get active template settings for pricing
    const activeLayout = await CafeLayout.findOne({
      isActiveForBooking: true,
      isActive: true,
    }).sort({ updatedAt: -1 });

    let pricePerChairPerHour = 10; // Default fallback
    if (activeLayout) {
      const templateSettings = await CafeSettings.findOne({
        templateName: activeLayout.templateName,
      });
      if (templateSettings) {
        pricePerChairPerHour = templateSettings.pricePerChairPerHour;
      }
    }

    // Calculate total cost using template-specific pricing
    const calculatedTotalCost =
      chairIds.length * pricePerChairPerHour * duration;

    // Use provided totalCost if it's a free booking (0), otherwise use calculated
    const finalTotalCost = totalCost === 0 ? 0 : calculatedTotalCost;

    // Determine booking status - free bookings are auto-confirmed
    const bookingStatus =
      finalTotalCost === 0
        ? "confirmed"
        : paymentStatus === "completed" || paymentStatus === "COMPLETED"
        ? "confirmed"
        : "pending";

    const newBooking = new CafeBooking({
      userId: req.user.id,
      chairIds,
      date,
      time,
      duration,
      totalCost: finalTotalCost,
      customerName: customerName || req.user.name,
      customerEmail: customerEmail || req.user.email,
      customerPhone,
      specialRequests,
      deviceType: deviceType || "desktop",
      paymentId: finalTotalCost === 0 ? "FREE_BOOKING" : paymentId,
      paymentStatus:
        finalTotalCost === 0 ? "completed" : paymentStatus || "pending",
      status: bookingStatus,
    });

    await newBooking.save();

    // Send confirmation email (non-blocking)
    sendBookingConfirmationAsync("cafe", newBooking);

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
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

// GET /api/v1/cafe/bookings - fetch user's bookings
router.get("/bookings", authenticateUser, async (req, res) => {
  try {
    const bookings = await CafeBooking.find({ userId: req.user.id }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      bookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

// PUT /api/v1/cafe/bookings/:id/cancel - cancel booking
router.put("/bookings/:id/cancel", authenticateUser, async (req, res) => {
  try {
    const booking = await CafeBooking.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Booking is already cancelled",
      });
    }

    booking.status = "cancelled";
    await booking.save();

    res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      booking,
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
