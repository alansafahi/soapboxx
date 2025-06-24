/**
 * Production Email Service for SoapBox Super App
 * Secure email verification and authentication communications
 */

import { MailService } from '@sendgrid/mail';
import { createCompatibleVerificationEmailTemplate, createCompatiblePasswordResetEmailTemplate } from './email-client-compatible-template';

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
    const apiKey = process.env.SENDGRID_API_KEY;
    const verifiedSender = process.env.SENDGRID_VERIFIED_SENDER;

    if (apiKey && verifiedSender) {
      this.mailService.setApiKey(apiKey);
      this.isConfigured = true;
      console.log('SendGrid email service configured successfully');
    } else {
      console.warn('SendGrid not configured - missing SENDGRID_API_KEY or SENDGRID_VERIFIED_SENDER');
    }
  }

  async sendVerificationEmail(data: EmailVerificationData): Promise<void> {
    if (!this.isConfigured) {
      throw new Error('Email service not configured. SENDGRID_API_KEY and SENDGRID_VERIFIED_SENDER are required.');
    }

    const verificationUrl = `https://www.soapboxapp.org/api/auth/verify-email?token=${data.token}`;

    try {
      await this.mailService.send({
        to: data.email,
        from: process.env.SENDGRID_VERIFIED_SENDER!,
        subject: 'Verify Your SoapBox Account',
        html: createCompatibleVerificationEmailTemplate(data, verificationUrl),
        text: `
        Welcome to SoapBox, ${data.firstName}!
        
        Thank you for joining our faith community platform. To complete your registration and secure your account, please verify your email address by visiting:
        
        ${verificationUrl}
        
        This verification link will expire in 24 hours. If you didn't create a SoapBox account, you can safely ignore this email.
        
        Once verified, you'll have access to daily Bible readings, prayer communities, church discovery tools, and AI-powered spiritual guidance.
        
        If you have questions, contact us at support@soapboxsuperapp.com
        
        © 2025 SoapBox Super App - Connecting Faith Communities
      `
      });

    } catch (error) {
      console.error('❌ Failed to send verification email:', error);
      throw error;
    }
  }

  async sendPasswordResetEmail(data: PasswordResetData): Promise<void> {
    if (!this.isConfigured) {
      throw new Error('Email service not configured. SENDGRID_API_KEY and SENDGRID_VERIFIED_SENDER are required.');
    }

    const resetUrl = `https://www.soapboxapp.org/reset-password?token=${data.token}`;

    try {
      await this.mailService.send({
        to: data.email,
        from: process.env.SENDGRID_VERIFIED_SENDER!,
        subject: 'Reset Your SoapBox Password',
        html: createCompatiblePasswordResetEmailTemplate(data, resetUrl),
        text: `
        Hello ${data.firstName},
        
        We received a request to reset your SoapBox account password. To create a new password, visit:
        
        ${resetUrl}
        
        This password reset link will expire in 1 hour. If you didn't request this reset, please ignore this email and your password will remain unchanged.
        
        If you have questions, contact us at support@soapboxsuperapp.com
        
        © 2025 SoapBox Super App - Connecting Faith Communities
      `
      });

    } catch (error) {
      console.error('❌ Failed to send password reset email:', error);
      throw error;
    }
  }

  async sendWelcomeEmail(email: string, firstName: string): Promise<void> {
    if (!this.isConfigured) {
      console.warn('Email service not configured - skipping welcome email');
      return;
    }

    try {
      await this.mailService.send({
        to: email,
        from: process.env.SENDGRID_VERIFIED_SENDER!,
        subject: 'Welcome to SoapBox - Your Faith Journey Begins!',
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #7c3aed;">Welcome to SoapBox, ${firstName}!</h2>
          <p>Your email has been verified and your account is now active.</p>
          <p>Start exploring our faith community platform with daily Bible readings, prayer connections, and spiritual growth tools.</p>
          <p style="margin-top: 30px;">Blessings,<br>The SoapBox Team</p>
        </div>
        `,
        text: `Welcome to SoapBox, ${firstName}! Your account is now active. Start exploring our faith community platform.`
      });

    } catch (error) {
      console.error('❌ Failed to send welcome email:', error);
    }
  }

  isEmailServiceConfigured(): boolean {
    return this.isConfigured;
  }
}

export const emailService = new EmailService();