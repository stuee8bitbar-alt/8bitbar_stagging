import express from "express";
import authenticateAdmin from "../../middlewares/authenticateAdmin.js";
import GiftCard from "../../models/GiftCard.js";

const router = express.Router();

router.use(authenticateAdmin);

// GET /admin/purchased-giftcards - Get all purchased gift cards with pagination and filters
router.get("/", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      search,
      sortBy = "purchasedAt",
      sortOrder = "desc",
      startDate,
      endDate,
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build filter object
    const filter = { purchasedBy: { $exists: true } };

    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { code: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { "purchasedBy.name": { $regex: search, $options: "i" } },
        { "purchasedBy.email": { $regex: search, $options: "i" } },
      ];
    }

    // Date filtering
    if (startDate || endDate) {
      filter.purchasedAt = {};
      if (startDate) filter.purchasedAt.$gte = new Date(startDate);
      if (endDate) {
        const endDateObj = new Date(endDate);
        endDateObj.setHours(23, 59, 59, 999);
        filter.purchasedAt.$lte = endDateObj;
      }
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Get total count
    const total = await GiftCard.countDocuments(filter);

    // Get gift cards with pagination
    const giftCards = await GiftCard.find(filter)
      .populate("purchasedBy", "name email")
      .populate("createdBy", "name email")
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      data: giftCards,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalItems: total,
        itemsPerPage: limitNum,
      },
    });
  } catch (error) {
    console.error("Error fetching purchased gift cards:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch purchased gift cards",
      error: error.message,
    });
  }
});

// GET /admin/purchased-giftcards/stats - Get statistics for purchased gift cards
router.get("/stats", async (req, res) => {
  try {
    const stats = await GiftCard.aggregate([
      {
        $match: { purchasedBy: { $exists: true } },
      },
      {
        $group: {
          _id: null,
          totalPurchased: { $sum: 1 },
          totalValue: { $sum: "$amount" },
          totalBalance: { $sum: "$balance" },
          activeCards: {
            $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] },
          },
          usedCards: {
            $sum: { $cond: [{ $eq: ["$status", "used"] }, 1, 0] },
          },
          discardedCards: {
            $sum: { $cond: [{ $eq: ["$status", "discarded"] }, 1, 0] },
          },
          totalRevenue: { $sum: "$amount" },
          averageAmount: { $avg: "$amount" },
        },
      },
    ]);

    // Get recent purchases (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentPurchases = await GiftCard.countDocuments({
      purchasedBy: { $exists: true },
      purchasedAt: { $gte: thirtyDaysAgo },
    });

    res.json({
      success: true,
      data: {
        ...stats[0],
        recentPurchases,
      } || {
        totalPurchased: 0,
        totalValue: 0,
        totalBalance: 0,
        activeCards: 0,
        usedCards: 0,
        discardedCards: 0,
        totalRevenue: 0,
        averageAmount: 0,
        recentPurchases: 0,
      },
    });
  } catch (error) {
    console.error("Error fetching purchased gift card stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch statistics",
      error: error.message,
    });
  }
});

