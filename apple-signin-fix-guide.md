# Apple Sign-In Fix Guide - COMPLETE SOLUTION

## Root Cause Identified
Apple Sign-In returns "Invalid client" error because the Service ID configuration in Apple Developer Console doesn't include the current Replit callback URL.

## Current Environment Details
- **Replit Domain**: `2c924485-4bb4-4841-992a-dd991482cfcd-00-29nlce9a8jvps.kirk.replit.dev`
- **Apple Client ID**: `app.soapboxsuperapp.signin`
- **Required Callback URL**: `https://2c924485-4bb4-4841-992a-dd991482cfcd-00-29nlce9a8jvps.kirk.replit.dev/api/auth/apple/callback`

## Apple Developer Console Configuration Steps

### Step 1: Access Apple Developer Console
1. Go to https://developer.apple.com/account/resources/identifiers/list/serviceId
2. Sign in with your Apple Developer account

### Step 2: Edit Service ID Configuration
1. Find and click on Service ID: `com.soapboxsuperapp.auth`
2. Click "Configure" next to "Sign in with Apple"
3. Under "Return URLs", add this exact URL:
   ```
   https://soapboxsuperapp.com/auth/callback
   ```
4. Click "Save" and then "Continue"
5. Click "Save" again to confirm changes

### Step 3: Verify Configuration
After updating Apple Developer Console, test the Apple Sign-In flow:
```bash
curl -v "http://localhost:5000/api/auth/apple" -L
```

The response should no longer contain "Invalid client" error.

## Technical Implementation Status
✅ **Fresh JWT Client Secret Generated**: Token expires December 18, 2025
✅ **Authentication Strategy Configured**: Passport Apple strategy operational
✅ **Callback Routes Implemented**: `/api/auth/apple` and `/api/auth/apple/callback`
✅ **Environment Variables Set**: APPLE_CLIENT_ID and APPLE_CLIENT_SECRET configured

## Only Remaining Issue
❌ **Apple Developer Console Domain Configuration**: Current Replit domain not added to Service ID Return URLs

## Expected Result After Fix
Once the callback URL is added to Apple Developer Console:
1. Apple Sign-In button will redirect to Apple's authentication page
2. Users can sign in with their Apple ID
3. Apple will redirect back to SoapBox with authentication token
4. New user accounts will be created automatically
5. Existing users will be logged in successfully

## Alternative Solution: Fixed Domain
For production deployment, consider using a custom domain:
1. Configure custom domain in Replit (e.g., `auth.soapboxapp.org`)
2. Update Apple Service ID with fixed domain callback URL
3. This prevents needing to update Apple config when Replit domains change

## Test Verification
After Apple Developer Console update, successful authentication will show:
- Redirect to Apple ID sign-in page (instead of "Invalid client" error)
- Successful callback to `/api/auth/apple/callback`
- User creation/login in SoapBox database
- Authenticated session established