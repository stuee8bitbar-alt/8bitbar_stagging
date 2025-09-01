import mongoose from "mongoose";

const n64RoomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      enum: ["Mickey Mouse N64 Room", "Minnie Mouse N64 Room"],
    },
    description: {
      type: String,
      required: true,
    },
    maxPeople: {
      type: Number,
      default: 4,
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
      default: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    },
    inclusions: {
      controllers: { type: Number, default: 4 },
      features: {
        type: [String],
        default: [
          "Nintendo 64 console with classic games",
          "4 controllers for multiplayer gaming",
          "Large screen TV for optimal gaming experience",
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
    roomType: {
      type: String,
      enum: ["mickey", "minnie"],
      required: true,
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

export default mongoose.model("N64Room", n64RoomSchema);
