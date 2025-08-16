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
      const response = await fetch('/api/user', { 
        credentials: 'include',
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
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
      } else {
        const newState = {
          user: null,
          isAuthenticated: false,
          isLoading: false
        };
        notifyListeners(newState);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
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
      console.log('LOGOUT: Starting normal logout process');
      isLoggingOut = true;
      
      // Clear state immediately
      const newState = {
        user: null,
        isAuthenticated: false,
        isLoading: false
      };
      notifyListeners(newState);
      
      // Nuclear storage clearing
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear all possible databases
      if ('indexedDB' in window) {
        try {
          const databases = ['authCache', 'sessionStore', 'soapbox', 'userCache'];
          for (const db of databases) {
            indexedDB.deleteDatabase(db);
          }
        } catch (e) {
          console.error('Database clear error:', e);
        }
      }
      
      // Aggressive cookie clearing for all possible domains
      const domains = [
        window.location.hostname,
        '.' + window.location.hostname,
        'replit.dev',
        '.replit.dev',
        'localhost',
        undefined
      ];
      
      const cookies = document.cookie.split(";");
      for (let cookie of cookies) {
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        
        for (const domain of domains) {
          const domainStr = domain ? `;domain=${domain}` : '';
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/${domainStr}`;
        }
      }
      
      // Call logout endpoint with nuclear option
      try {
        const response = await fetch('/api/auth/logout', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        const result = await response.json();
        console.log('NUCLEAR LOGOUT: Server response:', result);
      } catch (e) {
        console.error('NUCLEAR LOGOUT: API call failed:', e);
      }
      
      // Clear window references
      if ((window as any).user) (window as any).user = null;
      if ((window as any).auth) (window as any).auth = null;
      if ((window as any).session) (window as any).session = null;
      
      // Force redirect with replace to prevent back navigation
      console.log('NUCLEAR LOGOUT: Forcing redirect');
      window.location.replace('/login');
      
    } catch (error) {
      console.error('NUCLEAR LOGOUT: Critical error:', error);
      // Force redirect even on error
      window.location.replace('/login');
    }
  };

  return {
    ...authState,
    refreshAuth: checkAuth,
    logout
  };
}