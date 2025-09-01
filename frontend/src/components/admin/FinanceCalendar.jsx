import React, { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import "./FinanceCalendar.css";

const FinanceCalendar = ({ events, onEventClick, onMonthChange }) => {
  const [currentView, setCurrentView] = useState("dayGridMonth");

  const getEventColor = (serviceType) => {
    switch (serviceType) {
      case "karaoke":
        return "#8B5CF6"; // Purple
      case "n64":
        return "#3B82F6"; // Blue
      case "cafe":
        return "#10B981"; // Green
      default:
        return "#6B7280"; // Gray
    }
  };

  const formatEvents = (events) => {
    const formattedEvents = events.map((event) => {
      // Convert time format from "2:00 PM" to ISO format
      const convertTimeToISO = (dateTimeStr) => {
        // Parse "2025-08-23T2:00 PM" format
        const match = dateTimeStr.match(
          /(\d{4}-\d{2}-\d{2})T(\d{1,2}):(\d{2})\s*(AM|PM)/i
        );
        if (!match) {
          return dateTimeStr;
        }

        const [_, date, hourStr, minuteStr, period] = match;
        let hour = parseInt(hourStr, 10);
        const minute = parseInt(minuteStr, 10);

        // Convert to 24-hour format
        if (period.toUpperCase() === "PM" && hour !== 12) hour += 12;
        if (period.toUpperCase() === "AM" && hour === 12) hour = 0;

        // Format as ISO string
        return `${date}T${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}:00`;
      };

      return {
        id: event.id,
        title: event.title,
        start: convertTimeToISO(event.start),
        end: convertTimeToISO(event.end),
        backgroundColor: getEventColor(event.extendedProps?.serviceType),
        borderColor: getEventColor(event.extendedProps?.serviceType),
        textColor: "#FFFFFF",
        extendedProps: {
          serviceType: event.extendedProps?.serviceType,
          status: event.extendedProps?.status,
          paymentStatus: event.extendedProps?.paymentStatus,
          revenue: event.extendedProps?.revenue,
          roomName: event.extendedProps?.roomName,
          customerName: event.extendedProps?.customerName,
          customerEmail: event.extendedProps?.customerEmail,
          time: event.extendedProps?.time, // Include time field
          durationHours: event.extendedProps?.durationHours, // Include duration for karaoke/N64
          duration: event.extendedProps?.duration, // Include duration for cafe
          comments: event.extendedProps?.comments, // Include comments field
        },
      };
    });

    return formattedEvents;
  };

  const handleEventClick = (clickInfo) => {
    if (onEventClick) {
      onEventClick(clickInfo.event);
    }
  };

  const handleDatesSet = (dateInfo) => {
    // Update current view state
    setCurrentView(dateInfo.view.type);

    if (onMonthChange && dateInfo.view.type === "dayGridMonth") {
      // Get the first and last day of the month being displayed
      const startDate = new Date(dateInfo.start);
      const endDate = new Date(dateInfo.end);

      // Adjust end date to be the last day of the month (not first day of next month)
      endDate.setDate(endDate.getDate() - 1);

      const monthInfo = {
        startDate: startDate.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
        month: startDate.getMonth(),
        year: startDate.getFullYear(),
      };

      onMonthChange(monthInfo);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Booking Calendar
        </h3>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-purple-500"></div>
            <span className="text-gray-900">Karaoke</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-500"></div>
            <span className="text-gray-900">N64</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500"></div>
            <span className="text-gray-900">Cafe</span>
          </div>
        </div>
      </div>
      <div className="h-64 sm:h-80 md:h-96 lg:h-[500px] xl:h-[600px]">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridDay"
          editable={false}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          weekends={true}
          events={formatEvents(events)}
          eventClick={handleEventClick}
          height="100%"
          eventDisplay="block"
          eventTimeFormat={{
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }}
          // Responsive settings
          aspectRatio={1.35}
          dayCellContent={(arg) => (
            <div className="text-xs sm:text-sm md:text-base">
              {arg.dayNumberText}
            </div>
          )}
          // Mobile-friendly toolbar with day view option
          headerToolbar={{
            left: "prev,next",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          datesSet={handleDatesSet}
        />
      </div>
    </div>
  );
};

export default FinanceCalendar;
