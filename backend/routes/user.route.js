import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import { generateToken } from "../utils/generateToken.js";
import authenticateUser from "../middlewares/authenticateUser.js";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { transporter } from "../services/emailService.js";

const router = express.Router();

// --- Registration Route ---
// Logic from the 'register' controller is now directly inside the route handler.
router.post("/register", async (req, res) => {
  const { name, email, password, phone, dob } = req.body;
  try {
    // 1. Validate input
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all fields",
      });
    }

    // 2. Check if user already exists
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // 3. Hash password and create new user
    const hashedPassword = await bcrypt.hash(password, 10);
    // Normalize email (convert to lowercase)
    const normalizedEmail = email.toLowerCase().trim();
    const newUser = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      ...(phone && { phone }),
      ...(dob && { dob }),
    });

    // 4. Send success response
    res.status(201).json({
      success: true,
      message: "User created successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

// --- Login Route ---
// Logic from the 'login' controller is now directly inside the route handler.
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

    // 3. Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // 4. Generate token and send response
    // Assumes generateToken handles the response sending (e.g., setting a cookie and sending JSON)
    generateToken(res, user, `Welcome back ${user.name}`);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

// --- Logout Route ---
router.post("/logout", (req, res) => {
  const isProduction = process.env.SQUARE_ENVIRONMENT === "production";

  res.clearCookie("token", {
    httpOnly: true,
    sameSite: isProduction ? "none" : "strict",
    secure: isProduction,
  });
  res.status(200).json({ success: true, message: "Logged out successfully" });
});

// --- Profile Route (Protected) ---
// This route was already structured this way and remains the same.
// It uses the 'authenticateUser' middleware to protect the route.
router.get("/profile", authenticateUser, async (req, res) => {
  try {
    // The user ID is attached to the request object by the authenticateUser middleware
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// --- Get User by Email Route (Public) ---
// This route allows fetching user details by email for auto-population in forms
router.get("/by-email/:email", async (req, res) => {
  try {
    const { email } = req.params;

    // Normalize email (convert to lowercase and trim)
    const normalizedEmail = email.toLowerCase().trim();

    // Find user by email, excluding sensitive fields
    const user = await User.findOne({ email: normalizedEmail })
      .select("name email phone dob")
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      message: "User found",
      data: user,
    });
  } catch (error) {
    console.error("Error fetching user by email:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      data: null,
    });
  }
});

// --- Forgot Password ---
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: "Email is required" });
  }
  try {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ success: false, message: "No user found with that email" });
    }
    // Generate token
    const token = crypto.randomBytes(32).toString("hex");
    const expires = Date.now() + 1000 * 60 * 60; // 1 hour
    user.resetPasswordToken = token;
    user.resetPasswordExpires = new Date(expires);
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password?token=${token}`;
    const mailOptions = {
      from: '8BitBar <info@8bitbar.com.au>',
      to: user.email,
      subject: 'Password Reset Request',
      html: `<p>You requested a password reset for your 8BitBar account.</p>
             <p>Click the link below to reset your password. This link will expire in 1 hour.</p>
             <p><a href="${resetUrl}">${resetUrl}</a></p>
             <p>If you did not request this, you can ignore this email.</p>`
    };
    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: "Reset link sent to your email." });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ success: false, message: "Server error sending email" });
  }
});

// --- Reset Password ---
router.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    return res.status(400).json({ success: false, message: "Token and new password are required" });
  }
  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });
    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired token" });
    }
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    res.json({ success: true, message: "Password has been reset" });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
