// Simple authentication hook without complex session management
import { useState, useEffect } from 'react';

interface AuthState {
  user: any;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export function useSimpleAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true
  });

  const checkAuth = async () => {
    try {
      console.log('🔍 Checking authentication...');
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
      } else {
        console.log('❌ Authentication failed');
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false
        });
      }
    } catch (error) {
      console.log('🚨 Auth check error:', error);
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false
      });
    }
  };

  const refreshAuth = () => {
    console.log('🔄 Refreshing authentication...');
    setAuthState(prev => ({ ...prev, isLoading: true }));
    checkAuth();
  };

  useEffect(() => {
    checkAuth();
  }, []);

  // Check for force refresh flag
  useEffect(() => {
    if (sessionStorage.getItem('force_auth_refresh')) {
      sessionStorage.removeItem('force_auth_refresh');
      console.log('🔄 Force refresh detected, re-checking auth...');
      refreshAuth();
    }
  }, []);

  const logout = async () => {
    try {
      console.log('🚪 Logging out...');
      
      // Clear state immediately
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false
      });
      
      // Clear all storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Call logout endpoint (non-blocking)
      fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      }).catch(() => {
        // Ignore errors, we've already cleared the frontend state
      });
      
      // Redirect immediately
      window.location.href = '/';
    } catch (error) {
      console.log('Logout error:', error);
      // Still redirect even if logout fails
      window.location.href = '/';
    }
  };

  return {
    ...authState,
    refreshAuth,
    logout
  };
}