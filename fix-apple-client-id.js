#!/usr/bin/env node
/**
 * Fix Apple Client ID Issue - Generate Fresh Apple Client Secret
 * This script generates a fresh Apple client secret with the correct Service ID
 */

import jwt from 'jsonwebtoken';
import fs from 'fs';

function generateAppleClientSecret() {
  console.log('🍎 Generating Fresh Apple Client Secret for SoapBox...\n');

  try {
    // SoapBox Apple Developer Configuration
    const teamId = 'CGQ7FW7J58';
    const keyId = 'A9J6FBJP8J';
    const privateKeyPath = './attached_assets/AuthKey_A9J6FBJP8J_1750487640644.p8';
    
    // Try multiple possible Service IDs based on Apple Developer Console
    const possibleServiceIds = [
      'com.soapboxsuperapp.auth',           // Most likely correct
      'app.soapboxsuperapp.signin',         // Alternative format
      'com.soapboxsuperapp.signin',         // Current failing one
      'com.soapbox.superapp.auth',          // Variation
      'com.soapbox.auth'                    // Simple version
    ];

    // Read the private key
    const privateKey = fs.readFileSync(privateKeyPath, 'utf8');
    
    // Validate private key format
    if (!privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
      throw new Error('Invalid private key format');
    }

    console.log('🔑 Generating client secrets for all possible Service IDs:\n');

    possibleServiceIds.forEach((serviceId, index) => {
      // Generate JWT payload
      const now = Math.floor(Date.now() / 1000);
      const payload = {
        iss: teamId,           // Team ID
        iat: now,              // Issued at
        exp: now + (6 * 30 * 24 * 60 * 60), // Expires in 6 months
        aud: 'https://appleid.apple.com',     // Apple ID audience
        sub: serviceId,        // Service ID (Client ID)
      };

      // Generate the client secret JWT
      const clientSecret = jwt.sign(payload, privateKey, { 
        algorithm: 'ES256',
        header: {
          alg: 'ES256',
          kid: keyId,
        }
      });

      console.log(`${index + 1}. Service ID: ${serviceId}`);
      console.log(`   APPLE_CLIENT_ID=${serviceId}`);
      console.log(`   APPLE_CLIENT_SECRET=${clientSecret}`);
      console.log('');
    });

    console.log('📋 Instructions:');
    console.log('1. Try each Service ID combination above');
    console.log('2. Update your Replit secrets with the working combination');
    console.log('3. The most likely correct one is: com.soapboxsuperapp.auth');
    console.log('4. Test Apple Sign-In after updating each combination');

  } catch (error) {
    console.error('❌ Error generating Apple client secret:', error.message);
    process.exit(1);
  }
}

// Execute the function
generateAppleClientSecret();