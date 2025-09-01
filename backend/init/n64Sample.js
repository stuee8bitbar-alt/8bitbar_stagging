// seedN64Rooms.js

import mongoose from "mongoose";
import N64Room from "../models/N64Room.js";
import N64Booking from "../models/N64Booking.js";
import User from "../models/user.model.js";

const MONGODB_URI = "mongodb://localhost:27017/8bitbar";

const seedData = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB.");

    // Find or create dummy users
    let dummyUser1 = await User.findOne({ email: "mario@example.com" });
    if (!dummyUser1) {
      dummyUser1 = await User.create({
        name: "Mario Player",
        email: "mario@example.com",
        password: "hashedpassword123",
        role: "customer",
      });
      console.log("✅ Created dummy user:", dummyUser1.email);
    }

    let dummyUser2 = await User.findOne({ email: "peach@example.com" });
    if (!dummyUser2) {
      dummyUser2 = await User.create({
        name: "Peach Player",
        email: "peach@example.com",
        password: "hashedpassword123",
        role: "customer",
      });
      console.log("✅ Created dummy user:", dummyUser2.email);
    }

    // Get booth ObjectIds
    const mickey = await N64Room.findOne({ roomType: "mickey" });
    const minnie = await N64Room.findOne({ roomType: "minnie" });
    if (!mickey || !minnie) {
      throw new Error(
        "Both Mickey and Minnie booths must exist in N64Room collection."
      );
    }

    // Clear existing bookings (optional)
    await N64Booking.deleteMany({});
    console.log("Old N64 bookings cleared.");

    // Booking 1: Mickey, 6 PM to 8 PM
    const booking1 = {
      userId: dummyUser1._id,
      customerName: "Mario Player",
      customerEmail: "mario@example.com",
      customerPhone: "+1-555-0123",
      numberOfPeople: 3,
      roomId: mickey._id,
      roomType: "mickey",
      date: "2025-08-01", // FIX: Use separate date and time fields
      time: "6:00 PM",
      durationHours: 2,
      totalPrice: 40, // assuming $20/hour
      status: "confirmed",
    };

    // Booking 2: Minnie, 7 PM to 9 PM
    const booking2 = {
      userId: dummyUser2._id,
      customerName: "Peach Player",
      customerEmail: "peach@example.com",
      customerPhone: "+1-555-0456",
      numberOfPeople: 2,
      roomId: minnie._id,
      roomType: "minnie",
      date: "2025-08-01", // FIX: Use separate date and time fields
      time: "2:00 PM",
      durationHours: 2,
      totalPrice: 40, // assuming $20/hour
      status: "confirmed",
    };

    await N64Booking.insertMany([booking1, booking2]);
    console.log("Dummy N64 bookings inserted successfully.");
  } catch (error) {
    console.error("Error seeding N64 bookings:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
};

seedData();
