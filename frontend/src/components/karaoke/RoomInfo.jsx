import React, { useState } from "react";
import {
  Clock,
  Mic,
  Music,
  Star,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

/**
 * RoomInfo Component
 * * This component displays all the informational content about the karaoke room, now receives data as a prop.
 */
const RoomInfo = ({ room }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!room) return null;

  // Combine main image with additional images
  const allImages = [room.imageUrl, ...(room.images || [])].filter(Boolean);

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === allImages.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? allImages.length - 1 : prev - 1
    );
  };

  return (
    <div className="space-y-8">
      {/* Main Image and Description */}
      <div className="bg-black/50 border border-pink-500/30 rounded-lg overflow-hidden">
        {allImages.length > 0 ? (
          <div className="relative">
            <img
              src={allImages[currentImageIndex]}
              alt={room.name}
              className="w-full h-64 object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/home_images/karaoke1.png";
              }}
            />
            {allImages.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-200"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-200"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {allImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all duration-200 ${
                        index === currentImageIndex
                          ? "bg-white"
                          : "bg-white/50 hover:bg-white/75"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <img
            src="/home_images/karaoke1.png"
            alt={room.name}
            className="w-full h-64 object-cover"
          />
        )}
        <div className="p-6">
          <h2 className="font-['Orbitron'] text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
            {room.name}
          </h2>
          <p className="text-gray-300 mb-4">{room.description}</p>
          {/* If you want to show time slot info, you can add here */}
        </div>
      </div>

      {/* What's Included Section */}
      <div className="bg-black/50 border border-green-500/30 rounded-lg p-6">
        <h3 className="font-['Orbitron'] text-xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400">
          ✨ What's Included
        </h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <Mic className="h-5 w-5 text-pink-400" />
            <span className="text-gray-300">
              {room.inclusions?.microphones || 0} professional microphones
            </span>
          </div>
          {room.inclusions?.features?.map((feature, idx) => (
            <div className="flex items-center space-x-3" key={idx}>
              <Music className="h-5 w-5 text-cyan-400" />
              <span className="text-gray-300">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing Section */}
      <div className="bg-black/50 border border-purple-500/30 rounded-lg p-6">
        <h3 className="font-['Orbitron'] text-xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
          🕒 Booking Options
        </h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center p-4 bg-gray-800/50 rounded-lg">
            <div>
              <span className="text-white font-semibold">{room.name}</span>
              <p className="text-gray-400 text-sm">Price per hour of singing</p>
            </div>
            <span className="text-2xl font-bold text-green-400">
              {room.pricePerHour === 0 ? (
                <span className="text-green-400 font-bold">FREE</span>
              ) : (
                `$${room.pricePerHour}`
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Contact Info Section */}
      <div className="bg-black/50 border border-cyan-500/30 rounded-lg p-6">
        <h3 className="font-['Orbitron'] text-xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-green-400">
          📅 Need More Options?
        </h3>
        <p className="text-gray-300 mb-4">
          Need more time, planning a weekday event, or have special questions?
          Contact us — we're happy to help tailor your Wonderland experience.
        </p>
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <Phone className="h-4 w-4 text-green-400" />
            <a
              href="tel:+61493091188"
              className="text-gray-300 hover:text-green-400 transition-colors"
            >
              +61 493 091 188
            </a>
          </div>
          <div className="flex items-center space-x-3">
            <Mail className="h-4 w-4 text-cyan-400" />
            <a
              href="mailto:info@8bitbar.com.au"
              className="text-gray-300 hover:text-cyan-400 transition-colors"
            >
              info@8bitbar.com.au
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomInfo;
