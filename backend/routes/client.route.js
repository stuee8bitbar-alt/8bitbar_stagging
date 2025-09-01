import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import { generateToken } from "../utils/generateToken.js";

const router = express.Router();

// --- Client Login Route (Admin Only) ---
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all fields",
      });
    }

    // 2. Find user by email (normalize email first)
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // 3. Check if user is admin or superadmin
    if (user.role !== "admin" && user.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      });
    }

    // 4. Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // 5. Generate token and send response
    generateToken(res, user, `Welcome to Client System, ${user.name}`);
  } catch (error) {
    console.error("Client login error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

// --- Client Logout Route ---
router.post("/logout", (req, res) => {
  const isProduction = process.env.SQUARE_ENVIRONMENT === "production";

  res.clearCookie("token", {
    httpOnly: true,
    sameSite: isProduction ? "none" : "strict",
    secure: isProduction,
  });

  res.status(200).json({
    success: true,
    message: "Logged out from client system successfully",
  });
});

// --- Client Profile Route (Protected) ---
router.get("/profile", async (req, res) => {
  try {
    // Get user from token (this will be handled by middleware in the future)
    // For now, we'll return a simple response
    res.status(200).json({
      success: true,
      message: "Client profile endpoint - implement middleware protection",
    });
  } catch (error) {
    console.error("Error fetching client profile:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

export default router;
