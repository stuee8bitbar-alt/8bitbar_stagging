import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/axios";
import AllBookingsList from "./components/AllBookingsList";
import CalendarView from "./components/CalendarView";
import ManualBooking from "./components/ManualBooking";
import PurchasedGiftCardsManagement from "./components/PurchasedGiftCardsManagement";
import {
  MdLogout,
  MdList,
  MdCalendarToday,
  MdAdd,
  MdCardGiftcard,
} from "react-icons/md";

const ClientDashboard = () => {
  const [activeTab, setActiveTab] = useState("bookings");
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // Call client logout endpoint
      await api.post("/client/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear client session data
      localStorage.removeItem("clientUser");
      localStorage.removeItem("clientToken");
      navigate("/staff/login");
    }
  };

  const tabs = [
    {
      id: "bookings",
      label: "All Bookings",
      icon: <MdList size={20} />,
      component: <AllBookingsList />,
      color: "blue",
    },
    {
      id: "calendar",
      label: "Calendar View",
      icon: <MdCalendarToday size={20} />,
      component: <CalendarView />,
      color: "green",
    },
    {
      id: "manual",
      label: "Manual Booking",
      icon: <MdAdd size={20} />,
      component: <ManualBooking />,
      color: "purple",
    },
    {
      id: "giftcards",
      label: "Gift Cards",
      icon: <MdCardGiftcard size={20} />,
      component: <PurchasedGiftCardsManagement />,
      color: "orange",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with tabs and logout */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-semibold text-gray-900">
                Staff Dashboard
              </h1>

              {/* Tabs */}
              <nav className="flex space-x-1">
                {tabs.map((tab) => {
                  const colorClasses = {
                    blue: {
                      active: "bg-blue-600 text-white shadow-md",
                      inactive: "bg-blue-500 text-white hover:bg-blue-600",
                    },
                    green: {
                      active: "bg-green-600 text-white shadow-md",
                      inactive: "bg-green-500 text-white hover:bg-green-600",
                    },
                    purple: {
                      active: "bg-purple-600 text-white shadow-md",
                      inactive: "bg-purple-500 text-white hover:bg-purple-600",
                    },
                    orange: {
                      active: "bg-orange-600 text-white shadow-md",
                      inactive: "bg-orange-500 text-white hover:bg-orange-600",
                    },
                  };

                  const isActive = activeTab === tab.id;
                  const colors = colorClasses[tab.color];

                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        isActive ? colors.active : colors.inactive
                      }`}
                    >
                      {tab.icon}
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <MdLogout size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {tabs.find((tab) => tab.id === activeTab)?.component}
      </div>
    </div>
  );
};

export default ClientDashboard;
