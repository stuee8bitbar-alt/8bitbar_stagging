import mongoose from "mongoose";

const cafeSettingsSchema = new mongoose.Schema(
  {
    templateName: {
      type: String,
      required: true,
      default: "Template 1",
    },
    timeSlots: {
      type: [String],
      default: [
        "14:00",
        "15:00",
        "16:00",
        "17:00",
        "18:00",
        "19:00",
        "20:00",
        "21:00",
        "22:00",
      ],
      required: true,
    },
    pricePerChairPerHour: {
      type: Number,
      default: 10,
      required: true,
    },
    maxDuration: {
      type: Number,
      default: 8,
      required: true,
    },
    openingTime: {
      type: String,
      default: "14:00",
      required: true,
    },
    closingTime: {
      type: String,
      default: "23:00",
      required: true,
    },
    weekDays: {
      type: [String],
      default: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      enum: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Ensure unique settings per template
cafeSettingsSchema.index({ templateName: 1 }, { unique: true });

export default mongoose.model("CafeSettings", cafeSettingsSchema);
