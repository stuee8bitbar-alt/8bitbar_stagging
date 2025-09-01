import express from "express";
import authenticateUser from "../middlewares/authenticateUser.js";
import GiftCard from "../models/GiftCard.js";
import AdminGiftCard from "../models/AdminGiftCard.js";
import { sendGiftCardPurchaseConfirmationAsync } from "../services/emailService.js";

const router = express.Router();

// GET /giftcards - Get available predefined gift cards and admin gift cards
router.get("/", async (req, res) => {
  try {
    // Get predefined gift cards
    const predefinedGiftCards = await GiftCard.find({
      type: "predefined",
      status: "active",
      isActive: true,
      purchasedBy: { $exists: false },
    }).sort({ amount: 1 });

    // Get admin-created gift cards
    const adminGiftCards = await AdminGiftCard.find({
      isActive: true,
      isVisible: true,
    }).sort({ amount: 1 });

    // Combine both types
    const allGiftCards = [
      ...predefinedGiftCards.map((card) => ({
        ...card.toObject(),
        source: "predefined",
      })),
      ...adminGiftCards.map((card) => ({
        ...card.toObject(),
        source: "admin",
      })),
    ];

    res.json({
      success: true,
      data: allGiftCards,
    });
  } catch (error) {
    console.error("Error fetching gift cards:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch gift cards",
      error: error.message,
    });
  }
});

// POST /giftcards/custom - Create custom gift card (for admin use)
router.post("/custom", authenticateUser, async (req, res) => {
  try {
    const { amount, description } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount is required and must be greater than 0",
      });
    }

    // Create custom gift card
    const giftCard = new GiftCard({
      amount,
      type: "custom",
      description: description || `Custom gift card for $${amount}`,
      createdBy: req.user.id,
      purchasedBy: req.user.id, // User immediately owns custom gift cards
      purchasedAt: new Date(),
    });

    await giftCard.save();

    // Populate user info
    await giftCard.populate("purchasedBy", "name email");

    // Send gift card purchase confirmation email
    try {
      sendGiftCardPurchaseConfirmationAsync(giftCard, giftCard.purchasedBy);
    } catch (emailError) {
      console.warn(
        "Failed to send gift card purchase email:",
        emailError.message
      );
      // Don't fail the response for email errors
    }

    res.status(201).json({
      success: true,
      message: "Custom gift card created successfully",
      data: giftCard,
    });
  } catch (error) {
    console.error("Error creating custom gift card:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create custom gift card",
      error: error.message,
    });
  }
});

// GET /giftcards/my-giftcards - Get user's purchased gift cards
router.get("/my-giftcards", authenticateUser, async (req, res) => {
  try {
    const giftCards = await GiftCard.find({
      purchasedBy: req.user.id,
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: giftCards,
    });
  } catch (error) {
    console.error("Error fetching user gift cards:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch gift cards",
      error: error.message,
    });
  }
});

// POST /giftcards/validate - Validate gift card code and PIN
router.post("/validate", async (req, res) => {
  try {
    const { code, pin } = req.body;

    if (!code || !pin) {
      return res.status(400).json({
        success: false,
        message: "Gift card code and PIN are required",
      });
    }

    if (pin.length !== 6 || !/^\d{6}$/.test(pin)) {
      return res.status(400).json({
        success: false,
        message: "PIN must be exactly 6 digits",
      });
    }

    // Find gift card by code and PIN
    const giftCard = await GiftCard.findOne({
      code: code,
      pin: pin,
      status: "active",
      isActive: true,
      balance: { $gt: 0 },
    });

    if (!giftCard) {
      return res.status(404).json({
        success: false,
        message: "Invalid gift card code or PIN",
      });
    }

    res.json({
      success: true,
      data: {
        code: giftCard.code,
        balance: giftCard.balance,
        amount: giftCard.amount,
        isValid: true,
      },
    });
  } catch (error) {
    console.error("Error validating gift card:", error);
    res.status(500).json({
      success: false,
      message: "Failed to validate gift card",
      error: error.message,
    });
  }
});

