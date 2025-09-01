// Helper function to calculate actual end time (minus 5 minutes for cleaning)
const calculateActualEndTime = (startTime, duration) => {
  const match = startTime.match(/(\d+):(\d+) (AM|PM)/);
  if (!match) return startTime;
  const [_, hour, minute, period] = match;
  let endHour = parseInt(hour);
  if (period === "PM" && endHour !== 12) endHour += 12;
  if (period === "AM" && endHour === 12) endHour = 0;

  // Add duration hours
  endHour += duration;
  let endMinute = parseInt(minute);

  // Subtract 5 minutes for cleaning
  endMinute -= 5;
  if (endMinute < 0) {
    endMinute += 60;
    endHour -= 1;
  }

  // Handle day rollover
  endHour = endHour % 24;

  let displayHour = endHour;
  let displayPeriod = "AM";
  if (endHour >= 12) {
    displayPeriod = "PM";
    if (endHour > 12) displayHour = endHour - 12;
  }
  if (endHour === 0) displayHour = 12;
  return `${displayHour}:${endMinute
    .toString()
    .padStart(2, "0")} ${displayPeriod}`;
};

// Email template for N64 booking confirmation
export const getN64BookingTemplate = (booking, roomName) => {
  // FIX: Use the new date and time fields directly - no timezone conversion needed
  const startTime = booking.time;
  const actualEndTime = calculateActualEndTime(
    startTime,
    booking.durationHours
  );

  return {
    subject: "Your N64 Gaming Session is Confirmed - 8BitBar",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>N64 Booking Confirmation</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Orbitron', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #ffffff;
            background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
            min-height: 100vh;
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            border: 1px solid #e91e63;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(233, 30, 99, 0.3);
          }
          .header { 
            background: linear-gradient(135deg, #e91e63 0%, #9c27b0 50%, #00bcd4 100%);
            padding: 40px 30px;
            text-align: center;
            position: relative;
            overflow: hidden;
          }
          .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="50" cy="10" r="0.5" fill="rgba(255,255,255,0.1)"/><circle cx="10" cy="60" r="0.5" fill="rgba(255,255,255,0.1)"/><circle cx="90" cy="40" r="0.5" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
            opacity: 0.3;
          }
          .logo { 
            font-size: 36px; 
            font-weight: 900; 
            margin-bottom: 10px;
            letter-spacing: 4px;
            text-shadow: 0 0 20px rgba(255,255,255,0.5);
            position: relative;
            z-index: 1;
          }
          .header-subtitle {
            font-size: 16px;
            opacity: 0.9;
            font-weight: 300;
            position: relative;
            z-index: 1;
          }
          .content { 
            padding: 40px 30px;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          }
          .greeting {
            font-size: 20px;
            margin-bottom: 20px;
            color: #ffffff;
            font-weight: 600;
          }
          .intro-text {
            font-size: 16px;
            color: #b0b0b0;
            margin-bottom: 30px;
            line-height: 1.6;
          }
          .booking-card { 
            background: linear-gradient(135deg, #2a2a3e 0%, #1e1e2e 100%);
            border: 2px solid #e91e63;
            border-radius: 16px;
            padding: 30px;
            margin: 30px 0;
            position: relative;
            overflow: hidden;
          }
          .booking-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 2px;
            background: linear-gradient(90deg, #e91e63, #9c27b0, #00bcd4);
          }
          .booking-title {
            font-size: 22px;
            font-weight: 700;
            color: #ffffff;
            margin-bottom: 25px;
            text-align: center;
            text-transform: uppercase;
            letter-spacing: 2px;
            background: linear-gradient(135deg, #e91e63, #00bcd4);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          .detail-grid {
            display: grid;
            gap: 20px;
          }
          .detail-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px 0;
            border-bottom: 1px solid #333;
            position: relative;
          }
          .detail-item:last-child {
            border-bottom: none;
          }
          .detail-item::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            width: 0;
            height: 2px;
            background: linear-gradient(90deg, #e91e63, #00bcd4);
            transition: width 0.3s ease;
          }
          .detail-item:hover::after {
            width: 100%;
          }
          .detail-label {
            font-weight: 600;
            color: #e91e63;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .detail-value {
            font-size: 16px;
            color: #ffffff;
            font-weight: 500;
          }
          .booth-name {
            background: linear-gradient(135deg, #e91e63, #9c27b0);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            box-shadow: 0 4px 8px rgba(233, 30, 99, 0.3);
          }
          .time-notice {
            background: linear-gradient(135deg, #2a2a3e 0%, #1e1e2e 100%);
            border: 2px solid #00bcd4;
            border-radius: 12px;
            padding: 20px;
            margin: 25px 0;
            text-align: center;
            position: relative;
            overflow: hidden;
          }
          .time-notice::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 2px;
            background: linear-gradient(90deg, #00bcd4, #e91e63);
          }
          .time-notice-title {
            font-weight: 600;
            color: #00bcd4;
            margin-bottom: 8px;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .time-notice-text {
            color: #b0b0b0;
            font-size: 14px;
            line-height: 1.4;
          }
          .actual-time {
            font-weight: 700;
            color: #e91e63;
          }
          .status-badge {
            display: inline-block;
            padding: 8px 20px;
            border-radius: 25px;
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.3);
          }
          .status-confirmed {
            background: linear-gradient(135deg, #4caf50, #45a049);
            color: #ffffff;
          }
          .status-pending {
            background: linear-gradient(135deg, #ff9800, #f57c00);
            color: #ffffff;
          }
          .footer {
            background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%);
            padding: 30px;
            text-align: center;
            color: #b0b0b0;
            border-top: 2px solid #e91e63;
          }
          .footer-logo {
            font-size: 24px;
            font-weight: 700;
            color: #ffffff;
            margin-bottom: 15px;
            letter-spacing: 2px;
            background: linear-gradient(135deg, #e91e63, #00bcd4);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          .footer-text {
            font-size: 14px;
            line-height: 1.5;
            margin-bottom: 15px;
          }
          .footer-contact {
            font-size: 14px;
          }
          .footer-contact a {
            color: #00bcd4;
            text-decoration: none;
            transition: color 0.3s ease;
          }
          .footer-contact a:hover {
            color: #e91e63;
          }
          .icon {
            display: inline-block;
            width: 16px;
            height: 16px;
            margin-right: 8px;
            vertical-align: middle;
          }
          @media (max-width: 600px) {
            .content { padding: 30px 20px; }
            .header { padding: 30px 20px; }
            .booking-card { padding: 20px; }
            .detail-item { 
              flex-direction: column; 
              align-items: flex-start; 
              gap: 8px; 
              padding: 12px 0;
            }
            .detail-label {
              font-size: 11px;
            }
            .detail-value {
              font-size: 14px;
            }
            .time-notice {
              padding: 15px;
            }
            .time-notice-title {
              font-size: 13px;
            }
            .time-notice-text {
              font-size: 13px;
            }
            .logo {
              font-size: 28px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">8BITBAR</div>
            <div class="header-subtitle">Gaming Lounge & Retro Gaming</div>
          </div>
          
          <div class="content">
            <div class="greeting">Hello ${booking.customerName},</div>
            <div class="intro-text">
              Get ready for some classic Nintendo 64 gaming! Your booth is reserved and waiting for an epic retro gaming session.
            </div>
            
            <div class="booking-card">
              <div class="booking-title">Your N64 Gaming Session Details</div>
              
              <div class="detail-grid">
                <div class="detail-item">
                  <span class="detail-label">🎮 Gaming Booth</span>
                  <span class="booth-name">${
                    roomName || "N64 Gaming Booth"
                  }</span>
                </div>
                
                <div class="detail-item">
                  <span class="detail-label">📅 Date</span>
                  <span class="detail-value">${new Date(booking.date).toLocaleDateString("en-AU", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}</span>
                </div>
                
                <div class="detail-item">
                  <span class="detail-label">⏰ Reserved Time</span>
                  <span class="detail-value">${startTime}</span>
                </div>
                
                <div class="detail-item">
                  <span class="detail-label">⏱️ Duration</span>
                  <span class="detail-value">${booking.durationHours} hour${
      booking.durationHours > 1 ? "s" : ""
    }</span>
                </div>
                
                <div class="detail-item">
                  <span class="detail-label">👥 Players</span>
                  <span class="detail-value">${booking.numberOfPeople} ${
      booking.numberOfPeople === 1 ? "player" : "players"
    }</span>
                </div>
                
                <div class="detail-item">
                  <span class="detail-label">💰 Total Amount</span>
                  <span class="detail-value">$${booking.totalPrice.toFixed(
                    2
                  )}</span>
                </div>
                
                <div class="detail-item">
                  <span class="detail-label">📊 Status</span>
                  <span class="status-badge status-${booking.status}">${
      booking.status
    }</span>
                </div>
              </div>
            </div>
            
            <div class="intro-text">
              Time to relive the golden age of gaming! If you need to make any changes to your booking, please contact us as soon as possible. See you soon!
            </div>
            
            <div class="time-notice">
              <div class="time-notice-title">⏰ Important Time Notice</div>
              <div class="time-notice-text">
                Please note that your session ends 5 minutes before the displayed end time to allow for cleaning and preparation for the next booking. Thank you for your understanding!
              </div>
            </div>
          </div>
          
          <div class="footer">
            <div class="footer-logo">8BITBAR</div>
            <div class="footer-text">
              Where Gaming Meets Great Times
            </div>
            <div class="footer-contact">
              📧 <a href="mailto:info@8bitbar.com.au">info@8bitbar.com.au</a><br>
              🌐 <a href="https://www.8bitbar.com.au">www.8bitbar.com.au</a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
  };
};
