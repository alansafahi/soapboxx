// Simple authentication hook without complex session management
import { useState, useEffect, useCallback } from 'react';

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

  const checkAuth = useCallback(async () => {
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
        console.log('🔄 Setting authenticated state to true...');
        
        // Force state update with functional setter
        setAuthState(prevState => {
          const newState = {
            user: userData,
            isAuthenticated: true,
            isLoading: false
          };
          console.log('📋 State transition:', { from: prevState, to: newState });
          return newState;
        });
      } else {
        console.log('❌ Authentication failed, status:', response.status);
        const errorText = await response.text();
        console.log('❌ Error response:', errorText);
        setAuthState(prevState => ({
          user: null,
          isAuthenticated: false,
          isLoading: false
        }));
      }
    } catch (error) {
      console.log('🚨 Auth check error:', error);
      setAuthState(prevState => ({
        user: null,
        isAuthenticated: false,
        isLoading: false
      }));
    }
  }, []);

  const refreshAuth = () => {
    console.log('🔄 Refreshing authentication...');
    setAuthState(prev => ({ ...prev, isLoading: true }));
    checkAuth();
  };

  useEffect(() => {
    checkAuth();
  }, []);

  // Check for force refresh flag and listen for storage changes
  useEffect(() => {
    if (sessionStorage.getItem('force_auth_refresh')) {
      sessionStorage.removeItem('force_auth_refresh');
      console.log('🔄 Force refresh detected, re-checking auth...');
      refreshAuth();
    }

    // Listen for storage changes to detect login from other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'supabase.auth.token' && e.newValue && !e.oldValue) {
        console.log('🔄 New authentication detected, refreshing...');
        refreshAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
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