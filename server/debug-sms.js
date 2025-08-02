/**
 * Debug script to check Twilio SMS service
 */
import twilio from 'twilio';

async function debugTwilio() {
  console.log('=== Twilio Debug Information ===');
  
  // Check environment variables
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;
  
  console.log('Account SID:', accountSid ? `${accountSid.substring(0, 10)}...` : 'NOT SET');
  console.log('Auth Token:', authToken ? `${authToken.substring(0, 10)}...` : 'NOT SET');
  console.log('From Number:', fromNumber || 'NOT SET');
  
  if (!accountSid || !authToken || !fromNumber) {
    console.error('Missing Twilio credentials!');
    return;
  }
  
  try {
    const client = twilio(accountSid, authToken);
    
    // Check account info
    const account = await client.api.accounts(accountSid).fetch();
    console.log('\n=== Account Status ===');
    console.log('Status:', account.status);
    console.log('Type:', account.type);
    
    // Check recent messages
    console.log('\n=== Recent Messages ===');
    const messages = await client.messages.list({ limit: 3 });
    
    if (messages.length === 0) {
      console.log('No recent messages found');
    } else {
      messages.forEach((message, index) => {
        console.log(`\nMessage ${index + 1}:`);
        console.log('  SID:', message.sid);
        console.log('  To:', message.to);
        console.log('  From:', message.from);
        console.log('  Status:', message.status);
        console.log('  Error Code:', message.errorCode || 'None');
        console.log('  Error Message:', message.errorMessage || 'None');
        console.log('  Date Created:', message.dateCreated);
      });
    }
    
    // Test phone number validation
    console.log('\n=== Phone Number Test ===');
    const testPhone = '7149062548';
    const cleaned = testPhone.replace(/\D/g, '');
    const formatted = `+1${cleaned}`;
    console.log('Original:', testPhone);
    console.log('Cleaned:', cleaned);
    console.log('Formatted:', formatted);
    
  } catch (error) {
    console.error('\n=== ERROR ===');
    console.error('Error:', error.message);
    console.error('Code:', error.code);
    console.error('Status:', error.status);
  }
}

debugTwilio().catch(console.error);