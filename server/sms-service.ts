import twilio from 'twilio';

class SMSService {
  private client: any;

  constructor() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    
    if (accountSid && authToken) {
      this.client = twilio(accountSid, authToken);
    } else {
      console.warn('Twilio credentials not configured');
    }
  }

  /**
   * Generate a 6-digit verification code
   */
  generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Validate phone number format
   */
  static validatePhoneNumber(phoneNumber: string): boolean {
    // Remove all non-digits
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // US phone numbers should be 10 or 11 digits (with or without country code)
    if (cleaned.length === 10) {
      return /^[2-9]\d{2}[2-9]\d{2}\d{4}$/.test(cleaned);
    } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
      const withoutCountry = cleaned.substring(1);
      return /^[2-9]\d{2}[2-9]\d{2}\d{4}$/.test(withoutCountry);
    }
    
    return false;
  }

  /**
   * Format phone number for Twilio (E.164 format)
   */
  formatPhoneNumber(phoneNumber: string): string {
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    if (cleaned.length === 10) {
      return `+1${cleaned}`;
    } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return `+${cleaned}`;
    }
    
    throw new Error('Invalid phone number format');
  }

  /**
   * Send SMS verification code
   */
  async sendVerificationCode(phoneNumber: string, code: string): Promise<boolean> {
    if (!this.client) {
      throw new Error('SMS service not configured');
    }

    try {
      const fromNumber = process.env.TWILIO_PHONE_NUMBER;
      if (!fromNumber) {
        throw new Error('Twilio phone number not configured');
      }

      const formattedPhone = this.formatPhoneNumber(phoneNumber);
      const message = `Your SoapBox verification code is: ${code}. This code expires in 10 minutes.`;

      const result = await this.client.messages.create({
        body: message,
        from: fromNumber,
        to: formattedPhone
      });

      console.log(`SMS sent successfully. SID: ${result.sid}`);
      return true;

    } catch (error) {
      console.error('Failed to send SMS:', error);
      throw error;
    }
  }

  /**
   * Legacy method for backwards compatibility
   */
  generateVerificationToken(): string {
    return this.generateVerificationCode();
  }

  /**
   * Legacy method for backwards compatibility
   */
  async sendVerificationSMS({ phoneNumber, firstName, token }: {
    phoneNumber: string;
    firstName: string;
    token: string;
  }): Promise<boolean> {
    try {
      await this.sendVerificationCode(phoneNumber, token);
      return true;
    } catch (error) {
      return false;
    }
  }
}

export { SMSService };
export default new SMSService();