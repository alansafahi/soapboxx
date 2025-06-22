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

export async function sendEmail(options: EmailOptions): Promise<void> {
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
      await sgMail.send(msg);
      console.log(`Email sent successfully to ${options.to}`);
    } else {
      console.log('Email would be sent:', {
        to: options.to,
        subject: options.subject,
        hasAttachments: !!options.attachments?.length
      });
    }
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
}

export interface InvitationEmailOptions {
  to: string;
  inviterName: string;
  message: string;
  inviteLink: string;
}

export async function sendInvitationEmail(options: InvitationEmailOptions): Promise<void> {
  const invitationTemplate = createInvitationEmailTemplate({
    inviterName: options.inviterName,
    message: options.message,
    inviteLink: options.inviteLink
  });

  await sendEmail({
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

export async function sendVerificationEmail(options: VerificationEmailOptions): Promise<void> {
  const verificationTemplate = createVerificationEmailTemplate({
    firstName: options.firstName,
    token: options.token
  });

  await sendEmail({
    to: options.email,
    subject: 'Verify your SoapBox Super App account',
    html: verificationTemplate
  });
}