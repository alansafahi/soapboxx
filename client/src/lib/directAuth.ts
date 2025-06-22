// Direct authentication manager with session persistence
import { useState, useEffect } from 'react';

interface AuthState {
  user: any;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export function useDirectAuth() {
  const [authState, setAuthState] = useState<AuthState>(() => {
    // Initialize with cached state if available to prevent loading flicker
    const cachedState = localStorage.getItem('auth_state');
    if (cachedState) {
      try {
        const parsed = JSON.parse(cachedState);
        const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
        
        if (parsed.timestamp > fiveMinutesAgo && parsed.isAuthenticated && parsed.user) {
          console.log('📦 Initializing with cached auth state:', parsed.user.email);
          return {
            user: parsed.user,
            isAuthenticated: parsed.isAuthenticated,
            isLoading: false
          };
        }
      } catch (error) {
        localStorage.removeItem('auth_state');
      }
    }
    
    return {
      user: null,
      isAuthenticated: false,
      isLoading: true
    };
  });

  useEffect(() => {
    const checkAuth = async () => {
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
            isLoading: false
          });
          
          // Cache the authenticated state
          localStorage.setItem('auth_state', JSON.stringify({
            user: userData,
            isAuthenticated: true,
            timestamp: Date.now()
          }));
        } else {
          console.log('❌ Authentication failed');
          
          // Clear any cached state
          localStorage.removeItem('auth_state');
          
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false
          });
        }
      } catch (error) {
        console.log('🚨 Auth check error:', error);
        
        // If we already have cached state loaded, don't clear it on network error
        if (!authState.isAuthenticated) {
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false
          });
        }
      }
    };

    // Check for logout flag
    const logoutFlag = localStorage.getItem('logout_flag');
    if (logoutFlag) {
      localStorage.removeItem('logout_flag');
      localStorage.removeItem('auth_state');
      console.log('🚫 Logout flag detected');
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false
      });
      return;
    }

    // Always validate with server (but don't clear cached state on error)
    checkAuth();
  }, []);

  const logout = async () => {
    console.log('🚪 Logout initiated');
    
    // Clear all auth state immediately
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false
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