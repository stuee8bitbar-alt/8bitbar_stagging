import mongoose from "mongoose";

const chairSchema = new mongoose.Schema({
  id: { type: String, required: true },
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  width: { type: Number, required: true },
  height: { type: Number, required: true },
  color: { type: String, required: true },
});

const tableSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: { type: String, enum: ["round-table", "corner-table"], required: true },
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  radius: { type: Number }, // for round tables
  width: { type: Number }, // for corner tables
  height: { type: Number }, // for corner tables
  color: { type: String, required: true },
});

const cafeLayoutSchema = new mongoose.Schema(
  {
    templateName: { type: String, required: true, default: "Template 1" },
    chairs: [chairSchema],
    tables: [tableSchema],
    bgImageUrl: { type: String, default: "" },
    canvasWidth: { type: Number, default: 1000 },
    canvasHeight: { type: Number, default: 2400 },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    changeType: {
      type: String,
      enum: ["added", "removed", "updated"],
      required: true,
    },
    deviceType: {
      type: String,
      enum: ["desktop", "mobile"],
      default: "desktop",
    },
    isActive: { type: Boolean, default: true },
    isActiveForBooking: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Compound index to ensure unique templates per device type
cafeLayoutSchema.index({ templateName: 1, deviceType: 1 }, { unique: true });

export default mongoose.model("CafeLayout", cafeLayoutSchema);
