import twilio from 'twilio';

export interface SMSVerificationData {
  phoneNumber: string;
  firstName?: string;
  token: string;
}

export class SMSService {
  private client: twilio.Twilio | null = null;
  private fromNumber: string;

  constructor() {
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
      this.client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      this.fromNumber = process.env.TWILIO_PHONE_NUMBER;
      console.log('SMS service initialized with Twilio');
    } else {
      console.log('SMS service not configured - missing Twilio credentials');
    }
  }

  generateVerificationToken(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendVerificationSMS(data: SMSVerificationData): Promise<boolean> {
    if (!this.client) {
      console.log('SMS service not configured - skipping SMS send');
      return false;
    }

    try {
      const message = `SoapBox Super App verification code: ${data.token}. Enter this code to verify your phone number.`;
      
      console.log('=== SMS VERIFICATION DEBUG ===');
      console.log('Phone Number:', data.phoneNumber);
      console.log('Verification Token:', data.token);
      console.log('================================');

      await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: data.phoneNumber,
      });

      return true;
    } catch (error: any) {
      console.error('Twilio SMS error:', error);
      return false;
    }
  }
}

export const smsService = new SMSService();