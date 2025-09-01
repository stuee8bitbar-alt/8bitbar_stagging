import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String }, // Added phone field
  dob: { type: Date }, // Added date of birth
  role: {
    type: String,
    enum: ["customer", "admin", "superadmin"],
    default: "customer",
  },
  hasPin: { type: Boolean, default: false }, // Indicates if user has associated PIN codes
  // Password reset fields
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Create the model
const User = mongoose.model("User", userSchema);

// Export the model
export default User;
