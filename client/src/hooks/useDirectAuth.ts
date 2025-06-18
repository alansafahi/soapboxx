import { useState, useEffect } from 'react';
import { authManager } from '@/lib/authState';
import { User } from '@shared/schema';

export function useDirectAuth() {
  const [state, setState] = useState(authManager.getState());

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = authManager.subscribe(setState);
    
    // Check authentication on mount
    authManager.checkAuth();
    
    return unsubscribe;
  }, []);

  return {
    user: state.user,
    isLoading: state.isLoading,
    isAuthenticated: state.isAuthenticated,
    login: authManager.login.bind(authManager),
    logout: authManager.logout.bind(authManager),
    checkAuth: authManager.checkAuth.bind(authManager),
  };
}