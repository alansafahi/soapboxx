// Direct authentication manager with session persistence
import { useState, useEffect } from 'react';
import { authSync } from './authSync';

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
    // Initialize the auth sync system
    authSync.initialize();
    
    // Subscribe to auth sync state changes
    const unsubscribe = authSync.subscribe((syncState) => {
      if (syncState) {
        console.log('🔄 AuthSync state update:', syncState.user?.email, 'authenticated:', syncState.isAuthenticated);
        setAuthState({
          user: syncState.user,
          isAuthenticated: syncState.isAuthenticated,
          isLoading: false
        });
      } else {
        console.log('🔄 AuthSync state update: unauthenticated');
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false
        });
      }
    });

    // Initial sync with server
    authSync.syncWithServer();

    return unsubscribe;
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