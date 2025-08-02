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
  console.log('Auth Token Length:', authToken ? authToken.length : 'NOT SET');
  console.log('Auth Token Format:', authToken ? (authToken.startsWith('SK') ? 'API Key' : 'Auth Token') : 'NOT SET');
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
    
    // Check Messaging Services
    console.log('\n=== Messaging Services ===');
    try {
      const services = await client.messaging.v1.services.list();
      console.log('Number of Messaging Services:', services.length);
      
      for (const service of services) {
        console.log(`\nService: ${service.friendlyName}`);
        console.log('  SID:', service.sid);
        console.log('  Status:', service.status);
        
        // Check phone numbers in this service
        const phoneNumbers = await client.messaging.v1.services(service.sid).phoneNumbers.list();
        console.log('  Phone Numbers:', phoneNumbers.map(p => p.phoneNumber).join(', ') || 'None');
      }
    } catch (error) {
      console.log('Error checking messaging services:', error.message);
    }
    
    // Check the specific phone number
    console.log('\n=== Phone Number Details ===');
    try {
      const phoneNumbers = await client.incomingPhoneNumbers.list();
      const ourNumber = phoneNumbers.find(p => p.phoneNumber === fromNumber);
      
      if (ourNumber) {
        console.log('Phone Number Found:');
        console.log('  SID:', ourNumber.sid);
        console.log('  Phone Number:', ourNumber.phoneNumber);
        console.log('  Friendly Name:', ourNumber.friendlyName);
        console.log('  Capabilities SMS:', ourNumber.capabilities.sms);
        console.log('  Status:', ourNumber.status);
      } else {
        console.log('Phone number not found in account');
      }
    } catch (error) {
      console.log('Error checking phone number:', error.message);
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