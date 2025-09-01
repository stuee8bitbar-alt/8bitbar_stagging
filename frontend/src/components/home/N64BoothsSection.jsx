import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const N64BoothsSection = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = [
    {
      src: "/home_images/n64booth1.png",
      alt: "N64 Gaming Booth",
    },
    {
      src: "/home_images/n64booth2.png",
      alt: "N64 Booth Interior",
    },
    {
      src: "/home_images/n64booth3.png",
      alt: "Mario Kart N64",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-['Orbitron'] text-3xl md:text-4xl font-bold mb-6 pt-8 pb-4 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400">
              N64 booths for hire!
            </h2>
            <p className="text-gray-300 text-lg mb-8 leading-relaxed">
              Get your retro game on with our N64 gaming booths – Mickey &
              Minnie! Each booth includes a classic Nintendo 64 console, 4
              controllers, and your choice of multiple legendary games. Perfect
              for friendly battles, or nostalgic throwbacks.
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-gray-300">Booth booked 1hr sessions</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                <span className="text-gray-300">
                  2 booths "Mickey & Minnie"
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                <span className="text-gray-300">
                  multiple multiplayer games to pick from
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <span className="text-gray-300">Genuine original N64</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span className="text-gray-300">Food packages</span>
              </div>
            </div>

            <Link
              to="/n64-booth-booking"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-500 to-cyan-600 text-white font-bold rounded-lg text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl neon-glow-green"
            >
              🎮 BOOK N64 BOOTH
            </Link>
          </div>

          <div className="relative">
            <img
              src={images[currentImageIndex].src}
              alt={images[currentImageIndex].alt}
              className="w-full h-48 object-cover rounded-lg transition-opacity duration-500"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/home_images/n64booth1.png";
              }}
            />
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {images.map((_, index) => (
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
          </div>
        </div>
      </div>
    </section>
  );
};

export default N64BoothsSection;
