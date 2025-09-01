import React, { useState, useEffect } from "react";
import api from "../../utils/axios";
import FinanceCalendar from "../../components/admin/FinanceCalendar";
import BookingDetailsModal from "../../components/admin/BookingDetailsModal";
import {
  MdCalendarToday,
  MdBarChart,
  MdDownload,
  MdFilterList,
  MdSearch,
  MdMusicNote,
  MdVideogameAsset,
  MdLocalCafe,
  MdAttachMoney,
  MdTrendingUp,
  MdPeople,
  MdSchedule,
} from "react-icons/md";

const FinancePage = () => {
  const [activeTab, setActiveTab] = useState("bookings");
  const [bookings, setBookings] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [calendarData, setCalendarData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    serviceType: "all",
    status: "all",
    startDate: "",
    endDate: "",
  });
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });

  // Modal state
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, [filters, dateRange.startDate, dateRange.endDate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch consolidated bookings
      const bookingsResponse = await api.get("/admin/finance/bookings", {
        params: {
          ...filters,
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
        },
      });

      // Fetch analytics
      const analyticsResponse = await api.get("/admin/finance/analytics", {
        params: {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
        },
      });

      // Fetch calendar data
      const calendarResponse = await api.get("/admin/finance/calendar", {
        params: {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
        },
      });

      setBookings(bookingsResponse.data.bookings || []);
      setAnalytics(analyticsResponse.data.analytics);
      setCalendarData(calendarResponse.data.calendarData || []);
    } catch (error) {
      console.error("Error fetching finance data:", error);
      console.error("Error details:", error.response?.data || error.message);
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

  const exportData = async (format = "json") => {
    try {
      const response = await api.get("/admin/finance/export", {
        params: {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          format,
        },
        responseType: format === "csv" ? "blob" : "json",
      });

      if (format === "csv") {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          `financial-report-${new Date().toISOString().split("T")[0]}.csv`
        );
        document.body.appendChild(link);
        link.click();
        link.remove();
      } else {
        const dataStr = JSON.stringify(response.data.data, null, 2);
        const dataBlob = new Blob([dataStr], { type: "application/json" });
        const url = window.URL.createObjectURL(dataBlob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          `financial-report-${new Date().toISOString().split("T")[0]}.json`
        );
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
    } catch (error) {
      console.error("Error exporting data:", error);
    }
  };

  const getServiceIcon = (serviceType) => {
    switch (serviceType) {
      case "karaoke":
        return <MdMusicNote className="text-purple-500" />;
      case "n64":
        return <MdVideogameAsset className="text-blue-500" />;
      case "cafe":
        return <MdLocalCafe className="text-green-500" />;
      default:
        return <MdSchedule className="text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-24 w-24 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Finance Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Consolidated booking management and financial analytics
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => exportData("json")}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <MdDownload size={16} />
              Export JSON
            </button>
            <button
              onClick={() => exportData("csv")}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <MdDownload size={16} />
              Export CSV
            </button>
          </div>
        </div>

        {/* Date Range Filter */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => {
                  handleDateRangeChange("startDate", e.target.value);
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => {
                  handleDateRangeChange("endDate", e.target.value);
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            Current date range: {dateRange.startDate} to {dateRange.endDate}
          </div>
        </div>

        {/* Analytics Summary */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(analytics.totalRevenue)}
                  </p>
                </div>
                <MdAttachMoney className="text-green-500 text-3xl" />
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Bookings</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {analytics.totalBookings}
                  </p>
                </div>
                <MdPeople className="text-blue-500 text-3xl" />
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Average Booking</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {formatCurrency(analytics.averageBookingValue)}
                  </p>
                </div>
                <MdTrendingUp className="text-purple-500 text-3xl" />
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-indigo-600">
                    {analytics.statusBreakdown.completed}
                  </p>
                </div>
                <MdBarChart className="text-indigo-500 text-3xl" />
              </div>
            </div>
          </div>
        )}

        {/* Service Breakdown */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Karaoke
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Revenue:</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(analytics.serviceBreakdown.karaoke.revenue)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Bookings:</span>
                  <span className="font-semibold text-gray-900">
                    {analytics.serviceBreakdown.karaoke.bookings}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Average:</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(analytics.serviceBreakdown.karaoke.average)}
                  </span>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">N64</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Revenue:</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(analytics.serviceBreakdown.n64.revenue)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Bookings:</span>
                  <span className="font-semibold text-gray-900">
                    {analytics.serviceBreakdown.n64.bookings}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Average:</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(analytics.serviceBreakdown.n64.average)}
                  </span>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Cafe</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Revenue:</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(analytics.serviceBreakdown.cafe.revenue)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Bookings:</span>
                  <span className="font-semibold text-gray-900">
                    {analytics.serviceBreakdown.cafe.bookings}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Average:</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(analytics.serviceBreakdown.cafe.average)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab("bookings")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "bookings"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                All Bookings
              </button>
              <button
                onClick={() => setActiveTab("calendar")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "calendar"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Calendar View
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Service Type
                </label>
                <select
                  value={filters.serviceType}
                  onChange={(e) =>
                    handleFilterChange("serviceType", e.target.value)
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">All Services</option>
                  <option value="karaoke">Karaoke</option>
                  <option value="n64">N64</option>
                  <option value="cafe">Cafe</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Content based on active tab */}
            {activeTab === "bookings" && (
              <>
                {/* Desktop Table View */}
                <div className="hidden xl:block overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Service
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Booking Details
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Revenue
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {bookings.map((booking) => (
                        <tr key={booking._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {getServiceIcon(booking.serviceType)}
                              <span className="ml-2 text-sm font-medium text-gray-900 capitalize">
                                {booking.serviceType}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {booking.customerName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {booking.customerEmail}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {formatDate(booking.bookingDate)}
                            </div>
                            <div className="text-sm text-gray-500">
                              {booking.time || "N/A"}
                            </div>
                            <div className="text-sm text-gray-500">
                              {booking.roomName}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                            {formatCurrency(
                              booking.totalPrice || booking.totalCost
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                                booking.status
                              )}`}
                            >
                              {booking.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Tablet Compact Table View */}
                <div className="hidden lg:block xl:hidden overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Service
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Details
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Revenue
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {bookings.map((booking) => (
                        <tr key={booking._id} className="hover:bg-gray-50">
                          <td className="px-3 py-3">
                            <div className="flex items-center">
                              {getServiceIcon(booking.serviceType)}
                              <span className="ml-2 text-xs font-medium text-gray-900 capitalize">
                                {booking.serviceType}
                              </span>
                            </div>
                          </td>
                          <td className="px-3 py-3">
                            <div className="text-sm font-medium text-gray-900">
                              {booking.customerName}
                            </div>
                            <div className="text-xs text-gray-500">
                              {booking.customerEmail}
                            </div>
                          </td>
                          <td className="px-3 py-3">
                            <div className="text-sm text-gray-900">
                              {formatDate(booking.bookingDate)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {booking.time || "N/A"}
                            </div>
                            <div className="text-xs text-gray-500">
                              {booking.roomName}
                            </div>
                          </td>
                          <td className="px-3 py-3 text-sm font-medium text-green-600">
                            {formatCurrency(
                              booking.totalPrice || booking.totalCost
                            )}
                          </td>
                          <td className="px-3 py-3">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                                booking.status
                              )}`}
                            >
                              {booking.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="lg:hidden space-y-4">
                  {bookings.map((booking) => (
                    <div
                      key={booking._id}
                      className="bg-white shadow-md rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center">
                          {getServiceIcon(booking.serviceType)}
                          <span className="ml-2 text-sm font-medium text-gray-900 capitalize">
                            {booking.serviceType}
                          </span>
                        </div>
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                            booking.status
                          )}`}
                        >
                          {booking.status}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <span className="text-sm font-medium text-gray-700">
                            Customer:
                          </span>
                          <p className="text-sm text-gray-900">
                            {booking.customerName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {booking.customerEmail}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-700">
                            Booking:
                          </span>
                          <p className="text-sm text-gray-900">
                            {formatDate(booking.bookingDate)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {booking.time || "N/A"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {booking.roomName}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-700">
                            Revenue:
                          </span>
                          <p className="text-sm font-semibold text-green-600">
                            {formatCurrency(
                              booking.totalPrice || booking.totalCost
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {activeTab === "calendar" && (
              <FinanceCalendar
                events={calendarData}
                onEventClick={(event) => {
                  // Extract booking data from calendar event
                  const bookingData = {
                    id: event.id,
                    serviceType: event.extendedProps.serviceType,
                    status: event.extendedProps.status,
                    paymentStatus: event.extendedProps.paymentStatus,
                    revenue: event.extendedProps.revenue,
                    roomName: event.extendedProps.roomName,
                    customerName: event.extendedProps.customerName,
                    customerEmail: event.extendedProps.customerEmail,
                    time: event.extendedProps.time, // Include the time field
                    durationHours: event.extendedProps.durationHours, // Include duration for karaoke/N64
                    duration: event.extendedProps.duration, // Include duration for cafe
                    start: event.start,
                    end: event.end,
                    title: event.title,
                  };

                  console.log("Modal receiving data:", bookingData);
                  setSelectedBooking(bookingData);
                  setIsModalOpen(true);
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Booking Details Modal */}
      <BookingDetailsModal
        booking={selectedBooking}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedBooking(null);
        }}
      />
    </div>
  );
};

export default FinancePage;
