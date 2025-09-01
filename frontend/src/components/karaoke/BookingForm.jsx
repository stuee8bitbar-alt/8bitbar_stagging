import React, { useState, useEffect, useMemo } from "react";
import { Clock, Users, Calendar, Music, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import axios from "../../utils/axios";

/**
 * BookingForm Component
 * * This component handles all aspects of the booking process. It manages
 * the form state (date, time, people, duration), user input, validation,
 * and submission. It now receives room data as a prop and does not fetch or show confirmation modal.
 */
const BookingForm = ({ room }) => {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [numberOfPeople, setNumberOfPeople] = useState(2);
  const [numberOfHours, setNumberOfHours] = useState(1);
  const [comments, setComments] = useState("");
  const [error, setError] = useState("");
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [loadingBooking, setLoadingBooking] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // Fetch bookings for this specific room only
    const fetchBookings = async () => {
      try {
        const res = await axios.get(
          `/karaoke-rooms/bookings?roomId=${room._id}`
        );
        const data = res.data;
        if (data.success) {
          setBookings(data.bookings);
        }
      } catch (err) {
        // Optionally handle error
      } finally {
        setLoadingBookings(false);
      }
    };
    fetchBookings();
  }, [room._id]);

  if (!room) return null;

  const maxPeople = room.maxPeople || 12;
  const pricePerHour =
    room && room.pricePerHour !== undefined ? room.pricePerHour : 60;
  const totalCost = pricePerHour * numberOfHours;

  // Helper: get day name from date string
  const getDayName = (dateStr) => {
    const date = new Date(dateStr);
    return [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ][date.getDay()];
  };

  // Use per-day availability if present
  const availableTimeSlots = useMemo(() => {
    if (room.availability && selectedDate) {
      const dayName = getDayName(selectedDate);
      return room.availability[dayName] || [];
    }
    return room.timeSlots || [];
  }, [room, selectedDate]);

  // Helper: get the Date object for a slot on a given date
  const getSlotDate = (dateStr, slot) => {
    const match = slot.match(/(\d+):(\d+) (AM|PM)/);
    if (!match) return null;
    const [_, slotHour, slotMinute, slotPeriod] = match;
    let hour = parseInt(slotHour, 10);
    if (slotPeriod === "PM" && hour !== 12) hour += 12;
    if (slotPeriod === "AM" && hour === 12) hour = 0;
    // TIMEZONE FIX: Create date as UTC to match database storage
    const slotDate = new Date(
      `${dateStr}T${hour.toString().padStart(2, "0")}:${slotMinute.padStart(
        2,
        "0"
      )}:00.000Z`
    );
    return slotDate;
  };

  // Helper function to convert time string to minutes since midnight
  const convertTimeToMinutes = (timeString) => {
    const match = timeString.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return 0;

    let [_, hourStr, minuteStr, period] = match;
    let hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);

    // Convert to 24-hour format
    if (period.toUpperCase() === "PM" && hour !== 12) hour += 12;
    if (period.toUpperCase() === "AM" && hour === 12) hour = 0;

    return hour * 60 + minute;
  };

  // Helper: get all booked slots for the selected date (overlapping logic)
  const getBookedTimesForDate = (dateStr) => {
    return availableTimeSlots.filter((slot) => {
      // Convert slot time to minutes
      const slotStart = convertTimeToMinutes(slot);

      // Check if this slot overlaps with any booking
      return bookings.some((b) => {
        // Only check bookings on the same date
        if (b.date !== dateStr) return false;

        // Convert booking time to minutes
        const bookingStart = convertTimeToMinutes(b.time);
        const bookingEnd = bookingStart + b.durationHours * 60;

        // Check if the slot time falls within the booking time range
        return slotStart >= bookingStart && slotStart < bookingEnd;
      });
    });
  };

  // Get all slots that would be blocked by the selected duration
  const getBlockedSlots = (dateStr) => {
    return availableTimeSlots.filter((slot) => {
      // Convert current slot time to minutes
      const slotStart = convertTimeToMinutes(slot);
      const slotEnd = slotStart + numberOfHours * 60;

      // Check for overlap with any booking on the same date
      const overlap = bookings.some((b) => {
        // Only check bookings on the same date
        if (b.date !== dateStr) return false;

        // Convert booking time to minutes
        const bookingStart = convertTimeToMinutes(b.time);
        const bookingEnd = bookingStart + b.durationHours * 60;

        // Check for overlap: (StartA < EndB) and (StartB < EndA)
        return slotStart < bookingEnd && bookingStart < slotEnd;
      });

      return overlap;
    });
  };
  const blockedSlots = selectedDate ? getBlockedSlots(selectedDate) : [];

  const bookedTimes = selectedDate ? getBookedTimesForDate(selectedDate) : [];

  // Check for conflicts
  const hasConflict = useMemo(() => {
    if (!selectedTime || !selectedDate || !numberOfHours) return false;

    return bookings.some((b) => {
      // Only check bookings on the same date
      if (b.date !== selectedDate) return false;

      // Convert times to minutes for comparison
      const selectedStart = convertTimeToMinutes(selectedTime);
      const selectedEnd = selectedStart + numberOfHours * 60;

      const bookingStart = convertTimeToMinutes(b.time);
      const bookingEnd = bookingStart + b.durationHours * 60;

      // Check for overlap: (StartA < EndB) and (StartB < EndA)
      return selectedStart < bookingEnd && bookingStart < selectedEnd;
    });
  }, [bookings, selectedTime, selectedDate, numberOfHours]);

  const handleAddToCart = () => {
    if (selectedDate && selectedTime) {
      // If it's a free booking (price is 0), book directly without going to cart
      if (pricePerHour === 0) {
        handleDirectBooking();
        return;
      }

      // Prepare cart item
      const cartItem = {
        type: "karaoke",
        title: "Karaoke Room",
        roomName: room.name,
        roomId: room._id, // Store roomId for potential future use
        imageUrl: room.imageUrl || "/home_images/karaoke1.png",
        date: selectedDate,
        time: selectedTime,
        duration: numberOfHours,
        people: numberOfPeople,
        totalCost,
        comments,
      };
      // Get existing cart from localStorage (common cart)
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      cart.push(cartItem);
      localStorage.setItem("cart", JSON.stringify(cart));
      // Redirect to cart page
      navigate("/cart");
    } else {
      setError("Please select a date and a start time to proceed.");
    }
  };

  const handleDirectBooking = async () => {
    try {
      setLoadingBooking(true);
      setError("");

      const bookingData = {
        customerName: user?.name || "Free Booking User",
        customerEmail: user?.email || "free@booking.com",
        customerPhone: user?.phone || "",
        numberOfPeople,
        date: selectedDate,
        time: selectedTime,
        durationHours: numberOfHours,
        totalPrice: 0,
        roomId: room._id,
        paymentId: "FREE_BOOKING",
        paymentStatus: "completed",
        comments,
      };

      const response = await axios.post("/karaoke-rooms/bookings", bookingData);

      if (response.data.success) {
        alert(
          "Free karaoke room booking confirmed successfully! You can now use your room."
        );
        setSelectedDate("");
        setSelectedTime("");
        setNumberOfPeople(2);
        setNumberOfHours(1);
        setComments("");
        // Refresh bookings to show the new booking
        const res = await axios.get("/karaoke-rooms/bookings");
        if (res.data.success) {
          setBookings(res.data.bookings);
        }
      }
    } catch (error) {
      console.error("Failed to book free karaoke room:", error);
      setError("Failed to book room. Please try again.");
    } finally {
      setLoadingBooking(false);
    }
  };

  // Helper: get all booked dates (for disabling in date picker)
  const bookedDatesSet = new Set(bookings.map((b) => b.date));

  // Helper: check if a date falls on an available week day
  const isDateAvailable = (dateStr) => {
    if (!room.weekDays || room.weekDays.length === 0) return true; // If no week days specified, allow all
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
    return room.weekDays.includes(dayName);
  };

  // Date input: disable dates that are fully booked (all slots taken) or not available
  const isDateFullyBooked = (dateStr) => {
    const bookedTimesForDate = getBookedTimesForDate(dateStr);
    return bookedTimesForDate.length >= availableTimeSlots.length;
  };

  // Helper: check if a date is within the blocked range
  const isDateBlocked = (dateStr) => {
    if (!room.blockStartDate || !room.blockEndDate) return false;
    const d = new Date(dateStr);
    const start = new Date(room.blockStartDate);
    const end = new Date(room.blockEndDate);
    // Normalize time to 00:00:00 for comparison
    d.setHours(0,0,0,0);
    start.setHours(0,0,0,0);
    end.setHours(0,0,0,0);
    return d >= start && d <= end;
  };

  const isDateDisabled = (dateStr) => {
    return !isDateAvailable(dateStr) || isDateFullyBooked(dateStr);
  };

  // For disabling dates in the date picker, we need to use min/max/step, but native input doesn't support disabling arbitrary dates.
  // We'll show a warning if the selected date is fully booked.

  return (
    <div className="bg-black/50 border border-pink-500/30 rounded-lg p-8 h-fit">
      <h3 className="font-['Orbitron'] text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-cyan-400">
        BOOK YOUR WONDERLAND EXPERIENCE
      </h3>

      <div className="space-y-6">
        {/* Number of People */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
            <Users className="h-4 w-4 text-pink-400" />
            Number of People (Max {maxPeople})
          </label>
          <select
            value={numberOfPeople}
            onChange={(e) => setNumberOfPeople(parseInt(e.target.value))}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-pink-500 focus:outline-none transition-colors"
          >
            {Array.from({ length: maxPeople }, (_, i) => i + 1).map((num) => (
              <option key={num} value={num}>
                {num} {num === 1 ? "person" : "people"}
              </option>
            ))}
          </select>
        </div>

        {/* Duration Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
            <Clock className="h-4 w-4 text-pink-400" />
            Select Duration
          </label>
          <select
            value={numberOfHours}
            onChange={(e) => setNumberOfHours(parseInt(e.target.value))}
            disabled={selectedDate && !isDateAvailable(selectedDate)}
            className={`w-full border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-pink-500 focus:outline-none transition-colors ${
              selectedDate && !isDateAvailable(selectedDate)
                ? "bg-gray-700 opacity-50 cursor-not-allowed"
                : "bg-gray-800"
            }`}
          >
            {Array.from({ length: 4 }, (_, i) => i + 1).map((num) => (
              <option key={num} value={num}>
                {num} {num === 1 ? "hour" : "hours"}
              </option>
            ))}
          </select>
        </div>

        {/* Date Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-pink-400" />
            Select Date *
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              setSelectedTime(""); // reset time when date changes
            }}
            min={new Date().toISOString().split("T")[0]}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-pink-500 focus:outline-none transition-colors cursor-pointer"
            onClick={(e) => e.target.showPicker()}
          />

          {/* Available Days Information */}
          <div className="mt-2 text-sm text-gray-400">
            <span className="font-medium text-green-400">Available on: </span>
            {room.weekDays && room.weekDays.length > 0 ? (
              room.weekDays.length === 7 ? (
                <span className="text-gray-300">All days</span>
              ) : (
                <span className="text-gray-300">
                  {room.weekDays.join(", ")}
                </span>
              )
            ) : (
              <span className="text-gray-300">All days</span>
            )}
          </div>

          {/* Blocked Date Message */}
          {selectedDate && isDateBlocked(selectedDate) && (
            <div className="text-red-400 text-sm mt-2">
              {room.blockNote || "This room is not available for booking on this date."}
            </div>
          )}

          {/* Not Available Day Message */}
          {selectedDate && !isDateAvailable(selectedDate) && !isDateBlocked(selectedDate) && (
            <div className="text-red-400 text-sm mt-2">
              This room is not available on {new Date(selectedDate).toLocaleDateString("en-US", { weekday: "long" })}. Please select another date.
            </div>
          )}
          {/* Fully Booked Message */}
          {selectedDate && isDateAvailable(selectedDate) && !isDateBlocked(selectedDate) && isDateFullyBooked(selectedDate) && (
            <div className="text-red-400 text-sm mt-2">
              All time slots are booked for this date. Please select another date.
            </div>
          )}
        </div>

        {/* Time Selection */}
        {selectedDate &&
          isDateAvailable(selectedDate) &&
          !isDateFullyBooked(selectedDate) &&
          !isDateBlocked(selectedDate) && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <Clock className="h-4 w-4 text-pink-400" />
                Select Start Time *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {availableTimeSlots.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    disabled={blockedSlots.includes(time)}
                    className={`p-3 border rounded-lg text-center transition-all duration-300 ${
                      blockedSlots.includes(time)
                        ? "opacity-50 cursor-not-allowed border-gray-700 bg-gray-800 text-gray-500"
                        : selectedTime === time
                        ? "border-pink-500 bg-pink-500/20 text-pink-400"
                        : "border-gray-700 hover:border-green-500 hover:bg-green-500/20 hover:text-green-400"
                    }`}
                  >
                    <Clock className="h-4 w-4 mx-auto mb-1" />
                    <span className="text-sm font-mono">{time}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

        {/* Booking Time Info */}
        {selectedTime && numberOfHours && (
          <div className="text-sm text-red-300 px-4 py-3 bg-red-900/30 rounded-lg border border-red-500/50">
            ⚠️ <strong>Actual karaoke time:</strong> {selectedTime} -{" "}
            {(() => {
              const match = selectedTime.match(/(\d+):(\d+) (AM|PM)/);
              if (!match) return selectedTime;
              const [_, hour, minute, period] = match;
              let endHour = parseInt(hour);
              if (period === "PM" && endHour !== 12) endHour += 12;
              if (period === "AM" && endHour === 12) endHour = 0;
              endHour += numberOfHours;
              let endMinute = parseInt(minute) - 5;
              if (endMinute < 0) {
                endMinute += 60;
                endHour -= 1;
              }

              // Handle day rollover (24+ hours)
              endHour = endHour % 24;

              let displayHour = endHour;
              let displayPeriod = "AM";
              if (endHour >= 12) {
                displayPeriod = "PM";
                if (endHour > 12) displayHour = endHour - 12;
              }
              if (endHour === 0) displayHour = 12;
              return `${displayHour}:${endMinute
                .toString()
                .padStart(2, "0")} ${displayPeriod}`;
            })()}{" "}
            (5 min reserved for cleaning)
          </div>
        )}

        {/* Comments Field */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
            <span className="text-pink-400">💬</span>
            Special Requests or Notes (Optional)
          </label>
          <textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="e.g., For 50th birthday, please decorate, special song requests, dietary requirements, etc."
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-pink-500 focus:outline-none transition-colors resize-none"
            rows={3}
            maxLength={500}
          />
          <div className="text-xs text-gray-500 mt-1 text-right">
            Max 500 characters
          </div>
        </div>

        {/* Total Cost */}
        <div className="border-t border-gray-700 pt-6">
          <div className="flex justify-between items-center text-lg mb-4">
            <span className="text-gray-300">
              Price (
              {(() => {
                // Calculate actual karaoke time (reduced by 5 minutes for cleaning)
                const totalMinutes = numberOfHours * 60 - 5;
                const hours = Math.floor(totalMinutes / 60);
                const minutes = totalMinutes % 60;

                if (hours === 0) {
                  return `${minutes}m`;
                } else if (minutes === 0) {
                  return `${hours}h`;
                } else {
                  return `${hours}:${minutes.toString().padStart(2, "0")}`;
                }
              })()}
              ):
            </span>
            <span className="text-white">
              {pricePerHour === 0 ? (
                <span className="text-green-400 font-bold">FREE</span>
              ) : (
                `$${totalCost}`
              )}
            </span>
          </div>
          <div className="flex justify-between items-center text-xl">
            <span className="text-gray-300 font-semibold">Total:</span>
            <span className="text-green-400 font-bold">
              {pricePerHour === 0 ? (
                <span className="text-green-400 font-bold">FREE</span>
              ) : (
                `$${totalCost}`
              )}
            </span>
          </div>
        </div>

        {/* Error Message */}
        {error && <p className="text-red-400 text-center text-sm">{error}</p>}

        {/* Booking Button */}
        <button
          onClick={handleAddToCart}
          disabled={
            !selectedDate ||
            !selectedTime ||
            !isDateAvailable(selectedDate) ||
            isDateFullyBooked(selectedDate) ||
            isDateBlocked(selectedDate) ||
            loadingBooking
          }
          className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold py-4 px-8 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl neon-glow-pink disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {loadingBooking ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2 inline-block"></div>
              BOOKING...
            </>
          ) : pricePerHour === 0 ? (
            "🎉 BOOK FREE ROOM"
          ) : (
            "🛒 ADD TO CART"
          )}
        </button>
      </div>
    </div>
  );
};

export default BookingForm;
