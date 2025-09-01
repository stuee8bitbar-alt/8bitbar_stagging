import React from "react";

const BookingForm = ({
  bookingDetails,
  setBookingDetails,
  selectedChairs,
  calculateTotal,
  onAddToCart,
  loading,
  bookedChairs,
  allBookings = [],
  cafeSettings = null,
}) => {
  const handleInputChange = (field, value) => {
    setBookingDetails((prev) => {
      const newDetails = { ...prev, [field]: value };

      // If time changes, adjust duration if it exceeds the new maximum
      if (field === "time") {
        const selectedHour = parseInt(value.split(":")[0]);
        const closingHour = cafeSettings?.closingTime
          ? parseInt(cafeSettings.closingTime.split(":")[0])
          : 23;
        const hoursUntilClosing = closingHour - selectedHour;
        const maxPossibleDuration = Math.min(
          cafeSettings?.maxDuration || 8,
          Math.max(1, hoursUntilClosing)
        );

        if (newDetails.duration > maxPossibleDuration) {
          newDetails.duration = maxPossibleDuration;
        }
      }

      return newDetails;
    });
  };

  // Helper: get the Date object for a time slot on a given date
  const getSlotDateTime = (dateStr, timeStr) => {
    const [hour] = timeStr.split(":");
    const slotDate = new Date(dateStr);
    slotDate.setHours(parseInt(hour), 0, 0, 0);
    return slotDate;
  };

  // Check if a time slot is blocked due to existing bookings
  const isTimeSlotBlocked = (timeStr) => {
    if (!bookingDetails.date || selectedChairs.length === 0) return false;

    const slotStart = getSlotDateTime(bookingDetails.date, timeStr);
    const slotEnd = new Date(slotStart);
    slotEnd.setHours(slotEnd.getHours() + bookingDetails.duration);

    // Check if any selected chair has a booking that overlaps with this time slot
    return selectedChairs.some((chairId) => {
      return allBookings.some((booking) => {
        if (!booking.chairIds.includes(chairId)) return false;
        if (booking.date !== bookingDetails.date) return false;
        if (booking.status === "cancelled") return false;

        const bookingStart = getSlotDateTime(booking.date, booking.time);
        const bookingEnd = new Date(bookingStart);
        bookingEnd.setHours(bookingEnd.getHours() + booking.duration);

        // Check for overlap: slotStart < bookingEnd && slotEnd > bookingStart
        return slotStart < bookingEnd && slotEnd > bookingStart;
      });
    });
  };

  // Generate time options from cafe settings or default
  const timeOptions = [];
  const timeSlots = cafeSettings?.timeSlots || [
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
    "19:00",
    "20:00",
    "21:00",
    "22:00",
  ];

  timeSlots.forEach((timeString) => {
    const hour = parseInt(timeString.split(":")[0]);
    const displayTime =
      hour > 12
        ? `${hour - 12}:00 PM`
        : hour === 12
        ? "12:00 PM"
        : `${hour}:00 AM`;
    timeOptions.push({ value: timeString, label: displayTime });
  });

  // Generate duration options (limited by settings and time slot availability)
  const getMaxDuration = () => {
    const settingsMaxDuration = cafeSettings?.maxDuration || 8;
    if (!bookingDetails.time) return settingsMaxDuration;

    const selectedHour = parseInt(bookingDetails.time.split(":")[0]);
    const closingHour = cafeSettings?.closingTime
      ? parseInt(cafeSettings.closingTime.split(":")[0])
      : 23;

    const hoursUntilClosing = closingHour - selectedHour;
    return Math.min(settingsMaxDuration, Math.max(1, hoursUntilClosing));
  };

  const durationOptions = [];
  const maxDuration = getMaxDuration();
  for (let i = 1; i <= maxDuration; i++) {
    durationOptions.push({
      value: i,
      label: `${i} hour${i > 1 ? "s" : ""}`,
    });
  }

  // Helper: check if a date falls on an available week day
  const isDateAvailable = (dateStr) => {
    if (!cafeSettings?.weekDays || cafeSettings.weekDays.length === 0)
      return true; // If no week days specified, allow all
    const date = new Date(dateStr);
    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const dayName = dayNames[date.getDay()];
    return cafeSettings.weekDays.includes(dayName);
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="bg-gray-900/50 border border-pink-500/30 rounded-lg p-6">
      <h3 className="text-xl font-bold mb-6 text-pink-400">Booking Details</h3>

      <div className="space-y-4">
        {/* Date Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Select Date
          </label>
          <input
            type="date"
            min={today}
            value={bookingDetails.date}
            onChange={(e) => handleInputChange("date", e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
            required
          />

          {/* Available Days Information */}
          {cafeSettings && (
            <div className="mt-2 text-sm text-gray-400">
              <span className="font-medium text-green-400">Available on: </span>
              {cafeSettings.weekDays && cafeSettings.weekDays.length > 0 ? (
                cafeSettings.weekDays.length === 7 ? (
                  <span className="text-gray-300">All days</span>
                ) : (
                  <span className="text-gray-300">
                    {cafeSettings.weekDays.join(", ")}
                  </span>
                )
              ) : (
                <span className="text-gray-300">All days</span>
              )}
            </div>
          )}

          {bookingDetails.date &&
            cafeSettings &&
            !isDateAvailable(bookingDetails.date) && (
              <div className="text-red-400 text-sm mt-2">
                This ticket show is not available on{" "}
                {new Date(bookingDetails.date).toLocaleDateString("en-US", {
                  weekday: "long",
                })}
                . Please select another date.
              </div>
            )}
        </div>

        {/* Time Selection */}
        {bookingDetails.date &&
          (!cafeSettings || isDateAvailable(bookingDetails.date)) && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Select Time
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {timeOptions.map((option) => {
                  const isBlocked = isTimeSlotBlocked(option.value);
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        !isBlocked && handleInputChange("time", option.value)
                      }
                      disabled={isBlocked}
                      className={`p-3 border rounded-lg text-center transition-all duration-300 ${
                        isBlocked
                          ? "opacity-50 cursor-not-allowed border-gray-700 bg-gray-800 text-gray-500"
                          : bookingDetails.time === option.value
                          ? "border-pink-500 bg-pink-500/20 text-pink-400"
                          : "border-gray-700 hover:border-green-500 hover:bg-green-500/20 hover:text-green-400"
                      }`}
                    >
                      <span className="text-sm font-mono">{option.label}</span>
                      {isBlocked && (
                        <div className="text-xs text-red-400 mt-1">
                          Unavailable
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

        {/* Duration Selection */}
        {bookingDetails.date &&
          (!cafeSettings || isDateAvailable(bookingDetails.date)) && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Duration
              </label>
              <select
                value={Math.min(bookingDetails.duration, maxDuration)}
                onChange={(e) =>
                  handleInputChange("duration", parseInt(e.target.value))
                }
                disabled={
                  bookingDetails.date &&
                  cafeSettings &&
                  !isDateAvailable(bookingDetails.date)
                }
                className={`w-full px-3 py-2 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                  bookingDetails.date &&
                  cafeSettings &&
                  !isDateAvailable(bookingDetails.date)
                    ? "bg-gray-700 opacity-50 cursor-not-allowed"
                    : "bg-gray-800"
                }`}
                required
              >
                {durationOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {maxDuration < 8 && (
                <p className="text-xs text-yellow-400 mt-1">
                  Maximum {maxDuration} hour{maxDuration > 1 ? "s" : ""}{" "}
                  available until closing time
                </p>
              )}
            </div>
          )}

        {/* Selected Chairs Display */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Selected Chairs
          </label>
          <div className="min-h-[40px] px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white">
            {selectedChairs.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {selectedChairs.map((chairId) => (
                  <span
                    key={chairId}
                    className="px-2 py-1 bg-green-600 text-white text-xs rounded"
                  >
                    {chairId}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-gray-400 text-sm">No chairs selected</span>
            )}
          </div>
        </div>

        {/* Pricing Information */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
          <h4 className="font-semibold text-cyan-400 mb-2">Pricing</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Price per chair per hour:</span>
              <span className="text-green-400">
                {cafeSettings &&
                cafeSettings.pricePerChairPerHour !== undefined &&
                cafeSettings.pricePerChairPerHour === 0 ? (
                  <span className="text-green-400 font-bold">FREE</span>
                ) : (
                  `$${(cafeSettings &&
                  cafeSettings.pricePerChairPerHour !== undefined
                    ? cafeSettings.pricePerChairPerHour
                    : 10
                  ).toFixed(2)}`
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Selected chairs:</span>
              <span>{selectedChairs.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Duration:</span>
              <span>
                {bookingDetails.duration} hour
                {bookingDetails.duration > 1 ? "s" : ""}
              </span>
            </div>
            {bookingDetails.time && bookingDetails.duration && (
              <div className="text-sm text-red-300 mt-2 px-3 py-2 bg-red-900/30 rounded-lg border border-red-500/50">
                ⚠️ <strong>Actual time:</strong> {bookingDetails.time} -{" "}
                {(() => {
                  const [hour, minute] = bookingDetails.time.split(":");
                  const startHour = parseInt(hour);
                  let endHour = startHour + bookingDetails.duration;
                  let endMinute = parseInt(minute) - 5;

                  if (endMinute < 0) {
                    endMinute += 60;
                    endHour -= 1;
                  }

                  // Handle day rollover (24+ hours)
                  endHour = endHour % 24;

                  const endTime = `${endHour
                    .toString()
                    .padStart(2, "0")}:${endMinute
                    .toString()
                    .padStart(2, "0")}`;
                  return endTime;
                })()}{" "}
                (5 min reserved for cleaning)
              </div>
            )}
            <div className="border-t border-gray-600 pt-2 mt-2">
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span className="text-green-400">
                  {cafeSettings &&
                  cafeSettings.pricePerChairPerHour !== undefined &&
                  cafeSettings.pricePerChairPerHour === 0 ? (
                    <span className="text-green-400 font-bold">FREE</span>
                  ) : (
                    `$${calculateTotal().toFixed(2)}`
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={onAddToCart}
          disabled={
            loading ||
            selectedChairs.length === 0 ||
            !bookingDetails.date ||
            !bookingDetails.time ||
            (bookingDetails.date &&
              cafeSettings &&
              !isDateAvailable(bookingDetails.date))
          }
          className="w-full py-3 bg-gradient-to-r from-pink-500 to-cyan-400 text-white font-bold rounded-lg shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Checking Availability...
            </div>
          ) : cafeSettings &&
            cafeSettings.pricePerChairPerHour !== undefined &&
            cafeSettings.pricePerChairPerHour === 0 ? (
            "Book Free Chairs"
          ) : (
            `Add to Cart - $${calculateTotal().toFixed(2)}`
          )}
        </button>

        {/* Instructions */}
        <div className="text-xs text-gray-400 space-y-1">
          <p>• Select date, time, and duration first</p>
          <p>• Click on available chairs in the layout</p>
          <p>• Gray chairs are already booked</p>
          <p>• You can select multiple chairs</p>
        </div>
      </div>
    </div>
  );
};

export default BookingForm;
