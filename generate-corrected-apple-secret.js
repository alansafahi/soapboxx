/**
 * Generate Apple Client Secret for Corrected Service ID
 * Uses the actual Service ID from Apple Developer Console: com.soapboxsuperapp.signin
 */

import jwt from 'jsonwebtoken';
import fs from 'fs';

function generateAppleClientSecret() {
  try {
    // Apple Developer Configuration
    const teamId = 'CGQ7FW7J58';
    const keyId = 'A9J6FBJP8J';
    const clientId = 'com.soapboxsuperapp.signin'; // Corrected Service ID from screenshots
    
    // Read the private key
    const privateKey = fs.readFileSync('attached_assets/AuthKey_A9J6FBJP8J_1750487640644.p8', 'utf8');
    
    // Current time
    const now = Math.floor(Date.now() / 1000);
    
    // JWT payload
    const payload = {
      iss: teamId,
      iat: now,
      exp: now + (6 * 30 * 24 * 60 * 60), // 6 months
      aud: 'https://appleid.apple.com',
      sub: clientId
    };
    
    // JWT header
    const header = {
      kid: keyId,
      alg: 'ES256'
    };
    
    // Generate the JWT
    const clientSecret = jwt.sign(payload, privateKey, { 
      algorithm: 'ES256',
      header: header
    });
    
    console.log('✅ Apple Client Secret Generated Successfully!');
    console.log('');
    console.log('Configuration Details:');
    console.log(`Team ID: ${teamId}`);
    console.log(`Key ID: ${keyId}`);
    console.log(`Client ID: ${clientId}`);
    console.log(`Expires: ${new Date((now + (6 * 30 * 24 * 60 * 60)) * 1000).toLocaleDateString()}`);
    console.log('');
    console.log('Apple Client Secret (JWT):');
    console.log(clientSecret);
    console.log('');
    console.log('Add this to your environment variables:');
    console.log(`APPLE_CLIENT_ID=${clientId}`);
    console.log(`APPLE_CLIENT_SECRET=${clientSecret}`);
    
    return clientSecret;
    
  } catch (error) {
    console.error('❌ Error generating Apple client secret:', error.message);
    return null;
  }
}

// Generate the secret
generateAppleClientSecret();