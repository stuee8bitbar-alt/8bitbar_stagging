import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedClientRoute = ({ children }) => {
  // Check if user is logged into client system
  const clientUser = localStorage.getItem("clientUser");
  const clientToken = localStorage.getItem("clientToken");

  if (!clientUser || !clientToken) {
    // Redirect to staff login if not authenticated
    return <Navigate to="/staff/login" replace />;
  }

  try {
    // Parse user data and check role
    const user = JSON.parse(clientUser);

    // Only allow admin and superadmin users
    if (user.role !== "admin" && user.role !== "superadmin") {
      // Clear invalid session and redirect to login
      localStorage.removeItem("clientUser");
      localStorage.removeItem("clientToken");
      return <Navigate to="/staff/login" replace />;
    }

    return children;
  } catch (error) {
    console.error("Error parsing client user data:", error);
    // Clear corrupted data and redirect to login
    localStorage.removeItem("clientUser");
    localStorage.removeItem("clientToken");
    return <Navigate to="/staff/login" replace />;
  }
};

export default ProtectedClientRoute;
