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
  console.log("Creating Comprehensive Verification Test Accounts");
  console.log("=".repeat(60));
  console.log(`Password for ALL accounts: ${testPassword}`);
  console.log("");

  for (const account of testAccounts) {
    try {
      console.log(`Creating ${account.email} (${account.stage})...`);
      
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
        console.log(`✓ Account created: ${account.email}`);
        
        // Now set verification status based on stage
        await setVerificationStage(account.email, account.stage);
        
      } else {
        console.log(`✗ Failed to create ${account.email}: ${data.message}`);
      }
      
    } catch (error) {
      console.log(`✗ Error creating ${account.email}: ${error.message}`);
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("VERIFICATION TEST ACCOUNTS SUMMARY");
  console.log("=".repeat(60));
  console.log(`Password: ${testPassword}`);
  console.log("");
  
  console.log("FRESH/NEW ACCOUNTS (No verification):");
  console.log("  fresh1@testverify.com");
  console.log("  fresh2@testverify.com");
  console.log("  fresh3@testverify.com");
  console.log("");
  
  console.log("PARTIAL VERIFICATION:");
  console.log("  emailonly@testverify.com (Email ✓, SMS ✗)");
  console.log("  smsonly@testverify.com (Email ✗, SMS ✓)");
  console.log("");
  
  console.log("FULL VERIFICATION:");
  console.log("  bothverified@testverify.com (Email ✓, SMS ✓)");
  console.log("");
  
  console.log("Ready for comprehensive verification testing!");
}

async function setVerificationStage(email, stage) {
  const baseUrl = 'http://localhost:5000';
  
  try {
    switch (stage) {
      case "new":
        // Already unverified by default
        console.log(`  → ${email}: Left as unverified`);
        break;
        
      case "email_verified":
        await fetch(`${baseUrl}/api/debug/verify-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        console.log(`  → ${email}: Email verified`);
        break;
        
      case "sms_verified":
        // Add phone number and verify SMS
        await fetch(`${baseUrl}/api/debug/set-phone-verified`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, phone: '+15551234567' })
        });
        console.log(`  → ${email}: SMS verified`);
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
        console.log(`  → ${email}: Both email and SMS verified`);
        break;
    }
  } catch (error) {
    console.log(`  ✗ Failed to set verification stage for ${email}: ${error.message}`);
  }
}

createTestAccounts().catch(console.error);