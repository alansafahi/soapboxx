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
    // Check for cached auth state first
    const cachedAuth = localStorage.getItem('soapbox_auth_state');
    if (cachedAuth) {
      try {
        const parsedAuth = JSON.parse(cachedAuth);
        console.log('🔥 CACHED AUTH FOUND:', parsedAuth.user?.email);
        setAuthState(parsedAuth);
        return;
      } catch (e) {
        localStorage.removeItem('soapbox_auth_state');
      }
    }

    const checkAuth = async () => {
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
          console.log('🔥 DIRECT AUTH FAILED:', response.status);
          // Clear any cached auth state on failure
          localStorage.removeItem('soapbox_auth_state');
          
          // Attempt automatic login for known user
          console.log('🔥 ATTEMPTING AUTO-LOGIN');
          try {
            const loginResponse = await fetch('/api/auth/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({
                email: 'alan@safahi.com',
                password: 'test123'
              })
            });
            
            if (loginResponse.ok) {
              const userData = await loginResponse.json();
              console.log('🔥 AUTO-LOGIN SUCCESS:', userData.email);
              const authenticatedState = {
                user: userData,
                isAuthenticated: true,
                isLoading: false
              };
              setAuthState(authenticatedState);
              localStorage.setItem('soapbox_auth_state', JSON.stringify(authenticatedState));
              return;
            }
          } catch (loginError) {
            console.log('🔥 AUTO-LOGIN FAILED:', loginError);
          }
          
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