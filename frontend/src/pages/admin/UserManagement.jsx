import React, { useState, useEffect } from "react";
import api from "../../utils/axios";
import {
  MdPerson,
  MdAdminPanelSettings,
  MdDelete,
  MdKeyboardArrowUp,
  MdKeyboardArrowDown,
  MdMoreVert,
  MdRefresh,
  MdAdd,
  MdClose,
} from "react-icons/md";

const UserManagement = () => {
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createUserForm, setCreateUserForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "customer",
  });
  const [creatingUser, setCreatingUser] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAdmins: 0,
    totalAccounts: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, adminsRes, statsRes] = await Promise.all([
        api.get("/admin/users/users"),
        api.get("/admin/users/admins"),
        api.get("/admin/users/stats"),
      ]);

      setUsers(usersRes.data.users || []);
      setAdmins(adminsRes.data.admins || []);
      setStats(statsRes.data);
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleDropdown = (userId) => {
    setDropdownOpen((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  const handlePromoteUser = async (userId) => {
    if (
      !window.confirm("Are you sure you want to promote this user to admin?")
    ) {
      return;
    }

    try {
      await api.patch(`/admin/users/users/${userId}/promote`);
      alert("User promoted to admin successfully!");
      fetchData();
      setDropdownOpen((prev) => ({ ...prev, [userId]: false }));
    } catch (error) {
      console.error("Error promoting user:", error);
      alert(error.response?.data?.message || "Failed to promote user");
    }
  };

  const handleDemoteAdmin = async (adminId) => {
    if (
      !window.confirm("Are you sure you want to demote this admin to user?")
    ) {
      return;
    }

    try {
      await api.patch(`/admin/users/admins/${adminId}/demote`);
      alert("Admin demoted to user successfully!");
      fetchData();
      setDropdownOpen((prev) => ({ ...prev, [adminId]: false }));
    } catch (error) {
      console.error("Error demoting admin:", error);
      alert(error.response?.data?.message || "Failed to demote admin");
    }
  };

  const handleDeleteUser = async (userId, isAdmin = false) => {
    const userType = isAdmin ? "admin" : "user";
    if (
      !window.confirm(
        `Are you sure you want to delete this ${userType}? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await api.delete(`/admin/users/users/${userId}`);
      alert(
        `${
          userType.charAt(0).toUpperCase() + userType.slice(1)
        } deleted successfully!`
      );
      fetchData();
      setDropdownOpen((prev) => ({ ...prev, [userId]: false }));
    } catch (error) {
      console.error(`Error deleting ${userType}:`, error);
      alert(error.response?.data?.message || `Failed to delete ${userType}`);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();

    if (
      !createUserForm.name ||
      !createUserForm.email ||
      !createUserForm.password
    ) {
      alert("Please fill in all required fields");
      return;
    }

    if (createUserForm.password.length < 6) {
      alert("Password must be at least 6 characters long");
      return;
    }

    setCreatingUser(true);
    try {
      await api.post("/admin/users/users", createUserForm);
      alert("User created successfully!");
      setShowCreateModal(false);
      setCreateUserForm({
        name: "",
        email: "",
        password: "",
        role: "customer",
      });
      fetchData();
    } catch (error) {
      console.error("Error creating user:", error);
      alert(error.response?.data?.message || "Failed to create user");
    } finally {
      setCreatingUser(false);
    }
  };

  const resetCreateForm = () => {
    setCreateUserForm({ name: "", email: "", password: "", role: "customer" });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "UTC",
    });
  };

  const UserCard = ({ user }) => (
    <div className="bg-white rounded-lg shadow-md border-l-4 border-blue-500 overflow-hidden">
      <div className="p-4 sm:p-6">
        {/* Header with user info and mobile menu */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="text-2xl text-gray-400 flex-shrink-0">
              {user.role === "admin" ? <MdAdminPanelSettings /> : <MdPerson />}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {user.name}
              </h3>
              <p className="text-sm text-gray-500 truncate">{user.email}</p>
            </div>
          </div>

          {/* Mobile dropdown menu */}
          <div className="relative sm:hidden">
            <button
              onClick={() => toggleDropdown(user._id)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="More options"
            >
              <MdMoreVert size={20} />
            </button>

            {dropdownOpen[user._id] && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg border z-10">
                <div className="py-1">
                  {user.role !== "admin" ? (
                    <button
                      onClick={() => handlePromoteUser(user._id)}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <MdKeyboardArrowUp size={16} />
                      Promote to Admin
                    </button>
                  ) : (
                    <button
                      onClick={() => handleDemoteAdmin(user._id)}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <MdKeyboardArrowDown size={16} />
                      Demote to User
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteUser(user._id, user.role === "admin")}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50 transition-colors"
                  >
                    <MdDelete size={16} />
                    Delete User
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* User details */}
        <div className="text-sm text-gray-600 mb-4 space-y-1">
          <p>Joined: {formatDate(user.createdAt)}</p>
          <p>Role: {user.role === "admin" ? "Admin" : "User"}</p>
        </div>

        {/* Desktop action buttons */}
        <div className="hidden sm:flex gap-2 flex-wrap">
          {user.role !== "admin" ? (
            <button
              onClick={() => handlePromoteUser(user._id)}
              className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium"
              title="Promote to Admin"
            >
              <MdKeyboardArrowUp size={16} />
              <span className="hidden md:inline">Promote</span>
            </button>
          ) : (
            <button
              onClick={() => handleDemoteAdmin(user._id)}
              className="flex items-center gap-1 px-3 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors text-sm font-medium"
              title="Demote to User"
            >
              <MdKeyboardArrowDown size={16} />
              <span className="hidden md:inline">Demote</span>
            </button>
          )}
          <button
            onClick={() => handleDeleteUser(user._id, user.role === "admin")}
            className="flex items-center gap-1 px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
            title="Delete User"
          >
            <MdDelete size={16} />
            <span className="hidden md:inline">Delete</span>
          </button>
        </div>
      </div>
    </div>
  );

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      setDropdownOpen((currentOpen) => {
        const isAnyDropdownOpen = Object.values(currentOpen).some(
          (isOpen) => isOpen
        );

        if (isAnyDropdownOpen && !event.target.closest(".relative")) {
          return {};
        }

        return currentOpen;
      });
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 sm:h-32 sm:w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            User Management
          </h1>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">
                    Total Users
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    {stats.totalUsers}
                  </p>
                </div>
                <div className="text-2xl sm:text-3xl text-gray-400">
                  <MdPerson size={28} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">
                    Total Admins
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    {stats.totalAdmins}
                  </p>
                </div>
                <div className="text-2xl sm:text-3xl text-gray-400">
                  <MdAdminPanelSettings size={28} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 border-l-4 border-green-500 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">
                    Total Accounts
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    {stats.totalAccounts}
                  </p>
                </div>
                <div className="text-2xl sm:text-3xl text-gray-400">
                  <MdPerson size={28} />
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-4 sm:mb-6">
            <nav className="-mb-px flex space-x-4 sm:space-x-8 overflow-x-auto">
              <button
                onClick={() => setActiveTab("users")}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === "users"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Users ({users.length})
              </button>
              <button
                onClick={() => setActiveTab("admins")}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === "admins"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Admins ({admins.length})
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div>
            {activeTab === "users" && (
              <div>
                {/* Section Header */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-4">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                    All Users
                  </h2>
                  <div className="flex gap-2 self-start sm:self-auto">
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium"
                    >
                      <MdAdd size={16} />
                      Create User
                    </button>
                    <button
                      onClick={fetchData}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      <MdRefresh size={16} />
                      Refresh
                    </button>
                  </div>
                </div>

                {users.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-lg shadow-md">
                    <div className="text-gray-500 text-lg">No users found</div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                    {users.map((user) => (
                      <UserCard key={user._id} user={user} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "admins" && (
              <div>
                {/* Section Header */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-4">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                    All Admins
                  </h2>
                  <button
                    onClick={fetchData}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium self-start sm:self-auto"
                  >
                    <MdRefresh size={16} />
                    Refresh
                  </button>
                </div>

                {admins.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-lg shadow-md">
                    <div className="text-gray-500 text-lg">No admins found</div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                    {admins.map((admin) => (
                      <UserCard key={admin._id} user={admin} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
            {/* Header */}
            <div className="bg-green-600 text-white p-4 rounded-t-lg">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">Create New User</h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetCreateForm();
                  }}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <MdClose size={20} />
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateUser} className="p-6">
              <div className="space-y-4">
                {/* Name Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={createUserForm.name}
                    onChange={(e) =>
                      setCreateUserForm((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    required
                    className="w-full px-3 py-2 text-sm border text-black border-gray-300 rounded-md focus:border-green-500 focus:ring-1 focus:ring-green-500"
                    placeholder="Enter full name"
                  />
                </div>

                {/* Email Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={createUserForm.email}
                    onChange={(e) =>
                      setCreateUserForm((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    required
                    className="w-full px-3 py-2 text-sm border text-black border-gray-300 rounded-md focus:border-green-500 focus:ring-1 focus:ring-green-500"
                    placeholder="Enter email address"
                  />
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password *
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={createUserForm.password}
                    onChange={(e) =>
                      setCreateUserForm((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    required
                    minLength={6}
                    className="w-full px-3 py-2 text-sm border text-black border-gray-300 rounded-md focus:border-green-500 focus:ring-1 focus:ring-green-500"
                    placeholder="Enter password (min 6 characters)"
                  />
                </div>

                {/* Role Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role *
                  </label>
                  <select
                    name="role"
                    value={createUserForm.role}
                    onChange={(e) =>
                      setCreateUserForm((prev) => ({
                        ...prev,
                        role: e.target.value,
                      }))
                    }
                    required
                    className="w-full px-3 py-2 text-sm border text-black border-gray-300 rounded-md focus:border-green-500 focus:ring-1 focus:ring-green-500"
                  >
                    <option value="customer">Customer</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              {/* Submit Button */}
              <div className="mt-6 flex gap-3">
                <button
                  type="submit"
                  disabled={creatingUser}
                  className="flex-1 bg-green-600 text-white text-base font-semibold py-3 px-6 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creatingUser ? "Creating..." : "Create User"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetCreateForm();
                  }}
                  disabled={creatingUser}
                  className="px-6 py-3 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

export default UserManagement;