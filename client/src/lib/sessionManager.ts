// Session persistence manager to handle authentication state across page reloads
interface SessionData {
  isAuthenticated: boolean;
  lastCheck: number;
  userId?: string;
}

const SESSION_KEY = 'soapbox_auth_state';
const CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes

export const sessionManager = {
  setAuthState(isAuthenticated: boolean, userId?: string) {
    const sessionData: SessionData = {
      isAuthenticated,
      lastCheck: Date.now(),
      userId
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
  },

  getAuthState(): SessionData | null {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      if (!stored) return null;
      
      const sessionData: SessionData = JSON.parse(stored);
      
      // Check if data is stale (older than 5 minutes)
      if (Date.now() - sessionData.lastCheck > CHECK_INTERVAL) {
        this.clearAuthState();
        return null;
      }
      
      return sessionData;
    } catch {
      return null;
    }
  },

  clearAuthState() {
    localStorage.removeItem(SESSION_KEY);
  },

  isSessionValid(): boolean {
    const sessionData = this.getAuthState();
    return sessionData?.isAuthenticated === true;
  }
};