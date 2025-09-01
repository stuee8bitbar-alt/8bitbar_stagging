import React, { useState, useEffect } from "react";
import api from "../../../utils/axios";
import { useNavigate } from "react-router-dom";
import { Pencil, Plus, Trash2, Eye, EyeOff, Play, Pause } from "lucide-react";

const KaraokeRoomsAdmin = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingRoom, setDeletingRoom] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/karaoke/karaoke-rooms");
      setRooms(response.data.rooms || []);
    } catch (error) {
      console.error("Error fetching karaoke rooms:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm("Are you sure you want to delete this room?")) {
      return;
    }

    try {
      setDeletingRoom(roomId);
      await api.delete(`/admin/karaoke/karaoke-rooms/${roomId}`);
      await fetchRooms(); // Refresh the list
    } catch (error) {
      console.error("Error deleting room:", error);
      alert("Failed to delete room");
    } finally {
      setDeletingRoom(null);
    }
  };

  const handleToggleVisibility = async (roomId, currentVisibility) => {
    try {
      await api.patch(`/admin/karaoke/karaoke-rooms/${roomId}/visibility`, {
        isVisible: !currentVisibility,
      });
      await fetchRooms(); // Refresh the list
    } catch (error) {
      console.error("Error toggling visibility:", error);
      alert("Failed to toggle visibility");
    }
  };

  const handleToggleActive = async (roomId, currentActive) => {
    try {
      await api.patch(`/admin/karaoke/karaoke-rooms/${roomId}/active`, {
        isActive: !currentActive,
      });
      await fetchRooms(); // Refresh the list
    } catch (error) {
      console.error("Error toggling active status:", error);
      alert("Failed to toggle active status");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-24 w-24 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-2 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Karaoke Rooms
          </h1>
          <button
            onClick={() => navigate("/admin/karaoke/karaoke-room/create")}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Room
          </button>
        </div>

        <div className="space-y-6">
          {rooms.map((room) => (
            <div
              key={room._id}
              className="bg-white rounded-xl shadow-md overflow-hidden md:flex"
            >
              <div className="md:w-48">
                <img
                  src={room.imageUrl || "/home_images/karaoke1.png"}
                  alt={room.name}
                  className="w-full h-48 object-cover md:h-full"
                />
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <h2 className="text-xl font-bold text-indigo-600">
                      {room.name}
                    </h2>
                    <div className="flex-shrink-0 flex gap-2">
                      <button
                        onClick={() =>
                          handleToggleVisibility(room._id, room.isVisible)
                        }
                        className={`p-2 rounded-md transition-colors ${
                          room.isVisible
                            ? "text-green-600 hover:text-green-800 hover:bg-green-100"
                            : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                        }`}
                        title={
                          room.isVisible
                            ? "Hide from customers"
                            : "Show to customers"
                        }
                      >
                        {room.isVisible ? (
                          <Eye size={20} />
                        ) : (
                          <EyeOff size={20} />
                        )}
                      </button>
                      <button
                        onClick={() =>
                          handleToggleActive(room._id, room.isActive)
                        }
                        className={`p-2 rounded-md transition-colors ${
                          room.isActive
                            ? "text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                            : "text-orange-400 hover:text-orange-600 hover:bg-orange-100"
                        }`}
                        title={
                          room.isActive ? "Deactivate room" : "Activate room"
                        }
                      >
                        {room.isActive ? (
                          <Pause size={20} />
                        ) : (
                          <Play size={20} />
                        )}
                      </button>
                      <button
                        onClick={() =>
                          navigate(
                            `/admin/karaoke/karaoke-room/edit?id=${room._id}`
                          )
                        }
                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"
                        title="Edit room"
                      >
                        <Pencil size={20} />
                      </button>
                      <button
                        onClick={() => handleDeleteRoom(room._id)}
                        disabled={deletingRoom === room._id}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-md disabled:opacity-50"
                        title="Delete room"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">
                    {room.description}
                  </p>

                  <dl className="mt-4 grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Capacity
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {room.maxPeople} people
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Price
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        ${room.pricePerHour} / hour
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Microphones
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {room.inclusions?.microphones}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Features
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {room.inclusions?.features?.join(", ") || "N/A"}
                      </dd>
                    </div>
                  </dl>

                  {/* Status Indicators */}
                  <div className="mt-4 flex gap-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        room.isVisible
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {room.isVisible ? "Visible" : "Hidden"}
                    </span>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        room.isActive
                          ? "bg-blue-100 text-blue-800"
                          : "bg-orange-100 text-orange-800"
                      }`}
                    >
                      {room.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-500">
                    Time Slots
                  </h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {room.timeSlots?.map((slot) => (
                      <span
                        key={slot}
                        className="px-2.5 py-1 text-xs font-semibold text-indigo-800 bg-indigo-100 rounded-full"
                      >
                        {slot}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default KaraokeRoomsAdmin;
