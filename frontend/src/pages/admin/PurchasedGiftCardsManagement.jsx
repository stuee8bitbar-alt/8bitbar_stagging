import React, { useState, useEffect } from "react";
import {
  MagnifyingGlassIcon,
  CreditCardIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import api from "../../utils/axios";

const PurchasedGiftCardsManagement = () => {
  const [giftCards, setGiftCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [redeemAmount, setRedeemAmount] = useState("");
  const [redeemReason, setRedeemReason] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Validation form state
  const [showValidateForm, setShowValidateForm] = useState(false);
  const [validateCode, setValidateCode] = useState("");
  const [validatePin, setValidatePin] = useState("");

  useEffect(() => {
    fetchGiftCards();
  }, []);

  const fetchGiftCards = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/purchased-giftcards", {
        params: {
          search: searchTerm,
          status: statusFilter,
          limit: 50,
        },
      });
      setGiftCards(response.data.data);
    } catch (error) {
      console.error("Error fetching gift cards:", error);
      setError("Failed to fetch gift cards");
    } finally {
      setLoading(false);
    }
  };

  const handleValidateGiftCard = async (e) => {
    e.preventDefault();

    if (!validateCode.trim() || !validatePin.trim()) {
      setError("Please enter both code and PIN");
      return;
    }

    if (validatePin.length !== 6) {
      setError("PIN must be exactly 6 digits");
      return;
    }

    try {
      setError("");
      const response = await api.post("/admin/purchased-giftcards/validate", {
        code: validateCode,
        pin: validatePin,
      });

      const giftCard = response.data.data;
      setSelectedCard(giftCard);
      setShowValidateForm(false);
      setShowRedeemModal(true);
      setValidateCode("");
      setValidatePin("");
    } catch (error) {
      console.error("Error validating gift card:", error);
      setError(
        error.response?.data?.message || "Invalid gift card code or PIN"
      );
    }
  };

  const handleOfflineRedeem = async (e) => {
    e.preventDefault();

    if (!redeemAmount || redeemAmount <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    if (parseFloat(redeemAmount) > selectedCard.balance) {
      setError(
        `Amount exceeds available balance ($${selectedCard.balance.toFixed(2)})`
      );
      return;
    }

    try {
      setError("");
      setSuccess("");

      console.log("Frontend redeem request:", {
        selectedCard,
        selectedCardId: selectedCard._id,
        amount: parseFloat(redeemAmount),
        reason: redeemReason || "Offline redemption by admin",
      });

      const response = await api.post(
        `/admin/purchased-giftcards/${selectedCard._id}/offline-redeem`,
        {
          amount: parseFloat(redeemAmount),
          reason: redeemReason || "Offline redemption by admin",
        }
      );

      setSuccess(response.data.message);
      setShowRedeemModal(false);
      setSelectedCard(null);
      setRedeemAmount("");
      setRedeemReason("");
      fetchGiftCards();
    } catch (error) {
      console.error("Error redeeming gift card:", error);
      setError(error.response?.data?.message || "Failed to redeem gift card");
    }
  };

  const handleMarkAsRedeemed = async (cardId, forceRedeem = false) => {
    const confirmMessage = forceRedeem
      ? "This will mark the gift card as fully redeemed and forfeit any remaining balance. Are you sure?"
      : "Are you sure you want to mark this gift card as fully redeemed?";

    if (window.confirm(confirmMessage)) {
      try {
        await api.post(`/admin/purchased-giftcards/${cardId}/mark-redeemed`, {
          forceRedeem,
          reason: forceRedeem
            ? "Force redeemed by admin"
            : "Marked as redeemed by admin",
        });
        setSuccess("Gift card marked as redeemed successfully!");
        fetchGiftCards();
      } catch (error) {
        console.error("Error marking gift card as redeemed:", error);
        setError(
          error.response?.data?.message ||
            "Failed to mark gift card as redeemed"
        );
      }
    }
  };

  const filteredGiftCards = giftCards.filter((card) => {
    const matchesSearch =
      card.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.purchasedBy?.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      card.purchasedBy?.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = !statusFilter || card.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircleIcon className="w-3 h-3 mr-1" />
            Active
          </span>
        );
      case "used":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <XCircleIcon className="w-3 h-3 mr-1" />
            Used
          </span>
        );
      case "discarded":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircleIcon className="w-3 h-3 mr-1" />
            Discarded
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <ClockIcon className="w-3 h-3 mr-1" />
            Unknown
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">
            Purchased Gift Cards Management
          </h1>
          <p className="text-gray-600 text-lg">
            Manage and redeem purchased gift cards for offline usage
          </p>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800">{success}</p>
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by code, description, or customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900"
              />
            </div>
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 bg-white border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="used">Used</option>
              <option value="discarded">Discarded</option>
            </select>
          </div>
          <button
            onClick={fetchGiftCards}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-semibold"
          >
            Refresh
          </button>
        </div>

        {/* Gift Cards Table */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Code
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Balance
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Purchased
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-2 text-gray-600">Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredGiftCards.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <p className="text-gray-500 text-lg">
                        No gift cards found.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredGiftCards.map((card) => (
                    <tr key={card._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <span className="font-mono font-bold text-blue-600">
                          {card.code}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">
                            {card.purchasedBy?.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {card.purchasedBy?.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-lg font-bold text-green-600">
                          ${card.amount.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-lg font-bold ${
                            card.balance > 0
                              ? "text-green-600"
                              : "text-gray-400"
                          }`}
                        >
                          ${card.balance.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(card.status)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(card.purchasedAt).toLocaleDateString(
                          "en-US",
                          {
                            timeZone: "UTC",
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          {card.status === "active" && card.balance > 0 && (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedCard(card);
                                  setShowRedeemModal(true);
                                }}
                                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-all duration-200"
                              >
                                Redeem
                              </button>
                              <button
                                onClick={() =>
                                  handleMarkAsRedeemed(card._id, true)
                                }
                                className="px-3 py-1 text-sm bg-orange-600 text-white rounded hover:bg-orange-700 transition-all duration-200"
                              >
                                Force Complete
                              </button>
                            </>
                          )}
                          {card.status === "active" && card.balance === 0 && (
                            <button
                              onClick={() =>
                                handleMarkAsRedeemed(card._id, false)
                              }
                              className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-all duration-200"
                            >
                              Mark Used
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Offline Redeem Modal */}
        {showRedeemModal && selectedCard && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Offline Redemption
              </h3>

              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-2">
                  Gift Card Details:
                </div>
                <div className="font-mono font-bold text-blue-600 mb-1">
                  {selectedCard.code}
                </div>
                <div className="text-sm text-gray-700">
                  Available Balance:{" "}
                  <span className="font-bold text-green-600">
                    ${selectedCard.balance.toFixed(2)}
                  </span>
                </div>
              </div>

              <form onSubmit={handleOfflineRedeem} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount to Redeem ($)
                  </label>
                  <input
                    type="number"
                    min="0.01"
                    max={selectedCard.balance}
                    step="0.01"
                    value={redeemAmount}
                    onChange={(e) => setRedeemAmount(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900"
                    placeholder="Enter amount"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason (Optional)
                  </label>
                  <input
                    type="text"
                    value={redeemReason}
                    onChange={(e) => setRedeemReason(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900"
                    placeholder="e.g., In-store purchase, cafe order"
                  />
                </div>

                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 font-semibold"
                  >
                    Redeem ${redeemAmount || "0.00"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowRedeemModal(false);
                      setSelectedCard(null);
                      setRedeemAmount("");
                      setRedeemReason("");
                      setError("");
                    }}
                    className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PurchasedGiftCardsManagement;
