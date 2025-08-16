import { useEffect } from 'react';

export default function UltimateLogoutPage() {
  useEffect(() => {
    const ultimateLogout = () => {
      console.log('ULTIMATE LOGOUT: Initiating browser-level session destruction');
      
      // Step 1: Clear all browser storage aggressively
      try {
        localStorage.clear();
        sessionStorage.clear();
        
        // Clear all cookies for every possible domain
        const hostParts = window.location.hostname.split('.');
        const domains = [
          window.location.hostname,
          '.' + window.location.hostname,
          'replit.dev',
          '.replit.dev',
          'localhost',
          '127.0.0.1'
        ];
        
        // Add subdomain variations
        for (let i = 0; i < hostParts.length; i++) {
          domains.push('.' + hostParts.slice(i).join('.'));
        }
        
        const cookies = document.cookie.split(';');
        cookies.forEach(cookie => {
          const eqPos = cookie.indexOf('=');
          const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
          
          // Clear for all domains and paths
          domains.forEach(domain => {
            const domainStr = domain ? `;domain=${domain}` : '';
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/${domainStr}`;
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;${domainStr}`;
          });
        });
        
        // Clear IndexedDB
        if ('indexedDB' in window) {
          const databases = ['authCache', 'sessionStore', 'soapbox', 'userCache', 'workbox-precache'];
          databases.forEach(db => {
            try {
              indexedDB.deleteDatabase(db);
            } catch (e) {
              console.error('Failed to delete database:', db, e);
            }
          });
        }
        
        // Clear WebSQL if available
        if ('openDatabase' in window) {
          try {
            const db = (window as any).openDatabase('', '', '', '');
            db.transaction((tx: any) => {
              tx.executeSql('DROP TABLE IF EXISTS sessions');
            });
          } catch (e) {
            console.error('WebSQL clear failed:', e);
          }
        }
        
        // Clear service workers
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.getRegistrations().then(registrations => {
            registrations.forEach(registration => {
              registration.unregister();
            });
          });
        }
        
        // Clear cache storage
        if ('caches' in window) {
          caches.keys().then(names => {
            names.forEach(name => {
              caches.delete(name);
            });
          });
        }
        
        console.log('ULTIMATE LOGOUT: All browser storage cleared');
      } catch (e) {
        console.error('ULTIMATE LOGOUT: Storage clear error:', e);
      }
      
      // Step 2: Force browser to discard page
      try {
        // Clear window references
        (window as any).user = null;
        (window as any).auth = null;
        (window as any).session = null;
        
        // Clear history
        while (window.history.length > 1) {
          window.history.back();
        }
        
        // Replace current page immediately
        window.location.replace('/login?forced=true&t=' + Date.now());
        
      } catch (e) {
        console.error('ULTIMATE LOGOUT: Redirect error:', e);
        // Final fallback - reload to login
        window.location.href = '/login?forced=true&t=' + Date.now();
      }
    };
    
    // Execute immediately
    ultimateLogout();
    
    // Backup execution after small delay
    setTimeout(ultimateLogout, 100);
    
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-500 to-purple-600 flex items-center justify-center">
      <div className="text-center text-white">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mx-auto mb-6"></div>
        <h1 className="text-3xl font-bold mb-4">ULTIMATE LOGOUT</h1>
        <p className="text-xl mb-2">Destroying all sessions...</p>
        <p className="text-sm opacity-75">Clearing browser storage and forcing logout</p>
      </div>
    </div>
  );
}