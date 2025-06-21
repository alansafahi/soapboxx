# Google OAuth Redirect URI Fix Guide

## Issue Identified
The Google OAuth application is configured with an old Replit domain callback URL instead of the production domain.

**Current Problem:**
- Production site redirects to: `soapboxsuperapp.replit.app/api/auth/google/callback`
- Correct callback should be: `https://www.soapboxapp.org/api/auth/google/callback`

## Google Cloud Console Configuration Steps

### Step 1: Access Google Cloud Console
1. Go to https://console.cloud.google.com/
2. Select your SoapBox project
3. Navigate to "APIs & Services" > "Credentials"

### Step 2: Edit OAuth 2.0 Client ID
1. Find your OAuth 2.0 Client ID: `435221033929-np303qnu8630q98u086bnt38uqckofph.apps.googleusercontent.com`
2. Click the edit (pencil) icon
3. In the "Authorized redirect URIs" section, look for entries with `soapboxsuperapp.replit.app`

### Step 3: Update Redirect URIs
**Remove old URI:**
```
https://soapboxsuperapp.replit.app/api/auth/google/callback
```

**Add correct production URI:**
```
https://www.soapboxapp.org/api/auth/google/callback
```

### Step 4: Save Changes
1. Click "Save" to update the OAuth configuration
2. Changes may take a few minutes to propagate

## Verification
After updating the Google Cloud Console, test the OAuth flow:
1. Visit: https://www.soapboxapp.org/login
2. Click "Sign in with Google"
3. Should redirect to Google OAuth (no "redirect_uri_mismatch" error)
4. After Google authentication, should return to SoapBox successfully

## Current Configuration Status
- ✅ Server correctly configured with production callback URL
- ❌ Google Cloud Console still has old Replit domain
- 🔧 **Action Required:** Update Google Cloud Console redirect URIs

## Additional Authorized URIs (Optional)
For development testing, you may also want to add:
```
http://localhost:5000/api/auth/google/callback
```

## Expected Result
Once updated, the Google OAuth flow will work correctly on the production site without "redirect_uri_mismatch" errors.