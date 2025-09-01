import React from "react";
import { MdAccessTime } from "react-icons/md";

const TimeSlotSelector = ({
  timeSlots,
  blockedSlots,
  selectedTime,
  date,
  onTimeSelect,
  loading,
}) => {
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (timeSlots.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <MdAccessTime size={48} className="mx-auto mb-2 text-gray-300" />
        <p>No time slots available for this room</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1 sm:gap-2">
      {timeSlots.map((timeSlot) => {
        const isBlocked = blockedSlots.includes(timeSlot);
        const isSelected = selectedTime === timeSlot;

        return (
          <button
            key={timeSlot}
            type="button"
            onClick={() => {
              if (!isBlocked) {
                onTimeSelect(timeSlot);
              }
            }}
            disabled={isBlocked}
            className={`p-1.5 sm:p-2 border rounded-md text-center transition-all duration-300 text-xs sm:text-sm ${
              isBlocked
                ? "opacity-50 cursor-not-allowed border-red-300 bg-red-100 text-red-600"
                : isSelected
                ? "border-blue-500 bg-blue-100 text-blue-700 shadow-md"
                : "border-gray-300 bg-white text-gray-700 hover:border-green-500 hover:bg-green-50 hover:text-green-700"
            }`}
          >
            <MdAccessTime className="h-2.5 w-2.5 sm:h-3 sm:w-3 mx-auto mb-0.5 sm:mb-1" />
            <span className="text-xs font-mono block">{timeSlot}</span>
            <div className="text-xs mt-0.5 sm:mt-1">
              {isBlocked ? "Booked" : isSelected ? "Selected" : "Available"}
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default TimeSlotSelector;
