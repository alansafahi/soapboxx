import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { apiRequest } from "../lib/queryClient";
import { 
  Users, 
  Church, 
  MessageSquare, 
  Heart, 
  Calendar,
  BarChart3,
  Database,
  RefreshCw,
  Play,
  CheckCircle,
  AlertCircle
} from "lucide-react";

interface DemoStats {
  churches: number;
  users: number;
  discussions: number;
  prayers: number;
  events: number;
}

interface DemoUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  churchName: string;
}

export default function DemoPage() {
  const [apiStatus, setApiStatus] = useState<'checking' | 'healthy' | 'error'>('checking');
  const [stats, setStats] = useState<DemoStats>({
    churches: 0,
    users: 0,
    discussions: 0,
    prayers: 0,
    events: 0
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [dataGenerated, setDataGenerated] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<DemoUser[]>([]);

  useEffect(() => {
    checkApiHealth();
    loadDemoStats();
  }, []);

  const checkApiHealth = async () => {
    try {
      await apiRequest('/api/health');
      setApiStatus('healthy');
    } catch (error) {
      setApiStatus('error');
    }
  };

  const loadDemoStats = async () => {
    try {
      const response = await apiRequest('/api/demo/stats');
      setStats(response);
      setDataGenerated(response.users > 0);
    } catch (error) {
    }
  };

  const generateDemoData = async () => {
    setIsGenerating(true);
    try {
      await apiRequest('/api/demo/generate', { method: 'POST' });
      await loadDemoStats();
      await loadAvailableUsers();
      setDataGenerated(true);
    } catch (error) {
    } finally {
      setIsGenerating(false);
    }
  };

  const loadAvailableUsers = async () => {
    try {
      const users = await apiRequest('/api/demo/users');
      setAvailableUsers(users);
    } catch (error) {
    }
  };

  const clearDemoData = async () => {
    try {
      await apiRequest('/api/demo/clear', { method: 'POST' });
      await loadDemoStats();
      setDataGenerated(false);
      setAvailableUsers([]);
    } catch (error) {
    }
  };

  const loginAsUser = async (userId: string) => {
    try {
      await apiRequest('/api/demo/login', {
        method: 'POST',
        body: { userId }
      });
      window.location.href = '/';
    } catch (error) {
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">
            SoapBox Super App
          </h1>
          <p className="text-xl text-gray-600">
            Demo Environment for Client Presentations
          </p>
          <Badge variant="outline" className="text-sm">
            Isolated Demo Database • Sample Data Only
          </Badge>
        </div>

        {/* API Status Card */}
        <Card className="border-2">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-800">
              System Status
            </CardTitle>
            <CardDescription>
              Faith Community Platform - Demo Mode
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                apiStatus === 'healthy' 
                  ? 'bg-green-100 text-green-800' 
                  : apiStatus === 'error'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {apiStatus === 'healthy' ? (
                  <CheckCircle className="w-4 h-4" />
                ) : apiStatus === 'error' ? (
                  <AlertCircle className="w-4 h-4" />
                ) : (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                )}
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
                <li>• Admin Analytics</li>
                <li>• Role-based Access Control</li>
              </ul>
            </div>

            <Separator />

            <div className="space-y-2">
              <Button 
                onClick={() => window.location.href = '/api/login'}
                className="w-full bg-purple-600 hover:bg-purple-700"
                disabled={apiStatus !== 'healthy'}
              >
                Login with Replit (Production)
              </Button>
            </div>

            {apiStatus === 'error' && (
              <p className="text-xs text-red-600 text-center">
                API connection failed. Please check server status.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Demo Data Management */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Demo Data Management
            </CardTitle>
            <CardDescription>
              Generate realistic sample data for client demonstrations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-5 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-2">
                  <Church className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats.churches}</p>
                <p className="text-sm text-gray-600">Churches</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-2">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats.users}</p>
                <p className="text-sm text-gray-600">Users</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-2">
                  <MessageSquare className="w-6 h-6 text-purple-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats.discussions}</p>
                <p className="text-sm text-gray-600">Discussions</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-lg mx-auto mb-2">
                  <Heart className="w-6 h-6 text-red-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats.prayers}</p>
                <p className="text-sm text-gray-600">Prayers</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg mx-auto mb-2">
                  <Calendar className="w-6 h-6 text-orange-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats.events}</p>
                <p className="text-sm text-gray-600">Events</p>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={generateDemoData}
                disabled={isGenerating || apiStatus !== 'healthy'}
                className="h-12"
              >
                {isGenerating ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Play className="w-4 h-4 mr-2" />
                )}
                {isGenerating ? 'Generating...' : 'Generate Demo Data'}
              </Button>
              
              <Button
                onClick={clearDemoData}
                variant="outline"
                disabled={!dataGenerated || apiStatus !== 'healthy'}
                className="h-12"
              >
                <Database className="w-4 h-4 mr-2" />
                Clear Demo Data
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Demo User Login */}
        {dataGenerated && availableUsers.length > 0 && (
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Demo User Access
              </CardTitle>
              <CardDescription>
                Switch between different user roles to showcase features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableUsers.map((user) => (
                  <Card key={user.id} className="p-4 hover:shadow-md transition-shadow">
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {user.firstName} {user.lastName}
                        </h4>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                      <div className="space-y-1">
                        <Badge variant="secondary" className="text-xs">
                          {user.role}
                        </Badge>
                        <p className="text-xs text-gray-500">{user.churchName}</p>
                      </div>
                      <Button
                        onClick={() => loginAsUser(user.id)}
                        size="sm"
                        className="w-full"
                      >
                        Login as User
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Demo environment ready for client presentations • All data is sample data for demonstration purposes
          </p>
        </div>
      </div>
    </div>
  );
}