import express from "express";
import connectDB from "./database/db.js";
import dotenv from "dotenv";
import cors from "cors";
import userRoutes from "./routes/user.route.js";
import karaokeRoutes from "./routes/karaoke.route.js";
import n64Routes from "./routes/n64.route.js";
import adminRoutes from "./routes/admin.route.js";
import superadminPinRoutes from "./routes/superadmin/pin.route.js";
import cafeRoutes from "./routes/cafe.route.js";
import paymentRoutes from "./routes/payment.route.js";
import contactRoutes from "./routes/contact.route.js";
import clientRoutes from "./routes/client.route.js";
import giftCardRoutes from "./routes/giftcard.route.js";
import surveyRoutes from "./routes/survey.route.js";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();

// Get environment-specific configuration
const getConfig = () => {
  const environment = process.env.SQUARE_ENVIRONMENT || "sandbox";
  const isProduction = environment === "production";

  return {
    corsOrigins: isProduction
      ? [
          "https://8bitbar.com.au",
          "https://test.8bitbar.com.au",
          "https://www.8bitbar.com.au",
          "https://8bitbar.vercel.app",
          "https://8bitbar-gilt.vercel.app",
          "https://8bitbar-4m5h.vercel.app",
          "http://15.207.113.121:3000"
        ]
      : [
          "http://localhost:5173",
          "http://192.168.31.163:5173",
          "https://test.8bitbar.com.au",
          "http://15.207.113.121:3000"
        ],
    port: process.env.PORT || 3000,
  };
};

const config = getConfig();

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: config.corsOrigins,
    credentials: true,
  })
);
app.options(
  "*",
  cors({
    origin: config.corsOrigins,
    credentials: true,
  })
);
app.use(cookieParser());

// API routes
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/karaoke-rooms", karaokeRoutes);
app.use("/api/v1/n64-rooms", n64Routes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/superadmin", superadminPinRoutes);
app.use("/api/v1/cafe", cafeRoutes);
app.use("/api/v1/payments", paymentRoutes);
app.use("/api/v1", contactRoutes);
app.use("/api/v1/client", clientRoutes);
app.use("/api/v1/giftcards", giftCardRoutes);
app.use("/api/v1/surveys", surveyRoutes);

// ✅ Health check route
app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy",
    environment: process.env.SQUARE_ENVIRONMENT || "sandbox",
    timestamp: new Date().toISOString(),
  });
});

// Connect to DB and start server
connectDB();
app.listen(config.port, () => {
  console.log(`🚀 Server running on port ${config.port}`);
  console.log(`🌐 Environment: ${process.env.SQUARE_ENVIRONMENT || "sandbox"}`);
  console.log(`🔓 CORS Origins: ${config.corsOrigins.join(", ")}`);
});
