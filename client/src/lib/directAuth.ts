// Direct authentication manager with session persistence
import { useState, useEffect } from 'react';
import { sessionManager } from './sessionPersistence';

interface AuthState {
  user: any;
  isAuthenticated: boolean;
  isLoading: boolean;
  initialized: boolean;
}

let authCheckInProgress = false;

export function useDirectAuth() {
  const [authState, setAuthState] = useState<AuthState>(() => {
    // Check for logout flag first
    if (sessionManager.hasLogoutFlag()) {
      sessionManager.clearLogoutFlag();
      sessionManager.clearSession();
      return {
        user: null,
        isAuthenticated: false,
        isLoading: false,
        initialized: true
      };
    }

    // Check for persisted session
    const persistedSession = sessionManager.getSession();
    if (persistedSession && sessionManager.isSessionVerified()) {
      console.log('📦 Initializing with persisted session:', persistedSession.user.email);
      return {
        user: persistedSession.user,
        isAuthenticated: persistedSession.isAuthenticated,
        isLoading: false,
        initialized: true
      };
    }
    
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
          
          // Cache the authenticated state with session verification
          localStorage.setItem('auth_state', JSON.stringify({
            user: userData,
            isAuthenticated: true,
            timestamp: Date.now()
          }));
          
          // Mark session as verified and set heartbeat
          sessionStorage.setItem('session_verified', 'true');
          sessionStorage.setItem('session_heartbeat', Date.now().toString());
        } else {
          console.log('❌ Authentication failed');
          
          localStorage.removeItem('auth_state');
          sessionStorage.removeItem('session_verified');
          sessionStorage.removeItem('session_heartbeat');
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
          sessionStorage.setItem('session_heartbeat', Date.now().toString());
        } else {
          // Session expired, clear state
          console.log('🔄 Session expired, clearing authentication');
          localStorage.removeItem('auth_state');
          sessionStorage.removeItem('session_verified');
          sessionStorage.removeItem('session_heartbeat');
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
    
    // Set logout flag and clear all cached state
    localStorage.setItem('logout_flag', 'true');
    localStorage.removeItem('auth_state');
    sessionStorage.removeItem('session_verified');
    sessionStorage.removeItem('session_heartbeat');
    
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