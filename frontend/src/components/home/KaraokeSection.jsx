import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const KaraokeSection = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = [
    {
      src: "/home_images/karaoke1.png",
      alt: "Alice in Wonderland Karaoke Room",
    },
    {
      src: "/home_images/karaoke2.png",
      alt: "Karaoke Room Interior",
    },
    {
      src: "/home_images/karaoke3.png",
      alt: "Karaoke Room Setup",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="order-1 lg:order-2">
            <h2 className="font-['Orbitron'] text-3xl md:text-4xl font-bold mb-6 pt-8 pb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              Sing your heart out in our Karaoke room
            </h2>
            <p className="text-gray-300 text-lg mb-8 leading-relaxed">
              Step through the looking glass into our enchanting Alice in
              Wonderland-themed karaoke room! Perfect for parties, celebrations,
              or just a magical night out. Equipped with 4 high-quality
              microphones and a massive library of songs—sing your heart out in
              a whimsical wonderland setting.
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span className="text-gray-300">1hr plus bookings</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                <span className="text-gray-300">Words on big screen</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                <span className="text-gray-300">4 Wireless microphones</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-gray-300">Food packages</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <span className="text-gray-300">
                  Birthdays, hens, bucks or for fun
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                <span className="text-gray-300">
                  Private only for your group
                </span>
              </div>
            </div>

            <Link
              to="/karaoke-booking"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold rounded-lg text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl neon-glow-pink"
            >
              🎤 BOOK KARAOKE ROOM
            </Link>
          </div>

          <div className="order-2 lg:order-1 relative">
            <img
              src={images[currentImageIndex].src}
              alt={images[currentImageIndex].alt}
              className="w-full h-48 object-cover rounded-lg transition-opacity duration-500"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/home_images/karaoke1.png";
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

export default KaraokeSection;
