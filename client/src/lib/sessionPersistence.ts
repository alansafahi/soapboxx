/**
 * Session Persistence Manager
 * Provides robust session management similar to Supabase's persistSession pattern
 */

interface PersistedSession {
  user: any;
  isAuthenticated: boolean;
  timestamp: number;
  sessionId?: string;
}

export class SessionPersistenceManager {
  private static instance: SessionPersistenceManager;
  private sessionKey = 'supabase.auth.token'; // Use Supabase-style key
  private verificationKey = 'session_verified';
  private heartbeatKey = 'session_heartbeat';
  private sessionTimeout = 30 * 60 * 1000; // 30 minutes

  static getInstance(): SessionPersistenceManager {
    if (!SessionPersistenceManager.instance) {
      SessionPersistenceManager.instance = new SessionPersistenceManager();
    }
    return SessionPersistenceManager.instance;
  }

  // Store session with verification
  setSession(user: any, isAuthenticated: boolean): void {
    const sessionData: PersistedSession = {
      user,
      isAuthenticated,
      timestamp: Date.now(),
      sessionId: this.generateSessionId()
    };

    try {
      localStorage.setItem(this.sessionKey, JSON.stringify(sessionData));
      sessionStorage.setItem(this.verificationKey, 'true');
      sessionStorage.setItem(this.heartbeatKey, Date.now().toString());
      
      // Debug: Log what's actually in localStorage
      console.log('💾 Session persisted for:', user.email);
      console.log('🔍 DEBUG: localStorage keys:', Object.keys(localStorage));
      console.log('🔍 DEBUG: supabase.auth.token exists:', !!localStorage.getItem('supabase.auth.token'));
      console.log('🔍 DEBUG: sessionStorage keys:', Object.keys(sessionStorage));
    } catch (error) {
      console.warn('Failed to persist session:', error);
    }
  }

  // Retrieve session with validation
  getSession(): PersistedSession | null {
    try {
      const sessionData = localStorage.getItem(this.sessionKey);
      const isVerified = sessionStorage.getItem(this.verificationKey);
      
      if (!sessionData || !isVerified) {
        return null;
      }

      const parsed: PersistedSession = JSON.parse(sessionData);
      
      // Check if session is still valid (within timeout)
      if (Date.now() - parsed.timestamp > this.sessionTimeout) {
        this.clearSession();
        return null;
      }

      console.log('📦 Retrieved persisted session for:', parsed.user?.email);
      return parsed;
    } catch (error) {
      console.warn('Failed to retrieve session:', error);
      this.clearSession();
      return null;
    }
  }

  // Clear all session data
  clearSession(): void {
    localStorage.removeItem(this.sessionKey);
    localStorage.removeItem('auth_state'); // Legacy cleanup
    sessionStorage.removeItem(this.verificationKey);
    sessionStorage.removeItem(this.heartbeatKey);
    localStorage.setItem('logout_flag', 'true');
    console.log('🧹 Session cleared');
  }

  // Update heartbeat
  updateHeartbeat(): void {
    sessionStorage.setItem(this.heartbeatKey, Date.now().toString());
  }

  // Check if session is verified
  isSessionVerified(): boolean {
    return sessionStorage.getItem(this.verificationKey) === 'true';
  }

  // Check logout flag
  hasLogoutFlag(): boolean {
    return localStorage.getItem('logout_flag') === 'true';
  }

  // Clear logout flag
  clearLogoutFlag(): void {
    localStorage.removeItem('logout_flag');
  }

  private generateSessionId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
}

export const sessionManager = SessionPersistenceManager.getInstance();