import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, Church, MessageCircle, Heart, Calendar, 
  DollarSign, UserCheck, Database, Play, Trash2,
  RefreshCw, CheckCircle, AlertCircle, Loader2
} from "lucide-react";

interface DemoStats {
  churches: number;
  users: number;
  discussions: number;
  prayers: number;
  events: number;
}

export default function DemoPage() {
  const [apiStatus, setApiStatus] = useState<'checking' | 'healthy' | 'error'>('checking');
  const [demoStatus, setDemoStatus] = useState<'checking' | 'exists' | 'empty'>('checking');
  const [demoStats, setDemoStats] = useState<DemoStats | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkApiStatus();
    checkDemoStatus();
  }, []);

  const checkApiStatus = async () => {
    try {
      const response = await fetch('/api/test');
      const data = await response.json();
      setApiStatus(data.status === 'healthy' ? 'healthy' : 'error');
    } catch {
      setApiStatus('error');
    }
  };

  const checkDemoStatus = async () => {
    try {
      const response = await fetch('/api/demo/status');
      const data = await response.json();
      setDemoStatus(data.demoExists ? 'exists' : 'empty');
      setDemoStats(data.stats);
    } catch {
      setDemoStatus('empty');
    }
  };

  const generateDemoData = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/demo/generate-data', {
        method: 'POST'
      });
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Demo Environment Ready",
          description: "Comprehensive demo data generated successfully",
        });
        await checkDemoStatus();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate demo data",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const clearDemoData = async () => {
    setIsClearing(true);
    try {
      const response = await fetch('/api/demo/clear-data', {
        method: 'DELETE'
      });
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Demo Data Cleared",
          description: "All demo data has been removed",
        });
        await checkDemoStatus();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast({
        title: "Clear Failed",
        description: error.message || "Failed to clear demo data",
        variant: "destructive",
      });
    } finally {
      setIsClearing(false);
    }
  };

  const setupDemoAuth = async (userType: 'member' | 'pastor' | 'admin' = 'member') => {
    try {
      const response = await fetch('/api/demo/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userType })
      });
      const data = await response.json();
      
      if (data.success) {
        // Store demo user in localStorage
        localStorage.setItem('demo-user', JSON.stringify(data.user));
        
        toast({
          title: "Demo Mode Active",
          description: `Logged in as ${userType}. Redirecting to app...`,
        });
        
        setTimeout(() => {
          window.location.href = '/';
        }, 1000);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast({
        title: "Demo Login Failed",
        description: error.message || "Failed to set up demo authentication",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">SoapBox Super App</h1>
          <p className="text-xl text-gray-600 mb-4">Comprehensive Demo Environment</p>
          <Badge variant="outline" className="text-sm">
            Client Presentation Mode
          </Badge>
        </div>

        <Tabs defaultValue="setup" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="setup">Demo Setup</TabsTrigger>
            <TabsTrigger value="access">User Access</TabsTrigger>
            <TabsTrigger value="overview">App Overview</TabsTrigger>
          </TabsList>

          <TabsContent value="setup" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Demo Environment Status
                </CardTitle>
                <CardDescription>
                  Manage comprehensive demo data for client presentations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {apiStatus === 'checking' && <Loader2 className="h-4 w-4 animate-spin" />}
                    {apiStatus === 'healthy' && <CheckCircle className="h-4 w-4 text-green-500" />}
                    {apiStatus === 'error' && <AlertCircle className="h-4 w-4 text-red-500" />}
                    <span className="font-medium">API Connection</span>
                  </div>
                  <Badge variant={apiStatus === 'healthy' ? 'default' : 'destructive'}>
                    {apiStatus === 'checking' ? 'Checking...' : apiStatus}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {demoStatus === 'checking' && <Loader2 className="h-4 w-4 animate-spin" />}
                    {demoStatus === 'exists' && <CheckCircle className="h-4 w-4 text-green-500" />}
                    {demoStatus === 'empty' && <AlertCircle className="h-4 w-4 text-orange-500" />}
                    <span className="font-medium">Demo Data</span>
                  </div>
                  <Badge variant={demoStatus === 'exists' ? 'default' : 'secondary'}>
                    {demoStatus === 'checking' ? 'Checking...' : demoStatus === 'exists' ? 'Ready' : 'Empty'}
                  </Badge>
                </div>

                {demoStats && (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                      <Church className="h-4 w-4 text-blue-600" />
                      <div>
                        <div className="text-sm text-gray-600">Churches</div>
                        <div className="font-semibold">{demoStats.churches}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                      <Users className="h-4 w-4 text-green-600" />
                      <div>
                        <div className="text-sm text-gray-600">Users</div>
                        <div className="font-semibold">{demoStats.users}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
                      <MessageCircle className="h-4 w-4 text-purple-600" />
                      <div>
                        <div className="text-sm text-gray-600">Discussions</div>
                        <div className="font-semibold">{demoStats.discussions}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-pink-50 rounded-lg">
                      <Heart className="h-4 w-4 text-pink-600" />
                      <div>
                        <div className="text-sm text-gray-600">Prayers</div>
                        <div className="font-semibold">{demoStats.prayers}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg">
                      <Calendar className="h-4 w-4 text-orange-600" />
                      <div>
                        <div className="text-sm text-gray-600">Events</div>
                        <div className="font-semibold">{demoStats.events}</div>
                      </div>
                    </div>
                  </div>
                )}

                <Separator />

                <div className="space-y-4">
                  {demoStatus === 'empty' && (
                    <Button
                      onClick={generateDemoData}
                      disabled={isGenerating || apiStatus !== 'healthy'}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                      size="lg"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating Demo Data...
                        </>
                      ) : (
                        <>
                          <Play className="mr-2 h-4 w-4" />
                          Generate Comprehensive Demo Data
                        </>
                      )}
                    </Button>
                  )}

                  {demoStatus === 'exists' && (
                    <div className="flex gap-3">
                      <Button
                        onClick={generateDemoData}
                        disabled={isGenerating}
                        variant="outline"
                        className="flex-1"
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Regenerating...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Regenerate Data
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={clearDemoData}
                        disabled={isClearing}
                        variant="destructive"
                        className="flex-1"
                      >
                        {isClearing ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Clearing...
                          </>
                        ) : (
                          <>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Clear Demo Data
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="access" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Church Member</CardTitle>
                  <CardDescription>
                    Experience the app as a regular church member
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="text-sm space-y-2 text-gray-600">
                    <li>• Prayer Wall access</li>
                    <li>• Community discussions</li>
                    <li>• Event registration</li>
                    <li>• Daily Bible reading</li>
                    <li>• Donation features</li>
                  </ul>
                  <Button 
                    onClick={() => setupDemoAuth('member')}
                    disabled={demoStatus !== 'exists'}
                    className="w-full"
                    variant="outline"
                  >
                    <UserCheck className="mr-2 h-4 w-4" />
                    Enter as Member
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Pastor</CardTitle>
                  <CardDescription>
                    Full pastoral management capabilities
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="text-sm space-y-2 text-gray-600">
                    <li>• Church administration</li>
                    <li>• Member management</li>
                    <li>• Content moderation</li>
                    <li>• Analytics dashboard</li>
                    <li>• Ministry oversight</li>
                  </ul>
                  <Button 
                    onClick={() => setupDemoAuth('pastor')}
                    disabled={demoStatus !== 'exists'}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    <UserCheck className="mr-2 h-4 w-4" />
                    Enter as Pastor
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Church Admin</CardTitle>
                  <CardDescription>
                    Administrative and leadership features
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="text-sm space-y-2 text-gray-600">
                    <li>• Event management</li>
                    <li>• Volunteer coordination</li>
                    <li>• Financial oversight</li>
                    <li>• Member communication</li>
                    <li>• Ministry leadership</li>
                  </ul>
                  <Button 
                    onClick={() => setupDemoAuth('admin')}
                    disabled={demoStatus !== 'exists'}
                    className="w-full"
                    variant="outline"
                  >
                    <UserCheck className="mr-2 h-4 w-4" />
                    Enter as Admin
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Alternative Access</CardTitle>
                <CardDescription>
                  Traditional authentication options
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => window.location.href = '/api/login'}
                  variant="outline"
                  className="w-full"
                >
                  Login with Replit Authentication
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-red-500" />
                    Prayer Wall
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">
                    Community prayer requests with supportive responses and prayer tracking.
                  </p>
                  <ul className="text-xs space-y-1 text-gray-500">
                    <li>• Submit prayer requests</li>
                    <li>• Respond with encouragement</li>
                    <li>• Anonymous posting option</li>
                    <li>• Prayer reminder notifications</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-blue-500" />
                    Community Feed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">
                    Social discussions, testimonies, and spiritual conversations.
                  </p>
                  <ul className="text-xs space-y-1 text-gray-500">
                    <li>• Share testimonies</li>
                    <li>• Discuss faith topics</li>
                    <li>• AI-powered categorization</li>
                    <li>• Advanced filtering</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-green-500" />
                    Events & RSVP
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">
                    Church events with registration and attendance tracking.
                  </p>
                  <ul className="text-xs space-y-1 text-gray-500">
                    <li>• Event registration</li>
                    <li>• Attendance tracking</li>
                    <li>• Automated reminders</li>
                    <li>• Capacity management</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-purple-500" />
                    Volunteer Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">
                    Coordinate ministry volunteers and track service hours.
                  </p>
                  <ul className="text-xs space-y-1 text-gray-500">
                    <li>• Ministry sign-ups</li>
                    <li>• Skill matching</li>
                    <li>• Service hour tracking</li>
                    <li>• Volunteer recognition</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-emerald-500" />
                    Donations & Giving
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">
                    Secure online giving with recurring donation options.
                  </p>
                  <ul className="text-xs space-y-1 text-gray-500">
                    <li>• One-time & recurring gifts</li>
                    <li>• Multiple payment methods</li>
                    <li>• Giving history</li>
                    <li>• Tax receipt generation</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-orange-500" />
                    Admin Portal
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">
                    Comprehensive church management and analytics dashboard.
                  </p>
                  <ul className="text-xs space-y-1 text-gray-500">
                    <li>• Member management</li>
                    <li>• Financial reporting</li>
                    <li>• Engagement analytics</li>
                    <li>• Content moderation</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Demo environment ready for client presentations • All data is sample data for demonstration purposes
          </p>
        </div>
      </div>
    </div>
  );
}
              <li>• Donation System</li>
            </ul>
          </div>

          <div className="space-y-2">
            <Button 
              onClick={() => window.location.href = '/api/login'}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              Login with Replit
            </Button>
            
            <Button 
              onClick={setupDemoAuth}
              variant="outline"
              className="w-full"
              disabled={apiStatus !== 'healthy'}
            >
              Enter Demo Mode
            </Button>
          </div>

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