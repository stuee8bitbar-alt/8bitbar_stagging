import React, { useState, useEffect, useMemo } from "react";
import api from "../../../utils/axios";

const KaraokeBookingsAdmin = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    fetchBookings();
  }, [filter]); // Refetch when the status filter changes

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await api.get(
        `/admin/karaoke/karaoke-bookings?status=${filter}`
      );
      setBookings(response.data.bookings || []);
    } catch (error) {
      console.error("Error fetching karaoke bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      await api.patch(`/admin/karaoke/karaoke-bookings/${bookingId}/status`, {
        status: newStatus,
      });
      fetchBookings(); // Refresh the list
    } catch (error) {
      console.error("Error updating booking status:", error);
      alert("Failed to update booking status");
    }
  };

  const updatePaymentStatus = async (bookingId, newPaymentStatus) => {
    try {
      await api.patch(
        `/admin/karaoke/karaoke-bookings/${bookingId}/payment-status`,
        {
          paymentStatus: newPaymentStatus,
        }
      );
      fetchBookings(); // Refresh the list
    } catch (error) {
      console.error("Error updating payment status:", error);
      alert("Failed to update payment status");
    }
  };

  const deleteBooking = async (bookingId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this booking? This action cannot be undone."
      )
    ) {
      try {
        await api.delete(`/admin/karaoke/karaoke-bookings/${bookingId}`);
        fetchBookings(); // Refresh the list
        alert("Booking deleted successfully");
      } catch (error) {
        console.error("Error deleting booking:", error);
        alert("Failed to delete booking");
      }
    }
  };

  // Helper function to format dates
  const formatDate = (dateString) => {
    // Display exact date without timezone conversion
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "UTC",
    });
  };

  const formatTime = (dateString) => {
    // Display exact time without timezone conversion
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "UTC",
    });
  };

  // Helper function to format time range
  const formatTimeRange = (date, time, durationHours) => {
    try {
      // Parse the time string (e.g., "2:00 PM" or "14:00")
      let hours, minutes;

      if (time.includes("PM") || time.includes("AM")) {
        // Handle 12-hour format (e.g., "2:00 PM")
        const timeMatch = time.match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (timeMatch) {
          hours = parseInt(timeMatch[1]);
          minutes = parseInt(timeMatch[2]);
          const period = timeMatch[3].toUpperCase();

          if (period === "PM" && hours !== 12) {
            hours += 12;
          } else if (period === "AM" && hours === 12) {
            hours = 0;
          }
        }
      } else {
        // Handle 24-hour format (e.g., "14:00")
        const timeMatch = time.match(/(\d+):(\d+)/);
        if (timeMatch) {
          hours = parseInt(timeMatch[1]);
          minutes = parseInt(timeMatch[2]);
        }
      }

      if (hours === undefined || minutes === undefined) {
        return `${time} - ${time}`; // Fallback if parsing fails
      }

      // Create start time
      const start = new Date(date);
      start.setHours(hours, minutes, 0, 0);

      // Create end time
      const end = new Date(start.getTime() + durationHours * 60 * 60 * 1000);

      // Format times
      const startTime = start.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });

      const endTime = end.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });

      return `${startTime} - ${endTime}`;
    } catch (error) {
      console.error("Error formatting time range:", error);
      return `${time} - ${time}`; // Fallback
    }
  };

  // Helper function to get status badge colors and display text
  const getStatusInfo = (status) => {
    switch (status) {
      case "confirmed":
        return { color: "bg-green-100 text-green-800", text: "Confirmed" };
      case "pending":
        return { color: "bg-yellow-100 text-yellow-800", text: "Pending" };
      case "cancelled":
        return { color: "bg-red-100 text-red-800", text: "Cancelled" };
      case "completed":
        return { color: "bg-blue-100 text-blue-800", text: "Completed" };
      default:
        return { color: "bg-gray-100 text-gray-800", text: status };
    }
  };

  // Memoize the filtered and sorted bookings to avoid re-calculating
  const processedBookings = React.useMemo(() => {
    return bookings
      .filter((booking) => {
        if (!dateFilter) return true;
        // FIX: Simple date string comparison - no timezone conversion needed
        return booking.date === dateFilter;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "oldest":
            return new Date(a.date) - new Date(b.date);
          case "durationHigh":
            return b.durationHours - a.durationHours;
          case "durationLow":
            return a.durationHours - b.durationHours;
          case "newest":
          default:
            return new Date(b.date) - new Date(a.date);
        }
      });
  }, [bookings, dateFilter, sortBy]);

  // Sort bookings by date and time
  const sortedBookings = useMemo(() => {
    if (!bookings) return [];

    return [...bookings].sort((a, b) => {
      // FIX: Sort by date first, then by time
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);

      if (dateA.getTime() !== dateB.getTime()) {
        return dateA - dateB;
      }

      // If same date, sort by time
      const timeA = a.time;
      const timeB = b.time;
      return timeA.localeCompare(timeB);
    });
  }, [bookings]);

  // A reusable component for action buttons
  const ActionButtons = ({ booking }) => (
    <div className="flex items-center gap-2 lg:gap-4 mt-4 lg:mt-0">
      {/* Payment Status Update Buttons */}
      {booking.paymentStatus === "pending" && (
        <button
          onClick={() => updatePaymentStatus(booking._id, "completed")}
          className="text-xs lg:text-sm font-medium text-green-600 hover:text-green-800 px-2 py-1 rounded border border-green-600 hover:bg-green-50"
          title="Mark as Paid"
        >
          Mark Paid
        </button>
      )}
      {booking.paymentStatus === "completed" && (
        <button
          onClick={() => updatePaymentStatus(booking._id, "pending")}
          className="text-xs lg:text-sm font-medium text-yellow-600 hover:text-yellow-800 px-2 py-1 rounded border border-yellow-600 hover:bg-yellow-50"
          title="Mark as Not Paid"
        >
          Mark Unpaid
        </button>
      )}

      {/* Booking Status Update Buttons */}
      {booking.status === "pending" && (
        <>
          <button
            onClick={() => updateBookingStatus(booking._id, "confirmed")}
            className="text-xs lg:text-sm font-medium text-green-600 hover:text-green-800 px-2 py-1 rounded"
          >
            Confirm
          </button>
          <button
            onClick={() => updateBookingStatus(booking._id, "cancelled")}
            className="text-xs lg:text-sm font-medium text-red-600 hover:text-red-800 px-2 py-1 rounded"
          >
            Cancel
          </button>
        </>
      )}
      {booking.status === "confirmed" && (
        <>
          <button
            onClick={() => updateBookingStatus(booking._id, "completed")}
            className="text-xs lg:text-sm font-medium text-blue-600 hover:text-blue-800 px-2 py-1 rounded"
          >
            Complete
          </button>
          <button
            onClick={() => updateBookingStatus(booking._id, "cancelled")}
            className="text-xs lg:text-sm font-medium text-red-600 hover:text-red-800 px-2 py-1 rounded"
          >
            Cancel
          </button>
        </>
      )}
      {booking.status === "completed" && (
        <>
          <button
            onClick={() => updateBookingStatus(booking._id, "completed")}
            disabled
            className="text-xs lg:text-sm font-medium text-gray-400 px-2 py-1 rounded cursor-not-allowed"
            title="Booking already completed"
          >
            Complete
          </button>
          <button
            onClick={() => updateBookingStatus(booking._id, "cancelled")}
            disabled
            className="text-xs lg:text-sm font-medium text-gray-400 px-2 py-1 rounded cursor-not-allowed"
            title="Cannot cancel completed bookings"
          >
            Cancel
          </button>
        </>
      )}
      <button
        onClick={() => deleteBooking(booking._id)}
        className="text-xs lg:text-sm font-medium text-red-600 hover:text-red-800 px-2 py-1 rounded border border-red-600 hover:bg-red-50"
      >
        Delete
      </button>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-24 w-24 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-2 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-6 gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Karaoke Bookings
          </h1>
          <div className="flex flex-col sm:flex-row gap-2 flex-wrap">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            >
              <option value="newest">Sort: Newest</option>
              <option value="oldest">Sort: Oldest</option>
              <option value="durationHigh">Duration (High-Low)</option>
              <option value="durationLow">Duration (Low-High)</option>
            </select>
          </div>
        </div>

        {/* Desktop Table View (Large screens) */}
        <div className="hidden xl:block bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer Info
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Booking Details
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Cost
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {processedBookings.map((booking) => (
                  <tr key={booking._id}>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {booking.customerName || "N/A"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {booking.customerEmail || "N/A"}
                      </div>
                      {booking.customerPhone && (
                        <div className="text-sm text-gray-500">
                          {booking.customerPhone}
                        </div>
                      )}
                      {booking.isManualBooking && booking.staffName && (
                        <div className="text-xs text-blue-600 mt-1">
                          Staff: {booking.staffName}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        Room: {booking.roomId?.name || "Karaoke Room"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDate(booking.date)} (
                        {formatTimeRange(
                          booking.date,
                          booking.time,
                          booking.durationHours
                        )}
                        )
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        Payment:{" "}
                        {booking.paymentId ? (
                          <span className="text-green-600 font-mono text-xs">
                            {booking.paymentId}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">
                            No payment ID
                          </span>
                        )}{" "}
                        <span
                          className={`inline-flex px-1 py-0.5 text-xs font-semibold rounded ${
                            booking.paymentStatus === "completed"
                              ? "bg-green-100 text-green-800"
                              : booking.paymentStatus === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : booking.paymentStatus === "failed"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {booking.paymentStatus || "pending"}
                        </span>
                      </div>

                      {/* Comments Display */}
                      {booking.comments && (
                        <div className="text-sm text-gray-600 mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
                          <div className="font-medium text-blue-800 mb-1">
                            💬 Special Requests:
                          </div>
                          <div className="text-blue-700">
                            {booking.comments}
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-green-600">
                        $
                        {booking.totalPrice
                          ? booking.totalPrice.toFixed(2)
                          : "0.00"}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          booking.status === "confirmed"
                            ? "bg-green-100 text-green-800"
                            : booking.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : booking.status === "cancelled"
                            ? "bg-red-100 text-red-800"
                            : booking.status === "completed"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {booking.status === "confirmed"
                          ? "Confirmed"
                          : booking.status === "pending"
                          ? "Pending"
                          : booking.status === "cancelled"
                          ? "Cancelled"
                          : booking.status === "completed"
                          ? "Completed"
                          : booking.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <ActionButtons booking={booking} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tablet Compact Table View (iPad screens) */}
        <div className="hidden lg:block xl:hidden bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Booking Info
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {processedBookings.map((booking) => (
                  <tr key={booking._id}>
                    <td className="px-3 py-3">
                      <div className="text-sm font-medium text-gray-900">
                        {booking.customerName || "N/A"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {booking.customerEmail || "N/A"}
                      </div>
                      {booking.customerPhone && (
                        <div className="text-xs text-gray-500">
                          {booking.customerPhone}
                        </div>
                      )}
                      {booking.isManualBooking && booking.staffName && (
                        <div className="text-xs text-blue-600 mt-1">
                          Staff: {booking.staffName}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <div className="text-sm text-gray-900">
                        {booking.roomId?.name || "Karaoke Room"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDate(booking.date)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatTimeRange(
                          booking.date,
                          booking.time,
                          booking.durationHours
                        )}
                      </div>
                      <div className="text-sm font-medium text-green-600">
                        $
                        {booking.totalPrice
                          ? booking.totalPrice.toFixed(2)
                          : "0.00"}
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="text-xs text-gray-500">
                        {booking.paymentId ? (
                          <span className="text-green-600 font-mono break-all">
                            {booking.paymentId.substring(0, 12)}...
                          </span>
                        ) : (
                          <span className="text-gray-400">No payment ID</span>
                        )}
                      </div>
                      <span
                        className={`inline-flex px-1 py-0.5 text-xs font-semibold rounded ${
                          booking.paymentStatus === "completed"
                            ? "bg-green-100 text-green-800"
                            : booking.paymentStatus === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : booking.paymentStatus === "failed"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {booking.paymentStatus || "pending"}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      {(() => {
                        const statusInfo = getStatusInfo(booking.status);
                        return (
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusInfo.color}`}
                          >
                            {statusInfo.text}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-3 py-3">
                      <ActionButtons booking={booking} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden space-y-4">
          {processedBookings.map((booking) => (
            <div
              key={booking._id}
              className="bg-white shadow-md rounded-lg p-4"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="font-bold text-gray-800 mb-1">
                    {booking.customerName || "N/A"}
                  </div>
                  <div className="text-sm text-gray-500 mb-1">
                    📧 {booking.customerEmail || "N/A"}
                  </div>
                  {booking.customerPhone && (
                    <div className="text-sm text-gray-500">
                      📞 {booking.customerPhone}
                    </div>
                  )}

                  {/* Comments Display */}
                  {booking.comments && (
                    <div className="text-sm text-gray-600 mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
                      <div className="font-medium text-blue-800 mb-1">
                        💬 Special Requests:
                      </div>
                      <div className="text-blue-700">{booking.comments}</div>
                    </div>
                  )}
                </div>
                <span
                  className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${
                    booking.status === "confirmed"
                      ? "bg-green-100 text-green-800"
                      : booking.status === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : booking.status === "cancelled"
                      ? "bg-red-100 text-red-800"
                      : booking.status === "completed"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {booking.status === "confirmed"
                    ? "Confirmed"
                    : booking.status === "pending"
                    ? "Pending"
                    : booking.status === "cancelled"
                    ? "Cancelled"
                    : booking.status === "completed"
                    ? "Completed"
                    : booking.status}
                </span>
              </div>
              <div className="mt-4 border-t border-gray-200 pt-4">
                <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <dt className="text-sm font-medium text-gray-500">Room</dt>
                  <dd className="text-sm text-gray-900">
                    {booking.roomId?.name || "Karaoke Room"}
                  </dd>

                  <dt className="text-sm font-medium text-gray-500">Date</dt>
                  <dd className="text-sm text-gray-900">
                    {formatDate(booking.date)}
                  </dd>

                  <dt className="text-sm font-medium text-gray-500">
                    Time Range
                  </dt>
                  <dd className="text-sm text-gray-900">
                    {formatTimeRange(
                      booking.date,
                      booking.time,
                      booking.durationHours
                    )}
                  </dd>

                  <dt className="text-sm font-medium text-gray-500">
                    Payment ID
                  </dt>
                  <dd className="text-sm text-gray-900 break-all">
                    {booking.paymentId ? (
                      <span className="text-green-600 font-mono text-xs break-words">
                        {booking.paymentId}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs">
                        No payment ID
                      </span>
                    )}
                  </dd>

                  <dt className="text-sm font-medium text-gray-500">
                    Payment Status
                  </dt>
                  <dd className="text-sm text-gray-900">
                    <span
                      className={`inline-flex px-1 py-0.5 text-xs font-semibold rounded ${
                        booking.paymentStatus === "completed"
                          ? "bg-green-100 text-green-800"
                          : booking.paymentStatus === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : booking.paymentStatus === "failed"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {booking.paymentStatus || "pending"}
                    </span>
                  </dd>

                  <dt className="text-sm font-medium text-gray-500">
                    Total Cost
                  </dt>
                  <dd className="text-sm font-medium text-green-600">
                    $
                    {booking.totalPrice
                      ? booking.totalPrice.toFixed(2)
                      : "0.00"}
                  </dd>
                </dl>
              </div>
              <div className="mt-4 border-t border-gray-200 pt-4">
                <ActionButtons booking={booking} />
              </div>
            </div>
          ))}
        </div>

        {processedBookings.length === 0 && (
          <div className="text-center py-12 text-gray-500 bg-white shadow-md rounded-lg">
            No bookings found for the selected filters.
          </div>
        )}

        {/* Summary Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-blue-600">
              {bookings.filter((b) => b.status === "pending").length}
            </div>
            <div className="text-sm text-gray-600">Pending Bookings</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-green-600">
              {bookings.filter((b) => b.status === "confirmed").length}
            </div>
            <div className="text-sm text-gray-600">Confirmed Bookings</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-gray-600">
              {bookings.filter((b) => b.status === "completed").length}
            </div>
            <div className="text-sm text-gray-600">Completed Bookings</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-green-600">
              $
              {bookings
                .filter((b) => b.status !== "cancelled")
                .reduce((sum, b) => sum + b.totalPrice, 0)
                .toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">Total Revenue</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KaraokeBookingsAdmin;
