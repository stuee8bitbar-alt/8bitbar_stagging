import express from "express";
import AllBookingsController from "../../controllers/all-bookings.controller.js";
import authenticateAdmin from "../../middlewares/authenticateAdmin.js";

const router = express.Router();

// Apply admin authentication middleware to all routes
router.use(authenticateAdmin);

// Get all bookings across all services with filtering
router.get("/", AllBookingsController.getAllBookings);

// Get calendar data for all bookings
router.get("/calendar", AllBookingsController.getCalendarData);

// Get booking statistics
router.get("/statistics", AllBookingsController.getBookingStatistics);

export default router;
