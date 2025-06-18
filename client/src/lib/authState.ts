// Direct authentication state management to bypass React Query caching issues
import { User } from "@shared/schema";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

let authState: AuthState = {
  user: null,
  isLoading: false,
  isAuthenticated: false,
};

const listeners = new Set<(state: AuthState) => void>();

export const authManager = {
  getState: () => authState,
  
  setState: (newState: Partial<AuthState>) => {
    authState = { ...authState, ...newState };
    listeners.forEach(listener => listener(authState));
  },
  
  subscribe: (listener: (state: AuthState) => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  
  async checkAuth(): Promise<User | null> {
    this.setState({ isLoading: true });
    
    try {
      const response = await fetch('/api/auth/user', {
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (response.ok) {
        const user = await response.json();
        this.setState({ 
          user, 
          isAuthenticated: true, 
          isLoading: false 
        });
        return user;
      } else {
        this.setState({ 
          user: null, 
          isAuthenticated: false, 
          isLoading: false 
        });
        return null;
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      this.setState({ 
        user: null, 
        isAuthenticated: false, 
        isLoading: false 
      });
      return null;
    }
  },
  
  async login(email: string, password: string): Promise<User | null> {
    this.setState({ isLoading: true });
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });
      
      if (response.ok) {
        const user = await response.json();
        this.setState({ 
          user, 
          isAuthenticated: true, 
          isLoading: false 
        });
        return user;
      } else {
        this.setState({ 
          user: null, 
          isAuthenticated: false, 
          isLoading: false 
        });
        return null;
      }
    } catch (error) {
      console.error('Login failed:', error);
      this.setState({ 
        user: null, 
        isAuthenticated: false, 
        isLoading: false 
      });
      return null;
    }
  },
  
  logout() {
    this.setState({ 
      user: null, 
      isAuthenticated: false, 
      isLoading: false 
    });
  }
};