// POST /giftcards/redeem - Redeem gift card (partial or full)
router.post("/redeem", authenticateUser, async (req, res) => {
  try {
    const { code, pin, amount, bookingId, bookingType } = req.body;

    if (!code || !pin || !amount) {
      return res.status(400).json({
        success: false,
        message: "Gift card code, PIN, and amount are required",
      });
    }

    if (pin.length !== 6 || !/^\d{6}$/.test(pin)) {
      return res.status(400).json({
        success: false,
        message: "PIN must be exactly 6 digits",
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be greater than 0",
      });
    }

    // Find gift card by code and PIN
    const giftCard = await GiftCard.findOne({
      code: code,
      pin: pin,
      status: "active",
      isActive: true,
      balance: { $gt: 0 },
    });

    if (!giftCard) {
      return res.status(404).json({
        success: false,
        message: "Invalid gift card code or PIN",
      });
    }

    if (giftCard.balance < amount) {
      return res.status(400).json({
        success: false,
        message: `Insufficient balance. Available: $${giftCard.balance}`,
      });
    }

    // Use the gift card
    const remainingBalance = giftCard.useGiftCard(
      amount,
      bookingId,
      bookingType
    );
    await giftCard.save();

    res.json({
      success: true,
      message: "Gift card redeemed successfully",
      data: {
        code: giftCard.code,
        amountUsed: amount,
        remainingBalance: remainingBalance,
        isFullyUsed: remainingBalance <= 0,
      },
    });
  } catch (error) {
    console.error("Error redeeming gift card:", error);
    res.status(500).json({
      success: false,
      message: "Failed to redeem gift card",
      error: error.message,
    });
  }
});

// POST /giftcards/test-admin-purchase - Test admin gift card purchase (development only)
router.post("/test-admin-purchase", authenticateUser, async (req, res) => {
  try {
    const { adminGiftCardId } = req.body;

    if (!adminGiftCardId) {
      return res.status(400).json({
        success: false,
        message: "Admin gift card ID is required",
      });
    }

    // Find the admin template
    const adminTemplate = await AdminGiftCard.findById(adminGiftCardId);
    if (!adminTemplate) {
      return res.status(404).json({
        success: false,
        message: "Admin gift card template not found",
      });
    }

    // Create a new gift card from admin template (simulating purchase)
    const giftCard = new GiftCard({
      amount: adminTemplate.amount,
      description:
        adminTemplate.description || `Gift Card - $${adminTemplate.amount}`,
      type: "predefined",
      status: "active",
      isActive: true,
      createdBy: adminTemplate.createdBy,
      purchasedBy: req.user.id, // This triggers the auto-generation
      purchasedAt: new Date(),
      adminTemplateId: adminTemplate._id,
    });

    await giftCard.save();

    // Populate the created gift card
    await giftCard.populate("purchasedBy", "name email");

    res.status(201).json({
      success: true,
      message: "Test admin gift card purchase successful",
      data: {
        giftCard: {
          id: giftCard._id,
          code: giftCard.code,
          pin: giftCard.pin,
          amount: giftCard.amount,
          balance: giftCard.balance,
          description: giftCard.description,
          type: giftCard.type,
          status: giftCard.status,
          purchasedAt: giftCard.purchasedAt,
          adminTemplateId: giftCard.adminTemplateId,
        },
        adminTemplate: {
          id: adminTemplate._id,
          amount: adminTemplate.amount,
          description: adminTemplate.description,
        },
      },
    });
  } catch (error) {
    console.error("Error in test admin gift card purchase:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create test gift card",
      error: error.message,
    });
  }
});

// GET /giftcards/:id - Get specific gift card details (if user owns it)
router.get("/:id", authenticateUser, async (req, res) => {
  try {
    const giftCard = await GiftCard.findById(req.params.id).populate(
      "purchasedBy",
      "name email"
    );

    if (!giftCard) {
      return res.status(404).json({
        success: false,
        message: "Gift card not found",
      });
    }

    // Check if user owns this gift card
    if (giftCard.purchasedBy?._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    res.json({
      success: true,
      data: giftCard,
    });
  } catch (error) {
    console.error("Error fetching gift card:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch gift card",
      error: error.message,
    });
  }
});

export default router;
