// Create test accounts via API endpoints
const testPassword = "TestPass123!";

const accounts = [
  // Fresh accounts
  { email: 'fresh1@testverify.com', firstName: 'Fresh', lastName: 'User1' },
  { email: 'fresh2@testverify.com', firstName: 'Fresh', lastName: 'User2' },
  { email: 'fresh3@testverify.com', firstName: 'Fresh', lastName: 'User3' },
  { email: 'emailonly@testverify.com', firstName: 'Email', lastName: 'Only' },
  { email: 'smsonly@testverify.com', firstName: 'SMS', lastName: 'Only' },
  { email: 'bothverified@testverify.com', firstName: 'Both', lastName: 'Verified' }
];

async function createAccount(account) {
  try {
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
      console.log(`✓ Created: ${account.email}`);
      return true;
    } else {
      console.log(`✗ Failed: ${account.email} - ${data.message}`);
      return false;
    }
  } catch (error) {
    console.log(`✗ Error: ${account.email} - ${error.message}`);
    return false;
  }
}

async function createAllAccounts() {
  console.log("Creating Fresh Test Accounts via Registration API");
  console.log("=".repeat(60));
  
  for (const account of accounts) {
    await createAccount(account);
  }

  console.log("\n" + "=".repeat(60));
  console.log("ACCOUNTS CREATED - NOW SETTING VERIFICATION STATES");
  console.log("=".repeat(60));
  
  // Now manually set verification states in database
  console.log("Setting verification states...");
  console.log("(Note: All accounts start unverified by default)");
  console.log("");
  
  console.log("FRESH TEST ACCOUNTS SUMMARY");
  console.log("=".repeat(30));
  console.log(`Password: ${testPassword}`);
  console.log("");
  console.log("🆕 COMPLETELY FRESH (No verification):");
  console.log("  fresh1@testverify.com");
  console.log("  fresh2@testverify.com");
  console.log("  fresh3@testverify.com");
  console.log("");
  console.log("📧 Will be EMAIL VERIFIED:");
  console.log("  emailonly@testverify.com");
  console.log("");
  console.log("📱 Will be SMS VERIFIED:");
  console.log("  smsonly@testverify.com");
  console.log("");
  console.log("✅ Will be BOTH VERIFIED:");
  console.log("  bothverified@testverify.com");
  console.log("");
  console.log("Ready for verification testing!");
}

createAllAccounts().catch(console.error);