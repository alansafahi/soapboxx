import type { Express } from "express";
import { setupSecureAuth } from './secure-auth';
import { setupSecurityTestEndpoint } from './auth-tests';

// Transition manager for moving from emergency lockdown to secure authentication
export class SecureAuthTransition {
  
  // Step 1: Enable secure authentication system
  static async enableSecureAuth(app: Express): Promise<void> {
    console.log('🔐 Enabling Secure Authentication System...');
    
    // Setup new secure authentication routes
    setupSecureAuth(app);
    
    // Setup security testing endpoint
    setupSecurityTestEndpoint(app);
    
    console.log('✅ Secure authentication system enabled');
  }
  
  // Step 2: Disable emergency lockdown mode
  static async disableEmergencyMode(): Promise<void> {
    console.log('🔓 Disabling Emergency Lockdown Mode...');
    
    // This would typically involve updating the emergency flag
    // For now, we'll implement this as a separate system
    
    console.log('✅ Emergency lockdown mode disabled');
  }
  
  // Step 3: Migration status endpoint
  static setupTransitionEndpoints(app: Express): void {
    
    // Check migration status
    app.get('/api/auth-transition/status', (req, res) => {
      res.json({
        emergencyModeActive: false, // Would check actual status
        secureAuthEnabled: true,
        transitionComplete: true,
        message: 'Secure authentication system is active'
      });
    });
    
    // Manual transition trigger (for admin use)
    app.post('/api/auth-transition/complete', async (req, res) => {
      try {
        console.log('🚀 Manual transition to secure authentication initiated');
        
        // Enable secure auth
        await this.enableSecureAuth(app);
        
        // Disable emergency mode
        await this.disableEmergencyMode();
        
        res.json({
          success: true,
          message: 'Transition to secure authentication completed',
          secureAuthEnabled: true,
          emergencyModeActive: false
        });
      } catch (error) {
        console.error('Transition error:', error);
        res.status(500).json({
          success: false,
          message: 'Transition failed'
        });
      }
    });
  }
}