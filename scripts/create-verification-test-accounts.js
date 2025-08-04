// Create comprehensive test accounts for verification testing
const testPassword = "TestPass123!";

const testAccounts = [
  // Brand new accounts - never been in system
  { email: "fresh1@testverify.com", firstName: "Fresh", lastName: "User1", stage: "new" },
  { email: "fresh2@testverify.com", firstName: "Fresh", lastName: "User2", stage: "new" },
  { email: "fresh3@testverify.com", firstName: "Fresh", lastName: "User3", stage: "new" },
  
  // Accounts for different verification stages
  { email: "emailonly@testverify.com", firstName: "Email", lastName: "Only", stage: "email_verified" },
  { email: "smsonly@testverify.com", firstName: "SMS", lastName: "Only", stage: "sms_verified" },
  { email: "bothverified@testverify.com", firstName: "Both", lastName: "Verified", stage: "both_verified" }
];

async function createTestAccounts() {
  // Creating test accounts for verification system

  for (const account of testAccounts) {
    try {

      
      // Create account via registration endpoint
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: account.email,
          password: testPassword,
          firstName: account.firstName,
          lastName: account.lastName,
          role: 'member'
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        // Account created successfully
        await setVerificationStage(account.email, account.stage);
      } else {
        // Failed to create account
      }
      
    } catch (error) {
      // Error creating account
    }
  }

  // Test accounts created successfully
  
  // Partial verification accounts available
  // Verification test accounts setup complete
}

async function setVerificationStage(email, stage) {
  const baseUrl = 'http://localhost:5000';
  
  try {
    switch (stage) {
      case "new":
        // Already unverified by default

        break;
        
      case "email_verified":
        await fetch(`${baseUrl}/api/debug/verify-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });

        break;
        
      case "sms_verified":
        // Add phone number and verify SMS
        await fetch(`${baseUrl}/api/debug/set-phone-verified`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, phone: '+15551234567' })
        });

        break;
        
      case "both_verified":
        // Verify both email and SMS
        await fetch(`${baseUrl}/api/debug/verify-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        await fetch(`${baseUrl}/api/debug/set-phone-verified`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, phone: '+15551234568' })
        });

        break;
    }
  } catch (error) {
    // Failed to set verification stage
  }
}

createTestAccounts().catch(() => {
  // Error handled silently
});