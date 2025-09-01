import express from "express";
import FinanceController from "../../controllers/finance.controller.js";

const router = express.Router();

// Get consolidated bookings with filtering options
router.get("/bookings", FinanceController.getConsolidatedBookings);

// Get financial analytics and summaries
router.get("/analytics", FinanceController.getFinancialAnalytics);

// Get revenue breakdown by service type
router.get("/revenue-breakdown", FinanceController.getRevenueBreakdown);

// Get booking statistics by date range
router.get("/statistics", FinanceController.getBookingStatistics);

// Get calendar data for bookings
router.get("/calendar", FinanceController.getCalendarData);

// Get export data for financial reports
router.get("/export", FinanceController.exportFinancialData);

export default router;
