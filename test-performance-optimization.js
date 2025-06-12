/**
 * Performance Optimization Testing Suite
 * Tests various endpoints for speed, memory usage, and response sizes
 */

import fs from 'fs';

class PerformanceTestSuite {
  constructor(baseUrl = 'http://localhost:5000') {
    this.baseUrl = baseUrl;
    this.results = [];
    this.authToken = null;
  }

  async authenticateUser() {
    console.log('🔐 Setting up test authentication...');
    // Using test user session for performance testing
    try {
      const response = await fetch(`${this.baseUrl}/api/auth/user`);
      if (response.ok) {
        console.log('✅ Already authenticated');
        return true;
      }
    } catch (error) {
      console.log('❌ Authentication required for performance testing');
      return false;
    }
  }

  async measureEndpoint(endpoint, options = {}) {
    const startTime = performance.now();
    const startMemory = process.memoryUsage();
    
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        body: options.body ? JSON.stringify(options.body) : undefined
      });

      const endTime = performance.now();
      const endMemory = process.memoryUsage();
      const responseText = await response.text();
      
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = responseText;
      }

      const result = {
        endpoint,
        method: options.method || 'GET',
        status: response.status,
        responseTime: Math.round(endTime - startTime),
        responseSize: new Blob([responseText]).size,
        memoryDelta: {
          rss: endMemory.rss - startMemory.rss,
          heapUsed: endMemory.heapUsed - startMemory.heapUsed,
          heapTotal: endMemory.heapTotal - startMemory.heapTotal
        },
        contentType: response.headers.get('content-type'),
        cacheControl: response.headers.get('cache-control'),
        compressed: !!response.headers.get('content-encoding'),
        timestamp: new Date().toISOString()
      };

      this.results.push(result);
      return result;

    } catch (error) {
      const result = {
        endpoint,
        method: options.method || 'GET',
        error: error.message,
        responseTime: performance.now() - startTime,
        timestamp: new Date().toISOString()
      };
      this.results.push(result);
      return result;
    }
  }

  async runConcurrentTests(endpoint, concurrency = 5) {
    console.log(`📊 Running concurrent test for ${endpoint} (${concurrency} requests)`);
    
    const promises = Array(concurrency).fill().map(() => 
      this.measureEndpoint(endpoint)
    );
    
    const results = await Promise.all(promises);
    const avgResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length;
    const maxResponseTime = Math.max(...results.map(r => r.responseTime));
    const minResponseTime = Math.min(...results.map(r => r.responseTime));
    
    return {
      endpoint,
      concurrency,
      avgResponseTime: Math.round(avgResponseTime),
      maxResponseTime,
      minResponseTime,
      successRate: results.filter(r => r.status === 200).length / results.length * 100
    };
  }

  async testDataHeavyEndpoints() {
    console.log('🔍 Testing data-heavy endpoints...');
    
    const endpoints = [
      '/api/feed',
      '/api/events',
      '/api/prayers',
      '/api/users/stats',
      '/api/checkins/recent',
      '/api/leaderboard/weekly-faithfulness',
      '/api/leaderboard/referrals'
    ];

    const results = [];
    
    for (const endpoint of endpoints) {
      console.log(`Testing ${endpoint}...`);
      const result = await this.measureEndpoint(endpoint);
      console.log(`  📈 ${result.responseTime}ms, ${this.formatBytes(result.responseSize)}, status: ${result.status}`);
      
      // Test concurrent load
      const concurrentResult = await this.runConcurrentTests(endpoint, 3);
      results.push({ single: result, concurrent: concurrentResult });
      
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return results;
  }

  async testCacheEfficiency() {
    console.log('🗄️ Testing cache efficiency...');
    
    const testEndpoint = '/api/feed';
    
    // First request (cache miss)
    const firstRequest = await this.measureEndpoint(testEndpoint);
    
    // Wait briefly
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Second request (potential cache hit)
    const secondRequest = await this.measureEndpoint(testEndpoint);
    
    const cacheEfficiency = {
      firstRequestTime: firstRequest.responseTime,
      secondRequestTime: secondRequest.responseTime,
      improvement: Math.round(((firstRequest.responseTime - secondRequest.responseTime) / firstRequest.responseTime) * 100),
      cacheHeadersPresent: !!(firstRequest.cacheControl || secondRequest.cacheControl)
    };
    
    console.log(`  Cache improvement: ${cacheEfficiency.improvement}%`);
    return cacheEfficiency;
  }

  async testCompressionEffectiveness() {
    console.log('🗜️ Testing response compression...');
    
    const testEndpoints = ['/api/feed', '/api/events', '/api/prayers'];
    const compressionResults = [];
    
    for (const endpoint of testEndpoints) {
      const result = await this.measureEndpoint(endpoint);
      compressionResults.push({
        endpoint,
        compressed: result.compressed,
        size: result.responseSize,
        contentType: result.contentType
      });
    }
    
    return compressionResults;
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  generateReport() {
    const report = {
      testDate: new Date().toISOString(),
      summary: {
        totalTests: this.results.length,
        avgResponseTime: Math.round(this.results.reduce((sum, r) => sum + (r.responseTime || 0), 0) / this.results.length),
        slowestEndpoint: this.results.reduce((prev, current) => 
          (prev.responseTime > current.responseTime) ? prev : current
        ),
        fastestEndpoint: this.results.reduce((prev, current) => 
          (prev.responseTime < current.responseTime) ? prev : current
        ),
        totalDataTransferred: this.formatBytes(this.results.reduce((sum, r) => sum + (r.responseSize || 0), 0)),
        compressionRate: Math.round((this.results.filter(r => r.compressed).length / this.results.length) * 100)
      },
      recommendations: this.generateRecommendations(),
      detailedResults: this.results
    };

    return report;
  }

  generateRecommendations() {
    const recommendations = [];
    
    // Check for slow endpoints
    const slowEndpoints = this.results.filter(r => r.responseTime > 500);
    if (slowEndpoints.length > 0) {
      recommendations.push({
        type: 'performance',
        priority: 'high',
        issue: 'Slow response times detected',
        endpoints: slowEndpoints.map(r => r.endpoint),
        suggestion: 'Add database indexes, implement pagination, or add caching'
      });
    }
    
    // Check for large response sizes
    const largeResponses = this.results.filter(r => r.responseSize > 100000); // 100KB
    if (largeResponses.length > 0) {
      recommendations.push({
        type: 'bandwidth',
        priority: 'medium',
        issue: 'Large response sizes detected',
        endpoints: largeResponses.map(r => r.endpoint),
        suggestion: 'Implement pagination, reduce data fields, or optimize serialization'
      });
    }
    
    // Check compression
    const uncompressedResponses = this.results.filter(r => !r.compressed && r.responseSize > 1024);
    if (uncompressedResponses.length > 0) {
      recommendations.push({
        type: 'compression',
        priority: 'medium',
        issue: 'Uncompressed responses detected',
        suggestion: 'Enable gzip compression for all API responses'
      });
    }
    
    return recommendations;
  }

  async runFullTestSuite() {
    console.log('🚀 Starting SoapBox Performance Test Suite...\n');
    
    // Authenticate
    const authenticated = await this.authenticateUser();
    if (!authenticated) {
      console.log('❌ Cannot run performance tests without authentication');
      return;
    }
    
    // Run tests
    const dataHeavyResults = await this.testDataHeavyEndpoints();
    console.log('');
    
    const cacheResults = await this.testCacheEfficiency();
    console.log('');
    
    const compressionResults = await this.testCompressionEffectiveness();
    console.log('');
    
    // Generate report
    const report = this.generateReport();
    
    // Save report
    const reportFileName = `performance-test-report-${Date.now()}.json`;
    fs.writeFileSync(reportFileName, JSON.stringify(report, null, 2));
    
    console.log('📊 Performance Test Results:');
    console.log(`  Total tests: ${report.summary.totalTests}`);
    console.log(`  Average response time: ${report.summary.avgResponseTime}ms`);
    console.log(`  Total data transferred: ${report.summary.totalDataTransferred}`);
    console.log(`  Compression rate: ${report.summary.compressionRate}%`);
    
    if (report.recommendations.length > 0) {
      console.log('\n⚠️ Recommendations:');
      report.recommendations.forEach(rec => {
        console.log(`  ${rec.type.toUpperCase()}: ${rec.issue}`);
        console.log(`    ${rec.suggestion}`);
      });
    }
    
    console.log(`\n📄 Full report saved to: ${reportFileName}`);
    
    return report;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const testSuite = new PerformanceTestSuite();
  testSuite.runFullTestSuite()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Test suite failed:', error);
      process.exit(1);
    });
}

export default PerformanceTestSuite;