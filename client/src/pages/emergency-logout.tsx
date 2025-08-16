import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, LogOut, RefreshCw } from 'lucide-react';

export default function EmergencyLogout() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Start countdown immediately
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          handleEmergencyLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleEmergencyLogout = async () => {
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);

    try {
      console.log('EMERGENCY LOGOUT: Starting emergency logout process');
      
      // Clear state immediately
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear IndexedDB
      if ('indexedDB' in window) {
        try {
          const databases = ['authCache', 'sessionStore', 'soapbox', 'userCache'];
          for (const db of databases) {
            indexedDB.deleteDatabase(db);
          }
        } catch (e) {
          console.error('Database clear error:', e);
        }
      }
      
      // Clear cookies
      const cookies = document.cookie.split(";");
      for (let cookie of cookies) {
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      }
      
      // Try to call logout API
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (e) {
        console.error('EMERGENCY LOGOUT: API call failed:', e);
      }
      
      // Clear window references
      if ((window as any).user) (window as any).user = null;
      if ((window as any).auth) (window as any).auth = null;
      
      // Force redirect
      window.location.href = '/login';
      
    } catch (error) {
      console.error('EMERGENCY LOGOUT: Error during logout:', error);
      window.location.href = '/login';
    }
  };

  const handleManualLogout = () => {
    setCountdown(0);
    handleEmergencyLogout();
  };

  return (
    <div className="min-h-screen bg-red-50 dark:bg-red-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
        <div className="flex justify-center mb-6">
          <AlertTriangle className="h-16 w-16 text-red-500" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Emergency Logout
        </h1>
        
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          You are being automatically logged out for security reasons. All session data will be cleared.
        </p>
        
        <div className="mb-6">
          <div className="text-3xl font-bold text-red-500 mb-2">
            {countdown}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Automatic logout in {countdown} second{countdown !== 1 ? 's' : ''}
          </p>
        </div>
        
        <div className="space-y-3">
          <Button 
            onClick={handleManualLogout}
            disabled={isLoggingOut}
            className="w-full bg-red-600 hover:bg-red-700 text-white"
          >
            {isLoggingOut ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Logging Out...
              </>
            ) : (
              <>
                <LogOut className="h-4 w-4 mr-2" />
                Logout Now
              </>
            )}
          </Button>
        </div>
        
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-4">
          This will clear all stored session data and redirect you to the login page.
        </p>
      </div>
    </div>
  );
}