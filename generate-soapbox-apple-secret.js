#!/usr/bin/env node
/**
 * Generate Apple Client Secret for SoapBox Super App
 * Uses the provided Apple Developer credentials and private key
 */

import jwt from 'jsonwebtoken';
import fs from 'fs';

function generateAppleClientSecret() {
  console.log('🍎 Generating Apple Client Secret for SoapBox Super App...\n');

  try {
    // SoapBox Apple Developer Configuration
    const teamId = 'CG0TWJ58';
    const clientId = 'com.soapboxsuperapp.auth';
    const keyId = 'A9J6FBJP8J';
    const privateKeyPath = './attached_assets/AuthKey_A9J6FBJP8J_1750487640644.p8';

    // Read the private key
    const privateKey = fs.readFileSync(privateKeyPath, 'utf8');
    
    // Validate private key format
    if (!privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
      throw new Error('Invalid private key format');
    }

    // Generate JWT payload
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      iss: teamId,           // Team ID
      iat: now,              // Issued at
      exp: now + (6 * 30 * 24 * 60 * 60), // Expires in 6 months
      aud: 'https://appleid.apple.com',     // Apple ID audience
      sub: clientId,         // Service ID (Client ID)
    };

    // Generate the client secret JWT
    const clientSecret = jwt.sign(payload, privateKey, { 
      algorithm: 'ES256',
      header: {
        alg: 'ES256',
        kid: keyId,
      }
    });

    console.log('✅ Apple Client Secret Generated Successfully!\n');
    console.log('Update your Replit secrets with:\n');
    console.log(`APPLE_CLIENT_ID=${clientId}`);
    console.log(`APPLE_CLIENT_SECRET=${clientSecret}`);
    console.log('\n📝 Token Details:');
    console.log(`Team ID: ${teamId}`);
    console.log(`Service ID: ${clientId}`);
    console.log(`Key ID: ${keyId}`);
    console.log(`Expires: ${new Date((now + (6 * 30 * 24 * 60 * 60)) * 1000).toLocaleDateString()}`);
    
    return {
      clientId,
      clientSecret,
      teamId,
      keyId
    };

  } catch (error) {
    console.error('❌ Error generating Apple client secret:', error.message);
    return null;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateAppleClientSecret();
}

export { generateAppleClientSecret };