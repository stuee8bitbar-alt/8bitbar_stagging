import React, { useState, useEffect } from "react";
import api from "../../../utils/axios";
import FinanceCalendar from "../../../components/admin/FinanceCalendar";
import BookingDetailsModal from "../../../components/admin/BookingDetailsModal";

const CalendarView = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal state
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchCalendarData();
  }, [currentDate]);

  const fetchCalendarData = async () => {
    setLoading(true);
    try {
      const startDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
      );
      const endDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0
      );

      const response = await api.get("/admin/all-bookings/calendar", {
        params: {
          startDate: startDate.toISOString().split("T")[0],
          endDate: endDate.toISOString().split("T")[0],
        },
      });
      setCalendarData(response.data.calendarData || []);
    } catch (error) {
      console.error("Error fetching calendar data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEventClick = (event) => {
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
      comments: event.extendedProps.comments, // Include comments field

      start: event.start,
      end: event.end,
      title: event.title,
    };

    setSelectedBooking(bookingData);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedBooking(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Calendar View</h2>
      </div>

      {/* Calendar View */}
      <div className="bg-white">
        <FinanceCalendar
          events={calendarData}
          onEventClick={handleEventClick}
          onMonthChange={(monthInfo) => {
            // Update date range if needed
          }}
        />
      </div>

      {/* Booking Details Modal */}
      <BookingDetailsModal
        booking={selectedBooking}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </div>
  );
};

export default CalendarView;
