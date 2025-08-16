// Immediate authentication system for reliable state updates
import { useState, useEffect } from 'react';

interface AuthState {
  user: any;
  isAuthenticated: boolean;
  isLoading: boolean;
}

let globalAuthState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false // Start with false to prevent infinite loading
};

let authListeners: Array<(state: AuthState) => void> = [];
let isLoggingOut = false;

const notifyListeners = (newState: AuthState) => {
  globalAuthState = newState;
  authListeners.forEach(listener => listener(newState));
};

export function useImmediateAuth() {
  const [authState, setAuthState] = useState<AuthState>(globalAuthState);

  useEffect(() => {
    const listener = (newState: AuthState) => {
      setAuthState(newState);
      
      // Redirect to dashboard if user becomes authenticated while on login page
      if (newState.isAuthenticated && window.location.pathname === '/login') {
        // Use window.location.href for immediate redirection
        window.location.href = '/';
      }
    };
    
    authListeners.push(listener);
    
    return () => {
      authListeners = authListeners.filter(l => l !== listener);
    };
  }, []);

  const checkAuth = async () => {
    try {
      // Don't check auth if we're in the middle of logging out
      if (isLoggingOut) {
        return;
      }
      
      const response = await fetch('/api/auth/user', {
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'X-Requested-With': 'XMLHttpRequest'
        }
      });


      if (response.ok) {
        const userData = await response.json();
        
        const newState = {
          user: userData,
          isAuthenticated: true,
          isLoading: false
        };
        
        notifyListeners(newState);
        
        // Force render update
        setTimeout(() => {
          const event = new CustomEvent('authStateChanged', { detail: newState });
          window.dispatchEvent(event);
        }, 100);
        
        // Immediate redirect if on login page
        if (window.location.pathname === '/login') {
          window.location.replace('/');
        }
      } else {
        const newState = {
          user: null,
          isAuthenticated: false,
          isLoading: false
        };
        notifyListeners(newState);
      }
    } catch (error) {
      const newState = {
        user: null,
        isAuthenticated: false,
        isLoading: false
      };
      notifyListeners(newState);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const logout = async () => {
    try {
      // Set logout flag to prevent checkAuth from running
      isLoggingOut = true;
      
      // Clear state immediately
      const newState = {
        user: null,
        isAuthenticated: false,
        isLoading: false
      };
      notifyListeners(newState);
      
      // Clear storage completely
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear any cached auth data
      if ('indexedDB' in window) {
        try {
          // Clear IndexedDB if it exists
          indexedDB.deleteDatabase('authCache');
        } catch (e) {
          // Silent fail
        }
      }
      
      // Call logout endpoint multiple times to ensure session destruction
      for (let i = 0; i < 3; i++) {
        try {
          await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
          });
        } catch (apiError) {
          // Continue trying
        }
      }
      
      // Clear all cookies manually
      document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
      });
      
      // Force redirect to login page instead of home
      window.location.href = '/login';
    } catch (error) {
      // Reset logout flag on error
      isLoggingOut = false;
      window.location.href = '/login';
    } finally {
      // Reset logout flag after a delay to allow redirect
      setTimeout(() => {
        isLoggingOut = false;
      }, 3000);
    }
  };

  return {
    ...authState,
    refreshAuth: checkAuth,
    logout
  };
}