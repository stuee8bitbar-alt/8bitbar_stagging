import axios from "axios";

// Get environment-specific base URL
const getBaseURL = () => {
  // Use environment variable if set, otherwise use development URL
  const customBaseURL = import.meta.env.VITE_API_BASE_URL;

  if (customBaseURL) {
    return customBaseURL;
  }
  // Default to development URL
  return "https://eightbitbar-stagging.onrender.com/api/v1";
};

// Create axios instance with base configuration
const api = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Cookies are automatically sent with requests, but add Authorization header as fallback
    // This helps with mobile browsers and incognito mode that may have cookie issues

    // Check for client token first (for client pages)
    const clientToken = localStorage.getItem("clientToken");
    if (clientToken) {
      config.headers.Authorization = `Bearer ${clientToken}`;
    } else {
      // Fallback to admin token
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access - clear stored auth data
      console.error("Unauthorized access");

      // Clear both admin and client auth data
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("clientUser");
      localStorage.removeItem("clientToken");

      // Redirect based on current path
      if (window.location.pathname.startsWith("/admin")) {
        window.location.href = "/";
      } else if (window.location.pathname.startsWith("/staff")) {
        window.location.href = "/staff/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
