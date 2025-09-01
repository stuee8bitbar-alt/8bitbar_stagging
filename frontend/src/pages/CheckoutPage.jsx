import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { CreditCard, Calendar, Clock, Users, Home, Gift } from "lucide-react";
import axios from "../utils/axios";
import SquarePaymentForm from "../components/payments/SquarePaymentForm";
import PaymentConfirmationModal from "../components/payments/PaymentConfirmationModal";
import GiftCardRedeem from "../components/GiftCardRedeem";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth(); // Get user details from AuthContext
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [modalState, setModalState] = useState({
    isOpen: false,
    status: "loading", // 'loading', 'success', 'error'
    message: "",
  });
  const [billingDetails, setBillingDetails] = useState({
    firstName: "",
    lastName: "",
    suburb: "",
    state: "Queensland",
    postcode: "",
    phone: "",
    email: "",
  });

  // Gift card state
  const [appliedGiftCards, setAppliedGiftCards] = useState([]);
  const [finalTotal, setFinalTotal] = useState(0);

  // Load cart from localStorage when the component mounts
  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    const checkoutData = JSON.parse(
      localStorage.getItem("checkoutData") || "null"
    );

    if (checkoutData && checkoutData.type === "giftcard") {
      // Handle gift card purchase
      setCart([
        {
          type: "giftcard",
          giftCardId: checkoutData.giftCardId,
          amount: checkoutData.amount,
          description: checkoutData.description,
          itemType: checkoutData.itemType,
          totalCost: checkoutData.amount,
        },
      ]);
      // Clear checkout data after loading
      localStorage.removeItem("checkoutData");
    } else {
      setCart(storedCart);
    }
  }, []);

  // Pre-fill form with user data if available
  useEffect(() => {
    if (user) {
      setBillingDetails((prev) => ({
        ...prev,
        firstName: user.name?.split(" ")[0] || "",
        lastName: user.name?.split(" ").slice(1).join(" ") || "",
        email: user.email || "",
      }));
    }
  }, [user]);

  // Calculate estimated total from cart
  const estimatedTotal = cart.reduce(
    (total, item) => total + (item.totalCost || 0),
    0
  );

  // Calculate final total after gift cards
  useEffect(() => {
    const giftCardTotal = appliedGiftCards.reduce(
      (total, card) => total + card.amountUsed,
      0
    );
    setFinalTotal(Math.max(0, estimatedTotal - giftCardTotal));
  }, [appliedGiftCards, estimatedTotal]);

  const handleBillingChange = (e) => {
    const { name, value } = e.target;
    setBillingDetails((prev) => ({ ...prev, [name]: value }));
  };

  // Handle gift card application/removal
  const handleGiftCardApplied = (
    giftCard,
    isRemoval = false,
    existingCard = null
  ) => {
    if (isRemoval) {
      // Remove gift card
      setAppliedGiftCards((prev) =>
        prev.filter((card) => card.code !== giftCard.code)
      );
    } else if (existingCard) {
      // Update existing gift card (for partial amounts)
      setAppliedGiftCards((prev) =>
        prev.map((card) =>
          card.code === giftCard.code
            ? {
                ...card,
                amountUsed: giftCard.amountUsed,
                remainingBalance: giftCard.remainingBalance,
                isFullyUsed: giftCard.isFullyUsed,
              }
            : card
        )
      );
    } else {
      // Add new gift card
      setAppliedGiftCards((prev) => [...prev, giftCard]);
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

  const handlePaymentSuccess = async (payment) => {
    setPaymentCompleted(true);
    setPaymentData(payment); // This now includes giftCard data if present

    // Show loading modal immediately
    setModalState({
      isOpen: true,
      status: "loading",
      message: "Processing your payment and creating bookings...",
    });

    setLoading(true);
    try {
      // Convert Square payment status to lowercase for database compatibility
      const paymentStatus = payment.status.toLowerCase();

      // Now create bookings after successful payment
      for (const item of cart) {
        if (item.type === "cafe") {
          // Handle cafe booking
          await axios.post("/cafe/bookings", {
            chairIds: item.chairIds,
            date: item.date,
            time: item.time,
            duration: item.duration,
            customerName:
              `${billingDetails.firstName} ${billingDetails.lastName}`.trim() ||
              user.name,
            customerEmail: billingDetails.email || user.email,
            customerPhone: billingDetails.phone,
            deviceType: item.deviceType,
            paymentId: payment.id, // Link booking to payment
            paymentStatus: paymentStatus,
          });
        } else if (item.type === "karaoke") {
          // Handle karaoke booking
          await axios.post("/karaoke-rooms/bookings", {
            customerName:
              `${billingDetails.firstName} ${billingDetails.lastName}`.trim() ||
              user.name,
            customerEmail: billingDetails.email || user.email,
            customerPhone: billingDetails.phone,
            numberOfPeople: item.people,
            roomId: item.roomId,
            date: item.date,
            time: item.time,
            durationHours: item.duration,
            totalPrice: item.totalCost,
            paymentId: payment.id,
            paymentStatus: paymentStatus,
            comments: item.comments, // Include comments field
          });
        } else if (item.type === "n64") {
          // Handle N64 booking
          await axios.post("/n64-rooms/bookings", {
            customerName:
              `${billingDetails.firstName} ${billingDetails.lastName}`.trim() ||
              user.name,
            customerEmail: billingDetails.email || user.email,
            customerPhone: billingDetails.phone,
            numberOfPeople: item.people,
            roomId: item.roomId,
            roomType: item.roomType,
            date: item.date,
            time: item.time,
            durationHours: item.duration,
            totalPrice: item.totalCost,
            paymentId: payment.id,
            paymentStatus: paymentStatus,
            comments: item.comments, // Include comments field
          });
        }
      }

      // Now redeem applied gift cards after successful payment
      if (appliedGiftCards.length > 0) {
        try {
          for (const giftCard of appliedGiftCards) {
            if (giftCard.isPending) {
              // Only redeem pending gift cards
              await axios.post("/giftcards/redeem", {
                code: giftCard.code,
                pin: giftCard.pin,
                amount: giftCard.amountUsed,
              });
              console.log(`Gift card ${giftCard.code} redeemed successfully`);
            }
          }
        } catch (giftCardError) {
          console.error("Error redeeming gift cards:", giftCardError);
          // Don't fail the entire transaction, just log the error
          // The payment was successful, so we should still show success
        }
      }

      // Clear cart after successful booking
      localStorage.removeItem("cart");
      setCart([]);
      setAppliedGiftCards([]); // Clear applied gift cards as well

      // Show success modal with appropriate message
      const isGiftCard = cart.some((item) => item.type === "giftcard");
      const hasAppliedGiftCards = appliedGiftCards.length > 0;

      let message = "";
      if (isGiftCard) {
        message = "Your gift card has been purchased successfully!";
      } else {
        message = "Your booking has been confirmed successfully!";
      }

      if (hasAppliedGiftCards) {
        message += ` Applied gift cards have been redeemed.`;
      }

      // Check for warnings from payment route
      if (payment.warning) {
        message += ` ${payment.warning}`;
      }

      setModalState({
        isOpen: true,
        status: "success",
        message: message,
      });
    } catch (error) {
      console.error("Booking creation failed after payment:", error);
      setModalState({
        isOpen: true,
        status: "error",
        message: `Payment was successful, but there was an issue creating your booking. Please contact support with payment ID: ${payment.id}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentError = (error) => {
    console.error("Payment failed:", error);
    setModalState({
      isOpen: true,
      status: "error",
      message: `Payment failed: ${error}`,
    });
  };

  const handleGiftCardOnlyPayment = async () => {
    setLoading(true);
    setModalState({
      isOpen: true,
      status: "loading",
      message: "Processing your order with gift cards...",
    });

    try {
      // For gift card purchases, we still need to process through the backend
      const isGiftCardPurchase = cart.some((item) => item.type === "giftcard");

      if (isGiftCardPurchase) {
        const giftCardItem = cart.find((item) => item.type === "giftcard");

        const response = await axios.post("/payments/process-gift-card-only", {
          giftCardData: giftCardItem,
        });

        if (response.data.success) {
          handlePaymentSuccess({
            ...response.data.payment,
            giftCard: response.data.giftCard,
          });
        } else {
          throw new Error(
            response.data.message || "Failed to process gift card purchase"
          );
        }
      } else {
        // For regular bookings covered by gift cards, simulate successful payment
        handlePaymentSuccess({
          id: "GIFT_CARD_ONLY_" + Date.now(),
          status: "COMPLETED",
          amount_money: { amount: 0, currency: "AUD" },
          created_at: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error("Gift card only payment failed:", error);
      setModalState({
        isOpen: true,
        status: "error",
        message: `Failed to process order: ${error.message || error}`,
      });
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setModalState({
      isOpen: false,
      status: "loading",
      message: "",
    });

    // Redirect to home page after successful payment modal is closed
    if (modalState.status === "success") {
      navigate("/");
    }
  };

  const renderInputField = (
    name,
    label,
    placeholder,
    required = false,
    type = "text"
  ) => (
    <div>
      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-300 mb-2"
      >
        {label} {required && <span className="text-pink-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        id={name}
        value={billingDetails[name]}
        onChange={handleBillingChange}
        placeholder={placeholder}
        className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-pink-500 focus:outline-none transition-colors"
        required={required}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Page Header */}
        <div className="text-center mb-12">
          <h1 className="font-['Orbitron'] text-4xl md:text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-cyan-400">
            Checkout
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-pink-500 to-cyan-400 mx-auto rounded-full"></div>
          <p className="text-gray-400 mt-4 text-lg">
            Complete your booking and payment details
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column: Your Details - Improved Structure */}
          <div className="lg:w-1/2 bg-black/60 border border-pink-500/30 rounded-lg shadow-lg">
            <div className="p-6">
              <h2 className="font-['Orbitron'] text-2xl font-bold text-white mb-6 border-b border-pink-500/20 pb-3">
                Your Details
              </h2>

              <form className="space-y-6">
                {/* Personal Information Section */}
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <h3 className="text-lg font-semibold text-pink-400 mb-4 flex items-center">
                    <span className="w-2 h-2 bg-pink-400 rounded-full mr-3"></span>
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {renderInputField("firstName", "First Name", "Alice", true)}
                    {renderInputField(
                      "lastName",
                      "Last Name",
                      "Wonderland",
                      true
                    )}
                  </div>
                </div>

                {/* Address Information Section */}
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <h3 className="text-lg font-semibold text-cyan-400 mb-4 flex items-center">
                    <span className="w-2 h-2 bg-cyan-400 rounded-full mr-3"></span>
                    Address Information
                  </h3>

                  {/* Location Details Row - Mobile Optimized */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {renderInputField(
                      "suburb",
                      "Suburb",
                      "e.g., Fortitude Valley",
                      true
                    )}
                    {renderInputField(
                      "postcode",
                      "Postcode",
                      "e.g., 4006",
                      true
                    )}
                    {renderInputField("state", "State", "Queensland", true)}
                  </div>
                </div>

                {/* Contact Information Section */}
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <h3 className="text-lg font-semibold text-green-400 mb-4 flex items-center">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {renderInputField(
                      "phone",
                      "Phone",
                      "Your phone number",
                      true,
                      "tel"
                    )}
                    {renderInputField(
                      "email",
                      "Email Address",
                      "you@wonderland.com",
                      true,
                      "email"
                    )}
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column: Order Summary & Payment - Improved Structure */}
          <div className="lg:w-1/2">
            <div className="bg-black/60 border border-pink-500/30 rounded-lg shadow-lg sticky top-24">
              <div className="p-6">
                {/* Order Summary Section */}
                <div className="mb-6">
                  <h2 className="font-['Orbitron'] text-2xl font-bold text-white mb-4 border-b border-pink-500/20 pb-3">
                    Your Order
                  </h2>

                  {/* Compact Order Summary */}
                  <div className="space-y-3 mb-4">
                    {cart.map((item, index) => (
                      <div
                        key={index}
                        className="border-b border-gray-700 pb-3"
                      >
                        <div className="flex justify-between text-gray-300 mb-1">
                          <span className="font-medium">
                            {item.type === "giftcard"
                              ? item.description
                              : `${item.title || item.roomName} x ${
                                  item.duration
                                }h`}
                          </span>
                          <span className="font-bold text-white">
                            ${item.totalCost.toFixed(2)}
                          </span>
                        </div>

                        {item.type === "giftcard" ? (
                          <div className="text-xs text-gray-400 flex items-center">
                            <Gift className="h-3 w-3 text-pink-500 mr-1" />
                            <span>Gift Card</span>
                            {item.itemType === "custom" && (
                              <span className="text-pink-400 ml-2">
                                Custom: ${item.amount.toFixed(2)}
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="text-xs text-gray-400 space-y-0.5">
                            <div className="flex items-center">
                              <Calendar className="h-3 w-3 text-pink-500 mr-1" />
                              <span>
                                {item.date} at {item.time}
                              </span>
                            </div>
                            {item.people && (
                              <div className="flex items-center">
                                <Users className="h-3 w-3 text-pink-500 mr-1" />
                                <span>{item.people} people</span>
                              </div>
                            )}
                            {item.roomName && (
                              <div className="flex items-center">
                                <Home className="h-3 w-3 text-pink-500 mr-1" />
                                <span>{item.roomName}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Compact time warning */}
                        {item.type !== "giftcard" && (
                          <div className="text-xs text-red-300 px-2 py-1 bg-red-900/30 rounded border border-red-500/50 mt-1">
                            ⚠️ {item.time} -{" "}
                            {calculateEndTime(
                              item.time,
                              item.duration,
                              item.type === "cafe"
                            )}{" "}
                            (5 min cleaning)
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Compact Total Summary */}
                  <div className="border-t border-pink-500/20 pt-3 space-y-2 mb-4">
                    <div className="flex justify-between text-gray-300 text-sm">
                      <span>Subtotal</span>
                      <span>${estimatedTotal.toFixed(2)}</span>
                    </div>

                    {appliedGiftCards.length > 0 && (
                      <div className="flex justify-between text-green-400 text-sm">
                        <span>Gift Cards Applied</span>
                        <span>
                          -$
                          {appliedGiftCards
                            .reduce((total, card) => total + card.amountUsed, 0)
                            .toFixed(2)}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between text-white text-lg font-bold border-t border-pink-500/20 pt-2">
                      <span>Total</span>
                      <span className="text-green-400">
                        ${finalTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Gift Card Redemption Section */}
                <div className="mb-6">
                  <GiftCardRedeem
                    onGiftCardApplied={handleGiftCardApplied}
                    totalAmount={estimatedTotal}
                  />
                </div>

                {/* Payment Details Section */}
                <div>
                  <h3 className="font-['Orbitron'] text-lg font-bold text-white mb-4 border-b border-pink-500/20 pb-2">
                    Payment Details
                  </h3>

                  {/* Compact Payment Method Logos */}
                  <div className="mb-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <div className="w-6 h-6 bg-white rounded flex items-center justify-center mr-2">
                          <img
                            src="https://www.svgrepo.com/show/449176/payment-square.svg"
                            alt="Square Payment"
                            className="w-4 h-4"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-6 h-4 bg-blue-600 rounded flex items-center justify-center">
                        <span className="text-white text-xs font-bold">
                          VISA
                        </span>
                      </div>
                      <div className="w-6 h-4 bg-red-600 rounded flex items-center justify-center">
                        <span className="text-white text-xs font-bold">MC</span>
                      </div>
                      <div className="w-6 h-4 bg-green-600 rounded flex items-center justify-center">
                        <span className="text-white text-xs font-bold">
                          AMEX
                        </span>
                      </div>
                      <div className="w-6 h-4 bg-gray-600 rounded flex items-center justify-center">
                        <span className="text-white text-xs font-bold">
                          DISC
                        </span>
                      </div>
                      <div className="w-6 h-4 bg-yellow-600 rounded flex items-center justify-center">
                        <span className="text-white text-xs font-bold">
                          JCB
                        </span>
                      </div>
                    </div>
                  </div>

                  {finalTotal > 0 ? (
                    <SquarePaymentForm
                      amount={finalTotal}
                      onPaymentSuccess={handlePaymentSuccess}
                      onPaymentError={handlePaymentError}
                      disabled={loading || cart.length === 0}
                      giftCardData={
                        cart.some((item) => item.type === "giftcard")
                          ? cart.find((item) => item.type === "giftcard")
                          : null
                      }
                    />
                  ) : (
                    <div className="bg-gray-800 border border-gray-600 rounded-lg p-6">
                      <div className="text-center">
                        <div className="mb-4">
                          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Gift className="h-8 w-8 text-green-400" />
                          </div>
                          <h3 className="text-lg font-bold text-green-400 mb-2">
                            Fully Covered by Gift Cards!
                          </h3>
                          <p className="text-gray-300 text-sm mb-4">
                            Your order is completely covered by applied gift
                            cards. No additional payment required.
                          </p>
                        </div>

                        <button
                          onClick={handleGiftCardOnlyPayment}
                          disabled={loading || cart.length === 0}
                          className="w-full py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-lg shadow-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading ? (
                            <div className="flex items-center justify-center">
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                              Processing...
                            </div>
                          ) : (
                            "Complete Order (No Payment Required)"
                          )}
                        </button>

                        <div className="mt-4 text-xs text-gray-400 text-center">
                          <p>🎁 Gift cards will be redeemed upon completion</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Confirmation Modal */}
      <PaymentConfirmationModal
        isOpen={modalState.isOpen}
        onClose={handleModalClose}
        status={modalState.status}
        message={modalState.message}
        paymentData={paymentData}
        giftCardData={paymentData?.giftCard || null}
      />
    </div>
  );
};

export default CheckoutPage;
