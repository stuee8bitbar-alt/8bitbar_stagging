import express from "express";
import authenticateAdmin from "../../middlewares/authenticateAdmin.js";
import CafeBooking from "../../models/CafeBooking.js";
import CafeLayout from "../../models/CafeLayout.js";
import CafeSettings from "../../models/CafeSettings.js";

const router = express.Router();

router.use(authenticateAdmin);

// Dashboard stats endpoints
router.get("/cafe-bookings/count", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let filter = {};

    // Add date filtering if provided
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) {
        filter.date.$gte = startDate;
      }
      if (endDate) {
        filter.date.$lte = endDate;
      }
    }

    const count = await CafeBooking.countDocuments(filter);
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: "Error fetching cafe bookings count" });
  }
});

router.get("/cafe-bookings/revenue", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let matchFilter = { status: { $ne: "cancelled" } };

    // Add date filtering if provided
    if (startDate || endDate) {
      matchFilter.date = {};
      if (startDate) {
        matchFilter.date.$gte = startDate;
      }
      if (endDate) {
        matchFilter.date.$lte = endDate;
      }
    }

    const revenue = await CafeBooking.aggregate([
      { $match: matchFilter },
      { $group: { _id: null, totalRevenue: { $sum: "$totalCost" } } },
    ]);
    const totalRevenue = revenue.length > 0 ? revenue[0].totalRevenue : 0;
    res.json({ revenue: totalRevenue });
  } catch (error) {
    res.status(500).json({ message: "Error fetching cafe bookings revenue" });
  }
});

// Cafe Bookings Management
router.get("/cafe-bookings", async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status && status !== "all" ? { status } : {};

    const bookings = await CafeBooking.find(filter)
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.json({ bookings });
  } catch (error) {
    console.error("Error fetching cafe bookings:", error);
    res.status(500).json({ message: "Error fetching cafe bookings" });
  }
});

router.patch("/cafe-bookings/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    console.log(
      `🔄 Updating cafe booking ${req.params.id} status to: ${status}`
    );

    // Determine payment status based on booking status
    let paymentStatus;
    switch (status) {
      case "pending":
        paymentStatus = "pending";
        console.log(`📝 Setting paymentStatus to: ${paymentStatus} (Not Paid)`);
        break;
      case "confirmed":
        paymentStatus = "completed";
        console.log(`📝 Setting paymentStatus to: ${paymentStatus} (Paid)`);
        break;
      case "cancelled":
      case "completed":
        // Keep existing payment status for cancelled/completed bookings
        const existingBooking = await CafeBooking.findById(req.params.id);
        paymentStatus = existingBooking.paymentStatus;
        console.log(`📝 Keeping existing paymentStatus: ${paymentStatus}`);
        break;
      default:
        paymentStatus = "pending";
        console.log(`📝 Default paymentStatus to: ${paymentStatus}`);
    }

    console.log(
      `💾 Updating cafe booking with status: ${status}, paymentStatus: ${paymentStatus}`
    );

    const booking = await CafeBooking.findByIdAndUpdate(
      req.params.id,
      { status, paymentStatus },
      { new: true }
    ).populate("userId", "name email");

    console.log(
      `✅ Updated cafe booking - status: ${booking.status}, paymentStatus: ${booking.paymentStatus}`
    );

    res.json({ booking });
  } catch (error) {
    res.status(500).json({ message: "Error updating booking status" });
  }
});

// Update payment status independently
router.patch("/cafe-bookings/:id/payment-status", async (req, res) => {
  try {
    const { paymentStatus } = req.body;

    if (
      !paymentStatus ||
      !["pending", "completed", "failed", "refunded"].includes(paymentStatus)
    ) {
      return res.status(400).json({ message: "Invalid payment status" });
    }

    const booking = await CafeBooking.findByIdAndUpdate(
      req.params.id,
      { paymentStatus },
      { new: true }
    ).populate("userId", "name email");

    res.json({ booking });
  } catch (error) {
    res.status(500).json({ message: "Error updating payment status" });
  }
});

// Delete cafe booking
router.delete("/cafe-bookings/:id", async (req, res) => {
  try {
    const booking = await CafeBooking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    await CafeBooking.findByIdAndDelete(req.params.id);

    console.log(`🗑️ Deleted cafe booking: ${req.params.id}`);
    res.json({ message: "Cafe booking deleted successfully" });
  } catch (error) {
    console.error("Error deleting cafe booking:", error);
    res.status(500).json({ message: "Error deleting cafe booking" });
  }
});

// Cafe Layout Management
router.get("/cafe-layout", async (req, res) => {
  try {
    const deviceType = req.query.deviceType || "desktop";
    const templateName = req.query.templateName || "Template 1";
    const layout = await CafeLayout.findOne({
      deviceType,
      templateName,
      isActive: true,
    }).sort({
      updatedAt: -1,
    });
    res.json({ layout });
  } catch (error) {
    res.status(500).json({ message: "Error fetching cafe layout" });
  }
});

