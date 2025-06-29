import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { SermonIllustration } from "@shared/schema";
import { 
  Search, Lightbulb, BookOpen, MessageSquare, Star, 
  Clock, Target, RefreshCw, Save, Download, Share2,
  ChevronRight, CheckCircle, AlertCircle, Loader2,
  ChevronDown, FileText, FileImage, FileDown, Code,
  Archive, Edit3, Eye
} from "lucide-react";

// Helper function to render formatted text with HTML
const renderFormattedText = (text: string) => {
  if (!text) return null;
  
  // Handle object format with title/content structure
  if (typeof text === 'object') {
    if (text.title && text.content) {
      return (
        <div>
          <strong>{text.title}</strong>
          <span className="ml-2">{text.content}</span>
        </div>
      );
    }
    return JSON.stringify(text);
  }
  
  // Convert HTML tags to React elements
  const parts = text.split(/(<\/?[^>]+>)/g);
  let isStrong = false;
  
  return parts.map((part, index) => {
    if (part === '<strong>') {
      isStrong = true;
      return null;
    } else if (part === '</strong>') {
      isStrong = false;
      return null;
    } else if (part.startsWith('<')) {
      // Ignore other HTML tags
      return null;
    } else {
      return isStrong ? (
        <strong key={index}>{part}</strong>
      ) : (
        <span key={index}>{part}</span>
      );
    }
  }).filter(Boolean);
};

interface SermonOutline {
  title: string;
  theme: string;
  mainPoints: string[];
  introduction: string;
  conclusion: string;
  callToAction: string;
  scriptureReferences: string[];
  closingPrayer?: string;
}

interface BiblicalResearch {
  commentary: string;
  crossReferences: string[];
  historicalContext: string;
  keyThemes: string[];
  practicalApplications: string[];
}



