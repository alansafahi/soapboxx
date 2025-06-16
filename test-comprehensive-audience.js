/**
 * Comprehensive Audience Testing Suite for SoapBox Super App
 * Tests all post types with different audience settings
 */

const BASE_URL = 'http://localhost:5000';

class AudienceTestSuite {
  constructor() {
    this.results = [];
    this.createdPosts = [];
  }

  async runTest(testName, testFunction) {
    console.log(`\n🧪 Running: ${testName}`);
    try {
      const result = await testFunction();
      this.results.push({ test: testName, status: 'PASS', result });
      console.log(`✅ ${testName}: PASS`);
      return result;
    } catch (error) {
      this.results.push({ test: testName, status: 'FAIL', error: error.message });
      console.log(`❌ ${testName}: FAIL - ${error.message}`);
      throw error;
    }
  }

  async testPrivatePost() {
    return this.runTest('Private Post Creation', async () => {
      const response = await fetch(`${BASE_URL}/api/feed/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          content: 'This is my private journal entry for testing. Only I should see this.',
          audience: 'private',
          mood: 'reflective'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const post = await response.json();
      this.createdPosts.push(post);

      // Verify title
      if (post.title !== 'Private Journal') {
        throw new Error(`Expected title "Private Journal", got "${post.title}"`);
      }

      // Verify audience
      if (post.audience !== 'private') {
        throw new Error(`Expected audience "private", got "${post.audience}"`);
      }

      return { 
        id: post.id, 
        title: post.title, 
        audience: post.audience,
        content: post.content
      };
    });
  }

  async testChurchPost() {
    return this.runTest('Church Post Creation', async () => {
      const response = await fetch(`${BASE_URL}/api/feed/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          content: 'This is for my church family only. Testing church audience setting.',
          audience: 'church',
          mood: 'grateful'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const post = await response.json();
      this.createdPosts.push(post);

      // Verify title
      if (post.title !== 'Church Share') {
        throw new Error(`Expected title "Church Share", got "${post.title}"`);
      }

      // Verify audience
      if (post.audience !== 'church') {
        throw new Error(`Expected audience "church", got "${post.audience}"`);
      }

      return { 
        id: post.id, 
        title: post.title, 
        audience: post.audience,
        content: post.content
      };
    });
  }

  async testPublicPost() {
    return this.runTest('Public Post Creation', async () => {
      const response = await fetch(`${BASE_URL}/api/feed/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          content: 'This is a public post that everyone on SoapBox can see. Testing public audience.',
          audience: 'public',
          mood: 'joyful'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const post = await response.json();
      this.createdPosts.push(post);

      // Verify title
      if (post.title !== 'Community Share') {
        throw new Error(`Expected title "Community Share", got "${post.title}"`);
      }

      // Verify audience
      if (post.audience !== 'public') {
        throw new Error(`Expected audience "public", got "${post.audience}"`);
      }

      return { 
        id: post.id, 
        title: post.title, 
        audience: post.audience,
        content: post.content
      };
    });
  }

  async testFeedRetrieval() {
    return this.runTest('Feed Retrieval and Verification', async () => {
      const response = await fetch(`${BASE_URL}/api/feed`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const feedPosts = await response.json();
      
      // Find our created posts in the feed
      const foundPosts = [];
      const recentPosts = feedPosts.slice(0, 20); // Check recent posts

      for (const createdPost of this.createdPosts) {
        const foundPost = recentPosts.find(fp => fp.id === createdPost.id);
        if (foundPost) {
          foundPosts.push({
            id: foundPost.id,
            title: foundPost.title,
            audience: foundPost.audience,
            expectedTitle: createdPost.title,
            titleMatch: foundPost.title === createdPost.title
          });
        }
      }

      if (foundPosts.length !== this.createdPosts.length) {
        throw new Error(`Expected ${this.createdPosts.length} posts in feed, found ${foundPosts.length}`);
      }

      // Verify all titles match
      const incorrectTitles = foundPosts.filter(p => !p.titleMatch);
      if (incorrectTitles.length > 0) {
        throw new Error(`Title mismatches: ${incorrectTitles.map(p => `ID ${p.id}: expected "${p.expectedTitle}", got "${p.title}"`).join(', ')}`);
      }

      return {
        totalFound: foundPosts.length,
        correctTitles: foundPosts.filter(p => p.titleMatch).length,
        posts: foundPosts
      };
    });
  }

  async testAudienceFiltering() {
    return this.runTest('Audience Filtering Logic', async () => {
      const response = await fetch(`${BASE_URL}/api/feed`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const feedPosts = await response.json();
      const recentPosts = feedPosts.slice(0, 20);
      
      // Check audience indicators are present
      const audienceTypes = ['public', 'church', 'private'];
      const foundAudienceTypes = new Set();

      recentPosts.forEach(post => {
        if (post.audience && audienceTypes.includes(post.audience)) {
          foundAudienceTypes.add(post.audience);
        }
      });

      return {
        foundAudienceTypes: Array.from(foundAudienceTypes),
        totalPosts: recentPosts.length,
        postsWithAudience: recentPosts.filter(p => p.audience).length
      };
    });
  }

  generateReport() {
    console.log('\n📊 COMPREHENSIVE AUDIENCE TEST REPORT');
    console.log('=====================================');
    
    const passCount = this.results.filter(r => r.status === 'PASS').length;
    const failCount = this.results.filter(r => r.status === 'FAIL').length;
    
    console.log(`Total Tests: ${this.results.length}`);
    console.log(`Passed: ${passCount}`);
    console.log(`Failed: ${failCount}`);
    console.log(`Success Rate: ${((passCount / this.results.length) * 100).toFixed(1)}%`);

    console.log('\n📝 Test Details:');
    this.results.forEach(result => {
      const status = result.status === 'PASS' ? '✅' : '❌';
      console.log(`${status} ${result.test}`);
      if (result.status === 'FAIL') {
        console.log(`   Error: ${result.error}`);
      }
    });

    console.log('\n📋 Created Posts Summary:');
    this.createdPosts.forEach(post => {
      console.log(`• ID ${post.id}: "${post.title}" (${post.audience})`);
    });

    // Expected vs Actual mapping
    console.log('\n🎯 Audience Title Mapping Verification:');
    const expectedMapping = {
      'private': 'Private Journal',
      'church': 'Church Share', 
      'public': 'Community Share'
    };

    Object.entries(expectedMapping).forEach(([audience, expectedTitle]) => {
      const post = this.createdPosts.find(p => p.audience === audience);
      if (post) {
        const match = post.title === expectedTitle;
        console.log(`${match ? '✅' : '❌'} ${audience}: Expected "${expectedTitle}", Got "${post.title}"`);
      } else {
        console.log(`⚠️  ${audience}: No test post created`);
      }
    });

    const allTestsPassed = failCount === 0;
    console.log(`\n🏆 OVERALL RESULT: ${allTestsPassed ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'}`);
    
    return {
      success: allTestsPassed,
      totalTests: this.results.length,
      passedTests: passCount,
      failedTests: failCount,
      createdPosts: this.createdPosts.length
    };
  }

  async runAllTests() {
    console.log('🚀 Starting Comprehensive Audience Testing Suite...');
    
    try {
      // Test each audience type
      await this.testPrivatePost();
      await this.testChurchPost();
      await this.testPublicPost();
      
      // Wait a moment for posts to be indexed
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Test feed retrieval
      await this.testFeedRetrieval();
      await this.testAudienceFiltering();
      
      return this.generateReport();
    } catch (error) {
      console.error('\n💥 Test suite encountered critical error:', error.message);
      this.generateReport();
      throw error;
    }
  }
}

// Run the test suite
async function runAudienceTests() {
  const testSuite = new AudienceTestSuite();
  try {
    const report = await testSuite.runAllTests();
    
    if (report.success) {
      console.log('\n🎉 SUCCESS: All audience functionality working correctly!');
      console.log('✓ Private posts show "Private Journal"');
      console.log('✓ Church posts show "Church Share"'); 
      console.log('✓ Public posts show "Community Share"');
      console.log('✓ Feed displays posts with correct audience indicators');
    } else {
      console.log('\n⚠️  ISSUES DETECTED: Some audience functionality needs attention');
    }
    
    return report;
  } catch (error) {
    console.error('\n❌ CRITICAL ERROR: Audience system test failed');
    return { success: false, error: error.message };
  }
}

// Run tests immediately
runAudienceTests().catch(console.error);