/**
 * Email Client Compatible Templates for SoapBox Super App
 * Uses table-based layout for maximum compatibility across email clients
 */

import { SOAPBOX_EMAIL_LOGO_BASE64, SOAPBOX_EMAIL_LOGO_RED_BASE64 } from './email-logo';

export function createCompatibleVerificationEmailTemplate(data: { firstName: string }, verificationUrl: string): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
      <meta name="x-apple-disable-message-reformatting">
      <title>Verify Your SoapBox Super App Account</title>
      <!--[if mso]>
      <noscript>
        <xml>
          <o:OfficeDocumentSettings>
            <o:PixelsPerInch>96</o:PixelsPerInch>
          </o:OfficeDocumentSettings>
        </xml>
      </noscript>
      <![endif]-->
      <style>
        /* Reset styles */
        * { box-sizing: border-box; }
        body { 
          font-family: Arial, sans-serif; 
          margin: 0 !important; 
          padding: 0 !important; 
          background-color: #f8fafc !important;
          line-height: 1.6;
          color: #334155;
          width: 100% !important;
          height: 100% !important;
          -webkit-text-size-adjust: 100%;
          -ms-text-size-adjust: 100%;
        }
        table { 
          border-collapse: collapse; 
          mso-table-lspace: 0pt; 
          mso-table-rspace: 0pt; 
          width: 100%;
        }
        td { padding: 0; vertical-align: top; }
        img { 
          border: 0; 
          height: auto; 
          line-height: 100%; 
          outline: none; 
          text-decoration: none; 
          -ms-interpolation-mode: bicubic; 
        }
        
        /* Container styles */
        .email-wrapper {
          width: 100% !important;
          background-color: #f8fafc;
          padding: 40px 20px;
        }
        .email-container {
          max-width: 600px !important;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        }
        
        /* Header styles */
        .header-section {
          background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%);
          padding: 16px 20px;
          text-align: center;
        }
        .logo-container {
          text-align: center;
          margin-bottom: 12px;
        }
        .logo-circle {
          display: inline-block;
          width: 60px;
          height: 60px;
          background-color: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          text-align: center;
          line-height: 60px;
          margin: 0 auto 12px;
          padding: 8px;
          border: 2px solid rgba(255, 255, 255, 0.3);
        }
        .logo-svg {
          vertical-align: middle;
          width: 44px;
          height: 44px;
        }
        .brand-name {
          color: #ffffff !important;
          font-size: 28px !important;
          font-weight: 700 !important;
          margin: 15px 0 8px 0 !important;
          letter-spacing: -0.5px;
          text-align: center;
        }
        .tagline {
          color: rgba(255, 255, 255, 0.9) !important;
          font-size: 16px !important;
          font-weight: 400 !important;
          text-align: center;
          margin: 0;
        }
        
        /* Content styles */
        .content-section {
          padding: 40px 30px;
          text-align: center;
        }
        .greeting {
          font-size: 24px;
          color: #1e293b;
          margin-bottom: 20px;
          font-weight: 600;
        }
        .message {
          color: #475569;
          line-height: 1.7;
          margin-bottom: 30px;
          font-size: 16px;
        }
        .button-container {
          text-align: center;
          margin: 40px 0;
        }
        .cta-button {
          display: inline-block !important;
          background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%) !important;
          color: #ffffff !important;
          text-decoration: none !important;
          padding: 16px 40px !important;
          border-radius: 50px !important;
          font-weight: 600 !important;
          font-size: 16px !important;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border: none;
          cursor: pointer;
        }
        
        /* Features section */
        .features-section {
          background-color: #f8fafc;
          padding: 30px;
          margin: 30px 0;
          border-radius: 12px;
        }
        .features-title {
          color: #1e293b;
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 20px;
          text-align: center;
        }
        .feature-item {
          color: #475569;
          font-size: 14px;
          margin-bottom: 8px;
          padding-left: 20px;
          position: relative;
        }
        .feature-item:before {
          content: '✓';
          position: absolute;
          left: 0;
          color: #7c3aed;
          font-weight: bold;
        }
        
        /* Security and footer */
        .security-notice {
          background-color: #fef3c7;
          border: 1px solid #fbbf24;
          border-radius: 8px;
          padding: 15px;
          margin: 25px 0;
          color: #92400e;
          font-size: 14px;
        }
        .footer-section {
          padding: 30px;
          text-align: center;
          color: #9ca3af;
          font-size: 14px;
          border-top: 1px solid #e5e7eb;
        }
        
        /* Mobile responsive */
        @media only screen and (max-width: 600px) {
          .email-wrapper { padding: 20px 10px !important; }
          .header-section { padding: 30px 15px !important; }
          .content-section { padding: 30px 20px !important; }
          .brand-name { font-size: 24px !important; }
          .greeting { font-size: 20px !important; }
          .cta-button { padding: 14px 30px !important; font-size: 14px !important; }
        }
      </style>
    </head>
    <body>
      <table role="presentation" class="email-wrapper">
        <tr>
          <td>
            <table role="presentation" class="email-container">
              <!-- Header Section -->
              <tr>
                <td class="header-section">
                  <table role="presentation" width="100%">
                    <tr>
                      <td>

                        <div class="tagline">Email Verification</div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Content Section -->
              <tr>
                <td class="content-section">
                  <div class="greeting">Welcome, ${data.firstName}!</div>
                  
                  <div class="message">
                    Thank you for joining our faith community platform. To complete your registration and secure your account, please verify your email address by clicking the button below.
                  </div>
                  
                  <div class="button-container">
                    <a href="${verificationUrl}" class="cta-button" style="background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%) !important; color: #ffffff !important; text-decoration: none !important;">
                      Verify Email Address
                    </a>
                  </div>
                  
                  <div class="features-section">
                    <div class="features-title">What awaits you in SoapBox Super App:</div>
                    <div class="feature-item">Daily Bible readings with audio narration</div>
                    <div class="feature-item">AI-powered spiritual guidance and insights</div>
                    <div class="feature-item">Community prayer wall and discussions</div>
                    <div class="feature-item">Church discovery and connection tools</div>
                    <div class="feature-item">Personal spiritual growth tracking</div>
                  </div>
                  
                  <div class="security-notice">
                    <strong>🔒 Security Notice:</strong> This verification link will expire in 24 hours. If you didn't create this account, please ignore this email and no account will be created.
                  </div>
                  
                  <div class="message" style="font-size: 14px; color: #6b7280;">
                    If the button doesn't work, copy and paste this link into your browser:<br>
                    <a href="${verificationUrl}" style="color: #7c3aed; word-break: break-all;">${verificationUrl}</a>
                  </div>
                </td>
              </tr>
              
              <!-- Footer Section -->
              <tr>
                <td class="footer-section">
                  <div>© 2025 SoapBox Super App - Connecting Faith Communities</div>
                  <div style="margin-top: 10px;">
                    Questions? Contact us at support@soapboxsuperapp.com
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

