import React, { useState, useEffect } from "react";
import api from "../../utils/axios";
import {
  MdAdd,
  MdEdit,
  MdDelete,
  MdMoreVert,
  MdLock,
  MdLockOpen,
} from "react-icons/md";

const PinManagement = () => {
  const [pins, setPins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPin, setEditingPin] = useState(null);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [formData, setFormData] = useState({
    pin: "",
    staffName: "",
    adminUserId: "",
  });
  const [adminUsers, setAdminUsers] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showMenu, setShowMenu] = useState(null);

  useEffect(() => {
    fetchPins();
    fetchAdminUsers();
  }, []);

  const fetchPins = async () => {
    try {
      setLoading(true);
      const response = await api.get("/superadmin/");
      setPins(response.data.pins);
    } catch (error) {
      console.error("Error fetching PINs:", error);
      setError("Failed to fetch PINs");
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminUsers = async () => {
    try {
      const response = await api.get("/admin/users");
      const adminUsers = response.data.users.filter(
        (user) => user.role === "admin" || user.role === "superadmin"
      );
      setAdminUsers(adminUsers);
    } catch (error) {
      console.error("Error fetching admin users:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "pin") {
      // Only allow 4 digits for PIN
      if (/^\d{0,4}$/.test(value)) {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const openCreateModal = (admin) => {
    setSelectedAdmin(admin);
    setFormData({
      pin: "",
      staffName: admin.name, // Automatically use admin's name
      adminUserId: admin._id,
    });
    setShowCreateModal(true);
    setShowMenu(null);
  };

  const openEditModal = (pin) => {
    setEditingPin(pin);
    setSelectedAdmin(pin.adminUserId);
    setFormData({
      pin: pin.pin,
      staffName: pin.adminUserId.name, // Use admin's name from database
      adminUserId: pin.adminUserId._id,
    });
    setShowEditModal(true);
    setShowMenu(null);
  };

  const handleCreatePin = async (e) => {
    e.preventDefault();

    if (!formData.pin || !formData.adminUserId) {
      setError("PIN is required");
      return;
    }

    if (formData.pin.length !== 4) {
      setError("PIN must be exactly 4 digits");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await api.post("/superadmin/", formData);

      if (response.data.success) {
        setSuccess("Staff PIN created successfully");
        setFormData({ pin: "", staffName: "", adminUserId: "" });
        setShowCreateModal(false);
        setSelectedAdmin(null);
        fetchPins();
      }
    } catch (error) {
      console.error("Error creating PIN:", error);
      setError(error.response?.data?.message || "Failed to create PIN");
    } finally {
      setLoading(false);
    }
  };

  const handleEditPin = async (e) => {
    e.preventDefault();

    if (!editingPin) return;

    try {
      setLoading(true);
      setError("");

      const response = await api.put(`/superadmin/${editingPin._id}`, formData);

      if (response.data.success) {
        setSuccess("Staff PIN updated successfully");
        setEditingPin(null);
        setFormData({ pin: "", staffName: "", adminUserId: "" });
        setShowEditModal(false);
        setSelectedAdmin(null);
        fetchPins();
      }
    } catch (error) {
      console.error("Error updating PIN:", error);
      setError(error.response?.data?.message || "Failed to update PIN");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePin = async (pinId) => {
    if (!window.confirm("Are you sure you want to delete this PIN?")) return;

    try {
      setLoading(true);
      const response = await api.delete(`/superadmin/${pinId}`);

      if (response.data.success) {
        setSuccess("Staff PIN deleted successfully");
        fetchPins();
      }
    } catch (error) {
      console.error("Error deleting PIN:", error);
      setError("Failed to delete PIN");
    } finally {
      setLoading(false);
    }
  };

  const closeModals = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setEditingPin(null);
    setSelectedAdmin(null);
    setFormData({ pin: "", staffName: "", adminUserId: "" });
    setError("");
  };

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  const [menuPositions, setMenuPositions] = useState({});

  const toggleMenu = (userId, event) => {
    if (showMenu === userId) {
      setShowMenu(null);
      return;
    }

    // Calculate if menu should open upward
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    // If there's more space above than below, open upward
    const shouldOpenUp = spaceAbove > spaceBelow && spaceBelow < 200;

    setMenuPositions((prev) => ({
      ...prev,
      [userId]: shouldOpenUp ? "up" : "down",
    }));
    setShowMenu(userId);
  };

  const getPinForAdmin = (adminId) => {
    return pins.find((pin) => pin.adminUserId._id === adminId);
  };

  useEffect(() => {
    const timer = setTimeout(clearMessages, 5000);
    return () => clearTimeout(timer);
  }, [error, success]);

  if (loading && adminUsers.length === 0) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Staff PIN Management
          </h1>
          <p className="text-gray-600 mt-2">
            Manage PIN codes for admin and super admin users. Each user can have
            one PIN for staff identification.
          </p>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800">{success}</p>
          </div>
        )}

        {/* Admin Users Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminUsers.map((admin) => {
            const existingPin = getPinForAdmin(admin._id);
            return (
              <div
                key={admin._id}
                className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
              >
                {/* Admin User Info */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {admin.name}
                      </h3>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          admin.role === "superadmin"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {admin.role === "superadmin" ? "Super Admin" : "Admin"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{admin.email}</p>

                    {/* PIN Status */}
                    <div className="flex items-center space-x-2 mb-4">
                      {existingPin ? (
                        <>
                          <MdLock className="text-green-600" size={20} />
                          <span className="text-sm font-medium text-green-800">
                            PIN: {existingPin.pin}
                          </span>
                        </>
                      ) : (
                        <>
                          <MdLockOpen className="text-gray-400" size={20} />
                          <span className="text-sm text-gray-500">
                            No PIN set
                          </span>
                        </>
                      )}
                    </div>

                    {/* Staff Name */}
                    <div className="text-sm text-gray-700 mb-3">
                      <span className="font-medium">Staff Name:</span>{" "}
                      {existingPin ? existingPin.staffName : admin.name}
                    </div>

                    {/* Last Used */}
                    <div className="text-sm text-gray-500">
                      <span className="font-medium">Last Used:</span>{" "}
                      {existingPin?.lastUsed
                        ? new Date(existingPin.lastUsed).toLocaleDateString("en-US", {
                            timeZone: "UTC",
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : existingPin
                        ? "Never"
                        : "-"}
                    </div>
                  </div>

                  {/* Actions Menu */}
                  <div className="relative">
                    <button
                      onClick={(e) => toggleMenu(admin._id, e)}
                      className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <MdMoreVert size={20} />
                    </button>

                    {showMenu === admin._id && (
                      <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                        {existingPin ? (
                          <>
                            <button
                              onClick={() => openEditModal(existingPin)}
                              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              <MdEdit size={16} className="mr-2" />
                              Change PIN
                            </button>
                            <button
                              onClick={() => handleDeletePin(existingPin._id)}
                              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                              <MdDelete size={16} className="mr-2" />
                              Delete PIN
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => openCreateModal(admin)}
                            className="flex items-center w-full px-4 py-2 text-sm text-blue-600 hover:bg-blue-50"
                          >
                            <MdLock size={16} className="mr-2" />
                            Set PIN
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {adminUsers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <MdLock size={48} />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Admin Users Found
            </h3>
            <p className="text-gray-500">
              There are no admin or super admin users to manage PINs for.
            </p>
          </div>
        )}
      </div>

      {/* Create PIN Modal */}
      {showCreateModal && selectedAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Set PIN for {selectedAdmin.name}
              </h2>
              <button
                onClick={closeModals}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreatePin} className="space-y-4">
              <div>
                <label
                  htmlFor="pin"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  PIN Code (4 digits)
                </label>
                <input
                  type="text"
                  id="pin"
                  name="pin"
                  value={formData.pin}
                  onChange={handleInputChange}
                  placeholder="0000"
                  maxLength={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-lg tracking-widest text-gray-900"
                  required
                />
              </div>

              {/* Staff name is automatically set to admin's name */}
              <div className="p-3 bg-gray-50 rounded-md">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Staff Name
                </label>
                <p className="text-sm text-gray-600">
                  {formData.staffName} (automatically set from admin account)
                </p>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? "Setting PIN..." : "Set PIN"}
                </button>
                <button
                  type="button"
                  onClick={closeModals}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit PIN Modal */}
      {showEditModal && editingPin && selectedAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Change PIN for {selectedAdmin.name}
              </h2>
              <button
                onClick={closeModals}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleEditPin} className="space-y-4">
              <div>
                <label
                  htmlFor="editPin"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  PIN Code (4 digits)
                </label>
                <input
                  type="text"
                  id="editPin"
                  name="pin"
                  value={formData.pin}
                  onChange={handleInputChange}
                  placeholder="0000"
                  maxLength={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-lg tracking-widest text-gray-900"
                  required
                />
              </div>

              {/* Staff name is automatically set to admin's name */}
              <div className="p-3 bg-gray-50 rounded-md">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Staff Name
                </label>
                <p className="text-sm text-gray-600">
                  {formData.staffName} (automatically set from admin account)
                </p>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? "Updating..." : "Update PIN"}
                </button>
                <button
                  type="button"
                  onClick={closeModals}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PinManagement;
