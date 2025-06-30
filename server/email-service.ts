import sgMail from '@sendgrid/mail';
import { createVerificationEmailTemplate, createInvitationEmailTemplate } from './email-templates';

// Initialize SendGrid with API key from environment
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export interface EmailAttachment {
  filename: string;
  content: Buffer;
  contentType: string;
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  attachments?: EmailAttachment[];
}

export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const msg = {
      to: options.to,
      from: process.env.SENDGRID_VERIFIED_SENDER || process.env.FROM_EMAIL || 'support@soapboxsuperapp.com',
      subject: options.subject,
      html: options.html,
      attachments: options.attachments?.map(att => ({
        filename: att.filename,
        content: att.content.toString('base64'),
        type: att.contentType,
        disposition: 'attachment'
      }))
    };

    if (process.env.SENDGRID_API_KEY) {
      const response = await sgMail.send(msg);
      const messageId = response[0]?.headers?.['x-message-id'] || 'unknown';
      return { success: true, messageId };
    } else {
      // Development mode - simulate email sending
      return { success: true, messageId: 'dev-mode' };
    }
  } catch (error: any) {
    console.error('❌ Email delivery failed:', error);
    
    // Provide specific error messages for common issues
    let errorMessage = 'Failed to send email';
    if (error.code === 403) {
      errorMessage = 'Email service authentication failed';
    } else if (error.code === 429) {
      errorMessage = 'Email rate limit exceeded, please try again later';
    } else if (error.message?.includes('quota')) {
      errorMessage = 'Email quota exceeded';
    } else if (error.message?.includes('Invalid email')) {
      errorMessage = 'Invalid email address';
    }
    
    return { success: false, error: errorMessage };
  }
}

export interface InvitationEmailOptions {
  to: string;
  inviterName: string;
  message: string;
  inviteLink: string;
}

export async function sendInvitationEmail(options: InvitationEmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const invitationTemplate = createInvitationEmailTemplate({
    inviterName: options.inviterName,
    message: options.message,
    inviteLink: options.inviteLink
  });

  return await sendEmail({
    to: options.to,
    subject: `${options.inviterName} invited you to join SoapBox Super App`,
    html: invitationTemplate
  });
}

export interface VerificationEmailOptions {
  email: string;
  firstName: string;
  token: string;
}

export async function sendVerificationEmail(options: VerificationEmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const verificationTemplate = createVerificationEmailTemplate({
    firstName: options.firstName,
    token: options.token
  });

  return await sendEmail({
    to: options.email,
    subject: 'Verify your SoapBox Super App account',
    html: verificationTemplate
  });
}