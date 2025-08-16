import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { AlertTriangle, LogOut, CheckCircle } from 'lucide-react';

export default function EmergencyLogoutPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Performing emergency logout...');

  useEffect(() => {
    const performEmergencyLogout = async () => {
      try {
        // Clear all storage immediately
        localStorage.clear();
        sessionStorage.clear();
        
        // Clear IndexedDB
        if ('indexedDB' in window) {
          try {
            indexedDB.deleteDatabase('authCache');
          } catch (e) {
            // Silent fail
          }
        }
        
        // Clear all cookies
        document.cookie.split(";").forEach(function(c) { 
          document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
        });
        
        // Call emergency logout endpoint
        try {
          const response = await fetch('/api/emergency-logout', {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          const result = await response.json();
          console.log('Emergency logout result:', result);
        } catch (e) {
          console.error('Emergency logout failed:', e);
        }
        
        // Also call regular logout endpoint multiple times
        for (let i = 0; i < 3; i++) {
          try {
            await fetch('/api/auth/logout', {
              method: 'POST',
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json',
              },
            });
          } catch (e) {
            // Continue
          }
        }
        
        setStatus('success');
        setMessage('Emergency logout completed. All sessions cleared.');
        
        // Redirect after 2 seconds
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
        
      } catch (error) {
        setStatus('error');
        setMessage('Emergency logout failed. Please clear browser data manually.');
      }
    };

    performEmergencyLogout();
  }, []);

  return (
    <div className="min-h-screen bg-red-50 dark:bg-red-900/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-red-200">
        <CardHeader className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <CardTitle className="text-2xl font-bold text-red-800">Emergency Logout</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            {status === 'loading' && (
              <>
                <LogOut className="h-8 w-8 animate-pulse text-red-600" />
                <p className="text-center text-red-700">{message}</p>
              </>
            )}
            
            {status === 'success' && (
              <>
                <CheckCircle className="h-8 w-8 text-green-600" />
                <p className="text-center text-green-700 font-medium">{message}</p>
                <p className="text-sm text-gray-600">Redirecting to login...</p>
              </>
            )}
            
            {status === 'error' && (
              <>
                <AlertTriangle className="h-8 w-8 text-red-600" />
                <p className="text-center text-red-700 font-medium">{message}</p>
                <Button 
                  onClick={() => window.location.href = '/login'}
                  className="w-full bg-red-600 hover:bg-red-700"
                >
                  Go to Login
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}