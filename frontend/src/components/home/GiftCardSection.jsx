import React from "react";
import { Link } from "react-router-dom";
import { GiftIcon, StarIcon } from "@heroicons/react/24/outline";

const GiftCardSection = () => {
  const renderStars = () => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon key={i} className="w-4 h-4 text-yellow-400" />
    ));
  };

  return (
    <div className="py-16 bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Perfect Gift for Gamers
          </h2>
          <p className="text-xl text-purple-200">
            Give the gift of gaming, karaoke, and fun at 8-BIT BAR
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Sample Gift Cards */}
          <div className="bg-white rounded-lg shadow-xl overflow-hidden transform hover:scale-105 transition-transform duration-300">
            <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 p-6 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="text-2xl font-bold mb-2">GIFT CARD</div>
                <div className="text-sm opacity-90 mb-2">GFT-101</div>
                <div className="w-full bg-white bg-opacity-20 h-1 mb-2"></div>
                <div className="text-lg font-bold">8-BIT BAR</div>
                <div className="text-xs opacity-75">NO EXPIRY</div>
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Gift card $50
              </h3>
              <div className="flex items-center mb-3">{renderStars()}</div>
              <div className="text-2xl font-bold text-purple-600 mb-4">
                $50.00
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-xl overflow-hidden transform hover:scale-105 transition-transform duration-300">
            <div className="h-48 bg-gradient-to-br from-green-500 to-teal-600 p-6 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="text-2xl font-bold mb-2">GIFT CARD</div>
                <div className="text-sm opacity-90 mb-2">GFT-102</div>
                <div className="w-full bg-white bg-opacity-20 h-1 mb-2"></div>
                <div className="text-lg font-bold">8-BIT BAR</div>
                <div className="text-xs opacity-75">NO EXPIRY</div>
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Gift card $100
              </h3>
              <div className="flex items-center mb-3">{renderStars()}</div>
              <div className="text-2xl font-bold text-purple-600 mb-4">
                $100.00
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-xl overflow-hidden transform hover:scale-105 transition-transform duration-300">
            <div className="h-48 bg-gradient-to-br from-pink-500 to-rose-600 p-6 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="text-2xl font-bold mb-2">GIFT CARD</div>
                <div className="text-sm opacity-90 mb-2">CUSTOM</div>
                <div className="w-full bg-white bg-opacity-20 h-1 mb-2"></div>
                <div className="text-lg font-bold">8-BIT BAR</div>
                <div className="text-xs opacity-75">NO EXPIRY</div>
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Custom Amount
              </h3>
              <div className="flex items-center mb-3">{renderStars()}</div>
              <div className="text-2xl font-bold text-purple-600 mb-4">
                Your Choice
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Link
            to="/gift-cards"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-lg rounded-lg hover:from-purple-600 hover:to-pink-500 transition-all duration-300 transform hover:scale-105"
          >
            <GiftIcon className="w-6 h-6 mr-2" />
            Shop Gift Cards
          </Link>
        </div>

        <div className="mt-12 text-center text-purple-200">
          <p className="text-lg">
            Perfect for birthdays, holidays, or any special occasion
          </p>
          <p className="text-sm mt-2 opacity-75">
            No expiration date • Use for any service • Great for gamers and
            entertainment lovers
          </p>
        </div>
      </div>
    </div>
  );
};

export default GiftCardSection;
