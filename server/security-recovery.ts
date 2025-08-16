import type { Express } from "express";
import { AuthSecurityTests } from './auth-tests';
import { setupSecureAuth } from './secure-auth';

// Security recovery and transition system
export class SecurityRecovery {
  
  // Step 1: Run comprehensive security tests
  static async runSecurityValidation(): Promise<boolean> {
    console.log('🔐 Running comprehensive security validation...');
    
    try {
      const testResults = await AuthSecurityTests.runAllSecurityTests();
      await AuthSecurityTests.cleanupTestData();
      
      if (testResults) {
        console.log('✅ All security tests passed - System is secure');
        return true;
      } else {
        console.log('❌ Security tests failed - Vulnerabilities detected');
        return false;
      }
    } catch (error) {
      console.error('Security validation error:', error);
      return false;
    }
  }
  
  // Step 2: Enable secure authentication if tests pass
  static async enableSecureAuthentication(app: Express): Promise<boolean> {
    console.log('🚀 Enabling secure authentication system...');
    
    try {
      // First run security tests
      const securityPassed = await this.runSecurityValidation();
      
      if (!securityPassed) {
        console.log('🚨 Security tests failed - Cannot enable authentication');
        return false;
      }
      
      // Enable secure auth routes
      setupSecureAuth(app);
      
      console.log('✅ Secure authentication system enabled successfully');
      return true;
    } catch (error) {
      console.error('Failed to enable secure authentication:', error);
      return false;
    }
  }
  
  // Step 3: Create recovery endpoints
  static setupRecoveryEndpoints(app: Express): void {
    
    // Security status endpoint
    app.get('/api/security/status', async (req, res) => {
      try {
        res.json({
          emergencyLockdownActive: true, // Current state
          secureAuthAvailable: true,
          requiresSecurityValidation: true,
          message: 'System in emergency lockdown - secure authentication available after validation'
        });
      } catch (error) {
        res.status(500).json({ error: 'Failed to get security status' });
      }
    });
    
    // Manual security recovery endpoint
    app.post('/api/security/recover', async (req, res) => {
      try {
        console.log('🚨 Manual security recovery initiated');
        
        // Step 1: Run security tests
        const securityValid = await this.runSecurityValidation();
        
        if (!securityValid) {
          return res.status(400).json({
            success: false,
            message: 'Security validation failed - vulnerabilities detected',
            canRecover: false
          });
        }
        
        // Step 2: Enable secure authentication
        const authEnabled = await this.enableSecureAuthentication(app);
        
        if (!authEnabled) {
          return res.status(500).json({
            success: false,
            message: 'Failed to enable secure authentication',
            canRecover: false
          });
        }
        
        res.json({
          success: true,
          message: 'Security recovery completed - secure authentication enabled',
          securityValidated: true,
          authenticationEnabled: true,
          emergencyLockdownDisabled: true
        });
        
      } catch (error) {
        console.error('Security recovery error:', error);
        res.status(500).json({
          success: false,
          message: 'Security recovery failed'
        });
      }
    });
    
    // Emergency lockdown status
    app.get('/api/security/lockdown-status', (req, res) => {
      res.json({
        lockdownActive: true,
        reason: 'Cross-user authentication vulnerability detected',
        solution: 'Run security recovery to enable secure authentication',
        recoveryEndpoint: '/api/security/recover'
      });
    });
  }
}

// Setup all security recovery endpoints
export function setupSecurityRecovery(app: Express): void {
  SecurityRecovery.setupRecoveryEndpoints(app);
}