import React from "react";

const MaintenancePage = () => {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="text-center max-w-2xl mx-auto">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <img
            src="/home_images/logo.png"
            alt="8-Bit Bar Logo"
            className="h-20 w-auto"
          />
        </div>

        {/* Maintenance Icon */}
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto bg-gradient-to-r from-pink-500 to-cyan-400 rounded-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
        </div>

        {/* Main Heading */}
        <h1 className="font-['Orbitron'] text-3xl md:text-5xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-cyan-400">
          WEBSITE UNDER MAINTENANCE
        </h1>

        {/* Subheading */}
        <h2 className="text-xl md:text-2xl text-white mb-6 font-semibold">
          🚧 We're working on something awesome! 🚧
        </h2>

        {/* Description */}
        <p className="text-gray-300 text-lg mb-8 leading-relaxed">
          Our website is currently undergoing maintenance and improvements.
          We're working hard to bring you an even better gaming experience!
        </p>

        {/* Estimated Time */}
        <div className="bg-gray-800/50 border border-pink-500/30 rounded-lg p-6 mb-8">
          <p className="text-pink-400 font-semibold mb-2">
            ⏰ Estimated Completion:
          </p>
          <p className="text-gray-300">We'll be back online soon!</p>
        </div>

        {/* What We're Working On */}
        <div className="bg-gray-800/50 border border-cyan-500/30 rounded-lg p-6 mb-8">
          <p className="text-cyan-400 font-semibold mb-3">
            🛠️ What We're Working On:
          </p>
          <ul className="text-gray-300 text-left space-y-2">
            <li className="flex items-center">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
              Website performance improvements
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
              Enhanced booking system
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-purple-400 rounded-full mr-3"></span>
              Better user experience
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="bg-gray-800/50 border border-green-500/30 rounded-lg p-6 mb-8">
          <p className="text-green-400 font-semibold mb-3">
            📞 Need to reach us?
          </p>
          <p className="text-gray-300 mb-2">
            For urgent bookings or enquiry, please contact us directly:
          </p>
          <div className="space-y-2 text-gray-300">
            <p>📱 Phone: +61 493 091 188</p>
            <p>📧 Email: info@8bitbar.com.au</p>
            <p>📍 Location: 1/352 Esplanade, Scarness, QLD 4655</p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-gray-500 text-sm">
          <p>Thank you for your patience!</p>
          <p className="mt-1">© 2025 8-Bit Bar. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default MaintenancePage;
