import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DemoPage() {
  const [apiStatus, setApiStatus] = useState<'checking' | 'healthy' | 'error'>('checking');
  const [demoUser, setDemoUser] = useState<any>(null);

  useEffect(() => {
    // Test API connectivity
    fetch('/api/test')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'healthy') {
          setApiStatus('healthy');
        } else {
          setApiStatus('error');
        }
      })
      .catch(() => setApiStatus('error'));
  }, []);

  const setupDemoAuth = async () => {
    try {
      // Manually set demo user session
      const demoUserData = {
        id: 'demo-user-123',
        email: 'demo@soapboxsuperapp.com',
        firstName: 'Demo',
        lastName: 'User',
        profileImageUrl: null,
      };
      
      // Store in localStorage for the demo
      localStorage.setItem('demo-user', JSON.stringify(demoUserData));
      setDemoUser(demoUserData);
      
      // Redirect to main app
      window.location.href = '/';
    } catch (error) {
      console.error('Demo setup failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-800">
            SoapBox Super App
          </CardTitle>
          <CardDescription>
            Faith Community Platform - Demo Mode
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className={`inline-block px-3 py-1 rounded-full text-sm ${
              apiStatus === 'healthy' 
                ? 'bg-green-100 text-green-800' 
                : apiStatus === 'error'
                ? 'bg-red-100 text-red-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              API Status: {apiStatus === 'checking' ? 'Checking...' : apiStatus}
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-gray-600 text-center">
              Experience the SoapBox Super App with demo functionality including:
            </p>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Prayer Wall & Community</li>
              <li>• Daily Bible Reading</li>
              <li>• Church Events & RSVP</li>
              <li>• Discussion Forums</li>
              <li>• Volunteer Management</li>
              <li>• Donation System</li>
            </ul>
          </div>

          <Button 
            onClick={setupDemoAuth}
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={apiStatus !== 'healthy'}
          >
            Enter Demo App
          </Button>

          {apiStatus === 'error' && (
            <p className="text-xs text-red-600 text-center">
              API connection failed. Please check server status.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}