import React from "react";

const BookingTable = ({ bookings, onUpdateStatus, onDelete }) => {
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
    <>
      {/* Desktop Table View (Large screens) */}
      <div className="hidden xl:block bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Booking Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Cost
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bookings.map((booking) => (
                <tr key={booking._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {booking.customerName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {booking.customerEmail}
                    </div>
                    {booking.customerPhone && (
                      <div className="text-sm text-gray-500">
                        {booking.customerPhone}
                      </div>
                    )}
                    {booking.userId && (
                      <div className="text-xs text-blue-600">
                        User ID: {booking.userId._id}
                      </div>
                    )}
                    {booking.isManualBooking && booking.staffName && (
                      <div className="text-xs text-blue-600 mt-1">
                        Staff: {booking.staffName}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {formatDate(booking.date)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatTime(booking.time)} | {booking.duration} hour
                      {booking.duration > 1 ? "s" : ""}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {booking.chairIds.map((chairId) => (
                        <span
                          key={chairId}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                        >
                          {chairId}
                        </span>
                      ))}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {booking.chairIds.length} chair
                      {booking.chairIds.length > 1 ? "s" : ""}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                    ${booking.totalCost.toFixed(2)}
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
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
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
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {booking.status === "pending" && (
                        <>
                          <button
                            onClick={() =>
                              onUpdateStatus(booking._id, "confirmed")
                            }
                            className="text-green-600 hover:text-green-900 px-2 py-1 bg-green-100 rounded"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() =>
                              onUpdateStatus(booking._id, "cancelled")
                            }
                            className="text-red-600 hover:text-red-900 px-2 py-1 bg-red-100 rounded"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      {booking.status === "confirmed" && (
                        <button
                          onClick={() =>
                            onUpdateStatus(booking._id, "completed")
                          }
                          className="text-blue-600 hover:text-blue-900 px-2 py-1 bg-blue-100 rounded"
                        >
                          Complete
                        </button>
                      )}
                      <button
                        onClick={() => onDelete(booking._id)}
                        className="text-red-600 hover:text-red-900 px-2 py-1 bg-red-100 rounded"
                      >
                        Delete
                      </button>
                    </div>
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
              {bookings.map((booking) => (
                <tr key={booking._id} className="hover:bg-gray-50">
                  <td className="px-3 py-3">
                    <div className="text-sm font-medium text-gray-900">
                      {booking.customerName}
                    </div>
                    <div className="text-xs text-gray-500">
                      {booking.customerEmail}
                    </div>
                    {booking.customerPhone && (
                      <div className="text-xs text-gray-500">
                        {booking.customerPhone}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <div className="text-sm text-gray-900">
                      {formatDate(booking.date)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatTime(booking.time)} | {booking.duration}h
                    </div>
                    <div className="text-xs text-gray-500">
                      {booking.chairIds.length} chair
                      {booking.chairIds.length > 1 ? "s" : ""}
                    </div>
                    <div className="text-sm font-medium text-green-600">
                      ${booking.totalCost.toFixed(2)}
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
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        getStatusInfo(booking.status).color
                      }`}
                    >
                      {getStatusInfo(booking.status).text}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-col gap-1">
                      {booking.status === "pending" && (
                        <>
                          <button
                            onClick={() =>
                              onUpdateStatus(booking._id, "confirmed")
                            }
                            className="text-xs text-green-600 hover:text-green-800 px-2 py-1 rounded"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() =>
                              onUpdateStatus(booking._id, "cancelled")
                            }
                            className="text-xs text-red-600 hover:text-red-800 px-2 py-1 rounded"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      {booking.status === "confirmed" && (
                        <button
                          onClick={() =>
                            onUpdateStatus(booking._id, "completed")
                          }
                          className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 rounded"
                        >
                          Complete
                        </button>
                      )}
                      {booking.status === "completed" && (
                        <>
                          <button
                            onClick={() =>
                              onUpdateStatus(booking._id, "completed")
                            }
                            disabled
                            className="text-xs text-gray-400 px-2 py-1 rounded cursor-not-allowed"
                            title="Booking already completed"
                          >
                            Complete
                          </button>
                          <button
                            onClick={() =>
                              onUpdateStatus(booking._id, "cancelled")
                            }
                            disabled
                            className="text-xs text-gray-400 px-2 py-1 rounded cursor-not-allowed"
                            title="Cannot cancel completed bookings"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => onDelete(booking._id)}
                        className="text-xs text-red-600 hover:text-red-800 px-2 py-1 rounded"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default BookingTable;
