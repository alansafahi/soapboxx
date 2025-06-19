import { useState, useEffect } from "react";

export function useAuth() {
  const [demoUser, setDemoUser] = useState(null);
  const [authState, setAuthState] = useState({ 
    user: null, 
    isLoading: true, 
    isAuthenticated: false 
  });

  // Direct authentication check without React Query caching
  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/user', {
        credentials: 'include',
        headers: { 'Cache-Control': 'no-cache' }
      });
      
      if (response.ok) {
        const userData = await response.json();
        setAuthState({ 
          user: userData, 
          isLoading: false, 
          isAuthenticated: true 
        });
        return userData;
      } else {
        setAuthState({ 
          user: null, 
          isLoading: false, 
          isAuthenticated: false 
        });
        return null;
      }
    } catch (error) {
      setAuthState({ 
        user: null, 
        isLoading: false, 
        isAuthenticated: false 
      });
      return null;
    }
  };

  // Check auth on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Demo mode logic
  useEffect(() => {
    if (!authState.user && !authState.isLoading) {
      const demoTriggerElement = document.getElementById('demo-trigger');
      if (demoTriggerElement) {
        const demoUserData = {
          id: 'demo-user',
          firstName: 'Demo',
          lastName: 'User',
          email: 'demo@example.com',
          role: 'member',
          username: 'demouser'
        };
        setDemoUser(demoUserData);
      } else {
        setDemoUser(null);
      }
    } else if (authState.user) {
      setDemoUser(null);
    }
  }, [authState.user, authState.isLoading]);

  const currentUser = authState.user || demoUser;

  return {
    user: currentUser,
    isLoading: authState.isLoading,
    isAuthenticated: authState.isAuthenticated || !!demoUser,
    isDemoMode: !!demoUser && !authState.user,
    refetch: checkAuth,
  };
}