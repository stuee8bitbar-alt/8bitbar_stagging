import React, { useState, useEffect } from "react";
import api from "../../utils/axios";
import GiftCardStats from "../../components/admin/GiftCardStats";
import GiftCardFilters from "../../components/admin/GiftCardFilters";
import GiftCardTable from "../../components/admin/GiftCardTable";
import GiftCardForm from "../../components/admin/GiftCardForm";
import GiftCardDetails from "../../components/admin/GiftCardDetails";
import Pagination from "../../components/admin/Pagination";

const GiftCardManagement = () => {
  const [giftCards, setGiftCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedGiftCard, setSelectedGiftCard] = useState(null);
  const [stats, setStats] = useState({});
  const [filters, setFilters] = useState({
    status: "",
    type: "",
    search: "",
    page: 1,
    limit: 20,
  });
  const [pagination, setPagination] = useState({});

  // Form state
  const [formData, setFormData] = useState({
    amount: "",
    type: "predefined",
    description: "",
    expiresAt: "",
    code: "",
  });

  useEffect(() => {
    fetchGiftCards();
    fetchStats();
  }, [filters]);

  const fetchGiftCards = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      Object.keys(filters).forEach((key) => {
        if (filters[key]) params.append(key, filters[key]);
      });

      const response = await api.get(`/admin/giftcards?${params}`);
      setGiftCards(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Error fetching gift cards:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get("/admin/giftcards/stats/summary");
      setStats(response.data.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleCreateGiftCard = async (e) => {
    e.preventDefault();
    try {
      await api.post("/admin/giftcards", formData);
      setShowCreateModal(false);
      setFormData({
        amount: "",
        type: "predefined",
        description: "",
        expiresAt: "",
        code: "",
      });
      fetchGiftCards();
      fetchStats();
    } catch (error) {
      console.error("Error creating gift card:", error);
      alert("Failed to create gift card");
    }
  };

  const handleUpdateGiftCard = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/admin/giftcards/${selectedGiftCard._id}`, formData);
      setShowEditModal(false);
      setSelectedGiftCard(null);
      setFormData({
        amount: "",
        type: "predefined",
        description: "",
        expiresAt: "",
        code: "",
      });
      fetchGiftCards();
      fetchStats();
    } catch (error) {
      console.error("Error updating gift card:", error);
      alert("Failed to update gift card");
    }
  };

  const handleDiscardGiftCard = async (id) => {
    if (!confirm("Are you sure you want to discard this gift card?")) return;

    try {
      await api.delete(`/admin/giftcards/${id}`);
      fetchGiftCards();
      fetchStats();
    } catch (error) {
      console.error("Error discarding gift card:", error);
      alert("Failed to discard gift card");
    }
  };

  const handleActivateGiftCard = async (id) => {
    try {
      await api.post(`/admin/giftcards/${id}/activate`);
      fetchGiftCards();
      fetchStats();
    } catch (error) {
      console.error("Error activating gift card:", error);
      alert("Failed to activate gift card");
    }
  };

  const openEditModal = (giftCard) => {
    setSelectedGiftCard(giftCard);
    setFormData({
      amount: giftCard.amount,
      type: giftCard.type,
      description: giftCard.description || "",
      expiresAt: giftCard.expiresAt
        ? new Date(giftCard.expiresAt).toISOString().split("T")[0]
        : "",
      code: giftCard.code,
      isActive: giftCard.isActive,
    });
    setShowEditModal(true);
  };

  const openViewModal = (giftCard) => {
    setSelectedGiftCard(giftCard);
    setShowViewModal(true);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Gift Card Management
          </h1>
          <p className="text-gray-600 mt-2">
            Manage gift cards, create new ones, and track usage
          </p>
        </div>

        {/* Stats Cards */}
        <GiftCardStats stats={stats} />

        {/* Controls */}
        <GiftCardFilters
          filters={filters}
          setFilters={setFilters}
          onCreateClick={() => setShowCreateModal(true)}
        />

        {/* Gift Cards Table */}
        <GiftCardTable
          giftCards={giftCards}
          loading={loading}
          onView={openViewModal}
          onEdit={openEditModal}
          onDiscard={handleDiscardGiftCard}
          onActivate={handleActivateGiftCard}
        />

        {/* Pagination */}
        <Pagination
          pagination={pagination}
          currentPage={filters.page}
          onPageChange={(page) => setFilters({ ...filters, page })}
        />
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <GiftCardForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleCreateGiftCard}
          onCancel={() => setShowCreateModal(false)}
          title="Create New Gift Card"
          submitText="Create"
          isEdit={false}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && selectedGiftCard && (
        <GiftCardForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleUpdateGiftCard}
          onCancel={() => setShowEditModal(false)}
          title="Edit Gift Card"
          submitText="Update"
          isEdit={true}
        />
      )}

      {/* View Modal */}
      {showViewModal && selectedGiftCard && (
        <GiftCardDetails
          giftCard={selectedGiftCard}
          onClose={() => setShowViewModal(false)}
        />
      )}
    </div>
  );
};

export default GiftCardManagement;
