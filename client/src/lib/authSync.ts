// Authentication synchronization utility
// Ensures frontend auth state matches backend session state

interface AuthSyncState {
  user: any;
  isAuthenticated: boolean;
  lastSyncTime: number;
}

class AuthSyncManager {
  private static instance: AuthSyncManager;
  private syncState: AuthSyncState | null = null;
  private syncInProgress = false;
  private listeners: Set<(state: AuthSyncState | null) => void> = new Set();

  static getInstance(): AuthSyncManager {
    if (!AuthSyncManager.instance) {
      AuthSyncManager.instance = new AuthSyncManager();
    }
    return AuthSyncManager.instance;
  }

  async syncWithServer(): Promise<AuthSyncState | null> {
    if (this.syncInProgress) {
      return this.syncState;
    }

    this.syncInProgress = true;

    try {
      console.log('🔄 AuthSync: Syncing with server...');
      
      const response = await fetch('/api/auth/user', {
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (response.ok) {
        const userData = await response.json();
        console.log('✅ AuthSync: User authenticated -', userData.email);
        
        this.syncState = {
          user: userData,
          isAuthenticated: true,
          lastSyncTime: Date.now()
        };

        // Persist to localStorage
        localStorage.setItem('auth_sync_state', JSON.stringify(this.syncState));
        
        // Notify all listeners
        this.notifyListeners();
        
        return this.syncState;
      } else {
        console.log('❌ AuthSync: Authentication failed -', response.status);
        
        this.syncState = null;
        localStorage.removeItem('auth_sync_state');
        
        // Notify all listeners
        this.notifyListeners();
        
        return null;
      }
    } catch (error) {
      console.log('🚨 AuthSync: Sync error -', error);
      
      // On network error, try to use cached state if it's recent (< 5 minutes)
      const cachedStateRaw = localStorage.getItem('auth_sync_state');
      if (cachedStateRaw) {
        try {
          const cachedState = JSON.parse(cachedStateRaw);
          const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
          
          if (cachedState.lastSyncTime > fiveMinutesAgo) {
            console.log('📦 AuthSync: Using recent cached state');
            this.syncState = cachedState;
            return this.syncState;
          }
        } catch (parseError) {
          console.log('❌ AuthSync: Failed to parse cached state');
          localStorage.removeItem('auth_sync_state');
        }
      }
      
      this.syncState = null;
      return null;
    } finally {
      this.syncInProgress = false;
    }
  }

  getCurrentState(): AuthSyncState | null {
    return this.syncState;
  }

  subscribe(listener: (state: AuthSyncState | null) => void): () => void {
    this.listeners.add(listener);
    
    // Immediately call with current state
    listener(this.syncState);
    
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => {
      try {
        listener(this.syncState);
      } catch (error) {
        console.error('AuthSync: Listener error -', error);
      }
    });
  }

  clearAuth() {
    console.log('🗑️ AuthSync: Clearing authentication state');
    this.syncState = null;
    localStorage.removeItem('auth_sync_state');
    localStorage.setItem('logout_flag', 'true');
    this.notifyListeners();
  }

  // Initialize from cached state if available
  initialize() {
    const logoutFlag = localStorage.getItem('logout_flag');
    if (logoutFlag) {
      localStorage.removeItem('logout_flag');
      localStorage.removeItem('auth_sync_state');
      console.log('🚫 AuthSync: Logout flag detected, blocking cached auth');
      return;
    }

    const cachedStateRaw = localStorage.getItem('auth_sync_state');
    if (cachedStateRaw) {
      try {
        const cachedState = JSON.parse(cachedStateRaw);
        console.log('📦 AuthSync: Initializing with cached state -', cachedState.user?.email);
        this.syncState = cachedState;
      } catch (error) {
        console.log('❌ AuthSync: Failed to parse initial cached state');
        localStorage.removeItem('auth_sync_state');
      }
    }
  }
}

export const authSync = AuthSyncManager.getInstance();