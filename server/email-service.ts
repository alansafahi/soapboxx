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
  const verificationTemplate = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
      <div style="background-color: white; padding: 30px; border-radius: 10px; text-align: center;">
        <div style="margin-bottom: 30px;">
          <div style="display: inline-block; width: 60px; height: 60px; background: linear-gradient(135deg, #7c3aed, #a855f7); border-radius: 50%; margin-bottom: 20px; position: relative;">
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 40px; height: 40px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7V10C2 16 6 20.5 12 22C18 20.5 22 16 22 10V7L12 2Z" fill="#7c3aed"/>
                <path d="M9 12L11 14L15 10" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>
          <h1 style="color: #7c3aed; margin: 0; font-size: 28px;">SoapBox Super App</h1>
          <p style="color: #6b7280; margin: 5px 0 0 0; font-size: 14px;">Faith Community Platform</p>
        </div>
        
        <h2 style="color: #1f2937; margin-bottom: 20px;">Verify Your Email Address</h2>
        
        <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          Hi ${options.firstName},
        </p>
        
        <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
          Welcome to SoapBox Super App! Please verify your email address to complete your registration and start your spiritual journey with our faith community.
        </p>
        
        <a href="https://www.soapboxapp.org/api/auth/verify-email?token=${options.token}" style="display: inline-block; background-color: #7c3aed; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; margin-bottom: 20px;">
          Verify Email Address
        </a>
        
        <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin-top: 30px;">
          This verification link will expire in 24 hours. If you didn't create an account with SoapBox Super App, you can safely ignore this email.
        </p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            https://www.soapboxapp.org/api/auth/verify-email?token=${options.token}
          </p>
        </div>
      </div>
    </div>
  `;

  await sendEmail({
    to: options.email,
    subject: 'Verify your SoapBox Super App account',
    html: verificationTemplate
  });
}