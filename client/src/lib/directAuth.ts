// Direct authentication manager with session persistence
import { useState, useEffect } from 'react';
import { sessionManager } from './sessionPersistence';
import { debugStorage } from './storageDebugger';
import { authRecovery } from './authStateRecovery';

interface AuthState {
  user: any;
  isAuthenticated: boolean;
  isLoading: boolean;
  initialized: boolean;
}

let authCheckInProgress = false;

// Debug function to inspect storage
function inspectStorage() {
  console.log('🔍 STORAGE INSPECTION:');
  console.log('localStorage keys:', Object.keys(localStorage));
  console.log('sessionStorage keys:', Object.keys(sessionStorage));
  console.log('supabase.auth.token:', localStorage.getItem('supabase.auth.token'));
  console.log('auth_state:', localStorage.getItem('auth_state'));
  console.log('logout_flag:', localStorage.getItem('logout_flag'));
  console.log('session_verified:', sessionStorage.getItem('session_verified'));
  console.log('session_heartbeat:', sessionStorage.getItem('session_heartbeat'));
}

// Function to clear logout flag and restore authentication
function clearLogoutFlag() {
  localStorage.removeItem('logout_flag');
  console.log('🧹 Logout flag cleared - authentication restored');
}

export function useDirectAuth() {
  const [authState, setAuthState] = useState<AuthState>(() => {
    // Debug storage on initialization
    inspectStorage();
    
    // Clear logout flag if it exists - allow re-authentication
    if (sessionManager.hasLogoutFlag()) {
      console.log('🚫 Logout flag detected - clearing to allow re-authentication');
      sessionManager.clearLogoutFlag();
      clearLogoutFlag(); // Also clear direct localStorage flag
    }

    // Check for persisted session
    const persistedSession = sessionManager.getSession();
    console.log('📦 Persisted session found:', !!persistedSession);
    console.log('📦 Session verified:', sessionManager.isSessionVerified());
    
    if (persistedSession && sessionManager.isSessionVerified()) {
      console.log('📦 Initializing with persisted session:', persistedSession.user.email);
      return {
        user: persistedSession.user,
        isAuthenticated: persistedSession.isAuthenticated,
        isLoading: false,
        initialized: true
      };
    }
    
    console.log('📦 No valid persisted session, will check with server');
    return {
      user: null,
      isAuthenticated: false,
      isLoading: true,
      initialized: false
    };
  });

  useEffect(() => {
    const checkAuth = async () => {
      // Prevent multiple simultaneous auth checks
      if (authCheckInProgress) {
        return;
      }

      // Skip if already initialized with authenticated state
      if (authState.initialized && authState.isAuthenticated && authState.user) {
        console.log('📦 Using cached authentication for:', authState.user.email);
        return;
      }

      authCheckInProgress = true;

      try {
        console.log('🔍 Checking authentication status...');
        
        const response = await fetch('/api/auth/user', {
          credentials: 'include',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });

        console.log('📡 Auth response status:', response.status);

        if (response.ok) {
          const userData = await response.json();
          console.log('✅ User authenticated:', userData.email);
          
          setAuthState({
            user: userData,
            isAuthenticated: true,
            isLoading: false,
            initialized: true
          });
          
          // Use session manager for robust persistence
          sessionManager.setSession(userData, true);
          
          // Create Supabase-style session for compatibility
          const supabaseSession = {
            access_token: 'soapbox-session-token',
            refresh_token: 'soapbox-refresh-token',
            expires_in: 3600,
            expires_at: Math.floor(Date.now() / 1000) + 3600,
            token_type: 'bearer',
            user: userData
          };
          localStorage.setItem('supabase.auth.token', JSON.stringify(supabaseSession));
          console.log('🔄 Created Supabase-style session token');
        } else {
          console.log('❌ Authentication failed');
          
          sessionManager.clearSession();
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            initialized: true
          });
        }
      } catch (error) {
        console.log('🚨 Auth check error:', error);
        
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          initialized: true
        });
      } finally {
        authCheckInProgress = false;
      }
    };

    // Only check auth if not yet initialized
    if (!authState.initialized) {
      checkAuth();
    }
  }, [authState.initialized]);

  // Session heartbeat to maintain authentication
  useEffect(() => {
    if (!authState.isAuthenticated || !authState.initialized) {
      return;
    }

    const heartbeat = setInterval(async () => {
      try {
        const response = await fetch('/api/auth/user', {
          credentials: 'include',
          headers: {
            'Cache-Control': 'no-cache'
          }
        });

        if (response.ok) {
          // Update heartbeat timestamp
          sessionManager.updateHeartbeat();
        } else {
          // Session expired, clear state
          console.log('🔄 Session expired, clearing authentication');
          sessionManager.clearSession();
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            initialized: true
          });
        }
      } catch (error) {
        console.log('💔 Heartbeat failed:', error);
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(heartbeat);
  }, [authState.isAuthenticated, authState.initialized]);

  const logout = async () => {
    console.log('🚪 Logout initiated');
    
    // Clear all auth state immediately
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      initialized: true
    });
    
    // Clear all authentication state using session manager
    sessionManager.clearSession();
    
    try {
      // Call backend logout endpoint
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Backend logout successful');
    } catch (error) {
      console.log('⚠️ Backend logout error:', error);
    }
    
    // Force navigation to login page
    window.location.replace('/login');
  };

  return { ...authState, logout };
}