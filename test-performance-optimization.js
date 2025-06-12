/**
 * Performance Optimization Testing Suite
 * Tests various endpoints for speed, memory usage, and response sizes
 */

class PerformanceTestSuite {
  constructor(baseUrl = 'http://localhost:5000') {
    this.baseUrl = baseUrl;
    this.results = [];
    this.authCookie = null;
  }

  async authenticateUser() {
    try {
      const response = await fetch(`${this.baseUrl}/api/auth/user`);
      const cookies = response.headers.get('set-cookie');
      if (cookies) {
        this.authCookie = cookies;
      }
      return response.ok;
    } catch (error) {
      console.log('Authentication test skipped - using existing session');
      return true;
    }
  }

  async measureEndpoint(endpoint, options = {}) {
    const startTime = performance.now();
    const startMemory = process.memoryUsage();
    
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (this.authCookie) {
        headers['Cookie'] = this.authCookie;
      }

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: options.method || 'GET',
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
        ...options
      });

      const endTime = performance.now();
      const responseText = await response.text();
      const endMemory = process.memoryUsage();

      const result = {
        endpoint,
        status: response.status,
        responseTime: Math.round(endTime - startTime),
        responseSize: Buffer.byteLength(responseText, 'utf8'),
        memoryDelta: endMemory.heapUsed - startMemory.heapUsed,
        contentType: response.headers.get('content-type') || '',
        contentEncoding: response.headers.get('content-encoding') || 'none',
        success: response.ok
      };

      this.results.push(result);
      return result;
    } catch (error) {
      const result = {
        endpoint,
        status: 'ERROR',
        responseTime: performance.now() - startTime,
        error: error.message,
        success: false
      };
      this.results.push(result);
      return result;
    }
  }

  async runConcurrentTests(endpoint, concurrency = 5) {
    console.log(`Testing ${endpoint} with ${concurrency} concurrent requests...`);
    
    const promises = Array(concurrency).fill().map((_, i) => 
      this.measureEndpoint(`${endpoint}?test=${i}`)
    );
    
    const results = await Promise.all(promises);
    const avgResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length;
    const maxResponseTime = Math.max(...results.map(r => r.responseTime));
    const successRate = results.filter(r => r.success).length / results.length * 100;
    
    return {
      endpoint,
      concurrency,
      avgResponseTime: Math.round(avgResponseTime),
      maxResponseTime,
      successRate,
      results
    };
  }

  async testDataHeavyEndpoints() {
    console.log('\n📊 Testing data-heavy endpoints...');
    
    const endpoints = [
      '/api/feed',
      '/api/events',
      '/api/prayers',
      '/api/checkins/recent',
      '/api/leaderboard/weekly-faithfulness',
      '/api/churches/nearby',
      '/api/users/stats'
    ];

    for (const endpoint of endpoints) {
      const result = await this.measureEndpoint(endpoint);
      console.log(`  ${endpoint}: ${result.responseTime}ms, ${this.formatBytes(result.responseSize)}, ${result.success ? '✅' : '❌'}`);
    }
  }

  async testCacheEfficiency() {
    console.log('\n🔄 Testing cache efficiency...');
    
    const testEndpoint = '/api/feed';
    
    // First request (cold cache)
    const cold = await this.measureEndpoint(testEndpoint);
    console.log(`  Cold cache: ${cold.responseTime}ms`);
    
    // Second request (warm cache)
    const warm = await this.measureEndpoint(testEndpoint);
    console.log(`  Warm cache: ${warm.responseTime}ms`);
    
    const improvement = ((cold.responseTime - warm.responseTime) / cold.responseTime * 100);
    console.log(`  Cache improvement: ${improvement > 0 ? improvement.toFixed(1) + '%' : 'No improvement detected'}`);
  }

  async testCompressionEffectiveness() {
    console.log('\n🗜️ Testing compression effectiveness...');
    
    const endpoints = ['/api/feed', '/api/events', '/api/prayers'];
    
    for (const endpoint of endpoints) {
      const result = await this.measureEndpoint(endpoint);
      const compressionRatio = result.contentEncoding !== 'none' ? 
        `${result.contentEncoding} enabled` : 
        'No compression';
      
      console.log(`  ${endpoint}: ${this.formatBytes(result.responseSize)} (${compressionRatio})`);
    }
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  generateReport() {
    const successfulResults = this.results.filter(r => r.success);
    
    if (successfulResults.length === 0) {
      return {
        summary: 'No successful requests to analyze',
        recommendations: ['Check server connectivity and authentication']
      };
    }

    const avgResponseTime = successfulResults.reduce((sum, r) => sum + r.responseTime, 0) / successfulResults.length;
    const avgResponseSize = successfulResults.reduce((sum, r) => sum + (r.responseSize || 0), 0) / successfulResults.length;
    const totalDataTransferred = successfulResults.reduce((sum, r) => sum + (r.responseSize || 0), 0);
    
    const slowEndpoints = successfulResults
      .filter(r => r.responseTime > 300)
      .sort((a, b) => b.responseTime - a.responseTime);
    
    const largeResponses = successfulResults
      .filter(r => r.responseSize > 10000)
      .sort((a, b) => b.responseSize - a.responseSize);

    return {
      summary: {
        totalRequests: this.results.length,
        successfulRequests: successfulResults.length,
        averageResponseTime: Math.round(avgResponseTime),
        averageResponseSize: this.formatBytes(avgResponseSize),
        totalDataTransferred: this.formatBytes(totalDataTransferred),
        compressionDetected: successfulResults.some(r => r.contentEncoding !== 'none')
      },
      slowEndpoints: slowEndpoints.slice(0, 5),
      largeResponses: largeResponses.slice(0, 5),
      performance: this.generatePerformanceGrade(avgResponseTime)
    };
  }

  generatePerformanceGrade(avgResponseTime) {
    if (avgResponseTime < 100) return { grade: 'A+', description: 'Excellent performance' };
    if (avgResponseTime < 200) return { grade: 'A', description: 'Very good performance' };
    if (avgResponseTime < 300) return { grade: 'B', description: 'Good performance' };
    if (avgResponseTime < 500) return { grade: 'C', description: 'Acceptable performance' };
    return { grade: 'D', description: 'Performance needs improvement' };
  }

  generateRecommendations() {
    const report = this.generateReport();
    const recommendations = [];

    if (report.summary.averageResponseTime > 300) {
      recommendations.push('Consider implementing database indexes for slow queries');
      recommendations.push('Add Redis caching for frequently accessed data');
    }

    if (!report.summary.compressionDetected) {
      recommendations.push('Enable gzip compression for better bandwidth efficiency');
    }

    if (report.largeResponses.length > 0) {
      recommendations.push('Implement pagination for large datasets');
      recommendations.push('Consider reducing payload sizes for heavy endpoints');
    }

    if (report.slowEndpoints.length > 2) {
      recommendations.push('Optimize database queries for consistently slow endpoints');
    }

    return recommendations;
  }

  async runFullTestSuite() {
    console.log('🚀 Starting SoapBox Performance Test Suite...\n');
    
    // Basic connectivity test
    await this.authenticateUser();
    
    // Test data-heavy endpoints
    await this.testDataHeavyEndpoints();
    
    // Test caching
    await this.testCacheEfficiency();
    
    // Test compression
    await this.testCompressionEffectiveness();
    
    // Concurrent load test
    const loadTest = await this.runConcurrentTests('/api/feed', 3);
    console.log(`\n⚡ Load test results: ${loadTest.avgResponseTime}ms avg, ${loadTest.successRate}% success rate`);
    
    // Generate final report
    const report = this.generateReport();
    const recommendations = this.generateRecommendations();
    
    console.log('\n📈 Performance Summary:');
    console.log(`  Grade: ${report.performance.grade} (${report.performance.description})`);
    console.log(`  Average Response Time: ${report.summary.averageResponseTime}ms`);
    console.log(`  Average Response Size: ${report.summary.averageResponseSize}`);
    console.log(`  Total Data Transferred: ${report.summary.totalDataTransferred}`);
    console.log(`  Compression: ${report.summary.compressionDetected ? '✅ Enabled' : '❌ Disabled'}`);
    
    if (recommendations.length > 0) {
      console.log('\n💡 Optimization Recommendations:');
      recommendations.forEach((rec, i) => {
        console.log(`  ${i + 1}. ${rec}`);
      });
    }
    
    console.log('\n✅ Performance testing complete!');
    return { report, recommendations };
  }
}

// Run the test suite
const testSuite = new PerformanceTestSuite();
testSuite.runFullTestSuite()
  .then(({ report, recommendations }) => {
    // Save results for later analysis
    const fs = await import('fs');
    const results = {
      timestamp: new Date().toISOString(),
      report,
      recommendations,
      rawResults: testSuite.results
    };
    
    fs.writeFileSync('performance-test-results.json', JSON.stringify(results, null, 2));
    console.log('\n📄 Results saved to performance-test-results.json');
    
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Performance testing failed:', error);
    process.exit(1);
  });