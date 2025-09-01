import express from "express";
import User from "../../models/user.model.js";
import bcrypt from "bcryptjs";

const router = express.Router();

// Get all users (for PIN management and general admin use)
router.get("/", async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json({ users });
  } catch (error) {
    console.error("Error fetching all users:", error);
    res.status(500).json({ message: "Error fetching users" });
  }
});

// Get all users (non-admin)
router.get("/users", async (req, res) => {
  try {
    const users = await User.find({ role: "customer" })
      .select("-password")
      .sort({ createdAt: -1 });
    res.json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Error fetching users" });
  }
});

// Get all admins
router.get("/admins", async (req, res) => {
  try {
    const admins = await User.find({ role: "admin" })
      .select("-password")
      .sort({ createdAt: -1 });
    res.json({ admins });
  } catch (error) {
    console.error("Error fetching admins:", error);
    res.status(500).json({ message: "Error fetching admins" });
  }
});

// Promote user to admin
router.patch("/users/:userId/promote", async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === "admin") {
      return res.status(400).json({ message: "User is already an admin" });
    }

    user.role = "admin";
    await user.save();

    const { password, ...userWithoutPassword } = user.toObject();
    res.json({
      message: "User promoted to admin successfully",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Error promoting user:", error);
    res.status(500).json({ message: "Error promoting user" });
  }
});

// Demote admin to user
router.patch("/admins/:adminId/demote", async (req, res) => {
  try {
    const { adminId } = req.params;

    const admin = await User.findById(adminId);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    if (admin.role !== "admin") {
      return res.status(400).json({ message: "User is not an admin" });
    }

    // Prevent demoting the last admin
    const adminCount = await User.countDocuments({ role: "admin" });
    if (adminCount <= 1) {
      return res.status(400).json({ message: "Cannot demote the last admin" });
    }

    admin.role = "customer";
    await admin.save();

    const { password, ...adminWithoutPassword } = admin.toObject();
    res.json({
      message: "Admin demoted to user successfully",
      user: adminWithoutPassword,
    });
  } catch (error) {
    console.error("Error demoting admin:", error);
    res.status(500).json({ message: "Error demoting admin" });
  }
});

// Delete user
router.delete("/users/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent deleting the last admin
    if (user.role === "admin") {
      const adminCount = await User.countDocuments({ role: "admin" });
      if (adminCount <= 1) {
        return res
          .status(400)
          .json({ message: "Cannot delete the last admin" });
      }
    }

    await User.findByIdAndDelete(userId);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Error deleting user" });
  }
});

// Get user statistics
router.get("/stats", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: "customer" });
    const totalAdmins = await User.countDocuments({ role: "admin" });
    const totalAccounts = await User.countDocuments();

    res.json({
      totalUsers,
      totalAdmins,
      totalAccounts,
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    res.status(500).json({ message: "Error fetching user statistics" });
  }
});

// Create new user (superadmin only)
router.post("/users", async (req, res) => {
  try {
    const { name, email, password, role = "customer" } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email, and password are required",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Please provide a valid email address",
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "User with this email already exists",
      });
    }

    // Validate role
    if (!["customer", "admin"].includes(role)) {
      return res.status(400).json({
        message: "Invalid role. Must be 'customer' or 'admin'",
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
    });

    await newUser.save();

    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser.toObject();

    console.log(`👤 New user created: ${email} with role: ${role}`);
    res.status(201).json({
      message: "User created successfully",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Error creating user" });
  }
});

export default router;
