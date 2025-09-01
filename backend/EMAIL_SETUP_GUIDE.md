# 📧 Email Configuration Guide for 8BitBar

## Current Issue

The SMTP server `smtp.8bitbar.com.au` is not resolving (DNS error). This needs to be configured with your hosting provider.

## Quick Solutions

### Option 1: Configure 8BitBar SMTP Server

Contact your hosting provider (where 8bitbar.com.au is hosted) to:

1. Set up SMTP service for `smtp.8bitbar.com.au`
2. Configure MX records and SMTP authentication
3. Verify the correct SMTP settings

### Option 2: Use Gmail SMTP (Temporary Solution)

1. Create a Gmail account for 8BitBar (e.g., `8bitbar.gaming@gmail.com`)
2. Enable 2-factor authentication
3. Generate an App Password for SMTP
4. Update `.env` file:

```env
GMAIL_USER=8bitbar.gaming@gmail.com
GMAIL_PASS=your-16-character-app-password
```

### Option 3: Use Alternative SMTP Service

Consider using services like:

- **SendGrid** (recommended for business)
- **Mailgun**
- **Amazon SES**
- **Postmark**

## Environment Variables Setup

Create a `.env` file in the backend directory:

```env
# Email Configuration
SMTP_HOST=smtp.8bitbar.com.au
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=orders@8bitbar.com.au
SMTP_PASS=your-actual-password

# Alternative SMTP service can be configured here if needed
```

## Testing Email Configuration

1. The system will automatically test the SMTP connection
2. Check server logs for connection status:
   - ✅ = Connection successful
   - ⚠️ = Connection failed, using fallback
   - ❌ = All connections failed

## Email Features

### What Customers Receive:

- 🎮 Professional gaming-themed email design
- 📅 Complete booking details
- ⚠️ Important cleaning time information
- 📍 Instructions for arrival
- 🌐 8BitBar branding and contact info

### Email Types:

- **Cafe Bookings**: Shows chair numbers and layout
- **Karaoke Bookings**: Shows room name and duration
- **N64 Bookings**: Shows booth name and gaming details

## Troubleshooting

### Common Issues:

1. **DNS Error (ENOTFOUND)**: SMTP server hostname not found
2. **Authentication Error**: Wrong username/password
3. **Connection Timeout**: Firewall or port blocking

### Solutions:

1. Verify SMTP server exists and is accessible
2. Check credentials with hosting provider
3. Test with alternative SMTP service
4. Check firewall settings

## Current Status

- ✅ Email templates created and ready
- ✅ Booking integration completed
- ⚠️ SMTP server configuration needed
- ✅ Fallback system in place

The booking system will continue to work even if emails fail - customers just won't receive confirmation emails until SMTP is configured.
