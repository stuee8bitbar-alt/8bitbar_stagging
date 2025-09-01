import express from "express";
import StaffPin from "../../models/StaffPin.js";
import authenticateAdmin from "../../middlewares/authenticateAdmin.js";

const router = express.Router();

// Apply admin authentication middleware (both admin and superadmin can access)
router.use(authenticateAdmin);

// Verify PIN and get staff information (for booking purposes)
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
