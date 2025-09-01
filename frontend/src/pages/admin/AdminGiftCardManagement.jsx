import React, { useState, useEffect } from "react";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";
import api from "../../utils/axios";

const AdminGiftCardManagement = () => {
  const [giftCards, setGiftCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    imageUrl: "/home_images/logo.png",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchGiftCards();
  }, []);

  const fetchGiftCards = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/giftcard-management");
      setGiftCards(response.data.data);
    } catch (error) {
      console.error("Error fetching gift cards:", error);
      setError("Failed to fetch gift cards");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.amount || formData.amount <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    try {
      setError("");
      setSuccess("");

      if (editingCard) {
        // Update existing gift card
        await api.put(
          `/admin/giftcard-management/${editingCard._id}`,
          formData
        );
        setSuccess("Gift card updated successfully!");
      } else {
        // Create new gift card
        await api.post("/admin/giftcard-management", formData);
        setSuccess("Gift card created successfully!");
      }

      // Reset form and refresh data
      setFormData({
        amount: "",
        description: "",
        imageUrl: "/home_images/logo.png",
      });
      setEditingCard(null);
      setShowForm(false);
      fetchGiftCards();
    } catch (error) {
      console.error("Error saving gift card:", error);
      setError(error.response?.data?.message || "Failed to save gift card");
    }
  };

  const handleEdit = (card) => {
    setEditingCard(card);
    setFormData({
      amount: card.amount.toString(),
      description: card.description || "",
      imageUrl: card.imageUrl || "/home_images/logo.png",
    });
    setShowForm(true);
  };

  const handleDelete = async (cardId) => {
    if (window.confirm("Are you sure you want to delete this gift card?")) {
      try {
        await api.delete(`/admin/giftcard-management/${cardId}`);
        setSuccess("Gift card deleted successfully!");
        fetchGiftCards();
      } catch (error) {
        console.error("Error deleting gift card:", error);
        setError(error.response?.data?.message || "Failed to delete gift card");
      }
    }
  };

  const handleToggleVisibility = async (cardId) => {
    try {
      await api.post(`/admin/giftcard-management/${cardId}/toggle-visibility`);
      setSuccess("Gift card visibility updated successfully!");
      fetchGiftCards();
    } catch (error) {
      console.error("Error toggling visibility:", error);
      setError(error.response?.data?.message || "Failed to update visibility");
    }
  };

  const resetForm = () => {
    setFormData({
      amount: "",
      description: "",
      imageUrl: "/home_images/logo.png",
    });
    setEditingCard(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">
            Gift Card Templates
          </h1>
          <p className="text-gray-600 text-lg">
            Create simple gift card templates for users to purchase directly
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

        {/* Create/Edit Form */}
        {showForm && (
          <div className="mb-8 bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingCard
                ? "Edit Gift Card Template"
                : "Create New Gift Card Template"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount ($) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    required
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900"
                    placeholder="Enter amount"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900"
                    placeholder="e.g., Gaming Gift Card"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image URL
                </label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, imageUrl: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900"
                  placeholder="Image URL for the gift card"
                />
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-semibold"
                >
                  {editingCard ? "Update Template" : "Create Template"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">
            Gift Card Templates
          </h2>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 font-semibold"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Create New Template
            </button>
          )}
        </div>

        {/* Gift Cards Table */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Description
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {giftCards.map((card) => (
                  <tr key={card._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className="text-lg font-bold text-green-600">
                        ${card.amount.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {card.description || `Gift Card $${card.amount}`}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            card.isActive && card.isVisible
                              ? "bg-green-100 text-green-800 border border-green-200"
                              : "bg-red-100 text-red-800 border border-red-200"
                          }`}
                        >
                          {card.isActive && card.isVisible
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(card)}
                          className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200"
                          title="Edit"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleVisibility(card._id)}
                          className="p-2 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 rounded-lg transition-all duration-200"
                          title={card.isVisible ? "Hide" : "Show"}
                        >
                          {card.isVisible ? (
                            <EyeSlashIcon className="w-4 h-4" />
                          ) : (
                            <EyeIcon className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(card._id)}
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                          title="Delete"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {giftCards.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                No gift card templates created yet.
              </p>
              <p className="text-gray-400 text-sm mt-2">
                Create your first gift card template to get started.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminGiftCardManagement;
