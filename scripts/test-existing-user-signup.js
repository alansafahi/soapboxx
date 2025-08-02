// Test the existing user signup error handling
const testEmail = "testuser@example.com"; // This user already exists
const testData = {
  email: testEmail,
  password: "TestPass123!",
  firstName: "Test",
  lastName: "User",
  role: "Member"
};

console.log("Testing Existing User Signup Error Handling");
console.log("===========================================");
console.log(`Attempting to register with existing email: ${testEmail}`);

fetch('http://localhost:5000/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(testData)
})
.then(res => {
  console.log(`Response Status: ${res.status}`);
  return res.json();
})
.then(data => {
  console.log("Registration Response:", data);
  
  if (data.success === false && data.errorType === 'account_exists') {
    console.log("✓ Correct error handling detected!");
    console.log("✓ Error Type:", data.errorType);
    console.log("✓ Suggested Action:", data.suggestedAction);
    console.log("✓ User-friendly message:", data.message);
    
    console.log("\n✓ Frontend should redirect to login page");
    console.log("✓ Onboarding flow error handling working correctly");
  } else {
    console.log("✗ Unexpected response format");
  }
})
.catch(error => {
  console.error("✗ Request failed:", error.message);
});