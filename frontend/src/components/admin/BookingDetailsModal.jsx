import React, { useEffect, useRef } from "react";
import {
  MdClose,
  MdMusicNote,
  MdVideogameAsset,
  MdLocalCafe,
  MdPerson,
  MdEmail,
  MdPhone,
  MdSchedule,
  MdAttachMoney,
  MdLocationOn,
  MdEvent,
  MdCheckCircle,
  MdPending,
  MdCancel,
  MdAccessTime,
} from "react-icons/md";

const BookingDetailsModal = ({ booking, isOpen, onClose }) => {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose, booking]);

  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  if (!isOpen || !booking) return null;

  const getServiceIcon = (serviceType) => {
    switch (serviceType) {
      case "karaoke":
        return <MdMusicNote className="text-purple-500" size={24} />;
      case "n64":
        return <MdVideogameAsset className="text-blue-500" size={24} />;
      case "cafe":
        return <MdLocalCafe className="text-green-500" size={24} />;
      default:
        return <MdEvent className="text-gray-500" size={24} />;
    }
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case "confirmed":
        return {
          color: "bg-green-100 text-green-800 border-green-200",
          icon: <MdCheckCircle className="text-green-500" />,
          text: "Confirmed",
        };
      case "pending":
        return {
          color: "bg-yellow-100 text-yellow-800 border-yellow-200",
          icon: <MdPending className="text-yellow-500" />,
          text: "Pending",
        };
      case "cancelled":
        return {
          color: "bg-red-100 text-red-800 border-red-200",
          icon: <MdCancel className="text-red-500" />,
          text: "Cancelled",
        };
      case "completed":
        return {
          color: "bg-blue-100 text-blue-800 border-blue-200",
          icon: <MdCheckCircle className="text-blue-500" />,
          text: "Completed",
        };
      default:
        return {
          color: "bg-gray-100 text-gray-800 border-gray-200",
          icon: <MdEvent className="text-gray-500" />,
          text: status,
        };
    }
  };

  const getPaymentStatusInfo = (paymentStatus) => {
    switch (paymentStatus) {
      case "completed":
        return {
          color: "bg-green-100 text-green-800 border-green-200",
          icon: <MdCheckCircle className="text-green-500" />,
          text: "Paid",
        };
      case "pending":
        return {
          color: "bg-orange-100 text-orange-800 border-orange-200",
          icon: <MdPending className="text-orange-500" />,
          text: "Payment Pending",
        };
      case "failed":
        return {
          color: "bg-red-100 text-red-800 border-red-200",
          icon: <MdCancel className="text-red-500" />,
          text: "Payment Failed",
        };
      case "refunded":
        return {
          color: "bg-purple-100 text-purple-800 border-purple-200",
          icon: <MdCancel className="text-purple-500" />,
          text: "Refunded",
        };
      default:
        return {
          color: "bg-gray-100 text-gray-800 border-gray-200",
          icon: <MdAttachMoney className="text-gray-500" />,
          text: paymentStatus || "Unknown",
        };
    }
  };

  const formatDate = (dateInput) => {
    if (!dateInput) return "N/A";

    try {
      let date;

      // Handle Date objects (from FullCalendar)
      if (dateInput instanceof Date) {
        date = dateInput;
      }
      // Handle string formats
      else if (typeof dateInput === "string") {
        if (dateInput.includes("AM") || dateInput.includes("PM")) {
          // Handle "2025-08-23T2:00 PM" format
          const match = dateInput.match(
            /(\d{4}-\d{2}-\d{2})T(\d{1,2}):(\d{2})\s*(AM|PM)/i
          );
          if (match) {
            const [_, datePart, hourStr, minuteStr, period] = match;
            let hour = parseInt(hourStr, 10);
            const minute = parseInt(minuteStr, 10);

            // Convert to 24-hour format for proper parsing
            if (period.toUpperCase() === "PM" && hour !== 12) hour += 12;
            if (period.toUpperCase() === "AM" && hour === 12) hour = 0;

            const isoString = `${datePart}T${hour
              .toString()
              .padStart(2, "0")}:${minute.toString().padStart(2, "0")}:00`;
            date = new Date(isoString);
          } else {
            date = new Date(dateInput);
          }
        } else {
          // Handle "2025-08-23T14:00:00" format
          date = new Date(dateInput);
        }
      } else {
        console.error(
          "Unexpected date input type:",
          typeof dateInput,
          dateInput
        );
        return "N/A";
      }

      if (isNaN(date.getTime())) return "N/A";

      // Display exact date without timezone conversion
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "UTC",
      });
    } catch (error) {
      console.error("Error formatting date:", error, dateInput);
      return "N/A";
    }
  };

  const formatTime = (dateInput) => {
    if (!dateInput) return "N/A";

    try {
      let date;

      // Handle Date objects (from FullCalendar)
      if (dateInput instanceof Date) {
        date = dateInput;
      }
      // Handle string formats
      else if (typeof dateInput === "string") {
        if (dateInput.includes("AM") || dateInput.includes("PM")) {
          // Handle "2025-08-23T2:00 PM" format
          const match = dateInput.match(
            /(\d{4}-\d{2}-\d{2})T(\d{1,2}):(\d{2})\s*(AM|PM)/i
          );
          if (match) {
            const [_, datePart, hourStr, minuteStr, period] = match;
            let hour = parseInt(hourStr, 10);
            const minute = parseInt(minuteStr, 10);

            // Convert to 24-hour format for proper parsing
            if (period.toUpperCase() === "PM" && hour !== 12) hour += 12;
            if (period.toUpperCase() === "AM" && hour === 12) hour = 0;

            const isoString = `${datePart}T${hour
              .toString()
              .padStart(2, "0")}:${minute.toString().padStart(2, "0")}:00`;
            date = new Date(isoString);
          } else {
            // If regex doesn't match, try to extract time directly
            const timeMatch = dateInput.match(/T(\d{1,2}):(\d{2})\s*(AM|PM)/i);
            if (timeMatch) {
              const [_, hourStr, minuteStr, period] = timeMatch;
              let hour = parseInt(hourStr, 10);
              const minute = parseInt(minuteStr, 10);

              if (period.toUpperCase() === "PM" && hour !== 12) hour += 12;
              if (period.toUpperCase() === "AM" && hour === 12) hour = 0;

              // Create a simple time string
              return `${hour}:${minute
                .toString()
                .padStart(2, "0")} ${period.toUpperCase()}`;
            }
            date = new Date(dateInput);
          }
        } else {
          // Handle "2025-08-23T14:00:00" format
          date = new Date(dateInput);
        }
      } else {
        console.error(
          "Unexpected time input type:",
          typeof dateInput,
          dateInput
        );
        return "N/A";
      }

      if (isNaN(date.getTime())) return "N/A";

      // Display exact time without timezone conversion
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: "UTC",
      });
    } catch (error) {
      console.error("Error formatting time:", error, dateInput);
      return "N/A";
    }
  };

  const formatDuration = (start, end) => {
    if (!start || !end) return "N/A";

    try {
      // Helper function to parse both time formats and Date objects
      const parseTime = (timeInput) => {
        // Handle Date objects (from FullCalendar)
        if (timeInput instanceof Date) {
          return timeInput;
        }
        // Handle string formats
        else if (typeof timeInput === "string") {
          if (timeInput.includes("AM") || timeInput.includes("PM")) {
            // Handle "2025-08-23T2:00 PM" format
            const match = timeInput.match(
              /(\d{4}-\d{2}-\d{2})T(\d{1,2}):(\d{2})\s*(AM|PM)/i
            );
            if (match) {
              const [_, datePart, hourStr, minuteStr, period] = match;
              let hour = parseInt(hourStr, 10);
              const minute = parseInt(minuteStr, 10);

              // Convert to 24-hour format for proper parsing
              if (period.toUpperCase() === "PM" && hour !== 12) hour += 12;
              if (period.toUpperCase() === "AM" && hour === 12) hour = 0;

              const isoString = `${datePart}T${hour
                .toString()
                .padStart(2, "0")}:${minute.toString().padStart(2, "0")}:00`;
              return new Date(isoString);
            }
          }
          // Handle "2025-08-23T14:00:00" format
          return new Date(timeInput);
        } else {
          console.error(
            "Unexpected time input type in duration:",
            typeof timeInput,
            timeInput
          );
          return null;
        }
      };

      const startTime = parseTime(start);
      const endTime = parseTime(end);

      if (
        !startTime ||
        !endTime ||
        isNaN(startTime.getTime()) ||
        isNaN(endTime.getTime())
      )
        return "N/A";

      const durationMs = endTime - startTime;

      if (durationMs < 0) return "N/A";

      const hours = Math.floor(durationMs / (1000 * 60 * 60));
      const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

      if (hours > 0) {
        return `${hours}h ${minutes}m`;
      }
      return `${minutes}m`;
    } catch (error) {
      console.error("Error formatting duration:", error, { start, end });
      return "N/A";
    }
  };

  const getServiceSpecificDetails = () => {
    if (!booking.serviceType) {
      return (
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-gray-600 text-sm">
            Service type information not available
          </p>
        </div>
      );
    }

    switch (booking.serviceType) {
      case "karaoke":
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-2">
                <MdLocationOn className="text-purple-600" />
                <span className="font-medium text-purple-900">Room</span>
              </div>
              <span className="text-purple-700">
                {booking.roomName || "Unknown Room"}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-2">
                <MdAccessTime className="text-purple-600" />
                <span className="font-medium text-purple-900">Duration</span>
              </div>
              <span className="text-blue-700">
                {booking.durationHours
                  ? `${booking.durationHours}h`
                  : formatDuration(booking.start, booking.end)}
              </span>
            </div>
          </div>
        );

      case "n64":
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2">
                <MdLocationOn className="text-blue-600" />
                <span className="font-medium text-blue-900">Booth</span>
              </div>
              <span className="text-blue-700">
                {booking.roomName || "Unknown Booth"}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2">
                <MdAccessTime className="text-blue-600" />
                <span className="font-medium text-blue-900">Duration</span>
              </div>
              <span className="text-purple-700">
                {booking.durationHours
                  ? `${booking.durationHours}h`
                  : formatDuration(booking.start, booking.end)}
              </span>
            </div>
          </div>
        );

      case "cafe":
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2">
                <MdLocationOn className="text-green-600" />
                <span className="font-medium text-green-900">Table</span>
              </div>
              <span className="text-green-700">
                {booking.roomName || "Unknown Table"}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2">
                <MdAccessTime className="text-green-600" />
                <span className="font-medium text-green-900">Time</span>
              </div>
              <span className="text-green-700">
                {booking.time ||
                  (booking.start ? formatTime(booking.start) : "N/A")}
              </span>
            </div>
          </div>
        );

      default:
        return (
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-gray-600 text-sm">
              Unknown service type: {booking.serviceType}
            </p>
          </div>
        );
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            {getServiceIcon(booking.serviceType)}
            <div>
              <h2 className="text-xl font-bold text-gray-900 capitalize">
                {booking.serviceType} Booking Details
              </h2>
              <p className="text-sm text-gray-600">
                ID: {booking.id || booking._id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <MdClose size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status Section */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Status Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Booking Status */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Booking Status
                </span>
                <div
                  className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${
                    getStatusInfo(booking.status).color
                  }`}
                >
                  {getStatusInfo(booking.status).icon}
                  <span className="text-sm font-medium">
                    {getStatusInfo(booking.status).text}
                  </span>
                </div>
              </div>

              {/* Payment Status */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Payment Status
                </span>
                <div
                  className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${
                    getPaymentStatusInfo(booking.paymentStatus).color
                  }`}
                >
                  {getPaymentStatusInfo(booking.paymentStatus).icon}
                  <span className="text-sm font-medium">
                    {getPaymentStatusInfo(booking.paymentStatus).text}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <MdPerson className="text-gray-600" />
              Customer Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <MdPerson className="text-gray-500" />
                <span className="text-gray-700">
                  {booking.customerName || "N/A"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MdEmail className="text-gray-500" />
                <span className="text-gray-700">
                  {booking.customerEmail || "N/A"}
                </span>
              </div>
              {booking.customerPhone && (
                <div className="flex items-center gap-2">
                  <MdPhone className="text-gray-500" />
                  <span className="text-gray-700">{booking.customerPhone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Booking Details */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <MdSchedule className="text-gray-600" />
              Booking Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <MdEvent className="text-gray-500" />
                <span className="text-gray-700">
                  {booking.date
                    ? formatDate(booking.date)
                    : booking.start
                    ? formatDate(booking.start)
                    : "N/A"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MdAccessTime className="text-gray-500" />
                <span className="text-gray-700">{booking.time || "N/A"}</span>
              </div>
              {(booking.durationHours || booking.duration) && (
                <div className="flex items-center gap-2">
                  <MdSchedule className="text-gray-500" />
                  <span className="text-gray-700">
                    Duration: {booking.durationHours || booking.duration}h{" "}
                    {(booking.durationHours || booking.duration) > 1 ? "s" : ""}
                  </span>
                </div>
              )}
              {booking.time && (booking.durationHours || booking.duration) && (
                <div className="flex items-center gap-2">
                  <MdSchedule className="text-gray-500" />
                  <span className="text-gray-700">
                    Ends:{" "}
                    {(() => {
                      // Calculate end time based on start time and duration
                      const timeMatch = booking.time.match(
                        /(\d{1,2}):(\d{2})\s*(AM|PM)/i
                      );
                      if (timeMatch) {
                        const [_, hourStr, minuteStr, period] = timeMatch;
                        let hour = parseInt(hourStr, 10);
                        const minute = parseInt(minuteStr, 10);

                        // Convert to 24-hour format
                        if (period.toUpperCase() === "PM" && hour !== 12)
                          hour += 12;
                        if (period.toUpperCase() === "AM" && hour === 12)
                          hour = 0;

                        // Calculate end time using either durationHours or duration
                        const duration =
                          booking.durationHours || booking.duration;
                        const endHour = hour + duration;
                        const endHour24 = endHour % 24;
                        const endHour12 =
                          endHour24 === 0
                            ? 12
                            : endHour24 > 12
                            ? endHour24 - 12
                            : endHour24;
                        const endPeriod = endHour24 >= 12 ? "PM" : "AM";

                        return `${endHour12}:${minute
                          .toString()
                          .padStart(2, "0")} ${endPeriod}`;
                      }
                      return "N/A";
                    })()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Service Specific Details */}
          {getServiceSpecificDetails()}

          {/* Financial Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <MdAttachMoney className="text-gray-600" />
              Financial Information
            </h3>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Total Amount</span>
              <span className="text-2xl font-bold text-green-600">
                ${(booking.revenue || booking.totalPrice || 0).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Additional Notes */}
          {booking.notes && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Additional Notes
              </h3>
              <p className="text-gray-700">{booking.notes}</p>
            </div>
          )}

          {/* Comments/Special Requests */}
          {booking.comments && (
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <span className="text-blue-500">💬</span>
                Special Requests & Notes
              </h3>
              <p className="text-blue-700">{booking.comments}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailsModal;
