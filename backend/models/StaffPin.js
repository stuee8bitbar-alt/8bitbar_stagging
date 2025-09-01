import mongoose from "mongoose";

const staffPinSchema = new mongoose.Schema({
  pin: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function (v) {
        // Ensure PIN is exactly 4 digits
        return /^\d{4}$/.test(v);
      },
      message: "PIN must be exactly 4 digits",
    },
  },
  adminUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  staffName: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastUsed: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for efficient lookups (pin index is automatically created by unique: true)
staffPinSchema.index({ adminUserId: 1 });
staffPinSchema.index({ isActive: 1 });

// Update timestamp on save
staffPinSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model("StaffPin", staffPinSchema);
