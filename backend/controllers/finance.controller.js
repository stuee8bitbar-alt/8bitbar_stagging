import KaraokeBooking from "../models/KaraokeBooking.js";
import N64Booking from "../models/N64Booking.js";
import CafeBooking from "../models/CafeBooking.js";
import {
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
} from "date-fns";

class FinanceController {
  // Get consolidated bookings with filtering options
  static async getConsolidatedBookings(req, res) {
    try {
      const {
        serviceType, // 'karaoke', 'n64', 'cafe', or 'all'
        status, // 'pending', 'confirmed', 'completed', 'cancelled', or 'all'
        startDate,
        endDate,
        page = 1,
        limit = 50,
        sortBy = "date",
        sortOrder = "desc",
      } = req.query;

      const query = {};
      const dateQuery = {};

      // Date filtering - Use string comparison for YYYY-MM-DD format
      if (startDate && endDate) {
        dateQuery.$gte = startDate;
        dateQuery.$lte = endDate;
      } else if (startDate) {
        dateQuery.$gte = startDate;
      } else if (endDate) {
        dateQuery.$lte = endDate;
      }

      // Status filtering
      if (status && status !== "all") {
        query.status = status;
      }

      // Service type filtering
      let karaokeBookings = [];
      let n64Bookings = [];
      let cafeBookings = [];

      if (serviceType === "all" || serviceType === "karaoke") {
        const karaokeQuery = { ...query };
        if (Object.keys(dateQuery).length > 0) {
          karaokeQuery.date = dateQuery;
        }
        karaokeBookings = await KaraokeBooking.find(karaokeQuery)
          .populate("roomId", "name")
          .sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 })
          .limit(parseInt(limit))
          .skip((parseInt(page) - 1) * parseInt(limit));
      }