// Get all templates for a device type
router.get("/cafe-layout/templates", async (req, res) => {
  try {
    const deviceType = req.query.deviceType || "desktop";
    const templates = await CafeLayout.find({
      deviceType,
      isActive: true,
    })
      .select("templateName updatedAt")
      .sort({ updatedAt: -1 });

    res.json({ templates });
  } catch (error) {
    res.status(500).json({ message: "Error fetching templates" });
  }
});

router.put("/cafe-layout", async (req, res) => {
  try {
    const {
      chairs,
      tables,
      changeType,
      bgImageUrl,
      canvasWidth,
      canvasHeight,
      deviceType,
      templateName,
    } = req.body;

    // Find and update existing layout or create new one
    const layout = await CafeLayout.findOneAndUpdate(
      {
        deviceType: deviceType || "desktop",
        templateName: templateName || "Template 1",
      },
      {
        chairs,
        tables,
        bgImageUrl,
        canvasWidth,
        canvasHeight,
        updatedBy: req.userId,
        changeType: changeType || "updated",
        isActive: true,
      },
      {
        new: true,
        upsert: true, // Create if doesn't exist
        runValidators: true,
      }
    );
    res.json({ layout });
  } catch (error) {
    res.status(500).json({ message: "Error updating cafe layout" });
  }
});

// Duplicate template
router.post("/cafe-layout/duplicate", async (req, res) => {
  try {
    const { sourceTemplateName, newTemplateName, deviceType } = req.body;

    // Find the source template (try both device types if not specified)
    let sourceLayout;
    if (deviceType) {
      sourceLayout = await CafeLayout.findOne({
        templateName: sourceTemplateName,
        deviceType: deviceType,
        isActive: true,
      });
    } else {
      // Try to find from either device type
      sourceLayout = await CafeLayout.findOne({
        templateName: sourceTemplateName,
        isActive: true,
      });
    }

    if (!sourceLayout) {
      return res.status(404).json({ message: "Source template not found" });
    }

    // Adjust layout for target device type if different
    let targetDeviceType = deviceType || sourceLayout.deviceType;
    let adjustedChairs = [...sourceLayout.chairs];
    let adjustedTables = [...sourceLayout.tables];
    let adjustedCanvasWidth = sourceLayout.canvasWidth;
    let adjustedCanvasHeight = sourceLayout.canvasHeight;

    // If creating for mobile, adjust sizes
    if (
      targetDeviceType === "mobile" &&
      sourceLayout.deviceType === "desktop"
    ) {
      adjustedChairs = sourceLayout.chairs.map((chair) => ({
        ...chair,
        width: 28, // Mobile chair size
        height: 28,
      }));
      adjustedTables = sourceLayout.tables.map((table) => ({
        ...table,
        radius: table.radius ? 36 : table.radius, // Mobile table radius
        width: table.width ? 60 : table.width, // Mobile table size
        height: table.height ? 60 : table.height,
      }));
      adjustedCanvasWidth = 450; // Mobile canvas width
    }
    // If creating for desktop, adjust sizes
    else if (
      targetDeviceType === "desktop" &&
      sourceLayout.deviceType === "mobile"
    ) {
      adjustedChairs = sourceLayout.chairs.map((chair) => ({
        ...chair,
        width: 32, // Desktop chair size
        height: 32,
      }));
      adjustedTables = sourceLayout.tables.map((table) => ({
        ...table,
        radius: table.radius ? 40 : table.radius, // Desktop table radius
        width: table.width ? 70 : table.width, // Desktop table size
        height: table.height ? 70 : table.height,
      }));
      adjustedCanvasWidth = 1000; // Desktop canvas width
    }

    // Create new template with adjusted data
    const newLayout = new CafeLayout({
      templateName: newTemplateName,
      chairs: adjustedChairs,
      tables: adjustedTables,
      bgImageUrl: sourceLayout.bgImageUrl,
      canvasWidth: adjustedCanvasWidth,
      canvasHeight: adjustedCanvasHeight,
      deviceType: targetDeviceType,
      updatedBy: req.userId,
      changeType: "added",
      isActive: true,
    });

    await newLayout.save();
    res.json({ layout: newLayout });
  } catch (error) {
    res.status(500).json({ message: "Error duplicating template" });
  }
});

// Delete template
router.delete("/cafe-layout/template/:templateName", async (req, res) => {
  try {
    const { templateName } = req.params;
    const { deviceType } = req.query;

    const result = await CafeLayout.findOneAndUpdate(
      {
        templateName,
        deviceType: deviceType || "desktop",
      },
      { isActive: false },
      { new: true }
    );

    if (!result) {
      return res.status(404).json({ message: "Template not found" });
    }

    res.json({ message: "Template deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting template" });
  }
});

