import React from "react";
import { Outlet } from "react-router-dom";

const ClientLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* No Header */}

      {/* Main Content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* No Footer */}
    </div>
  );
};

export default ClientLayout;
