import React from "react";
import { CheckCircle, XCircle, Loader2, AlertCircle } from "lucide-react";

const PaymentConfirmationModal = ({
  isOpen,
  onClose,
  status, // 'loading', 'success', 'error'
  message,
  paymentData,
  giftCardData, // Add gift card data prop
}) => {
  if (!isOpen) return null;

  const getStatusContent = () => {
    switch (status) {
      case "loading":
        return {
          icon: <Loader2 className="h-12 w-12 animate-spin text-cyan-400" />,
          title: "Processing Payment...",
          message:
            "Please wait while we process your payment and create your booking.",
          bgColor: "bg-blue-900/80",
          borderColor: "border-cyan-500",
        };
      case "success":
        return {
          icon: <CheckCircle className="h-12 w-12 text-green-400" />,
          title: "Payment Successful!",
          message:
            "Your booking has been confirmed. Check your bookings in your account.",
          bgColor: "bg-green-900/80",
          borderColor: "border-green-500",
        };
      case "error":
        return {
          icon: <XCircle className="h-12 w-12 text-red-400" />,
          title: "Payment Failed",
          message:
            message ||
            "There was an issue processing your payment. Please try again.",
          bgColor: "bg-red-900/80",
          borderColor: "border-red-500",
        };
      default:
        return {
          icon: <AlertCircle className="h-12 w-12 text-yellow-400" />,
          title: "Processing...",
          message: "Please wait...",
          bgColor: "bg-gray-900/80",
          borderColor: "border-gray-500",
        };
    }
  };

  const content = getStatusContent();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div
        className={`relative max-w-md w-full ${content.bgColor} border ${content.borderColor} rounded-lg p-6 shadow-2xl`}
      >
        <div className="text-center">
          {/* Icon */}
          <div className="flex justify-center mb-4">{content.icon}</div>

          {/* Title */}
          <h3 className="text-xl font-bold text-white mb-3">{content.title}</h3>

          {/* Message */}
          <p className="text-gray-300 mb-4">{content.message}</p>

          {/* Payment Details (for success) */}
          {status === "success" && paymentData && (
            <div className="bg-green-800/50 border border-green-600 rounded-lg p-4 mb-4">
              <div className="text-sm text-green-300 space-y-1">
                <p>
                  <strong>Payment ID:</strong> {paymentData.id}
                </p>
                <p>
                  <strong>Amount:</strong> $
                  {(paymentData.amountMoney?.amount / 100).toFixed(2)}{" "}
                  {paymentData.amountMoney?.currency}
                </p>
                <p>
                  <strong>Status:</strong> {paymentData.status}
                </p>
              </div>
            </div>
          )}

          {/* Gift Card Details (for success) */}
          {status === "success" && giftCardData && (
            <div className="bg-blue-900/50 border border-blue-600 rounded-lg p-4 mb-4">
              <div className="text-center">
                <h4 className="text-lg font-bold text-blue-300 mb-3">
                  🎁 Gift Card Created Successfully!
                </h4>
                <div className="text-sm text-blue-200 space-y-2">
                  <p>
                    <strong>Code:</strong>{" "}
                    <span className="font-mono text-blue-100">
                      {giftCardData.code}
                    </span>
                  </p>
                  <p>
                    <strong>PIN:</strong>{" "}
                    <span className="font-mono text-blue-100">
                      {giftCardData.pin}
                    </span>
                  </p>
                  <p>
                    <strong>Amount:</strong> ${giftCardData.amount.toFixed(2)}
                  </p>
                  <p>
                    <strong>Type:</strong>{" "}
                    {giftCardData.type === "custom" ? "Custom" : "Predefined"}
                  </p>
                </div>
                <div className="mt-3 p-2 bg-yellow-900/30 border border-yellow-600/50 rounded text-xs text-yellow-200">
                  ⚠️ Please save your Code and PIN securely. You'll need them to
                  redeem your gift card.
                </div>
              </div>
            </div>
          )}

          {/* Error Details (for error) */}
          {status === "error" && (
            <div className="bg-red-800/50 border border-red-600 rounded-lg p-4 mb-4">
              <div className="text-sm text-red-300">
                <p>
                  <strong>Error:</strong> {message}
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            {status === "error" && (
              <button
                onClick={onClose}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                Try Again
              </button>
            )}
            <button
              onClick={onClose}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
              {status === "success" ? "Close" : "Cancel"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentConfirmationModal;
