// Test Community Administration API endpoints directly
import fetch from 'node-fetch';

async function testCommunityAdminAPI() {
  const baseURL = 'http://localhost:5000';
  
  try {
    console.log('Testing Community Administration API endpoints...\n');
    
    // Test the churches endpoint directly without authentication
    console.log('1. Testing /api/communities endpoint...');
    const communitiesResponse = await fetch(`${baseURL}/api/communities`);
    console.log(`Status: ${communitiesResponse.status}`);
    
    if (communitiesResponse.status === 200) {
      const communities = await communitiesResponse.json();
      console.log(`Found ${communities.length} communities in database`);
      if (communities.length > 0) {
        console.log(`First community: ${communities[0].name} (ID: ${communities[0].id})`);
      }
    } else {
      const error = await communitiesResponse.text();
      console.log(`Error: ${error}`);
    }
    
    console.log('\n2. Testing direct database connection...');
    // Test if we can get specific community data
    const testCommunityResponse = await fetch(`${baseURL}/api/churches/2814`);
    console.log(`Community 2814 Status: ${testCommunityResponse.status}`);
    
    if (testCommunityResponse.status !== 200) {
      const error = await testCommunityResponse.text();
      console.log(`Error: ${error}`);
    } else {
      const community = await testCommunityResponse.json();
      console.log(`Community 2814: ${community.name}`);
    }
    
    console.log('\n3. Testing user authentication status...');
    const authResponse = await fetch(`${baseURL}/api/auth/user`);
    console.log(`Auth Status: ${authResponse.status}`);
    
    console.log('\nAPI endpoint tests completed.');
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testCommunityAdminAPI();