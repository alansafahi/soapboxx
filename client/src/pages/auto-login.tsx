import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function AutoLoginPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const { checkAuth } = useAuth();

  useEffect(() => {
    const performAutoLogin = async () => {
      try {
        setStatus('loading');
        setMessage('Establishing authenticated session...');

        // Auto-login endpoint disabled for production - redirect to manual login
        setStatus('error');
        setMessage('Auto-login is disabled. Please use manual login.');
      } catch (error) {
        setStatus('error');
        setMessage('Auto-login failed. Please try manual login.');
      }
    };

    performAutoLogin();
  }, [checkAuth]);

  const handleManualLogin = () => {
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-blue-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Auto Login</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            {status === 'loading' && (
              <>
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <p className="text-center text-gray-600">{message}</p>
              </>
            )}
            
            {status === 'success' && (
              <>
                <CheckCircle className="h-8 w-8 text-green-600" />
                <p className="text-center text-green-600 font-medium">{message}</p>
              </>
            )}
            
            {status === 'error' && (
              <>
                <AlertCircle className="h-8 w-8 text-red-600" />
                <p className="text-center text-red-600">{message}</p>
                <Button onClick={handleManualLogin} className="w-full">
                  Go to Manual Login
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}