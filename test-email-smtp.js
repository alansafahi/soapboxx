import nodemailer from 'nodemailer';

async function testSMTPConnection() {
  console.log('Testing SMTP connection...');
  
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    // Verify SMTP connection
    await transporter.verify();
    console.log('✓ SMTP connection successful');
    
    // Send test email
    const testEmail = {
      from: process.env.SMTP_USER,
      to: 'samsafahi@gmail.com',
      subject: 'SoapBox Super App - Email Verification Test',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #5A2671; margin: 0;">SoapBox Super App</h1>
            <p style="color: #666; margin: 10px 0 0 0;">Email Service Test</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 8px; text-align: center;">
            <h2 style="color: #333; margin: 0 0 20px 0;">SMTP Configuration Successful!</h2>
            <p style="color: #666; margin: 0 0 20px 0;">
              Your email verification system is now configured and ready to send emails.
            </p>
            <p style="color: #666; margin: 0;">
              Test completed at: ${new Date().toLocaleString()}
            </p>
          </div>
        </div>
      `
    };
    
    const result = await transporter.sendMail(testEmail);
    console.log('✓ Test email sent successfully');
    console.log('Message ID:', result.messageId);
    
    return true;
  } catch (error) {
    console.error('✗ SMTP test failed:', error.message);
    return false;
  }
}

testSMTPConnection().then(success => {
  process.exit(success ? 0 : 1);
});