import React, { useState, useEffect } from "react";
import api from "../../utils/axios";

const PinInputModal = ({
  isOpen,
  onClose,
  onPinVerified,
  bookingInProgress = false,
}) => {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [staffInfo, setStaffInfo] = useState(null);
  const [creatingBooking, setCreatingBooking] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPin("");
      setError("");
      setStaffInfo(null);
      setCreatingBooking(false);
    }
  }, [isOpen]);

  const handlePinChange = (e) => {
    const value = e.target.value;
    // Only allow 4 digits
    if (/^\d{0,4}$/.test(value)) {
      setPin(value);
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (pin.length !== 4) {
      setError("PIN must be exactly 4 digits");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Use admin PIN verification route (accessible by both admin and superadmin)
      const response = await api.post("/admin/pin-verify/verify", { pin });

      if (response.data.success) {
        setStaffInfo(response.data.staffInfo);
        setError("");
        setCreatingBooking(true);

        // Automatically trigger the booking creation
        setTimeout(() => {
          onPinVerified(response.data.staffInfo);
        }, 500); // Small delay to show the "Creating booking..." message
      } else {
        setError(response.data.message || "Invalid PIN");
      }
    } catch (error) {
      console.error("Error verifying PIN:", error);
      setError(error.response?.data?.message || "Failed to verify PIN");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Staff Identification Required
          </h2>
          <button
            onClick={onClose}
            disabled={bookingInProgress}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {!staffInfo ? (
          <>
            <p className="text-gray-600 mb-4">
              Please enter your 4-digit staff PIN to proceed with the manual
              booking. This is required to track which staff member created the
              booking.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="pin"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Staff PIN
                </label>
                <input
                  type="text"
                  id="pin"
                  value={pin}
                  onChange={handlePinChange}
                  placeholder="0000"
                  maxLength={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-lg tracking-widest text-gray-900"
                  autoFocus
                  required
                />
              </div>

              {error && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                  {error}
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={loading || pin.length !== 4}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? "Verifying..." : "Verify PIN"}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 text-green-400 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-green-800 font-medium">
                  PIN Verified Successfully!
                </span>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h3 className="font-medium text-blue-900 mb-2">
                Staff Information
              </h3>
              <div className="text-sm text-blue-800 space-y-1">
                <p>
                  <strong>Name:</strong> {staffInfo.staffName}
                </p>
                <p>
                  <strong>PIN:</strong> {staffInfo.pin}
                </p>
                <p>
                  <strong>Admin Account:</strong> {staffInfo.adminName}
                </p>
              </div>
            </div>

            {creatingBooking || bookingInProgress ? (
              <div className="text-center">
                <div className="flex items-center justify-center mb-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
                  <span className="text-blue-600 font-medium">
                    Creating Booking...
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  Please wait while we process your booking.
                </p>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-sm text-green-600 mb-3">
                  ✅ PIN verified! Creating booking automatically...
                </div>
                <button
                  onClick={onClose}
                  disabled={bookingInProgress}
                  className="w-full bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PinInputModal;
