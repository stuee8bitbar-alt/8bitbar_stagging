import React, { useState, useEffect } from "react";
import api from "../../../utils/axios";
import {
  MdSearch,
  MdFilterList,
  MdMusicNote,
  MdVideogameAsset,
  MdLocalCafe,
  MdSchedule,
  MdEvent,
  MdPerson,
  MdPhone,
  MdEmail,
} from "react-icons/md";

const AllBookingsList = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    serviceType: "all",
    status: "all",
    startDate: "",
    endDate: "",
  });
  const [dateRange, setDateRange] = useState(() => {
    const now = new Date();
    const currentDate = now.toISOString().split("T")[0];
    return {
      startDate: currentDate,
      endDate: currentDate,
    };
  });

  useEffect(() => {
    fetchBookings();
  }, [filters, dateRange.startDate, dateRange.endDate]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await api.get("/admin/all-bookings", {
        params: {
          ...filters,
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
        },
      });
      setBookings(response.data.bookings || []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleDateRangeChange = (key, value) => {
    setDateRange((prev) => ({ ...prev, [key]: value }));
  };

  const getServiceIcon = (serviceType) => {
    if (!serviceType || typeof serviceType !== "string") {
      return <MdEvent className="text-gray-500" />;
    }

    switch (serviceType) {
      case "karaoke":
        return <MdMusicNote className="text-purple-500" />;
      case "n64":
        return <MdVideogameAsset className="text-blue-500" />;
      case "cafe":
        return <MdLocalCafe className="text-green-500" />;
      default:
        return <MdEvent className="text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    if (!status || typeof status !== "string") {
      status = "pending";
    }

    const statusConfig = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      completed: "bg-blue-100 text-blue-800",
    };

    // Map status to display text
    const getStatusText = (status) => {
      switch (status) {
        case "pending":
          return "Not Paid";
        case "confirmed":
          return "Paid";
        case "cancelled":
          return "Cancelled";
        case "completed":
          return "Completed";
        default:
          return status.charAt(0).toUpperCase() + status.slice(1);
      }
    };

    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${
          statusConfig[status] || statusConfig.pending
        }`}
      >
        {getStatusText(status)}
      </span>
    );
  };

  const formatDateTime = (dateTime) => {
    try {
      // Display exact time without timezone conversion
      const date = new Date(dateTime);
      return date.toLocaleString("en-US", {
        timeZone: "UTC",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  const formatDate = (dateString) => {
    try {
      // Display exact date without timezone conversion
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  const formatTime = (timeString) => {
    try {
      if (!timeString) return "Invalid Time";

      // Handle AM/PM format (e.g., "3:00 PM")
      if (timeString.includes("AM") || timeString.includes("PM")) {
        const match = timeString.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
        if (match) {
          const [_, hourStr, minuteStr, period] = match;
          let hour = parseInt(hourStr, 10);
          const minute = parseInt(minuteStr, 10);

          // Convert to 24-hour format
          if (period.toUpperCase() === "PM" && hour !== 12) hour += 12;
          if (period.toUpperCase() === "AM" && hour === 12) hour = 0;

          const date = new Date();
          date.setHours(hour, minute, 0, 0);
          return date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          });
        }
      }

      // Handle 24-hour format (e.g., "15:00")
      const [hour, minute] = timeString.split(":");
      const date = new Date();
      date.setHours(parseInt(hour), parseInt(minute), 0, 0);
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch (error) {
      return "Invalid Time";
    }
  };

  // Helper function to safely render values
  const safeRender = (value) => {
    if (value === null || value === undefined) return "";
    if (typeof value === "object") {
      // Handle roomId objects specifically
      if (value._id && value.name) {
        return value.name;
      }
      return value.name || value.id || JSON.stringify(value);
    }
    return String(value);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900">
          All Bookings
        </h2>
        <div className="mt-2 md:mt-0 flex items-center space-x-2">
          <span className="text-sm text-gray-600">
            Total: {bookings.length} bookings
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-3 md:p-4 rounded-lg shadow-sm border">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {/* Service Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Service Type
            </label>
            <select
              value={filters.serviceType}
              onChange={(e) =>
                handleFilterChange("serviceType", e.target.value)
              }
              className="w-full px-2 md:px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-gray-900"
            >
              <option value="all">All Services</option>
              <option value="karaoke">Karaoke</option>
              <option value="n64">N64</option>
              <option value="cafe">Cafe</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="w-full px-2 md:px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-gray-900"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Not Paid</option>
              <option value="confirmed">Paid</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) =>
                handleDateRangeChange("startDate", e.target.value)
              }
              className="w-full px-2 md:px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-gray-900"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => handleDateRangeChange("endDate", e.target.value)}
              className="w-full px-2 md:px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-gray-900"
            />
          </div>
        </div>
      </div>

      {/* Bookings List */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {!Array.isArray(bookings) || bookings.length === 0 ? (
          <div className="text-center py-12">
            <MdEvent className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {!Array.isArray(bookings)
                ? "Invalid data received"
                : "No bookings found"}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {!Array.isArray(bookings)
                ? "Please refresh the page"
                : "Try adjusting your filters or date range."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                    Customer
                  </th>
                  <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Booking Details
                  </th>
                  <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bookings.map((booking) => {
                  // Skip invalid booking objects
                  if (!booking || typeof booking !== "object") {
                    return null;
                  }

                  return (
                    <tr
                      key={booking._id || Math.random()}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getServiceIcon(booking.serviceType)}
                          <span className="ml-2 text-sm font-medium text-gray-900 capitalize">
                            {safeRender(booking.serviceType)}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 md:px-6 py-3 md:py-4 w-48">
                        <div className="text-sm text-gray-900">
                          <div
                            className="font-medium truncate"
                            title={safeRender(booking.customerName)}
                          >
                            {safeRender(booking.customerName)}
                          </div>
                          <div
                            className="text-gray-500 truncate"
                            title={safeRender(booking.customerEmail)}
                          >
                            {safeRender(booking.customerEmail)}
                          </div>
                          {booking.customerPhone && (
                            <div
                              className="text-gray-500 truncate"
                              title={safeRender(booking.customerPhone)}
                            >
                              {safeRender(booking.customerPhone)}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-3 md:px-6 py-3 md:py-4">
                        <div className="text-sm text-gray-900 space-y-1">
                          {/* Date & Time */}
                          <div className="font-medium">
                            {booking.serviceType === "cafe" ? (
                              <div>
                                <div>{formatDate(booking.date)}</div>
                                <div className="text-gray-600">
                                  {formatTime(booking.time)}
                                </div>
                              </div>
                            ) : (
                              <div>
                                <div>{formatDate(booking.date)}</div>
                                <div className="text-gray-600">
                                  {formatTime(booking.time)}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Duration */}
                          <div className="text-gray-600">
                            Duration:{" "}
                            {safeRender(
                              booking.durationHours || booking.duration
                            )}{" "}
                            hour(s)
                          </div>
                        </div>
                      </td>
                      <td className="px-3 md:px-6 py-3 md:py-4">
                        <div className="text-sm text-gray-900 space-y-1">
                          {/* Service-specific Details */}
                          {booking.serviceType === "cafe" && (
                            <div className="text-gray-600">
                              <div className="flex flex-wrap gap-1 mb-1">
                                {booking.chairIds?.map((chairId, index) => (
                                  <span
                                    key={index}
                                    className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                                  >
                                    {typeof chairId === "string" &&
                                    chairId.length < 10
                                      ? chairId
                                      : `Chair ${index + 1}`}
                                  </span>
                                ))}
                              </div>
                              <div className="text-xs">
                                {booking.chairIds?.length || 0} chair(s)
                              </div>
                            </div>
                          )}

                          {booking.serviceType === "karaoke" &&
                            booking.roomId && (
                              <div className="text-gray-600">
                                Room:{" "}
                                {safeRender(
                                  booking.roomId?.name || "Unknown Room"
                                )}
                              </div>
                            )}

                          {booking.serviceType === "n64" && booking.roomId && (
                            <div className="text-gray-600">
                              Booth:{" "}
                              {safeRender(
                                booking.roomId?.name || "Unknown Booth"
                              )}
                            </div>
                          )}

                          {/* People Count */}
                          {booking.numberOfPeople && (
                            <div className="text-gray-600">
                              People: {safeRender(booking.numberOfPeople)}
                            </div>
                          )}

                          {/* Comments */}
                          {booking.comments && (
                            <div className="text-xs text-blue-600 bg-blue-50 border border-blue-200 rounded p-1 mt-1">
                              <div className="font-medium text-blue-800">
                                💬 Notes:
                              </div>
                              <div className="text-blue-700">
                                {booking.comments}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          {/* Show payment status based on paymentStatus field */}
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              booking.paymentStatus === "completed"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {booking.paymentStatus === "completed"
                              ? "Paid"
                              : "Not Paid"}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllBookingsList;
