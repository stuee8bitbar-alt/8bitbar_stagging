import mongoose from "mongoose";

const giftCardSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: false, // Will be auto-generated when purchased
      default: null,
    },
    pin: {
      type: String,
      required: false, // Will be auto-generated when purchased
      default: null,
      validate: {
        validator: function (v) {
          return !v || /^\d{6}$/.test(v); // Must be 6 digits if present
        },
        message: "PIN must be exactly 6 digits",
      },
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
      validate: {
        validator: function (v) {
          return v > 0;
        },
        message: "Gift card amount must be greater than 0",
      },
    },
    balance: {
      type: Number,
      required: true,
      min: 0,
      default: function () {
        return this.amount;
      },
    },
    type: {
      type: String,
      enum: ["predefined", "custom"],
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "used", "discarded"],
      default: "active",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    purchasedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    purchasedAt: {
      type: Date,
      required: false,
    },
    expiresAt: {
      type: Date,
      required: false,
    },
    description: {
      type: String,
      required: false,
    },
    // Reference to admin template if created from one
    adminTemplateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AdminGiftCard",
      required: false,
    },
    // Track usage history
    usageHistory: [
      {
        amount: {
          type: Number,
          required: true,
        },
        bookingId: {
          type: mongoose.Schema.Types.ObjectId,
          required: false,
        },
        bookingType: {
          type: String,
          enum: ["cafe", "karaoke", "n64"],
          required: false,
        },
        usedAt: {
          type: Date,
          default: Date.now,
        },
        remainingBalance: {
          type: Number,
          required: true,
        },
        // Admin redemption fields
        adminRedemption: {
          type: Boolean,
          default: false,
        },
        redeemedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: false,
        },
        reason: {
          type: String,
          required: false,
        },
      },
    ],
    // Admin management fields
    discardedAt: {
      type: Date,
      required: false,
    },
    discardReason: {
      type: String,
      required: false,
    },
    discardedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    usedAt: {
      type: Date,
      required: false,
    },
    usedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
giftCardSchema.index({ status: 1 });
giftCardSchema.index({ isActive: 1 });
giftCardSchema.index({ purchasedBy: 1 });
giftCardSchema.index({ balance: 1 });
// Sparse unique index for codes - only applies when code exists
giftCardSchema.index({ code: 1 }, { unique: true, sparse: true });
// Sparse unique index for PINs - only applies when PIN exists
giftCardSchema.index({ pin: 1 }, { unique: true, sparse: true });

// Pre-save middleware to auto-generate code and PIN ONLY when purchased
giftCardSchema.pre("save", async function (next) {
  // Only generate code and PIN if this is being purchased (purchasedBy is set) and they don't exist
  if (this.purchasedBy && (!this.code || !this.pin)) {
    try {
      // Generate code
      if (!this.code) {
        // Find the highest code and increment (sort by numeric value, not string)
        const highestCard = await this.constructor.findOne(
          { code: { $exists: true, $ne: null } },
          {},
          { sort: { createdAt: -1 } } // Sort by creation date to get latest
        );

        let nextNumber = 101; // Start from 101

        if (highestCard && highestCard.code) {
          // Extract the number from the highest code (e.g., "GFT-101" -> 101)
          const match = highestCard.code.match(/GFT-(\d+)/);
          if (match) {
            nextNumber = parseInt(match[1]) + 1;
          }
        }

        // Ensure uniqueness by checking if code already exists
        let attempts = 0;
        let codeExists = true;
        while (codeExists && attempts < 100) {
          const testCode = `GFT-${nextNumber}`;
          const existingCard = await this.constructor.findOne({
            code: testCode,
          });
          if (!existingCard) {
            this.code = testCode;
            codeExists = false;
          } else {
            nextNumber++;
            attempts++;
          }
        }

        if (attempts >= 100) {
          throw new Error("Unable to generate unique gift card code");
        }
      }

      // Generate PIN
      if (!this.pin) {
        let pinExists = true;
        let attempts = 0;
        while (pinExists && attempts < 100) {
          const testPin = Math.floor(
            100000 + Math.random() * 900000
          ).toString();
          const existingCard = await this.constructor.findOne({ pin: testPin });
          if (!existingCard) {
            this.pin = testPin;
            pinExists = false;
          }
          attempts++;
        }

        if (attempts >= 100) {
          throw new Error("Unable to generate unique gift card PIN");
        }
      }
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Method to use gift card
giftCardSchema.methods.useGiftCard = function (
  amount,
  bookingId = null,
  bookingType = null
) {
  if (this.status !== "active" || this.balance < amount) {
    throw new Error("Gift card cannot be used");
  }

  this.balance -= amount;

  // Add to usage history
  this.usageHistory.push({
    amount: amount,
    bookingId: bookingId,
    bookingType: bookingType,
    remainingBalance: this.balance,
  });

  // Update status if fully used
  if (this.balance <= 0) {
    this.status = "used";
  }

  return this.balance;
};

// Method to check if gift card is valid
giftCardSchema.methods.isValid = function () {
  return this.status === "active" && this.isActive && this.balance > 0;
};

// Static method to find valid gift card by code
giftCardSchema.statics.findValidByCode = function (code) {
  return this.findOne({
    code: code,
    status: "active",
    isActive: true,
    balance: { $gt: 0 },
  });
};

export default mongoose.model("GiftCard", giftCardSchema);
