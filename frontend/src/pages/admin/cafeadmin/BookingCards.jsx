import React from "react";

const BookingCards = ({ bookings, onUpdateStatus, onDelete }) => {
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
    return new Date(dateString).toLocaleDateString("en-AU", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (timeString) => {
    const [hour] = timeString.split(":");
    const hourNum = parseInt(hour);
    if (hourNum === 12) return "12:00 PM";
    return hourNum > 12 ? `${hourNum - 12}:00 PM` : `${hourNum}:00 AM`;
  };

  return (
    <div className="lg:hidden space-y-4">
      {bookings.map((booking) => (
        <div
          key={booking._id}
          className="bg-white shadow-md rounded-lg p-4 border border-gray-200"
        >
          {/* Header */}
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="font-semibold text-gray-900">
                {booking.customerName}
              </h3>
              <p className="text-sm text-gray-600">{booking.customerEmail}</p>
              {booking.customerPhone && (
                <p className="text-sm text-gray-600">{booking.customerPhone}</p>
              )}
              {booking.userId && (
                <p className="text-xs text-blue-600">
                  User: {booking.userId.name} ({booking.userId._id})
                </p>
              )}
            </div>
            <span
              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                booking.status
              )}`}
            >
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </span>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4 text-sm mb-4">
            <div>
              <span className="font-medium text-gray-700">Date:</span>
              <p className="text-gray-900">{formatDate(booking.date)}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Time:</span>
              <p className="text-gray-900">{formatTime(booking.time)}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Duration:</span>
              <p className="text-gray-900">
                {booking.duration} hour{booking.duration > 1 ? "s" : ""}
              </p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Total:</span>
              <p className="text-green-600 font-semibold">
                ${booking.totalCost.toFixed(2)}
              </p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Payment:</span>
              <p className="text-gray-900">
                {booking.paymentId ? (
                  <span className="text-green-600 font-mono text-xs">
                    {booking.paymentId}
                  </span>
                ) : (
                  <span className="text-gray-400 text-xs">No payment ID</span>
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
              </p>
            </div>
          </div>

          {/* Chairs */}
          <div className="mb-4">
            <span className="font-medium text-gray-700 text-sm">Chairs:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {booking.chairIds.map((chairId) => (
                <span
                  key={chairId}
                  className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                >
                  {chairId}
                </span>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            {booking.status === "pending" && (
              <>
                <button
                  onClick={() => onUpdateStatus(booking._id, "confirmed")}
                  className="flex-1 min-w-[100px] px-3 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  Confirm
                </button>
                <button
                  onClick={() => onUpdateStatus(booking._id, "cancelled")}
                  className="flex-1 min-w-[100px] px-3 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  Cancel
                </button>
              </>
            )}
            {booking.status === "confirmed" && (
              <button
                onClick={() => onUpdateStatus(booking._id, "completed")}
                className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Mark Complete
              </button>
            )}
            <button
              onClick={() => onDelete(booking._id)}
              className="flex-1 min-w-[100px] px-3 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BookingCards;
