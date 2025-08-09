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
      console.log('Starting logout process...');
      
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
      console.log('Cleared local storage');
      
      // Call logout endpoint
      try {
        const response = await fetch('/api/auth/logout', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        console.log('Logout API response:', response.status);
      } catch (apiError) {
        console.error('Logout API failed:', apiError);
      }
      
      // Force redirect
      console.log('Redirecting to home...');
      window.location.replace('/');
    } catch (error) {
      console.error('Logout error:', error);
      window.location.replace('/');
    }
  };

  return {
    ...authState,
    refreshAuth: checkAuth,
    logout
  };
}