// seedKaraokeRoom.js

import mongoose from "mongoose";
import KaraokeRoom from "../models/KaraokeRoom.js"; // adjust path as needed

const MONGODB_URI = "mongodb://localhost:27017/8bitbar";

const seedKaraokeRoom = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ Connected to MongoDB");

    // Optional: clear existing rooms
    await KaraokeRoom.deleteMany({});
    console.log("🧹 Existing rooms cleared");

    // Insert dummy karaoke room with full timeSlots and under18TimeSlots
    await KaraokeRoom.create({
      name: "Alice in Wonderland Karaoke Room",
      description:
        "Host your next unforgettable karaoke party in our Alice in Wonderland-themed room, designed for up to 12 people.",
      maxPeople: 12,
      pricePerHour: 60,
      timeSlots: [
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
      under18TimeSlots: {
        Friday: "till 7pm",
        Saturday: "till 7pm",
        Sunday: "till 9pm",
      },
      inclusions: {
        microphones: 4,
        features: [
          "Pick-your-own songs displayed with lyrics on a large screen",
          "Alice in Wonderland themed decorations and ambiance",
        ],
      },
      imageUrl:
        "https://8bitbar.com.au/wp-content/uploads/2025/05/0b42d0ef-96db-40f0-abf4-51edbb96ac42-e1748892865932.jpeg",
    });

    console.log("✅ Karaoke room inserted successfully");
  } catch (error) {
    console.error("❌ Error seeding karaoke room:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
    process.exit(0);
  }
};

seedKaraokeRoom();
