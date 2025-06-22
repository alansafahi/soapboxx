/**
 * Authentication State Recovery System
 * Provides comprehensive session state recovery and validation
 */

import { sessionManager } from './sessionPersistence';

interface RecoveryResult {
  success: boolean;
  user?: any;
  reason?: string;
}

export class AuthStateRecovery {
  private static instance: AuthStateRecovery;

  static getInstance(): AuthStateRecovery {
    if (!AuthStateRecovery.instance) {
      AuthStateRecovery.instance = new AuthStateRecovery();
    }
    return AuthStateRecovery.instance;
  }

  // Attempt to recover authentication state from all available sources
  async attemptRecovery(): Promise<RecoveryResult> {
    console.log('🔄 Attempting authentication state recovery...');

    // Check for logout flag first
    if (sessionManager.hasLogoutFlag()) {
      console.log('❌ Logout flag detected, blocking recovery');
      return { success: false, reason: 'logout_flag' };
    }

    // Try to recover from persisted session
    const persistedSession = sessionManager.getSession();
    if (persistedSession && sessionManager.isSessionVerified()) {
      console.log('📦 Found persisted session, validating with server...');
      
      const serverValidation = await this.validateWithServer();
      if (serverValidation.success) {
        console.log('✅ Server validation successful, session recovered');
        // Update session timestamp
        sessionManager.setSession(serverValidation.user, true);
        return serverValidation;
      } else {
        console.log('❌ Server validation failed, clearing invalid session');
        sessionManager.clearSession();
      }
    }

    // Try direct server authentication check
    console.log('🔍 Attempting direct server authentication check...');
    const directAuth = await this.validateWithServer();
    if (directAuth.success) {
      console.log('✅ Direct authentication successful, establishing session');
      sessionManager.setSession(directAuth.user, true);
      return directAuth;
    }

    console.log('❌ All recovery attempts failed');
    return { success: false, reason: 'no_valid_session' };
  }

  // Validate current session with server
  private async validateWithServer(): Promise<RecoveryResult> {
    try {
      const response = await fetch('/api/auth/user', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (response.ok) {
        const userData = await response.json();
        return { success: true, user: userData };
      } else {
        return { success: false, reason: `server_error_${response.status}` };
      }
    } catch (error) {
      console.warn('Server validation error:', error);
      return { success: false, reason: 'network_error' };
    }
  }

  // Force session restoration (emergency recovery)
  async forceRestore(): Promise<RecoveryResult> {
    console.log('🚨 Force restoration initiated...');
    
    // Clear any existing problematic state
    sessionManager.clearSession();
    sessionManager.clearLogoutFlag();
    
    // Wait a brief moment for state clearing
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Attempt recovery
    return this.attemptRecovery();
  }

  // Check if recovery is possible
  canAttemptRecovery(): boolean {
    return !sessionManager.hasLogoutFlag();
  }
}

export const authRecovery = AuthStateRecovery.getInstance();