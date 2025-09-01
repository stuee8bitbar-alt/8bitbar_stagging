import mongoose from "mongoose";

const karaokeRoomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      default: "Alice in Wonderland Karaoke Room",
    },
    description: {
      type: String,
      required: true,
    },
    maxPeople: {
      type: Number,
      default: 12,
    },
    pricePerHour: {
      type: Number,
      required: true,
    },
    timeSlots: {
      type: [String],
      default: [
        "2:00 PM",
        "3:00 PM",
        "4:00 PM",
        "5:00 PM",
        "6:00 PM",
        "7:00 PM",
        "8:00 PM",
        "9:00 PM",
        "10:00 PM",
      ],
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
    inclusions: {
      microphones: { type: Number, default: 4 },
      features: {
        type: [String],
        default: [
          "Pick-your-own songs displayed with lyrics on a large screen",
          "Alice in Wonderland themed decorations and ambiance",
        ],
      },
    },
    imageUrl: {
      type: String,
    },
    images: {
      type: [String],
      default: [],
    },
    isVisible: {
      type: Boolean,
      default: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Booking block fields
    blockStartDate: {
      type: String, // YYYY-MM-DD
      default: "",
    },
    blockEndDate: {
      type: String, // YYYY-MM-DD
      default: "",
    },
    blockNote: {
      type: String,
      default: "",
    },
    availability: {
      type: Object, // { Monday: ["2:00 PM", ...], ... }
      default: {},
    },
  },
  { timestamps: true }
);

export default mongoose.model("KaraokeRoom", karaokeRoomSchema);
