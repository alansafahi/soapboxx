import { SecureSessionManager } from './secure-auth';
import { pool } from './db';

// Comprehensive authentication testing suite
export class AuthSecurityTests {
  
  // Test 1: Session Isolation - Different users should never share sessions
  static async testSessionIsolation(): Promise<boolean> {
    console.log('🧪 Testing Session Isolation...');
    
    try {
      // Create mock request objects
      const mockReq1 = { ip: '192.168.1.1', get: () => 'UserAgent1' } as any;
      const mockReq2 = { ip: '192.168.1.2', get: () => 'UserAgent2' } as any;
      
      // Create sessions for two different users
      const session1 = await SecureSessionManager.createSession('user1', mockReq1);
      const session2 = await SecureSessionManager.createSession('user2', mockReq2);
      
      // Validate sessions return correct users
      const userId1 = await SecureSessionManager.validateSession(session1, mockReq1);
      const userId2 = await SecureSessionManager.validateSession(session2, mockReq2);
      
      // Test: Sessions should return their respective users
      if (userId1 !== 'user1' || userId2 !== 'user2') {
        console.error('❌ Session isolation failed: Cross-user session detected');
        return false;
      }
      
      // Test: Session1 should not validate for user2's request
      const crossValidation = await SecureSessionManager.validateSession(session1, mockReq2);
      if (crossValidation !== null) {
        console.error('❌ Session isolation failed: Session validated across different contexts');
        return false;
      }
      
      console.log('✅ Session isolation test passed');
      return true;
    } catch (error) {
      console.error('❌ Session isolation test failed:', error);
      return false;
    }
  }
  
  // Test 2: Session Invalidation - Logout should completely destroy sessions
  static async testSessionInvalidation(): Promise<boolean> {
    console.log('🧪 Testing Session Invalidation...');
    
    try {
      const mockReq = { ip: '192.168.1.100', get: () => 'TestAgent' } as any;
      
      // Create session
      const sessionId = await SecureSessionManager.createSession('testuser', mockReq);
      
      // Validate session exists
      let userId = await SecureSessionManager.validateSession(sessionId, mockReq);
      if (userId !== 'testuser') {
        console.error('❌ Session creation failed');
        return false;
      }
      
      // Invalidate session
      await SecureSessionManager.invalidateSession(sessionId);
      
      // Test: Session should be invalid after logout
      userId = await SecureSessionManager.validateSession(sessionId, mockReq);
      if (userId !== null) {
        console.error('❌ Session invalidation failed: Session still valid after logout');
        return false;
      }
      
      console.log('✅ Session invalidation test passed');
      return true;
    } catch (error) {
      console.error('❌ Session invalidation test failed:', error);
      return false;
    }
  }
  
  // Test 3: Session Blacklist - Blacklisted sessions should never validate
  static async testSessionBlacklist(): Promise<boolean> {
    console.log('🧪 Testing Session Blacklist...');
    
    try {
      const mockReq = { ip: '192.168.1.200', get: () => 'BlacklistTest' } as any;
      
      // Create session
      const sessionId = await SecureSessionManager.createSession('blacklistuser', mockReq);
      
      // Invalidate session (adds to blacklist)
      await SecureSessionManager.invalidateSession(sessionId);
      
      // Try to manually re-activate session in database (simulating attack)
      await pool.query(`
        UPDATE secure_sessions 
        SET is_active = true, invalidated_at = NULL
        WHERE session_id = $1
      `, [sessionId]);
      
      // Test: Session should still be invalid due to blacklist
      const userId = await SecureSessionManager.validateSession(sessionId, mockReq);
      if (userId !== null) {
        console.error('❌ Session blacklist failed: Blacklisted session validated');
        return false;
      }
      
      console.log('✅ Session blacklist test passed');
      return true;
    } catch (error) {
      console.error('❌ Session blacklist test failed:', error);
      return false;
    }
  }
  
