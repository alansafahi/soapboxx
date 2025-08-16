import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Shield, LogOut, RefreshCw, AlertCircle } from 'lucide-react';

export default function ForceLogout() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [stage, setStage] = useState<'warning' | 'processing' | 'complete'>('warning');

  useEffect(() => {
    // Auto-start after 3 seconds
    const timer = setTimeout(() => {
      if (stage === 'warning') {
        handleForceLogout();
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [stage]);

  const handleForceLogout = async () => {
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    setStage('processing');

    try {
      console.log('FORCE LOGOUT: Starting forced logout process');
      
      // Stage 1: Clear local storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Stage 2: Clear IndexedDB aggressively
      if ('indexedDB' in window) {
        try {
          const databases = ['authCache', 'sessionStore', 'soapbox', 'userCache', 'userPrefs', 'appData'];
          for (const db of databases) {
            indexedDB.deleteDatabase(db);
          }
        } catch (e) {
          console.error('Database clear error:', e);
        }
      }
      
      // Stage 3: Nuclear cookie clearing
      const domains = [
        window.location.hostname,
        '.' + window.location.hostname,
        'replit.dev',
        '.replit.dev',
        'localhost'
      ];
      
      const cookies = document.cookie.split(";");
      for (let cookie of cookies) {
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        
        for (const domain of domains) {
          const domainStr = domain ? `;domain=${domain}` : '';
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/${domainStr}`;
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;secure${domainStr}`;
        }
      }
      
      // Stage 4: Multiple logout API calls
      const logoutEndpoints = ['/api/auth/logout', '/api/auth/force-logout', '/api/session/terminate'];
      
      for (const endpoint of logoutEndpoints) {
        try {
          await fetch(endpoint, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
          });
        } catch (e) {
          console.error(`FORCE LOGOUT: ${endpoint} failed:`, e);
        }
      }
      
      // Stage 5: Clear global window objects
      const windowKeys = ['user', 'auth', 'session', 'soapbox', 'currentUser'];
      windowKeys.forEach(key => {
        if ((window as any)[key]) (window as any)[key] = null;
      });
      
      setStage('complete');
      
      // Final redirect
      setTimeout(() => {
        window.location.href = '/login';
      }, 1000);
      
    } catch (error) {
      console.error('FORCE LOGOUT: Error during logout:', error);
      window.location.href = '/login';
    }
  };

  if (stage === 'complete') {
    return (
      <div className="min-h-screen bg-green-50 dark:bg-green-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <div className="flex justify-center mb-6">
            <Shield className="h-16 w-16 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Logout Complete
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            All session data has been securely cleared. Redirecting to login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50 dark:bg-orange-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
        <div className="flex justify-center mb-6">
          <AlertCircle className="h-16 w-16 text-orange-500" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Force Logout Required
        </h1>
        
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Your session needs to be forcibly terminated. This will clear all authentication data and stored information.
        </p>
        
        {stage === 'processing' && (
          <div className="mb-6">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-orange-500 mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Clearing session data...
            </p>
          </div>
        )}
        
        <div className="space-y-3">
          <Button 
            onClick={handleForceLogout}
            disabled={isLoggingOut}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white"
          >
            {isLoggingOut ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Processing Force Logout...
              </>
            ) : (
              <>
                <LogOut className="h-4 w-4 mr-2" />
                Force Logout Now
              </>
            )}
          </Button>
        </div>
        
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-4">
          This will forcibly terminate your session and clear all stored data across multiple storage systems.
        </p>
      </div>
    </div>
  );
}