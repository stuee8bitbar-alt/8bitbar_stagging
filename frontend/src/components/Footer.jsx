import React from "react";
import {
  Facebook,
  Instagram,
  MapPin,
  Phone,
  Mail,
  ExternalLink,
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-black border-t border-pink-500/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <img
                src="/home_images/logo.png"
                alt="8-Bit Bar Logo"
                className="h-10 w-auto"
              />
            </div>
            <p className="text-gray-400 mb-6 max-w-md">
              8-Bit Bar, the place to be in Hervey Bay. The ultimate fusion of
              classic arcade thrills and delicious tapas bites. Eat, Drink,
              Play, Repeat – Only at 8 Bit Bar.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://www.facebook.com/8bitbarHB"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-pink-400 transition-colors"
              >
                <Facebook className="h-6 w-6" />
              </a>
              <a
                href="https://www.instagram.com/8bitbarhb/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-pink-400 transition-colors"
              >
                <Instagram className="h-6 w-6" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-['Orbitron'] text-lg font-bold text-green-400 mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="/karaoke-booking"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Karaoke Room
                </a>
              </li>
              <li>
                <a
                  href="/n64-booth-booking"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  N64 Booth
                </a>
              </li>
              <li>
                <a
                  href="/events"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Events
                </a>
              </li>
              <li>
                <a
                  href="/gallery"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Gallery
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-['Orbitron'] text-lg font-bold text-cyan-400 mb-4">
              Contact
            </h3>
            <div className="space-y-3 text-gray-400">
              <a
                href="https://maps.google.com/?q=-25.2846586,152.8551759"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start space-x-2 hover:text-white transition-colors group"
              >
                <MapPin className="h-4 w-4 text-pink-400 mt-1 flex-shrink-0 group-hover:text-pink-300" />
                <div>
                  <p className="text-white font-semibold">8-Bit Bar</p>
                  <p>1/352 Esplanade, Scarness</p>
                  <p>QLD 4655</p>
                </div>
                <ExternalLink className="h-3 w-3 text-gray-500 group-hover:text-gray-300" />
              </a>

              <a
                href="tel:+61493091188"
                className="flex items-center space-x-2 hover:text-white transition-colors group"
              >
                <Phone className="h-4 w-4 text-green-400 group-hover:text-green-300" />
                <span>+61 493 091 188</span>
              </a>

              <a
                href="mailto:info@8bitbar.com.au"
                className="flex items-center space-x-2 hover:text-white transition-colors group"
              >
                <Mail className="h-4 w-4 text-cyan-400 group-hover:text-cyan-300" />
                <span>info@8bitbar.com.au</span>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2025 8-Bit Bar. All rights reserved. Game on! 🎮</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
