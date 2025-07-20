export function createVerificationEmailTemplate(options: { firstName: string; token: string }): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
      <div style="background-color: white; padding: 30px; border-radius: 10px; text-align: center;">
        <div style="margin-bottom: 30px;">
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
        
        <a href="https://www.soapboxsuperapp.com/api/auth/verify-email?token=${options.token}" style="display: inline-block; background-color: #7c3aed; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; margin-bottom: 20px;">
          Verify Email Address
        </a>
        
        <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin-top: 30px;">
          This verification link will expire in 24 hours. If you didn't create an account with SoapBox Super App, you can safely ignore this email.
        </p>
        
        <p style="color: #6b7280; font-size: 12px; line-height: 1.6; margin-top: 20px;">
          If the button above doesn't work, you can copy and paste this link into your browser:<br>
          <span style="word-break: break-all;">https://www.soapboxsuperapp.com/api/auth/verify-email?token=${options.token}</span>
        </p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            © 2025 SoapBox Super App. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  `;
}

export function createInvitationEmailTemplate(options: { inviterName: string; message: string; inviteLink: string }): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
      <div style="background-color: white; padding: 30px; border-radius: 10px; text-align: center;">
        <div style="margin-bottom: 30px;">
          <h1 style="color: #7c3aed; margin: 0; font-size: 28px;">SoapBox Super App</h1>
          <p style="color: #6b7280; margin: 5px 0 0 0; font-size: 14px;">Faith Community Platform</p>
        </div>
        
        <h2 style="color: #1f2937; margin-bottom: 20px;">You're Invited to Join SoapBox!</h2>
        
        <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          <strong>${options.inviterName}</strong> invited you to join SoapBox!
        </p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #7c3aed;">
          <p style="color: #374151; font-style: italic; margin: 0; line-height: 1.6;">
            "${options.message}"
          </p>
        </div>
        
        <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
          Daily verses, prayer wall, faith community. Join us!
        </p>
        
        <a href="${options.inviteLink}" style="display: inline-block; background-color: #7c3aed; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; margin-bottom: 20px;">
          Accept Invitation
        </a>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            This invitation will expire in 30 days. If you don't want to receive these emails, you can ignore this message.
          </p>
        </div>
      </div>
    </div>
  `;
}