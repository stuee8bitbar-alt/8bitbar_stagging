import React, { useState, useEffect } from "react";
import api from "../../utils/axios";
import {
  MdMusicNote,
  MdVideogameAsset,
  MdMeetingRoom,
  MdSportsEsports,
  MdLocalCafe,
  MdAttachMoney,
  MdPeople,
  MdAdminPanelSettings,
  MdDateRange,
  MdRefresh,
} from "react-icons/md";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalKaraokeBookings: 0,
    totalN64Bookings: 0,
    totalKaraokeRooms: 0,
    totalN64Rooms: 0,
    totalCafeBookings: 0,
    karaokeRevenue: 0,
    n64Revenue: 0,
    cafeRevenue: 0,
    totalUsers: 0,
    totalAdmins: 0,
    totalAccounts: 0,
  });
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  useEffect(() => {
    if (startDate || endDate) {
      fetchDashboardStats();
    }
  }, [startDate, endDate]);

  const fetchDashboardStats = async () => {
    try {
      // Build query parameters for date filtering
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      const queryString = params.toString() ? `?${params.toString()}` : "";

      // Fetch counts and revenue for all booking types
      const [
        karaokeBookings,
        n64Bookings,
        karaokeRooms,
        n64Rooms,
        cafeBookings,
        karaokeRevenue,
        n64Revenue,
        cafeRevenue,
        userStats,
      ] = await Promise.all([
        api.get(`/admin/karaoke/karaoke-bookings/count${queryString}`),
        api.get(`/admin/n64/n64-bookings/count${queryString}`),
        api.get("/admin/karaoke/karaoke-rooms/count"),
        api.get("/admin/n64/n64-rooms/count"),
        api.get(`/admin/cafe/cafe-bookings/count${queryString}`),
        api.get(`/admin/karaoke/karaoke-bookings/revenue${queryString}`),
        api.get(`/admin/n64/n64-bookings/revenue${queryString}`),
        api.get(`/admin/cafe/cafe-bookings/revenue${queryString}`),
        api.get("/admin/users/stats"),
      ]);

      setStats({
        totalKaraokeBookings: karaokeBookings.data.count || 0,
        totalN64Bookings: n64Bookings.data.count || 0,
        totalKaraokeRooms: karaokeRooms.data.count || 0,
        totalN64Rooms: n64Rooms.data.count || 0,
        totalCafeBookings: cafeBookings.data.count || 0,
        karaokeRevenue: karaokeRevenue.data.revenue || 0,
        n64Revenue: n64Revenue.data.revenue || 0,
        cafeRevenue: cafeRevenue.data.revenue || 0,
        totalUsers: userStats.data.totalUsers || 0,
        totalAdmins: userStats.data.totalAdmins || 0,
        totalAccounts: userStats.data.totalAccounts || 0,
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color, isRevenue = false }) => (
    <div
      className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-2 border-l-4 ${color} transform hover:-translate-y-1`}
    >
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-gray-600 text-sm lg:text-base font-medium mb-2">
            {title}
          </p>
          <p className="text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900">
            {isRevenue ? `${value.toFixed(2)}` : value.toLocaleString()}
          </p>
        </div>
        <div className="text-3xl lg:text-4xl text-gray-400 ml-4 flex-shrink-0">
          {icon}
        </div>
      </div>
    </div>
  );

  const totalRevenue =
    stats.karaokeRevenue + stats.n64Revenue + stats.cafeRevenue;

  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 sm:h-32 sm:w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-2 py-4 lg:py-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 lg:mb-8 space-y-4 lg:space-y-0">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
            Admin Dashboard
          </h1>

          {/* Date Filter Controls */}
          <div className="w-full lg:w-auto bg-white rounded-lg shadow-sm border border-gray-200 p-2">
            <div className="flex items-center gap-2 mb-3">
              <MdDateRange className="text-gray-500" size={18} />
              <span className="text-sm font-medium text-gray-700">
                Filter by Date
              </span>
            </div>

            <div className="flex flex-col lg:flex-row gap-3">
              <div className="flex flex-col">
                <label className="text-xs text-gray-600 font-medium mb-1">
                  From
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-colors min-w-[130px]"
                  style={{
                    colorScheme: "light",
                  }}
                />
              </div>

              <div className="flex flex-col">
                <label className="text-xs text-gray-600 font-medium mb-1">
                  To
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-colors min-w-[130px]"
                  style={{
                    colorScheme: "light",
                  }}
                />
              </div>

              <div className="flex flex-col lg:flex-row gap-2 lg:items-end">
                <button
                  onClick={clearFilters}
                  className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors font-medium"
                >
                  Clear
                </button>
                <button
                  onClick={fetchDashboardStats}
                  className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium"
                >
                  <MdRefresh size={14} />
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Date Range Display */}
        {(startDate || endDate) && (
          <div className="mb-6 p-2 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 text-blue-800">
              <MdDateRange size={16} className="flex-shrink-0" />
              <span className="text-sm font-medium">
                Showing data for: {startDate || "Beginning"} to{" "}
                {endDate || "Present"}
              </span>
            </div>
          </div>
        )}

        {/* Revenue Overview */}
        <div className="mb-8">
          <h2 className="text-xl lg:text-2xl font-bold text-gray-800 mb-5">
            Revenue Overview
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-5">
            <StatCard
              title="Total Revenue"
              value={totalRevenue}
              icon={<MdAttachMoney />}
              color="border-green-500"
              isRevenue={true}
            />
            <StatCard
              title="Karaoke Revenue"
              value={stats.karaokeRevenue}
              icon={<MdMusicNote />}
              color="border-blue-500"
              isRevenue={true}
            />
            <StatCard
              title="N64 Revenue"
              value={stats.n64Revenue}
              icon={<MdVideogameAsset />}
              color="border-green-500"
              isRevenue={true}
            />
            <StatCard
              title="Cafe Revenue"
              value={stats.cafeRevenue}
              icon={<MdLocalCafe />}
              color="border-yellow-500"
              isRevenue={true}
            />
          </div>
        </div>

        {/* Booking Counts */}
        <div className="mb-8">
          <h2 className="text-xl lg:text-2xl font-bold text-gray-800 mb-5">
            Booking Counts
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 lg:gap-5">
            <StatCard
              title="Karaoke Bookings"
              value={stats.totalKaraokeBookings}
              icon={<MdMusicNote />}
              color="border-blue-500"
            />
            <StatCard
              title="N64 Bookings"
              value={stats.totalN64Bookings}
              icon={<MdVideogameAsset />}
              color="border-green-500"
            />
            <StatCard
              title="Cafe Bookings"
              value={stats.totalCafeBookings}
              icon={<MdLocalCafe />}
              color="border-yellow-500"
            />
            <StatCard
              title="Karaoke Rooms"
              value={stats.totalKaraokeRooms}
              icon={<MdMeetingRoom />}
              color="border-purple-500"
            />
            <StatCard
              title="N64 Rooms"
              value={stats.totalN64Rooms}
              icon={<MdSportsEsports />}
              color="border-orange-500"
            />
          </div>
        </div>

        {/* User Statistics */}
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-gray-800 mb-5">
            User Statistics
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
            <StatCard
              title="Total Users"
              value={stats.totalUsers}
              icon={<MdPeople />}
              color="border-blue-500"
            />
            <StatCard
              title="Total Admins"
              value={stats.totalAdmins}
              icon={<MdAdminPanelSettings />}
              color="border-purple-500"
            />
            <StatCard
              title="Total Accounts"
              value={stats.totalAccounts}
              icon={<MdPeople />}
              color="border-green-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
