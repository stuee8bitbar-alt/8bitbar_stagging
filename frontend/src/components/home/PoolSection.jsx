import React from "react";
import { Link } from "react-router-dom";

const PoolSection = () => {
  return (
    <section className="bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-['Orbitron'] text-3xl md:text-4xl font-bold mb-6 pt-8 pb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
              FREE pool!
            </h2>
            <h3 className="text-2xl font-bold text-white mb-6">
              FREE Pool Table – Play Today!
            </h3>
            <p className="text-gray-300 text-lg mb-8 leading-relaxed">
              Enjoy a game of pool on the house! Just buy a drink at the bar to
              play. No charge for the table – just grab your favorite beer,
              cocktail, or soft drink and rack 'em up.
            </p>

            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-6 mb-8">
              <p className="text-yellow-400 font-semibold mb-2">Please note:</p>
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span className="text-gray-300">Must be 18+ to play</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                  <span className="text-gray-300">
                    One drink purchase required per player
                  </span>
                </div>
              </div>
            </div>

            {/* Removed VIEW DRINKS MENU button */}
          </div>

          <div className="flex justify-center">
            <img
              src="/home_images/pooltable.png"
              alt="FREE Pool Table at 8-Bit Bar"
              className="w-full max-w-md h-96 object-cover rounded-lg shadow-2xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default PoolSection;
