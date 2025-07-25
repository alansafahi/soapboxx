// Test script for user search endpoint
const { searchUsers } = require('./server/storage');

async function testSearch() {
  try {
    console.log('Testing searchUsers function...');
    
    // Test the storage function directly
    const results = await searchUsers('alan');
    
    console.log('Search results for "alan":', results);
    console.log('Number of results:', results.length);
    
    if (results.length > 0) {
      console.log('First result:', {
        id: results[0].id,
        email: results[0].email,
        firstName: results[0].firstName,
        lastName: results[0].lastName
      });
    }
    
  } catch (error) {
    console.error('Search test failed:', error);
  }
}

testSearch();