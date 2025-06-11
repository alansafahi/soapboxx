import nodemailer from 'nodemailer';
import sgMail from '@sendgrid/mail';
import crypto from 'crypto';

export interface EmailVerificationData {
  email: string;
  firstName?: string;
  token: string;
}

export class EmailService {
  private transporter: nodemailer.Transporter;
  private useSendGrid: boolean;

  constructor() {
    this.useSendGrid = !!process.env.SENDGRID_API_KEY;
    
    if (this.useSendGrid) {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
      console.log('Email service initialized with SendGrid');
    } else {
      // Configure nodemailer with a generic SMTP setup
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
      console.log('Email service initialized with SMTP');
    }
  }

  generateVerificationToken(): string {
    // Generate a 6-digit numeric code for better user experience
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendVerificationEmail(data: EmailVerificationData): Promise<boolean> {
    try {
      const verificationUrl = `${process.env.BASE_URL || 'http://localhost:5000'}/api/auth/verify-email?token=${data.token}`;
      
      // Always log verification info in development for testing
      if (process.env.NODE_ENV === 'development') {
        console.log(`\n=== EMAIL VERIFICATION DEBUG ===`);
        console.log(`Email: ${data.email}`);
        console.log(`Verification Token: ${data.token}`);
        console.log(`Verification URL: ${verificationUrl}`);
        console.log(`================================\n`);
      }

      if (this.useSendGrid) {
        return this.sendWithSendGrid(data, verificationUrl);
      } else {
        return this.sendWithSMTP(data, verificationUrl);
      }
    } catch (error) {
      console.error('Error sending verification email:', error);
      return false;
    }
  }

  private async sendWithSendGrid(data: EmailVerificationData, verificationUrl: string): Promise<boolean> {
    try {
      const msg = {
        to: data.email,
        from: 'noreply@soapboxsuperapp.com', // Use a verified sender address
        subject: 'Verify Your SoapBox Super App Account',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #5A2671; margin: 0;">SoapBox Super App</h1>
              <p style="color: #666; margin: 5px 0;">Welcome to Your Spiritual Community</p>
            </div>
            
            <div style="background: #f9f9f9; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
              <h2 style="color: #333; margin-top: 0;">Welcome${data.firstName ? `, ${data.firstName}` : ''}!</h2>
              
              <p style="color: #666; line-height: 1.6;">
                Thank you for joining the SoapBox Super App community. To complete your registration and start connecting with your spiritual community, please verify your email address.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <div style="background: #5A2671; color: white; padding: 20px 40px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; font-size: 24px; letter-spacing: 2px;">
                  ${data.token}
                </div>
              </div>
              
              <p style="color: #666; line-height: 1.6; text-align: center;">
                Enter this verification code in the app to complete your registration.
              </p>
              
              <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px;">
                This code will expire in 10 minutes for security purposes.
              </p>
            </div>
            
            <div style="text-align: center; color: #999; font-size: 12px;">
              <p>© 2025 SoapBox Super App. All rights reserved.</p>
              <p>Building stronger spiritual communities through technology.</p>
            </div>
          </div>
        `
      };

      await sgMail.send(msg);
      console.log('✅ Verification email sent successfully via SendGrid to:', data.email);
      return true;
    } catch (error) {
      console.error('SendGrid email error:', error);
      return false;
    }
  }

  private async sendWithSMTP(data: EmailVerificationData, verificationUrl: string): Promise<boolean> {
    try {
      // Check if SMTP is properly configured
      if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.log('SMTP not configured, but token is logged above for testing');
        return process.env.NODE_ENV === 'development'; // Return true in dev mode
      }
      
      const mailOptions = {
        from: process.env.SMTP_USER || 'noreply@soapboxsuperapp.com',
        to: data.email,
        subject: 'Verify Your SoapBox Super App Account',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #5A2671; margin: 0;">SoapBox Super App</h1>
              <p style="color: #666; margin: 5px 0;">Welcome to Your Spiritual Community</p>
            </div>
            
            <div style="background: #f9f9f9; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
              <h2 style="color: #333; margin-top: 0;">Welcome${data.firstName ? `, ${data.firstName}` : ''}!</h2>
              
              <p style="color: #666; line-height: 1.6;">
                Thank you for joining the SoapBox Super App community. To complete your registration and start connecting with your spiritual community, please verify your email address.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationUrl}" 
                   style="background: #5A2671; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                  Verify My Email Address
                </a>
              </div>
              
              <p style="color: #666; font-size: 14px; line-height: 1.6;">
                If the button above doesn't work, copy and paste this link into your browser:<br>
                <a href="${verificationUrl}" style="color: #5A2671;">${verificationUrl}</a>
              </p>
            </div>
            
            <div style="text-align: center; color: #666; font-size: 12px;">
              <p>This verification link will expire in 24 hours.</p>
              <p>If you didn't create an account with SoapBox Super App, please ignore this email.</p>
            </div>
          </div>
        `,
      };

      // First verify SMTP connection
      try {
        await this.transporter.verify();
        console.log('SMTP connection verified successfully');
      } catch (verifyError) {
        console.log('SMTP verification failed:', verifyError.message);
        // Continue anyway for development testing
      }
      
      // Send the email
      const result = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', result.messageId);
      return true;
      
    } catch (error) {
      console.error('Failed to send verification email:', error.message);
      
      // In development, still return true since we log the token
      if (process.env.NODE_ENV === 'development') {
        console.log('Email delivery failed but token is logged above for testing');
        return true;
      }
      
      return false;
    }
  }

  async sendWelcomeEmail(email: string, firstName?: string): Promise<boolean> {
    try {
      const mailOptions = {
        from: process.env.FROM_EMAIL || 'noreply@soapboxsuperapp.com',
        to: email,
        subject: 'Welcome to SoapBox Super App!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #5A2671; margin: 0;">SoapBox Super App</h1>
              <p style="color: #666; margin: 5px 0;">Your Spiritual Community Awaits</p>
            </div>
            
            <div style="background: #f9f9f9; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
              <h2 style="color: #333; margin-top: 0;">Welcome to the Community${firstName ? `, ${firstName}` : ''}!</h2>
              
              <p style="color: #666; line-height: 1.6;">
                Your email has been successfully verified! You're now ready to explore all the features SoapBox Super App has to offer:
              </p>
              
              <ul style="color: #666; line-height: 1.8;">
                <li>Connect with local churches and communities</li>
                <li>Join prayer walls and share requests</li>
                <li>Read daily Bible verses and devotionals</li>
                <li>Participate in events and volunteer opportunities</li>
                <li>Make secure donations to support ministries</li>
              </ul>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.BASE_URL || 'http://localhost:5000'}" 
                   style="background: #5A2671; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                  Explore SoapBox Super App
                </a>
              </div>
            </div>
            
            <div style="text-align: center; color: #666; font-size: 12px;">
              <p>Need help getting started? Contact our support team anytime.</p>
            </div>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();