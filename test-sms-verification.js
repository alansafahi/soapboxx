// Test SMS verification functionality
const testPhoneNumber = "+15555551234"; // Test number for demonstration

async function testSMSVerification() {
  try {
    console.log("Testing SMS verification system...");
    
    // Test 1: Check SMS configuration
    const configResponse = await fetch('/api/auth/sms/config', {
      credentials: 'include'
    });
    const config = await configResponse.json();
    console.log("SMS Configuration:", config);
    
    // Test 2: Send verification code
    const sendResponse = await fetch('/api/auth/phone/send-verification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        phoneNumber: testPhoneNumber
      })
    });
    
    const sendResult = await sendResponse.json();
    console.log("Send verification result:", sendResult);
    
    if (sendResult.verificationId) {
      console.log("✓ SMS verification code sent successfully");
      console.log("Verification ID:", sendResult.verificationId);
    } else {
      console.log("SMS send failed:", sendResult.message);
    }
    
  } catch (error) {
    console.error("Test error:", error);
  }
}

// Run test when page loads
if (typeof window !== 'undefined') {
  window.testSMSVerification = testSMSVerification;
  console.log("SMS verification test function loaded");
}