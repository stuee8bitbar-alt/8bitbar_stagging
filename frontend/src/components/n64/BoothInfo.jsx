import React, { useEffect, useState } from "react";
import { Gamepad2, Star, Users, ChevronLeft, ChevronRight } from "lucide-react";
import axios from "../../utils/axios";

/**
 * BoothInfo Component
 * Displays all static information about the N64 booths, including
 * features, pricing, and images from all available booths.
 */
const BoothInfo = () => {
  const [booths, setBooths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    async function fetchBooths() {
      try {
        setLoading(true);
        const res = await axios.get("/n64-rooms");
        if (res.data && res.data.booths && res.data.booths.length > 0) {
          setBooths(res.data.booths);
        } else {
          setError("No booth info available.");
        }
      } catch (err) {
        setError("Failed to load booth info.");
      } finally {
        setLoading(false);
      }
    }
    fetchBooths();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-500"></div>
      </div>
    );
  }
  if (error) {
    return <div className="text-center text-red-400 py-8">{error}</div>;
  }
  if (!booths || booths.length === 0) return null;

  // Combine all images from all booths
  const allImages = booths.reduce((acc, booth) => {
    const boothImages = [booth.imageUrl, ...(booth.images || [])].filter(
      Boolean
    );
    return [...acc, ...boothImages];
  }, []);

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
      {/* Main Image */}
      <div className="bg-black/50 border border-pink-500/30 rounded-lg overflow-hidden">
        {allImages.length > 0 ? (
          <div className="relative">
            <img
              src={allImages[currentImageIndex]}
              alt="N64 Gaming Booth"
              className="w-full h-64 object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/home_images/n64booth1.png";
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
            src="/home_images/n64booth1.png"
            alt="N64 Gaming Booth"
            className="w-full h-64 object-cover"
          />
        )}
        <div className="p-6">
          <h2 className="font-['Orbitron'] text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
            N64 Gaming Booths
          </h2>
          <p className="text-gray-300 mb-4">
            Experience classic Nintendo 64 gaming in our themed booths - Mickey
            Mouse and Minnie Mouse rooms available!
          </p>
        </div>
      </div>

      {/* Includes Section */}
      <div className="bg-black/50 border border-green-500/30 rounded-lg p-6">
        <h3 className="font-['Orbitron'] text-xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400">
          ✨ What's Included
        </h3>
        <div className="space-y-4">
          {booths.map((booth, boothIdx) => (
            <div key={booth._id} className="mb-6">
              <h4 className="text-lg font-semibold text-white mb-3">
                {booth.name}
              </h4>
              {booth.inclusions?.features?.map((feature, idx) => (
                <div className="flex items-center space-x-3 ml-4" key={idx}>
                  {idx === 0 && <Gamepad2 className="h-5 w-5 text-pink-400" />}
                  {idx === 1 && <Star className="h-5 w-5 text-cyan-400" />}
                  {idx === 2 && <Users className="h-5 w-5 text-yellow-400" />}
                  {idx > 2 && <Star className="h-5 w-5 text-cyan-400" />}
                  <span className="text-gray-300">{feature}</span>
                </div>
              ))}
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
          {booths.map((booth) => (
            <div
              key={booth._id}
              className="flex justify-between items-center p-4 bg-gray-800/50 rounded-lg"
            >
              <div>
                <span className="text-white font-semibold">{booth.name}</span>
                <p className="text-gray-400 text-sm">
                  Perfect for a retro gaming throwback
                </p>
              </div>
              <span className="text-2xl font-bold text-green-400">
                ${booth.pricePerHour}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BoothInfo;
