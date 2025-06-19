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
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/user', {
          credentials: 'include',
          headers: { 'Cache-Control': 'no-cache' }
        });
        
        if (response.ok) {
          const userData = await response.json();
          console.log('🔥 DIRECT AUTH SUCCESS:', userData.email);
          setAuthState({
            user: userData,
            isAuthenticated: true,
            isLoading: false
          });
        } else {
          console.log('🔥 DIRECT AUTH FAILED:', response.status);
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

  return authState;
}