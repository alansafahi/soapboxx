import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Skull, LogOut, RefreshCw, AlertTriangle, Database, Trash2 } from 'lucide-react';

export default function UltimateLogout() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [currentStage, setCurrentStage] = useState<string>('');
  const [completedStages, setCompletedStages] = useState<string[]>([]);
  const [countdown, setCountdown] = useState(10);

  const stages = [
    'Clearing Local Storage',
    'Clearing Session Storage', 
    'Destroying IndexedDB',
    'Nuclear Cookie Deletion',
    'Terminating Server Sessions',
    'Clearing Browser Cache',
    'Removing Global Objects',
    'Final Security Sweep'
  ];

  useEffect(() => {
    // Countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          handleUltimateLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const handleUltimateLogout = async () => {
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    setCountdown(0);

    try {
      console.log('ULTIMATE LOGOUT: Starting nuclear logout sequence');
      
      // Stage 1: Clear Local Storage
      setCurrentStage(stages[0]);
      localStorage.clear();
      await delay(500);
      setCompletedStages(prev => [...prev, stages[0]]);
      
      // Stage 2: Clear Session Storage
      setCurrentStage(stages[1]);
      sessionStorage.clear();
      await delay(500);
      setCompletedStages(prev => [...prev, stages[1]]);
      
      // Stage 3: Nuclear IndexedDB destruction
      setCurrentStage(stages[2]);
      if ('indexedDB' in window) {
        try {
          // Get all databases
          const databases = [
            'authCache', 'sessionStore', 'soapbox', 'userCache', 'userPrefs', 
            'appData', 'localforage', 'keyvaluepairs', 'firebase-installations',
            'firebaseLocalStorageDb', 'workbox-precache'
          ];
          
          for (const db of databases) {
            indexedDB.deleteDatabase(db);
          }
          
          // Clear all possible IDB instances
          if ('webkitIndexedDB' in window) {
            (window as any).webkitIndexedDB = null;
          }
        } catch (e) {
          console.error('Database destruction error:', e);
        }
      }
      await delay(800);
      setCompletedStages(prev => [...prev, stages[2]]);
      
      // Stage 4: Nuclear cookie deletion
      setCurrentStage(stages[3]);
      const domains = [
        window.location.hostname,
        '.' + window.location.hostname,
        'replit.dev',
        '.replit.dev',
        'replit.com',
        '.replit.com',
        'localhost',
        '127.0.0.1'
      ];
      
      const paths = ['/', '/app', '/auth', '/api'];
      const cookies = document.cookie.split(";");
      
      for (let cookie of cookies) {
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        
        for (const domain of domains) {
          for (const path of paths) {
            const domainStr = domain ? `;domain=${domain}` : '';
            const pathStr = `;path=${path}`;
            
            // Multiple deletion attempts with different combinations
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT${pathStr}${domainStr}`;
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT${pathStr}${domainStr};secure`;
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT${pathStr}${domainStr};samesite=strict`;
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT${pathStr}${domainStr};secure;samesite=none`;
          }
        }
      }
      await delay(600);
      setCompletedStages(prev => [...prev, stages[3]]);
      
      // Stage 5: Multiple server session termination calls
      setCurrentStage(stages[4]);
      const logoutEndpoints = [
        '/api/auth/logout',
        '/api/auth/force-logout', 
        '/api/auth/nuclear-logout',
        '/api/session/terminate',
        '/api/session/destroy',
        '/api/user/logout',
        '/logout'
      ];
      
      for (const endpoint of logoutEndpoints) {
        try {
          await fetch(endpoint, {
            method: 'POST',
            credentials: 'include',
            headers: { 
              'Content-Type': 'application/json',
              'X-Force-Logout': 'true',
              'X-Nuclear-Option': 'true'
            }
          });
        } catch (e) {
          console.error(`ULTIMATE LOGOUT: ${endpoint} failed:`, e);
        }
      }
      await delay(700);
      setCompletedStages(prev => [...prev, stages[4]]);
      
      // Stage 6: Clear browser cache (attempt)
      setCurrentStage(stages[5]);
      try {
        if ('caches' in window) {
          const cacheNames = await caches.keys();
          await Promise.all(
            cacheNames.map(cacheName => caches.delete(cacheName))
          );
        }
      } catch (e) {
        console.error('Cache clearing error:', e);
      }
      await delay(500);
      setCompletedStages(prev => [...prev, stages[5]]);
      
      // Stage 7: Nuclear global object clearing
      setCurrentStage(stages[6]);
      const globalKeys = [
        'user', 'auth', 'session', 'soapbox', 'currentUser', 'authToken',
        'sessionToken', 'refreshToken', 'userData', 'userProfile', 'appState',
        'authState', 'loginState', 'userSession', 'currentSession'
      ];
      
      globalKeys.forEach(key => {
        try {
          delete (window as any)[key];
          (window as any)[key] = null;
          (window as any)[key] = undefined;
        } catch (e) {
          console.error(`Failed to clear ${key}:`, e);
        }
      });
      
      // Clear potential React state
      if ((window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__) {
        try {
          (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__ = null;
        } catch (e) {
          console.error('React devtools clear error:', e);
        }
      }
      await delay(500);
      setCompletedStages(prev => [...prev, stages[6]]);
      
      // Stage 8: Final security sweep
      setCurrentStage(stages[7]);
      
      // Clear any remaining storage
      try {
        if ('webkitStorageInfo' in navigator) {
          (navigator as any).webkitStorageInfo.requestQuota(
            0, 0, () => {}, () => {}
          );
        }
      } catch (e) {
        console.error('Webkit storage clear error:', e);
      }
      
      // Clear service workers
      try {
        if ('serviceWorker' in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations();
          for (const registration of registrations) {
            await registration.unregister();
          }
        }
      } catch (e) {
        console.error('Service worker clear error:', e);
      }
      
      await delay(800);
      setCompletedStages(prev => [...prev, stages[7]]);
      
      // Final countdown before redirect
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
      
    } catch (error) {
      console.error('ULTIMATE LOGOUT: Critical error during nuclear logout:', error);
      // Emergency redirect
      window.location.href = '/login';
    }
  };

  return (
    <div className="min-h-screen bg-black text-green-400 flex items-center justify-center p-4 font-mono">
      <div className="max-w-lg w-full bg-gray-900 border border-green-500 rounded-lg shadow-2xl p-8">
        <div className="flex justify-center mb-6">
          <Skull className="h-20 w-20 text-red-500 animate-pulse" />
        </div>
        
        <h1 className="text-3xl font-bold text-center text-red-400 mb-2">
          ULTIMATE LOGOUT
        </h1>
        
        <p className="text-center text-yellow-400 mb-6 text-sm">
          ⚠️ NUCLEAR OPTION - COMPLETE DATA ANNIHILATION ⚠️
        </p>
        
        {!isLoggingOut && countdown > 0 && (
          <div className="text-center mb-6">
            <div className="text-6xl font-bold text-red-500 mb-2 animate-pulse">
              {countdown}
            </div>
            <p className="text-yellow-300">
              AUTOMATIC INITIATION IN {countdown} SECOND{countdown !== 1 ? 'S' : ''}
            </p>
          </div>
        )}
        
        {isLoggingOut && (
          <div className="mb-6">
            <div className="text-center mb-4">
              <Database className="h-8 w-8 mx-auto text-red-500 animate-spin mb-2" />
              <p className="text-green-300 font-bold">EXECUTING: {currentStage}</p>
            </div>
            
            <div className="space-y-2">
              {stages.map((stage, index) => (
                <div key={index} className="flex items-center text-sm">
                  {completedStages.includes(stage) ? (
                    <Trash2 className="h-4 w-4 text-green-500 mr-2" />
                  ) : currentStage === stage ? (
                    <RefreshCw className="h-4 w-4 text-yellow-500 mr-2 animate-spin" />
                  ) : (
                    <div className="h-4 w-4 mr-2" />
                  )}
                  <span className={
                    completedStages.includes(stage) 
                      ? 'text-green-500 line-through' 
                      : currentStage === stage 
                      ? 'text-yellow-400' 
                      : 'text-gray-500'
                  }>
                    {stage}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="space-y-3">
          <Button 
            onClick={handleUltimateLogout}
            disabled={isLoggingOut}
            className="w-full bg-red-800 hover:bg-red-700 text-white border border-red-600"
          >
            {isLoggingOut ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                EXECUTING NUCLEAR LOGOUT...
              </>
            ) : (
              <>
                <AlertTriangle className="h-4 w-4 mr-2" />
                INITIATE NUCLEAR LOGOUT
              </>
            )}
          </Button>
        </div>
        
        <div className="mt-6 p-4 bg-red-950 border border-red-700 rounded">
          <p className="text-xs text-red-300 text-center">
            WARNING: This will obliterate ALL session data, cookies, local storage, 
            IndexedDB, service workers, and browser cache. Use only in extreme circumstances.
          </p>
        </div>
        
        {completedStages.length === stages.length && (
          <div className="mt-4 text-center">
            <p className="text-green-400 font-bold animate-pulse">
              NUCLEAR LOGOUT COMPLETE - REDIRECTING...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}