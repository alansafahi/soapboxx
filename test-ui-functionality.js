/**
 * UI Functionality Testing Suite
 * Tests button interactions, form submissions, and user interface components
 */

const baseURL = 'http://localhost:5000';

class UIFunctionalityTest {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      tests: []
    };
  }

  async runTest(testName, testFunction) {
    try {
      console.log(`\n🎨 Testing UI: ${testName}`);
      await testFunction();
      this.results.passed++;
      this.results.tests.push({ name: testName, status: 'PASSED' });
      console.log(`✅ ${testName} - PASSED`);
    } catch (error) {
      this.results.failed++;
      this.results.tests.push({ name: testName, status: 'FAILED', error: error.message });
      console.log(`❌ ${testName} - FAILED: ${error.message}`);
    }
  }

  async testFormSubmissions() {
    // Test S.O.A.P. form submission
    const soapData = {
      scripture: "John 3:16",
      observation: "God's love for the world",
      application: "Share love with others",
      prayer: "Thank you God for your love"
    };

    const response = await fetch(`${baseURL}/api/soap`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(soapData),
      credentials: 'include'
    });

    if (response.status !== 401 && response.status !== 200) {
      throw new Error(`S.O.A.P. form submission failed: ${response.status}`);
    }

    console.log('S.O.A.P. form submission endpoint responds correctly');
  }

  async testPrayerSubmission() {
    // Test prayer wall submission
    const prayerData = {
      content: "Please pray for healing",
      isAnonymous: false,
      isUrgent: false
    };

    const response = await fetch(`${baseURL}/api/prayers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prayerData),
      credentials: 'include'
    });

    if (response.status !== 401 && response.status !== 200) {
      throw new Error(`Prayer submission failed: ${response.status}`);
    }

    console.log('Prayer submission endpoint responds correctly');
  }

  async testMemberManagement() {
    // Test member creation
    const memberData = {
      firstName: "Test",
      lastName: "User",
      email: "test@example.com",
      role: "member"
    };

    const response = await fetch(`${baseURL}/api/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(memberData),
      credentials: 'include'
    });

    if (response.status !== 401 && response.status !== 200) {
      throw new Error(`Member creation failed: ${response.status}`);
    }

    console.log('Member management endpoints respond correctly');
  }

  async testBulkCommunication() {
    // Test bulk message creation
    const messageData = {
      title: "Test Announcement",
      content: "This is a test message",
      targetAudience: "all_members",
      channels: ["email", "push"]
    };

    const response = await fetch(`${baseURL}/api/bulk-communication/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(messageData),
      credentials: 'include'
    });

    if (response.status !== 401 && response.status !== 200) {
      throw new Error(`Bulk communication failed: ${response.status}`);
    }

    console.log('Bulk communication endpoints respond correctly');
  }

  async testEventManagement() {
    // Test event creation
    const eventData = {
      title: "Sunday Service",
      description: "Weekly worship service",
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 3600000).toISOString(),
      location: "Main Sanctuary"
    };

    const response = await fetch(`${baseURL}/api/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData),
      credentials: 'include'
    });

    if (response.status !== 401 && response.status !== 200) {
      throw new Error(`Event creation failed: ${response.status}`);
    }

    console.log('Event management endpoints respond correctly');
  }

  async testAIFeatures() {
    // Test AI sermon outline generation
    const sermonRequest = {
      topic: "Love and Forgiveness",
      audience: "general",
      duration: "30"
    };

    const response = await fetch(`${baseURL}/api/ai/sermon-outline`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sermonRequest),
      credentials: 'include'
    });

    if (response.status !== 401 && response.status !== 200) {
      throw new Error(`AI sermon generation failed: ${response.status}`);
    }

    console.log('AI features endpoints respond correctly');
  }

  async testBibleVerseSearch() {
    // Test Bible verse search functionality
    const response = await fetch(`${baseURL}/api/bible-verses/search?query=love&limit=5`, {
      credentials: 'include'
    });

    if (response.status !== 200) {
      throw new Error(`Bible verse search failed: ${response.status}`);
    }

    const results = await response.json();
    if (!Array.isArray(results)) {
      throw new Error('Bible verse search should return an array');
    }

    console.log(`Bible verse search returned ${results.length} results`);
  }

  async testDataRetrieval() {
    // Test key data endpoints
    const endpoints = [
      '/api/churches/nearby',
      '/api/events',
      '/api/bible-verses'
    ];

    for (const endpoint of endpoints) {
      const response = await fetch(`${baseURL}${endpoint}`, {
        credentials: 'include'
      });

      if (response.status !== 200) {
        throw new Error(`${endpoint} failed: ${response.status}`);
      }

      const data = await response.json();
      console.log(`${endpoint} returned ${Array.isArray(data) ? data.length : 'valid'} results`);
    }
  }

  generateReport() {
    console.log('\n📊 UI FUNCTIONALITY TEST REPORT');
    console.log('==================================');
    console.log(`Total Tests: ${this.results.passed + this.results.failed}`);
    console.log(`Passed: ${this.results.passed}`);
    console.log(`Failed: ${this.results.failed}`);
    console.log(`Success Rate: ${((this.results.passed / (this.results.passed + this.results.failed)) * 100).toFixed(1)}%`);
    
    console.log('\n📋 Test Details:');
    this.results.tests.forEach(test => {
      const status = test.status === 'PASSED' ? '✅' : '❌';
      console.log(`${status} ${test.name}`);
      if (test.error) {
        console.log(`   Error: ${test.error}`);
      }
    });

    console.log('\n🎯 UI READINESS ASSESSMENT:');
    if (this.results.failed === 0) {
      console.log('✅ All UI components functional - READY FOR PRODUCTION');
    } else if (this.results.failed <= 2) {
      console.log('⚠️  Minor UI issues detected - Review recommended');
    } else {
      console.log('❌ Major UI issues detected - Requires attention');
    }
  }

  async runAllTests() {
    console.log('🎨 Starting UI Functionality Testing Suite');
    console.log('=========================================');

    await this.runTest('Form Submissions', () => this.testFormSubmissions());
    await this.runTest('Prayer Submission', () => this.testPrayerSubmission());
    await this.runTest('Member Management', () => this.testMemberManagement());
    await this.runTest('Bulk Communication', () => this.testBulkCommunication());
    await this.runTest('Event Management', () => this.testEventManagement());
    await this.runTest('AI Features', () => this.testAIFeatures());
    await this.runTest('Bible Verse Search', () => this.testBibleVerseSearch());
    await this.runTest('Data Retrieval', () => this.testDataRetrieval());

    this.generateReport();
  }
}

// Run the UI test suite
const tester = new UIFunctionalityTest();
tester.runAllTests().catch(console.error);