import express from "express";
import authenticateAdmin from "../../middlewares/authenticateAdmin.js";
import N64Booking from "../../models/N64Booking.js";
import N64Room from "../../models/N64Room.js";

const router = express.Router();

router.use(authenticateAdmin);

// Dashboard stats endpoints
router.get("/n64-bookings/count", async (req, res) => {
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

    const count = await N64Booking.countDocuments(filter);
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: "Error fetching N64 bookings count" });
  }
});

router.get("/n64-bookings/revenue", async (req, res) => {
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

    const revenue = await N64Booking.aggregate([
      { $match: matchFilter },
      { $group: { _id: null, totalRevenue: { $sum: "$totalPrice" } } },
    ]);
    const totalRevenue = revenue.length > 0 ? revenue[0].totalRevenue : 0;
    res.json({ revenue: totalRevenue });
  } catch (error) {
    res.status(500).json({ message: "Error fetching N64 bookings revenue" });
  }
});

router.get("/n64-rooms/count", async (req, res) => {
  try {
    const count = await N64Room.countDocuments();
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: "Error fetching N64 rooms count" });
  }
});

// N64 Bookings Management
router.get("/n64-bookings", async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status && status !== "all" ? { status } : {};

    const bookings = await N64Booking.find(filter)
      .populate("roomId", "name")
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.json({ bookings });
  } catch (error) {
    console.error("Error fetching N64 bookings:", error);
    res.status(500).json({ message: "Error fetching N64 bookings" });
  }
});

router.patch("/n64-bookings/:id/status", async (req, res) => {
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
        const existingBooking = await N64Booking.findById(req.params.id);
        paymentStatus = existingBooking.paymentStatus;
        break;
      default:
        paymentStatus = "pending";
    }

    const booking = await N64Booking.findByIdAndUpdate(
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
router.patch("/n64-bookings/:id/payment-status", async (req, res) => {
  try {
    const { paymentStatus } = req.body;

    if (
      !paymentStatus ||
      !["pending", "completed", "failed", "refunded"].includes(paymentStatus)
    ) {
      return res.status(400).json({ message: "Invalid payment status" });
    }

    const booking = await N64Booking.findByIdAndUpdate(
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

// Delete N64 booking
router.delete("/n64-bookings/:id", async (req, res) => {
  try {
    const booking = await N64Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    await N64Booking.findByIdAndDelete(req.params.id);

    console.log(`🗑️ Deleted N64 booking: ${req.params.id}`);
    res.json({ message: "N64 booking deleted successfully" });
  } catch (error) {
    console.error("Error deleting N64 booking:", error);
    res.status(500).json({ message: "Error deleting N64 booking" });
  }
});

// N64 Rooms Management
router.get("/n64-rooms", async (req, res) => {
  try {
    const rooms = await N64Room.find().sort({ createdAt: -1 });
    res.json({ rooms });
  } catch (error) {
    res.status(500).json({ message: "Error fetching N64 rooms" });
  }
});

router.put("/n64-rooms/:id", async (req, res) => {
  try {
    const room = await N64Room.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json({ room });
  } catch (error) {
    res.status(500).json({ message: "Error updating N64 room" });
  }
});

export default router;