export function createCompatiblePasswordResetEmailTemplate(data: { firstName: string }, resetUrl: string): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
      <meta name="x-apple-disable-message-reformatting">
      <title>Reset Your SoapBox Super App Password</title>
      <style>
        /* Same base styles as verification template */
        * { box-sizing: border-box; }
        body { 
          font-family: Arial, sans-serif; 
          margin: 0 !important; 
          padding: 0 !important; 
          background-color: #f8fafc !important;
          line-height: 1.6;
          color: #334155;
          width: 100% !important;
          height: 100% !important;
          -webkit-text-size-adjust: 100%;
          -ms-text-size-adjust: 100%;
        }
        table { 
          border-collapse: collapse; 
          mso-table-lspace: 0pt; 
          mso-table-rspace: 0pt; 
          width: 100%;
        }
        td { padding: 0; vertical-align: top; }
        
        .email-wrapper {
          width: 100% !important;
          background-color: #f8fafc;
          padding: 40px 20px;
        }
        .email-container {
          max-width: 600px !important;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        }
        
        /* Header with red gradient for password reset */
        .header-section {
          background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
          padding: 24px 20px;
          text-align: center;
        }
        .logo-container {
          text-align: center;
          margin-bottom: 12px;
        }
        .logo-circle {
          display: inline-block;
          width: 60px;
          height: 60px;
          background-color: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          text-align: center;
          line-height: 60px;
          margin: 0 auto 12px;
          padding: 8px;
          border: 2px solid rgba(255, 255, 255, 0.3);
        }
        .brand-name {
          color: #ffffff !important;
          font-size: 28px !important;
          font-weight: 700 !important;
          margin: 15px 0 8px 0 !important;
          letter-spacing: -0.5px;
          text-align: center;
        }
        .tagline {
          color: rgba(255, 255, 255, 0.9) !important;
          font-size: 16px !important;
          font-weight: 400 !important;
          text-align: center;
          margin: 0;
        }
        
        .content-section {
          padding: 40px 30px;
          text-align: center;
        }
        .greeting {
          font-size: 24px;
          color: #1e293b;
          margin-bottom: 20px;
          font-weight: 600;
        }
        .message {
          color: #475569;
          line-height: 1.7;
          margin-bottom: 30px;
          font-size: 16px;
        }
        .cta-button {
          display: inline-block !important;
          background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%) !important;
          color: #ffffff !important;
          text-decoration: none !important;
          padding: 16px 40px !important;
          border-radius: 50px !important;
          font-weight: 600 !important;
          font-size: 16px !important;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .security-notice {
          background-color: #fef3c7;
          border: 1px solid #fbbf24;
          border-radius: 8px;
          padding: 15px;
          margin: 25px 0;
          color: #92400e;
          font-size: 14px;
        }
        .footer-section {
          padding: 30px;
          text-align: center;
          color: #9ca3af;
          font-size: 14px;
          border-top: 1px solid #e5e7eb;
        }
      </style>
    </head>
    <body>
      <table role="presentation" class="email-wrapper">
        <tr>
          <td>
            <table role="presentation" class="email-container">
              <tr>
                <td class="header-section">

                  <div class="tagline">Password Reset Request</div>
                </td>
              </tr>
              
              <tr>
                <td class="content-section">
                  <div class="greeting">Hello, ${data.firstName}</div>
                  
                  <div class="message">
                    You requested a password reset for your account. Click the button below to create a new password.
                  </div>
                  
                  <div style="text-align: center; margin: 40px 0;">
                    <a href="${resetUrl}" class="cta-button" style="background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%) !important; color: #ffffff !important; text-decoration: none !important;">
                      Reset Password
                    </a>
                  </div>
                  
                  <div class="security-notice">
                    <strong>⏰ Important:</strong> This link will expire in 1 hour for security. If you didn't request this reset, please ignore this email.
                  </div>
                  
                  <div class="message" style="font-size: 14px; color: #6b7280;">
                    If the button doesn't work, copy and paste this link:<br>
                    <a href="${resetUrl}" style="color: #dc2626; word-break: break-all;">${resetUrl}</a>
                  </div>
                </td>
              </tr>
              
              <tr>
                <td class="footer-section">
                  <div>© 2025 SoapBox Super App - Connecting Faith Communities</div>
                  <div style="margin-top: 10px;">
                    Questions? Contact us at support@soapboxsuperapp.com
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}