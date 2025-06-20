/**
 * Production Email Service for SoapBox Super App
 * Secure email verification and authentication communications
 */

import { MailService } from '@sendgrid/mail';

interface EmailVerificationData {
  email: string;
  firstName: string;
  token: string;
}

interface PasswordResetData {
  email: string;
  firstName: string;
  token: string;
}

class EmailService {
  private mailService: MailService;
  private isConfigured: boolean = false;

  constructor() {
    this.mailService = new MailService();
    this.configure();
  }

  private configure() {
    if (process.env.SENDGRID_API_KEY) {
      try {
        this.mailService.setApiKey(process.env.SENDGRID_API_KEY);
        this.isConfigured = true;
        console.log('SendGrid email service configured successfully');
      } catch (error) {
        console.error('Failed to configure SendGrid:', error);
        this.isConfigured = false;
      }
    } else {
      console.warn('SENDGRID_API_KEY not found - email service disabled');
      this.isConfigured = false;
    }
  }

  async sendVerificationEmail(data: EmailVerificationData): Promise<void> {
    if (!this.isConfigured) {
      throw new Error('Email service not configured. Please check SENDGRID_API_KEY.');
    }

    const baseUrl = process.env.BASE_URL || 'https://www.soapboxapp.org';
    const verificationUrl = `${baseUrl}/api/auth/verify-email?token=${data.token}`;

    const emailContent = {
      to: data.email,
      from: process.env.FROM_EMAIL || 'noreply@soapboxapp.org',
      subject: 'Verify Your SoapBox Account',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your SoapBox Account</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; }
            .header { background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); padding: 40px 20px; text-align: center; }
            .logo { color: white; font-size: 32px; font-weight: bold; margin-bottom: 10px; }
            .tagline { color: #e9d5ff; font-size: 16px; }
            .content { padding: 40px 20px; }
            .greeting { font-size: 18px; color: #374151; margin-bottom: 20px; }
            .message { color: #6b7280; line-height: 1.6; margin-bottom: 30px; }
            .button { display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; margin: 20px 0; }
            .button:hover { background: linear-gradient(135deg, #6d28d9 0%, #9333ea 100%); }
            .footer { padding: 20px; text-align: center; color: #9ca3af; font-size: 14px; border-top: 1px solid #e5e7eb; }
            .security { background-color: #fef3c7; border: 1px solid #fbbf24; border-radius: 6px; padding: 15px; margin: 20px 0; color: #92400e; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">SoapBox</div>
              <div class="tagline">Faith Community Platform</div>
            </div>
            
            <div class="content">
              <div class="greeting">Welcome to SoapBox, ${data.firstName}!</div>
              
              <div class="message">
                Thank you for joining our faith community platform. To complete your registration and secure your account, please verify your email address by clicking the button below:
              </div>
              
              <div style="text-align: center;">
                <a href="${verificationUrl}" class="button">Verify Email Address</a>
              </div>
              
              <div class="security">
                <strong>Security Notice:</strong> This verification link will expire in 24 hours. If you didn't create a SoapBox account, you can safely ignore this email.
              </div>
              
              <div class="message">
                If the button doesn't work, you can copy and paste this link into your browser:<br>
                <a href="${verificationUrl}" style="color: #7c3aed; word-break: break-all;">${verificationUrl}</a>
              </div>
              
              <div class="message">
                Once verified, you'll have access to:
                <ul style="color: #6b7280; margin-top: 10px;">
                  <li>Daily Bible readings and spiritual content</li>
                  <li>Prayer wall and community discussions</li>
                  <li>Church discovery and connection tools</li>
                  <li>AI-powered spiritual guidance features</li>
                </ul>
              </div>
            </div>
            
            <div class="footer">
              <p>© 2025 SoapBox Super App - Connecting Faith Communities</p>
              <p>If you have questions, contact us at support@soapboxapp.org</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Welcome to SoapBox, ${data.firstName}!
        
        Thank you for joining our faith community platform. To complete your registration and secure your account, please verify your email address by visiting:
        
        ${verificationUrl}
        
        This verification link will expire in 24 hours. If you didn't create a SoapBox account, you can safely ignore this email.
        
        Once verified, you'll have access to daily Bible readings, prayer wall, community discussions, church discovery tools, and AI-powered spiritual guidance features.
        
        © 2025 SoapBox Super App - Connecting Faith Communities
        Questions? Contact us at support@soapboxapp.org
      `
    };

    try {
      await this.mailService.send(emailContent);
      console.log(`Verification email sent successfully to ${data.email}`);
    } catch (error) {
      console.error('Failed to send verification email:', error);
      throw new Error('Failed to send verification email');
    }
  }

  async sendPasswordResetEmail(data: PasswordResetData): Promise<void> {
    if (!this.isConfigured) {
      throw new Error('Email service not configured. Please check SENDGRID_API_KEY.');
    }

    const baseUrl = process.env.BASE_URL || 'https://www.soapboxapp.org';
    const resetUrl = `${baseUrl}/reset-password?token=${data.token}`;

    const emailContent = {
      to: data.email,
      from: process.env.FROM_EMAIL || 'noreply@soapboxapp.org',
      subject: 'Reset Your SoapBox Password',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your SoapBox Password</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; }
            .header { background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); padding: 40px 20px; text-align: center; }
            .logo { color: white; font-size: 32px; font-weight: bold; margin-bottom: 10px; }
            .tagline { color: #e9d5ff; font-size: 16px; }
            .content { padding: 40px 20px; }
            .greeting { font-size: 18px; color: #374151; margin-bottom: 20px; }
            .message { color: #6b7280; line-height: 1.6; margin-bottom: 30px; }
            .button { display: inline-block; background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; margin: 20px 0; }
            .footer { padding: 20px; text-align: center; color: #9ca3af; font-size: 14px; border-top: 1px solid #e5e7eb; }
            .security { background-color: #fef2f2; border: 1px solid #fca5a5; border-radius: 6px; padding: 15px; margin: 20px 0; color: #991b1b; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">SoapBox</div>
              <div class="tagline">Faith Community Platform</div>
            </div>
            
            <div class="content">
              <div class="greeting">Password Reset Request</div>
              
              <div class="message">
                Hello ${data.firstName}, we received a request to reset your SoapBox account password. Click the button below to create a new password:
              </div>
              
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </div>
              
              <div class="security">
                <strong>Security Notice:</strong> This password reset link will expire in 1 hour. If you didn't request this reset, please ignore this email and your password will remain unchanged.
              </div>
              
              <div class="message">
                If the button doesn't work, you can copy and paste this link into your browser:<br>
                <a href="${resetUrl}" style="color: #dc2626; word-break: break-all;">${resetUrl}</a>
              </div>
            </div>
            
            <div class="footer">
              <p>© 2025 SoapBox Super App - Connecting Faith Communities</p>
              <p>If you have questions, contact us at support@soapboxapp.org</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Password Reset Request
        
        Hello ${data.firstName}, we received a request to reset your SoapBox account password. Visit the following link to create a new password:
        
        ${resetUrl}
        
        This password reset link will expire in 1 hour. If you didn't request this reset, please ignore this email and your password will remain unchanged.
        
        © 2025 SoapBox Super App - Connecting Faith Communities
        Questions? Contact us at support@soapboxapp.org
      `
    };

    try {
      await this.mailService.send(emailContent);
      console.log(`Password reset email sent successfully to ${data.email}`);
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      throw new Error('Failed to send password reset email');
    }
  }

  async sendWelcomeEmail(email: string, firstName: string): Promise<void> {
    if (!this.isConfigured) {
      console.log('Email service not configured - skipping welcome email');
      return;
    }

    const emailContent = {
      to: email,
      from: process.env.FROM_EMAIL || 'noreply@soapboxapp.org',
      subject: 'Welcome to SoapBox - Your Spiritual Journey Begins!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to SoapBox</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; }
            .header { background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); padding: 40px 20px; text-align: center; }
            .logo { color: white; font-size: 32px; font-weight: bold; margin-bottom: 10px; }
            .tagline { color: #e9d5ff; font-size: 16px; }
            .content { padding: 40px 20px; }
            .greeting { font-size: 18px; color: #374151; margin-bottom: 20px; }
            .message { color: #6b7280; line-height: 1.6; margin-bottom: 30px; }
            .feature { background-color: #f8fafc; border-radius: 8px; padding: 20px; margin: 15px 0; }
            .feature-title { font-weight: 600; color: #374151; margin-bottom: 10px; }
            .button { display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; margin: 20px 0; }
            .footer { padding: 20px; text-align: center; color: #9ca3af; font-size: 14px; border-top: 1px solid #e5e7eb; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">SoapBox</div>
              <div class="tagline">Faith Community Platform</div>
            </div>
            
            <div class="content">
              <div class="greeting">Welcome to SoapBox, ${firstName}! 🙏</div>
              
              <div class="message">
                Your email has been verified and your spiritual journey with our community begins now. SoapBox is designed to strengthen your faith and connect you with fellow believers.
              </div>
              
              <div class="feature">
                <div class="feature-title">📖 Daily Bible Readings</div>
                Start each day with guided scripture reading across 17 Bible translations with audio narration.
              </div>
              
              <div class="feature">
                <div class="feature-title">🙏 Prayer Wall</div>
                Share prayer requests and support others in their spiritual needs with our caring community.
              </div>
              
              <div class="feature">
                <div class="feature-title">⛪ Church Discovery</div>
                Find and connect with local churches that match your denomination and community preferences.
              </div>
              
              <div class="feature">
                <div class="feature-title">🤖 AI Spiritual Guidance</div>
                Receive personalized spiritual content and prayer assistance powered by advanced AI technology.
              </div>
              
              <div style="text-align: center;">
                <a href="${process.env.BASE_URL || 'https://www.soapboxapp.org'}" class="button">Start Your Journey</a>
              </div>
            </div>
            
            <div class="footer">
              <p>© 2025 SoapBox Super App - Connecting Faith Communities</p>
              <p>Questions? We're here to help at support@soapboxapp.org</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    try {
      await this.mailService.send(emailContent);
      console.log(`Welcome email sent successfully to ${email}`);
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      // Don't throw error for welcome emails - not critical
    }
  }

  isEmailServiceConfigured(): boolean {
    return this.isConfigured;
  }
}

export const emailService = new EmailService();