export default function SermonCreationStudio() {
  const [activeTab, setActiveTab] = useState("research");
  const [scriptureText, setScriptureText] = useState("");
  const [sermonTopic, setSermonTopic] = useState("");
  const [targetAudience, setTargetAudience] = useState("general");
  const [sermonLength, setSermonLength] = useState("medium");
  const [currentOutline, setCurrentOutline] = useState<SermonOutline | null>(null);
  const [currentResearch, setCurrentResearch] = useState<BiblicalResearch | null>(null);
  const [illustrations, setIllustrations] = useState<SermonIllustration[]>([]);
  const [selectedStories, setSelectedStories] = useState<Set<number>>(new Set());
  const [enhancedOutline, setEnhancedOutline] = useState<SermonOutline | null>(null);
  const [enhancementRecommendations, setEnhancementRecommendations] = useState<string[]>([]);
  const [currentDraftId, setCurrentDraftId] = useState<number | null>(null);
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Fetch saved sermon drafts
  const { data: savedDrafts, isLoading: draftsLoading, refetch: refetchDrafts } = useQuery({
    queryKey: ['/api/sermon/drafts'],
    queryFn: () => apiRequest('GET', '/api/sermon/drafts'),
  });

  // Fetch completed sermons
  const { data: completedSermons, isLoading: completedLoading, refetch: refetchCompleted } = useQuery({
    queryKey: ['/api/sermon/completed'],
    queryFn: () => apiRequest('GET', '/api/sermon/completed'),
  });

  // Save Draft mutation
  const saveDraftMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('POST', '/api/sermon/save-draft', { ...data, draftId: currentDraftId });
    },
    onSuccess: (data) => {
      setCurrentDraftId(data.draftId);
      refetchDrafts();
      toast({
        title: "Draft Saved",
        description: "Your sermon draft has been saved successfully."
      });
    },
    onError: (error) => {
      toast({
        title: "Save Failed",
        description: "Failed to save draft. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Auto-save function
  const autoSave = () => {
    if (currentOutline || currentResearch || illustrations.length > 0) {
      const draftData = {
        title: sermonTopic || 'Untitled Sermon',
        outline: currentOutline,
        research: currentResearch,
        illustrations: illustrations,
        enhancement: enhancedOutline
      };
      saveDraftMutation.mutate(draftData);
    }
  };

  // Auto-save effect
  useEffect(() => {
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
    }
    
    if (currentOutline || currentResearch || illustrations.length > 0) {
      const timer = setTimeout(() => {
        autoSave();
      }, 30000); // Auto-save every 30 seconds
      
      setAutoSaveTimer(timer);
    }

    return () => {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
    };
  }, [currentOutline, currentResearch, illustrations, enhancedOutline]);

  // Export mutation  
  const exportMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/sermon/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error("Failed to export sermon");
      }
      
      // Get filename from headers
      const contentDisposition = response.headers.get("content-disposition");
      const filename = contentDisposition?.match(/filename="(.+)"/)?.[1] || "sermon.txt";
      
      // Create download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Export Complete",
        description: "Your sermon has been exported successfully."
      });
    },
    onError: (error) => {
      toast({
        title: "Export Failed", 
        description: "Failed to export sermon. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Biblical Research Mutation
  const researchMutation = useMutation({
    mutationFn: async (data: { scripture: string; topic: string }) => {
      const query = data.scripture || data.topic;
      return apiRequest('POST', '/api/biblical-research', { query });
    },
    onSuccess: (data) => {
      // Extract the research data from the API response
      const researchData = data.research || data;
      setCurrentResearch(researchData);
      toast({
        title: "Research Complete",
        description: "Biblical commentary and insights have been generated."
      });
    },
    onError: (error) => {
      toast({
        title: "Research Needs a Moment",
        description: "Let's try that research request again - sometimes the best insights take a second attempt.",
        variant: "default"
      });
    }
  });

  // Sermon Outline Mutation
  const outlineMutation = useMutation({
    mutationFn: async (data: { scripture: string; topic: string; audience: string; length: string }) => {
      return apiRequest('POST', '/api/sermon/outline', data);
    },
    onSuccess: (data) => {
      setCurrentOutline(data);
      toast({
        title: "Outline Generated",
        description: "Your sermon structure has been created."
      });
    },
    onError: (error) => {
      toast({
        title: "Let's Refine That Outline",
        description: "Your sermon structure is almost ready - let's give it another try with your input.",
        variant: "default"
      });
    }
  });

  // Illustrations Mutation for generating stories and presentation content
  const illustrationsMutation = useMutation({
    mutationFn: async (data: { topic: string; mainPoints: string[]; audience: string }) => {
      return apiRequest('POST', '/api/sermon/illustrations', data);
    },
    onSuccess: (data) => {
      setIllustrations(data);
      toast({
        title: "Stories Ready",
        description: `${data.length} compelling stories and visual aids generated for ${targetAudience} audience.`
      });
    },
    onError: (error) => {
      toast({
        title: "Finding Better Stories",
        description: "We're gathering compelling illustrations for your message - let's try once more.",
        variant: "default"
      });
    }
  });

  // Enhancement Mutation
  const enhanceMutation = useMutation({
    mutationFn: async (data: { outline: SermonOutline; research: BiblicalResearch; selectedStories?: SermonIllustration[] }) => {
      return apiRequest('POST', '/api/sermon/enhance', data);
    },
    onSuccess: (data) => {
      setEnhancedOutline(data.enhancedOutline);
      setEnhancementRecommendations(data.recommendations || []);
      // Stay on enhance tab to show enhanced content
      toast({
        title: "Sermon Enhanced",
        description: "Your sermon has been improved for clarity and engagement."
      });
    }
  });

  // Save Completed Sermon mutation
  const saveCompletedMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('POST', '/api/sermon/save-completed', data);
    },
    onSuccess: () => {
      toast({
        title: "Sermon Completed",
        description: "Your completed sermon has been saved to your profile."
      });
      // Refresh completed sermons list
      refetchCompleted();
      // Clear current draft after completing
      setCurrentDraftId(null);
      setCurrentOutline(null);
      setCurrentResearch(null);
      setIllustrations([]);
      setEnhancedOutline(null);
      setEnhancementRecommendations([]);
      setSermonTopic('');
      setScriptureText('');
      setActiveTab('completed');
    },
    onError: () => {
      toast({
        title: "Save Failed",
        description: "Failed to save completed sermon. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleCompleteSermon = () => {
    if (!enhancedOutline && !currentOutline) {
      toast({
        title: "Sermon Required",
        description: "Please create a sermon outline first.",
        variant: "destructive"
      });
      return;
    }

    const completedSermon = {
      title: sermonTopic || 'Untitled Sermon',
      outline: enhancedOutline || currentOutline,
      research: currentResearch,
      illustrations: illustrations,
      enhancement: enhancedOutline ? { enhancedOutline, recommendations: enhancementRecommendations } : null,
      completedAt: new Date().toISOString()
    };

    saveCompletedMutation.mutate(completedSermon);
  };

  const handleResearch = () => {
    if (!scriptureText && !sermonTopic) {
      toast({
        title: "Input Required",
        description: "Please provide either a scripture reference or sermon topic.",
        variant: "destructive"
      });
      return;
    }
    researchMutation.mutate({ scripture: scriptureText, topic: sermonTopic });
  };

  const handleGenerateOutline = () => {
    if (!scriptureText && !sermonTopic) {
      toast({
        title: "Input Required",
        description: "Please provide either a scripture reference or sermon topic.",
        variant: "destructive"
      });
      return;
    }
    outlineMutation.mutate({ 
      scripture: scriptureText, 
      topic: sermonTopic, 
      audience: targetAudience, 
      length: sermonLength 
    });
  };

  const handleFindIllustrations = () => {
    if (!currentOutline) {
      toast({
        title: "Outline Required",
        description: "Please generate a sermon outline first.",
        variant: "destructive"
      });
      return;
    }
    illustrationsMutation.mutate({
      topic: sermonTopic,
      mainPoints: currentOutline.mainPoints,
      audience: targetAudience
    });
  };

  const handleEnhanceSermon = () => {
    if (!currentOutline || !currentResearch) {
      toast({
        title: "Content Required",
        description: "Please generate both research and outline first.",
        variant: "destructive"
      });
      return;
    }
    
    // Get selected stories based on checkboxes
    const selectedStoriesArray = Array.from(selectedStories).map(index => illustrations[index]).filter(Boolean);
    
    enhanceMutation.mutate({ 
      outline: currentOutline, 
      research: currentResearch,
      selectedStories: selectedStoriesArray.length > 0 ? selectedStoriesArray : undefined
    });
  };

  const handleSaveDraft = () => {
    const title = currentOutline?.title || sermonTopic || "Untitled Sermon";
    saveDraftMutation.mutate({
      title,
      outline: currentOutline,
      research: currentResearch,
      illustrations,
      enhancement: null
    });
  };

  const handleExport = (format: 'txt' | 'pdf' | 'docx' | 'json' = 'docx') => {
    const title = currentOutline?.title || sermonTopic || "Untitled Sermon";
    exportMutation.mutate({
      title,
      outline: currentOutline,
      research: currentResearch,
      illustrations,
      enhancement: enhancedOutline ? { enhancedOutline, recommendations: enhancementRecommendations } : null,
      format
    });
  };

  const handleShare = async () => {
    if (!currentOutline && !enhancedOutline) {
      toast({
        title: "Nothing to share",
        description: "Please create a sermon outline first.",
        variant: "destructive"
      });
      return;
    }

    const outline = enhancedOutline || currentOutline;
    if (!outline) return;
    
    const shareText = `Check out this sermon: "${outline.title}"\n\nTheme: ${outline.theme || 'No theme specified'}\n\nMain Points:\n${outline.mainPoints?.map((point: any, index: number) => `${index + 1}. ${point.point || point}`).join('\n') || 'No main points available'}\n\nCreated with SoapBox Super App`;
    
    if (navigator.share && typeof navigator.canShare === 'function') {
      try {
        await navigator.share({
          title: outline.title,
          text: shareText,
          url: window.location.href
        });
        toast({
          title: "Shared successfully",
          description: "Sermon content has been shared."
        });
      } catch (error) {
        handleCopyToClipboard(shareText);
      }
    } else {
      handleCopyToClipboard(shareText);
    }
  };

  const handleCopyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied to clipboard",
        description: "Sermon content has been copied to your clipboard."
      });
    } catch (error) {
      toast({
        title: "Share failed",
        description: "Unable to share or copy content.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-4">
          AI-Powered Sermon Creation Studio
        </h1>
        <p className="text-base sm:text-lg text-gray-600 px-2">
          Transform your sermon preparation with intelligent research, outline generation, and content enhancement
        </p>
      </div>

      {/* Input Section */}
      <Card className="border-2 border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center text-blue-900">
            <Target className="w-5 h-5 mr-2" />
            Sermon Foundation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Scripture Reference (Optional)
              </label>
              <Input
                placeholder="e.g., John 3:16-21, Romans 8, Psalm 23"
                value={scriptureText}
                onChange={(e) => setScriptureText(e.target.value)}
                className="bg-white text-gray-900 placeholder-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sermon Topic/Theme
              </label>
              <Input
                placeholder="e.g., Grace, Faith in Action, God's Love"
                value={sermonTopic}
                onChange={(e) => setSermonTopic(e.target.value)}
                className="bg-white text-gray-900 placeholder-gray-500"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Audience
              </label>
              <select 
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900"
              >
                <option value="general">General Congregation</option>
                <option value="youth">Youth/Young Adults</option>
                <option value="families">Families with Children</option>
                <option value="seniors">Senior Adults</option>
                <option value="seekers">Seekers/New Believers</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sermon Length
              </label>
              <select 
                value={sermonLength}
                onChange={(e) => setSermonLength(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900"
              >
                <option value="short">Short (15-20 minutes)</option>
                <option value="medium">Medium (25-30 minutes)</option>
                <option value="long">Long (35-45 minutes)</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 gap-1">
          <TabsTrigger value="research" className="flex items-center justify-center text-xs sm:text-sm px-1 sm:px-3">
            <Search className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
            <span className="hidden sm:inline">Research</span>
          </TabsTrigger>
          <TabsTrigger value="outline" className="flex items-center justify-center text-xs sm:text-sm px-1 sm:px-3">
            <Lightbulb className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
            <span className="hidden sm:inline">Outline</span>
          </TabsTrigger>
          <TabsTrigger value="illustrations" className="flex items-center justify-center text-xs sm:text-sm px-1 sm:px-3">
            <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
            <span className="hidden sm:inline">Stories</span>
          </TabsTrigger>
          <TabsTrigger value="enhance" className="flex items-center justify-center text-xs sm:text-sm px-1 sm:px-3">
            <Star className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
            <span className="hidden sm:inline">Enhance</span>
          </TabsTrigger>
          <TabsTrigger value="saved" className="flex items-center justify-center text-xs sm:text-sm px-1 sm:px-3">
            <Edit3 className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
            <span className="hidden sm:inline">Drafts</span>
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center justify-center text-xs sm:text-sm px-1 sm:px-3">
            <Archive className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
            <span className="hidden sm:inline">Completed</span>
          </TabsTrigger>
        </TabsList>

        {/* Research Tab */}
        <TabsContent value="research" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
              <CardTitle className="flex items-center">
                <BookOpen className="w-5 h-5 mr-2" />
                Biblical Research Assistant
              </CardTitle>
              <Button 
                onClick={handleResearch}
                disabled={researchMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {researchMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Search className="w-4 h-4 mr-2" />
                )}
                Generate Research
              </Button>
            </CardHeader>
            <CardContent>
              {currentResearch ? (
                <div className="space-y-6">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-900 mb-2">Biblical Commentary</h4>
                    <p className="text-green-800 text-sm leading-relaxed">{currentResearch.commentary}</p>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">Historical Context</h4>
                    <p className="text-blue-800 text-sm leading-relaxed">{currentResearch.historicalContext}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-purple-900 mb-2">Key Themes</h4>
                      <div className="space-y-1">
                        {currentResearch.keyThemes.map((theme, idx) => (
                          <Badge key={idx} variant="outline" className="mr-1">
                            {theme}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-orange-900 mb-2">Cross References</h4>
                      <div className="space-y-1">
                        {currentResearch.crossReferences.map((ref, idx) => (
                          <div key={idx} className="text-sm text-orange-800">{ref}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Practical Applications</h4>
                    <ul className="space-y-1">
                      {currentResearch.practicalApplications.map((app, idx) => (
                        <li key={idx} className="text-sm text-gray-700 flex items-start">
                          <ChevronRight className="w-4 h-4 mr-1 mt-0.5 text-gray-500" />
                          <div>{renderFormattedText(typeof app === 'string' ? app : app.title || app.details || JSON.stringify(app))}</div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Enter scripture reference or topic above and click "Generate Research" to begin</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Outline Tab */}
        <TabsContent value="outline" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center">
                <Lightbulb className="w-5 h-5 mr-2" />
                Intelligent Sermon Outliner
              </CardTitle>
              <Button 
                onClick={handleGenerateOutline}
                disabled={outlineMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                {outlineMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Lightbulb className="w-4 h-4 mr-2" />
                )}
                Generate Outline
              </Button>
            </CardHeader>
            <CardContent>
              {currentOutline ? (
                <div className="space-y-6">
                  <div className="text-center bg-indigo-50 p-4 rounded-lg">
                    <h3 className="text-xl font-bold text-indigo-900">{currentOutline.title}</h3>
                    <p className="text-indigo-700 mt-1">{currentOutline.theme}</p>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">Introduction</h4>
                    <p className="text-blue-800 text-sm leading-relaxed">{currentOutline.introduction}</p>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-900 mb-3">Main Points</h4>
                    <div className="space-y-3">
                      {currentOutline.mainPoints.map((point, idx) => (
                        <div key={idx} className="flex items-start">
                          <span className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                            {idx + 1}
                          </span>
                          <div className="text-green-800 text-sm leading-relaxed">
                            {renderFormattedText(typeof point === 'string' ? point : point.point || point.details || JSON.stringify(point))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-purple-900 mb-2">Conclusion</h4>
                    <p className="text-purple-800 text-sm leading-relaxed">{currentOutline.conclusion}</p>
                  </div>
                  
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-orange-900 mb-2">Call to Action</h4>
                    <p className="text-orange-800 text-sm leading-relaxed">{currentOutline.callToAction}</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Scripture References</h4>
                    <div className="flex flex-wrap gap-2">
                      {currentOutline.scriptureReferences.map((ref, idx) => (
                        <Badge key={idx} variant="outline">{ref}</Badge>
                      ))}
                    </div>
                  </div>
                  
                  {currentOutline.closingPrayer && (
                    <div className="bg-indigo-50 p-4 rounded-lg border-l-4 border-indigo-400">
                      <h4 className="font-semibold text-indigo-900 mb-2 flex items-center">
                        <span className="w-2 h-2 bg-indigo-600 rounded-full mr-2"></span>
                        Closing Prayer
                      </h4>
                      <p className="text-indigo-800 text-sm leading-relaxed italic">{currentOutline.closingPrayer}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Lightbulb className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Set your foundation details and click "Generate Outline" to create your sermon structure</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Illustrations Tab */}
        <TabsContent value="illustrations" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center">
                <MessageSquare className="w-5 h-5 mr-2" />
                Story & Content Library
              </CardTitle>
              <Button 
                onClick={handleFindIllustrations}
                disabled={illustrationsMutation.isPending || !currentOutline}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {illustrationsMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <MessageSquare className="w-4 h-4 mr-2" />
                )}
                {illustrationsMutation.isPending ? 'Generating Sermon...' : 'Generate Sermon'}
              </Button>
            </CardHeader>
            <CardContent>
              {illustrations.length > 0 ? (
                <div className="space-y-4">
                  {/* Selection Controls */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={selectedStories.size === illustrations.length && illustrations.length > 0}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedStories(new Set(Array.from({length: illustrations.length}, (_, i) => i)));
                            } else {
                              setSelectedStories(new Set());
                            }
                          }}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="text-sm font-medium text-gray-700">Select All Stories</span>
                      </label>
                      <span className="text-sm text-gray-500">
                        {selectedStories.size} of {illustrations.length} selected
                      </span>
                    </div>
                    {selectedStories.size > 0 && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        These stories will be included in enhancement
                      </span>
                    )}
                  </div>
                  {illustrations.map((illustration, idx) => (
                    <Card key={idx} className="border border-gray-200">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-start space-x-3">
                            <input
                              type="checkbox"
                              id={`story-${idx}`}
                              checked={selectedStories.has(idx)}
                              onChange={(e) => {
                                const newSelection = new Set(selectedStories);
                                if (e.target.checked) {
                                  newSelection.add(idx);
                                } else {
                                  newSelection.delete(idx);
                                }
                                setSelectedStories(newSelection);
                              }}
                              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <div>
                              <h4 className="font-semibold text-gray-900">{illustration.title}</h4>
                            </div>
                          </div>
                          <Badge 
                            variant={illustration.relevanceScore > 0.8 ? "default" : "outline"}
                            className="ml-2"
                          >
                            {Math.round(illustration.relevanceScore * 100)}% match
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-700 mb-3 leading-relaxed">{illustration.story}</p>
                        <div className="bg-blue-50 p-3 rounded-md mb-3">
                          <p className="text-sm text-blue-800"><strong>Application:</strong> {illustration.application}</p>
                        </div>
                        
                        {/* Visual Elements Section */}
                        {illustration.visualElements && (
                          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-3">
                            <h5 className="font-semibold text-purple-900 mb-2 flex items-center">
                              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                              </svg>
                              Presentation Elements
                            </h5>
                            <div className="space-y-3 text-sm">
                              <div>
                                <span className="font-medium text-purple-800">Slide Title:</span>
                                <span className="ml-2 text-gray-700">{illustration.visualElements.slideTitle}</span>
                              </div>
                              
                              {/* Presentation Style Information */}
                              {(illustration.visualElements.audienceStyle || illustration.visualElements.themeStyle) && (
                                <div className="space-y-3">
                                  <span className="font-medium text-purple-800">Presentation Style Guide:</span>
                                  <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
                                    <div className="grid grid-cols-1 gap-2 text-xs text-gray-600">
                                      {illustration.visualElements.audienceStyle && (
                                        <div>
                                          <span className="font-medium text-purple-600">Audience Style:</span>
                                          <span className="ml-1 capitalize">{illustration.visualElements.audienceStyle}</span>
                                        </div>
                                      )}
                                      {illustration.visualElements.themeStyle && (
                                        <div>
                                          <span className="font-medium text-purple-600">Theme Elements:</span>
                                          <span className="ml-1">{illustration.visualElements.themeStyle}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}
                              
                              <div>
                                <span className="font-medium text-purple-800">Visual Description:</span>
                                <span className="ml-2 text-gray-700">{illustration.visualElements.keyImage}</span>
                              </div>
                              {illustration.visualElements.bulletPoints && (
                                <div>
                                  <span className="font-medium text-purple-800">Key Points:</span>
                                  <ul className="ml-4 mt-1 text-gray-700">
                                    {illustration.visualElements.bulletPoints.map((point, idx) => (
                                      <li key={idx} className="list-disc">{point}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {illustration.visualElements.scriptureConnection && (
                                <div>
                                  <span className="font-medium text-purple-800">Scripture:</span>
                                  <span className="ml-2 text-gray-700 italic">{illustration.visualElements.scriptureConnection}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Presentation Tips */}
                        {illustration.presentationTips && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-2">
                            <h5 className="font-semibold text-green-900 mb-2 flex items-center text-sm">
                              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                              </svg>
                              Delivery Tips
                            </h5>
                            <div className="text-xs text-green-800 space-y-1">
                              {illustration.presentationTips.timing && (
                                <div><strong>Timing:</strong> {illustration.presentationTips.timing}</div>
                              )}
                              {illustration.presentationTips.delivery && (
                                <div><strong>Delivery:</strong> {illustration.presentationTips.delivery}</div>
                              )}
                              {illustration.presentationTips.interaction && (
                                <div><strong>Engagement:</strong> {illustration.presentationTips.interaction}</div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        <p className="text-xs text-gray-500">Source: {illustration.source}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Generate a sermon outline first, then find relevant illustrations to enhance your message</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Enhancement Tab */}
        <TabsContent value="enhance" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center">
                <Star className="w-5 h-5 mr-2" />
                Sermon Content Enhancer
              </CardTitle>
              <Button 
                onClick={handleEnhanceSermon}
                disabled={enhanceMutation.isPending || !currentOutline || !currentResearch}
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                {enhanceMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Star className="w-4 h-4 mr-2" />
                )}
                Enhance Sermon
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-600" />
                    <h4 className="font-semibold text-green-900">Clarity Analysis</h4>
                    <p className="text-sm text-green-700">Reviews readability and flow</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <Target className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                    <h4 className="font-semibold text-blue-900">Engagement Optimization</h4>
                    <p className="text-sm text-blue-700">Suggests interaction points</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg text-center">
                    <BookOpen className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                    <h4 className="font-semibold text-purple-900">Theological Review</h4>
                    <p className="text-sm text-purple-700">Ensures biblical accuracy</p>
                  </div>
                </div>
                
                {!currentOutline || !currentResearch ? (
                  <div className="text-center py-8 text-gray-500">
                    <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Complete both research and outline generation to enhance your sermon</p>
                  </div>
                ) : enhancedOutline ? (
                  <div className="space-y-6">
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <h4 className="font-semibold text-green-900 mb-2 flex items-center">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Enhanced Sermon Complete
                      </h4>
                      <p className="text-green-700 text-sm">
                        Your sermon has been enhanced with AI recommendations and is ready for delivery or further customization.
                      </p>
                    </div>

                    <div className="bg-white p-6 rounded-lg border space-y-6">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">{enhancedOutline.title}</h3>
                        
                        <div className="grid md:grid-cols-2 gap-6 mb-6">
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <h4 className="font-semibold text-blue-900 mb-2">Theme</h4>
                            <p className="text-blue-800">{enhancedOutline.theme}</p>
                          </div>
                          
                          <div className="bg-purple-50 p-4 rounded-lg">
                            <h4 className="font-semibold text-purple-900 mb-2">Scripture References</h4>
                            <div className="flex flex-wrap gap-2">
                              {enhancedOutline.scriptureReferences?.map((ref, idx) => (
                                <span key={idx} className="bg-purple-200 text-purple-800 px-2 py-1 rounded text-sm">
                                  {ref}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-semibold text-gray-900 mb-3">Introduction</h4>
                            <p className="text-gray-700 leading-relaxed">{enhancedOutline.introduction}</p>
                          </div>

                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-semibold text-gray-900 mb-3">Main Points</h4>
                            <div className="space-y-3">
                              {enhancedOutline.mainPoints?.map((point: any, index: number) => (
                                <div key={index} className="border-l-4 border-blue-400 pl-4">
                                  <div className="font-medium text-gray-900">
                                    {index + 1}. {renderFormattedText(typeof point === 'string' ? point : point.point || point.details || JSON.stringify(point))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-semibold text-gray-900 mb-3">Conclusion</h4>
                            <p className="text-gray-700 leading-relaxed">{enhancedOutline.conclusion}</p>
                          </div>

                          <div className="bg-yellow-50 p-4 rounded-lg">
                            <h4 className="font-semibold text-yellow-900 mb-3">Call to Action</h4>
                            <p className="text-yellow-800 leading-relaxed">{enhancedOutline.callToAction}</p>
                          </div>

                          {enhancedOutline.closingPrayer && (
                            <div className="bg-green-50 p-4 rounded-lg">
                              <h4 className="font-semibold text-green-900 mb-3">Closing Prayer</h4>
                              <p className="text-green-800 leading-relaxed italic">{enhancedOutline.closingPrayer}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Display Illustrations/Stories if available */}
                    {illustrations && illustrations.length > 0 && (
                      <div className="bg-white p-6 rounded-lg border">
                        <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                          <BookOpen className="w-5 h-5 mr-2" />
                          Sermon Illustrations & Stories
                        </h4>
                        <div className="grid gap-4">
                          {illustrations.map((illustration, index) => (
                            <div key={index} className="border rounded-lg p-4 bg-gray-50">
                              <div className="flex justify-between items-start mb-2">
                                <h5 className="font-medium text-gray-900">{illustration.title}</h5>
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                  {illustration.type}
                                </span>
                              </div>
                              <p className="text-gray-700 text-sm leading-relaxed mb-3">
                                {illustration.content}
                              </p>
                              <div className="flex justify-between items-center text-xs text-gray-500">
                                <span>Impact: {illustration.impact}/10</span>
                                <span>Duration: {illustration.duration}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {enhancementRecommendations && enhancementRecommendations.length > 0 && (
                      <div className="bg-white p-4 rounded-lg border">
                        <h4 className="font-semibold text-gray-900 mb-3">AI Enhancement Recommendations</h4>
                        <ul className="space-y-2">
                          {enhancementRecommendations.map((rec, idx) => (
                            <li key={idx} className="flex items-start">
                              <Star className="w-4 h-4 mr-2 mt-0.5 text-yellow-500" />
                              <span className="text-gray-700">{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div className="flex justify-center pt-4">
                      <Button
                        onClick={handleCompleteSermon}
                        disabled={saveCompletedMutation.isPending}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2"
                      >
                        {saveCompletedMutation.isPending ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Archive className="w-4 h-4 mr-2" />
                        )}
                        Complete & Save Sermon
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <p className="text-yellow-800 text-sm">
                      Ready to enhance your sermon! The AI will analyze your content for clarity, engagement, 
                      and theological accuracy, then provide specific recommendations for improvement.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>



        {/* Drafts Tab */}
        <TabsContent value="saved" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Edit3 className="w-5 h-5 mr-2" />
                Sermon Drafts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {draftsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin mr-2" />
                  Loading drafts...
                </div>
              ) : savedDrafts && savedDrafts.length > 0 ? (
                <div className="space-y-4">
                  {savedDrafts.map((draft: any) => {
                    const parsedContent = typeof draft.content === 'string' ? JSON.parse(draft.content) : draft.content;
                    return (
                      <Card key={draft.id} className="border border-gray-200 hover:border-blue-300 transition-colors">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg mb-2">{draft.title}</h3>
                              <p className="text-sm text-gray-600 mb-2">
                                Created: {new Date(draft.createdAt).toLocaleDateString()}
                              </p>
                              {parsedContent.outline && (
                                <p className="text-sm text-gray-700 mb-2">
                                  <strong>Theme:</strong> {parsedContent.outline.theme || 'Not specified'}
                                </p>
                              )}
                              {parsedContent.outline && parsedContent.outline.mainPoints && (
                                <p className="text-sm text-gray-700">
                                  <strong>Main Points:</strong> {parsedContent.outline.mainPoints.length} sections
                                </p>
                              )}
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  if (parsedContent.outline) setCurrentOutline(parsedContent.outline);
                                  if (parsedContent.research) setCurrentResearch(parsedContent.research);
                                  if (parsedContent.illustrations) setIllustrations(parsedContent.illustrations);
                                  if (parsedContent.enhancement) setEnhancedOutline(parsedContent.enhancement);
                                  setSermonTopic(draft.title);
                                  setCurrentDraftId(draft.id);
                                  setActiveTab('outline');
                                  toast({
                                    title: "Draft Loaded",
                                    description: "Sermon draft has been loaded for editing."
                                  });
                                }}
                              >
                                <FileText className="w-4 h-4 mr-1" />
                                Load
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={async () => {
                                  try {
                                    await apiRequest('DELETE', `/api/sermon/drafts/${draft.id}`);
                                    refetchDrafts();
                                    toast({
                                      title: "Draft Deleted",
                                      description: "Sermon draft has been deleted."
                                    });
                                  } catch (error) {
                                    toast({
                                      title: "Delete Failed",
                                      description: "Failed to delete draft.",
                                      variant: "destructive"
                                    });
                                  }
                                }}
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Edit3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No sermon drafts yet</p>
                  <p className="text-sm">Create a sermon outline or research to automatically save drafts</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Completed Sermons Tab */}
        <TabsContent value="completed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                Completed Sermons
              </CardTitle>
            </CardHeader>
            <CardContent>
              {completedLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin mr-2" />
                  Loading completed sermons...
                </div>
              ) : completedSermons && completedSermons.length > 0 ? (
                <div className="space-y-4">
                  {completedSermons.map((sermon: any) => {
                    const parsedContent = typeof sermon.content === 'string' ? JSON.parse(sermon.content) : sermon.content;
                    return (
                      <Card key={sermon.id} className="border border-green-200 bg-green-50/50 hover:border-green-300 transition-colors">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold text-lg">{sermon.title}</h3>
                                <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Completed
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">
                                Completed: {new Date(sermon.publishedAt).toLocaleDateString()}
                              </p>
                              {parsedContent.outline && (
                                <p className="text-sm text-gray-700 mb-2">
                                  <strong>Theme:</strong> {parsedContent.outline.theme || 'Not specified'}
                                </p>
                              )}
                              {parsedContent.outline && parsedContent.outline.mainPoints && (
                                <p className="text-sm text-gray-700 mb-2">
                                  <strong>Main Points:</strong> {parsedContent.outline.mainPoints.length} sections
                                </p>
                              )}
                              {parsedContent.outline && parsedContent.outline.scriptureReferences && (
                                <p className="text-sm text-gray-700">
                                  <strong>Scripture:</strong> {parsedContent.outline.scriptureReferences.join(', ')}
                                </p>
                              )}
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  if (parsedContent.outline) setCurrentOutline(parsedContent.outline);
                                  if (parsedContent.research) setCurrentResearch(parsedContent.research);
                                  if (parsedContent.illustrations) setIllustrations(parsedContent.illustrations);
                                  if (parsedContent.enhancement) {
                                    setEnhancedOutline(parsedContent.enhancement.enhancedOutline);
                                    setEnhancementRecommendations(parsedContent.enhancement.recommendations || []);
                                  }
                                  setSermonTopic(sermon.title);
                                  setActiveTab('enhance');
                                  toast({
                                    title: "Sermon Loaded",
                                    description: "Completed sermon has been loaded for viewing."
                                  });
                                }}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                View
                              </Button>
                              <Button 
                                variant="default" 
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                                onClick={() => {
                                  // Navigate to content distribution with sermon data
                                  const sermonData = {
                                    title: sermon.title,
                                    content: parsedContent,
                                    outline: parsedContent.outline,
                                    theme: parsedContent.outline?.theme,
                                    mainPoints: parsedContent.outline?.mainPoints || [],
                                    scriptureRefs: parsedContent.outline?.scriptureReferences || []
                                  };
                                  
                                  // Store sermon data in sessionStorage for content distribution
                                  sessionStorage.setItem('sermonForDistribution', JSON.stringify(sermonData));
                                  
                                  // Navigate to content distribution page
                                  window.location.href = '/content-distribution';
                                }}
                              >
                                <Share2 className="w-4 h-4 mr-2" />
                                Distribute
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                  >
                                    <Download className="w-4 h-4 mr-2" />
                                    Export
                                    <ChevronDown className="w-3 h-3 ml-1" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => {
                                    // Load sermon and export as DOCX
                                    if (parsedContent.outline) setCurrentOutline(parsedContent.outline);
                                    if (parsedContent.research) setCurrentResearch(parsedContent.research);
                                    if (parsedContent.illustrations) setIllustrations(parsedContent.illustrations);
                                    if (parsedContent.enhancement) setEnhancedOutline(parsedContent.enhancement.enhancedOutline);
                                    setSermonTopic(sermon.title);
                                    handleExport('docx');
                                  }}>
                                    <FileText className="w-4 h-4 mr-2" />
                                    Word Document
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => {
                                    // Load sermon and export as PDF
                                    if (parsedContent.outline) setCurrentOutline(parsedContent.outline);
                                    if (parsedContent.research) setCurrentResearch(parsedContent.research);
                                    if (parsedContent.illustrations) setIllustrations(parsedContent.illustrations);
                                    if (parsedContent.enhancement) setEnhancedOutline(parsedContent.enhancement.enhancedOutline);
                                    setSermonTopic(sermon.title);
                                    handleExport('pdf');
                                  }}>
                                    <FileImage className="w-4 h-4 mr-2" />
                                    PDF Document
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No completed sermons yet</p>
                  <p className="text-sm">Complete a sermon using the "Complete & Save Sermon" button to see it here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      {(currentOutline || currentResearch) && (
        <Card className="bg-gray-50">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div className="flex space-x-2">
                <Badge variant="outline" className="bg-white">
                  <Clock className="w-3 h-3 mr-1" />
                  Time Saved: ~6 hours
                </Badge>
                <Badge variant="outline" className="bg-white">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  AI-Powered Research
                </Badge>
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleSaveDraft}
                  disabled={saveDraftMutation.isPending}
                >
                  {saveDraftMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Save Draft
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      disabled={exportMutation.isPending}
                    >
                      {exportMutation.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4 mr-2" />
                      )}
                      Download to Computer
                      <ChevronDown className="w-3 h-3 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleExport('docx')}>
                      <FileText className="w-4 h-4 mr-2" />
                      Word Document (.docx)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport('pdf')}>
                      <FileImage className="w-4 h-4 mr-2" />
                      PDF Document (.pdf)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport('txt')}>
                      <FileDown className="w-4 h-4 mr-2" />
                      Text File (.txt)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport('json')}>
                      <Code className="w-4 h-4 mr-2" />
                      JSON Data (.json)
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}