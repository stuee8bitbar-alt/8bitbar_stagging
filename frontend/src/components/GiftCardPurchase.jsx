import React, { useState, useEffect } from "react";
import {
  GiftIcon,
  PlusIcon,
  StarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../utils/axios";

const GiftCardPurchase = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [giftCards, setGiftCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customAmount, setCustomAmount] = useState("");
  const [customDescription, setCustomDescription] = useState("");
  const [error, setError] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    fetchAvailableGiftCards();
  }, []);

  const fetchAvailableGiftCards = async () => {
    try {
      setLoading(true);
      const response = await api.get("/giftcards");
      setGiftCards(response.data.data);
    } catch (error) {
      console.error("Error fetching gift cards:", error);
      setError("Failed to fetch gift cards");
    } finally {
      setLoading(false);
    }
  };

  const handlePurchaseGiftCard = async (giftCard) => {
    if (!user) {
      setError("Please log in to purchase gift cards");
      return;
    }

    try {
      setError(""); // Clear previous errors

      // Store gift card info in localStorage for checkout
      const checkoutData = {
        type: "giftcard",
        giftCardId: giftCard._id,
        amount: giftCard.amount,
        description: giftCard.description || `Gift Card - $${giftCard.amount}`,
        itemType: giftCard.source === "admin" ? "admin" : "predefined",
        source: giftCard.source, // Include source for admin template handling
      };

      localStorage.setItem("checkoutData", JSON.stringify(checkoutData));

      // Redirect to checkout page
      navigate("/checkout");
    } catch (error) {
      console.error("Error preparing gift card purchase:", error);
      setError("Failed to prepare gift card purchase. Please try again.");
    }
  };

  const handleCreateCustomGiftCard = async (e) => {
    e.preventDefault();

    if (!user) {
      setError("Please log in to create custom gift cards");
      return;
    }

    if (!customAmount || customAmount <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    try {
      setError(""); // Clear previous errors

      // Store custom gift card info in localStorage for checkout
      const checkoutData = {
        type: "giftcard",
        amount: parseFloat(customAmount),
        description:
          customDescription || `Custom gift card for $${customAmount}`,
        itemType: "custom",
      };

      localStorage.setItem("checkoutData", JSON.stringify(checkoutData));

      // Close modal and redirect to checkout
      setShowCustomForm(false);
      setCustomAmount("");
      setCustomDescription("");
      navigate("/checkout");
    } catch (error) {
      console.error("Error preparing custom gift card:", error);
      setError("Failed to prepare custom gift card. Please try again.");
    }
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon key={i} className="w-4 h-4 text-pink-400" />
    ));
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % (giftCards.length + 1));
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + (giftCards.length + 1)) % (giftCards.length + 1)
    );
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
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

      <div className="relative z-40 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-green-400 to-cyan-400 neon-text-multicolor">
              Gift Cards
            </h2>
            <p className="text-xl text-gray-300">
              Give the perfect gift for gaming enthusiasts
            </p>

            {/* Error Display */}
            {error && (
              <div className="mt-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                <p className="text-red-400">{error}</p>
              </div>
            )}

            {/* Authentication Prompt */}
            {!user && (
              <div className="mt-4 p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                <p className="text-yellow-400">
                  Please log in to purchase gift cards or create custom ones
                </p>
              </div>
            )}
          </div>

          {/* Mobile Carousel */}
          <div className="block md:hidden mb-12">
            <div className="relative">
              {/* Carousel Container */}
              <div className="overflow-hidden rounded-lg">
                <div
                  className="flex transition-transform duration-300 ease-in-out"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {/* Gift Cards in Carousel */}
                  {giftCards.map((giftCard) => (
                    <div
                      key={giftCard._id}
                      className="w-full flex-shrink-0 px-2"
                    >
                      <div className="bg-white/10 backdrop-blur-sm rounded-lg shadow-2xl overflow-hidden transform hover:scale-105 transition-transform duration-300 border border-white/20">
                        {/* Gift Card Image - Reduced height for mobile */}
                        <div className="relative h-32 bg-gradient-to-br from-pink-500 to-purple-600 p-4 flex items-center justify-center">
                          <div className="text-center text-white">
                            <div className="text-lg font-bold mb-1">
                              GIFT CARD
                            </div>
                            <div className="text-xs opacity-90 mb-1">
                              {giftCard.code
                                ? giftCard.code
                                : "Available for Purchase"}
                            </div>
                            <div className="w-full bg-white bg-opacity-20 h-1 mb-1"></div>
                            <div className="text-sm font-bold">8-BIT BAR</div>
                            <div className="text-xs opacity-75">NO EXPIRY</div>
                          </div>
                        </div>

                        {/* Product Details - Reduced padding for mobile */}
                        <div className="p-4 bg-black/40">
                          <h3 className="text-sm font-semibold text-white mb-2">
                            {giftCard.description ||
                              `Gift card $${giftCard.amount}`}
                          </h3>

                          {/* Rating Stars */}
                          <div className="flex items-center mb-2">
                            {renderStars()}
                          </div>

                          {/* Price */}
                          <div className="text-xl font-bold text-pink-400 mb-3">
                            ${giftCard.amount.toFixed(2)}
                          </div>

                          {/* Source Badge */}
                          {giftCard.source && (
                            <div className="mb-2">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  giftCard.source === "admin"
                                    ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                                    : "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                                }`}
                              >
                                {giftCard.source === "admin"
                                  ? "Admin Created"
                                  : "Predefined"}
                              </span>
                            </div>
                          )}

                          {/* Buy Button */}
                          <button
                            onClick={() => handlePurchaseGiftCard(giftCard)}
                            disabled={!user}
                            className={`w-full py-2 px-3 rounded-lg font-semibold transition-all duration-200 shadow-lg text-sm ${
                              user
                                ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700 hover:shadow-pink-500/25"
                                : "bg-gray-600 text-gray-400 cursor-not-allowed"
                            }`}
                          >
                            {user
                              ? "Buy Now - Pay $" + giftCard.amount
                              : "Login to purchase"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Custom Gift Card Option in Carousel */}
                  <div className="w-full flex-shrink-0 px-2">
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg shadow-2xl overflow-hidden transform hover:scale-105 transition-transform duration-300 border border-white/20">
                      {/* Custom Gift Card Image - Reduced height for mobile */}
                      <div className="relative h-32 bg-gradient-to-br from-green-500 to-cyan-600 p-4 flex items-center justify-center">
                        <div className="text-center text-white">
                          <PlusIcon className="w-12 h-12 mx-auto mb-1" />
                          <div className="text-lg font-bold mb-1">CUSTOM</div>
                          <div className="text-xs opacity-90 mb-1">
                            Create Your Own
                          </div>
                          <div className="w-full bg-white bg-opacity-20 h-1 mb-1"></div>
                          <div className="text-sm font-bold">8-BIT BAR</div>
                          <div className="text-xs opacity-75">NO EXPIRY</div>
                        </div>
                      </div>

                      {/* Product Details - Reduced padding for mobile */}
                      <div className="p-4 bg-black/40">
                        <h3 className="text-sm font-semibold text-white mb-2">
                          Custom Gift Card
                        </h3>

                        {/* Rating Stars */}
                        <div className="flex items-center mb-2">
                          {renderStars()}
                        </div>

                        {/* Custom Amount Input */}
                        <div className="mb-3">
                          <input
                            type="number"
                            min="1"
                            step="0.01"
                            placeholder="Enter amount"
                            value={customAmount}
                            onChange={(e) => setCustomAmount(e.target.value)}
                            className="w-full px-2 py-1 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 text-white placeholder-gray-300 text-sm"
                          />
                        </div>

                        {/* Create Button */}
                        <button
                          onClick={() => setShowCustomForm(true)}
                          disabled={!user || !customAmount || customAmount <= 0}
                          className={`w-full py-2 px-3 rounded-lg font-semibold transition-all duration-200 shadow-lg text-sm ${
                            user && customAmount && customAmount > 0
                              ? "bg-gradient-to-r from-green-500 to-cyan-600 text-white hover:from-green-600 hover:to-cyan-700 hover:shadow-green-500/25"
                              : "bg-gray-600 text-gray-400 cursor-not-allowed"
                          }`}
                        >
                          {user
                            ? customAmount && customAmount > 0
                              ? `Create & Pay $${customAmount}`
                              : "Enter amount to create"
                            : "Login to create"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Carousel Navigation */}
              <button
                onClick={prevSlide}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-200 z-10"
              >
                <ChevronLeftIcon className="w-5 h-5" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-200 z-10"
              >
                <ChevronRightIcon className="w-5 h-5" />
              </button>

              {/* Carousel Indicators */}
              <div className="flex justify-center mt-4 space-x-2">
                {Array.from({ length: giftCards.length + 1 }, (_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-200 ${
                      index === currentSlide
                        ? "bg-pink-500 w-6"
                        : "bg-white/30 hover:bg-white/50"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Desktop Grid - Hidden on mobile */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Available Predefined Gift Cards */}
            {giftCards.map((giftCard) => (
              <div
                key={giftCard._id}
                className="bg-white/10 backdrop-blur-sm rounded-lg shadow-2xl overflow-hidden transform hover:scale-105 transition-transform duration-300 border border-white/20"
              >
                {/* Gift Card Image */}
                <div className="relative h-48 bg-gradient-to-br from-pink-500 to-purple-600 p-6 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="text-2xl font-bold mb-2">GIFT CARD</div>
                    <div className="text-sm opacity-90 mb-2">
                      {giftCard.code ? giftCard.code : "Available for Purchase"}
                    </div>
                    <div className="w-full bg-white bg-opacity-20 h-1 mb-2"></div>
                    <div className="text-lg font-bold">8-BIT BAR</div>
                    <div className="text-xs opacity-75">NO EXPIRY</div>
                  </div>
                </div>

                {/* Product Details */}
                <div className="p-6 bg-black/40">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {giftCard.description || `Gift card $${giftCard.amount}`}
                  </h3>

                  {/* Rating Stars */}
                  <div className="flex items-center mb-3">{renderStars()}</div>

                  {/* Price */}
                  <div className="text-2xl font-bold text-pink-400 mb-4">
                    ${giftCard.amount.toFixed(2)}
                  </div>

                  {/* Source Badge */}
                  {giftCard.source && (
                    <div className="mb-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          giftCard.source === "admin"
                            ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                            : "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                        }`}
                      >
                        {giftCard.source === "admin"
                          ? "Admin Created"
                          : "Predefined"}
                      </span>
                    </div>
                  )}

                  {/* Buy Button */}
                  <button
                    onClick={() => handlePurchaseGiftCard(giftCard)}
                    disabled={!user}
                    className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 shadow-lg ${
                      user
                        ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700 hover:shadow-pink-500/25"
                        : "bg-gray-600 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {user
                      ? "Buy Now - Pay $" + giftCard.amount
                      : "Login to purchase"}
                  </button>
                </div>
              </div>
            ))}

            {/* Custom Gift Card Option */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg shadow-2xl overflow-hidden transform hover:scale-105 transition-transform duration-300 border border-white/20">
              {/* Custom Gift Card Image */}
              <div className="relative h-48 bg-gradient-to-br from-green-500 to-cyan-600 p-6 flex items-center justify-center">
                <div className="text-center text-white">
                  <PlusIcon className="w-16 h-16 mx-auto mb-2" />
                  <div className="text-2xl font-bold mb-2">CUSTOM</div>
                  <div className="text-sm opacity-90 mb-2">Create Your Own</div>
                  <div className="w-full bg-white bg-opacity-20 h-1 mb-2"></div>
                  <div className="text-lg font-bold">8-BIT BAR</div>
                  <div className="text-xs opacity-75">NO EXPIRY</div>
                </div>
              </div>

              {/* Product Details */}
              <div className="p-6 bg-black/40">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Custom Gift Card
                </h3>

                {/* Rating Stars */}
                <div className="flex items-center mb-3">{renderStars()}</div>

                {/* Custom Amount Input */}
                <div className="mb-4">
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    placeholder="Enter amount"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 text-white placeholder-gray-300"
                  />
                </div>

                {/* Create Button */}
                <button
                  onClick={() => setShowCustomForm(true)}
                  disabled={!user || !customAmount || customAmount <= 0}
                  className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 shadow-lg ${
                    user && customAmount && customAmount > 0
                      ? "bg-gradient-to-r from-green-500 to-cyan-600 text-white hover:from-green-600 hover:to-cyan-700 hover:shadow-green-500/25"
                      : "bg-gray-600 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {user
                    ? customAmount && customAmount > 0
                      ? `Create & Pay $${customAmount}`
                      : "Enter amount to create"
                    : "Login to create"}
                </button>
              </div>
            </div>
          </div>

          {/* Custom Gift Card Form Modal */}
          {showCustomForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-black/90 backdrop-blur-sm rounded-lg p-8 max-w-md w-full mx-4 border border-white/20">
                <h3 className="text-2xl font-bold text-white mb-6">
                  Create Custom Gift Card
                </h3>

                {!user ? (
                  <div className="text-center">
                    <p className="text-gray-300 mb-6">
                      Please log in to create custom gift cards
                    </p>
                    <button
                      onClick={() => setShowCustomForm(false)}
                      className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-200"
                    >
                      Close
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleCreateCustomGiftCard}>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Amount ($)
                        </label>
                        <input
                          type="number"
                          min="1"
                          step="0.01"
                          required
                          value={customAmount}
                          onChange={(e) => setCustomAmount(e.target.value)}
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Description (Optional)
                        </label>
                        <textarea
                          value={customDescription}
                          onChange={(e) => setCustomDescription(e.target.value)}
                          placeholder="Add a personal message..."
                          rows="3"
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 text-white placeholder-gray-400"
                        />
                      </div>
                    </div>

                    <div className="flex space-x-3 mt-6">
                      <button
                        type="button"
                        onClick={() => setShowCustomForm(false)}
                        className="flex-1 px-4 py-2 text-gray-300 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition-colors duration-200"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-cyan-600 text-white rounded-lg hover:from-green-600 hover:to-cyan-700 transition-all duration-200"
                      >
                        Create Gift Card
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* Payment Modal */}
          {/* This section is no longer needed as payment is handled by /checkout */}

          {/* Info Section */}
          <div className="text-center text-gray-300">
            <p className="text-lg">
              Gift cards can be used for any service at 8-BIT BAR including
              gaming, karaoke, and cafe bookings.
            </p>
            <p className="text-sm mt-2 opacity-75">
              No expiration date • Perfect for birthdays, holidays, or any
              special occasion
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GiftCardPurchase;
