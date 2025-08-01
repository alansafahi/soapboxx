import twilio from "twilio";
import crypto from "crypto";

// Initialize Twilio client
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

if (!accountSid || !authToken || !twilioPhone) {
  console.warn("Twilio credentials not configured. SMS verification will be disabled.");
}

const client = accountSid && authToken ? twilio(accountSid, authToken) : null;

export class SMSService {
  /**
   * Generate a 6-digit verification code
   */
  static generateVerificationCode(): string {
    return crypto.randomInt(100000, 999999).toString();
  }

  /**
   * Send SMS verification code
   */
  static async sendVerificationCode(phoneNumber: string, code: string): Promise<boolean> {
    if (!client || !twilioPhone) {
      console.error("Twilio not configured");
      throw new Error("SMS service not available");
    }

    try {
      // Format phone number (ensure it starts with +1 for US numbers)
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+1${phoneNumber.replace(/\D/g, '')}`;
      
      const message = await client.messages.create({
        body: `Your SoapBox verification code is: ${code}. This code expires in 10 minutes.`,
        from: twilioPhone,
        to: formattedPhone,
      });

      console.log(`SMS sent successfully: ${message.sid}`);
      return true;
    } catch (error) {
      console.error("Failed to send SMS:", error);
      throw new Error("Failed to send verification code");
    }
  }

  /**
   * Send SMS notification (for general notifications)
   */
  static async sendNotification(phoneNumber: string, message: string): Promise<boolean> {
    if (!client || !twilioPhone) {
      console.error("Twilio not configured");
      return false;
    }

    try {
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+1${phoneNumber.replace(/\D/g, '')}`;
      
      const sms = await client.messages.create({
        body: message,
        from: twilioPhone,
        to: formattedPhone,
      });

      console.log(`SMS notification sent: ${sms.sid}`);
      return true;
    } catch (error) {
      console.error("Failed to send SMS notification:", error);
      return false;
    }
  }

  /**
   * Validate phone number format
   */
  static validatePhoneNumber(phoneNumber: string): boolean {
    // Basic US phone number validation
    const phoneRegex = /^(\+1)?[2-9]\d{2}[2-9]\d{2}\d{4}$/;
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    return phoneRegex.test(cleanPhone) || phoneRegex.test(`+1${cleanPhone}`);
  }

  /**
   * Format phone number for display
   */
  static formatPhoneNumber(phoneNumber: string): string {
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    if (cleanPhone.length === 10) {
      return `(${cleanPhone.slice(0, 3)}) ${cleanPhone.slice(3, 6)}-${cleanPhone.slice(6)}`;
    } else if (cleanPhone.length === 11 && cleanPhone.startsWith('1')) {
      return `+1 (${cleanPhone.slice(1, 4)}) ${cleanPhone.slice(4, 7)}-${cleanPhone.slice(7)}`;
    }
    return phoneNumber; // Return original if can't format
  }
}