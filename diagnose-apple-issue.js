#!/usr/bin/env node
/**
 * Diagnose Apple Authentication Issue
 * Analyzes the "invalid_client" error and suggests solutions
 */

function diagnoseAppleIssue() {
  console.log('🔍 Diagnosing Apple "Invalid Client" Error...\n');

  console.log('📋 Current Configuration:');
  console.log('✓ Service ID: com.soapboxsuperapp.signin');
  console.log('✓ Team ID: CGQ7FW7J58');
  console.log('✓ Key ID: A9J6FBJP8J');
  console.log('✓ Redirect URI: https://www.soapboxapp.org/auth/callback');
  console.log('✓ JWT Token: Valid until Dec 2025');
  console.log('');

  console.log('❌ Apple Error Response: "Invalid client."');
  console.log('');

  console.log('🔍 Possible Causes of "Invalid Client" Error:');
  console.log('');

  console.log('1. SERVICE ID CONFIGURATION MISMATCH');
  console.log('   - Apple Developer Console shows different Service ID than expected');
  console.log('   - Service ID might not be properly configured for "Sign in with Apple"');
  console.log('   - Domain verification might be incomplete');
  console.log('');

  console.log('2. DOMAIN CONFIGURATION ISSUES');
  console.log('   - Return URLs must exactly match Apple Developer Console');
  console.log('   - Domain "soapboxapp.org" must be verified in Apple Developer');
  console.log('   - Website URLs configuration might be incomplete');
  console.log('');

  console.log('3. SERVICE ID STATUS');
  console.log('   - Service ID might be disabled in Apple Developer Console');
  console.log('   - "Sign in with Apple" capability might not be enabled');
  console.log('   - Service ID might not be associated with correct Bundle ID');
  console.log('');

  console.log('4. CLIENT SECRET ISSUES');
  console.log('   - JWT signature verification failing');
  console.log('   - Wrong Team ID, Key ID, or audience in JWT');
  console.log('   - Private key might not match the one in Apple Developer Console');
  console.log('');

  console.log('🎯 RECOMMENDED SOLUTIONS:');
  console.log('');

  console.log('Option 1: CREATE NEW SERVICE ID');
  console.log('1. Go to Apple Developer Console');
  console.log('2. Create new Service ID: com.soapboxsuperapp.auth');
  console.log('3. Enable "Sign in with Apple"');
  console.log('4. Configure domains: soapboxapp.org, www.soapboxapp.org');
  console.log('5. Set return URL: https://www.soapboxapp.org/auth/callback');
  console.log('6. Generate new client secret with new Service ID');
  console.log('');

  console.log('Option 2: VERIFY EXISTING SERVICE ID');
  console.log('1. Check Apple Developer Console for exact Service ID name');
  console.log('2. Verify "Sign in with Apple" is enabled and configured');
  console.log('3. Confirm domain verification is complete');
  console.log('4. Check return URLs match exactly');
  console.log('');

  console.log('Option 3: USE BUNDLE ID INSTEAD');
  console.log('1. Try using Bundle ID as client ID: com.soapbox.superapp');
  console.log('2. Configure Bundle ID for "Sign in with Apple"');
  console.log('3. Generate client secret with Bundle ID as subject');
  console.log('');

  console.log('📝 Next Steps:');
  console.log('1. Double-check Apple Developer Console Service ID configuration');
  console.log('2. Verify domain verification status');
  console.log('3. Try alternative Service ID or Bundle ID configuration');
  console.log('4. Test with exact Apple Developer Console settings');
}

// Execute the diagnosis
diagnoseAppleIssue();