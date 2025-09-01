import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useModal } from "../contexts/ModalContext";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  const { openLogin, openSignup } = useModal();

  const navItems = [
    { path: "/", label: "Home" },
    { path: "/karaoke-booking", label: "Karaoke Room" },
    { path: "/n64-booth-booking", label: "N64 Booth" },
    // { path: "/cafe-booking", label: "Ticket Show" },
    { path: "/gift-cards", label: "Gift Cards" },
    { path: "/contact", label: "Contact" },
  ];

  // Add admin panel to nav items if user is superadmin, staff panel if admin
  const getAdminNavItems = () => {
    if (user?.role === "superadmin") {
      return [...navItems, { path: "/admin", label: "Admin Panel" }];
    } else if (user?.role === "admin") {
      return [...navItems, { path: "/staff/login", label: "Staff Panel" }];
    }
    return navItems;
  };

  const adminNavItems = getAdminNavItems();

  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-black/90 backdrop-blur-md border-b border-pink-500/30 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <img
              src="/home_images/logo.png"
              alt="8-Bit Bar Logo"
              className="h-10 w-auto transition-transform duration-300 group-hover:scale-105"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8 items-center">
            {adminNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`relative px-3 py-2 text-sm font-medium transition-all duration-300 ${
                  item.label === "Admin Panel" || item.label === "Staff Panel"
                    ? isActive(item.path)
                      ? "text-orange-400 neon-text-orange"
                      : "text-orange-300 hover:text-orange-400"
                    : isActive(item.path)
                    ? "text-cyan-400 neon-text-cyan"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                {item.label}
                {isActive(item.path) && (
                  <div
                    className={`absolute bottom-0 left-0 w-full h-0.5 ${
                      item.label === "Admin Panel" ||
                      item.label === "Staff Panel"
                        ? "bg-gradient-to-r from-orange-500 to-red-400 neon-glow-orange"
                        : "bg-gradient-to-r from-pink-500 to-cyan-400 neon-glow-cyan"
                    }`}
                  ></div>
                )}
              </Link>
            ))}
            {/* Cart Icon */}
            <Link
              to="/cart"
              className="ml-2 px-3 py-2 hover:text-cyan-400 transition-colors relative"
            >
              Cart
            </Link>
            {/* Auth Buttons (Desktop) */}
            {!user ? (
              <>
                <button
                  onClick={openLogin}
                  className="ml-6 px-6 py-2 bg-gradient-to-r from-pink-500 to-cyan-400 text-white font-orbitron text-base rounded-md font-semibold transition-all duration-200 hover:from-cyan-400 hover:to-pink-500"
                >
                  Login
                </button>
                <button
                  onClick={openSignup}
                  className="ml-2 px-6 py-2 bg-gradient-to-r from-cyan-400 to-pink-500 text-white font-orbitron text-base rounded-md font-semibold transition-all duration-200 hover:from-pink-500 hover:to-cyan-400"
                >
                  Sign Up
                </button>
              </>
            ) : (
              <div className="flex items-center ml-6 space-x-3">
                <span className="text-gray-200 font-medium">{user.name}</span>
                <Link
                  to="/account"
                  className="ml-2 px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
                >
                  Account
                </Link>
                <button
                  onClick={logout}
                  className="ml-2 px-3 py-1 bg-gray-700 text-white rounded-md hover:bg-gray-800 text-sm"
                >
                  Logout
                </button>
              </div>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-700">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {adminNavItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-3 py-2 text-base font-medium transition-colors ${
                    item.label === "Admin Panel" || item.label === "Staff Panel"
                      ? isActive(item.path)
                        ? "text-orange-400 bg-gray-800"
                        : "text-orange-300 hover:text-orange-400 hover:bg-gray-800"
                      : isActive(item.path)
                      ? "text-cyan-400 bg-gray-800"
                      : "text-gray-300 hover:text-white hover:bg-gray-800"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              {/* Cart Icon (Mobile) */}
              <Link
                to="/cart"
                onClick={() => setIsMenuOpen(false)}
                className="block px-3 py-2 text-base font-medium text-gray-300 hover:text-cyan-400 hover:bg-gray-800"
              >
                Cart
              </Link>
              {/* Auth Buttons (Mobile) */}
              {!user ? (
                <div className="flex flex-col gap-2 mt-4">
                  <button
                    onClick={() => {
                      openLogin();
                      setIsMenuOpen(false);
                    }}
                    className="w-full px-6 py-2 bg-gradient-to-r from-pink-500 to-cyan-400 text-white font-orbitron text-base rounded-md font-semibold transition-all duration-200 hover:from-cyan-400 hover:to-pink-500"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => {
                      openSignup();
                      setIsMenuOpen(false);
                    }}
                    className="w-full px-6 py-2 bg-gradient-to-r from-cyan-400 to-pink-500 text-white font-orbitron text-base rounded-md font-semibold transition-all duration-200 hover:from-pink-500 hover:to-cyan-400"
                  >
                    Sign Up
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3 mt-4">
                  <span className="text-gray-200 font-medium">{user.name}</span>
                  <Link
                    to="/account"
                    onClick={() => setIsMenuOpen(false)}
                    className="px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
                  >
                    Account
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className="px-3 py-1 bg-gray-700 text-white rounded-md hover:bg-gray-800 text-sm"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
