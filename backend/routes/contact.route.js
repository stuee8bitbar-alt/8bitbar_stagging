import express from "express";
import nodemailer from "nodemailer";

const router = express.Router();

// Create transporter with 8BitBar SMTP configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "mail.8bitbar.com.au",
  port: process.env.SMTP_PORT || 465,
  secure: process.env.SMTP_SECURE !== "false", // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || "info@8bitbar.com.au",
    pass: process.env.SMTP_PASS || "Arcade123...",
  },
});

// Test SMTP connection
const testConnection = async () => {
  try {
    await transporter.verify();
    console.log("✅ SMTP connection verified successfully");
    return true;
  } catch (error) {
    console.warn("⚠️ SMTP connection failed:", error.message);
    return false;
  }
};

// Contact form submission route
router.post("/contact", async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide all required fields: name, email, subject, and message",
      });
    }

    // Test SMTP connection
    const connectionOk = await testConnection();
    if (!connectionOk) {
      return res.status(500).json({
        success: false,
        message: "Email service temporarily unavailable",
      });
    }

    // Create email template
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #e91e63; margin-bottom: 20px;">New Contact Form Submission</h2>
        
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #333; margin-top: 0;">Contact Details</h3>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ""}
          <p><strong>Subject:</strong> ${subject}</p>
        </div>
        
        <div style="background-color: #fff; padding: 20px; border-left: 4px solid #e91e63; margin-bottom: 20px;">
          <h3 style="color: #333; margin-top: 0;">Message</h3>
          <p style="line-height: 1.6; color: #555;">${message.replace(
            /\n/g,
            "<br>"
          )}</p>
        </div>
        
        <div style="text-align: center; color: #666; font-size: 12px;">
          <p>This message was sent from the 8BitBar contact form</p>
          <p>Submitted on: ${new Date().toLocaleString("en-AU", {
            timeZone: "Australia/Brisbane",
          })}</p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: '"8BitBar Contact Form" <info@8bitbar.com.au>',
      to: "info@8bitbar.com.au",
      subject: `Contact Form: ${subject}`,
      html: emailHtml,
      replyTo: email, // Set reply-to as the customer's email
    };

    const result = await transporter.sendMail(mailOptions);

    console.log("✅ Contact form email sent successfully:", result.messageId);

    res.status(200).json({
      success: true,
      message:
        "Thank you for your message! We'll get back to you within 24 hours.",
      messageId: result.messageId,
    });
  } catch (error) {
    console.error("❌ Error sending contact form email:", error.message);

    res.status(500).json({
      success: false,
      message:
        "Sorry, there was an error sending your message. Please try again later.",
    });
  }
});

export default router;
