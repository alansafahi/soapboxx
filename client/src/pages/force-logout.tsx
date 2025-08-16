import { useEffect } from 'react';

export default function ForceLogoutPage() {
  useEffect(() => {
    const forceLogout = async () => {
      try {
        // Nuclear logout sequence
        console.log('FORCE LOGOUT ACTIVATED');
        
        // Clear all storage
        localStorage.clear();
        sessionStorage.clear();
        
        // Clear all cookies aggressively
        const cookies = document.cookie.split(";");
        for (let cookie of cookies) {
          const eqPos = cookie.indexOf("=");
          const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
          
          // Clear for all possible domain/path combinations
          document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
          document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=" + window.location.hostname;
          document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=." + window.location.hostname;
          document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=replit.dev";
          document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.replit.dev";
        }
        
        // Clear IndexedDB
        if ('indexedDB' in window) {
          indexedDB.deleteDatabase('authCache');
          indexedDB.deleteDatabase('sessionStore');
          indexedDB.deleteDatabase('soapbox');
        }
        
        // Call logout APIs (fire and forget)
        fetch('/api/emergency-logout', { method: 'POST', credentials: 'include' }).catch(() => {});
        fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => {});
        
        // Clear window references
        if ((window as any).user) (window as any).user = null;
        if ((window as any).auth) (window as any).auth = null;
        
        // Force redirect with multiple methods
        setTimeout(() => {
          window.location.replace('/login');
        }, 100);
        
      } catch (error) {
        console.error('Force logout error:', error);
        window.location.replace('/login');
      }
    };

    forceLogout();
  }, []);

  return (
    <div className="min-h-screen bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
        <h1 className="text-xl font-bold text-red-800 mb-2">Force Logout</h1>
        <p className="text-red-600">Clearing all sessions and redirecting...</p>
      </div>
    </div>
  );
}