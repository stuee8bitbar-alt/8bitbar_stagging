import express from "express";
import { randomUUID } from "crypto";
import authenticateUser from "../middlewares/authenticateUser.js";
import CafeBooking from "../models/CafeBooking.js";
import KaraokeBooking from "../models/KaraokeBooking.js";
import N64Booking from "../models/N64Booking.js";
import AdminGiftCard from "../models/AdminGiftCard.js";
import GiftCard from "../models/GiftCard.js";
import { sendGiftCardPurchaseConfirmationAsync } from "../services/emailService.js";

const router = express.Router();

// Square API configuration
const getSquareConfig = () => {
  const environment = process.env.SQUARE_ENVIRONMENT || "sandbox";
  const isProduction = environment === "production";

  return {
    baseURL: isProduction
      ? "https://connect.squareup.com"
      : "https://connect.squareupsandbox.com",
    version: "2023-10-18",
    environment: environment,
  };
};

const SQUARE_CONFIG = getSquareConfig();

// Test route to verify Square API setup
router.get("/test", authenticateUser, async (req, res) => {
  try {
    console.log("Testing Square API configuration...");
    console.log(
      "Access Token:",
      process.env.SQUARE_ACCESS_TOKEN ? "Set" : "Not set"
    );
    console.log("Location ID:", process.env.SQUARE_LOCATION_ID);
    console.log("Environment:", SQUARE_CONFIG.environment);
    console.log("Base URL:", SQUARE_CONFIG.baseURL);

    // Test the locations API to verify credentials
    const response = await fetch(`${SQUARE_CONFIG.baseURL}/v2/locations`, {
      method: "GET",
      headers: {
        "Square-Version": SQUARE_CONFIG.version,
        Authorization: `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (response.ok) {
      res.json({
        success: true,
        message: "Square API configured successfully",
        locations:
          data.locations?.map((loc) => ({
            id: loc.id,
            name: loc.name,
            status: loc.status,
          })) || [],
        environment: SQUARE_CONFIG.environment,
        baseURL: SQUARE_CONFIG.baseURL,
      });
    } else {
      throw new Error(`Square API error: ${JSON.stringify(data)}`);
    }
  } catch (error) {
    console.error("Square API test failed:", error);
    res.status(500).json({
      success: false,
      message: "Square API configuration failed",
      error: error.message,
    });
  }
});

// POST /process-gift-card-only - Handle orders fully covered by gift cards
router.post("/process-gift-card-only", authenticateUser, async (req, res) => {
  try {
    const { giftCardData } = req.body;

    console.log("Gift card only payment request received:", {
      userId: req.user.id,
      giftCardData: giftCardData ? "Present" : "Missing",
    });

    // Create a mock payment response for gift card only transactions
    const mockPayment = {
      id: `GIFT_CARD_ONLY_${Date.now()}_${req.user.id}`,
      status: "COMPLETED",
      amount_money: {
        amount: 0,
        currency: "AUD",
      },
      created_at: new Date().toISOString(),
    };

    // Handle gift card creation if this is a gift card purchase
    if (giftCardData) {
      try {
        let createdGiftCard = null;

        if (giftCardData.itemType === "custom") {
          // Create custom gift card
          const giftCard = new GiftCard({
            amount: giftCardData.amount,
            type: "custom",
            description: giftCardData.description,
            createdBy: req.user.id,
            purchasedBy: req.user.id,
            purchasedAt: new Date(),
          });
          await giftCard.save();
          createdGiftCard = giftCard;
        } else if (giftCardData.itemType === "admin") {
          // Handle admin gift card template purchase
          const adminTemplate = await AdminGiftCard.findById(
            giftCardData.giftCardId
          );
          if (!adminTemplate) {
            throw new Error("Admin gift card template not found");
          }

          const giftCard = new GiftCard({
            amount: adminTemplate.amount,
            description:
              adminTemplate.description ||
              `Gift Card - $${adminTemplate.amount}`,
            type: "predefined",
            status: "active",
            isActive: true,
            createdBy: adminTemplate.createdBy,
            purchasedBy: req.user.id,
            purchasedAt: new Date(),
            adminTemplateId: adminTemplate._id,
          });

          await giftCard.save();
          await giftCard.populate("purchasedBy", "name email");
          createdGiftCard = giftCard;
        } else {
          // Complete predefined gift card purchase
          const giftCard = await GiftCard.findById(giftCardData.giftCardId);
          if (
            giftCard &&
            giftCard.status === "active" &&
            !giftCard.purchasedBy
          ) {
            giftCard.purchasedBy = req.user.id;
            giftCard.purchasedAt = new Date();
            await giftCard.save();
            createdGiftCard = giftCard;
          }
        }

        if (createdGiftCard) {
          // Send gift card purchase confirmation email
          try {
            await createdGiftCard.populate("purchasedBy", "name email");
            sendGiftCardPurchaseConfirmationAsync(
              createdGiftCard,
              createdGiftCard.purchasedBy
            );
          } catch (emailError) {
            console.warn(
              "Failed to send gift card purchase email:",
              emailError.message
            );
            // Don't fail the response for email errors
          }

          return res.json({
            success: true,
            payment: mockPayment,
            giftCard: {
              code: createdGiftCard.code,
              pin: createdGiftCard.pin,
              amount: createdGiftCard.amount,
              type: createdGiftCard.type,
              description: createdGiftCard.description,
            },
          });
        }
      } catch (giftCardError) {
        console.error("Gift card creation failed:", giftCardError);
        return res.status(500).json({
          success: false,
          message: "Failed to create gift card",
          error: giftCardError.message,
        });
      }
    }

    res.json({
      success: true,
      payment: mockPayment,
    });
  } catch (err) {
    console.error("Gift card only payment error:", err.message);
    res.status(500).json({
      success: false,
      message: err.message || "Payment processing failed",
    });
  }
});

// POST /process
router.post("/process", authenticateUser, async (req, res) => {
  try {
    const {
      sourceId,
      amount,
      currency = "AUD",
      locationId,
      giftCardData,
    } = req.body;

    console.log("Payment request received:", {
      sourceId: sourceId ? "Present" : "Missing",
      amount,
      currency,
      locationId,
      userId: req.user.id,
      giftCardData: giftCardData ? "Present" : "Missing",
    });

    if (!sourceId || !amount) {
      return res
        .status(400)
        .json({ success: false, message: "Missing sourceId or amount" });
    }

    const finalLocationId = locationId || process.env.SQUARE_LOCATION_ID;
    if (!finalLocationId) {
      return res
        .status(400)
        .json({ success: false, message: "Location ID is required" });
    }

    // Convert amount to cents (Square expects amounts in the smallest currency unit)
    const amountInCents = Math.round(amount * 100);

    console.log("Processing payment:", {
      amountInCents,
      currency: currency.toUpperCase(),
      locationId: finalLocationId,
      userId: req.user.id,
    });

    const requestBody = {
      source_id: sourceId,
      idempotency_key: randomUUID(),
      amount_money: {
        amount: amountInCents,
        currency: currency.toUpperCase(),
      },
      location_id: finalLocationId,
      note: `User ID: ${req.user.id}${
        giftCardData ? " - Gift Card Purchase" : ""
      }`,
    };

    const response = await fetch(`${SQUARE_CONFIG.baseURL}/v2/payments`, {
      method: "POST",
      headers: {
        "Square-Version": SQUARE_CONFIG.version,
        Authorization: `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (response.ok) {
      const payment = data.payment;
      console.log("Payment successful:", payment.id);

      // Handle gift card creation after successful payment
      if (giftCardData) {
        try {
          let createdGiftCard = null;

          if (giftCardData.itemType === "custom") {
            // Create custom gift card
            const giftCard = new GiftCard({
              amount: giftCardData.amount,
              type: "custom",
              description: giftCardData.description,
              createdBy: req.user.id,
              purchasedBy: req.user.id, // User immediately owns custom gift cards
              purchasedAt: new Date(),
            });
            await giftCard.save();
            createdGiftCard = giftCard;
            console.log(
              "Custom gift card created:",
              giftCard.code,
              "PIN:",
              giftCard.pin
            );
          } else if (giftCardData.itemType === "admin") {
            // Handle admin gift card template purchase
            try {
              const adminTemplate = await AdminGiftCard.findById(
                giftCardData.giftCardId
              );
              if (adminTemplate) {
                // Create a new gift card from admin template
                const giftCard = new GiftCard({
                  amount: adminTemplate.amount,
                  description:
                    adminTemplate.description ||
                    `Gift Card - $${adminTemplate.amount}`,

                  type: "predefined", // Use predefined type for admin templates
                  status: "active",
                  isActive: true,
                  createdBy: adminTemplate.createdBy, // Keep original creator
                  purchasedBy: req.user.id, // This triggers the auto-generation
                  purchasedAt: new Date(),
                  adminTemplateId: adminTemplate._id, // Track the template source
                });

                await giftCard.save();

                // Populate the created gift card to ensure we have all data
                await giftCard.populate("purchasedBy", "name email");

                createdGiftCard = giftCard;
                console.log(
                  "Admin template gift card created:",
                  giftCard.code,
                  "PIN:",
                  giftCard.pin,
                  "Amount:",
                  giftCard.amount
                );
              }
            } catch (error) {
              console.error(
                "Error creating gift card from admin template:",
                error
              );
              // Don't fail the payment for this error
            }
          } else {
            // Complete predefined gift card purchase
            const giftCard = await GiftCard.findById(giftCardData.giftCardId);

            if (
              giftCard &&
              giftCard.status === "active" &&
              !giftCard.purchasedBy
            ) {
              giftCard.purchasedBy = req.user.id;
              giftCard.purchasedAt = new Date();
              // Code and PIN will be auto-generated by pre-save middleware
              await giftCard.save();
              createdGiftCard = giftCard;
              console.log(
                "Predefined gift card purchased:",
                giftCard.code,
                "PIN:",
                giftCard.pin
              );
            }
          }

          // Add gift card info to response
          if (createdGiftCard) {
            // Send gift card purchase confirmation email
            try {
              await createdGiftCard.populate("purchasedBy", "name email");
              sendGiftCardPurchaseConfirmationAsync(
                createdGiftCard,
                createdGiftCard.purchasedBy
              );
            } catch (emailError) {
              console.warn(
                "Failed to send gift card purchase email:",
                emailError.message
              );
              // Don't fail the response for email errors
            }

            return res.json({
              success: true,
              payment: {
                id: payment.id,
                status: payment.status,
                amountMoney: payment.amount_money,
                createdAt: payment.created_at,
              },
              giftCard: {
                code: createdGiftCard.code,
                pin: createdGiftCard.pin,
                amount: createdGiftCard.amount,
                type: createdGiftCard.type,
                description: createdGiftCard.description,
              },
            });
          }
        } catch (giftCardError) {
          console.error(
            "Gift card creation/purchase failed after payment:",
            giftCardError
          );
          // Payment was successful, but gift card creation failed
          // Return success with warning
          return res.json({
            success: true,
            payment: {
              id: payment.id,
              status: payment.status,
              amountMoney: payment.amount_money,
              createdAt: payment.created_at,
            },
            warning:
              "Payment successful but gift card creation failed. Please contact support.",
          });
        }
      }

      res.json({
        success: true,
        payment: {
          id: payment.id,
          status: payment.status,
          amountMoney: payment.amount_money,
          createdAt: payment.created_at,
        },
      });
    } else {
      console.error("Payment error:", data);
      const squareError = data.errors?.[0];
      res.status(response.status).json({
        success: false,
        message: squareError?.detail || "Payment failed",
        code: squareError?.code,
        category: squareError?.category,
      });
    }
  } catch (err) {
    console.error("Payment error details:", err.message);
    res.status(500).json({
      success: false,
      message: err.message || "Payment processing failed",
    });
  }
});

// POST /refund
router.post("/refund", authenticateUser, async (req, res) => {
  try {
    const { paymentId, amount, reason } = req.body;

    if (!paymentId) {
      return res.status(400).json({
        success: false,
        message: "Payment ID is required for refund",
      });
    }

    const requestBody = {
      idempotency_key: randomUUID(),
      amount_money: amount
        ? {
            amount: Math.round(amount * 100),
            currency: "AUD",
          }
        : undefined,
      payment_id: paymentId,
      reason: reason || "Customer requested refund",
    };

    const response = await fetch(`${SQUARE_CONFIG.baseURL}/v2/refunds`, {
      method: "POST",
      headers: {
        "Square-Version": SQUARE_CONFIG.version,
        Authorization: `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (response.ok) {
      const refund = data.refund;
      res.status(200).json({
        success: true,
        message: "Refund processed successfully",
        refund: {
          id: refund.id,
          status: refund.status,
          amountMoney: refund.amount_money,
          paymentId: refund.payment_id,
          createdAt: refund.created_at,
        },
      });
    } else {
      console.error("Refund error:", data);
      const squareError = data.errors?.[0];
      res.status(response.status).json({
        success: false,
        message: squareError?.detail || "Refund processing failed",
        code: squareError?.code,
        category: squareError?.category,
      });
    }
  } catch (error) {
    console.error("Refund processing error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Refund processing failed",
    });
  }
});

// POST /webhook - Handle Square payment notifications
router.post("/webhook", async (req, res) => {
  try {
    const { type, data } = req.body;

    // Handle payment.updated event
    if (type === "payment.updated" || type === "payment.created") {
      const payment = data.object;
      const paymentId = payment.id;
      const paymentStatus = payment.status;

      console.log(`Payment webhook received: ${paymentId} - ${paymentStatus}`);

      // Update booking status based on payment status
      let bookingStatus = "pending";
      if (paymentStatus === "COMPLETED") {
        bookingStatus = "confirmed";
      } else if (paymentStatus === "FAILED" || paymentStatus === "CANCELED") {
        bookingStatus = "cancelled";
      }

      // Update all booking types with this payment ID
      const updatePromises = [
        CafeBooking.updateMany(
          { paymentId: paymentId },
          {
            status: bookingStatus,
            paymentStatus: paymentStatus.toLowerCase(),
          }
        ),
        KaraokeBooking.updateMany(
          { paymentId: paymentId },
          {
            status: bookingStatus,
            paymentStatus: paymentStatus.toLowerCase(),
          }
        ),
        N64Booking.updateMany(
          { paymentId: paymentId },
          {
            status: bookingStatus,
            paymentStatus: paymentStatus.toLowerCase(),
          }
        ),
      ];

      await Promise.all(updatePromises);

      console.log(
        `Updated booking status for payment ${paymentId} to ${bookingStatus}`
      );
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
