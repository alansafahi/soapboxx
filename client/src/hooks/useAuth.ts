import { useState, useEffect } from "react";

export function useAuth() {
  const [demoUser, setDemoUser] = useState<any>(null);
  const [authState, setAuthState] = useState({ 
    user: null as any, 
    isLoading: true, 
    isAuthenticated: false 
  });
  const [logoutFlag, setLogoutFlag] = useState(false);

  // Direct authentication check without React Query caching
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
      console.error('Auth check failed:', error);
      setAuthState({ 
        user: null, 
        isLoading: false, 
        isAuthenticated: false 
      });
      return null;
    }
  };

  // Logout function to properly clear authentication state
  const logout = () => {
    setLogoutFlag(true);
    setAuthState({ 
      user: null, 
      isLoading: false, 
      isAuthenticated: false 
    });
    setDemoUser(null);
    // Clear any stored session data
    localStorage.clear();
    sessionStorage.clear();
  };

  // Check auth on mount and add periodic refresh
  useEffect(() => {
    checkAuth();
    
    // Add periodic auth check every 5 seconds to catch state changes
    const interval = setInterval(() => {
      if (!authState.isAuthenticated && !logoutFlag) {
        checkAuth();
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [authState.isAuthenticated, logoutFlag]);

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
    logout,
  };
}