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
    // Log detailed error for debugging
    console.log('SendGrid Email Error Details:', {
      code: error.code,
      message: error.message,
      response: error.response?.body,
      apiKey: process.env.SENDGRID_API_KEY ? 'Present' : 'Missing',
      fromEmail: process.env.SENDGRID_VERIFIED_SENDER || process.env.FROM_EMAIL || 'support@soapboxsuperapp.com'
    });
    
    // Provide specific error messages for common issues
    let errorMessage = 'Failed to send email';
    if (error.code === 403) {
      errorMessage = 'Email service authentication failed - check SendGrid API key';
    } else if (error.code === 429) {
      errorMessage = 'Email rate limit exceeded, please try again later';
    } else if (error.message?.includes('quota')) {
      errorMessage = 'Email quota exceeded';
    } else if (error.message?.includes('Invalid email')) {
      errorMessage = 'Invalid email address';
    } else if (error.message?.includes('not verified')) {
      errorMessage = 'Sender email not verified in SendGrid';
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

export interface StaffInvitationOptions {
  role: string;
  title: string;
  department: string;
  communityId: number;
}

export async function sendStaffInvitationEmail(email: string, options: StaffInvitationOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  // Use Replit domain for development - always prefer development domain when available
  const baseUrl = process.env.REPLIT_DEV_DOMAIN 
    ? `https://${process.env.REPLIT_DEV_DOMAIN}` 
    : (process.env.FRONTEND_URL || 'https://soapboxsuperapp.com');
  
  console.log(`📧 Creating staff invitation link with base URL: ${baseUrl}`);
  const inviteLink = `${baseUrl}/signup?invite=staff&community=${options.communityId}&role=${options.role}`;
  console.log(`📧 Final invitation link: ${inviteLink}`);
  
  const staffInvitationHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #6366f1; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #e5e7eb; }
        .button { display: inline-block; background: #6366f1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🙏 You've Been Invited to Join Our Ministry Team</h1>
        </div>
        <div class="content">
          <p>Hello!</p>
          <p>You've been invited to join our community ministry team in an important leadership role.</p>
          
          <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0; color: #1e40af;">Your Invitation Details:</h3>
            <p style="margin: 5px 0;"><strong>Position:</strong> ${options.title}</p>
            <p style="margin: 5px 0;"><strong>Role:</strong> ${options.role}</p>
            <p style="margin: 5px 0;"><strong>Department:</strong> ${options.department}</p>
          </div>

          <p>As a valued member of our team, you'll have access to:</p>
          <ul>
            <li>📊 Administrative dashboard and community management tools</li>
            <li>👥 Member directory and communication features</li>
            <li>📅 Event planning and volunteer coordination</li>
            <li>💬 Prayer support and pastoral care resources</li>
            <li>🔐 Role-based permissions for your ministry area</li>
          </ul>

          <p>Click the button below to accept your invitation and set up your account:</p>
          
          <div style="text-align: center;">
            <a href="${inviteLink}" class="button">Accept Invitation & Join Team</a>
          </div>

          <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${inviteLink}">${inviteLink}</a>
          </p>
        </div>
        <div class="footer">
          <p>This invitation was sent through SoapBox Community Management Platform</p>
          <p>If you have any questions, please contact your community administrator.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: `Ministry Team Invitation - ${options.title} Position`,
    html: staffInvitationHtml
  });
}