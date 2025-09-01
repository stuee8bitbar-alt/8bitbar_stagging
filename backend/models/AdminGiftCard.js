import mongoose from "mongoose";

const adminGiftCardSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },
    description: {
      type: String,
      required: false,
      default: "",
    },
    imageUrl: {
      type: String,
      default:
        "https://8bitbar.com.au/wp-content/uploads/2025/05/4d7846ed-b5ad-4444-bba5-35271a0d87bc-500x500.jpeg",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isVisible: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
adminGiftCardSchema.index({ amount: 1 });
adminGiftCardSchema.index({ isActive: 1, isVisible: 1 });

export default mongoose.model("AdminGiftCard", adminGiftCardSchema);