  // Test 4: Nuclear Logout - All user sessions should be invalidated
  static async testNuclearLogout(): Promise<boolean> {
    console.log('🧪 Testing Nuclear Logout...');
    
    try {
      const mockReq1 = { ip: '192.168.1.10', get: () => 'Device1' } as any;
      const mockReq2 = { ip: '192.168.1.11', get: () => 'Device2' } as any;
      const mockReq3 = { ip: '192.168.1.12', get: () => 'Device3' } as any;
      
      // Create multiple sessions for same user (simulating multiple devices)
      const session1 = await SecureSessionManager.createSession('multiuser', mockReq1);
      const session2 = await SecureSessionManager.createSession('multiuser', mockReq2);
      const session3 = await SecureSessionManager.createSession('multiuser', mockReq3);
      
      // Validate all sessions work
      const validation1 = await SecureSessionManager.validateSession(session1, mockReq1);
      const validation2 = await SecureSessionManager.validateSession(session2, mockReq2);
      const validation3 = await SecureSessionManager.validateSession(session3, mockReq3);
      
      if (validation1 !== 'multiuser' || validation2 !== 'multiuser' || validation3 !== 'multiuser') {
        console.error('❌ Multi-session setup failed');
        return false;
      }
      
      // Nuclear logout
      await SecureSessionManager.invalidateAllUserSessions('multiuser');
      
      // Test: All sessions should be invalid
      const postNuke1 = await SecureSessionManager.validateSession(session1, mockReq1);
      const postNuke2 = await SecureSessionManager.validateSession(session2, mockReq2);
      const postNuke3 = await SecureSessionManager.validateSession(session3, mockReq3);
      
      if (postNuke1 !== null || postNuke2 !== null || postNuke3 !== null) {
        console.error('❌ Nuclear logout failed: Some sessions still valid');
        return false;
      }
      
      console.log('✅ Nuclear logout test passed');
      return true;
    } catch (error) {
      console.error('❌ Nuclear logout test failed:', error);
      return false;
    }
  }
  
  // Test 5: Cross-Browser Attack Simulation
  static async testCrossBrowserAttack(): Promise<boolean> {
    console.log('🧪 Testing Cross-Browser Attack Prevention...');
    
    try {
      // Simulate Chapin's browser
      const chapinReq = { ip: '192.168.2.100', get: () => 'Chrome/119 (Chapin Device)' } as any;
      const chapinSession = await SecureSessionManager.createSession('chapin_user_id', chapinReq);
      
      // Simulate Alan's browser on different machine
      const alanReq = { ip: '192.168.3.200', get: () => 'Safari/16 (Alan Device)' } as any;
      const alanSession = await SecureSessionManager.createSession('alan_user_id', alanReq);
      
      // Test: Chapin's session should not validate on Alan's device
      const crossValidation1 = await SecureSessionManager.validateSession(chapinSession, alanReq);
      
      // Test: Alan's session should not validate on Chapin's device  
      const crossValidation2 = await SecureSessionManager.validateSession(alanSession, chapinReq);
      
      if (crossValidation1 !== null || crossValidation2 !== null) {
        console.error('❌ Cross-browser attack prevention failed');
        return false;
      }
      
      // Test: Each session should only work on its own device
      const correctValidation1 = await SecureSessionManager.validateSession(chapinSession, chapinReq);
      const correctValidation2 = await SecureSessionManager.validateSession(alanSession, alanReq);
      
      if (correctValidation1 !== 'chapin_user_id' || correctValidation2 !== 'alan_user_id') {
        console.error('❌ Legitimate session validation failed');
        return false;
      }
      
      console.log('✅ Cross-browser attack prevention test passed');
      return true;
    } catch (error) {
      console.error('❌ Cross-browser attack prevention test failed:', error);
      return false;
    }
  }
  
  // Run all security tests
  static async runAllSecurityTests(): Promise<boolean> {
    console.log('🚀 Starting Comprehensive Authentication Security Tests...\n');
    
    const tests = [
      this.testSessionIsolation,
      this.testSessionInvalidation,
      this.testSessionBlacklist,
      this.testNuclearLogout,
      this.testCrossBrowserAttack
    ];
    
    let allPassed = true;
    
    for (const test of tests) {
      const passed = await test();
      if (!passed) {
        allPassed = false;
      }
      console.log(''); // Add spacing between tests
    }
    
    if (allPassed) {
      console.log('🎉 ALL SECURITY TESTS PASSED - Authentication system is secure');
    } else {
      console.log('🚨 SECURITY TESTS FAILED - Authentication vulnerabilities detected');
    }
    
    return allPassed;
  }
  
  // Clean up test data
  static async cleanupTestData(): Promise<void> {
    try {
      await pool.query(`
        DELETE FROM secure_sessions 
        WHERE user_id IN ('user1', 'user2', 'testuser', 'blacklistuser', 'multiuser', 'chapin_user_id', 'alan_user_id')
      `);
      console.log('🧹 Test data cleaned up');
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  }
}

// Test endpoint for manual security testing
export function setupSecurityTestEndpoint(app: any) {
  app.post('/api/security-tests/run', async (req: any, res: any) => {
    try {
      console.log('🔐 Manual security test initiated');
      
      const testsPassed = await AuthSecurityTests.runAllSecurityTests();
      await AuthSecurityTests.cleanupTestData();
      
      res.json({
        success: testsPassed,
        message: testsPassed ? 'All security tests passed' : 'Security vulnerabilities detected',
        testsPassed
      });
    } catch (error) {
      console.error('Security test endpoint error:', error);
      res.status(500).json({
        success: false,
        message: 'Security tests failed to run'
      });
    }
  });
}