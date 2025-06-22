// Direct authentication manager bypassing React Query issues
import { useState, useEffect } from 'react';

interface AuthState {
  user: any;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export function useDirectAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true
  });

  useEffect(() => {
    // Check if user just logged out - prevent cached auth restoration
    const logoutFlag = localStorage.getItem('logout_flag');
    if (logoutFlag) {
      localStorage.removeItem('logout_flag');
      localStorage.removeItem('soapbox_auth_state');
      console.log('🚫 LOGOUT FLAG DETECTED - BLOCKING CACHED AUTH');
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false
      });
      return;
    }

    const checkAuth = async () => {
      // CRITICAL SECURITY FIX: Always validate with server first, ignore cached state
      console.log('🔍 Checking authentication status...');
      try {
        const response = await fetch('/api/auth/user', {
          credentials: 'include',
          headers: { 'Cache-Control': 'no-cache' }
        });
        
        if (response.ok) {
          const userData = await response.json();
          console.log('🔥 DIRECT AUTH SUCCESS:', userData.email);
          console.log('🔥 SETTING AUTHENTICATED STATE TO TRUE');
          
          // Force authenticated state immediately
          const authenticatedState = {
            user: userData,
            isAuthenticated: true,
            isLoading: false
          };
          
          setAuthState(authenticatedState);
          
          // Also store in localStorage for persistence
          localStorage.setItem('soapbox_auth_state', JSON.stringify(authenticatedState));
          
          // Force immediate UI update by triggering a re-render
          setTimeout(() => {
            console.log('🔥 FORCING UI REFRESH FOR AUTHENTICATED STATE');
            window.location.hash = '#authenticated';
            window.location.hash = '';
          }, 100);
        } else {
          console.log('📡 Auth response status:', response.status);
          console.log('❌ Auth failed with status:', response.status);
          
          // CRITICAL SECURITY FIX: Clear ALL cached authentication data immediately
          localStorage.removeItem('soapbox_auth_state');
          localStorage.removeItem('auth_cache');
          localStorage.removeItem('user_cache');
          sessionStorage.clear(); // Clear session storage too
          
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false
          });
        }
      } catch (error) {
        console.log('🔥 DIRECT AUTH ERROR:', error);
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false
        });
      }
    };

    checkAuth();
  }, []);

  const logout = async () => {
    try {
      // Clear ALL localStorage items related to auth
      localStorage.removeItem('soapbox_auth_state');
      localStorage.removeItem('auth_cache');
      localStorage.removeItem('user_cache');
      
      // Set logout flag to prevent cached auth restoration
      localStorage.setItem('logout_flag', 'true');
      
      // Set unauthenticated state immediately
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false
      });
      
      // Call backend logout endpoint
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      
      // Force complete page reload to login page
      window.location.replace('/login');
    } catch (error) {
      console.log('Logout error:', error);
      // Even if backend fails, clear frontend state
      localStorage.clear(); // Clear everything
      localStorage.setItem('logout_flag', 'true');
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false
      });
      window.location.replace('/login');
    }
  };

  return { ...authState, logout };
}