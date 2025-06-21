import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginDebug() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const createTestSession = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/debug/create-test-session', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
      
      if (data.success) {
        // Redirect to home after successful session creation
        setTimeout(() => {
          window.location.href = '/';
        }, 1000);
      }
    } catch (error) {
      setResult(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const checkAuth = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/user', {
        credentials: 'include'
      });
      
      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Authentication Debug</CardTitle>
          <CardDescription>Test authentication system</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={createTestSession} 
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Creating...' : 'Create Test Session'}
          </Button>
          
          <Button 
            onClick={checkAuth} 
            disabled={loading}
            variant="outline"
            className="w-full"
          >
            {loading ? 'Checking...' : 'Check Auth Status'}
          </Button>
          
          {result && (
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">Result:</h3>
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-40">
                {result}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}