// Direct authentication manager with session persistence
import { useState, useEffect } from 'react';

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
    const logoutFlag = localStorage.getItem('logout_flag');
    if (logoutFlag) {
      localStorage.removeItem('logout_flag');
      localStorage.removeItem('auth_state');
      return {
        user: null,
        isAuthenticated: false,
        isLoading: false,
        initialized: true
      };
    }

    // Initialize with cached state if available to prevent loading flicker
    const cachedState = localStorage.getItem('auth_state');
    if (cachedState) {
      try {
        const parsed = JSON.parse(cachedState);
        const tenMinutesAgo = Date.now() - (10 * 60 * 1000);
        
        if (parsed.timestamp > tenMinutesAgo && parsed.isAuthenticated && parsed.user) {
          console.log('📦 Initializing with cached auth state:', parsed.user.email);
          return {
            user: parsed.user,
            isAuthenticated: parsed.isAuthenticated,
            isLoading: false,
            initialized: true
          };
        }
      } catch (error) {
        localStorage.removeItem('auth_state');
      }
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
          
          // Cache the authenticated state
          localStorage.setItem('auth_state', JSON.stringify({
            user: userData,
            isAuthenticated: true,
            timestamp: Date.now()
          }));
        } else {
          console.log('❌ Authentication failed');
          
          localStorage.removeItem('auth_state');
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

  const logout = async () => {
    console.log('🚪 Logout initiated');
    
    // Clear all auth state immediately
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      initialized: true
    });
    
    // Set logout flag and clear cached state
    localStorage.setItem('logout_flag', 'true');
    localStorage.removeItem('auth_state');
    
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