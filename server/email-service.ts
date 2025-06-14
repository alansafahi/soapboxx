import sgMail from '@sendgrid/mail';

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
      from: process.env.FROM_EMAIL || 'noreply@soapbox.app',
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