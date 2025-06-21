/**
 * Apple Sign-In Client Secret Generator
 * Generates JWT token for Apple authentication
 */

const jwt = require('jsonwebtoken');
const fs = require('fs');

function generateAppleClientSecret(config) {
  const {
    teamId,        // Your Apple Developer Team ID (10 characters)
    clientId,      // Your Service ID (e.g., com.yourcompany.soapbox.signin)
    keyId,         // Key ID from the downloaded .p8 file
    privateKeyPath // Path to your .p8 private key file
  } = config;

  try {
    // Read the private key file
    const privateKey = fs.readFileSync(privateKeyPath, 'utf8');

    // JWT payload
    const payload = {
      iss: teamId,          // Issuer (Team ID)
      iat: Math.floor(Date.now() / 1000),        // Issued at
      exp: Math.floor(Date.now() / 1000) + 3600, // Expires in 1 hour
      aud: 'https://appleid.apple.com',          // Audience
      sub: clientId,        // Subject (Service ID)
    };

    // JWT header
    const header = {
      alg: 'ES256',
      kid: keyId,
    };

    // Generate the JWT
    const clientSecret = jwt.sign(payload, privateKey, { 
      algorithm: 'ES256',
      header: header
    });

    return clientSecret;
  } catch (error) {
    console.error('Error generating Apple Client Secret:', error.message);
    return null;
  }
}

// Example usage:
function exampleUsage() {
  console.log(`
Apple Sign-In Setup Instructions:

1. Go to developer.apple.com
2. Create App ID with "Sign In with Apple" enabled
3. Create Service ID for web authentication
4. Generate a private key (.p8 file) with "Sign In with Apple" enabled
5. Download the .p8 file and note the Key ID

Then run this script with your credentials:

const config = {
  teamId: 'XXXXXXXXXX',           // Your 10-character Team ID
  clientId: 'com.yourcompany.soapbox.signin',  // Your Service ID
  keyId: 'YYYYYYYYYY',            // Key ID from .p8 file
  privateKeyPath: './path/to/AuthKey_YYYYYYYYYY.p8'  // Path to .p8 file
};

const clientSecret = generateAppleClientSecret(config);
console.log('APPLE_CLIENT_SECRET:', clientSecret);
`);
}

// If running directly, show instructions
if (require.main === module) {
  exampleUsage();
}

module.exports = { generateAppleClientSecret };