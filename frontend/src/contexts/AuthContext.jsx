import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "../utils/axios";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app start
    const savedUser = localStorage.getItem("user");
    const savedToken = localStorage.getItem("token");

    // Only set user if both user data and token exist
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
    } else if (savedUser && !savedToken) {
      // Clean up orphaned user data without token
      localStorage.removeItem("user");
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post("/user/login", { email, password });
      const data = response.data || {};
      if (response.status === 200 && data.success) {
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));

        // Store token for fallback authentication
        if (data.token) {
          localStorage.setItem("token", data.token);
        }

        return { success: true };
      } else if (data.message) {
        return { success: false, error: data.message };
      } else {
        return {
          success: false,
          error:
            "Login failed. Please check your connection or try again later.",
        };
      }
    } catch (error) {
      if (error.response?.status === 429) {
        return {
          success: false,
          error: "Too many requests, please try again later.",
        };
      }
      return {
        success: false,
        error:
          error.response?.data?.message ||
          "Network error. Please try again later.",
      };
    }
  };

  const signup = async (name, email, password, dob) => {
    try {
      const body = dob
        ? { name, email, password, dob }
        : { name, email, password };
      const response = await axios.post("/user/register", body);
      const data = response.data || {};
      if (response.status === 201 && data.success) {
        // Auto-login after successful signup
        const loginResult = await login(email, password);
        if (loginResult.success) {
          return { success: true };
        } else {
          return {
            success: false,
            error: loginResult.error || "Auto-login failed",
          };
        }
      } else if (data.message) {
        return { success: false, error: data.message };
      } else {
        return {
          success: false,
          error:
            "Signup failed. Please check your connection or try again later.",
        };
      }
    } catch (error) {
      if (error.response?.status === 429) {
        return {
          success: false,
          error: "Too many requests, please try again later.",
        };
      }
      return {
        success: false,
        error:
          error.response?.data?.message ||
          "Network error. Please try again later.",
      };
    }
  };

  const logout = async () => {
    try {
      await axios.post("/user/logout");
    } catch (e) {
      // Ignore network errors on logout
    }
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  const value = {
    user,
    login,
    signup,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
