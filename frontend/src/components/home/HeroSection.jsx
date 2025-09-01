import React from "react";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="relative min-h-[30vh] md:min-h-[60vh] flex items-center justify-center overflow-hidden py-8">
      {/* Background with overlay */}
      <div className="absolute inset-0">
        {/* Background image with reduced opacity */}
        <div className="absolute inset-0 z-0">
          <img
            src="/home_images/hero_background_image.png"
            alt="8-Bit Bar Background"
            className="w-full h-full object-cover opacity-40"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/60 via-pink-900/60 to-cyan-900/60 z-10"></div>
        <div className="absolute inset-0 bg-black/50 z-20"></div>
        {/* Animated background elements */}
        <div className="absolute top-20 left-10 w-4 h-4 bg-pink-500 rounded-full animate-pulse neon-glow-pink z-30"></div>
        <div className="absolute top-40 right-20 w-6 h-6 bg-green-400 rounded-full animate-pulse neon-glow-green z-30"></div>
        <div className="absolute bottom-32 left-1/4 w-3 h-3 bg-cyan-400 rounded-full animate-pulse neon-glow-cyan z-30"></div>
        <div className="absolute bottom-20 right-1/3 w-5 h-5 bg-pink-500 rounded-full animate-pulse neon-glow-pink z-30"></div>
      </div>

      <div className="relative z-40 text-center max-w-4xl mx-auto px-4">
        {/* Logo */}
        <div className="mb-6 flex justify-center">
          <img
            src="/home_images/logo.png"
            alt="8-Bit Bar Logo"
            className="h-16 md:h-20 w-auto transition-transform duration-300 hover:scale-105"
          />
        </div>

        <h1 className="font-press-start text-2xl md:text-5xl lg:text-6xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-green-400 to-cyan-400 neon-text-multicolor">
          8-BIT BAR
        </h1>
        <p className="text-lg md:text-xl text-gray-300 mb-3 max-w-2xl mx-auto leading-relaxed">
          8-Bit Bar, the place to be in Hervey Bay.
        </p>
        <p className="text-base md:text-lg text-cyan-400 mb-2">
          Fri & Sat 2pm midnight, Sun 2pm till late
        </p>
        <p className="text-sm text-yellow-400 mb-6">
          Under 18's welcome Fri & Sat till 6pm and all day Sunday
        </p>
        <p className="text-sm md:text-base text-gray-300 mb-6 max-w-2xl mx-auto leading-relaxed">
          Join us for an unforgettable night of gaming, drinks, and nostalgia.
          Book your Alice in Wonderland karaoke experience now!
        </p>
        <div className="flex flex-row gap-2 justify-center">
          <Link
            to="/karaoke-booking"
            className="px-3 py-1.5 md:px-6 md:py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold rounded-lg text-xs md:text-base transition-all duration-300 hover:scale-105 hover:shadow-2xl neon-glow-pink flex items-center justify-center gap-1"
          >
            <span className="text-xs md:text-lg">🎤</span>
            <span>BOOK KARAOKE</span>
          </Link>
          <Link
            to="/n64-booth-booking"
            className="px-3 py-1.5 md:px-6 md:py-3 bg-gradient-to-r from-green-500 to-cyan-600 text-white font-bold rounded-lg text-xs md:text-base transition-all duration-300 hover:scale-105 hover:shadow-2xl neon-glow-green flex items-center justify-center gap-1"
          >
            <span className="text-xs md:text-lg">🎮</span>
            <span>BOOK N64 BOOTH</span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
