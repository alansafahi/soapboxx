import { MailService } from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  // SendGrid not configured - email notifications will be logged only
}

const mailService = new MailService();
if (process.env.SENDGRID_API_KEY) {
  mailService.setApiKey(process.env.SENDGRID_API_KEY);
}

export interface VolunteerApplicationNotification {
  coordinatorEmail: string;
  coordinatorName: string;
  volunteerName: string;
  volunteerEmail: string;
  opportunityTitle: string;
  matchId: number;
}

export interface VolunteerStatusNotification {
  volunteerEmail: string;
  volunteerName: string;
  opportunityTitle: string;
  status: 'approved' | 'rejected';
  message?: string;
}

export async function sendCoordinatorApplicationNotification(data: VolunteerApplicationNotification): Promise<boolean> {
  try {
    if (!process.env.SENDGRID_API_KEY) {
      // Email notification logged: New volunteer application
      return true;
    }

    const emailData = {
      to: data.coordinatorEmail,
      from: 'noreply@soapboxsuperapp.com',
      subject: `New Volunteer Application: ${data.opportunityTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">New Volunteer Application</h1>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333;">Hello ${data.coordinatorName},</h2>
            
            <p style="font-size: 16px; line-height: 1.6; color: #555;">
              Great news! A volunteer has applied for the <strong>${data.opportunityTitle}</strong> position.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
              <h3 style="margin: 0 0 10px 0; color: #333;">Volunteer Details:</h3>
              <p style="margin: 5px 0;"><strong>Name:</strong> ${data.volunteerName}</p>
              <p style="margin: 5px 0;"><strong>Email:</strong> ${data.volunteerEmail}</p>
              <p style="margin: 5px 0;"><strong>Position:</strong> ${data.opportunityTitle}</p>
            </div>
            
            <p style="font-size: 16px; line-height: 1.6; color: #555;">
              Please log into your SoapBox Super App admin dashboard to review this application and either approve or decline the volunteer.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://soapboxsuperapp.com/divine" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                Review Application
              </a>
            </div>
            
            <p style="font-size: 14px; color: #777; margin-top: 30px;">
              This notification was sent from your SoapBox Super App D.I.V.I.N.E. volunteer management system.
            </p>
          </div>
        </div>
      `
    };

    await mailService.send(emailData);
    // Application notification sent - silent logging
    return true;

  } catch (error) {
    
    return false;
  }
}

export async function sendVolunteerStatusNotification(data: VolunteerStatusNotification): Promise<boolean> {
  try {
    if (!process.env.SENDGRID_API_KEY) {
      
      
      return true;
    }

    const isApproved = data.status === 'approved';
    
    const emailData = {
      to: data.volunteerEmail,
      from: 'noreply@soapboxsuperapp.com',
      subject: isApproved 
        ? `Welcome to the Team! Your ${data.opportunityTitle} Application Approved`
        : `Thank you for your interest in ${data.opportunityTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: ${isApproved ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)'}; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">
              ${isApproved ? 'Welcome to the Ministry Team!' : 'Thank You for Your Interest'}
            </h1>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333;">Dear ${data.volunteerName},</h2>
            
            ${isApproved 
              ? `<p style="font-size: 16px; line-height: 1.6; color: #555;">
                   Congratulations! Your application for <strong>${data.opportunityTitle}</strong> has been approved. We're excited to have you join our ministry team!
                 </p>
                 
                 <div style="background: #dcfce7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
                   <h3 style="margin: 0 0 10px 0; color: #065f46;">Next Steps:</h3>
                   <ul style="margin: 0; padding-left: 20px; color: #065f46;">
                     <li>Check your calendar for upcoming opportunities</li>
                     <li>Contact your ministry coordinator if you have questions</li>
                     <li>Complete any required training or background checks</li>
                   </ul>
                 </div>

                 ${data.message ? `<p style="font-style: italic; color: #666; background: white; padding: 15px; border-radius: 6px;">"${data.message}"</p>` : ''}

                 <div style="text-align: center; margin: 30px 0;">
                   <a href="https://soapboxsuperapp.com/calendar" 
                      style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                     View My Calendar
                   </a>
                 </div>`
              : `<p style="font-size: 16px; line-height: 1.6; color: #555;">
                   Thank you for your interest in the <strong>${data.opportunityTitle}</strong> volunteer position. While we've selected another volunteer for this specific opportunity, we truly appreciate your heart for service.
                 </p>
                 
                 <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #d97706;">
                   <h3 style="margin: 0 0 10px 0; color: #92400e;">Don't Give Up!</h3>
                   <p style="margin: 0; color: #92400e;">We have many other volunteer opportunities that might be perfect for your unique gifts and calling. Please check your Divine Appointments for alternative suggestions.</p>
                 </div>

                 ${data.message ? `<p style="font-style: italic; color: #666; background: white; padding: 15px; border-radius: 6px;">"${data.message}"</p>` : ''}

                 <div style="text-align: center; margin: 30px 0;">
                   <a href="https://soapboxsuperapp.com/divine" 
                      style="background: linear-gradient(135deg, #d97706 0%, #b45309 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                     Explore Other Opportunities
                   </a>
                 </div>`
            }
            
            <p style="font-size: 14px; color: #777; margin-top: 30px;">
              Blessings,<br>
              Your SoapBox Super App Ministry Team
            </p>
          </div>
        </div>
      `
    };

    await mailService.send(emailData);
    
    return true;

  } catch (error) {
    
    return false;
  }
}