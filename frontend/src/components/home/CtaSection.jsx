import React from "react";
import { Link } from "react-router-dom";
import { Camera } from "lucide-react";

const CtaSection = () => {
  return (
    <section className="bg-gradient-to-r from-purple-900/20 to-pink-900/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="font-['Orbitron'] text-3xl md:text-4xl font-bold mb-6 pt-8 pb-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-cyan-400">
          READY PLAYER ONE?
        </h2>
        <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
          Join us for an unforgettable night of gaming, drinks, and nostalgia.
          Book your Alice in Wonderland karaoke experience now!
        </p>
        <div className="flex justify-center">
          <Link
            to="/gallery"
            className="inline-flex items-center px-8 py-4 border-2 border-pink-500 text-pink-500 font-bold rounded-lg text-lg transition-all duration-300 hover:bg-pink-500 hover:text-white hover:scale-105 neon-glow-pink"
          >
            <Camera className="mr-2 h-5 w-5" />
            VIEW GALLERY
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CtaSection;
