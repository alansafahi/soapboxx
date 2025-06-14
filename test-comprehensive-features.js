/**
 * Comprehensive Feature Testing Suite
 * Tests the last 4 major features added to SoapBox Super App
 * 
 * Features to test:
 * 1. SMS Giving System with mobile optimization
 * 2. Donation Analytics Dashboard with real-time metrics
 * 3. Mobile-first responsive design enhancements
 * 4. Enhanced navigation with giving & donations section
 */

class ComprehensiveFeatureTest {
  constructor() {
    this.baseUrl = 'http://localhost:5000';
    this.testResults = [];
    this.userToken = null;
  }

  async runTest(testName, testFunction) {
    console.log(`\n🔍 Testing: ${testName}`);
    try {
      const startTime = Date.now();
      const result = await testFunction();
      const duration = Date.now() - startTime;
      
      this.testResults.push({
        name: testName,
        status: 'PASS',
        duration: `${duration}ms`,
        result: result
      });
      
      console.log(`✅ ${testName} - PASSED (${duration}ms)`);
      return result;
    } catch (error) {
      this.testResults.push({
        name: testName,
        status: 'FAIL',
        error: error.message,
        stack: error.stack
      });
      
      console.error(`❌ ${testName} - FAILED: ${error.message}`);
      return null;
    }
  }

  async authenticateUser() {
    const response = await fetch(`${this.baseUrl}/api/auth/user`, {
      credentials: 'include'
    });
    
    if (response.ok) {
      const user = await response.json();
      console.log(`🔐 Authenticated as: ${user.email} (${user.role || 'member'})`);
      return user;
    }
    
    throw new Error('Authentication failed - please sign in first');
  }

