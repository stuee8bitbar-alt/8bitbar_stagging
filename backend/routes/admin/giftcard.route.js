import express from "express";
import authenticateAdmin from "../../middlewares/authenticateAdmin.js";
import AdminGiftCard from "../../models/AdminGiftCard.js";

const router = express.Router();

router.use(authenticateAdmin);

// GET /admin/giftcard-management - Get all admin gift card templates
router.get("/", async (req, res) => {
  try {
    const giftCards = await AdminGiftCard.find().sort({ amount: 1 });

    res.json({
      success: true,
      data: giftCards,
    });
  } catch (error) {
    console.error("Error fetching admin gift cards:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch gift card templates",
      error: error.message,
    });
  }
});

// POST /admin/giftcard-management - Create a new gift card template
router.post("/", async (req, res) => {
  try {
    const { amount, description, imageUrl } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid amount",
      });
    }

    // Check if gift card with this amount already exists
    const existingGiftCard = await AdminGiftCard.findOne({ amount });
    if (existingGiftCard) {
      return res.status(400).json({
        success: false,
        message: "A gift card with this amount already exists",
      });
    }

    const giftCard = new AdminGiftCard({
      amount,
      description: description || `Gift Card - $${amount}`,
      imageUrl:
        imageUrl ||
        "https://8bitbar.com.au/wp-content/uploads/2025/05/4d7846ed-b5ad-4444-bba5-35271a0d87bc-500x500.jpeg",
      createdBy: req.user.id,
    });

    await giftCard.save();

    res.status(201).json({
      success: true,
      message: "Gift card template created successfully",
      data: giftCard,
    });
  } catch (error) {
    console.error("Error creating admin gift card:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create gift card template",
      error: error.message,
    });
  }
});

// PUT /admin/giftcard-management/:id - Update a gift card template
router.put("/:id", async (req, res) => {
  try {
    const { amount, description, imageUrl } = req.body;
    const giftCardId = req.params.id;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid amount",
      });
    }

    const giftCard = await AdminGiftCard.findById(giftCardId);
    if (!giftCard) {
      return res.status(404).json({
        success: false,
        message: "Gift card template not found",
      });
    }

    // If amount is being changed, check for duplicates
    if (amount && amount !== giftCard.amount) {
      const existingGiftCard = await AdminGiftCard.findOne({
        amount,
        _id: { $ne: giftCardId },
      });
      if (existingGiftCard) {
        return res.status(400).json({
          success: false,
          message: "A gift card with this amount already exists",
        });
      }
    }

    giftCard.amount = amount;
    giftCard.description = description || `Gift Card - $${amount}`;
    if (imageUrl) {
      giftCard.imageUrl = imageUrl;
    }

    await giftCard.save();

    res.json({
      success: true,
      message: "Gift card template updated successfully",
      data: giftCard,
    });
  } catch (error) {
    console.error("Error updating admin gift card:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update gift card template",
      error: error.message,
    });
  }
});

// DELETE /admin/giftcard-management/:id - Delete a gift card template
router.delete("/:id", async (req, res) => {
  try {
    const giftCardId = req.params.id;

    const giftCard = await AdminGiftCard.findById(giftCardId);
    if (!giftCard) {
      return res.status(404).json({
        success: false,
        message: "Gift card template not found",
      });
    }

    // Prevent deletion if gift card has been purchased
    if (giftCard.totalPurchased > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete gift card template that has been purchased. Set as inactive instead.",
      });
    }

    await AdminGiftCard.findByIdAndDelete(giftCardId);

    res.json({
      success: true,
      message: "Gift card template deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting admin gift card:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete gift card template",
      error: error.message,
    });
  }
});

// POST /admin/giftcard-management/:id/toggle-visibility - Toggle gift card visibility
router.post("/:id/toggle-visibility", async (req, res) => {
  try {
    const giftCardId = req.params.id;

    const giftCard = await AdminGiftCard.findById(giftCardId);
    if (!giftCard) {
      return res.status(404).json({
        success: false,
        message: "Gift card template not found",
      });
    }

    giftCard.isVisible = !giftCard.isVisible;
    await giftCard.save();

    res.json({
      success: true,
      message: `Gift card template ${
        giftCard.isVisible ? "made visible" : "hidden"
      } successfully`,
      data: giftCard,
    });
  } catch (error) {
    console.error("Error toggling gift card visibility:", error);
    res.status(500).json({
      success: false,
      message: "Failed to toggle gift card template visibility",
      error: error.message,
    });
  }
});

export default router;
