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
    console.log('🚪 LOGOUT INITIATED - Clearing all authentication state');
    
    // STEP 1: IMMEDIATELY clear frontend state to force UI re-render
    console.log('🗑️ Clearing frontend authentication state immediately');
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false
    });
    
    try {
      // STEP 2: Clear ALL possible storage locations
      console.log('🧹 Clearing all storage (localStorage, sessionStorage)');
      localStorage.clear(); // Clear everything
      sessionStorage.clear(); // Clear session storage
      
      // STEP 3: Set logout flag to prevent auth restoration
      localStorage.setItem('logout_flag', 'true');
      console.log('🚫 Logout flag set to prevent cache restoration');
      
      // STEP 4: Call backend logout endpoint (non-blocking)
      console.log('📡 Calling backend logout endpoint');
      fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(response => {
        if (response.ok) {
          console.log('✅ Backend logout successful');
        } else {
          console.log('⚠️ Backend logout failed, but frontend already cleared');
        }
      }).catch(error => {
        console.log('⚠️ Backend logout error:', error);
      });
      
      // STEP 5: Force immediate navigation to login page
      console.log('🔄 Redirecting to login page immediately');
      window.location.replace('/login');
      
    } catch (error) {
      console.log('❌ Logout error:', error);
      
      // Even if anything fails, ensure complete frontend cleanup
      console.log('🛡️ Emergency cleanup - clearing all state');
      localStorage.clear();
      sessionStorage.clear();
      localStorage.setItem('logout_flag', 'true');
      
      // Force navigation even on error
      window.location.replace('/login');
    }
  };

  return { ...authState, logout };
}