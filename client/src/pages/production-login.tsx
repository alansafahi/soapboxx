import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogIn, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function ProductionLoginPage() {
  const [email, setEmail] = useState('hello@soapboxsuperapp.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'error' | 'success'>('error');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessageType('success');
        setMessage('Login successful! Redirecting to dashboard...');
        
        // Clear React Query cache and redirect
        setTimeout(() => {
          window.location.href = '/';
        }, 1500);
      } else {
        setMessageType('error');
        setMessage(data.message || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setMessageType('error');
      setMessage('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutoLogin = async () => {
    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/debug/auto-login', {
        method: 'GET',
        credentials: 'include'
      });

      if (response.ok || response.redirected) {
        setMessageType('success');
        setMessage('Auto-login successful! Redirecting...');
        
        setTimeout(() => {
          window.location.href = '/';
        }, 1500);
      } else {
        setMessageType('error');
        setMessage('Auto-login failed. Please use manual login.');
      }
    } catch (error) {
      console.error('Auto-login error:', error);
      setMessageType('error');
      setMessage('Auto-login failed. Please use manual login.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <LogIn className="h-6 w-6" />
            Production Login
          </CardTitle>
          <CardDescription>
            Sign in to SoapBox Super App
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {message && (
            <Alert variant={messageType === 'error' ? 'destructive' : 'default'}>
              {messageType === 'error' ? (
                <AlertCircle className="h-4 w-4" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Button 
              onClick={handleAutoLogin}
              disabled={isLoading}
              className="w-full"
              variant="outline"
            >
              {isLoading ? 'Processing...' : 'Quick Access (Auto-Login)'}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Establishes authenticated session for production testing
            </p>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or login manually</span>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="text-center">
            <Button 
              variant="link" 
              onClick={() => window.location.href = '/api/auth/forgot-password'}
              className="text-sm"
            >
              Forgot Password?
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}