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

const notifyListeners = (newState: AuthState) => {
  globalAuthState = newState;
  authListeners.forEach(listener => listener(newState));
};

export function useImmediateAuth() {
  const [authState, setAuthState] = useState<AuthState>(globalAuthState);

  useEffect(() => {
    const listener = (newState: AuthState) => {
      console.log('🔄 Auth state updated:', newState);
      setAuthState(newState);
      
      // Redirect to dashboard if user becomes authenticated while on login page
      if (newState.isAuthenticated && window.location.pathname === '/login') {
        console.log('🔄 Authenticated user on login page, forcing page refresh to dashboard...');
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
      console.log('🔍 Immediate auth check starting...');
      
      const response = await fetch('/api/auth/user', {
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'X-Requested-With': 'XMLHttpRequest'
        }
      });

      console.log('📡 Auth response status:', response.status);

      if (response.ok) {
        const userData = await response.json();
        console.log('✅ User authenticated:', userData.email);
        
        const newState = {
          user: userData,
          isAuthenticated: true,
          isLoading: false
        };
        
        console.log('📋 Immediately setting auth state:', newState);
        notifyListeners(newState);
        
        // Force render update
        setTimeout(() => {
          const event = new CustomEvent('authStateChanged', { detail: newState });
          window.dispatchEvent(event);
        }, 100);
        
        // Immediate redirect if on login page
        if (window.location.pathname === '/login') {
          console.log('🔄 User authenticated on login page, immediate redirect to dashboard');
          window.location.replace('/');
        }
      } else {
        console.log('❌ Authentication failed, status:', response.status);
        const newState = {
          user: null,
          isAuthenticated: false,
          isLoading: false
        };
        notifyListeners(newState);
      }
    } catch (error) {
      console.log('🚨 Auth check error:', error);
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
      console.log('🚪 Logging out...');
      
      // Clear state immediately
      const newState = {
        user: null,
        isAuthenticated: false,
        isLoading: false
      };
      notifyListeners(newState);
      
      // Clear storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Call logout endpoint
      fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      }).catch(() => {});
      
      // Redirect
      window.location.href = '/';
    } catch (error) {
      console.log('Logout error:', error);
      window.location.href = '/';
    }
  };

  return {
    ...authState,
    refreshAuth: checkAuth,
    logout
  };
}