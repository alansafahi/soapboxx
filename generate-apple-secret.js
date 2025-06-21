#!/usr/bin/env node
/**
 * Apple Client Secret Generator for SoapBox Super App
 * Run this script to generate your APPLE_CLIENT_SECRET
 */

const jwt = require('jsonwebtoken');
const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function generateAppleClientSecret() {
  console.log('\n🍎 Apple Sign-In Client Secret Generator\n');
  console.log('Follow the steps at developer.apple.com to get these values:\n');

  try {
    // Collect required information
    const teamId = await question('Enter your Apple Team ID (10 characters): ');
    const clientId = await question('Enter your Service ID (e.g., com.yourcompany.soapbox.signin): ');
    const keyId = await question('Enter your Key ID from .p8 file: ');
    const privateKeyPath = await question('Enter path to your .p8 private key file: ');

    // Validate inputs
    if (!teamId || teamId.length !== 10) {
      throw new Error('Team ID must be exactly 10 characters');
    }

    if (!clientId || !clientId.includes('.')) {
      throw new Error('Client ID should be in reverse domain format');
    }

    if (!keyId || keyId.length !== 10) {
      throw new Error('Key ID must be exactly 10 characters');
    }

    if (!fs.existsSync(privateKeyPath)) {
      throw new Error(`Private key file not found: ${privateKeyPath}`);
    }

    // Read the private key
    const privateKey = fs.readFileSync(privateKeyPath, 'utf8');
    
    // Validate private key format
    if (!privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
      throw new Error('Invalid private key format. Make sure you\'re using the .p8 file from Apple Developer Console');
    }

    // Generate JWT payload
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      iss: teamId,
      iat: now,
      exp: now + (6 * 30 * 24 * 60 * 60), // 6 months
      aud: 'https://appleid.apple.com',
      sub: clientId,
    };

    // Generate the client secret
    const clientSecret = jwt.sign(payload, privateKey, { 
      algorithm: 'ES256',
      header: {
        alg: 'ES256',
        kid: keyId,
      }
    });

    console.log('\n✅ Apple Client Secret Generated Successfully!\n');
    console.log('Add these environment variables to your Replit secrets:\n');
    console.log(`APPLE_CLIENT_ID=${clientId}`);
    console.log(`APPLE_CLIENT_SECRET=${clientSecret}`);
    console.log('\n🔒 Keep the client secret secure and never commit it to version control.');
    console.log('💡 This token expires in 6 months. Re-run this script to generate a new one.');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.log('\n📚 Need help? Visit: https://developer.apple.com/documentation/sign_in_with_apple');
  } finally {
    rl.close();
  }
}

// Run the generator
if (require.main === module) {
  generateAppleClientSecret();
}

module.exports = { generateAppleClientSecret };