import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useModal } from "../../contexts/ModalContext";
import CafeLayoutViewer from "./CafeLayoutViewer";
import BookingForm from "./BookingForm";
import axios from "../../utils/axios";

const CafeBookingPage = () => {
  const [selectedChairs, setSelectedChairs] = useState([]);
  const [bookingDetails, setBookingDetails] = useState({
    date: "",
    time: "",
    duration: 1,
  });
  const [bookedChairs, setBookedChairs] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [layout, setLayout] = useState(null);
  const [cafeSettings, setCafeSettings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deviceType, setDeviceType] = useState("desktop");
  const { user } = useAuth();
  const { openLogin } = useModal();
  const navigate = useNavigate();

  // Detect device type
  useEffect(() => {
    const checkDeviceType = () => {
      setDeviceType(window.innerWidth <= 768 ? "mobile" : "desktop");
    };

    checkDeviceType();
    window.addEventListener("resize", checkDeviceType);
    return () => window.removeEventListener("resize", checkDeviceType);
  }, []);

  // Load cafe layout and settings
  useEffect(() => {
    const fetchLayoutAndSettings = async () => {
      try {
        const [layoutResponse, settingsResponse] = await Promise.all([
          axios.get(`/cafe/layout?deviceType=${deviceType}`),
          axios.get("/cafe/settings"),
        ]);

        setLayout(layoutResponse.data.layout);
        setCafeSettings(settingsResponse.data.settings);
      } catch (error) {
        console.error("Failed to load cafe data:", error);
      }
    };

    fetchLayoutAndSettings();
  }, [deviceType]);

  // Check chair availability when booking details change
  useEffect(() => {
    if (bookingDetails.date && bookingDetails.time && bookingDetails.duration) {
      checkAvailability();
    }
  }, [bookingDetails]);

  const checkAvailability = async () => {
    try {
      setLoading(true);
      const availabilityResponse = await axios.get("/cafe/bookings/check", {
        params: {
          date: bookingDetails.date,
          time: bookingDetails.time,
          duration: bookingDetails.duration,
        },
      });
      setBookedChairs(availabilityResponse.data.bookedChairs);
    } catch (error) {
      console.error("Failed to check availability:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChairSelect = (chairId) => {
    if (bookedChairs.includes(chairId)) return; // Can't select booked chairs

    setSelectedChairs((prev) => {
      if (prev.includes(chairId)) {
        return prev.filter((id) => id !== chairId);
      } else {
        return [...prev, chairId];
      }
    });
  };

  const handleAddToCart = () => {
    if (!user) {
      openLogin();
      return;
    }

    if (selectedChairs.length === 0) {
      return; // Don't show alert, just return silently
    }

    if (!bookingDetails.date || !bookingDetails.time) {
      return; // Don't show alert, just return silently
    }

    const pricePerChair =
      cafeSettings && cafeSettings.pricePerChairPerHour !== undefined
        ? cafeSettings.pricePerChairPerHour
        : 10;
    const totalCost =
      selectedChairs.length * pricePerChair * bookingDetails.duration;

    // If it's a free booking (price is 0), book directly without going to cart
    if (pricePerChair === 0) {
      handleDirectBooking();
      return;
    }

    const cartItem = {
      type: "cafe",
      chairIds: selectedChairs,
      date: bookingDetails.date,
      time: bookingDetails.time,
      duration: bookingDetails.duration,
      totalCost,
      title: `Ticket Show - ${selectedChairs.length} Chair${
        selectedChairs.length > 1 ? "s" : ""
      }`,
      description: `${selectedChairs.length} chair${
        selectedChairs.length > 1 ? "s" : ""
      } for ${bookingDetails.duration} hour${
        bookingDetails.duration > 1 ? "s" : ""
      }`,
      deviceType,
    };

    // Add to cart in localStorage
    const existingCart = JSON.parse(localStorage.getItem("cart") || "[]");
    existingCart.push(cartItem);
    localStorage.setItem("cart", JSON.stringify(existingCart));

    // Clear selections
    setSelectedChairs([]);

    // Navigate to cart page
    navigate("/cart");
  };

  const handleDirectBooking = async () => {
    try {
      setLoading(true);

      const bookingData = {
        chairIds: selectedChairs,
        date: bookingDetails.date,
        time: bookingDetails.time,
        duration: bookingDetails.duration,
        totalCost: 0,
        customerName: user?.name || "Free Booking User",
        customerEmail: user?.email || "free@booking.com",
        customerPhone: user?.phone || "",
        status: "confirmed", // Auto-confirm free bookings
      };

      const response = await axios.post("/cafe/bookings", bookingData);

      if (response.data.success) {
        alert(
          "Free booking confirmed successfully! You can now use your selected chairs."
        );
        setSelectedChairs([]);
        setBookingDetails({
          date: "",
          time: "",
          duration: 1,
        });
        checkAvailability(); // Refresh availability
      }
    } catch (error) {
      console.error("Failed to book free chairs:", error);
      alert("Failed to book chairs. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    const pricePerChair =
      cafeSettings && cafeSettings.pricePerChairPerHour !== undefined
        ? cafeSettings.pricePerChairPerHour
        : 10;
    return selectedChairs.length * pricePerChair * bookingDetails.duration;
  };

  const isBookingDetailsComplete =
    bookingDetails.date && bookingDetails.time && bookingDetails.duration;

  if (!layout) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-xl">Loading ticket show layout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="font-['Orbitron'] text-4xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-cyan-400 text-center">
          🎫 Ticket Show Booking
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-1">
            <BookingForm
              bookingDetails={bookingDetails}
              setBookingDetails={setBookingDetails}
              selectedChairs={selectedChairs}
              calculateTotal={calculateTotal}
              onAddToCart={handleAddToCart}
              loading={loading}
              bookedChairs={bookedChairs}
              allBookings={allBookings}
              cafeSettings={cafeSettings}
            />
          </div>

          {/* Cafe Layout */}
          <div className="lg:col-span-2">
            <CafeLayoutViewer
              layout={layout}
              selectedChairs={selectedChairs}
              bookedChairs={bookedChairs}
              onChairSelect={handleChairSelect}
              deviceType={deviceType}
              chairSelectionEnabled={isBookingDetailsComplete}
            />
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-gray-900/50 border border-pink-500/30 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4 text-pink-400">How to Book:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="mb-2">
                🪑 <strong>Chair Selection:</strong> Click on available chairs
                to select them
              </p>
              <p className="mb-2">
                💰 <strong>Pricing:</strong>{" "}
                {cafeSettings &&
                cafeSettings.pricePerChairPerHour !== undefined &&
                cafeSettings.pricePerChairPerHour === 0 ? (
                  <span className="text-green-400 font-bold">
                    FREE - No payment required!
                  </span>
                ) : (
                  `Each chair costs $${
                    cafeSettings &&
                    cafeSettings.pricePerChairPerHour !== undefined
                      ? cafeSettings.pricePerChairPerHour
                      : 10
                  } per hour`
                )}
              </p>
            </div>
            <div>
              <p className="mb-2">
                🚫 <strong>Gray Chairs:</strong> Already booked for your
                selected time
              </p>
              <p className="mb-2">
                {cafeSettings &&
                cafeSettings.pricePerChairPerHour !== undefined &&
                cafeSettings.pricePerChairPerHour === 0 ? (
                  <span>
                    🎉 <strong>Free Booking:</strong> Book directly without
                    checkout
                  </span>
                ) : (
                  <span>
                    🛒 <strong>Multiple Selection:</strong> Select multiple
                    chairs and add to cart
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CafeBookingPage;
