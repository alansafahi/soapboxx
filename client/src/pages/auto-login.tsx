import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AutoLogin() {
  const [status, setStatus] = useState('Establishing authentication...');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const establishAuth = async () => {
      try {
        // Call the auto-login endpoint to establish session
        const response = await fetch('/api/debug/auto-login', {
          method: 'GET',
          credentials: 'include',
          redirect: 'manual' // Don't follow the redirect automatically
        });

        if (response.status === 302) {
          setStatus('Authentication successful! Redirecting...');
          setIsComplete(true);
          
          // Clear any cached auth data and redirect
          setTimeout(() => {
            window.location.href = '/';
          }, 1500);
        } else {
          setStatus('Authentication failed. Please try again.');
        }
      } catch (error) {
        setStatus(`Authentication error: ${error.message}`);
      }
    };

    establishAuth();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-purple-700 dark:text-purple-300">
            SoapBox Authentication
          </CardTitle>
          <CardDescription>
            Setting up your authenticated session
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            {!isComplete && (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
            )}
            {isComplete && (
              <div className="text-green-600 text-xl">✓</div>
            )}
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {status}
            </span>
          </div>
          
          {isComplete && (
            <div className="text-xs text-gray-500 mt-4">
              You will be redirected to the home page shortly...
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}