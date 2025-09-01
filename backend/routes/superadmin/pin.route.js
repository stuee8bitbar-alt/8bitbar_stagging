import express from "express";
import StaffPin from "../../models/StaffPin.js";
import User from "../../models/user.model.js";
import authenticateSuperAdmin from "../../middlewares/authenticateSuperAdmin.js";

const router = express.Router();

// Apply superadmin authentication middleware to all routes
router.use(authenticateSuperAdmin);

// Create a new staff PIN
router.post("/", async (req, res) => {
  try {
    const { pin, adminUserId, staffName } = req.body;

    // Validate required fields
    if (!pin || !adminUserId || !staffName) {
      return res.status(400).json({
        success: false,
        message: "PIN, adminUserId, and staffName are required",
      });
    }

    // Validate PIN format (4 digits)
    if (!/^\d{4}$/.test(pin)) {
      return res.status(400).json({
        success: false,
        message: "PIN must be exactly 4 digits",
      });
    }

    // Check if PIN already exists
    const existingPin = await StaffPin.findOne({ pin });
    if (existingPin) {
      return res.status(400).json({
        success: false,
        message: "PIN already exists",
      });
    }

    // Verify admin user exists and has appropriate role
    const adminUser = await User.findById(adminUserId);
    if (
      !adminUser ||
      (adminUser.role !== "admin" && adminUser.role !== "superadmin")
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid admin user ID",
      });
    }

    // Create new staff PIN
    const staffPin = await StaffPin.create({
      pin,
      adminUserId,
      staffName,
    });

    // Update user to indicate they have PINs
    await User.findByIdAndUpdate(adminUserId, { hasPin: true });

    res.status(201).json({
      success: true,
      message: "Staff PIN created successfully",
      staffPin,
    });
  } catch (error) {
    console.error("Error creating staff PIN:", error);
    res.status(500).json({
      success: false,
      message: "Error creating staff PIN",
    });
  }
});

// Get all PINs for an admin user
router.get("/admin/:adminUserId", async (req, res) => {
  try {
    const { adminUserId } = req.params;

    const pins = await StaffPin.find({
      adminUserId,
      isActive: true,
    }).select("-__v");

    res.json({
      success: true,
      pins,
    });
  } catch (error) {
    console.error("Error fetching staff PINs:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching staff PINs",
    });
  }
});

// Get all active PINs
router.get("/", async (req, res) => {
  try {
    const pins = await StaffPin.find({ isActive: true })
      .populate("adminUserId", "name email")
      .select("-__v");

    res.json({
      success: true,
      pins,
    });
  } catch (error) {
    console.error("Error fetching all staff PINs:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching staff PINs",
    });
  }
});

// Update staff PIN
router.put("/:pinId", async (req, res) => {
  try {
    const { pinId } = req.params;
    const { pin, staffName, isActive } = req.body;

    // Validate PIN format if updating
    if (pin && !/^\d{4}$/.test(pin)) {
      return res.status(400).json({
        success: false,
        message: "PIN must be exactly 4 digits",
      });
    }

    // Check if new PIN conflicts with existing ones
    if (pin) {
      const existingPin = await StaffPin.findOne({
        pin,
        _id: { $ne: pinId },
      });
      if (existingPin) {
        return res.status(400).json({
          success: false,
          message: "PIN already exists",
        });
      }
    }

    const updatedPin = await StaffPin.findByIdAndUpdate(
      pinId,
      {
        ...(pin && { pin }),
        ...(staffName && { staffName }),
        ...(typeof isActive === "boolean" && { isActive }),
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!updatedPin) {
      return res.status(404).json({
        success: false,
        message: "Staff PIN not found",
      });
    }

    res.json({
      success: true,
      message: "Staff PIN updated successfully",
      staffPin: updatedPin,
    });
  } catch (error) {
    console.error("Error updating staff PIN:", error);
    res.status(500).json({
      success: false,
      message: "Error updating staff PIN",
    });
  }
});

// Delete staff PIN (soft delete by setting isActive to false)
router.delete("/:pinId", async (req, res) => {
  try {
    const { pinId } = req.params;

    const deletedPin = await StaffPin.findByIdAndUpdate(
      pinId,
      { isActive: false, updatedAt: new Date() },
      { new: true }
    );

    if (!deletedPin) {
      return res.status(404).json({
        success: false,
        message: "Staff PIN not found",
      });
    }

    // Check if admin user still has active PINs
    const activePinCount = await StaffPin.countDocuments({
      adminUserId: deletedPin.adminUserId,
      isActive: true,
    });

    // If no active PINs, update user hasPin status
    if (activePinCount === 0) {
      await User.findByIdAndUpdate(deletedPin.adminUserId, { hasPin: false });
    }

    res.json({
      success: true,
      message: "Staff PIN deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting staff PIN:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting staff PIN",
    });
  }
});

// Verify PIN and get staff information (this can be accessed by admins for booking purposes)
router.post("/verify", async (req, res) => {
  try {
    const { pin } = req.body;

    if (!pin) {
      return res.status(400).json({
        success: false,
        message: "PIN is required",
      });
    }

    const staffPin = await StaffPin.findOne({
      pin,
      isActive: true,
    }).populate("adminUserId", "name email");

    if (!staffPin) {
      return res.status(404).json({
        success: false,
        message: "Invalid PIN",
      });
    }

    // Update last used timestamp
    await StaffPin.findByIdAndUpdate(staffPin._id, {
      lastUsed: new Date(),
    });

    res.json({
      success: true,
      message: "PIN verified successfully",
      staffInfo: {
        pin: staffPin.pin,
        staffName: staffPin.staffName,
        adminUserId: staffPin.adminUserId._id,
        adminName: staffPin.adminUserId.name,
        adminEmail: staffPin.adminUserId.email,
      },
    });
  } catch (error) {
    console.error("Error verifying PIN:", error);
    res.status(500).json({
      success: false,
      message: "Error verifying PIN",
    });
  }
});

export default router;
