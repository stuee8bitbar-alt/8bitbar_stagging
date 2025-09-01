import React, { useEffect, useRef, useState } from "react";
import { CreditCard, Loader2 } from "lucide-react";
import api from "../../utils/axios";

const SquarePaymentForm = ({
  amount,
  onPaymentSuccess,
  onPaymentError,
  disabled,
  giftCardData = null, // Add gift card data prop
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSquareLoaded, setIsSquareLoaded] = useState(false);
  const cardButtonRef = useRef(null);
  const paymentsRef = useRef(null);
  const cardRef = useRef(null);

  // Load Square Web Payments SDK (sandbox for development, production for production)
  useEffect(() => {
    const script = document.createElement("script");

    // Use environment variable to determine Square SDK URL
    const environment = import.meta.env.VITE_SQUARE_ENVIRONMENT || "sandbox";
    const squareSdkUrl =
      environment === "production"
        ? "https://web.squarecdn.com/v1/square.js" // Production URL
        : "https://sandbox.web.squarecdn.com/v1/square.js"; // Sandbox URL

    script.src = squareSdkUrl;
    script.async = true;
    script.onload = () => {
      setIsSquareLoaded(true);
    };
    script.onerror = (e) => {
      console.error("Failed to load Square Web Payments SDK", e);
      if (onPaymentError) onPaymentError("Failed to load payment system");
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [onPaymentError]);

  // Initialize Square Payments
  useEffect(() => {
    if (!isSquareLoaded || !window.Square || paymentsRef.current) return;

    const initializeSquare = async () => {
      try {
        // Debug: Check if environment variables are loaded
        const appId = import.meta.env.VITE_SQUARE_APPLICATION_ID;
        const locationId = import.meta.env.VITE_SQUARE_LOCATION_ID;

        if (!appId || !locationId) {
          throw new Error(
            "Square environment variables are not set. Please check your .env file."
          );
        }

        const payments = window.Square.payments(appId, locationId);
        paymentsRef.current = payments;

        const card = await payments.card();
        await card.attach("#square-card-container");
        cardRef.current = card;
        console.log("Square card element attached");
      } catch (error) {
        console.error("Error initializing Square:", error);
        if (onPaymentError)
          onPaymentError("Failed to initialize payment system");
      }
    };

    initializeSquare();
  }, [isSquareLoaded, onPaymentError]);

  const handlePayment = async () => {
    if (!cardRef.current || isLoading) return;

    setIsLoading(true);
    try {
      // Tokenize the payment method
      const result = await cardRef.current.tokenize();

      if (result.status === "OK") {
        // Token created successfully
        const { token } = result;

        // Call your backend to process the payment
        console.log("Sending payment request with token:", token);
        console.log("Amount:", amount);

        const response = await api.post("/payments/process", {
          sourceId: token,
          amount: amount,
          currency: "AUD",
          ...(giftCardData && { giftCardData }), // Include gift card data if present
        });

        console.log("Payment response status:", response.status);

        const data = response.data;

        if (data.success) {
          // Pass both payment data and any warnings or gift card info
          onPaymentSuccess({
            ...data.payment,
            warning: data.warning,
            giftCard: data.giftCard,
          });
        } else {
          console.error("Payment failed:", data.message || "Payment failed");
          if (onPaymentError) onPaymentError(data.message || "Payment failed");
        }
      } else {
        // Tokenization failed
        console.error("Tokenization failed:", result.errors);
        const errorMessage = result.errors?.[0]?.detail || "Payment failed";
        if (onPaymentError) onPaymentError(errorMessage);
      }
    } catch (error) {
      console.error("Payment error:", error);
      if (onPaymentError) onPaymentError("Payment processing failed");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSquareLoaded) {
    return (
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-6">
        <div className="flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-cyan-400 mr-2" />
          <span className="text-gray-300">Loading payment system...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 border border-gray-600 rounded-lg p-6">
      <div className="flex items-center gap-3 text-gray-400 mb-4">
        <CreditCard className="h-6 w-6 text-cyan-400" />
        <p>Pay securely with your credit or debit card</p>
      </div>

      {/* Square Card Container */}
      <div
        id="square-card-container"
        className="mb-4 min-h-[50px] bg-white rounded border"
        style={{
          minHeight: "50px",
        }}
      ></div>

      {/* Payment Amount */}
      <div className="flex justify-between items-center mb-4 p-3 bg-gray-700 rounded">
        <span className="text-gray-300">Total Amount:</span>
        <span className="text-green-400 font-bold text-lg">
          ${amount.toFixed(2)} AUD
        </span>
      </div>

      {/* Pay Button */}
      <button
        ref={cardButtonRef}
        onClick={handlePayment}
        disabled={disabled || isLoading || !cardRef.current}
        className="w-full py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-lg shadow-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-green-500 disabled:hover:to-green-600"
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            Processing Payment...
          </div>
        ) : (
          `Pay $${amount.toFixed(2)} AUD`
        )}
      </button>

      {/* Security Notice */}
      <div className="mt-4 text-xs text-gray-400 text-center">
        <p>🔒 Your payment information is secure and encrypted</p>
        <p>Powered by Square Payment Processing</p>
      </div>
    </div>
  );
};

export default SquarePaymentForm;
