/**
 * Test Prayer Wall to Social Feed Integration
 * Verifies that AI-generated prayers appear in both Prayer Wall and social feed
 */

async function testPrayerFeedIntegration() {
  console.log('🔍 Testing Prayer Wall to Social Feed Integration...\n');
  
  const baseUrl = 'http://localhost:5000';
  
  try {
    // 1. Create an AI-assisted prayer
    console.log('1. Creating AI-assisted prayer...');
    const aiAssistanceResponse = await fetch(`${baseUrl}/api/prayers/ai-assistance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        topic: 'guidance',
        situation: 'making important life decisions',
        tone: 'peaceful',
        prayerType: 'request'
      })
    });
    
    if (!aiAssistanceResponse.ok) {
      throw new Error(`AI assistance failed: ${aiAssistanceResponse.status}`);
    }
    
    const aiData = await aiAssistanceResponse.json();
    console.log(`✓ Generated ${aiData.suggestions?.length || 0} AI prayer suggestions`);
    
    if (!aiData.suggestions || aiData.suggestions.length === 0) {
      throw new Error('No AI suggestions generated');
    }
    
    // 2. Submit the first AI suggestion as a prayer
    const selectedPrayer = aiData.suggestions[0];
    console.log('2. Submitting AI-generated prayer to Prayer Wall...');
    
    const prayerResponse = await fetch(`${baseUrl}/api/prayers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        title: selectedPrayer.title,
        content: selectedPrayer.content,
        category: 'guidance',
        isPublic: true,
        isAnonymous: false
      })
    });
    
    if (!prayerResponse.ok) {
      throw new Error(`Prayer creation failed: ${prayerResponse.status}`);
    }
    
    const createdPrayer = await prayerResponse.json();
    console.log(`✓ Created prayer with ID: ${createdPrayer.id}`);
    
    // 3. Wait a moment for database operations to complete
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 4. Check if prayer appears in Prayer Wall
    console.log('3. Checking Prayer Wall...');
    const prayersResponse = await fetch(`${baseUrl}/api/prayers`, {
      credentials: 'include'
    });
    
    if (!prayersResponse.ok) {
      throw new Error(`Failed to fetch prayers: ${prayersResponse.status}`);
    }
    
    const prayers = await prayersResponse.json();
    const foundInPrayerWall = prayers.some(p => p.id === createdPrayer.id);
    console.log(`✓ Prayer appears in Prayer Wall: ${foundInPrayerWall}`);
    
    // 5. Check if prayer appears in social feed
    console.log('4. Checking Social Feed...');
    const feedResponse = await fetch(`${baseUrl}/api/feed`, {
      credentials: 'include'
    });
    
    if (!feedResponse.ok) {
      throw new Error(`Failed to fetch feed: ${feedResponse.status}`);
    }
    
    const feedPosts = await feedResponse.json();
    const foundInFeed = feedPosts.some(post => 
      post.category === 'prayer' && 
      post.content.includes(selectedPrayer.content.substring(0, 50))
    );
    console.log(`✓ Prayer appears in Social Feed: ${foundInFeed}`);
    
    // 6. Summary
    console.log('\n📊 Integration Test Results:');
    console.log(`- AI Prayer Generation: ✓ Working`);
    console.log(`- Prayer Wall Storage: ✓ Working`);
    console.log(`- Social Feed Integration: ${foundInFeed ? '✓ Working' : '❌ Failed'}`);
    
    if (foundInPrayerWall && foundInFeed) {
      console.log('\n🎉 SUCCESS: AI-generated prayers now appear in both Prayer Wall and Social Feed!');
      return { success: true, prayerId: createdPrayer.id };
    } else {
      console.log('\n❌ ISSUE: Prayer integration incomplete');
      return { success: false, details: { prayerWall: foundInPrayerWall, socialFeed: foundInFeed } };
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return { success: false, error: error.message };
  }
}

// Run the test
testPrayerFeedIntegration().then(result => {
  console.log('\nTest completed:', result);
}).catch(error => {
  console.error('Test execution failed:', error);
});