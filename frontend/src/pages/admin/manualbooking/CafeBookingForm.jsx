import React from "react";
import { Coffee, Calendar, Clock } from "lucide-react";
import { InputField, SelectField } from "./FormComponents";

const CafeBookingForm = ({
  bookingData,
  resources,
  chairsWithAvailability,
  loadingChairs,
  handleBookingDataChange,
}) => {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Date, Time, Duration Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        <InputField
          label="Date"
          icon={<Calendar size={16} />}
          type="date"
          value={bookingData.cafe.date}
          onChange={(e) =>
            handleBookingDataChange("cafe", "date", e.target.value)
          }
          required
          onClick={(e) => e.target.showPicker()}
        />

        <SelectField
          label="Time"
          icon={<Clock size={16} />}
          value={bookingData.cafe.time}
          onChange={(e) =>
            handleBookingDataChange("cafe", "time", e.target.value)
          }
          required
        >
          <option value="">Select Time</option>
          {resources.cafe.timeSlots?.map((slot) => (
            <option key={slot} value={slot}>
              {slot}
            </option>
          ))}
        </SelectField>

        <InputField
          label="Duration (Hours)"
          icon={<Clock size={16} />}
          type="number"
          min="1"
          max={resources.cafe.maxDuration || 8}
          value={bookingData.cafe.duration}
          onChange={(e) =>
            handleBookingDataChange(
              "cafe",
              "duration",
              parseInt(e.target.value)
            )
          }
          required
        />
      </div>

      {/* Chair Selection */}
      <div className="space-y-2 sm:space-y-3">
        <label className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm font-medium text-gray-700">
          <Coffee size={14} className="sm:w-4 sm:h-4" />
          <span>Select Chairs</span>
          {bookingData.cafe.chairIds.length > 0 && (
            <span className="text-blue-600 text-xs sm:text-sm">
              ({bookingData.cafe.chairIds.length} selected)
            </span>
          )}
        </label>

        {loadingChairs ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : chairsWithAvailability.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3 max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-2 sm:p-3 md:p-4">
            {chairsWithAvailability.map((chair) => {
              const isSelected = bookingData.cafe.chairIds.includes(chair.id);
              const isAvailable = chair.isAvailable;

              return (
                <button
                  key={chair.id}
                  type="button"
                  onClick={() => {
                    if (!isAvailable) return;

                    const currentChairs = bookingData.cafe.chairIds;
                    const newChairs = isSelected
                      ? currentChairs.filter((id) => id !== chair.id)
                      : [...currentChairs, chair.id];

                    handleBookingDataChange("cafe", "chairIds", newChairs);
                  }}
                  disabled={!isAvailable}
                  className={`p-2 sm:p-3 rounded-lg border-2 text-xs sm:text-sm font-medium transition-all ${
                    !isAvailable
                      ? "bg-red-50 border-red-200 text-red-400 cursor-not-allowed"
                      : isSelected
                      ? "bg-blue-100 border-blue-500 text-blue-700 shadow-md"
                      : "bg-green-50 border-green-200 text-green-700 hover:bg-green-100 hover:border-green-300"
                  }`}
                >
                  <div className="flex flex-col items-center space-y-0.5 sm:space-y-1">
                    <Coffee size={16} className="sm:w-5 sm:h-5" />
                    <span>{chair.id}</span>
                    <span className="text-xs">
                      {!isAvailable
                        ? "Booked"
                        : isSelected
                        ? "Selected"
                        : "Available"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        ) : bookingData.cafe.date &&
          bookingData.cafe.time &&
          bookingData.cafe.duration ? (
          <div className="text-center py-8 text-gray-500">
            <Coffee size={48} className="mx-auto mb-2 text-gray-300" />
            <p>No chairs found for the selected time slot</p>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Calendar size={48} className="mx-auto mb-2 text-gray-300" />
            <p>
              Please select date, time, and duration to see available chairs
            </p>
          </div>
        )}
      </div>

      {/* Special Requests */}
      <div className="space-y-1">
        <label className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm font-medium text-gray-700">
          <Coffee size={14} className="sm:w-4 sm:h-4" />
          <span>Special Requests</span>
        </label>
        <textarea
          value={bookingData.cafe.specialRequests}
          onChange={(e) =>
            handleBookingDataChange("cafe", "specialRequests", e.target.value)
          }
          placeholder="Any special requests..."
          rows={3}
          className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500 resize-vertical text-xs sm:text-sm"
        />
      </div>
    </div>
  );
};

export default CafeBookingForm;
