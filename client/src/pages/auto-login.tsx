import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogIn, CheckCircle, AlertCircle } from 'lucide-react';

export default function AutoLoginPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Automatically trigger auto-login when page loads
    handleAutoLogin();
  }, []);

  const handleAutoLogin = async () => {
    try {
      setStatus('loading');
      setMessage('Establishing authenticated session...');
      
      // Call the auto-login endpoint to establish session
      const response = await fetch('/api/debug/auto-login', {
        method: 'GET',
        credentials: 'include'
      });

      if (response.redirected) {
        // If redirected, it means login was successful
        setStatus('success');
        setMessage('Authentication successful! Redirecting to dashboard...');
        
        // Small delay before redirect to show success message
        setTimeout(() => {
          window.location.href = '/';
        }, 1500);
      } else if (response.ok) {
        setStatus('success');
        setMessage('Authentication successful!');
        
        setTimeout(() => {
          window.location.href = '/';
        }, 1500);
      } else {
        setStatus('error');
        setMessage('Authentication failed. Please try again.');
      }
    } catch (error) {
      console.error('Auto-login error:', error);
      setStatus('error');
      setMessage('Authentication failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <LogIn className="h-6 w-6" />
            Auto Login
          </CardTitle>
          <CardDescription>
            Establishing authenticated session for SoapBox Super App
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            {status === 'loading' && (
              <div className="space-y-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-muted-foreground">{message}</p>
              </div>
            )}
            
            {status === 'success' && (
              <div className="space-y-3">
                <CheckCircle className="h-8 w-8 text-green-500 mx-auto" />
                <p className="text-sm text-green-600 dark:text-green-400">{message}</p>
              </div>
            )}
            
            {status === 'error' && (
              <div className="space-y-3">
                <AlertCircle className="h-8 w-8 text-red-500 mx-auto" />
                <p className="text-sm text-red-600 dark:text-red-400">{message}</p>
                <Button onClick={handleAutoLogin} className="w-full">
                  Try Again
                </Button>
              </div>
            )}
          </div>
          
          <div className="text-center">
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/login'}
              className="w-full"
            >
              Go to Login Page
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}