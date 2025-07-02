import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Share2, Download, Copy, Facebook, Twitter, Instagram, 
  Mail, FileText, BookOpen, Clock, CheckCircle, 
  Loader2, Eye, Edit3, Send, Zap, Globe, Settings, 
  Link, Shield, AlertCircle, ExternalLink, Linkedin,
  Youtube, Video, MessageCircle, Phone, Music
} from "lucide-react";

// Extend window interface for pendingPublish
declare global {
  interface Window {
    pendingPublish: {
      platform: string;
      content: string;
      hashtags?: string[];
    } | null;
  }
}

interface ContentVariation {
  platform: string;
  format: string;
  content: string;
  hashtags?: string[];
  estimatedReach?: number;
  engagementTips?: string[];
}

interface DistributionPackage {
  socialMedia: ContentVariation[];
  emailContent: ContentVariation[];
  studyMaterials: ContentVariation[];
  bulletinInserts: ContentVariation[];
}

export default function ContentDistributionHub() {
  const [sermonTitle, setSermonTitle] = useState("");
  const [sermonSummary, setSermonSummary] = useState("");
  const [keyPoints, setKeyPoints] = useState<string[]>([]);
  const [targetAudiences, setTargetAudiences] = useState<string[]>([]);
  const [distributionPackage, setDistributionPackage] = useState<DistributionPackage | null>(null);
  const [activeTab, setActiveTab] = useState("generate");
  const [showCredentialsDialog, setShowCredentialsDialog] = useState(false);
  const [socialCredentials, setSocialCredentials] = useState<Record<string, any>>({});
  const { toast } = useToast();

  // Fetch existing social media credentials
  const { data: credentials } = useQuery({
    queryKey: ['/api/social-credentials'],
    enabled: true,
  });

  useEffect(() => {
    if (credentials) {
      setSocialCredentials(credentials);
    }
  }, [credentials]);

  // Check for sermon data from completed sermons
  useEffect(() => {
    const sermonData = sessionStorage.getItem('sermonForDistribution');
    if (sermonData) {
      try {
        const parsedData = JSON.parse(sermonData);
        setSermonTitle(parsedData.title || "");
        setSermonSummary(parsedData.outline?.theme || "");
        setKeyPoints(parsedData.mainPoints || []);
        
        // Clear the session storage after loading
        sessionStorage.removeItem('sermonForDistribution');
        
        // Show notification
        toast({
          title: "Sermon Loaded",
          description: `"${parsedData.title}" is ready for content distribution.`
        });
        
        // Don't auto-generate to avoid timeout issues
        // User can manually click generate when ready
      } catch (error) {
      }
    }
  }, []);

  // Content generation mutation
  const generateMutation = useMutation({
    mutationFn: async (data: {
      title: string;
      summary: string;
      keyPoints: string[];
      audiences: string[];
    }) => {
      return apiRequest('POST', '/api/content/distribute', data);
    },
    onSuccess: (data) => {
      setDistributionPackage(data);
      setActiveTab("review");
      toast({
        title: "Content Generated",
        description: "Multi-platform content package has been created successfully."
      });
    },
    onError: (error: any) => {
      
      // Handle specific role-based error messages
      if (error?.response?.data?.action === "upgrade_role") {
        toast({
          title: "Permission Required",
          description: error.response.data.message,
          variant: "destructive"
        });
      } else if (error?.response?.data?.action === "contact_admin") {
        toast({
          title: "Role Verification Issue",
          description: error.response.data.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Content Generation Failed",
          description: error?.response?.data?.message || "Unable to generate content. Please try again.",
          variant: "destructive"
        });
      }
    }
  });

  // Publish mutation
  const publishMutation = useMutation({
    mutationFn: async (data: {
      package: DistributionPackage;
      selectedPlatforms: string[];
      scheduleTime?: string;
    }) => {
      return apiRequest('POST', '/api/content/publish', data);
    },
    onSuccess: (data) => {
      toast({
        title: "Content Published",
        description: `Successfully scheduled content for ${data.platformCount} platforms.`
      });
    }
  });

  // Direct publish mutation for social media
  const directPublishMutation = useMutation({
    mutationFn: async (data: {
      platform: string;
      content: string;
      credentialsId: string;
      sermonId?: string;
    }) => {
      return apiRequest('POST', '/api/social-media/publish', data);
    },
    onSuccess: (data) => {
      toast({
        title: "Published Successfully",
        description: `Content published to ${data.platform} successfully.`
      });
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || "Unable to publish your content right now. Please check your connection and try again.";
      toast({
        title: "Publishing Issue",
        description: errorMessage,
        variant: "destructive"
      });
    }
  });

  // Save credentials mutation
  const saveCredentialsMutation = useMutation({
    mutationFn: async (data: {
      platform: string;
      accessToken: string;
      refreshToken?: string;
      accountId?: string;
      accountName?: string;
    }) => {
      return apiRequest('POST', '/api/social-credentials', data);
    },
    onSuccess: (data) => {
      setSocialCredentials(prev => ({
        ...prev,
        [`${data.platform}_credentials`]: data
      }));
      setShowCredentialsDialog(false);
      toast({
        title: "Credentials Saved",
        description: `${data.platform} account connected successfully.`
      });
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || "Unable to save your account connection. Please check your credentials and try again.";
      toast({
        title: "Connection Failed",
        description: errorMessage,
        variant: "destructive"
      });
    }
  });



  const handleGenerate = () => {
    if (!sermonTitle || !sermonSummary) {
      toast({
        title: "Almost Ready to Create",
        description: "Just need your sermon title and summary to craft the perfect content package.",
        variant: "default"
      });
      return;
    }

    generateMutation.mutate({
      title: sermonTitle,
      summary: sermonSummary,
      keyPoints,
      audiences: targetAudiences
    });
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied to clipboard",
        description: "Content has been copied and is ready to paste."
      });
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Unable to copy content to clipboard.",
        variant: "destructive"
      });
    }
  };

  const addKeyPoint = () => {
    setKeyPoints([...keyPoints, ""]);
  };

  const updateKeyPoint = (index: number, value: string) => {
    const updated = [...keyPoints];
    updated[index] = value;
    setKeyPoints(updated);
  };

  const removeKeyPoint = (index: number) => {
    setKeyPoints(keyPoints.filter((_, i) => i !== index));
  };

  const toggleAudience = (audience: string) => {
    setTargetAudiences(prev => 
      prev.includes(audience) 
        ? prev.filter(a => a !== audience)
        : [...prev, audience]
    );
  };

  const audienceOptions = [
    "Young Adults", "Families", "Seniors", "New Believers", 
    "Church Members", "Community Outreach", "Online Visitors"
  ];

  const platformIcons = {
    facebook: <Facebook className="w-4 h-4" />,
    twitter: <Twitter className="w-4 h-4" />,
    instagram: <Instagram className="w-4 h-4" />,
    linkedin: <Linkedin className="w-4 h-4" />,
    youtube: <Youtube className="w-4 h-4" />,
    'youtube-shorts': <Video className="w-4 h-4" />,
    tiktok: <Video className="w-4 h-4" />,
    discord: <MessageCircle className="w-4 h-4" />,
    whatsapp: <Phone className="w-4 h-4" />,
    telegram: <Send className="w-4 h-4" />,
    reddit: <Globe className="w-4 h-4" />,
    email: <Mail className="w-4 h-4" />,
    bulletin: <FileText className="w-4 h-4" />,
    study: <BookOpen className="w-4 h-4" />
  };

  // Handle direct publishing to social media with automatic credential prompt
  const handleDirectPublish = (platform: string, content: string, hashtags?: string[]) => {
    const credentialsKey = `${platform}_credentials`;
    const platformName = platform.charAt(0).toUpperCase() + platform.slice(1).replace('-', ' ');
    
    if (!socialCredentials[credentialsKey]) {
      // Store the publishing request for after credentials are saved
      window.pendingPublish = { platform, content, hashtags };
      
      toast({
        title: "Connect Your Account",
        description: `Connect your ${platformName} account to publish content directly.`
      });
      setShowCredentialsDialog(true);
      return;
    }

    const fullContent = hashtags ? `${content}\n\n${hashtags.join(' ')}` : content;
    
    directPublishMutation.mutate({
      platform,
      content: fullContent,
      credentialsId: socialCredentials[credentialsKey].id
    });
  };

  // Handle credentials management with automatic publishing
  const handleSaveCredentials = (platform: string, credentials: any) => {
    saveCredentialsMutation.mutate({
      platform,
      ...credentials
    });
    
    // After saving credentials, automatically publish if there's a pending publish request
    setTimeout(() => {
      if (window.pendingPublish && window.pendingPublish.platform === platform) {
        const { content, hashtags } = window.pendingPublish;
        handleDirectPublish(platform, content, hashtags);
        window.pendingPublish = null;
      }
    }, 1000);
  };



  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Content Distribution Hub
        </h1>
        <p className="text-lg text-gray-600">
          Transform your sermon into engaging content across multiple platforms automatically
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="generate" className="flex items-center">
            <Zap className="w-4 h-4 mr-2" />
            Generate
          </TabsTrigger>
          <TabsTrigger value="review" className="flex items-center">
            <Eye className="w-4 h-4 mr-2" />
            Review
          </TabsTrigger>
          <TabsTrigger value="publish" className="flex items-center">
            <Send className="w-4 h-4 mr-2" />
            Publish
          </TabsTrigger>
        </TabsList>

        {/* Generation Tab */}
        <TabsContent value="generate" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Edit3 className="w-5 h-5 mr-2" />
                Sermon Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sermon Title
                </label>
                <input
                  type="text"
                  value={sermonTitle}
                  onChange={(e) => setSermonTitle(e.target.value)}
                  placeholder="e.g., The Greatest Love Story Ever Told"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sermon Summary
                </label>
                <textarea
                  value={sermonSummary}
                  onChange={(e) => setSermonSummary(e.target.value)}
                  rows={4}
                  placeholder="Brief summary of your sermon's main message and takeaways..."
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Key Points
                </label>
                <div className="space-y-2">
                  {keyPoints.map((point, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={point}
                        onChange={(e) => updateKeyPoint(index, e.target.value)}
                        placeholder={`Key point ${index + 1}`}
                        className="flex-1 p-2 border border-gray-300 rounded-md"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeKeyPoint(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" onClick={addKeyPoint} className="w-full">
                    Add Key Point
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Audiences
                </label>
                <div className="flex flex-wrap gap-2">
                  {audienceOptions.map((audience) => (
                    <Badge
                      key={audience}
                      variant={targetAudiences.includes(audience) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleAudience(audience)}
                    >
                      {audience}
                    </Badge>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={generateMutation.isPending}
                className="w-full bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                {generateMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Zap className="w-4 h-4 mr-2" />
                )}
                Generate Multi-Platform Content
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Review Tab */}
        <TabsContent value="review" className="space-y-6">
          {distributionPackage ? (
            <>
              {/* Social Media Content */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Share2 className="w-5 h-5 mr-2" />
                    Social Media Content
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {distributionPackage.socialMedia.map((content, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            {platformIcons[content.platform as keyof typeof platformIcons]}
                            <span className="font-semibold capitalize">{content.platform}</span>
                            <Badge variant="outline">{content.format}</Badge>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(content.content)}
                            >
                              <Copy className="w-4 h-4 mr-1" />
                              Copy
                            </Button>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleDirectPublish(content.platform, content.content, content.hashtags)}
                              disabled={directPublishMutation.isPending}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              {directPublishMutation.isPending ? (
                                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                              ) : (
                                <Send className="w-4 h-4 mr-1" />
                              )}
                              Publish to {content.platform.charAt(0).toUpperCase() + content.platform.slice(1)}
                            </Button>
                          </div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-md mb-3">
                          <p className="text-sm whitespace-pre-wrap">{content.content}</p>
                        </div>
                        {content.hashtags && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {content.hashtags.map((tag, tagIndex) => (
                              <Badge key={tagIndex} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                        {content.estimatedReach && (
                          <p className="text-xs text-gray-500">
                            Estimated reach: {content.estimatedReach.toLocaleString()} people
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Email Content */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Mail className="w-5 h-5 mr-2" />
                    Email Newsletter Content
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {distributionPackage.emailContent.map((content, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <Mail className="w-4 h-4" />
                            <span className="font-semibold">{content.format}</span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(content.content)}
                          >
                            <Copy className="w-4 h-4 mr-1" />
                            Copy
                          </Button>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-md">
                          <div className="text-sm whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: content.content }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Study Materials */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BookOpen className="w-5 h-5 mr-2" />
                    Study Materials
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {distributionPackage.studyMaterials.map((content, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <BookOpen className="w-4 h-4" />
                            <span className="font-semibold">{content.format}</span>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(content.content)}
                            >
                              <Copy className="w-4 h-4 mr-1" />
                              Copy
                            </Button>
                            <Button variant="outline" size="sm">
                              <Download className="w-4 h-4 mr-1" />
                              PDF
                            </Button>
                          </div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-md">
                          <div className="text-sm whitespace-pre-wrap">{content.content}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Bulletin Inserts */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Bulletin Inserts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {distributionPackage.bulletinInserts.map((content, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <FileText className="w-4 h-4" />
                            <span className="font-semibold">{content.format}</span>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(content.content)}
                            >
                              <Copy className="w-4 h-4 mr-1" />
                              Copy
                            </Button>
                            <Button variant="outline" size="sm">
                              <Download className="w-4 h-4 mr-1" />
                              PDF
                            </Button>
                          </div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-md">
                          <div className="text-sm whitespace-pre-wrap">{content.content}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Share2 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>Generate content to review distribution package</p>
            </div>
          )}
        </TabsContent>

        {/* Publish Tab */}
        <TabsContent value="publish" className="space-y-6">
          {distributionPackage ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="w-5 h-5 mr-2" />
                  Schedule & Publish
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">Publishing Options</h4>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" defaultChecked />
                        Social Media Platforms
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" defaultChecked />
                        Email Newsletter
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" defaultChecked />
                        Church Website
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" />
                        SMS Notifications
                      </label>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold">Schedule</h4>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input type="radio" name="schedule" className="mr-2" defaultChecked />
                        Publish immediately
                      </label>
                      <label className="flex items-center">
                        <input type="radio" name="schedule" className="mr-2" />
                        Schedule for later
                      </label>
                      <input
                        type="datetime-local"
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                      Ready to publish to 4 platforms
                    </div>
                    <Button
                      onClick={() => publishMutation.mutate({
                        package: distributionPackage,
                        selectedPlatforms: ["facebook", "twitter", "email", "website"]
                      })}
                      disabled={publishMutation.isPending}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {publishMutation.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4 mr-2" />
                      )}
                      Publish Content
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Send className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>Generate and review content before publishing</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Success Metrics */}
      {distributionPackage && (
        <Card className="bg-gradient-to-r from-green-50 to-blue-50">
          <CardContent className="p-4">
            <div className="grid md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {distributionPackage.socialMedia.length + distributionPackage.emailContent.length}
                </div>
                <div className="text-sm text-gray-600">Content Pieces</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">4</div>
                <div className="text-sm text-gray-600">Platforms</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">6-8 hrs</div>
                <div className="text-sm text-gray-600">Time Saved</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">300%</div>
                <div className="text-sm text-gray-600">Content Increase</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Social Media Credentials Dialog */}
      <Dialog open={showCredentialsDialog} onOpenChange={setShowCredentialsDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Connect Social Media Accounts</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Connect your social media accounts to enable direct publishing from the Content Distribution Hub.
            </p>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              <SocialMediaConnectionForm 
                platform="facebook" 
                icon={<Facebook className="w-5 h-5 text-blue-600" />}
                onSave={handleSaveCredentials}
                isConnected={!!socialCredentials.facebook_credentials}
              />
              <SocialMediaConnectionForm 
                platform="twitter" 
                icon={<Twitter className="w-5 h-5 text-blue-400" />}
                onSave={handleSaveCredentials}
                isConnected={!!socialCredentials.twitter_credentials}
              />
              <SocialMediaConnectionForm 
                platform="instagram" 
                icon={<Instagram className="w-5 h-5 text-pink-600" />}
                onSave={handleSaveCredentials}
                isConnected={!!socialCredentials.instagram_credentials}
              />
              <SocialMediaConnectionForm 
                platform="linkedin" 
                icon={<Linkedin className="w-5 h-5 text-blue-700" />}
                onSave={handleSaveCredentials}
                isConnected={!!socialCredentials.linkedin_credentials}
              />
              <SocialMediaConnectionForm 
                platform="youtube" 
                icon={<Youtube className="w-5 h-5 text-red-600" />}
                onSave={handleSaveCredentials}
                isConnected={!!socialCredentials.youtube_credentials}
              />
              <SocialMediaConnectionForm 
                platform="youtube-shorts" 
                icon={<Video className="w-5 h-5 text-red-500" />}
                onSave={handleSaveCredentials}
                isConnected={!!socialCredentials['youtube-shorts_credentials']}
              />
              <SocialMediaConnectionForm 
                platform="tiktok" 
                icon={<Video className="w-5 h-5 text-black" />}
                onSave={handleSaveCredentials}
                isConnected={!!socialCredentials.tiktok_credentials}
              />
              <SocialMediaConnectionForm 
                platform="discord" 
                icon={<MessageCircle className="w-5 h-5 text-indigo-600" />}
                onSave={handleSaveCredentials}
                isConnected={!!socialCredentials.discord_credentials}
              />
              <SocialMediaConnectionForm 
                platform="whatsapp" 
                icon={<Phone className="w-5 h-5 text-green-600" />}
                onSave={handleSaveCredentials}
                isConnected={!!socialCredentials.whatsapp_credentials}
              />
              <SocialMediaConnectionForm 
                platform="telegram" 
                icon={<Send className="w-5 h-5 text-blue-500" />}
                onSave={handleSaveCredentials}
                isConnected={!!socialCredentials.telegram_credentials}
              />
              <SocialMediaConnectionForm 
                platform="reddit" 
                icon={<Globe className="w-5 h-5 text-orange-600" />}
                onSave={handleSaveCredentials}
                isConnected={!!socialCredentials.reddit_credentials}
              />
            </div>
            
            <div className="pt-3 border-t">
              <p className="text-xs text-gray-500">
                <Shield className="w-3 h-3 inline mr-1" />
                Your credentials are encrypted and stored securely
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Social Media Connection Form Component
function SocialMediaConnectionForm({ platform, icon, onSave, isConnected }: {
  platform: string;
  icon: React.ReactNode;
  onSave: (platform: string, credentials: any) => void;
  isConnected: boolean;
}) {
  const [accessToken, setAccessToken] = useState("");
  const [accountName, setAccountName] = useState("");
  const [showForm, setShowForm] = useState(false);

  const handleConnect = () => {
    if (accessToken) {
      onSave(platform, {
        accessToken,
        accountName: accountName || `${platform}_account`,
      });
      setAccessToken("");
      setAccountName("");
      setShowForm(false);
    }
  };

  return (
    <div className="p-3 border rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {icon}
          <span className="capitalize">{platform}</span>
        </div>
        <div className="flex items-center space-x-2">
          {isConnected && (
            <Badge variant="secondary" className="text-xs">
              <CheckCircle className="w-3 h-3 mr-1" />
              Connected
            </Badge>
          )}
          <Button 
            size="sm" 
            variant={isConnected ? "outline" : "default"}
            onClick={() => setShowForm(!showForm)}
          >
            {isConnected ? "Reconnect" : "Connect"}
          </Button>
        </div>
      </div>
      
      {showForm && (
        <div className="mt-3 space-y-2">
          <div>
            <Label htmlFor={`${platform}-token`} className="text-xs">Access Token</Label>
            <Input
              id={`${platform}-token`}
              type="password"
              placeholder="Enter your access token"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              className="text-sm"
            />
          </div>
          <div>
            <Label htmlFor={`${platform}-account`} className="text-xs">Account Name (Optional)</Label>
            <Input
              id={`${platform}-account`}
              placeholder="Account display name"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              className="text-sm"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button size="sm" variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleConnect} disabled={!accessToken}>
              Save
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}