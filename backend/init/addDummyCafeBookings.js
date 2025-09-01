import CafeBooking from "../models/CafeBooking.js";
import User from "../models/user.model.js";
import mongoose from "mongoose";

const addDummyCafeBookings = async () => {
  try {
    console.log("🍽️ Adding dummy cafe bookings...");

    // Find or create a dummy user
    let dummyUser = await User.findOne({ email: "dummy@test.com" });

    if (!dummyUser) {
      dummyUser = await User.create({
        name: "Test User",
        email: "dummy@test.com",
        password: "hashedpassword123", // In real app, this would be properly hashed
        role: "customer",
      });
      console.log("✅ Created dummy user:", dummyUser.email);
    } else {
      console.log("✅ Using existing dummy user:", dummyUser.email);
    }

    // Check if booking already exists
    const existingBooking = await CafeBooking.findOne({
      date: "2025-07-26",
      time: "16:00",
      chairIds: { $in: ["c1", "c2"] },
    });

    if (existingBooking) {
      console.log("⚠️  Booking already exists for July 26, 4-6 PM");
      return;
    }

    // Create dummy booking for c1 and c2 on July 26, 4-6 PM
    const dummyBooking = await CafeBooking.create({
      userId: dummyUser._id,
      chairIds: ["c1", "c2"],
      date: "2025-07-26",
      time: "16:00", // 4 PM in 24-hour format
      duration: 2, // 2 hours (4-6 PM)
      totalCost: 40, // 2 chairs × $10/hour × 2 hours = $40
      status: "confirmed",
      customerName: dummyUser.name,
      customerEmail: dummyUser.email,
      customerPhone: "+1234567890",
      specialRequests: "Test booking for development",
      deviceType: "desktop",
    });

    console.log("🎉 Successfully created dummy cafe booking!");
    console.log("📋 Booking details:");
    console.log(`   - Booking ID: ${dummyBooking._id}`);
    console.log(`   - Customer: ${dummyBooking.customerName}`);
    console.log(`   - Chairs: ${dummyBooking.chairIds.join(", ")}`);
    console.log(`   - Date: ${dummyBooking.date}`);
    console.log(`   - Time: ${dummyBooking.time} (4:00 PM)`);
    console.log(`   - Duration: ${dummyBooking.duration} hours`);
    console.log(`   - Total Cost: $${dummyBooking.totalCost}`);
    console.log(`   - Status: ${dummyBooking.status}`);

    console.log("\n🧪 Test scenarios:");
    console.log("   - Chairs c1 and c2 should show as booked on July 26");
    console.log(
      "   - Time slots 4:00 PM and 5:00 PM should be unavailable for c1, c2"
    );
    console.log("   - Booking should appear in admin panel");
  } catch (error) {
    console.error("❌ Error creating dummy cafe booking:", error);
  }
};

// Function to run and optionally close connection
const runScript = async (closeConnection = false) => {
  try {
    await addDummyCafeBookings();

    if (closeConnection) {
      console.log("\n🔌 Closing database connection...");
      await mongoose.connection.close();
      console.log("✅ Database connection closed");
      process.exit(0);
    }
  } catch (error) {
    console.error("❌ Script failed:", error);
    if (closeConnection) {
      process.exit(1);
    }
  }
};

// Export for use in other files
export default addDummyCafeBookings;

// If this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  // Connect to database if not already connected
  if (mongoose.connection.readyState === 0) {
    console.log("🔌 Connecting to database...");
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/8bitbar"
    );
    console.log("✅ Connected to database");
  }

  await runScript(true);
}