// Add a chair or table
router.post("/cafe-layout/item", async (req, res) => {
  try {
    const { item, itemType } = req.body; // itemType: 'chair' or 'table'
    const lastLayout = await CafeLayout.findOne().sort({ updatedAt: -1 });
    let newChairs = lastLayout ? [...lastLayout.chairs] : [];
    let newTables = lastLayout ? [...lastLayout.tables] : [];
    if (itemType === "chair") newChairs.push(item);
    else if (itemType === "table") newTables.push(item);
    const layout = await CafeLayout.create({
      chairs: newChairs,
      tables: newTables,
      updatedBy: req.userId,
      changeType: "added",
    });
    res.json({ layout });
  } catch (error) {
    res.status(500).json({ message: "Error adding item to cafe layout" });
  }
});

// Remove a chair or table
router.delete("/cafe-layout/item/:itemId", async (req, res) => {
  try {
    const { itemId } = req.params;
    const { itemType } = req.query; // 'chair' or 'table'
    const lastLayout = await CafeLayout.findOne().sort({ updatedAt: -1 });
    let newChairs = lastLayout
      ? lastLayout.chairs.filter((c) => c.id !== itemId)
      : [];
    let newTables = lastLayout
      ? lastLayout.tables.filter((t) => t.id !== itemId)
      : [];
    const layout = await CafeLayout.create({
      chairs: itemType === "chair" ? newChairs : lastLayout.chairs,
      tables: itemType === "table" ? newTables : lastLayout.tables,
      updatedBy: req.userId,
      changeType: "removed",
    });
    res.json({ layout });
  } catch (error) {
    res.status(500).json({ message: "Error removing item from cafe layout" });
  }
});

// Cafe Settings Management
router.get("/cafe-settings", async (req, res) => {
  try {
    const { templateName } = req.query;

    if (templateName) {
      // Get settings for specific template
      let settings = await CafeSettings.findOne({ templateName });

      // Create default settings if none exist for this template
      if (!settings) {
        settings = await CafeSettings.create({
          templateName,
          timeSlots: [
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
          pricePerChairPerHour: 10,
          maxDuration: 8,
          openingTime: "14:00",
          closingTime: "23:00",
          updatedBy: req.userId,
        });
      }

      res.json({ settings });
    } else {
      // Get all templates with their settings
      const settings = await CafeSettings.find().sort({ templateName: 1 });
      res.json({ settings });
    }
  } catch (error) {
    res.status(500).json({ message: "Error fetching cafe settings" });
  }
});

router.put("/cafe-settings", async (req, res) => {
  try {
    const {
      templateName,
      timeSlots,
      pricePerChairPerHour,
      maxDuration,
      openingTime,
      closingTime,
      weekDays,
    } = req.body;

    const settings = await CafeSettings.findOneAndUpdate(
      { templateName },
      {
        timeSlots,
        pricePerChairPerHour,
        maxDuration,
        openingTime,
        closingTime,
        weekDays,
        updatedBy: req.userId,
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    res.json({ settings });
  } catch (error) {
    res.status(500).json({ message: "Error updating cafe settings" });
  }
});

// Get all templates with settings
router.get("/cafe-settings/templates", async (req, res) => {
  try {
    const settings = await CafeSettings.find().sort({ templateName: 1 });
    res.json({ settings });
  } catch (error) {
    res.status(500).json({ message: "Error fetching cafe settings templates" });
  }
});

// Set template as active for booking
router.post("/cafe-layout/set-active-for-booking", async (req, res) => {
  try {
    const { templateName, deviceType } = req.body;

    // First, deactivate all templates for booking
    await CafeLayout.updateMany(
      { isActive: true },
      { isActiveForBooking: false }
    );

    // Then activate the specified template for booking for BOTH desktop and mobile
    const results = await Promise.all([
      CafeLayout.findOneAndUpdate(
        {
          templateName,
          deviceType: "desktop",
          isActive: true,
        },
        { isActiveForBooking: true },
        { new: true }
      ),
      CafeLayout.findOneAndUpdate(
        {
          templateName,
          deviceType: "mobile",
          isActive: true,
        },
        { isActiveForBooking: true },
        { new: true }
      ),
    ]);

    // Check if at least one template was found and updated
    const desktopResult = results[0];
    const mobileResult = results[1];

    if (!desktopResult && !mobileResult) {
      return res
        .status(404)
        .json({ message: "Template not found for any device type" });
    }

    res.json({
      message: "Template set as active for booking for both desktop and mobile",
      layouts: {
        desktop: desktopResult,
        mobile: mobileResult,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error setting template as active for booking" });
  }
});

// Get active template for booking
router.get("/cafe-layout/active-for-booking", async (req, res) => {
  try {
    const { deviceType } = req.query;

    // Find the active template for the requested device type
    const layout = await CafeLayout.findOne({
      isActiveForBooking: true,
      deviceType: deviceType || "desktop",
    });

    // If not found for the specific device type, try to find any active template
    if (!layout) {
      const anyActiveLayout = await CafeLayout.findOne({
        isActiveForBooking: true,
      });

      if (anyActiveLayout) {
        // Return the found template but note it's for a different device type
        return res.json({
          layout: anyActiveLayout,
          note: `Active template found for ${anyActiveLayout.deviceType} device type`,
        });
      }
    }

    res.json({ layout });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching active template for booking" });
  }
});

export default router;
