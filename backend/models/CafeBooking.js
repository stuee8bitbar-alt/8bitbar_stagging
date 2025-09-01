import mongoose from "mongoose";

const cafeBookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    chairIds: [
      {
        type: String,
        required: true,
      },
    ],
    date: {
      type: String,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
      min: 1,
      max: 8, // Maximum 8 hours
    },
    totalCost: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
    },
    customerName: {
      type: String,
      required: true,
    },
    customerEmail: {
      type: String,
      required: true,
    },
    customerPhone: {
      type: String,
    },
    specialRequests: {
      type: String,
    },
    deviceType: {
      type: String,
      enum: ["desktop", "mobile"],
      default: "desktop",
    },
    paymentId: {
      type: String,
      sparse: true, // Allow multiple null values but unique non-null values
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
    // Staff PIN tracking fields
    staffPin: {
      type: String,
      required: false, // Not required for regular user bookings
      validate: {
        validator: function (v) {
          // If provided, must be exactly 4 digits
          return !v || /^\d{4}$/.test(v);
        },
        message: "Staff PIN must be exactly 4 digits",
      },
    },
    staffName: {
      type: String,
      required: false, // Not required for regular user bookings
    },
    isManualBooking: {
      type: Boolean,
      default: false, // Indicates if this was created via admin manual booking
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
cafeBookingSchema.index({ date: 1, time: 1 });
cafeBookingSchema.index({ userId: 1 });
cafeBookingSchema.index({ status: 1 });

export default mongoose.model("CafeBooking", cafeBookingSchema);
