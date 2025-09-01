import React, { useState } from "react";
import {
  GiftIcon,
  XMarkIcon,
  CheckIcon,
  LockClosedIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";
import api from "../utils/axios";

const GiftCardRedeem = ({ onGiftCardApplied, totalAmount }) => {
  const [giftCardCode, setGiftCardCode] = useState("");
  const [giftCardPin, setGiftCardPin] = useState("");
  const [redeemAmount, setRedeemAmount] = useState("");
  const [appliedGiftCards, setAppliedGiftCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  const handleValidateGiftCard = async () => {
    if (!giftCardCode.trim() || !giftCardPin.trim()) {
      setError("Please enter both gift card code and PIN");
      return;
    }

    if (giftCardPin.length !== 6) {
      setError("PIN must be exactly 6 digits");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const response = await api.post("/giftcards/validate", {
        code: giftCardCode,
        pin: giftCardPin,
      });

      const giftCard = response.data.data;

      // Check if this gift card is already applied
      const existingGiftCard = appliedGiftCards.find(
        (card) => card.code === giftCardCode
      );

      let availableBalance = giftCard.balance;
      let maxRedeemable = availableBalance;

      if (existingGiftCard) {
        // If gift card is already applied, show remaining balance
        availableBalance = existingGiftCard.remainingBalance;
        maxRedeemable = Math.min(availableBalance, totalAmount);

        if (availableBalance <= 0) {
          setError("This gift card has no remaining balance available");
          return;
        }
      } else {
        // New gift card, use full balance
        maxRedeemable = Math.min(giftCard.balance, totalAmount);
      }

      // Don't auto-set redeem amount, let user decide
      // setRedeemAmount(maxRedeemable.toString());

      setSuccess(
        `Gift card validated! Available balance: $${availableBalance.toFixed(
          2
        )}. Enter the amount you want to use below.`
      );
    } catch (error) {
      console.error("Error validating gift card:", error);
      setError(
        error.response?.data?.message || "Invalid gift card code or PIN"
      );
      setSuccess("");
    } finally {
      setLoading(false);
    }
  };

  const handleApplyGiftCard = async () => {
    if (
      !giftCardCode.trim() ||
      !giftCardPin.trim() ||
      !redeemAmount ||
      redeemAmount <= 0
    ) {
      setError("Please enter valid gift card code, PIN, and amount");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      // Only validate the gift card, don't redeem yet
      const response = await api.post("/giftcards/validate", {
        code: giftCardCode,
        pin: giftCardPin,
      });

      const giftCard = response.data.data;

      // Check if this gift card is already applied
      const existingGiftCard = appliedGiftCards.find(
        (card) => card.code === giftCardCode
      );

      let availableBalance = giftCard.balance;
      if (existingGiftCard) {
        // If gift card is already applied, use remaining balance
        availableBalance = existingGiftCard.remainingBalance;
      }

      // Check if the gift card has sufficient balance
      if (availableBalance < parseFloat(redeemAmount)) {
        setError(
          `Insufficient balance. Available: $${availableBalance.toFixed(2)}`
        );
        return;
      }

      // Create a pending gift card application (not redeemed yet)
      const pendingGiftCard = {
        code: giftCardCode,
        pin: giftCardPin,
        amountUsed: parseFloat(redeemAmount),
        remainingBalance: availableBalance - parseFloat(redeemAmount),
        isFullyUsed: availableBalance === parseFloat(redeemAmount),
        balance: availableBalance, // Store available balance for validation
        isPending: true, // Mark as pending until payment is successful
      };

      if (existingGiftCard) {
        // Update existing gift card with new amount
        const updatedGiftCards = appliedGiftCards.map((card) =>
          card.code === giftCardCode
            ? {
                ...card,
                amountUsed: card.amountUsed + parseFloat(redeemAmount),
                remainingBalance: availableBalance - parseFloat(redeemAmount),
                isFullyUsed: availableBalance === parseFloat(redeemAmount),
              }
            : card
        );
        setAppliedGiftCards(updatedGiftCards);

        // Notify parent component about updated application
        onGiftCardApplied(pendingGiftCard, false, existingGiftCard);

        setSuccess(
          `Additional $${redeemAmount} applied from gift card ${giftCardCode}! Total used: $${(
            existingGiftCard.amountUsed + parseFloat(redeemAmount)
          ).toFixed(2)}`
        );
      } else {
        // Add new gift card
        setAppliedGiftCards([...appliedGiftCards, pendingGiftCard]);
        onGiftCardApplied(pendingGiftCard);

        setSuccess(
          "Gift card applied successfully! Will be redeemed after payment completion."
        );
      }

      // Reset form
      setGiftCardCode("");
      setGiftCardPin("");
      setRedeemAmount("");
    } catch (error) {
      console.error("Error validating gift card:", error);
      setError(
        error.response?.data?.message || "Invalid gift card code or PIN"
      );
      setSuccess("");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveGiftCard = (index) => {
    const removedGiftCard = appliedGiftCards[index];
    const newAppliedGiftCards = appliedGiftCards.filter((_, i) => i !== index);
    setAppliedGiftCards(newAppliedGiftCards);

    // Notify parent component about removal
    onGiftCardApplied(removedGiftCard, true); // true indicates removal
  };

  const getTotalAppliedAmount = () => {
    return appliedGiftCards.reduce((total, card) => total + card.amountUsed, 0);
  };

  const getRemainingTotal = () => {
    return Math.max(0, totalAmount - getTotalAppliedAmount());
  };

  return (
    <div className="bg-black/60 backdrop-blur-sm border border-pink-500/30 rounded-lg shadow-2xl p-4 mb-4">
      {/* Header with Toggle Button */}
      <div
        className="flex items-center justify-between mb-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center">
          <div className="p-1.5 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg mr-2">
            <GiftIcon className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">
            Redeem Gift Card
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          {appliedGiftCards.length > 0 && (
            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full border border-green-500/30">
              {appliedGiftCards.length} Applied
            </span>
          )}
          {isExpanded ? (
            <ChevronUpIcon className="w-5 h-5 text-pink-400 transition-transform duration-200" />
          ) : (
            <ChevronDownIcon className="w-5 h-5 text-pink-400 transition-transform duration-200" />
          )}
        </div>
      </div>

      {/* Collapsible Content */}
      {isExpanded && (
        <>
          {/* Gift Card Input - Vertical Stack Layout */}
          <div className="space-y-3 mb-4">
            {/* Gift Card Code */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Gift Card Code
              </label>
              <input
                type="text"
                value={giftCardCode}
                onChange={(e) => setGiftCardCode(e.target.value.toUpperCase())}
                placeholder="GFT-101"
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-white placeholder-gray-400 transition-all duration-200"
              />
            </div>

            {/* Gift Card PIN */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                PIN
              </label>
              <div className="relative">
                <input
                  type="password"
                  maxLength="6"
                  value={giftCardPin}
                  onChange={(e) =>
                    setGiftCardPin(e.target.value.replace(/\D/g, ""))
                  }
                  placeholder="123456"
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-white placeholder-gray-400 transition-all duration-200 pr-10"
                />
                <LockClosedIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>

            {/* Amount to Use */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Amount to Use ($)
              </label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={redeemAmount}
                onChange={(e) => setRedeemAmount(e.target.value)}
                placeholder="Enter amount to use (e.g., 50.00)"
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-white placeholder-gray-400 transition-all duration-200"
              />
              {redeemAmount && (
                <div className="mt-1 text-xs text-gray-400">
                  {parseFloat(redeemAmount) > totalAmount && (
                    <span className="text-yellow-400">
                      ⚠️ Amount exceeds order total (${totalAmount.toFixed(2)})
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleValidateGiftCard}
                disabled={
                  loading || !giftCardCode.trim() || !giftCardPin.trim()
                }
                className="flex-1 px-3 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg hover:shadow-cyan-500/25 text-sm"
              >
                {loading ? "Validating..." : "Validate"}
              </button>

              <button
                onClick={handleApplyGiftCard}
                disabled={
                  loading ||
                  !giftCardCode.trim() ||
                  !giftCardPin.trim() ||
                  !redeemAmount ||
                  redeemAmount <= 0
                }
                className="flex-1 px-3 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg hover:shadow-pink-500/25 text-sm"
              >
                Apply
              </button>
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div className="mb-3 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-xs">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-3 p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
              <p className="text-green-400 text-xs">{success}</p>
            </div>
          )}

          {/* Applied Gift Cards */}
          {appliedGiftCards.length > 0 && (
            <div className="mb-4">
              <h4 className="text-xs font-medium text-gray-300 mb-2 flex items-center">
                <CheckIcon className="w-4 h-4 text-green-400 mr-1" />
                Applied Gift Cards:
              </h4>
              <div className="space-y-2">
                {appliedGiftCards.map((card, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-green-500/10 border border-green-500/30 rounded-lg p-3 backdrop-blur-sm"
                  >
                    <div className="flex items-center space-x-2">
                      <div className="p-1 bg-green-500/20 rounded-lg">
                        <CheckIcon className="w-4 h-4 text-green-400" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-green-300 text-sm">
                            {card.code}
                          </span>
                          <span className="text-green-400 text-xs">
                            -${card.amountUsed.toFixed(2)}
                          </span>
                          {card.isPending && (
                            <span className="text-xs text-yellow-400 bg-yellow-500/20 px-2 py-0.5 rounded-full">
                              Pending
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-green-400/70">
                          Remaining: ${card.remainingBalance.toFixed(2)}
                          {card.balance !== card.amountUsed && (
                            <span className="text-gray-400 ml-1">
                              (Total: ${card.balance.toFixed(2)})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemoveGiftCard(index)}
                      className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-all duration-200"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Summary */}
          <div className="border-t border-pink-500/20 pt-3 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-300">Subtotal:</span>
              <span className="font-medium text-white">
                ${totalAmount.toFixed(2)}
              </span>
            </div>

            {appliedGiftCards.length > 0 && (
              <>
                <div className="flex justify-between items-center text-xs text-green-400">
                  <span>Gift Cards Applied:</span>
                  <span>-${getTotalAppliedAmount().toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center text-sm font-bold border-t border-pink-500/20 pt-2">
                  <span className="text-white">Remaining Total:</span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">
                    ${getRemainingTotal().toFixed(2)}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Help Text */}
          <div className="mt-4 p-3 bg-white/5 border border-white/10 rounded-lg">
            <h5 className="text-xs font-medium text-gray-300 mb-2 flex items-center">
              <GiftIcon className="w-3 h-3 text-pink-400 mr-1" />
              Gift Card Policy
            </h5>
            <div className="text-xs text-gray-400 space-y-0.5">
              <p>
                • Gift cards can be used partially - remaining balance will be
                saved
              </p>
              <p>• Multiple gift cards can be applied to a single order</p>
              <p>• Gift cards never expire and can be used for any service</p>
              <p>• Both Code and PIN are required for verification</p>
              <p>
                • Gift cards are only redeemed after successful payment
                completion
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default GiftCardRedeem;
