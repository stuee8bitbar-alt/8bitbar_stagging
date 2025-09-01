import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useModal } from "../contexts/ModalContext";

const Cart = () => {
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { openLogin } = useModal();

  // Helper to load cart from localStorage and update state
  const loadCart = () => {
    const stored = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(stored);
  };

  // Consolidated Effect Hook: Loads cart and listens for changes
  useEffect(() => {
    loadCart();
    const onStorageChange = (e) => {
      if (e.key === "cart") {
        loadCart();
      }
    };
    window.addEventListener("storage", onStorageChange);
    return () => window.removeEventListener("storage", onStorageChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, user]);

  // Function to remove a specific item from the cart
  const handleRemoveItem = (itemIndex) => {
    const updatedCart = cart.filter((_, index) => index !== itemIndex);
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  // Function to handle the checkout button click
  const handleProceedToCheckout = () => {
    if (user) {
      navigate("/checkout"); // If user is logged in, go to checkout
    } else {
      openLogin(); // If not logged in, open the login modal
    }
  };

  // Helper: calculate end time with 5 min cleaning time
  const calculateEndTime = (startTime, duration, isHourFormat = false) => {
    // Handle 24-hour format (cafe)
    if (isHourFormat) {
      const [hour, minute] = startTime.split(":");
      let endHour = parseInt(hour) + duration;
      let endMinute = parseInt(minute) - 5;

      if (endMinute < 0) {
        endMinute += 60;
        endHour -= 1;
      }

      // Handle day rollover
      endHour = endHour % 24;

      return `${endHour.toString().padStart(2, "0")}:${endMinute
        .toString()
        .padStart(2, "0")}`;
    }

    // Handle AM/PM format (karaoke, n64)
    const match = startTime.match(/(\d+):(\d+) (AM|PM)/);
    if (!match) return startTime;
    const [_, hour, minute, period] = match;
    let endHour = parseInt(hour);
    if (period === "PM" && endHour !== 12) endHour += 12;
    if (period === "AM" && endHour === 12) endHour = 0;
    endHour += duration;
    let endMinute = parseInt(minute) - 5;
    if (endMinute < 0) {
      endMinute += 60;
      endHour -= 1;
    }

    // Handle day rollover
    endHour = endHour % 24;

    let displayHour = endHour;
    let displayPeriod = "AM";
    if (endHour >= 12) {
      displayPeriod = "PM";
      if (endHour > 12) displayHour = endHour - 12;
    }
    if (endHour === 0) displayHour = 12;
    return `${displayHour}:${endMinute
      .toString()
      .padStart(2, "0")} ${displayPeriod}`;
  };

  // Calculate the total cost
  const estimatedTotal = cart.reduce(
    (total, item) => total + (item.totalCost || 0),
    0
  );

  // --- If not logged in, prompt login ---
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-black text-white p-4">
        <div className="flex flex-col items-center text-center">
          <span className="text-7xl mb-6">🛒</span>
          <h1 className="font-['Orbitron'] text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-cyan-400">
            Please Log In to View Your Cart
          </h1>
          <button
            onClick={openLogin}
            className="px-8 py-3 bg-gradient-to-r from-cyan-400 to-pink-500 text-white font-bold rounded-lg shadow-lg hover:scale-105 transition-all duration-300"
          >
            Log In
          </button>
        </div>
      </div>
    );
  }

  // --- Empty Cart View ---
  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-black text-white p-4">
        <div className="flex flex-col items-center text-center">
          <span className="text-7xl mb-6">🛒</span>
          <h1 className="font-['Orbitron'] text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-cyan-400">
            Your Cart is Empty
          </h1>
          <p className="text-gray-400 text-lg mb-8">
            Looks like you haven't added anything yet.
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-8 py-3 bg-gradient-to-r from-cyan-400 to-pink-500 text-white font-bold rounded-lg shadow-lg hover:scale-105 transition-all duration-300"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // --- Cart with Items View ---
  return (
    <div className="min-h-screen bg-black text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="font-['Orbitron'] text-4xl font-bold mb-10 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-cyan-400 text-center">
          🛒 Your Cart
        </h1>

        <div className="flex flex-col lg:flex-row gap-16">
          {/* Left Column: Product List */}
          <div className="lg:w-2/3">
            <div className="flex justify-between border-b border-pink-500/30 pb-3 mb-4">
              <h2 className="text-gray-400 font-semibold uppercase tracking-wider">
                Product
              </h2>
              <h2 className="text-gray-400 font-semibold uppercase tracking-wider">
                Total
              </h2>
            </div>
            <div className="space-y-6">
              {cart.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start justify-between gap-4 p-4 bg-black/60 border border-pink-500/30 rounded-lg shadow-lg"
                >
                  <div className="flex items-start gap-6">
                    {item.imageUrl && (
                      <img
                        src={item.imageUrl}
                        alt={item.title || item.roomName}
                        className="w-24 h-24 sm:w-32 sm:h-auto object-cover rounded-lg border border-pink-400/40 shadow-md"
                      />
                    )}
                    <div>
                      <div className="font-bold text-lg sm:text-xl text-pink-400 mb-2">
                        {item.title || item.roomName}
                      </div>
                      <p className="text-gray-400 text-sm mb-3 max-w-md">
                        {item.description ||
                          "Welcome! Host your next unforgettable event with us."}
                      </p>
                      <div className="text-gray-300 text-sm space-y-1">
                        <p>
                          <span className="font-semibold">Start Date:</span>{" "}
                          {item.date}
                        </p>
                        <p>
                          <span className="font-semibold">Booking Time:</span>{" "}
                          {item.time}
                        </p>
                        <p>
                          <span className="font-semibold">Duration:</span>{" "}
                          {item.duration} {item.duration > 1 ? "hours" : "hour"}
                        </p>
                        <div className="text-sm text-red-300 mt-2 px-3 py-2 bg-red-900/30 rounded-lg border border-red-500/50">
                          ⚠️ <strong>Actual time:</strong> {item.time} -{" "}
                          {calculateEndTime(
                            item.time,
                            item.duration,
                            item.type === "cafe"
                          )}{" "}
                          (5 min reserved for cleaning)
                        </div>
                        {item.people && (
                          <p>
                            <span className="font-semibold">Person:</span>{" "}
                            {item.people}
                          </p>
                        )}
                        {item.chairIds && (
                          <div>
                            <span className="font-semibold">Chairs:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {item.chairIds.map((chairId) => (
                                <span
                                  key={chairId}
                                  className="px-2 py-1 bg-cyan-600 text-white text-xs rounded"
                                >
                                  {chairId}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemoveItem(idx)}
                        className="text-cyan-400 hover:text-cyan-300 transition-colors duration-200 mt-3 text-sm font-semibold"
                      >
                        Remove Item
                      </button>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-green-400 text-lg sm:text-xl font-bold">
                      ${item.totalCost.toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Cart Totals */}
          <div className="lg:w-1/3">
            <div className="bg-black/60 border border-pink-500/30 rounded-lg p-6 shadow-lg sticky top-24">
              <h2 className="font-['Orbitron'] text-2xl font-bold text-white mb-6 border-b border-pink-500/20 pb-4">
                Cart Totals
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-gray-300">
                  <span>Subtotal</span>
                  <span className="font-medium">
                    ${estimatedTotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-gray-300">
                  <span>Shipping</span>
                  <span className="font-medium">Free</span>
                </div>
                <div className="border-t border-pink-500/20 my-4"></div>
                <div className="flex justify-between items-center text-white text-xl font-bold">
                  <span>Estimated total</span>
                  <span className="text-green-400">
                    ${estimatedTotal.toFixed(2)}
                  </span>
                </div>
              </div>
              <button
                onClick={handleProceedToCheckout}
                className="w-full mt-8 py-3 bg-gradient-to-r from-pink-500 to-cyan-400 text-white font-bold rounded-lg shadow-lg hover:scale-105 transition-all duration-300 text-lg"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
