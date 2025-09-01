import React, { useEffect, useState } from "react";
import BoothInfo from "./BoothInfo";
import BookingForm from "./BookingForm";
import axios from "../../utils/axios";

/**
 * N64Booking Component
 * Sets up the main layout, including the header and the responsive
 * two-column grid for the information and booking form.
 * Now fetches booth and booking data and passes to children.
 */
const N64Booking = () => {
  const [booths, setBooths] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [boothRes, bookingRes] = await Promise.all([
          axios.get("/n64-rooms"),
          axios.get("/n64-rooms/bookings"),
        ]);
        const boothData = boothRes.data;
        const bookingData = bookingRes.data;
        if (boothData.success && bookingData.success) {
          setBooths(boothData.booths);
          setBookings(bookingData.bookings);
        } else {
          setError("Failed to load booth or booking data.");
        }
      } catch (err) {
        setError("Failed to fetch booth or booking data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading)
    return <div className="text-center py-12">Loading N64 booth info...</div>;
  if (error)
    return <div className="text-center text-red-400 py-12">{error}</div>;
  if (!booths.length) return null;

  return (
    <div className="min-h-screen bg-gray-900 py-12 text-white">
      <div className="w-full sm:w-[90%] mx-auto px-2 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-['Orbitron'] text-3xl md:text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-cyan-400">
            🎮 N64 BOOTH BOOKING
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Book your retro gaming session in one of our premium N64 booths.
            Choose between Mickey and Minnie booths!
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="flex flex-col-reverse lg:grid lg:grid-cols-2 gap-12">
          <BoothInfo booths={booths} />
          <BookingForm booths={booths} bookings={bookings} />
        </div>
      </div>
    </div>
  );
};

export default N64Booking;
