import express from "express";
import authenticateAdmin from "../middlewares/authenticateAdmin.js";

// Import sub-routes
import adminKaraokeRoutes from "./admin/karaoke.route.js";
import adminN64Routes from "./admin/n64.route.js";
import adminCafeRoutes from "./admin/cafe.route.js";
import adminUserRoutes from "./admin/user.route.js";
import adminBookingRoutes from "./admin/booking.route.js";
import adminFinanceRoutes from "./admin/finance.route.js";
import adminAllBookingsRoutes from "./admin/all-bookings.route.js";
import adminPinVerifyRoutes from "./admin/pin-verify.route.js";
import adminGiftCardRoutes from "./admin/giftcard.route.js";
import adminGiftCardManagementRoutes from "./admin/giftcard.route.js";
import adminPurchasedGiftCardsRoutes from "./admin/purchased-giftcards.route.js";

const router = express.Router();

// Apply admin authentication to all routes (both admin and superadmin can access)
router.use(authenticateAdmin);

// Mount sub-routes
router.use("/karaoke", adminKaraokeRoutes);
router.use("/n64", adminN64Routes);
router.use("/cafe", adminCafeRoutes);
router.use("/users", adminUserRoutes);
router.use("/bookings", adminBookingRoutes);
router.use("/finance", adminFinanceRoutes);
router.use("/all-bookings", adminAllBookingsRoutes);
router.use("/pin-verify", adminPinVerifyRoutes);
router.use("/giftcards", adminGiftCardRoutes);
router.use("/giftcard-management", adminGiftCardManagementRoutes);
router.use("/purchased-giftcards", adminPurchasedGiftCardsRoutes);

// PIN management routes are mounted separately with superadmin-only access
// This will be handled in the main app.js or server.js file

export default router;
