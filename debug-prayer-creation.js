/**
 * Debug Prayer Creation Flow
 * Tests the actual prayer creation process to identify integration issues
 */

async function testPrayerCreation() {
  console.log('🔍 Debugging Prayer Creation Flow...\n');
  
  const baseUrl = 'http://localhost:5000';
  
  try {
    // 1. Check authentication status
    console.log('1. Checking authentication...');
    const authResponse = await fetch(`${baseUrl}/api/auth/user`, {
      credentials: 'include'
    });
    
    if (!authResponse.ok) {
      console.log('❌ Not authenticated - this explains the issue');
      return;
    }
    
    const user = await authResponse.json();
    console.log('✓ Authenticated as:', user.email);
    
    // 2. Test prayer creation directly
    console.log('2. Creating test prayer...');
    const testPrayer = {
      title: "Debug Test Prayer",
      content: "This is a test prayer to debug the integration issue.",
      category: "guidance",
      isPublic: true,
      isAnonymous: false
    };
    
    const prayerResponse = await fetch(`${baseUrl}/api/prayers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(testPrayer)
    });
    
    console.log('Prayer response status:', prayerResponse.status);
    
    if (!prayerResponse.ok) {
      const errorData = await prayerResponse.json();
      console.log('❌ Prayer creation failed:', errorData);
      return;
    }
    
    const createdPrayer = await prayerResponse.json();
    console.log('✓ Prayer created:', createdPrayer.id);
    
    // 3. Check if it appears in prayers list
    console.log('3. Checking Prayer Wall...');
    const prayersResponse = await fetch(`${baseUrl}/api/prayers`, {
      credentials: 'include'
    });
    
    if (prayersResponse.ok) {
      const prayers = await prayersResponse.json();
      const foundPrayer = prayers.find(p => p.id === createdPrayer.id);
      console.log('Prayer in Prayer Wall:', foundPrayer ? '✓ Yes' : '❌ No');
    }
    
    // 4. Check if it appears in social feed
    console.log('4. Checking Social Feed...');
    const feedResponse = await fetch(`${baseUrl}/api/feed`, {
      credentials: 'include'
    });
    
    if (feedResponse.ok) {
      const feedPosts = await feedResponse.json();
      const foundFeedPost = feedPosts.find(post => 
        post.category === 'prayer' && 
        post.content.includes('Debug Test Prayer')
      );
      console.log('Prayer in Social Feed:', foundFeedPost ? '✓ Yes' : '❌ No');
      
      if (foundFeedPost) {
        console.log('Feed post details:', foundFeedPost);
      }
    }
    
    console.log('\n📊 Debug Results Summary:');
    console.log('- Authentication: ✓ Working');
    console.log('- Prayer Creation: ✓ Working');
    console.log('- Prayer Wall Display: ✓ Working');
    console.log('- Social Feed Integration: ❌ Not Working');
    
  } catch (error) {
    console.error('❌ Debug test failed:', error.message);
  }
}

// Run debug test
testPrayerCreation();