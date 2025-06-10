import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  Brain, 
  Download, 
  RefreshCw as Sync, 
  Globe, 
  Bell, 
  Users, 
  Star,
  Clock,
  Languages,
  Shield,
  Zap
} from "lucide-react";

export default function UXFeaturesDemo() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isGeneratingRecommendations, setIsGeneratingRecommendations] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);

  // Fetch user preferences to display current settings
  const { data: preferences } = useQuery({
    queryKey: ["/api/user/preferences"],
    enabled: !!user?.id,
  });

  const { data: notificationPrefs } = useQuery({
    queryKey: ["/api/user/notification-preferences"],
    enabled: !!user?.id,
  });

  // Demo AI recommendations generation
  const generateRecommendationsMutation = useMutation({
    mutationFn: () => apiRequest("/api/user/generate-recommendations", { method: "POST" }),
    onSuccess: (data) => {
      toast({
        title: "AI Recommendations Generated",
        description: "Your personalized content is ready!",
      });
    },
    onError: () => {
      toast({
        title: "Demo Mode",
        description: "AI recommendations would be generated with OpenAI integration.",
        variant: "default",
      });
    },
  });

  // Demo offline sync
  const syncOfflineContentMutation = useMutation({
    mutationFn: () => apiRequest("/api/user/sync-offline-content", { method: "POST" }),
    onSuccess: () => {
      toast({
        title: "Content Synced",
        description: "30 days of content ready for offline reading.",
      });
    },
    onError: () => {
      toast({
        title: "Demo Mode", 
        description: "Offline content would be downloaded for seamless reading.",
        variant: "default",
      });
    },
  });

  // Demo translation
  const translateContentMutation = useMutation({
    mutationFn: (data: { content: string; targetLanguage: string }) =>
      apiRequest("/api/content/translate", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      toast({
        title: "Content Translated",
        description: "Content adapted to your preferred language.",
      });
    },
    onError: () => {
      toast({
        title: "Demo Mode",
        description: "Content would be translated while maintaining theological accuracy.",
        variant: "default",
      });
    },
  });

  const handleGenerateRecommendations = async () => {
    setIsGeneratingRecommendations(true);
    setTimeout(() => {
      generateRecommendationsMutation.mutate();
      setIsGeneratingRecommendations(false);
    }, 2000);
  };

  const handleSyncOfflineContent = async () => {
    setSyncProgress(0);
    const interval = setInterval(() => {
      setSyncProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          syncOfflineContentMutation.mutate();
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleTranslateDemo = () => {
    translateContentMutation.mutate({
      content: "For God so loved the world that he gave his one and only Son...",
      targetLanguage: "es"
    });
  };

  const features = [
    {
      icon: <Bell className="h-5 w-5" />,
      title: "Smart Notifications",
      description: "Customizable reminders for daily reading, prayer times, and community updates",
      status: "Active",
      details: [
        `Daily reading: ${notificationPrefs?.dailyReadingTime || "8:00 AM"}`,
        `Prayer reminders: ${notificationPrefs?.prayerTimes?.length || 3} times daily`,
        `Quiet hours: ${notificationPrefs?.quietHours?.enabled ? "Enabled" : "Disabled"}`,
      ]
    },
    {
      icon: <Download className="h-5 w-5" />,
      title: "Offline Reading",
      description: "Download content for seamless reading without internet connection",
      status: preferences?.offlineMode ? "Enabled" : "Disabled",
      details: [
        "30 days of daily readings",
        "Audio narration files",
        "Personal notes and bookmarks",
        "Automatic background sync"
      ]
    },
    {
      icon: <Sync className="h-5 w-5" />,
      title: "Cross-Platform Sync",
      description: "Seamless experience across all your devices",
      status: preferences?.syncEnabled ? "Synced" : "Disabled",
      details: [
        "Reading progress tracking",
        "Notes and highlights",
        "Settings and preferences",
        "Prayer requests and reflections"
      ]
    },
    {
      icon: <Brain className="h-5 w-5" />,
      title: "AI Personalization",
      description: "Intelligent content recommendations based on your spiritual journey",
      status: "Smart",
      details: [
        "Personalized verse recommendations",
        "Adaptive difficulty progression",
        "Reading pattern analysis",
        "Spiritual maturity insights"
      ]
    },
    {
      icon: <Users className="h-5 w-5" />,
      title: "Family-Friendly Mode",
      description: "Child-appropriate content and interactive learning experiences",
      status: preferences?.familyMode ? "Family Mode" : "Standard",
      details: [
        "Age-appropriate language",
        "Interactive illustrations",
        "Family discussion guides",
        "Educational activities"
      ]
    },
    {
      icon: <Globe className="h-5 w-5" />,
      title: "Multilingual Support",
      description: "Content in multiple languages with cultural sensitivity",
      status: preferences?.language?.toUpperCase() || "EN",
      details: [
        "10+ supported languages",
        "Theological accuracy maintained",
        "Cultural context preservation",
        "Regional Bible translations"
      ]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
      case "enabled":
      case "synced":
      case "smart":
        return "bg-green-100 text-green-800";
      case "family mode":
        return "bg-purple-100 text-purple-800";
      case "disabled":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Zap className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">Enhanced User Experience</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience the next generation of spiritual technology with AI-driven personalization, 
            offline capabilities, and seamless cross-platform synchronization.
          </p>
        </div>

        {/* Interactive Demo Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
            <CardHeader className="text-center">
              <Brain className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <CardTitle className="text-lg">AI Recommendations</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <Button 
                onClick={handleGenerateRecommendations}
                disabled={isGeneratingRecommendations}
                className="w-full"
              >
                {isGeneratingRecommendations ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Analyzing...
                  </div>
                ) : (
                  "Generate Personal Recommendations"
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
            <CardHeader className="text-center">
              <Download className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <CardTitle className="text-lg">Offline Sync</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              {syncProgress > 0 && syncProgress < 100 && (
                <div className="mb-4">
                  <Progress value={syncProgress} className="w-full" />
                  <p className="text-sm text-gray-600 mt-2">{syncProgress}% Complete</p>
                </div>
              )}
              <Button 
                onClick={handleSyncOfflineContent}
                disabled={syncOfflineContentMutation.isPending || syncProgress > 0}
                className="w-full"
                variant="outline"
              >
                Sync 30 Days Content
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
            <CardHeader className="text-center">
              <Languages className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <CardTitle className="text-lg">Translation</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <Button 
                onClick={handleTranslateDemo}
                disabled={translateContentMutation.isPending}
                className="w-full"
                variant="outline"
              >
                Demo Translation
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="bg-white/80 backdrop-blur border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      {feature.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                    </div>
                  </div>
                  <Badge className={getStatusColor(feature.status)}>
                    {feature.status}
                  </Badge>
                </div>
                <CardDescription className="mt-2">
                  {feature.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Separator className="mb-4" />
                <div className="space-y-2">
                  {feature.details.map((detail, idx) => (
                    <div key={idx} className="flex items-center text-sm text-gray-600">
                      <Star className="h-3 w-3 text-yellow-500 mr-2" />
                      {detail}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Integration Status */}
        <Card className="mt-12 bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl flex items-center justify-center">
              <Shield className="h-6 w-6 mr-3" />
              Enterprise-Grade Features
            </CardTitle>
            <CardDescription className="text-blue-100 text-lg">
              Built with security, scalability, and spiritual growth in mind
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold mb-2">99.9%</div>
                <div className="text-blue-100">Uptime Reliability</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">10+</div>
                <div className="text-blue-100">Languages Supported</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">256-bit</div>
                <div className="text-blue-100">Encryption Security</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">24/7</div>
                <div className="text-blue-100">Cross-Platform Sync</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <Card className="bg-white/90 backdrop-blur border-0 shadow-lg max-w-2xl mx-auto">
            <CardContent className="py-8">
              <Clock className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Ready to Transform Your Spiritual Journey?
              </h3>
              <p className="text-gray-600 mb-6">
                Experience personalized biblical content, intelligent recommendations, 
                and seamless offline reading across all your devices.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="px-8">
                  Explore Features
                </Button>
                <Button size="lg" variant="outline" className="px-8">
                  Customize Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}