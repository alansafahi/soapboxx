/**
 * Professional Email Templates for SoapBox Super App
 * Modern, trust-inspiring design with proper branding
 */

export function createVerificationEmailTemplate(data: { firstName: string }, verificationUrl: string): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta name="x-apple-disable-message-reformatting">
      <title>Verify Your SoapBox Account</title>
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; 
          margin: 0; 
          padding: 0; 
          background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
          line-height: 1.6;
          color: #334155;
        }
        .email-container { 
          max-width: 600px; 
          margin: 40px auto; 
          background: #ffffff; 
          border-radius: 20px;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.08);
          overflow: hidden;
        }
        .header { 
          background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); 
          padding: 40px 40px; 
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
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><circle cx="40" cy="40" r="3" fill="rgba(255,255,255,0.1)"/><circle cx="160" cy="80" r="2" fill="rgba(255,255,255,0.1)"/><circle cx="80" cy="160" r="2.5" fill="rgba(255,255,255,0.1)"/><circle cx="120" cy="30" r="1.5" fill="rgba(255,255,255,0.1)"/></svg>');
        }
        .logo-container {
          position: relative;
          z-index: 2;
          margin-bottom: 30px;
        }
        .logo {
          width: 120px;
          height: 120px;
          background: white;
          border-radius: 50%;
          margin: 0 auto 25px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
          border: 4px solid rgba(255, 255, 255, 0.3);
        }
        .brand-name { 
          color: white; 
          font-size: 48px; 
          font-weight: 800; 
          margin-bottom: 12px;
          letter-spacing: -1px;
          position: relative;
          z-index: 2;
        }
        .tagline { 
          color: rgba(255, 255, 255, 0.95); 
          font-size: 20px; 
          font-weight: 500;
          position: relative;
          z-index: 2;
        }
        .content { 
          padding: 60px 40px; 
          text-align: center;
        }
        .greeting { 
          font-size: 32px; 
          color: #1e293b; 
          margin-bottom: 24px; 
          font-weight: 700;
        }
        .message { 
          color: #475569; 
          line-height: 1.8; 
          margin-bottom: 40px; 
          font-size: 18px;
          max-width: 480px;
          margin-left: auto;
          margin-right: auto;
        }
        .button-container {
          margin: 50px 0;
        }
        .cta-button { 
          display: inline-block; 
          background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); 
          color: white !important; 
          text-decoration: none; 
          padding: 20px 50px; 
          border-radius: 50px; 
          font-weight: 700; 
          font-size: 18px;
          box-shadow: 0 12px 40px rgba(124, 58, 237, 0.3);
          transition: all 0.3s ease;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }
        .cta-button:hover {
          transform: translateY(-3px);
          box-shadow: 0 20px 60px rgba(124, 58, 237, 0.4);
        }
        .features {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border-radius: 16px;
          padding: 30px;
          margin: 40px 0;
          text-align: left;
        }
        .features h3 {
          color: #1e293b;
          font-size: 20px;
          font-weight: 600;
          margin-bottom: 20px;
          text-align: center;
        }
        .feature-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .feature-list li {
          padding: 12px 0;
          color: #475569;
          font-size: 16px;
          position: relative;
          padding-left: 30px;
        }
        .feature-list li::before {
          content: '✓';
          position: absolute;
          left: 0;
          color: #7c3aed;
          font-weight: bold;
          font-size: 18px;
        }
        .security { 
          background: linear-gradient(135deg, #fef2f2 0%, #fef7f7 100%); 
          border-left: 4px solid #ef4444; 
          border-radius: 12px; 
          padding: 24px; 
          margin: 40px 0; 
          color: #dc2626;
          font-size: 15px;
          text-align: left;
        }
        .alt-link {
          background: #f8fafc;
          border-radius: 12px;
          padding: 24px;
          margin: 40px 0;
          font-size: 14px;
          color: #64748b;
        }
        .alt-link a {
          color: #7c3aed;
          word-break: break-all;
          text-decoration: none;
          font-weight: 500;
        }
        .footer { 
          padding: 50px 40px; 
          text-align: center; 
          color: #94a3b8; 
          font-size: 15px; 
          border-top: 1px solid #e2e8f0;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        }
        .footer p {
          margin: 10px 0;
        }
        .footer a {
          color: #7c3aed;
          text-decoration: none;
          font-weight: 500;
        }
        .footer strong {
          color: #475569;
        }
        @media (max-width: 640px) {
          .email-container { margin: 20px; }
          .content { padding: 40px 24px; }
          .header { padding: 50px 24px; }
          .cta-button { padding: 18px 40px; font-size: 16px; }
          .brand-name { font-size: 36px; }
          .greeting { font-size: 26px; }
          .message { font-size: 16px; }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <div class="logo-container">
            <div class="logo">
              <svg width="60" height="60" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#7c3aed" stroke-width="6"/>
                <circle cx="50" cy="50" r="28" fill="none" stroke="#7c3aed" stroke-width="4"/>
                <rect x="46" y="32" width="8" height="36" fill="#7c3aed" rx="2"/>
                <rect x="32" y="46" width="36" height="8" fill="#7c3aed" rx="2"/>
                <circle cx="32" cy="36" r="4" fill="none" stroke="#7c3aed" stroke-width="3"/>
                <circle cx="68" cy="36" r="4" fill="none" stroke="#7c3aed" stroke-width="3"/>
              </svg>
            </div>
          </div>
          <div class="brand-name">SoapBox Super App</div>
          <div class="tagline">Faith Community Platform</div>
        </div>
        
        <div class="content">
          <div class="greeting">Welcome, ${data.firstName}!</div>
          
          <div class="message">
            Thank you for joining our faith community platform. To complete your registration and secure your account, please verify your email address.
          </div>
          
          <div class="button-container">
            <a href="${verificationUrl}" class="cta-button">Verify Email Address</a>
          </div>
          
          <div class="features">
            <h3>What awaits you in SoapBox:</h3>
            <ul class="feature-list">
              <li>Daily Bible readings with audio narration</li>
              <li>AI-powered spiritual guidance and insights</li>
              <li>Community prayer wall and discussions</li>
              <li>Church discovery and connection tools</li>
              <li>Personal spiritual growth tracking</li>
            </ul>
          </div>
          
          <div class="security">
            <strong>🔒 Security Notice:</strong> This verification link will expire in 24 hours. If you didn't create this account, please ignore this email and no account will be created.
          </div>
          
          <div class="alt-link">
            <strong>Button not working?</strong><br>
            Copy and paste this link into your browser:<br><br>
            <a href="${verificationUrl}">${verificationUrl}</a>
          </div>
        </div>
        
        <div class="footer">
          <p><strong>© 2025 SoapBox Super App</strong></p>
          <p>Connecting Faith Communities Worldwide</p>
          <p>Questions? Contact us at <a href="mailto:support@soapboxsuperapp.com">support@soapboxsuperapp.com</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function createPasswordResetEmailTemplate(data: { firstName: string }, resetUrl: string): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta name="x-apple-disable-message-reformatting">
      <title>Reset Your SoapBox Password</title>
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; 
          margin: 0; 
          padding: 0; 
          background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
          line-height: 1.6;
          color: #334155;
        }
        .email-container { 
          max-width: 600px; 
          margin: 40px auto; 
          background: #ffffff; 
          border-radius: 20px;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.08);
          overflow: hidden;
        }
        .header { 
          background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); 
          padding: 60px 40px; 
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
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><circle cx="40" cy="40" r="3" fill="rgba(255,255,255,0.1)"/><circle cx="160" cy="80" r="2" fill="rgba(255,255,255,0.1)"/><circle cx="80" cy="160" r="2.5" fill="rgba(255,255,255,0.1)"/></svg>');
        }
        .logo-container {
          position: relative;
          z-index: 2;
          margin-bottom: 30px;
        }
        .logo {
          width: 120px;
          height: 120px;
          background: white;
          border-radius: 50%;
          margin: 0 auto 25px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
          border: 4px solid rgba(255, 255, 255, 0.3);
        }
        .brand-name { 
          color: white; 
          font-size: 48px; 
          font-weight: 800; 
          margin-bottom: 12px;
          letter-spacing: -1px;
          position: relative;
          z-index: 2;
        }
        .tagline { 
          color: rgba(255, 255, 255, 0.95); 
          font-size: 20px; 
          font-weight: 500;
          position: relative;
          z-index: 2;
        }
        .content { 
          padding: 60px 40px; 
          text-align: center;
        }
        .greeting { 
          font-size: 32px; 
          color: #1e293b; 
          margin-bottom: 24px; 
          font-weight: 700;
        }
        .message { 
          color: #475569; 
          line-height: 1.8; 
          margin-bottom: 40px; 
          font-size: 18px;
          max-width: 480px;
          margin-left: auto;
          margin-right: auto;
        }
        .button-container {
          margin: 50px 0;
        }
        .cta-button { 
          display: inline-block; 
          background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); 
          color: white !important; 
          text-decoration: none; 
          padding: 20px 50px; 
          border-radius: 50px; 
          font-weight: 700; 
          font-size: 18px;
          box-shadow: 0 12px 40px rgba(220, 38, 38, 0.3);
          transition: all 0.3s ease;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }
        .cta-button:hover {
          transform: translateY(-3px);
          box-shadow: 0 20px 60px rgba(220, 38, 38, 0.4);
        }
        .security { 
          background: linear-gradient(135deg, #fef2f2 0%, #fef7f7 100%); 
          border-left: 4px solid #ef4444; 
          border-radius: 12px; 
          padding: 24px; 
          margin: 40px 0; 
          color: #dc2626;
          font-size: 15px;
          text-align: left;
        }
        .alt-link {
          background: #f8fafc;
          border-radius: 12px;
          padding: 24px;
          margin: 40px 0;
          font-size: 14px;
          color: #64748b;
        }
        .alt-link a {
          color: #dc2626;
          word-break: break-all;
          text-decoration: none;
          font-weight: 500;
        }
        .footer { 
          padding: 50px 40px; 
          text-align: center; 
          color: #94a3b8; 
          font-size: 15px; 
          border-top: 1px solid #e2e8f0;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        }
        .footer p {
          margin: 10px 0;
        }
        .footer a {
          color: #7c3aed;
          text-decoration: none;
          font-weight: 500;
        }
        .footer strong {
          color: #475569;
        }
        @media (max-width: 640px) {
          .email-container { margin: 20px; }
          .content { padding: 40px 24px; }
          .header { padding: 50px 24px; }
          .cta-button { padding: 18px 40px; font-size: 16px; }
          .brand-name { font-size: 36px; }
          .greeting { font-size: 26px; }
          .message { font-size: 16px; }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <div class="logo-container">
            <div class="logo">
              <svg width="80" height="80" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="42" fill="none" stroke="#dc2626" stroke-width="5"/>
                <circle cx="50" cy="50" r="30" fill="none" stroke="#dc2626" stroke-width="3"/>
                <rect x="46" y="30" width="8" height="40" fill="#dc2626" rx="2"/>
                <rect x="30" y="46" width="40" height="8" fill="#dc2626" rx="2"/>
                <circle cx="30" cy="35" r="5" fill="none" stroke="#dc2626" stroke-width="2"/>
                <circle cx="70" cy="35" r="5" fill="none" stroke="#dc2626" stroke-width="2"/>
              </svg>
            </div>
          </div>
          <div class="brand-name">SoapBox</div>
          <div class="tagline">Password Reset Request</div>
        </div>
        
        <div class="content">
          <div class="greeting">Password Reset</div>
          
          <div class="message">
            Hello ${data.firstName}, we received a request to reset your SoapBox account password. Click the button below to create a new password.
          </div>
          
          <div class="button-container">
            <a href="${resetUrl}" class="cta-button">Reset Password</a>
          </div>
          
          <div class="security">
            <strong>🔒 Security Notice:</strong> This password reset link will expire in 1 hour. If you didn't request this reset, please ignore this email and your password will remain unchanged.
          </div>
          
          <div class="alt-link">
            <strong>Button not working?</strong><br>
            Copy and paste this link into your browser:<br><br>
            <a href="${resetUrl}">${resetUrl}</a>
          </div>
        </div>
        
        <div class="footer">
          <p><strong>© 2025 SoapBox Super App</strong></p>
          <p>Connecting Faith Communities Worldwide</p>
          <p>Questions? Contact us at <a href="mailto:support@soapboxsuperapp.com">support@soapboxsuperapp.com</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
}