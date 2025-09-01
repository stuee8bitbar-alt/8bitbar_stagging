import mongoose from "mongoose";

const karaokeBookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "KaraokeRoom",
      required: true,
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
    numberOfPeople: {
      type: Number,
      required: true,
    },
    // FIX: Use separate date and time fields to avoid timezone issues
    date: {
      type: String, // YYYY-MM-DD format
      required: true,
    },
    time: {
      type: String, // HH:MM AM/PM format
      required: true,
    },
    durationHours: {
      type: Number, // should be a whole number (e.g., 1, 2, 3)
      required: true,
      validate: {
        validator: Number.isInteger,
        message: "Duration must be an integer (in hours)",
      },
    },
    totalPrice: {
      type: Number, // auto-calculated from duration & room price
      required: true,
      min: [0, "Price must be non-negative"],
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
    },
    paymentId: {
      type: String,
      sparse: true,
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
    comments: {
      type: String,
      required: false, // Optional field for special requests and notes
      maxlength: [500, "Comments cannot exceed 500 characters"],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("KaraokeBooking", karaokeBookingSchema);
