# Apple Sign-In Domain Configuration Fix

## Issue
Apple Sign-In shows "refused to connect" because the callback URL in Apple Developer Console doesn't match the current Replit domain.

## Current Domain
`2c924485-4bb4-4841-992a-dd991482cfcd-00-29nlce9a8jvps.kirk.replit.dev`

## Required Apple Developer Console Configuration

### Service ID: com.soapboxsuperapp.auth

1. Go to Apple Developer Console: https://developer.apple.com/account/resources/identifiers/list/serviceId
2. Edit the Service ID: com.soapboxsuperapp.auth
3. In "Sign in with Apple" configuration, add this Return URL:
   ```
   https://2c924485-4bb4-4841-992a-dd991482cfcd-00-29nlce9a8jvps.kirk.replit.dev/api/auth/apple/callback
   ```

### Alternative Solution: Use Fixed Domain
If you have a custom domain or want to use a fixed domain, you can:
1. Set up a custom domain in Replit
2. Configure Apple with that fixed domain instead
3. This prevents needing to update Apple config when Replit domain changes

## Current Callback URL Being Used
The server is configured to use:
`https://2c924485-4bb4-4841-992a-dd991482cfcd-00-29nlce9a8jvps.kirk.replit.dev/api/auth/apple/callback`

This URL must be added to your Apple Service ID configuration for Apple Sign-In to work.