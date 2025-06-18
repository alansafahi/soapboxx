import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { useState, useEffect } from "react";

export function useAuth() {
  const [demoUser, setDemoUser] = useState(null);

  const { data: user, isLoading, refetch } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
  });

  // Check for demo user in localStorage if API auth fails
  useEffect(() => {
    if (!user && !isLoading) {
      const storedDemoUser = localStorage.getItem('demo-user');
      if (storedDemoUser) {
        try {
          setDemoUser(JSON.parse(storedDemoUser));
        } catch (error) {
          console.error('Invalid demo user data:', error);
          localStorage.removeItem('demo-user');
        }
      }
    } else if (user) {
      // Clear demo user if real auth succeeds
      setDemoUser(null);
      localStorage.removeItem('demo-user');
    }
  }, [user, isLoading]);

  const currentUser = user || demoUser;

  return {
    user: currentUser,
    isLoading,
    isAuthenticated: !!currentUser,
    isDemoMode: !!demoUser && !user,
    refetch,
  };
}