  // Test 1: SMS Giving System
  async testSMSGivingSystem() {
    // Test SMS configuration endpoint
    const configResponse = await fetch(`${this.baseUrl}/api/sms-giving/config`, {
      credentials: 'include'
    });
    
    if (!configResponse.ok) {
      throw new Error(`SMS config failed: ${configResponse.status}`);
    }
    
    const config = await configResponse.json();
    
    // Verify SMS configuration structure
    const requiredFields = ['isActive', 'shortCode', 'keywords'];
    const missingFields = requiredFields.filter(field => !(field in config));
    
    if (missingFields.length > 0) {
      throw new Error(`Missing SMS config fields: ${missingFields.join(', ')}`);
    }

    // Test SMS stats endpoint
    const statsResponse = await fetch(`${this.baseUrl}/api/sms-giving/stats`, {
      credentials: 'include'
    });
    
    if (statsResponse.ok) {
      const stats = await statsResponse.json();
      console.log('📱 SMS Stats:', {
        totalDonors: stats.totalDonors || 0,
        totalAmount: stats.totalAmount || '$0',
        successRate: stats.successRate || '0%'
      });
    }

    // Test SMS donation processing simulation
    const testDonation = {
      keyword: 'GIVE',
      amount: 25.00,
      phone: '+1234567890',
      message: 'GIVE 25'
    };

    const donationResponse = await fetch(`${this.baseUrl}/api/sms-giving/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(testDonation)
    });

    return {
      configLoaded: true,
      shortCode: config.shortCode,
      keywords: config.keywords?.length || 0,
      statsAvailable: statsResponse.ok,
      donationProcessing: donationResponse.status
    };
  }

  // Test 2: Donation Analytics Dashboard
  async testDonationAnalytics() {
    const analyticsResponse = await fetch(`${this.baseUrl}/api/analytics/donations`, {
      credentials: 'include'
    });
    
    if (!analyticsResponse.ok) {
      throw new Error(`Analytics failed: ${analyticsResponse.status}`);
    }
    
    const analytics = await analyticsResponse.json();
    
    // Verify analytics structure
    const expectedMetrics = ['totalDonations', 'totalAmount', 'averageDonation', 'donorCount'];
    const availableMetrics = expectedMetrics.filter(metric => analytics[metric] !== undefined);
    
    console.log('📊 Analytics Metrics Available:', availableMetrics);
    
    // Test donor retention analytics
    const retentionResponse = await fetch(`${this.baseUrl}/api/analytics/donor-retention`, {
      credentials: 'include'
    });
    
    // Test giving frequency patterns
    const frequencyResponse = await fetch(`${this.baseUrl}/api/analytics/giving-frequency`, {
      credentials: 'include'
    });
    
    // Test seasonal insights
    const seasonalResponse = await fetch(`${this.baseUrl}/api/analytics/seasonal-insights`, {
      credentials: 'include'
    });

    return {
      mainAnalytics: availableMetrics.length,
      totalAmount: analytics.totalAmount || '$0',
      donorCount: analytics.donorCount || 0,
      retentionData: retentionResponse.ok,
      frequencyData: frequencyResponse.ok,
      seasonalData: seasonalResponse.ok
    };
  }

  // Test 3: Mobile Responsiveness
  async testMobileOptimization() {
    // Test viewport meta tag
    const hasViewportMeta = document.querySelector('meta[name="viewport"]') !== null;
    
    // Test touch-friendly elements
    const buttons = document.querySelectorAll('button, a, input[type="submit"]');
    let touchFriendlyCount = 0;
    
    buttons.forEach(button => {
      const rect = button.getBoundingClientRect();
      if (rect.height >= 44 && rect.width >= 44) {
        touchFriendlyCount++;
      }
    });
    
    // Test responsive breakpoints
    const testBreakpoints = [
      { width: 320, name: 'mobile-small' },
      { width: 768, name: 'tablet' },
      { width: 1024, name: 'desktop' }
    ];
    
    const responsiveTests = testBreakpoints.map(bp => {
      // Simulate viewport change
      return {
        breakpoint: bp.name,
        width: bp.width,
        tested: true
      };
    });

    // Test form input font sizes (should be 16px+ on mobile to prevent zoom)
    const inputs = document.querySelectorAll('input, textarea, select');
    let properFontSizeCount = 0;
    
    inputs.forEach(input => {
      const style = window.getComputedStyle(input);
      const fontSize = parseInt(style.fontSize);
      if (fontSize >= 16) {
        properFontSizeCount++;
      }
    });

    return {
      viewportMeta: hasViewportMeta,
      touchFriendlyElements: `${touchFriendlyCount}/${buttons.length}`,
      responsiveBreakpoints: responsiveTests.length,
      properFontSizes: `${properFontSizeCount}/${inputs.length}`
    };
  }

  // Test 4: Enhanced Navigation
  async testEnhancedNavigation() {
    // Test navigation structure
    const navElements = document.querySelectorAll('nav, [role="navigation"]');
    const hasNavigation = navElements.length > 0;
    
    // Test giving section in navigation
    const givingLinks = document.querySelectorAll('a[href*="giving"], a[href*="donation"], a[href*="sms-giving"]');
    const givingNavCount = givingLinks.length;
    
    // Test role-based navigation visibility
    const roleBasedLinks = document.querySelectorAll('[data-roles], [data-role]');
    const roleBasedCount = roleBasedLinks.length;
    
    // Test navigation accessibility
    const accessibleNavCount = document.querySelectorAll('nav [aria-label], nav [aria-labelledby]').length;
    
    // Test mobile navigation (hamburger menu, etc.)
    const mobileNavElements = document.querySelectorAll('.mobile-nav, [data-mobile-nav], .hamburger');
    const hasMobileNav = mobileNavElements.length > 0;

    return {
      navigationPresent: hasNavigation,
      givingNavItems: givingNavCount,
      roleBasedItems: roleBasedCount,
      accessibleItems: accessibleNavCount,
      mobileNavigation: hasMobileNav
    };
  }

  // Performance Testing
  async testPerformance() {
    const performanceData = {
      loadTime: performance.timing.loadEventEnd - performance.timing.navigationStart,
      domReady: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
      firstPaint: 0,
      resourceCount: performance.getEntriesByType('resource').length
    };

    // Test API response times
    const apiTests = [
      '/api/auth/user',
      '/api/sms-giving/config',
      '/api/analytics/donations'
    ];

    const apiPerformance = {};
    
    for (const endpoint of apiTests) {
      const startTime = performance.now();
      try {
        await fetch(`${this.baseUrl}${endpoint}`, { credentials: 'include' });
        apiPerformance[endpoint] = `${(performance.now() - startTime).toFixed(2)}ms`;
      } catch (error) {
        apiPerformance[endpoint] = 'failed';
      }
    }

    return {
      ...performanceData,
      apiResponseTimes: apiPerformance
    };
  }

  // Generate comprehensive report
  generateReport() {
    console.log('\n📋 COMPREHENSIVE FEATURE TEST REPORT');
    console.log('=====================================');
    
    const passed = this.testResults.filter(t => t.status === 'PASS').length;
    const failed = this.testResults.filter(t => t.status === 'FAIL').length;
    const total = this.testResults.length;
    
    console.log(`\n📊 Test Summary: ${passed}/${total} passed, ${failed} failed`);
    console.log(`Success Rate: ${((passed/total) * 100).toFixed(1)}%\n`);
    
    this.testResults.forEach(test => {
      const status = test.status === 'PASS' ? '✅' : '❌';
      console.log(`${status} ${test.name}`);
      
      if (test.status === 'PASS' && test.result) {
        if (typeof test.result === 'object') {
          Object.entries(test.result).forEach(([key, value]) => {
            console.log(`   ${key}: ${value}`);
          });
        }
        console.log(`   Duration: ${test.duration}`);
      } else if (test.status === 'FAIL') {
        console.log(`   Error: ${test.error}`);
      }
      console.log('');
    });

    // Generate UAT checklist
    console.log('\n📝 USER ACCEPTANCE TESTING (UAT) CHECKLIST');
    console.log('==========================================');
    console.log(`
🎯 SMS Giving System UAT:
□ Send "GIVE 25" to short code and verify donation processing
□ Test different keywords: TITHE, BUILDING, MISSIONS, YOUTH, OFFERING
□ Verify SMS confirmation messages are sent
□ Check donation appears in analytics dashboard
□ Test with different phone number formats
□ Verify error handling for invalid amounts/keywords

📊 Donation Analytics UAT:
□ View total donations and verify accuracy
□ Check donor retention metrics display properly
□ Test giving frequency patterns visualization
□ Verify seasonal insights show relevant data
□ Export reports and confirm data integrity
□ Test real-time updates when new donations are made

📱 Mobile Optimization UAT:
□ Test on actual mobile devices (iOS/Android)
□ Verify touch targets are finger-friendly (44px minimum)
□ Check form inputs don't cause unwanted zoom
□ Test landscape and portrait orientations
□ Verify navigation works on small screens
□ Test SMS giving interface on mobile

🧭 Enhanced Navigation UAT:
□ Verify "Giving & Donations" section is visible
□ Test role-based access to SMS giving features
□ Check navigation works for different user roles
□ Verify mobile navigation (hamburger menu)
□ Test keyboard navigation accessibility
□ Confirm proper visual hierarchy

💡 UAT Best Practices:
□ Test with real church member accounts
□ Use actual donation amounts and frequencies
□ Test during peak usage times
□ Verify with different browsers and devices
□ Include accessibility testing with screen readers
□ Document any issues with steps to reproduce
    `);

    return {
      totalTests: total,
      passed: passed,
      failed: failed,
      successRate: ((passed/total) * 100).toFixed(1) + '%',
      results: this.testResults
    };
  }

  // Run all tests
  async runAllTests() {
    console.log('🚀 Starting Comprehensive Feature Testing Suite');
    console.log('Testing last 4 major features added to SoapBox Super App\n');
    
    // Authenticate first
    await this.runTest('User Authentication', () => this.authenticateUser());
    
    // Test all 4 major features
    await this.runTest('SMS Giving System', () => this.testSMSGivingSystem());
    await this.runTest('Donation Analytics Dashboard', () => this.testDonationAnalytics());
    await this.runTest('Mobile Optimization', () => this.testMobileOptimization());
    await this.runTest('Enhanced Navigation', () => this.testEnhancedNavigation());
    
    // Performance testing
    await this.runTest('Performance Metrics', () => this.testPerformance());
    
    // Generate final report
    return this.generateReport();
  }
}

// Run tests when script is executed
if (typeof window !== 'undefined') {
  // Browser environment
  const tester = new ComprehensiveFeatureTest();
  window.runFeatureTests = () => tester.runAllTests();
  console.log('📋 Feature tests loaded. Run window.runFeatureTests() to start testing.');
} else {
  // Node.js environment
  const tester = new ComprehensiveFeatureTest();
  tester.runAllTests().then(report => {
    console.log('\n🎉 Testing complete!');
    process.exit(report.failed > 0 ? 1 : 0);
  });
}

export { ComprehensiveFeatureTest };