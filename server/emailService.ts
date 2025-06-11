import nodemailer from 'nodemailer';
import crypto from 'crypto';

export interface EmailVerificationData {
  email: string;
  firstName?: string;
  token: string;
}

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
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
  }

  generateVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  async sendVerificationEmail(data: EmailVerificationData): Promise<boolean> {
    try {
      const verificationUrl = `${process.env.BASE_URL || 'http://localhost:5000'}/api/auth/verify-email?token=${data.token}`;
      
      // In development, log the verification token for testing
      if (process.env.NODE_ENV === 'development') {
        console.log(`\n=== EMAIL VERIFICATION DEBUG ===`);
        console.log(`Email: ${data.email}`);
        console.log(`Verification Token: ${data.token}`);
        console.log(`Verification URL: ${verificationUrl}`);
        console.log(`================================\n`);
      }
      
      const mailOptions = {
        from: process.env.FROM_EMAIL || 'noreply@soapboxsuperapp.com',
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

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Failed to send verification email:', error);
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