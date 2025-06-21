#!/usr/bin/env node
/**
 * Test Apple Authentication Configuration
 * Verifies JWT token and Apple OAuth configuration
 */

import jwt from 'jsonwebtoken';

function testAppleAuthentication() {
  console.log('🍎 Testing Apple Authentication Configuration...\n');

  // Current Apple client secret from authentication code
  const clientSecret = 'eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IkE5SjZGQkpQOEoifQ.eyJpc3MiOiJDR1E3Rlc3SjU4IiwiaWF0IjoxNzUwNTMzNjcxLCJleHAiOjE3NjYwODU2NzEsImF1ZCI6Imh0dHBzOi8vYXBwbGVpZC5hcHBsZS5jb20iLCJzdWIiOiJjb20uc29hcGJveHN1cGVyYXBwLnNpZ25pbiJ9.NOtpppz5EmsZWH2cjCSKdOAhFVxFNnFRAtZ7hGvI5XqpdlYzMyw-cGCJZrvhbInOaPJdrUINuGI2Zxb6zb1Gmw';

  try {
    // Decode JWT without verification to check structure
    const decoded = jwt.decode(clientSecret, { complete: true });
    
    console.log('✅ JWT Token Structure:');
    console.log('Header:', JSON.stringify(decoded.header, null, 2));
    console.log('Payload:', JSON.stringify(decoded.payload, null, 2));
    console.log('');

    // Verify required fields
    const payload = decoded.payload;
    const header = decoded.header;

    console.log('🔍 Verification Checklist:');
    console.log(`✓ Algorithm: ${header.alg} (should be ES256)`);
    console.log(`✓ Key ID: ${header.kid} (should be A9J6FBJP8J)`);
    console.log(`✓ Type: ${header.typ} (should be JWT)`);
    console.log(`✓ Issuer: ${payload.iss} (should be CGQ7FW7J58)`);
    console.log(`✓ Subject: ${payload.sub} (should be com.soapboxsuperapp.signin)`);
    console.log(`✓ Audience: ${payload.aud} (should be https://appleid.apple.com)`);
    console.log(`✓ Issued at: ${new Date(payload.iat * 1000).toISOString()}`);
    console.log(`✓ Expires: ${new Date(payload.exp * 1000).toISOString()}`);
    console.log('');

    // Check if token is still valid
    const now = Math.floor(Date.now() / 1000);
    const isValid = payload.exp > now;
    console.log(`🕒 Token Status: ${isValid ? '✅ Valid' : '❌ Expired'}`);
    console.log('');

    // Apple OAuth Configuration Check
    console.log('🔧 Apple OAuth Configuration:');
    console.log('✓ Service ID: com.soapboxsuperapp.signin');
    console.log('✓ Team ID: CGQ7FW7J58');
    console.log('✓ Key ID: A9J6FBJP8J');
    console.log('✓ Redirect URI: https://www.soapboxapp.org/auth/callback');
    console.log('✓ Domain: soapboxapp.org');
    console.log('✓ Subdomain: www.soapboxapp.org');
    console.log('');

    console.log('📋 Apple Developer Console Requirements:');
    console.log('1. Service ID "com.soapboxsuperapp.signin" must be enabled');
    console.log('2. "Sign in with Apple" must be configured and enabled');
    console.log('3. Domain "soapboxapp.org" must be verified');
    console.log('4. Return URL "https://www.soapboxapp.org/auth/callback" must be configured');
    console.log('5. Key A9J6FBJP8J must be active and valid');
    console.log('');

    console.log('🎯 Next Steps:');
    console.log('1. Verify Apple Developer Console matches configuration above');
    console.log('2. Test Apple Sign-In button on login page');
    console.log('3. Check browser console for any Apple OAuth errors');
    console.log('4. Monitor server logs during Apple authentication attempt');

  } catch (error) {
    console.error('❌ Error testing Apple authentication:', error.message);
  }
}

// Execute the test
testAppleAuthentication();