import React, { useEffect, useState } from "react";
import RoomInfo from "./RoomInfo";
import BookingForm from "./BookingForm";
import axios from "../../utils/axios";

/**
 * KaraokeBooking Component
 * * This component sets up the main layout for the karaoke booking page.
 * It arranges the RoomInfo and BookingForm components in a responsive grid.
 * Now fetches room data and passes it to children.
 * Supports multiple rooms with tabbed interface.
 */
const KaraokeBooking = () => {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await axios.get("/karaoke-rooms");
        const data = res.data;
        if (data.success && data.rooms.length > 0) {
          setRooms(data.rooms);
          setSelectedRoom(data.rooms[0]);
        } else {
          setError("No karaoke rooms found.");
        }
      } catch (err) {
        setError("Failed to fetch room info.");
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  if (loading)
    return <div className="text-center py-12">Loading room info...</div>;
  if (error)
    return <div className="text-center text-red-400 py-12">{error}</div>;
  if (!selectedRoom) return null;

  return (
    <div className="min-h-screen bg-gray-900 py-12 text-white">
      <div className="w-full sm:w-[90%] mx-auto px-2">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-['Orbitron'] text-3xl md:text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-cyan-400">
            🎤 KARAOKE ROOM BOOKING
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Choose your perfect karaoke room and book your unforgettable
            experience!
          </p>
        </div>

        {/* Room Selection Tabs */}
        {rooms.length > 1 && (
          <div className="mb-8">
            <div className="flex flex-wrap justify-center gap-3">
              {rooms.map((room) => (
                <button
                  key={room._id}
                  onClick={() => setSelectedRoom(room)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm ${
                    selectedRoom._id === room._id
                      ? "bg-gradient-to-r from-pink-500 to-cyan-400 text-white shadow-lg"
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white border border-gray-600"
                  }`}
                >
                  {room.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="flex flex-col-reverse lg:grid lg:grid-cols-2 gap-12">
          <RoomInfo room={selectedRoom} />
          <BookingForm room={selectedRoom} />
        </div>
      </div>
    </div>
  );
};

export default KaraokeBooking;
