# Apple Sign-In Troubleshooting Guide

## Current Issue: "Refused to Connect"

The Apple Sign-In authentication is encountering connection issues despite proper configuration. This typically indicates one of several possible issues:

## Potential Issues and Solutions:

### 1. Apple Developer Console Configuration
**Required Settings:**
- Service ID: `com.soapboxsuperapp.auth`
- Domains: `2c924485-4bb4-4841-992a-dd991482cfcd-00-29nlce9a8jvps.kirk.replit.dev`
- Return URLs: `https://2c924485-4bb4-4841-992a-dd991482cfcd-00-29nlce9a8jvps.kirk.replit.dev/api/auth/apple/callback`

### 2. App ID Configuration
Verify that your App ID has "Sign in with Apple" capability enabled:
- Go to: https://developer.apple.com/account/resources/identifiers/list
- Find your App ID
- Ensure "Sign in with Apple" is checked and configured

### 3. Key Configuration
Verify the Apple Key (A9J6FBJP8J) is:
- Enabled for "Sign in with Apple"
- Associated with the correct App ID
- Not expired or revoked

### 4. Team ID Verification
Confirm Team ID `CG0TWJ58` is correct and active

### 5. Propagation Time
Apple Developer Console changes can take 15-30 minutes to propagate globally

## Alternative Authentication Testing

While troubleshooting Apple Sign-In, users can authenticate using:
1. Email/Password registration and login
2. Google OAuth (already configured and working)

## Next Steps
1. Double-check all Apple Developer Console settings
2. Wait 30 minutes for propagation
3. Test with a different browser/incognito mode
4. Verify Apple Developer account status