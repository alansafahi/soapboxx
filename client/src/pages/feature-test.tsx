import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  TestTube, 
  Bell, 
  Download, 
  RefreshCw as Sync, 
  Brain, 
  Users, 
  Globe,
  CheckCircle,
  XCircle,
  Clock,
  Settings,
  Heart,
  MessageSquare,
  Star
} from "lucide-react";
import EnhancedCommunityFeed from "@/components/enhanced-community-feed";
import UXFeaturesDemo from "@/components/ux-features-demo";

export default function FeatureTestPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [testResults, setTestResults] = useState<{ [key: string]: boolean }>({});
  const [testingInProgress, setTestingInProgress] = useState(false);

  // Test data for various features
  const [testReaction, setTestReaction] = useState("🙏");
  const [testLanguage, setTestLanguage] = useState("es");
  const [testContent, setTestContent] = useState("For God so loved the world...");

  // Fetch user preferences
  const { data: preferences, error: prefsError } = useQuery({
    queryKey: ["/api/user/preferences"],
    enabled: !!user?.id,
  });

  const { data: notificationPrefs, error: notifError } = useQuery({
    queryKey: ["/api/user/notification-preferences"],
    enabled: !!user?.id,
  });

  const { data: enhancedFeed, error: feedError } = useQuery({
    queryKey: ["/api/community/enhanced-feed"],
    enabled: !!user?.id,
  });

  // Test mutations
  const updatePreferencesMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/user/preferences", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/preferences"] });
      setTestResults(prev => ({ ...prev, preferences: true }));
      toast({ title: "Preferences test passed", description: "Settings updated successfully" });
    },
    onError: () => {
      setTestResults(prev => ({ ...prev, preferences: false }));
      toast({ title: "Preferences test failed", variant: "destructive" });
    },
  });

  const addReactionMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/community/reactions", {
      method: "POST",
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      setTestResults(prev => ({ ...prev, reactions: true }));
      toast({ title: "Reaction test passed", description: "Emoji reaction added" });
    },
    onError: () => {
      setTestResults(prev => ({ ...prev, reactions: false }));
      toast({ title: "Reaction test failed", variant: "destructive" });
    },
  });

  const translateMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/content/translate", {
      method: "POST",
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      setTestResults(prev => ({ ...prev, translation: true }));
      toast({ title: "Translation test passed", description: "Content translated successfully" });
    },
    onError: () => {
      setTestResults(prev => ({ ...prev, translation: false }));
      toast({ title: "Translation test - demo mode", description: "Would work with OpenAI API key" });
    },
  });

  const syncOfflineMutation = useMutation({
    mutationFn: () => apiRequest("/api/user/sync-offline-content", { method: "POST" }),
    onSuccess: () => {
      setTestResults(prev => ({ ...prev, offline: true }));
      toast({ title: "Offline sync test passed", description: "Content synchronized" });
    },
    onError: () => {
      setTestResults(prev => ({ ...prev, offline: false }));
      toast({ title: "Offline sync test - demo mode", description: "Would sync content offline" });
    },
  });

  const generateRecommendationsMutation = useMutation({
    mutationFn: () => apiRequest("/api/user/generate-recommendations", { method: "POST" }),
    onSuccess: () => {
      setTestResults(prev => ({ ...prev, ai: true }));
      toast({ title: "AI recommendations test passed", description: "Personalized content generated" });
    },
    onError: () => {
      setTestResults(prev => ({ ...prev, ai: false }));
      toast({ title: "AI test - demo mode", description: "Would generate with OpenAI API key" });
    },
  });

  // Run comprehensive test suite
  const runFullTestSuite = async () => {
    setTestingInProgress(true);
    setTestResults({});

    // Test 1: User Preferences
    setTimeout(() => {
      updatePreferencesMutation.mutate({
        theme: "dark",
        fontSize: "large",
        audioEnabled: true,
      });
    }, 500);

    // Test 2: Community Reactions
    setTimeout(() => {
      if (enhancedFeed && enhancedFeed.length > 0) {
        addReactionMutation.mutate({
          postId: enhancedFeed[0].id,
          emoji: testReaction,
          reactionType: "spiritual",
        });
      }
    }, 1000);

    // Test 3: Content Translation
    setTimeout(() => {
      translateMutation.mutate({
        content: testContent,
        targetLanguage: testLanguage,
      });
    }, 1500);

    // Test 4: Offline Sync
    setTimeout(() => {
      syncOfflineMutation.mutate();
    }, 2000);

    // Test 5: AI Recommendations
    setTimeout(() => {
      generateRecommendationsMutation.mutate();
    }, 2500);

    // Complete testing
    setTimeout(() => {
      setTestingInProgress(false);
    }, 3000);
  };

  const getTestStatus = (testName: string) => {
    if (testingInProgress) return "running";
    if (testResults[testName] === true) return "passed";
    if (testResults[testName] === false) return "failed";
    return "pending";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "passed": return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "failed": return <XCircle className="h-4 w-4 text-red-500" />;
      case "running": return <Clock className="h-4 w-4 text-yellow-500 animate-spin" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const testSuites = [
    {
      category: "Core Features",
      tests: [
        { name: "preferences", label: "User Preferences", icon: <Settings className="h-4 w-4" /> },
        { name: "reactions", label: "Community Reactions", icon: <Heart className="h-4 w-4" /> },
        { name: "translation", label: "Content Translation", icon: <Globe className="h-4 w-4" /> },
      ]
    },
    {
      category: "Advanced Features",
      tests: [
        { name: "offline", label: "Offline Sync", icon: <Download className="h-4 w-4" /> },
        { name: "ai", label: "AI Recommendations", icon: <Brain className="h-4 w-4" /> },
      ]
    }
  ];

  // Data validation checks
  const dataChecks = [
    { name: "User Authentication", status: !!user?.id, description: "User is logged in" },
    { name: "Preferences API", status: !prefsError, description: "User preferences endpoint responding" },
    { name: "Notifications API", status: !notifError, description: "Notification preferences endpoint responding" },
    { name: "Community Feed", status: !feedError && !!enhancedFeed, description: "Enhanced community feed loading" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <TestTube className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Feature Testing Suite</h1>
          </div>
          <p className="text-lg text-gray-600">
            Comprehensive testing of all enhanced user experience features
          </p>
        </div>

        <Tabs defaultValue="tests" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="tests">Feature Tests</TabsTrigger>
            <TabsTrigger value="data">Data Validation</TabsTrigger>
            <TabsTrigger value="community">Community Features</TabsTrigger>
            <TabsTrigger value="demo">Live Demo</TabsTrigger>
          </TabsList>

          <TabsContent value="tests" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TestTube className="h-5 w-5 mr-2" />
                  Automated Test Suite
                </CardTitle>
                <CardDescription>
                  Run comprehensive tests for all enhanced features
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <Button 
                    onClick={runFullTestSuite}
                    disabled={testingInProgress}
                    className="flex-1"
                  >
                    {testingInProgress ? "Testing in Progress..." : "Run Full Test Suite"}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setTestResults({})}
                    disabled={testingInProgress}
                  >
                    Reset Tests
                  </Button>
                </div>

                <div className="space-y-6">
                  {testSuites.map((suite) => (
                    <div key={suite.category}>
                      <h3 className="text-lg font-semibold mb-3">{suite.category}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {suite.tests.map((test) => (
                          <Card key={test.name} className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                {test.icon}
                                <span className="font-medium">{test.label}</span>
                              </div>
                              {getStatusIcon(getTestStatus(test.name))}
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Test Configuration */}
            <Card>
              <CardHeader>
                <CardTitle>Test Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="reaction">Test Reaction</Label>
                    <Select value={testReaction} onValueChange={setTestReaction}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="🙏">🙏 Prayer</SelectItem>
                        <SelectItem value="❤️">❤️ Love</SelectItem>
                        <SelectItem value="✝️">✝️ Faith</SelectItem>
                        <SelectItem value="🕊️">🕊️ Peace</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="language">Test Language</Label>
                    <Select value={testLanguage} onValueChange={setTestLanguage}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                        <SelectItem value="pt">Portuguese</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="content">Test Content</Label>
                    <Input
                      value={testContent}
                      onChange={(e) => setTestContent(e.target.value)}
                      placeholder="Enter text to translate"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="data" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Data Integrity Validation</CardTitle>
                <CardDescription>
                  Verification of API endpoints and data consistency
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dataChecks.map((check, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded">
                      <div>
                        <div className="font-medium">{check.name}</div>
                        <div className="text-sm text-gray-600">{check.description}</div>
                      </div>
                      <Badge variant={check.status ? "default" : "destructive"}>
                        {check.status ? "✓ Passed" : "✗ Failed"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Current User Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">User Preferences</h4>
                    <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                      {JSON.stringify(preferences || {}, null, 2)}
                    </pre>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Notification Settings</h4>
                    <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                      {JSON.stringify(notificationPrefs || {}, null, 2)}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="community">
            <EnhancedCommunityFeed />
          </TabsContent>

          <TabsContent value="demo">
            <UXFeaturesDemo />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}