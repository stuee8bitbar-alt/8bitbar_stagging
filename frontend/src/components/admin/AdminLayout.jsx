import React, { useState, useMemo } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  MdDashboard,
  MdMusicNote,
  MdVideogameAsset,
  MdMeetingRoom,
  MdSportsEsports,
  MdMenu,
  MdClose,
  MdRestaurant,
  MdLocalCafe,
  MdPeople,
  MdAdd,
  MdAttachMoney,
  MdEvent,
  MdLock,
  MdCardGiftcard,
  MdShoppingCart,
  MdExpandMore,
  MdExpandLess,
  MdBookOnline,
  MdSettings,
  MdAdminPanelSettings,
} from "react-icons/md";
import { useAuth } from "../../contexts/AuthContext";

const AdminLayout = () => {
  const location = useLocation();
  const { user } = useAuth();

  // --- STATE MANAGEMENT ---
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [isSidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      const saved = localStorage.getItem("adminSidebarCollapsed");
      return saved ? JSON.parse(saved) : false;
    } catch (error) {
      return false;
    }
  });

  const [collapsedSections, setCollapsedSections] = useState(() => {
    try {
      const saved = localStorage.getItem("adminCollapsedSections");
      return saved
        ? JSON.parse(saved)
        : {
            bookings: false,
            karaoke: false,
            n64: false,
            cafe: false,
            management: false,
            giftcards: false,
          };
    } catch (error) {
      return {};
    }
  });

  // --- HELPERS & EVENT HANDLERS ---
  const toggleSidebarCollapse = () => {
    const newState = !isSidebarCollapsed;
    setSidebarCollapsed(newState);
    localStorage.setItem("adminSidebarCollapsed", JSON.stringify(newState));
  };

  const toggleSection = (section) => {
    const newCollapsedSections = {
      ...collapsedSections,
      [section]: !collapsedSections[section],
    };
    setCollapsedSections(newCollapsedSections);
    localStorage.setItem(
      "adminCollapsedSections",
      JSON.stringify(newCollapsedSections)
    );
  };

  // --- NAVIGATION DATA & LOGIC ---
  const allNavItems = [
    // Main Section
    { path: "/admin/dashboard", label: "Dashboard", icon: <MdDashboard size={20} />, roles: ["superadmin"], section: "main" },
    { path: "/admin/finance", label: "Finance", icon: <MdAttachMoney size={20} />, roles: ["superadmin"], section: "main" },
    // Bookings Section
    { path: "/admin/all-bookings", label: "All Bookings", icon: <MdEvent size={20} />, roles: ["admin", "superadmin"], section: "bookings" },
    { path: "/admin/manual-booking", label: "Manual Booking", icon: <MdAdd size={20} />, roles: ["admin", "superadmin"], section: "bookings" },
    // Karaoke Section
    { path: "/admin/karaoke-bookings", label: "Karaoke Bookings", icon: <MdMusicNote size={20} />, roles: ["admin", "superadmin"], section: "karaoke" },
    { path: "/admin/karaoke/karaoke-rooms", label: "Karaoke Rooms", icon: <MdMeetingRoom size={20} />, roles: ["superadmin"], section: "karaoke" },
    // N64 Section
    { path: "/admin/n64-bookings", label: "N64 Bookings", icon: <MdVideogameAsset size={20} />, roles: ["admin", "superadmin"], section: "n64" },
    { path: "/admin/n64-rooms", label: "N64 Rooms", icon: <MdSportsEsports size={20} />, roles: ["superadmin"], section: "n64" },
    // Cafe Section
    { path: "/admin/cafe-bookings", label: "Cafe Bookings", icon: <MdLocalCafe size={20} />, roles: ["admin", "superadmin"], section: "cafe" },
    { path: "/admin/cafe-layout", label: "Cafe Layout", icon: <MdRestaurant size={20} />, roles: ["superadmin"], section: "cafe" },
    { path: "/admin/cafe-settings", label: "Cafe Settings", icon: <MdSettings size={20} />, roles: ["superadmin"], section: "cafe" },
    // Management Section
    { path: "/admin/users", label: "Users", icon: <MdPeople size={20} />, roles: ["superadmin"], section: "management" },
    { path: "/admin/pin-management", label: "PIN Management", icon: <MdLock size={20} />, roles: ["superadmin"], section: "management" },
    { path: "/admin/surveys", label: "Surveys", icon: <MdEvent size={20} />, roles: ["superadmin"], section: "management" },
    // Gift Cards Section
    { path: "/admin/gift-cards", label: "Gift Cards", icon: <MdCardGiftcard size={20} />, roles: ["superadmin"], section: "giftcards" },
    { path: "/admin/purchased-gift-cards", label: "Purchased Cards", icon: <MdShoppingCart size={20} />, roles: ["superadmin"], section: "giftcards" },
  ];

  const sectionsConfig = {
    bookings: { label: "Bookings", icon: <MdBookOnline size={20} /> },
    karaoke: { label: "Karaoke", icon: <MdMusicNote size={20} /> },
    n64: { label: "N64 Gaming", icon: <MdVideogameAsset size={20} /> },
    cafe: { label: "Cafe", icon: <MdLocalCafe size={20} /> },
    management: { label: "Management", icon: <MdAdminPanelSettings size={20} /> },
    giftcards: { label: "Gift Cards", icon: <MdCardGiftcard size={20} /> },
  };

  const groupedNavItems = useMemo(() => {
    if (!user?.role) return {};
    return allNavItems
      .filter((item) => item.roles.includes(user.role))
      .reduce((acc, item) => {
        (acc[item.section] = acc[item.section] || []).push(item);
        return acc;
      }, {});
  }, [user]);

  // --- RENDER COMPONENTS ---
  const NavItem = ({ item }) => (
    <li className="relative">
      <Link
        to={item.path}
        onClick={() => setMobileSidebarOpen(false)}
        className={`group flex items-center p-2.5 rounded-lg transition-colors text-sm ${
          location.pathname === item.path
            ? "bg-blue-600 text-white"
            : "text-gray-300 hover:bg-gray-700 hover:text-white"
        } ${isSidebarCollapsed ? "justify-center" : "space-x-3"}`}
      >
        <span className="flex-shrink-0 w-5 h-5">{item.icon}</span>
        {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
        {isSidebarCollapsed && (
          <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
            {item.label}
          </div>
        )}
      </Link>
    </li>
  );

  return (
    // CHANGE #1: Use h-screen and overflow-hidden to lock the layout
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Overlay for mobile view */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 xl:hidden"
          onClick={() => setMobileSidebarOpen(false)}
          aria-hidden="true"
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 bg-gray-800 text-white flex flex-col transition-all duration-300 ease-in-out xl:static ${
          isSidebarCollapsed ? "w-20" : "w-64"
        } ${isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full xl:translate-x-0"}`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0">
          {!isSidebarCollapsed && (
            <h2 className="text-xl font-bold text-white truncate">Admin Panel</h2>
          )}
          <button
            onClick={toggleSidebarCollapse}
            className="hidden xl:block text-gray-400 hover:text-white"
            aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isSidebarCollapsed ? <MdMenu size={24} /> : <MdClose size={24} />}
          </button>
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="xl:hidden text-gray-400 hover:text-white"
            aria-label="Close sidebar"
          >
            <MdClose size={24} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3">
          <ul className="space-y-2">
            {groupedNavItems.main?.map((item) => (
              <NavItem key={item.path} item={item} />
            ))}
            {groupedNavItems.main?.length > 0 && !isSidebarCollapsed && (
              <li className="py-2">
                <hr className="border-t border-gray-600" />
              </li>
            )}
            {Object.entries(sectionsConfig).map(([key, config]) => {
              const items = groupedNavItems[key];
              if (!items || items.length === 0) return null;
              const isSectionCollapsed = collapsedSections[key];
              return (
                <li key={key}>
                  <button
                    onClick={() => toggleSection(key)}
                    className={`w-full flex items-center p-2.5 rounded-lg text-left transition-colors text-sm text-gray-300 hover:bg-gray-700 hover:text-white ${
                      isSidebarCollapsed ? "justify-center" : "justify-between"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="flex-shrink-0 w-5 h-5">{config.icon}</span>
                      {!isSidebarCollapsed && <span className="font-semibold truncate">{config.label}</span>}
                    </div>
                    {!isSidebarCollapsed && (
                      <span>{isSectionCollapsed ? <MdExpandMore /> : <MdExpandLess />}</span>
                    )}
                  </button>
                  {!isSectionCollapsed && !isSidebarCollapsed && (
                    <ul className="mt-2 space-y-1 pl-5 border-l-2 border-gray-600 ml-2.5">
                      {items.map((item) => (
                        <NavItem key={item.path} item={item} />
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      {/* CHANGE #2: Add overflow-y-auto to make this div scrollable */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        <header className="xl:hidden bg-white shadow-sm flex items-center p-4 sticky top-0 z-20">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="text-gray-600 focus:outline-none"
            aria-label="Open sidebar"
          >
            <MdMenu size={28} />
          </button>
          <h1 className="ml-4 text-lg font-semibold text-gray-800">Admin</h1>
        </header>

        <main className="flex-1 p-2 lg:p-8 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;