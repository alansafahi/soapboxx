import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { db } from './db';
import { users, twoFactorTokens } from '@shared/schema';
import { eq, and, gt } from 'drizzle-orm';

export interface TwoFactorSetup {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
  manualEntryKey: string;
}

export interface TwoFactorVerification {
  isValid: boolean;
  remainingAttempts?: number;
  error?: string;
}

export class TwoFactorService {
  private encryptionKey: string;
  private emailTransporter: nodemailer.Transporter;

  constructor() {
    this.encryptionKey = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
    
    // Configure email transporter (using SendGrid or SMTP)
    this.emailTransporter = nodemailer.createTransporter({
      service: 'SendGrid',
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY
      }
    });
  }

  // Encrypt sensitive data
  private encrypt(text: string): string {
    const cipher = crypto.createCipher('aes-256-cbc', this.encryptionKey);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  // Decrypt sensitive data
  private decrypt(encryptedText: string): string {
    const decipher = crypto.createDecipher('aes-256-cbc', this.encryptionKey);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  // Generate backup codes
  private generateBackupCodes(): string[] {
    const codes: string[] = [];
    for (let i = 0; i < 10; i++) {
      codes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
    }
    return codes;
  }

  // Setup TOTP for a user
  async setupTOTP(userId: string, userEmail: string): Promise<TwoFactorSetup> {
    const secret = speakeasy.generateSecret({
      name: `SoapBox Super App (${userEmail})`,
      issuer: 'SoapBox Super App',
      length: 32
    });

    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);
    const backupCodes = this.generateBackupCodes();
    const encryptedSecret = this.encrypt(secret.base32);
    const encryptedBackupCodes = backupCodes.map(code => this.encrypt(code));

    // Store encrypted secret and backup codes
    await db.update(users)
      .set({
        totpSecret: encryptedSecret,
        backupCodes: encryptedBackupCodes,
        twoFactorMethod: 'totp'
      })
      .where(eq(users.id, userId));

    return {
      secret: secret.base32,
      qrCodeUrl,
      backupCodes,
      manualEntryKey: secret.base32
    };
  }

  // Verify TOTP token
  async verifyTOTP(userId: string, token: string): Promise<TwoFactorVerification> {
    const user = await db.select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user[0]?.totpSecret) {
      return { isValid: false, error: 'TOTP not set up' };
    }

    const decryptedSecret = this.decrypt(user[0].totpSecret);
    
    const verified = speakeasy.totp.verify({
      secret: decryptedSecret,
      encoding: 'base32',
      token,
      window: 2 // Allow 2 time steps of drift
    });

    return { isValid: verified };
  }

  // Verify backup code
  async verifyBackupCode(userId: string, code: string): Promise<TwoFactorVerification> {
    const user = await db.select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user[0]?.backupCodes) {
      return { isValid: false, error: 'No backup codes available' };
    }

    const encryptedCode = this.encrypt(code.toUpperCase());
    const isValid = user[0].backupCodes.includes(encryptedCode);

    if (isValid) {
      // Remove used backup code
      const updatedCodes = user[0].backupCodes.filter(c => c !== encryptedCode);
      await db.update(users)
        .set({ backupCodes: updatedCodes })
        .where(eq(users.id, userId));
    }

    return { isValid };
  }

  // Generate email verification token
  async generateEmailToken(userId: string): Promise<string> {
    const token = crypto.randomInt(100000, 999999).toString(); // 6-digit code
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await db.insert(twoFactorTokens).values({
      userId,
      token,
      type: 'email',
      expiresAt
    });

    return token;
  }

  // Send email verification token
  async sendEmailToken(userId: string, email: string): Promise<void> {
    const token = await this.generateEmailToken(userId);

    const mailOptions = {
      from: 'noreply@soapboxsuperapp.com',
      to: email,
      subject: 'SoapBox Super App - Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #5A2671, #7C3AED); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">SoapBox Super App</h1>
          </div>
          <div style="padding: 30px; background: white;">
            <h2 style="color: #5A2671;">Your Verification Code</h2>
            <p>Enter this code to complete your login:</p>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
              <span style="font-size: 32px; font-weight: bold; color: #5A2671; letter-spacing: 4px;">${token}</span>
            </div>
            <p style="color: #666;">This code will expire in 10 minutes.</p>
            <p style="color: #666;">If you didn't request this code, please ignore this email.</p>
          </div>
        </div>
      `
    };

    await this.emailTransporter.sendMail(mailOptions);
  }

  // Verify email token
  async verifyEmailToken(userId: string, token: string): Promise<TwoFactorVerification> {
    const tokenRecord = await db.select()
      .from(twoFactorTokens)
      .where(
        and(
          eq(twoFactorTokens.userId, userId),
          eq(twoFactorTokens.token, token),
          eq(twoFactorTokens.type, 'email'),
          gt(twoFactorTokens.expiresAt, new Date())
        )
      )
      .limit(1);

    if (!tokenRecord[0]) {
      return { isValid: false, error: 'Invalid or expired token' };
    }

    const record = tokenRecord[0];

    // Check attempts
    if (record.attempts >= record.maxAttempts) {
      return { isValid: false, error: 'Too many attempts' };
    }

    // Mark token as used
    await db.update(twoFactorTokens)
      .set({ 
        usedAt: new Date(),
        attempts: record.attempts + 1
      })
      .where(eq(twoFactorTokens.id, record.id));

    return { isValid: true };
  }

  // Enable 2FA for user
  async enable2FA(userId: string, method: 'totp' | 'email'): Promise<void> {
    await db.update(users)
      .set({
        twoFactorEnabled: true,
        twoFactorMethod: method,
        twoFactorSetupAt: new Date()
      })
      .where(eq(users.id, userId));
  }

  // Disable 2FA for user
  async disable2FA(userId: string): Promise<void> {
    await db.update(users)
      .set({
        twoFactorEnabled: false,
        twoFactorMethod: null,
        totpSecret: null,
        backupCodes: null,
        twoFactorSetupAt: null
      })
      .where(eq(users.id, userId));
  }

  // Check if user has 2FA enabled
  async is2FAEnabled(userId: string): Promise<boolean> {
    const user = await db.select({ twoFactorEnabled: users.twoFactorEnabled })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    return user[0]?.twoFactorEnabled || false;
  }

  // Get user's 2FA method
  async get2FAMethod(userId: string): Promise<string | null> {
    const user = await db.select({ twoFactorMethod: users.twoFactorMethod })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    return user[0]?.twoFactorMethod || null;
  }

  // Clean up expired tokens
  async cleanupExpiredTokens(): Promise<void> {
    await db.delete(twoFactorTokens)
      .where(gt(new Date(), twoFactorTokens.expiresAt));
  }
}

export const twoFactorService = new TwoFactorService();