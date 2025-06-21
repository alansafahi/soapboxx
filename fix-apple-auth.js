/**
 * Fix Apple Sign-In Authentication Issue
 * Generate fresh Apple client secret JWT for current Replit environment
 */

import jwt from 'jsonwebtoken';
import fs from 'fs';

function generateAppleClientSecret() {
  // Apple configuration
  const teamId = 'CGQ7FW7J58';
  const keyId = 'A9J6FBJP8J';
  const clientId = 'app.soapboxsuperapp.signin';
  
  // Read the private key
  const privateKey = `-----BEGIN PRIVATE KEY-----
MIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQgj9COTRoFTCerKU/P
/0WNUvKORA/lqyNTJTpDUAFuYamgCgYIKoZIzj0DAQehRANCAARSa6v/X7tvShag
/Z6KKeACA2z1Uxtp5+H1rxMRrcMAv82pLoXLFmapS07REGzB93CUSPSTY9x3M6wE
Zs4tOgZk
-----END PRIVATE KEY-----`;

  // JWT payload
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: teamId,
    iat: now,
    exp: now + (6 * 30 * 24 * 60 * 60), // 6 months
    aud: 'https://appleid.apple.com',
    sub: clientId
  };

  // JWT header
  const header = {
    alg: 'ES256',
    kid: keyId
  };

  try {
    const token = jwt.sign(payload, privateKey, { header });
    console.log('✅ Apple Client Secret Generated Successfully');
    console.log('🔑 New APPLE_CLIENT_SECRET:');
    console.log(token);
    console.log('\n📝 Copy this token to your APPLE_CLIENT_SECRET environment variable');
    console.log('⏰ Token expires:', new Date((now + (6 * 30 * 24 * 60 * 60)) * 1000).toISOString());
    return token;
  } catch (error) {
    console.error('❌ Failed to generate Apple client secret:', error.message);
    return null;
  }
}

// Generate the token
generateAppleClientSecret();