// POST /admin/purchased-giftcards/validate - Validate gift card by code and PIN for admin
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
    })
      .populate("purchasedBy", "name email")
      .populate("createdBy", "name email");

    if (!giftCard) {
      return res.status(404).json({
        success: false,
        message: "Invalid gift card code or PIN",
      });
    }

    res.json({
      success: true,
      data: {
        _id: giftCard._id,
        id: giftCard._id, // Keep both for compatibility
        code: giftCard.code,
        balance: giftCard.balance,
        amount: giftCard.amount,
        status: giftCard.status,
        isActive: giftCard.isActive,
        purchasedBy: giftCard.purchasedBy,
        purchasedAt: giftCard.purchasedAt,
        usageHistory: giftCard.usageHistory,
        description: giftCard.description,
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

// GET /admin/purchased-giftcards/:id - Get specific purchased gift card
router.get("/:id", async (req, res) => {
  try {
    const giftCard = await GiftCard.findById(req.params.id)
      .populate("purchasedBy", "name email")
      .populate("createdBy", "name email");

    if (!giftCard) {
      return res.status(404).json({
        success: false,
        message: "Gift card not found",
      });
    }

    if (!giftCard.purchasedBy) {
      return res.status(400).json({
        success: false,
        message: "This gift card has not been purchased",
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

// POST /admin/purchased-giftcards/:id/discard - Discard a purchased gift card
router.post("/:id/discard", async (req, res) => {
  try {
    const { reason } = req.body;
    const giftCardId = req.params.id;

    const giftCard = await GiftCard.findById(giftCardId);
    if (!giftCard) {
      return res.status(404).json({
        success: false,
        message: "Gift card not found",
      });
    }

    if (!giftCard.purchasedBy) {
      return res.status(400).json({
        success: false,
        message: "This gift card has not been purchased",
      });
    }

    if (giftCard.status === "discarded") {
      return res.status(400).json({
        success: false,
        message: "Gift card is already discarded",
      });
    }

    // Discard the gift card
    giftCard.status = "discarded";
    giftCard.isActive = false;
    giftCard.discardedAt = new Date();
    giftCard.discardReason = reason || "Admin discarded";
    giftCard.discardedBy = req.user.id;

    await giftCard.save();

    res.json({
      success: true,
      message: "Gift card discarded successfully",
      data: giftCard,
    });
  } catch (error) {
    console.error("Error discarding gift card:", error);
    res.status(500).json({
      success: false,
      message: "Failed to discard gift card",
      error: error.message,
    });
  }
});

// POST /admin/purchased-giftcards/:id/offline-redeem - Redeem gift card offline with custom amount
router.post("/:id/offline-redeem", async (req, res) => {
  try {
    const { amount, reason } = req.body;
    const giftCardId = req.params.id;

    console.log("Offline redeem request:", {
      giftCardId,
      amount,
      reason,
      params: req.params,
      url: req.url,
    });

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid amount to redeem",
      });
    }

    const giftCard = await GiftCard.findById(giftCardId);
    if (!giftCard) {
      return res.status(404).json({
        success: false,
        message: "Gift card not found",
      });
    }

    if (!giftCard.purchasedBy) {
      return res.status(400).json({
        success: false,
        message: "This gift card has not been purchased",
      });
    }

    if (giftCard.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "Gift card is not active",
      });
    }

    if (giftCard.balance < amount) {
      return res.status(400).json({
        success: false,
        message: `Insufficient balance. Available: $${giftCard.balance.toFixed(
          2
        )}`,
      });
    }

    // Use the gift card method to redeem the amount
    const remainingBalance = giftCard.useGiftCard(
      amount,
      null, // No booking ID for offline redemption
      null // No booking type for offline redemption
    );

    // Add admin info to the usage history entry
    const lastUsage = giftCard.usageHistory[giftCard.usageHistory.length - 1];
    lastUsage.adminRedemption = true;
    lastUsage.redeemedBy = req.user.id;
    lastUsage.reason = reason || "Offline redemption by admin";

    // If fully used, mark additional fields
    if (remainingBalance <= 0) {
      giftCard.usedAt = new Date();
      giftCard.usedBy = req.user.id;
    }

    await giftCard.save();

    res.json({
      success: true,
      message: `Gift card redeemed successfully. Amount: $${amount.toFixed(
        2
      )}, Remaining: $${remainingBalance.toFixed(2)}`,
      data: {
        giftCard,
        amountRedeemed: amount,
        remainingBalance,
        isFullyUsed: remainingBalance <= 0,
      },
    });
  } catch (error) {
    console.error("Error redeeming gift card offline:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to redeem gift card",
      error: error.message,
    });
  }
});

// POST /admin/purchased-giftcards/:id/mark-redeemed - Mark gift card as fully redeemed (updated to allow with balance)
router.post("/:id/mark-redeemed", async (req, res) => {
  try {
    const { forceRedeem = false, reason } = req.body;
    const giftCardId = req.params.id;

    const giftCard = await GiftCard.findById(giftCardId);
    if (!giftCard) {
      return res.status(404).json({
        success: false,
        message: "Gift card not found",
      });
    }

    if (!giftCard.purchasedBy) {
      return res.status(400).json({
        success: false,
        message: "This gift card has not been purchased",
      });
    }

    if (giftCard.status === "used") {
      return res.status(400).json({
        success: false,
        message: "Gift card is already marked as used",
      });
    }

    // Check if there's remaining balance and forceRedeem is not set
    if (giftCard.balance > 0 && !forceRedeem) {
      return res.status(400).json({
        success: false,
        message: `Gift card still has balance of $${giftCard.balance.toFixed(
          2
        )}. Use 'offline-redeem' to redeem specific amounts or set 'forceRedeem' to true to mark as fully used.`,
        remainingBalance: giftCard.balance,
      });
    }

    // If forcing redemption with remaining balance, add usage history entry
    if (giftCard.balance > 0 && forceRedeem) {
      giftCard.usageHistory.push({
        amount: giftCard.balance,
        adminRedemption: true,
        redeemedBy: req.user.id,
        reason:
          reason || "Force redeemed by admin - remaining balance forfeited",
        usedAt: new Date(),
        remainingBalance: 0,
      });
      giftCard.balance = 0;
    }

    // Mark as fully used
    giftCard.status = "used";
    giftCard.usedAt = new Date();
    giftCard.usedBy = req.user.id;

    await giftCard.save();

    res.json({
      success: true,
      message: "Gift card marked as redeemed successfully",
      data: giftCard,
    });
  } catch (error) {
    console.error("Error marking gift card as redeemed:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark gift card as redeemed",
      error: error.message,
    });
  }
});

// POST /admin/purchased-giftcards/:id/reactivate - Reactivate a discarded gift card
router.post("/:id/reactivate", async (req, res) => {
  try {
    const giftCardId = req.params.id;

    const giftCard = await GiftCard.findById(giftCardId);
    if (!giftCard) {
      return res.status(404).json({
        success: false,
        message: "Gift card not found",
      });
    }

    if (giftCard.status !== "discarded") {
      return res.status(400).json({
        success: false,
        message: "Only discarded gift cards can be reactivated",
      });
    }

    // Reactivate the gift card
    giftCard.status = "active";
    giftCard.isActive = true;
    giftCard.discardedAt = undefined;
    giftCard.discardReason = undefined;
    giftCard.discardedBy = undefined;

    await giftCard.save();

    res.json({
      success: true,
      message: "Gift card reactivated successfully",
      data: giftCard,
    });
  } catch (error) {
    console.error("Error reactivating gift card:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reactivate gift card",
      error: error.message,
    });
  }
});

// GET /admin/purchased-giftcards/user/:userId - Get all gift cards for a specific user
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const filter = { purchasedBy: userId };

    // Get total count
    const total = await GiftCard.countDocuments(filter);

    // Get gift cards with pagination
    const giftCards = await GiftCard.find(filter)
      .populate("purchasedBy", "name email")
      .populate("createdBy", "name email")
      .sort({ purchasedAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      data: giftCards,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalItems: total,
        itemsPerPage: limitNum,
      },
    });
  } catch (error) {
    console.error("Error fetching user gift cards:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user gift cards",
      error: error.message,
    });
  }
});

export default router;
