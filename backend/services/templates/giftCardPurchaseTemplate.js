export const getGiftCardPurchaseTemplate = (giftCard, user) => {
  const subject = `Gift Card Purchase Confirmation - $${giftCard.amount}`;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Gift Card Purchase Confirmation</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                padding: 20px;
            }
            .container { 
                max-width: 600px; 
                margin: 0 auto; 
                background: white; 
                border-radius: 20px;
                overflow: hidden;
                box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            }
            .header { 
                background: linear-gradient(135deg, #e91e63 0%, #9c27b0 100%);
                color: white; 
                padding: 40px 30px; 
                text-align: center;
                position: relative;
            }
            .header::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="gift" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="2" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23gift)"/></svg>');
                opacity: 0.3;
            }
            .header h1 { 
                font-size: 2.5em; 
                margin-bottom: 10px;
                position: relative;
                z-index: 1;
            }
            .header p { 
                font-size: 1.2em; 
                opacity: 0.9;
                position: relative;
                z-index: 1;
            }
            .content { 
                padding: 40px 30px; 
            }
            .gift-card-info {
                background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                border: 2px solid #e91e63;
                border-radius: 16px;
                padding: 30px;
                margin: 30px 0;
                text-align: center;
                position: relative;
                overflow: hidden;
            }
            .gift-card-info::before {
                content: '🎁';
                font-size: 3em;
                position: absolute;
                top: -10px;
                right: -10px;
                opacity: 0.1;
            }
            .amount {
                font-size: 3em;
                font-weight: bold;
                color: #e91e63;
                margin: 20px 0;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
            }
            .gift-card-details {
                background: white;
                border: 2px solid #00bcd4;
                border-radius: 12px;
                padding: 25px;
                margin: 25px 0;
                box-shadow: 0 5px 15px rgba(0,0,0,0.08);
            }
            .detail-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 15px 0;
                border-bottom: 1px solid #eee;
            }
            .detail-row:last-child {
                border-bottom: none;
            }
            .detail-label {
                font-weight: 600;
                color: #333;
                font-size: 1.1em;
        }
            .detail-value {
                color: #666;
                font-family: 'Courier New', monospace;
                font-size: 1.1em;
                background: #f8f9fa;
                padding: 8px 12px;
                border-radius: 8px;
                border: 1px solid #e9ecef;
            }
            .important-note {
                background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
                border: 2px solid #ffc107;
                border-radius: 12px;
                padding: 20px;
                margin: 25px 0;
                text-align: center;
            }
            .important-note h3 {
                color: #856404;
                margin-bottom: 15px;
                font-size: 1.3em;
            }
            .important-note p {
                color: #856404;
                line-height: 1.6;
                margin-bottom: 10px;
            }
            .footer {
                background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
                color: white;
                padding: 30px;
                text-align: center;
            }
            .footer h3 {
                color: #e91e63;
                margin-bottom: 20px;
                font-size: 1.4em;
            }
            .footer p {
                line-height: 1.6;
                margin-bottom: 15px;
                opacity: 0.9;
            }
            .contact-info {
                background: rgba(255,255,255,0.1);
                border-radius: 10px;
                padding: 20px;
                margin-top: 20px;
            }
            .contact-info p {
                margin: 8px 0;
                font-size: 0.95em;
            }
            .redeem-instructions {
                background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
                border: 2px solid #2196f3;
                border-radius: 12px;
                padding: 25px;
                margin: 25px 0;
            }
            .redeem-instructions h3 {
                color: #1976d2;
                margin-bottom: 15px;
                font-size: 1.3em;
            }
            .redeem-instructions ol {
                color: #1976d2;
                line-height: 1.8;
                padding-left: 20px;
            }
            .redeem-instructions li {
                margin-bottom: 10px;
            }
            @media (max-width: 600px) {
                .container { margin: 10px; border-radius: 15px; }
                .header { padding: 30px 20px; }
                .content { padding: 30px 20px; }
                .amount { font-size: 2.5em; }
                .detail-row { flex-direction: column; align-items: flex-start; }
                .detail-value { margin-top: 8px; }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎁 Gift Card Purchase Confirmed!</h1>
                <p>Your gift card is ready to use at 8-Bit Bar</p>
            </div>
            
            <div class="content">
                <div class="gift-card-info">
                    <h2 style="color: #333; margin-bottom: 20px;">Gift Card Details</h2>
                    <div class="amount">$${giftCard.amount}</div>
                    <p style="color: #666; font-size: 1.1em; margin-bottom: 0;">
                        ${giftCard.description || "Gift Card"}
                    </p>
                </div>
                
                <div class="gift-card-details">
                    <div class="detail-row">
                        <span class="detail-label">Gift Card Code:</span>
                        <span class="detail-value">${giftCard.code}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">PIN:</span>
                        <span class="detail-value">${giftCard.pin}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Purchase Date:</span>
                        <span class="detail-value">${giftCard.purchasedAt.toLocaleDateString("en-AU", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Purchased By:</span>
                        <span class="detail-value">${user.name} (${
    user.email
  })</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Status:</span>
                        <span class="detail-value" style="color: #28a745; font-weight: bold;">Active</span>
                    </div>
                </div>
                
                <div class="important-note">
                    <h3>⚠️ Important Information</h3>
                    <p><strong>Keep your gift card code and PIN safe!</strong></p>
                    <p>You'll need both the code and PIN to redeem your gift card at 8-Bit Bar.</p>
                    <p>This gift card can be used for any services at our venue.</p>
                </div>
                
                <div class="redeem-instructions">
                    <h3>📋 How to Redeem Your Gift Card</h3>
                    <ol>
                        <li>Visit 8-Bit Bar during our opening hours</li>
                        <li>Present your gift card code and PIN to our staff</li>
                        <li>Let us know what services you'd like to use it for</li>
                        <li>Enjoy your gaming, karaoke, or dining experience!</li>
                    </ol>
                </div>
            </div>
            
            <div class="footer">
                <h3>🎮 Welcome to 8-Bit Bar!</h3>
                <p>We're excited to have you visit us and enjoy all the amazing experiences we have to offer.</p>
                <p>From retro gaming to karaoke, delicious food to refreshing drinks - there's something for everyone!</p>
                
                <div class="contact-info">
                    <p><strong>📍 Address:</strong> [Your Address Here]</p>
                    <p><strong>📞 Phone:</strong> [Your Phone Here]</p>
                    <p><strong>🌐 Website:</strong> www.8bitbar.com.au</p>
                    <p><strong>📧 Email:</strong> info@8bitbar.com.au</p>
                </div>
                
                <p style="margin-top: 25px; font-size: 0.9em; opacity: 0.7;">
                    This email was sent to confirm your gift card purchase. 
                    If you have any questions, please don't hesitate to contact us.
                </p>
            </div>
        </div>
    </body>
    </html>
  `;

  return { subject, html };
};
