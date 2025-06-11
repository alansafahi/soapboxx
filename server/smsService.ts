import { db } from './db';
import { users, twoFactorTokens } from '@shared/schema';
import { eq, and, gt } from 'drizzle-orm';

export interface SMSVerificationResult {
  success: boolean;
  message: string;
  verificationId?: string;
}

export class SMSService {
  private twilioClient: any;

  constructor() {
    // Initialize Twilio client when credentials are available
    this.initializeTwilio();
  }

  private async initializeTwilio() {
    try {
      if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
        const { default: twilio } = await import('twilio');
        this.twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        console.log('Twilio SMS service initialized successfully');
      } else {
        console.log('Twilio credentials missing - SMS service disabled');
      }
    } catch (error) {
      console.error('Twilio initialization error:', error);
    }
  }

  // Send SMS verification code for phone number verification
  async sendPhoneVerification(userId: string, phoneNumber: string): Promise<SMSVerificationResult> {
    try {
      if (!this.twilioClient) {
        return {
          success: false,
          message: 'SMS service not configured'
        };
      }

      // Generate 6-digit verification code
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Store verification token in database
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      
      await db.insert(twoFactorTokens).values({
        userId,
        token: verificationCode,
        type: 'sms',
        expiresAt,
        attempts: 0,
        maxAttempts: 3
      });

      // Send SMS via Twilio
      const message = await this.twilioClient.messages.create({
        body: `Your SoapBox verification code is: ${verificationCode}. This code expires in 10 minutes.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber
      });

      return {
        success: true,
        message: 'Verification code sent successfully',
        verificationId: message.sid
      };

    } catch (error) {
      console.error('Error sending SMS verification:', error);
      return {
        success: false,
        message: 'Failed to send verification code'
      };
    }
  }

  // Verify SMS code and update user's phone number
  async verifySMSCode(userId: string, code: string, phoneNumber: string): Promise<SMSVerificationResult> {
    try {
      // Find valid token
      const [tokenRecord] = await db.select()
        .from(twoFactorTokens)
        .where(
          and(
            eq(twoFactorTokens.userId, userId),
            eq(twoFactorTokens.token, code),
            eq(twoFactorTokens.type, 'sms'),
            gt(twoFactorTokens.expiresAt, new Date()),
            eq(twoFactorTokens.usedAt, null)
          )
        )
        .limit(1);

      if (!tokenRecord) {
        return {
          success: false,
          message: 'Invalid or expired verification code'
        };
      }

      if (tokenRecord.attempts >= tokenRecord.maxAttempts) {
        return {
          success: false,
          message: 'Maximum verification attempts exceeded'
        };
      }

      // Mark token as used
      await db.update(twoFactorTokens)
        .set({ usedAt: new Date() })
        .where(eq(twoFactorTokens.id, tokenRecord.id));

      // Update user's phone number as verified
      await db.update(users)
        .set({ 
          phoneNumber: phoneNumber,
          phoneVerified: true,
          updatedAt: new Date()
        })
        .where(eq(users.id, userId));

      return {
        success: true,
        message: 'Phone number verified successfully'
      };

    } catch (error) {
      console.error('Error verifying SMS code:', error);
      return {
        success: false,
        message: 'Failed to verify code'
      };
    }
  }

  // Send 2FA code for login (for users with verified phone)
  async send2FACode(userId: string): Promise<SMSVerificationResult> {
    try {
      if (!this.twilioClient) {
        return {
          success: false,
          message: 'SMS service not configured'
        };
      }

      // Get user's verified phone number
      const [user] = await db.select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      // Check if user has verified phone (assuming phoneNumber and phoneVerified fields)
      // const phoneNumber = user.phoneNumber;
      // if (!phoneNumber || !user.phoneVerified) {
      //   return {
      //     success: false,
      //     message: 'No verified phone number found'
      //   };
      // }

      // For now, return email-based 2FA for regular members
      return {
        success: false,
        message: 'Use email verification for regular members'
      };

    } catch (error) {
      console.error('Error sending 2FA SMS:', error);
      return {
        success: false,
        message: 'Failed to send 2FA code'
      };
    }
  }

  // Verify 2FA SMS code for login
  async verify2FACode(userId: string, code: string): Promise<SMSVerificationResult> {
    try {
      // Find valid 2FA token
      const [tokenRecord] = await db.select()
        .from(twoFactorTokens)
        .where(
          and(
            eq(twoFactorTokens.userId, userId),
            eq(twoFactorTokens.token, code),
            eq(twoFactorTokens.type, 'sms'),
            gt(twoFactorTokens.expiresAt, new Date()),
            eq(twoFactorTokens.usedAt, null)
          )
        )
        .limit(1);

      if (!tokenRecord) {
        // Increment attempt counter
        await db.update(twoFactorTokens)
          .set({ attempts: tokenRecord ? tokenRecord.attempts + 1 : 1 })
          .where(
            and(
              eq(twoFactorTokens.userId, userId),
              eq(twoFactorTokens.token, code)
            )
          );

        return {
          success: false,
          message: 'Invalid or expired verification code'
        };
      }

      if (tokenRecord.attempts >= tokenRecord.maxAttempts) {
        return {
          success: false,
          message: 'Maximum verification attempts exceeded'
        };
      }

      // Mark token as used
      await db.update(twoFactorTokens)
        .set({ usedAt: new Date() })
        .where(eq(twoFactorTokens.id, tokenRecord.id));

      return {
        success: true,
        message: '2FA verification successful'
      };

    } catch (error) {
      console.error('Error verifying 2FA SMS code:', error);
      return {
        success: false,
        message: 'Failed to verify 2FA code'
      };
    }
  }

  // Check if Twilio is properly configured
  isConfigured(): boolean {
    return !!this.twilioClient;
  }

  // Get Twilio configuration status
  getConfigStatus(): { configured: boolean; missingCredentials: string[] } {
    const missingCredentials = [];
    
    if (!process.env.TWILIO_ACCOUNT_SID) {
      missingCredentials.push('TWILIO_ACCOUNT_SID');
    }
    if (!process.env.TWILIO_AUTH_TOKEN) {
      missingCredentials.push('TWILIO_AUTH_TOKEN');
    }
    if (!process.env.TWILIO_PHONE_NUMBER) {
      missingCredentials.push('TWILIO_PHONE_NUMBER');
    }

    return {
      configured: missingCredentials.length === 0,
      missingCredentials
    };
  }
}

export const smsService = new SMSService();