      if (serviceType === "all" || serviceType === "n64") {
        const n64Query = { ...query };
        if (Object.keys(dateQuery).length > 0) {
          n64Query.date = dateQuery;
        }
        n64Bookings = await N64Booking.find(n64Query)
          .populate("roomId", "name")
          .sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 })
          .limit(parseInt(limit))
          .skip((parseInt(page) - 1) * parseInt(limit));
      }

      if (serviceType === "all" || serviceType === "cafe") {
        const cafeQuery = { ...query };
        if (Object.keys(dateQuery).length > 0) {
          cafeQuery.date = dateQuery;
        }
        cafeBookings = await CafeBooking.find(cafeQuery)
          .sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 })
          .limit(parseInt(limit))
          .skip((parseInt(page) - 1) * parseInt(limit));
      }

      // Transform bookings to unified format
      const consolidatedBookings = [
        ...karaokeBookings.map((booking) => ({
          ...booking.toObject(),
          serviceType: "karaoke",
          bookingDate: booking.date,
          time: booking.time, // Simple "3:00 PM" format
          roomName: booking.roomId?.name || "Karaoke Room",
        })),
        ...n64Bookings.map((booking) => ({
          ...booking.toObject(),
          serviceType: "n64",
          bookingDate: booking.date,
          time: booking.time, // Explicitly include time field
          roomName: booking.roomId?.name || booking.roomType || "N64 Room",
        })),
        ...cafeBookings.map((booking) => ({
          ...booking.toObject(),
          serviceType: "cafe",
          bookingDate: booking.date, // Keep as string like other services
          time: booking.time, // Explicitly include time field
          roomName: `${booking.chairIds.length} Chair${
            booking.chairIds.length > 1 ? "s" : ""
          }`,
        })),
      ];

      // Sort consolidated bookings
      consolidatedBookings.sort((a, b) => {
        const aDate = new Date(a.bookingDate);
        const bDate = new Date(b.bookingDate);
        return sortOrder === "desc" ? bDate - aDate : aDate - bDate;
      });

      res.json({
        success: true,
        bookings: consolidatedBookings,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: consolidatedBookings.length,
        },
      });
    } catch (error) {
      console.error("Error fetching consolidated bookings:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch consolidated bookings",
      });
    }
  }

  // Get financial analytics and summaries
  static async getFinancialAnalytics(req, res) {
    try {
      const { startDate, endDate, period = "month" } = req.query;

      let dateQuery = {};
      if (startDate && endDate) {
        dateQuery.$gte = startDate; // Use string comparison for YYYY-MM-DD format
        dateQuery.$lte = endDate; // Use string comparison for YYYY-MM-DD format
      } else {
        // Default to current month if no dates provided
        const now = new Date();
        dateQuery.$gte = startOfMonth(now);
        dateQuery.$lte = endOfMonth(now);
      }

      // Get bookings for each service type
      const karaokeBookings = await KaraokeBooking.find({
        date: dateQuery,
        status: { $ne: "cancelled" },
      });

      const n64Bookings = await N64Booking.find({
        date: dateQuery,
        status: { $ne: "cancelled" },
      });

      const cafeBookings = await CafeBooking.find({
        date: dateQuery,
        status: { $ne: "cancelled" },
      });

      // Calculate analytics
      const analytics = {
        totalRevenue: 0,
        totalBookings: 0,
        averageBookingValue: 0,
        serviceBreakdown: {
          karaoke: { revenue: 0, bookings: 0, average: 0 },
          n64: { revenue: 0, bookings: 0, average: 0 },
          cafe: { revenue: 0, bookings: 0, average: 0 },
        },
        statusBreakdown: {
          pending: 0,
          confirmed: 0,
          completed: 0,
          cancelled: 0,
        },
      };

      // Calculate karaoke analytics
      karaokeBookings.forEach((booking) => {
        const revenue = booking.totalPrice || 0;
        analytics.totalRevenue += revenue;
        analytics.totalBookings++;
        analytics.serviceBreakdown.karaoke.revenue += revenue;
        analytics.serviceBreakdown.karaoke.bookings++;
        analytics.statusBreakdown[booking.status]++;
      });

      // Calculate N64 analytics
      n64Bookings.forEach((booking) => {
        const revenue = booking.totalPrice || 0;
        analytics.totalRevenue += revenue;
        analytics.totalBookings++;
        analytics.serviceBreakdown.n64.revenue += revenue;
        analytics.serviceBreakdown.n64.bookings++;
        analytics.statusBreakdown[booking.status]++;
      });

      // Calculate cafe analytics
      cafeBookings.forEach((booking) => {
        const revenue = booking.totalCost || 0;
        analytics.totalRevenue += revenue;
        analytics.totalBookings++;
        analytics.serviceBreakdown.cafe.revenue += revenue;
        analytics.serviceBreakdown.cafe.bookings++;
        analytics.statusBreakdown[booking.status]++;
      });

      // Calculate averages
      if (analytics.totalBookings > 0) {
        analytics.averageBookingValue =
          analytics.totalRevenue / analytics.totalBookings;
      }

      analytics.serviceBreakdown.karaoke.average =
        analytics.serviceBreakdown.karaoke.bookings > 0
          ? analytics.serviceBreakdown.karaoke.revenue /
            analytics.serviceBreakdown.karaoke.bookings
          : 0;

      analytics.serviceBreakdown.n64.average =
        analytics.serviceBreakdown.n64.bookings > 0
          ? analytics.serviceBreakdown.n64.revenue /
            analytics.serviceBreakdown.n64.bookings
          : 0;

      analytics.serviceBreakdown.cafe.average =
        analytics.serviceBreakdown.cafe.bookings > 0
          ? analytics.serviceBreakdown.cafe.revenue /
            analytics.serviceBreakdown.cafe.bookings
          : 0;

      res.json({
        success: true,
        analytics,
        period: {
          startDate: dateQuery.$gte,
          endDate: dateQuery.$lte,
        },
      });
    } catch (error) {
      console.error("Error fetching financial analytics:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch financial analytics",
      });
    }
  }

  // Get revenue breakdown by service type
  static async getRevenueBreakdown(req, res) {
    try {
      const { startDate, endDate } = req.query;

      let dateQuery = {};
      if (startDate && endDate) {
        dateQuery.$gte = startDate; // Use string comparison for YYYY-MM-DD format
        dateQuery.$lte = endDate; // Use string comparison for YYYY-MM-DD format
      } else {
        const now = new Date();
        dateQuery.$gte = startOfMonth(now);
        dateQuery.$lte = endOfMonth(now);
      }

      const breakdown = {
        karaoke: { revenue: 0, bookings: 0, percentage: 0 },
        n64: { revenue: 0, bookings: 0, percentage: 0 },
        cafe: { revenue: 0, bookings: 0, percentage: 0 },
      };

      // Get revenue for each service
      const karaokeBookings = await KaraokeBooking.find({
        date: dateQuery,
        status: { $ne: "cancelled" },
      });

      const n64Bookings = await N64Booking.find({
        date: dateQuery,
        status: { $ne: "cancelled" },
      });

      const cafeBookings = await CafeBooking.find({
        date: dateQuery,
        status: { $ne: "cancelled" },
      });

      // Calculate revenue for each service
      karaokeBookings.forEach((booking) => {
        breakdown.karaoke.revenue += booking.totalPrice || 0;
        breakdown.karaoke.bookings++;
      });

      n64Bookings.forEach((booking) => {
        breakdown.n64.revenue += booking.totalPrice || 0;
        breakdown.n64.bookings++;
      });

      cafeBookings.forEach((booking) => {
        breakdown.cafe.revenue += booking.totalCost || 0;
        breakdown.cafe.bookings++;
      });

      const totalRevenue =
        breakdown.karaoke.revenue +
        breakdown.n64.revenue +
        breakdown.cafe.revenue;

      // Calculate percentages
      if (totalRevenue > 0) {
        breakdown.karaoke.percentage =
          (breakdown.karaoke.revenue / totalRevenue) * 100;
        breakdown.n64.percentage = (breakdown.n64.revenue / totalRevenue) * 100;
        breakdown.cafe.percentage =
          (breakdown.cafe.revenue / totalRevenue) * 100;
      }

      res.json({
        success: true,
        breakdown,
        totalRevenue,
        period: {
          startDate: dateQuery.$gte,
          endDate: dateQuery.$lte,
        },
      });
    } catch (error) {
      console.error("Error fetching revenue breakdown:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch revenue breakdown",
      });
    }
  }

  // Get booking statistics by date range
  static async getBookingStatistics(req, res) {
    try {
      const { startDate, endDate, groupBy = "day" } = req.query;

      let dateQuery = {};
      if (startDate && endDate) {
        dateQuery.$gte = new Date(startDate);
        dateQuery.$lte = new Date(endDate);
      } else {
        const now = new Date();
        dateQuery.$gte = startOfMonth(now);
        dateQuery.$lte = endOfMonth(now);
      }

      const statistics = {
        totalBookings: 0,
        totalRevenue: 0,
        averageBookingValue: 0,
        bookingsByStatus: {
          pending: 0,
          confirmed: 0,
          completed: 0,
          cancelled: 0,
        },
        bookingsByService: {
          karaoke: 0,
          n64: 0,
          cafe: 0,
        },
        dailyStats: [],
      };

      // Get all bookings in date range
      const karaokeBookings = await KaraokeBooking.find({
        date: dateQuery,
      });
      const n64Bookings = await N64Booking.find({ date: dateQuery });
      const cafeBookings = await CafeBooking.find({ date: dateQuery });

      // Aggregate statistics
      karaokeBookings.forEach((booking) => {
        statistics.totalBookings++;
        statistics.totalRevenue += booking.totalPrice || 0;
        statistics.bookingsByStatus[booking.status]++;
        statistics.bookingsByService.karaoke++;
      });

      n64Bookings.forEach((booking) => {
        statistics.totalBookings++;
        statistics.totalRevenue += booking.totalPrice || 0;
        statistics.bookingsByStatus[booking.status]++;
        statistics.bookingsByService.n64++;
      });

      cafeBookings.forEach((booking) => {
        statistics.totalBookings++;
        statistics.totalRevenue += booking.totalCost || 0;
        statistics.bookingsByStatus[booking.status]++;
        statistics.bookingsByService.cafe++;
      });

      if (statistics.totalBookings > 0) {
        statistics.averageBookingValue =
          statistics.totalRevenue / statistics.totalBookings;
      }

      res.json({
        success: true,
        statistics,
        period: {
          startDate: dateQuery.$gte,
          endDate: dateQuery.$lte,
        },
      });
    } catch (error) {
      console.error("Error fetching booking statistics:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch booking statistics",
      });
    }
  }

  // Get calendar data for bookings
  static async getCalendarData(req, res) {
    try {
      const { startDate, endDate } = req.query;

      let dateQuery = {};
      if (startDate && endDate) {
        dateQuery.$gte = startDate; // Use string comparison for YYYY-MM-DD format
        dateQuery.$lte = endDate; // Use string comparison for YYYY-MM-DD format
      } else {
        const now = new Date();
        dateQuery.$gte = startOfMonth(now);
        dateQuery.$lte = endOfMonth(now);
      }

      const calendarData = [];

      // Get karaoke bookings
      const karaokeBookings = await KaraokeBooking.find({
        date: dateQuery,
      }).populate("roomId", "name");

      karaokeBookings.forEach((booking) => {
        // FIX: Calculate end time without timezone complications
        const startTime = `${booking.date}T${booking.time}`;
        const endTime = (() => {
          // Convert time to minutes for safe calculation
          const timeMatch = booking.time.match(/(\d+):(\d+)\s*(AM|PM)/i);
          if (!timeMatch) return startTime;

          let [_, hourStr, minuteStr, period] = timeMatch;
          let hour = parseInt(hourStr, 10);
          const minute = parseInt(minuteStr, 10);

          // Convert to 24-hour format
          if (period.toUpperCase() === "PM" && hour !== 12) hour += 12;
          if (period.toUpperCase() === "AM" && hour === 12) hour = 0;

          // Calculate end time
          const endHour = hour + booking.durationHours;
          const endHour24 = endHour % 24;
          const endHour12 =
            endHour24 === 0 ? 12 : endHour24 > 12 ? endHour24 - 12 : endHour24;
          const endPeriod = endHour24 >= 12 ? "PM" : "AM";

          return `${booking.date}T${endHour12}:${minute
            .toString()
            .padStart(2, "0")} ${endPeriod}`;
        })();

        calendarData.push({
          id: booking._id,
          title: `Karaoke - ${booking.customerName}`,
          start: startTime,
          end: endTime,
          extendedProps: {
            time: booking.time, // Simple time format for frontend
            durationHours: booking.durationHours, // Include duration for end time calculation
            serviceType: "karaoke",
            status: booking.status,
            paymentStatus: booking.paymentStatus, // Include payment status
            revenue: booking.totalPrice,
            roomName: booking.roomId?.name || "Karaoke Room",
            customerName: booking.customerName,
            customerEmail: booking.customerEmail,
          },
        });
      });

      // Get N64 bookings
      const n64Bookings = await N64Booking.find({
        date: dateQuery,
      }).populate("roomId", "name");

      n64Bookings.forEach((booking) => {
        // FIX: Calculate end time without timezone complications
        const startTime = `${booking.date}T${booking.time}`;
        const endTime = (() => {
          // Convert time to minutes for safe calculation
          const timeMatch = booking.time.match(/(\d+):(\d+)\s*(AM|PM)/i);
          if (!timeMatch) return startTime;

          let [_, hourStr, minuteStr, period] = timeMatch;
          let hour = parseInt(hourStr, 10);
          const minute = parseInt(minuteStr, 10);

          // Convert to 24-hour format
          if (period.toUpperCase() === "PM" && hour !== 12) hour += 12;
          if (period.toUpperCase() === "AM" && hour === 12) hour = 0;

          // Calculate end time
          const endHour = hour + booking.durationHours;
          const endHour24 = endHour % 24;
          const endHour12 =
            endHour24 === 0 ? 12 : endHour24 > 12 ? endHour24 - 12 : endHour24;
          const endPeriod = endHour24 >= 12 ? "PM" : "AM";

          return `${booking.date}T${endHour12}:${minute
            .toString()
            .padStart(2, "0")} ${endPeriod}`;
        })();

        calendarData.push({
          id: booking._id,
          title: `N64 - ${booking.customerName}`,
          start: startTime,
          end: endTime,
          extendedProps: {
            time: booking.time, // Simple time format for frontend
            durationHours: booking.durationHours, // Include duration for end time calculation
            serviceType: "n64",
            status: booking.status,
            paymentStatus: booking.paymentStatus, // Include payment status
            revenue: booking.totalPrice,
            roomName: booking.roomId?.name || booking.roomType || "N64 Room",
            customerName: booking.customerName,
            customerEmail: booking.customerEmail,
          },
        });
      });

      // Get cafe bookings
      const cafeBookings = await CafeBooking.find({ date: dateQuery });

      cafeBookings.forEach((booking) => {
        // Use simple time format for consistency
        const startTime = `${booking.date}T${booking.time}`;
        const endTime = (() => {
          // Convert time to minutes for safe calculation
          const timeMatch = booking.time.match(/(\d+):(\d+)\s*(AM|PM)/i);
          if (!timeMatch) return startTime;

          let [_, hourStr, minuteStr, period] = timeMatch;
          let hour = parseInt(hourStr, 10);
          const minute = parseInt(minuteStr, 10);

          // Convert to 24-hour format
          if (period.toUpperCase() === "PM" && hour !== 12) hour += 12;
          if (period.toUpperCase() === "AM" && hour === 12) hour = 0;

          // Calculate end time
          const endHour = hour + booking.duration;
          const endHour24 = endHour % 24;
          const endHour12 =
            endHour24 === 0 ? 12 : endHour24 > 12 ? endHour24 - 12 : endHour24;
          const endPeriod = endHour24 >= 12 ? "PM" : "AM";

          return `${booking.date}T${endHour12}:${minute
            .toString()
            .padStart(2, "0")} ${endPeriod}`;
        })();

        calendarData.push({
          id: booking._id,
          title: `Cafe - ${booking.customerName}`,
          start: startTime,
          end: endTime,
          extendedProps: {
            time: booking.time, // Simple time format for frontend
            duration: booking.duration, // Include duration for end time calculation
            serviceType: "cafe",
            status: booking.status,
            paymentStatus: booking.paymentStatus, // Include payment status
            revenue: booking.totalCost,
            roomName: `${booking.chairIds.length} Chair${
              booking.chairIds.length > 1 ? "s" : ""
            }`,
            customerName: booking.customerName,
            customerEmail: booking.customerEmail,
          },
        });
      });

      res.json({
        success: true,
        calendarData,
        period: {
          startDate: dateQuery.$gte,
          endDate: dateQuery.$lte,
        },
      });
    } catch (error) {
      console.error("Error fetching calendar data:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch calendar data",
      });
    }
  }

  // Export financial data
  static async exportFinancialData(req, res) {
    try {
      const { startDate, endDate, format = "json" } = req.query;

      let dateQuery = {};
      if (startDate && endDate) {
        dateQuery.$gte = startDate; // Use string comparison for YYYY-MM-DD format
        dateQuery.$lte = endDate; // Use string comparison for YYYY-MM-DD format
      } else {
        const now = new Date();
        dateQuery.$gte = startOfMonth(now);
        dateQuery.$lte = endOfMonth(now);
      }

      // Get all bookings
      const karaokeBookings = await KaraokeBooking.find({
        date: dateQuery,
      });
      const n64Bookings = await N64Booking.find({ date: dateQuery });
      const cafeBookings = await CafeBooking.find({ date: dateQuery });

      const exportData = {
        period: {
          startDate: dateQuery.$gte,
          endDate: dateQuery.$lte,
        },
        summary: {
          totalBookings:
            karaokeBookings.length + n64Bookings.length + cafeBookings.length,
          totalRevenue: 0,
          karaokeBookings: karaokeBookings.length,
          n64Bookings: n64Bookings.length,
          cafeBookings: cafeBookings.length,
        },
        bookings: [],
      };

      // Process karaoke bookings
      karaokeBookings.forEach((booking) => {
        exportData.summary.totalRevenue += booking.totalPrice || 0;
        exportData.bookings.push({
          serviceType: "karaoke",
          bookingId: booking._id,
          customerName: booking.customerName,
          customerEmail: booking.customerEmail,
          customerPhone: booking.customerPhone,
          bookingDate: booking.date,
          duration: booking.durationHours,
          totalPrice: booking.totalPrice,
          status: booking.status,
          paymentStatus: booking.paymentStatus,
          paymentId: booking.paymentId,
        });
      });

      // Process N64 bookings
      n64Bookings.forEach((booking) => {
        exportData.summary.totalRevenue += booking.totalPrice || 0;
        exportData.bookings.push({
          serviceType: "n64",
          bookingId: booking._id,
          customerName: booking.customerName,
          customerEmail: booking.customerEmail,
          customerPhone: booking.customerPhone,
          bookingDate: booking.date,
          duration: booking.durationHours,
          totalPrice: booking.totalPrice,
          status: booking.status,
          paymentStatus: booking.paymentStatus,
          paymentId: booking.paymentId,
        });
      });

      // Process cafe bookings
      cafeBookings.forEach((booking) => {
        exportData.summary.totalRevenue += booking.totalCost || 0;
        exportData.bookings.push({
          serviceType: "cafe",
          bookingId: booking._id,
          customerName: booking.customerName,
          customerEmail: booking.customerEmail,
          customerPhone: booking.customerPhone,
          // TIMEZONE FIX: Create date in client's local timezone instead of server timezone
          bookingDate: new Date(booking.date + "T" + booking.time + ":00"),
          duration: booking.duration,
          totalPrice: booking.totalCost,
          status: booking.status,
          paymentStatus: booking.paymentStatus,
          paymentId: booking.paymentId,
          chairIds: booking.chairIds,
        });
      });

      if (format === "csv") {
        // Convert to CSV format
        const csvHeaders =
          "Service Type,Booking ID,Customer Name,Customer Email,Customer Phone,Booking Date,Duration,Total Price,Status,Payment Status,Payment ID\n";
        const csvRows = exportData.bookings
          .map(
            (booking) =>
              `${booking.serviceType},${booking.bookingId},${booking.customerName},${booking.customerEmail},${booking.customerPhone},${booking.bookingDate},${booking.duration},${booking.totalPrice},${booking.status},${booking.paymentStatus},${booking.paymentId}`
          )
          .join("\n");

        res.setHeader("Content-Type", "text/csv");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="financial-report-${
            new Date().toISOString().split("T")[0]
          }.csv"`
        );
        res.send(csvHeaders + csvRows);
      } else {
        res.json({
          success: true,
          data: exportData,
        });
      }
    } catch (error) {
      console.error("Error exporting financial data:", error);
      res.status(500).json({
        success: false,
        message: "Failed to export financial data",
      });
    }
  }
}

export default FinanceController;
