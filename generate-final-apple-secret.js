#!/usr/bin/env node
/**
 * Generate Final Apple Client Secret - Following Troubleshooting Guide
 * Creates JWT with exact specifications from Apple Developer Console
 */

import jwt from 'jsonwebtoken';
import fs from 'fs';

function generateFinalAppleClientSecret() {
  console.log('🍎 Generating FINAL Apple Client Secret for SoapBox...\n');

  try {
    // EXACT configuration from Apple Developer Console screenshots
    const teamId = 'CGQ7FW7J58';           // Team ID
    const keyId = 'A9J6FBJP8J';            // Key ID (SoapBox SignIn Key)
    const clientId = 'com.soapboxsuperapp.signin';  // Service ID (CONFIRMED)
    const audience = 'https://appleid.apple.com';   // Apple ID audience
    const privateKeyPath = './attached_assets/AuthKey_A9J6FBJP8J_1750487640644.p8';
    
    console.log('📋 Configuration:');
    console.log(`   Team ID: ${teamId}`);
    console.log(`   Key ID: ${keyId}`);
    console.log(`   Service ID (Client ID): ${clientId}`);
    console.log(`   Audience: ${audience}`);
    console.log('');

    // Read the private key
    const privateKey = fs.readFileSync(privateKeyPath, 'utf8');
    
    // Validate private key format
    if (!privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
      throw new Error('Invalid private key format - must be .p8 format');
    }

    // Generate JWT payload with EXACT specifications
    const now = Math.floor(Date.now() / 1000);
    const expiration = now + (6 * 30 * 24 * 60 * 60); // 6 months
    
    const payload = {
      iss: teamId,           // Issuer: Team ID
      iat: now,              // Issued at: Current timestamp
      exp: expiration,       // Expires: 6 months from now
      aud: audience,         // Audience: Apple ID service
      sub: clientId,         // Subject: Service ID (Client ID)
    };

    console.log('🔐 JWT Payload:');
    console.log(JSON.stringify(payload, null, 2));
    console.log('');

    // Generate the client secret JWT with proper headers
    const clientSecret = jwt.sign(payload, privateKey, { 
      algorithm: 'ES256',
      header: {
        alg: 'ES256',
        kid: keyId,
        typ: 'JWT'
      }
    });

    console.log('✅ FINAL APPLE CLIENT SECRET GENERATED:');
    console.log('');
    console.log('🔑 Environment Variables:');
    console.log(`APPLE_CLIENT_ID=${clientId}`);
    console.log(`APPLE_CLIENT_SECRET=${clientSecret}`);
    console.log(`APPLE_REDIRECT_URI=https://www.soapboxapp.org/auth/callback`);
    console.log('');
    
    console.log('📝 JWT Token (for validation at jwt.io):');
    console.log(clientSecret);
    console.log('');
    
    console.log('🔍 Verification Steps:');
    console.log('1. Copy the JWT token above to https://jwt.io');
    console.log('2. Verify it decodes with these exact values:');
    console.log(`   - iss: "${teamId}"`);
    console.log(`   - aud: "${audience}"`);
    console.log(`   - sub: "${clientId}"`);
    console.log('3. Update your Replit secrets with the values above');
    console.log('4. Test Apple Sign-In authentication');
    console.log('');
    
    const expirationDate = new Date(expiration * 1000);
    console.log(`📅 Token expires: ${expirationDate.toISOString()}`);
    console.log('');
    console.log('🎯 This JWT matches your Apple Developer Console configuration exactly.');

  } catch (error) {
    console.error('❌ Error generating Apple client secret:', error.message);
    process.exit(1);
  }
}

// Execute the function
generateFinalAppleClientSecret();