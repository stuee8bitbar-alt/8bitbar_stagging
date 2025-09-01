// seedBookings.js

import mongoose from "mongoose";
import KaraokeBooking from "../models/KaraokeBooking.js";
import User from "../models/user.model.js";

// Replace with your actual MongoDB connection string
const MONGODB_URI = "mongodb://localhost:27017/8bitbar";

const seedData = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Connected to MongoDB.");

    // Find or create dummy user
    let dummyUser = await User.findOne({ email: "charlie@example.com" });
    if (!dummyUser) {
      dummyUser = await User.create({
        name: "Charlie Brown",
        email: "charlie@example.com",
        password: "hashedpassword123",
        role: "customer",
      });
      console.log("✅ Created dummy user:", dummyUser.email);
    }

    // Clear existing bookings (optional)
    await KaraokeBooking.deleteMany({});
    console.log("Old bookings cleared.");

    // Booking 3: 2 PM to 5 PM
    const booking3 = {
      userId: dummyUser._id,
      customerName: "Charlie Brown",
      customerEmail: "charlie@example.com",
      customerPhone: "+1-555-0789",
      numberOfPeople: 5,
      date: "2025-08-01", // FIX: Use separate date and time fields
      time: "2:00 PM",
      durationHours: 3,
      totalPrice: 300,
      status: "confirmed",
    };

    await KaraokeBooking.insertMany([booking3]);
    console.log("Dummy bookings inserted successfully.");
  } catch (error) {
    console.error("Error seeding bookings:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
};

seedData();
