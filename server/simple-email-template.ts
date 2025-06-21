/**
 * Ultra-Simple Email Templates for Maximum Compatibility
 * Plain text with minimal HTML for universal email client support
 */

export function createSimpleVerificationEmail(data: { firstName: string }, verificationUrl: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Email Verification</title>
</head>
<body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center">
        <table width="600" cellpadding="20" cellspacing="0" border="0" style="background-color: white; margin: 20px auto;">
          <tr>
            <td align="center">
              <h1 style="color: #7c3aed; margin: 0; font-size: 28px;">Email Verification</h1>
            </td>
          </tr>
          <tr>
            <td>
              <h2 style="color: #333; margin: 20px 0;">Verify Your Email Address</h2>
              <p>Hello ${data.firstName},</p>
              <p>Welcome to SoapBox Super App! Please verify your email address to complete your registration.</p>
              <p style="text-align: center; margin: 30px 0;">
                <a href="${verificationUrl}" style="background-color: #7c3aed; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email Address</a>
              </p>
              <p>If the button doesn't work, copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
              <p>This link will expire in 24 hours for security.</p>
              <p>Best regards,<br>The SoapBox Team</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function createSimplePasswordResetEmail(data: { firstName: string }, resetUrl: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Password Reset - SoapBox Super App</title>
</head>
<body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center">
        <table width="600" cellpadding="20" cellspacing="0" border="0" style="background-color: white; margin: 20px auto;">
          <tr>
            <td align="center">
              <h1 style="color: #dc2626; margin: 0; font-size: 28px;">SoapBox</h1>
              <p style="color: #666; margin: 5px 0;">Super App - Password Reset Request</p>
            </td>
          </tr>
          <tr>
            <td>
              <h2 style="color: #333; margin: 20px 0;">Reset Your Password</h2>
              <p>Hello ${data.firstName},</p>
              <p>We received a request to reset your password for your SoapBox account.</p>
              <p style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" style="background-color: #dc2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
              </p>
              <p>If the button doesn't work, copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #666;">${resetUrl}</p>
              <p>This link will expire in 1 hour for security.</p>
              <p>If you didn't request this password reset, please ignore this email.</p>
              <p>Best regards,<br>The SoapBox Team</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}