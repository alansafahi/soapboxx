import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "./ui/dropdown-menu";
import { useToast } from "../hooks/use-toast";
import ShareDialog from "./ShareDialog";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import { SermonIllustration } from "../../../shared/schema";
import { 
  Search, Lightbulb, BookOpen, MessageSquare, Star, 
  Clock, Target, RefreshCw, Save, Download, Share2,
  ChevronRight, CheckCircle, AlertCircle, Loader2,
  ChevronDown, FileText, FileImage, FileDown, Code,
  Archive, Edit3, Eye, GraduationCap, Baby, Users,
  Sparkles, Play, Palette, Music
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
  theme?: string;
  bigIdea?: string;
  mainPoints: string[];
  introduction?: string;
  conclusion?: string;
  callToAction?: string;
  scriptureReferences: string[];
  closingPrayer?: string;
  // Sunday School specific properties
  openingActivity?: string;
  bibleStoryMethod?: string;
  applicationActivities?: string[];
  memoryVerseActivity?: string;
  closingActivity?: string;
  takeHome?: string;
}

interface BiblicalResearch {
  commentary: string;
  crossReferences: string[];
  historicalContext: string;
  keyThemes: string[];
  practicalApplications: string[];
  // Sunday School specific properties
  memoryVerse?: string;
  discussionQuestions?: string[];
}



export default function SermonCreationStudio() {
  const [activeTab, setActiveTab] = useState("research");
  const [contentType, setContentType] = useState("sermon");
  const [scriptureText, setScriptureText] = useState("");
  const [sermonTopic, setSermonTopic] = useState("");
  const [targetAudience, setTargetAudience] = useState("general");
  const [sermonLength, setSermonLength] = useState("medium");
  const [ageGroup, setAgeGroup] = useState("elementary"); // For Sunday School
  const [currentOutline, setCurrentOutline] = useState<SermonOutline | null>(null);
  const [currentResearch, setCurrentResearch] = useState<BiblicalResearch | null>(null);
  const [illustrations, setIllustrations] = useState<SermonIllustration[]>([]);
  const [selectedStories, setSelectedStories] = useState<Set<number>>(new Set());
  const [enhancedOutline, setEnhancedOutline] = useState<SermonOutline | null>(null);
  const [enhancementRecommendations, setEnhancementRecommendations] = useState<string[]>([]);
  const [currentDraftId, setCurrentDraftId] = useState<number | null>(null);
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const { toast } = useToast();

  // Fetch saved sermon drafts
  const { data: savedDrafts, isLoading: draftsLoading, refetch: refetchDrafts } = useQuery({
    queryKey: ['/api/sermon-studio/drafts'],
    queryFn: () => apiRequest('GET', '/api/sermon-studio/drafts'),
  });

  // Fetch completed sermons
  const { data: completedSermons, isLoading: completedLoading, refetch: refetchCompleted } = useQuery({
    queryKey: ['/api/sermon-studio/completed'],
    queryFn: () => apiRequest('GET', '/api/sermon-studio/completed'),
  });

  // Save Draft mutation
  const saveDraftMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('POST', '/api/sermon-studio/save-draft', { ...data, draftId: currentDraftId });
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

  // Progress tracking functions
  const getProgressSteps = () => {
    let completed = 0;
    if (currentResearch) completed++;
    if (currentOutline) completed++;
    if (illustrations.length > 0) completed++;
    if (enhancedOutline) completed++;
    return { completed, total: 4 };
  };

  const getNextStep = () => {
    if (!currentResearch) {
      return {
        tab: 'research',
        title: 'Generate Biblical Research',
        description: 'Start with biblical commentary and context for your sermon'
      };
    }
    if (!currentOutline) {
      return {
        tab: 'outline',
        title: contentType === "sermon" ? 'Create Sermon Outline' : 'Create Lesson Plan',
        description: contentType === "sermon" 
          ? 'Build your sermon structure with main points and flow'
          : 'Build your lesson structure with age-appropriate activities'
      };
    }
    if (illustrations.length === 0) {
      return {
        tab: 'illustrations',
        title: contentType === "sermon" ? 'Add Stories & Content' : 'Add Activities & Games',
        description: contentType === "sermon" 
          ? 'Find compelling illustrations and stories for your sermon'
          : 'Create fun activities and games for your lesson'
      };
    }
    if (!enhancedOutline) {
      return {
        tab: 'enhance',
        title: contentType === "sermon" ? 'Enhance Your Sermon' : 'Enhance Your Lesson',
        description: contentType === "sermon" 
          ? 'Polish and refine your sermon with AI suggestions'
          : 'Polish and refine your lesson plan with AI suggestions'
      };
    }
    return null;
  };

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
      return apiRequest('POST', '/api/sermon-studio/outline', data);
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
      return apiRequest('POST', '/api/sermon-studio/illustrations', data);
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
      return apiRequest('POST', '/api/sermon-studio/enhance', data);
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

  // Sunday School mutations
  const sundaySchoolResearchMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('POST', '/api/sunday-school/research', data);
    },
    onSuccess: (data) => {
      setCurrentResearch(data);
      toast({
        title: "Research Complete",
        description: "Sunday School lesson research generated successfully.",
      });
      setActiveTab("outline");
    },
    onError: (error: any) => {
      console.error('Sunday School research error:', error);
      toast({
        title: "Research failed",
        description: error?.message || "Failed to generate lesson research. Please try again.",
        variant: "destructive"
      });
    }
  });

  const sundaySchoolLessonPlanMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('POST', '/api/sunday-school/lesson-plan', data);
    },
    onSuccess: (data) => {
      setCurrentOutline(data);
      toast({
        title: "Lesson Plan Complete",
        description: "Sunday School lesson plan created successfully.",
      });
      setActiveTab("illustrations");
      // Auto-trigger activities generation after lesson plan completion
      setTimeout(() => {
        sundaySchoolActivitiesMutation.mutate({
          topic: sermonTopic,
          mainPoints: data.mainPoints,
          ageGroup: ageGroup
        });
      }, 500);
    },
    onError: (error: any) => {
      console.error('Sunday School lesson plan error:', error);
      toast({
        title: "Lesson plan failed", 
        description: error?.message || "Failed to generate lesson plan. Please try again.",
        variant: "destructive"
      });
    }
  });

  const sundaySchoolActivitiesMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('POST', '/api/sunday-school/activities', data);
    },
    onSuccess: (data) => {
      setIllustrations(data.activities || []);
      toast({
        title: "Activities Generated",
        description: "Sunday School activities and games created successfully.",
      });
      setActiveTab("enhance");
    },
    onError: (error: any) => {
      console.error('Sunday School activities error:', error);
      toast({
        title: "Activities generation failed",
        description: error?.message || "Failed to generate activities. Please try again.",
        variant: "destructive"
      });
    }
  });

  const sundaySchoolEnhanceMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('POST', '/api/sunday-school/enhance', data);
    },
    onSuccess: (data) => {
      setEnhancedOutline(data.enhancedOutline);
      setEnhancementRecommendations(data.recommendations || []);
      toast({
        title: "Lesson Enhanced",
        description: "Sunday School lesson has been enhanced successfully.",
      });
    },
    onError: (error: any) => {
      console.error('Sunday School enhancement error:', error);
      toast({
        title: "Enhancement failed",
        description: error?.message || "Failed to enhance lesson. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Save Completed Sermon mutation
  const saveCompletedMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('POST', '/api/sermon-studio/save-completed', data);
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
        description: contentType === "sermon" 
          ? "Please provide either a scripture reference or sermon topic."
          : "Please provide either a scripture reference or lesson topic.",
        variant: "destructive"
      });
      return;
    }
    
    if (contentType === "sermon") {
      researchMutation.mutate({ scripture: scriptureText, topic: sermonTopic });
    } else {
      sundaySchoolResearchMutation.mutate({ 
        scripture: scriptureText, 
        topic: sermonTopic, 
        ageGroup: ageGroup 
      });
    }
  };

  const handleGenerateOutline = () => {
    if (!scriptureText && !sermonTopic) {
      toast({
        title: "Input Required",
        description: contentType === "sermon"
          ? "Please provide either a scripture reference or sermon topic."
          : "Please provide either a scripture reference or lesson topic.",
        variant: "destructive"
      });
      return;
    }
    
    if (contentType === "sermon") {
      outlineMutation.mutate({ 
        scripture: scriptureText, 
        topic: sermonTopic, 
        audience: targetAudience, 
        length: sermonLength 
      });
    } else {
      sundaySchoolLessonPlanMutation.mutate({
        scripture: scriptureText,
        topic: sermonTopic,
        ageGroup: ageGroup,
        duration: sermonLength
      });
    }
  };

  const handleFindIllustrations = () => {
    if (!currentOutline) {
      toast({
        title: contentType === "sermon" ? "Outline Required" : "Lesson Plan Required",
        description: contentType === "sermon" 
          ? "Please generate a sermon outline first."
          : "Please generate a lesson plan first.",
        variant: "destructive"
      });
      return;
    }
    
    if (contentType === "sermon") {
      illustrationsMutation.mutate({
        topic: sermonTopic,
        mainPoints: currentOutline.mainPoints,
        audience: targetAudience
      });
    } else {
      sundaySchoolActivitiesMutation.mutate({
        topic: sermonTopic,
        mainPoints: currentOutline.mainPoints,
        ageGroup: ageGroup
      });
    }
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

    setShareDialogOpen(true);
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
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2 sm:mb-4">
          {contentType === "sermon" ? "AI-Powered Sermon Creation Studio" : "Sunday School Lesson Creator"}
        </h1>
        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 px-2">
          {contentType === "sermon" 
            ? "Transform your sermon preparation with intelligent research, outline generation, and content enhancement"
            : "Create engaging Sunday School lessons with age-appropriate activities, games, and biblical teachings"
          }
        </p>

        {/* Content Type Selector */}
        <div className="flex justify-center mt-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-1 shadow-sm border dark:border-gray-600">
            <div className="flex">
              <button
                onClick={() => setContentType("sermon")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                  contentType === "sermon"
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                }`}
              >
                <BookOpen className="w-4 h-4" />
                Sermon
              </button>
              <button
                onClick={() => setContentType("sundayschool")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                  contentType === "sundayschool"
                    ? "bg-purple-600 text-white"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                Sunday School
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Input Section */}
      <Card className={`border-2 ${contentType === "sermon" ? "border-blue-200 bg-blue-50" : "border-purple-200 bg-purple-50"} dark:bg-gray-800 dark:border-gray-600`}>
        <CardHeader>
          <CardTitle className={`flex items-center ${contentType === "sermon" ? "text-blue-900 dark:text-blue-200" : "text-purple-900 dark:text-purple-200"}`}>
            <Target className="w-5 h-5 mr-2" />
            {contentType === "sermon" ? "Sermon Foundation" : "Lesson Foundation"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-blue-800 dark:text-blue-400 mb-2">
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
              <label className={`block text-sm font-medium mb-2 ${contentType === "sermon" ? "text-blue-800 dark:text-blue-400" : "text-purple-800 dark:text-purple-400"}`}>
                {contentType === "sermon" ? "Sermon Topic/Theme" : "Lesson Topic/Theme"}
              </label>
              <Input
                placeholder={contentType === "sermon" 
                  ? "e.g., Grace, Faith in Action, God's Love"
                  : "e.g., David and Goliath, God's Love for Children, Jesus Feeds 5000"
                }
                value={sermonTopic}
                onChange={(e) => setSermonTopic(e.target.value)}
                className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contentType === "sermon" ? (
              <div>
                <label className="block text-sm font-medium text-blue-800 dark:text-blue-400 mb-2">
                  Target Audience
                </label>
                <select 
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="general">General Congregation</option>
                  <option value="youth">Youth/Young Adults</option>
                  <option value="families">Families with Children</option>
                  <option value="seniors">Senior Adults</option>
                  <option value="seekers">Seekers/New Believers</option>
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-purple-800 dark:text-purple-400 mb-2">
                  Age Group
                </label>
                <select 
                  value={ageGroup}
                  onChange={(e) => setAgeGroup(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="preschool">Preschool (3-5 years)</option>
                  <option value="elementary">Elementary (6-10 years)</option>
                  <option value="middle">Middle School (11-13 years)</option>
                  <option value="high">High School (14-18 years)</option>
                </select>
              </div>
            )}
            <div>
              <label className={`block text-sm font-medium mb-2 ${contentType === "sermon" ? "text-blue-800 dark:text-blue-400" : "text-purple-800 dark:text-purple-400"}`}>
                {contentType === "sermon" ? "Sermon Length" : "Lesson Duration"}
              </label>
              <select 
                value={sermonLength}
                onChange={(e) => setSermonLength(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                {contentType === "sermon" ? (
                  <>
                    <option value="short">Short (15-20 minutes)</option>
                    <option value="medium">Medium (25-30 minutes)</option>
                    <option value="long">Long (35-45 minutes)</option>
                  </>
                ) : (
                  <>
                    <option value="short">Short (20-30 minutes)</option>
                    <option value="medium">Medium (35-45 minutes)</option>
                    <option value="long">Long (50-60 minutes)</option>
                  </>
                )}
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
            <span className="hidden sm:inline">{contentType === "sermon" ? "Outline" : "Plan"}</span>
          </TabsTrigger>
          <TabsTrigger value="illustrations" className="flex items-center justify-center text-xs sm:text-sm px-1 sm:px-3">
            {contentType === "sermon" ? (
              <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
            ) : (
              <Play className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
            )}
            <span className="hidden sm:inline">{contentType === "sermon" ? "Stories" : "Activities"}</span>
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

        {/* Progress Bar */}
        <div className="mt-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {contentType === "sermon" ? "Sermon Creation Progress" : "Lesson Creation Progress"}
            </span>
            <span className="text-sm text-gray-500">
              {getProgressSteps().completed}/{getProgressSteps().total} steps completed
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500 ease-in-out"
              style={{ width: `${(getProgressSteps().completed / getProgressSteps().total) * 100}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-2">
            <div className={`text-xs ${currentResearch ? 'text-green-600 font-medium' : 'text-gray-400'}`}>
              ✓ Research
            </div>
            <div className={`text-xs ${currentOutline ? 'text-green-600 font-medium' : 'text-gray-400'}`}>
              ✓ {contentType === "sermon" ? "Outline" : "Plan"}
            </div>
            <div className={`text-xs ${illustrations.length > 0 ? 'text-green-600 font-medium' : 'text-gray-400'}`}>
              ✓ {contentType === "sermon" ? "Stories" : "Activities"}
            </div>
            <div className={`text-xs ${enhancedOutline ? 'text-green-600 font-medium' : 'text-gray-400'}`}>
              ✓ Enhanced
            </div>
          </div>
          
          {/* Next Step Suggestion */}
          {getNextStep() && (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse mr-2"></div>
                  <span className="text-sm text-blue-800 font-medium">
                    Next: {getNextStep()?.title}
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs border-blue-300 text-blue-700 hover:bg-blue-100 dark:text-white dark:border-blue-600 dark:hover:bg-blue-800"
                  onClick={() => {
                    const nextStep = getNextStep();
                    if (nextStep?.tab === 'research' && !currentResearch) {
                      // If first step, jump to Generate Research
                      setActiveTab('research');
                      setTimeout(() => {
                        handleResearch();
                      }, 100);
                    } else if (nextStep?.tab === 'outline' && !currentOutline) {
                      // If outline step, jump to Generate Outline
                      setActiveTab('outline');
                      setTimeout(() => {
                        handleGenerateOutline();
                      }, 100);
                    } else if (nextStep?.tab === 'illustrations' && illustrations.length === 0) {
                      // If illustrations step, jump to Generate Illustrations
                      setActiveTab('illustrations');
                      setTimeout(() => {
                        handleFindIllustrations();
                      }, 100);
                    } else if (nextStep?.tab === 'enhance' && !enhancedOutline) {
                      // If enhance step, jump to Enhance
                      setActiveTab('enhance');
                      setTimeout(() => {
                        handleEnhanceSermon();
                      }, 100);
                    } else {
                      setActiveTab(nextStep?.tab);
                    }
                  }}
                >
                  {getProgressSteps().completed === 0 ? 'Start' : 'Continue'} →
                </Button>
              </div>
              <p className="text-xs text-blue-600 mt-1">{getNextStep()?.description}</p>
            </div>
          )}
        </div>

        {/* Research Tab */}
        <TabsContent value="research" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
              <CardTitle className="flex items-center">
                <BookOpen className="w-5 h-5 mr-2" />
                {contentType === "sermon" ? "Biblical Research Assistant" : "Lesson Research Assistant"}
              </CardTitle>
              <Button 
                onClick={handleResearch}
                disabled={researchMutation.isPending || sundaySchoolResearchMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {(researchMutation.isPending || sundaySchoolResearchMutation.isPending) ? (
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
                          <Badge key={idx} variant="outline" className="mr-1 mb-1 text-purple-700 border-purple-300 bg-white">
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
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {contentType === "sermon" ? "Practical Applications" : "Child-Friendly Applications"}
                    </h4>
                    <ul className="space-y-1">
                      {currentResearch.practicalApplications.map((app, idx) => (
                        <li key={idx} className="text-sm text-gray-700 flex items-start">
                          <ChevronRight className="w-4 h-4 mr-1 mt-0.5 text-gray-500" />
                          <div>{renderFormattedText(typeof app === 'string' ? app : app.title || app.details || JSON.stringify(app))}</div>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Sunday School specific content */}
                  {contentType === "sunday-school" && currentResearch.memoryVerse && (
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-yellow-900 mb-2">Memory Verse</h4>
                      <p className="text-yellow-800 text-sm leading-relaxed italic">{currentResearch.memoryVerse}</p>
                    </div>
                  )}

                  {contentType === "sunday-school" && currentResearch.discussionQuestions && (
                    <div className="bg-indigo-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-indigo-900 mb-2">Discussion Questions</h4>
                      <ul className="space-y-1">
                        {currentResearch.discussionQuestions.map((question, idx) => (
                          <li key={idx} className="text-sm text-indigo-700 flex items-start">
                            <span className="text-indigo-500 mr-2">{idx + 1}.</span>
                            <div>{question}</div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
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
                {contentType === "sermon" ? "Intelligent Sermon Outliner" : "Lesson Plan Creator"}
              </CardTitle>
              <Button 
                onClick={handleGenerateOutline}
                disabled={outlineMutation.isPending || sundaySchoolLessonPlanMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                {(outlineMutation.isPending || sundaySchoolLessonPlanMutation.isPending) ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Lightbulb className="w-4 h-4 mr-2" />
                )}
                {contentType === "sermon" ? "Generate Outline" : "Create Lesson Plan"}
              </Button>
            </CardHeader>
            <CardContent>
              {currentOutline ? (
                <div className="space-y-6">
                  <div className="text-center bg-indigo-50 p-4 rounded-lg">
                    <h3 className="text-xl font-bold text-indigo-900">{currentOutline.title}</h3>
                    <p className="text-indigo-700 mt-1">{contentType === "sermon" ? currentOutline.theme : currentOutline.bigIdea}</p>
                  </div>
                  
                  {/* Sunday School specific elements */}
                  {contentType === "sunday-school" && currentOutline.openingActivity && (
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-green-900 mb-2">Opening Activity</h4>
                      <p className="text-green-800 text-sm leading-relaxed">{currentOutline.openingActivity}</p>
                    </div>
                  )}
                  
                  {contentType === "sunday-school" && currentOutline.bibleStoryMethod && (
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-yellow-900 mb-2">Bible Story Method</h4>
                      <p className="text-yellow-800 text-sm leading-relaxed">{currentOutline.bibleStoryMethod}</p>
                    </div>
                  )}
                  
                  {/* Sermon specific introduction */}
                  {contentType === "sermon" && currentOutline.introduction && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">Introduction</h4>
                      <p className="text-blue-800 text-sm leading-relaxed">{currentOutline.introduction}</p>
                    </div>
                  )}
                  
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
                  
                  {/* Sunday School specific activities */}
                  {contentType === "sunday-school" && currentOutline.applicationActivities && (
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-purple-900 mb-2">Application Activities</h4>
                      <ul className="space-y-1">
                        {currentOutline.applicationActivities.map((activity, idx) => (
                          <li key={idx} className="text-sm text-purple-800 flex items-start">
                            <span className="text-purple-600 mr-2">•</span>
                            <div>{activity}</div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {contentType === "sunday-school" && currentOutline.memoryVerseActivity && (
                    <div className="bg-pink-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-pink-900 mb-2">Memory Verse Activity</h4>
                      <p className="text-pink-800 text-sm leading-relaxed">{currentOutline.memoryVerseActivity}</p>
                    </div>
                  )}
                  
                  {/* Sermon specific elements */}
                  {contentType === "sermon" && currentOutline.conclusion && (
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-purple-900 mb-2">Conclusion</h4>
                      <p className="text-purple-800 text-sm leading-relaxed">{currentOutline.conclusion}</p>
                    </div>
                  )}
                  
                  {contentType === "sermon" && currentOutline.callToAction && (
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-orange-900 mb-2">Call to Action</h4>
                      <p className="text-orange-800 text-sm leading-relaxed">{currentOutline.callToAction}</p>
                    </div>
                  )}
                  
                  {/* Both content types */}
                  {contentType === "sunday-school" && currentOutline.closingActivity && (
                    <div className="bg-teal-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-teal-900 mb-2">Closing Activity</h4>
                      <p className="text-teal-800 text-sm leading-relaxed">{currentOutline.closingActivity}</p>
                    </div>
                  )}
                  
                  {contentType === "sunday-school" && currentOutline.takeHome && (
                    <div className="bg-cyan-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-cyan-900 mb-2">Take Home Activity</h4>
                      <p className="text-cyan-800 text-sm leading-relaxed">{currentOutline.takeHome}</p>
                    </div>
                  )}
                  
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Scripture References</h4>
                    <div className="flex flex-wrap gap-2">
                      {currentOutline.scriptureReferences.map((ref, idx) => (
                        <Badge key={idx} variant="outline" className="bg-white dark:bg-gray-600 border-gray-300 dark:border-gray-500 text-gray-700 dark:text-gray-200">{ref}</Badge>
                      ))}
                    </div>
                  </div>
                  
                  {currentOutline.closingPrayer && (
                    <div className="bg-indigo-50 p-4 rounded-lg border-l-4 border-indigo-400">
                      <h4 className="font-semibold text-indigo-900 dark:text-indigo-300 mb-2 flex items-center">
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
                {contentType === "sermon" ? (
                  <MessageSquare className="w-5 h-5 mr-2" />
                ) : (
                  <Play className="w-5 h-5 mr-2" />
                )}
                {contentType === "sermon" ? "Story & Content Library" : "Activities & Games Library"}
              </CardTitle>
              <Button 
                onClick={handleFindIllustrations}
                disabled={illustrationsMutation.isPending || sundaySchoolActivitiesMutation.isPending || !currentOutline}
                className={contentType === "sermon" ? "bg-purple-600 hover:bg-purple-700" : "bg-orange-600 hover:bg-orange-700"}
              >
                {(illustrationsMutation.isPending || sundaySchoolActivitiesMutation.isPending) ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : contentType === "sermon" ? (
                  <MessageSquare className="w-4 h-4 mr-2" />
                ) : (
                  <Play className="w-4 h-4 mr-2" />
                )}
                {(illustrationsMutation.isPending || sundaySchoolActivitiesMutation.isPending) ? 'Generating...' : (contentType === "sermon" ? 'Generate Stories' : 'Generate Activities')}
              </Button>
            </CardHeader>
            <CardContent>
              {illustrations.length > 0 ? (
                <div className="space-y-4">
                  {/* Selection Controls */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border dark:border-gray-600">
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
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {contentType === "sermon" ? "Select All Stories" : "Select All Activities"}
                        </span>
                      </label>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {selectedStories.size} of {illustrations.length} selected
                      </span>
                    </div>
                    {selectedStories.size > 0 && (
                      <span className="text-xs bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                        These stories will be included in enhancement
                      </span>
                    )}
                  </div>
                  {illustrations.map((illustration, idx) => (
                    <Card key={idx} className="border border-gray-200 dark:border-gray-700">
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
                              <h4 className="font-semibold text-gray-900 dark:text-gray-100">{illustration.title || illustration.name}</h4>
                              {contentType === "sunday-school" && illustration.type && (
                                <Badge variant="outline" className="mt-1 text-xs">
                                  {illustration.type}
                                </Badge>
                              )}
                            </div>
                          </div>
                          {contentType === "sermon" ? (
                            <Badge 
                              variant={(illustration.relevanceScore || 0) > 0.8 ? "default" : "outline"}
                              className="ml-2"
                            >
                              {Math.round((illustration.relevanceScore || 0) * 100)}% match
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="ml-2 bg-orange-50 text-orange-700 border-orange-300">
                              {illustration.duration || "Activity"}
                            </Badge>
                          )}
                        </div>
                        
                        {/* Sunday School Activity Format */}
                        {contentType === "sunday-school" ? (
                          <div className="space-y-3">
                            {illustration.instructions && (
                              <div className="bg-green-50 p-3 rounded-md">
                                <p className="text-sm font-medium text-green-900 mb-1">Instructions:</p>
                                <p className="text-sm text-green-800 leading-relaxed">{illustration.instructions}</p>
                              </div>
                            )}
                            
                            {illustration.materials && (
                              <div className="bg-blue-50 p-3 rounded-md">
                                <p className="text-sm font-medium text-blue-900 mb-1">Materials Needed:</p>
                                <ul className="text-sm text-blue-800 list-disc list-inside">
                                  {illustration.materials.map((material, idx) => (
                                    <li key={idx}>{material}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {illustration.lessonConnection && (
                              <div className="bg-purple-50 p-3 rounded-md">
                                <p className="text-sm font-medium text-purple-900 mb-1">Lesson Connection:</p>
                                <p className="text-sm text-purple-800 leading-relaxed">{illustration.lessonConnection}</p>
                              </div>
                            )}
                            
                            {illustration.ageAppropriate && (
                              <div className="bg-yellow-50 p-3 rounded-md">
                                <p className="text-sm font-medium text-yellow-900 mb-1">Age Appropriateness:</p>
                                <p className="text-sm text-yellow-800 leading-relaxed">{illustration.ageAppropriate}</p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <>
                            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">{illustration.story}</p>
                            <div className="bg-blue-50 dark:bg-blue-900 p-3 rounded-md mb-3">
                              <p className="text-sm text-blue-800 dark:text-blue-200"><strong>Application:</strong> {illustration.application}</p>
                            </div>
                          </>
                        )}
                        
                        {/* Visual Elements Section */}
                        {illustration.visualElements && (
                          <div className="bg-purple-50 dark:bg-purple-900 border border-purple-200 dark:border-purple-700 rounded-lg p-4 mb-3">
                            <h5 className="font-semibold text-purple-900 dark:text-purple-200 mb-2 flex items-center">
                              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                              </svg>
                              Presentation Elements
                            </h5>
                            <div className="space-y-3 text-sm">
                              <div>
                                <span className="font-medium text-purple-800 dark:text-purple-300">Slide Title:</span>
                                <span className="ml-2 text-gray-700 dark:text-gray-300">{illustration.visualElements.slideTitle}</span>
                              </div>
                              
                              {/* Presentation Style Information */}
                              {(illustration.visualElements.audienceStyle || illustration.visualElements.themeStyle) && (
                                <div className="space-y-3">
                                  <span className="font-medium text-purple-800 dark:text-purple-300">Presentation Style Guide:</span>
                                  <div className="bg-purple-50 dark:bg-purple-800 p-3 rounded-lg border border-purple-100 dark:border-purple-600">
                                    <div className="grid grid-cols-1 gap-2 text-xs text-gray-600 dark:text-gray-300">
                                      {illustration.visualElements.audienceStyle && (
                                        <div>
                                          <span className="font-medium text-purple-600 dark:text-purple-300">Audience Style:</span>
                                          <span className="ml-1 capitalize">{illustration.visualElements.audienceStyle}</span>
                                        </div>
                                      )}
                                      {illustration.visualElements.themeStyle && (
                                        <div>
                                          <span className="font-medium text-purple-600 dark:text-purple-300">Theme Elements:</span>
                                          <span className="ml-1">{illustration.visualElements.themeStyle}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}
                              
                              <div>
                                <span className="font-medium text-purple-800 dark:text-purple-300">Visual Description:</span>
                                <span className="ml-2 text-gray-700 dark:text-gray-300">{illustration.visualElements.keyImage}</span>
                              </div>
                              {illustration.visualElements.bulletPoints && (
                                <div>
                                  <span className="font-medium text-purple-800 dark:text-purple-300">Key Points:</span>
                                  <ul className="ml-4 mt-1 text-gray-700 dark:text-gray-300">
                                    {illustration.visualElements.bulletPoints.map((point, idx) => (
                                      <li key={idx} className="list-disc">{point}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {illustration.visualElements.scriptureConnection && (
                                <div>
                                  <span className="font-medium text-purple-800 dark:text-purple-300">Scripture:</span>
                                  <span className="ml-2 text-gray-700 dark:text-gray-300 italic">{illustration.visualElements.scriptureConnection}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Presentation Tips */}
                        {illustration.presentationTips && (
                          <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg p-3 mb-2">
                            <h5 className="font-semibold text-green-900 dark:text-green-200 mb-2 flex items-center text-sm">
                              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                              </svg>
                              Delivery Tips
                            </h5>
                            <div className="text-xs text-green-800 dark:text-green-200 space-y-1">
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
                        
                        <p className="text-xs text-gray-500 dark:text-gray-400">Source: {illustration.source}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  {contentType === "sermon" ? (
                    <>
                      <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>Generate a sermon outline first, then find relevant illustrations to enhance your message</p>
                    </>
                  ) : (
                    <>
                      <Play className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>Create your lesson plan first, then generate engaging activities and games for your class</p>
                    </>
                  )}
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
                {contentType === "sermon" ? "Sermon Content Enhancer" : "Lesson Content Enhancer"}
              </CardTitle>
              <Button 
                onClick={handleEnhanceSermon}
                disabled={enhanceMutation.isPending || sundaySchoolEnhanceMutation.isPending || !currentOutline || !currentResearch}
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                {(enhanceMutation.isPending || sundaySchoolEnhanceMutation.isPending) ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Star className="w-4 h-4 mr-2" />
                )}
                {contentType === "sermon" ? "Enhance Sermon" : "Enhance Lesson"}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-600" />
                    <h4 className="font-semibold text-green-900">Clarity Analysis</h4>
                    <p className="text-sm text-green-700">
                      {contentType === "sermon" ? "Reviews readability and flow" : "Reviews age-appropriate language"}
                    </p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <Target className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                    <h4 className="font-semibold text-blue-900">Engagement Optimization</h4>
                    <p className="text-sm text-blue-700">
                      {contentType === "sermon" ? "Suggests interaction points" : "Optimizes for child engagement"}
                    </p>
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
                    <p>Complete both research and outline generation to enhance your {contentType === "sermon" ? "sermon" : "lesson"}</p>
                  </div>
                ) : enhancedOutline ? (
                  <div className="space-y-6">
                    <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg border border-green-200 dark:border-green-700">
                      <h4 className="font-semibold text-green-900 dark:text-green-200 mb-2 flex items-center">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Enhanced {contentType === "sermon" ? "Sermon" : "Lesson"} Complete
                      </h4>
                      <p className="text-green-700 dark:text-green-300 text-sm">
                        Your {contentType === "sermon" ? "sermon" : "lesson"} has been enhanced with AI recommendations and is ready for {contentType === "sermon" ? "delivery" : "teaching"} or further customization.
                      </p>
                    </div>

                    {/* AI Enhancement Recommendations */}
                    {enhancementRecommendations && enhancementRecommendations.length > 0 && (
                      <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                        <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-3 flex items-center">
                          <Star className="w-5 h-5 mr-2" />
                          AI Enhancement Recommendations
                        </h4>
                        <div className="space-y-2">
                          {enhancementRecommendations.map((recommendation, index) => (
                            <div key={index} className="flex items-start space-x-2">
                              <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                              <p className="text-blue-800 dark:text-blue-200 text-sm">{recommendation}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border dark:border-gray-600 space-y-6">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">{enhancedOutline.title}</h3>
                        
                        <div className="grid md:grid-cols-2 gap-6 mb-6">
                          <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
                            <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
                              {contentType === "sermon" ? "Theme" : "Big Idea"}
                            </h4>
                            <p className="text-blue-800 dark:text-blue-300">{enhancedOutline.theme || enhancedOutline.bigIdea}</p>
                          </div>
                          
                          <div className="bg-purple-50 dark:bg-purple-900 p-4 rounded-lg">
                            <h4 className="font-semibold text-purple-900 dark:text-purple-200 mb-2">Scripture References</h4>
                            <div className="flex flex-wrap gap-2">
                              {enhancedOutline.scriptureReferences?.map((ref, idx) => (
                                <span key={idx} className="bg-purple-200 dark:bg-purple-700 text-purple-800 dark:text-purple-200 px-2 py-1 rounded text-sm">
                                  {ref}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                            <h4 className="font-semibold text-gray-900 dark:text-gray-200 mb-3">Introduction</h4>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{enhancedOutline.introduction}</p>
                          </div>

                          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                            <h4 className="font-semibold text-gray-900 dark:text-gray-200 mb-3">Main Points</h4>
                            <div className="space-y-3">
                              {enhancedOutline.mainPoints?.map((point: any, index: number) => (
                                <div key={index} className="border-l-4 border-blue-400 pl-4">
                                  <div className="font-medium text-gray-900 dark:text-gray-200">
                                    {index + 1}. {renderFormattedText(typeof point === 'string' ? point : point.point || point.details || JSON.stringify(point))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                            <h4 className="font-semibold text-gray-900 dark:text-gray-200 mb-3">Conclusion</h4>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{enhancedOutline.conclusion}</p>
                          </div>

                          <div className="bg-yellow-50 dark:bg-yellow-900 p-4 rounded-lg">
                            <h4 className="font-semibold text-yellow-900 dark:text-yellow-200 mb-3">Call to Action</h4>
                            <p className="text-yellow-800 dark:text-yellow-300 leading-relaxed">{enhancedOutline.callToAction}</p>
                          </div>

                          {enhancedOutline.closingPrayer && (
                            <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg">
                              <h4 className="font-semibold text-green-900 dark:text-green-200 mb-3">Closing Prayer</h4>
                              <p className="text-green-800 dark:text-green-300 leading-relaxed italic">{enhancedOutline.closingPrayer}</p>
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
                                  Relevance: {Math.round((illustration.relevanceScore || 0) * 100)}%
                                </span>
                              </div>
                              <p className="text-gray-700 text-sm leading-relaxed mb-3">
                                {illustration.story}
                              </p>
                              <div className="bg-blue-50 p-3 rounded mb-3">
                                <h6 className="font-medium text-blue-900 text-xs mb-1">Application:</h6>
                                <p className="text-blue-800 text-xs">{illustration.application}</p>
                              </div>
                              <div className="flex justify-between items-center text-xs text-gray-500">
                                <span>Source: {illustration.source}</span>
                                <span>Timing: {illustration.presentationTips?.timing || 'During message'}</span>
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
                              
                              {/* Progress indicator for draft */}
                              <div className="mb-3">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs text-gray-500">Progress</span>
                                  <span className="text-xs text-gray-500">
                                    {(() => {
                                      let completed = 0;
                                      if (parsedContent.research) completed++;
                                      if (parsedContent.outline) completed++;
                                      if (parsedContent.illustrations && parsedContent.illustrations.length > 0) completed++;
                                      if (parsedContent.enhancement) completed++;
                                      return `${completed}/4 steps`;
                                    })()}
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                  <div 
                                    className="bg-blue-500 h-1.5 rounded-full"
                                    style={{ 
                                      width: `${(() => {
                                        let completed = 0;
                                        if (parsedContent.research) completed++;
                                        if (parsedContent.outline) completed++;
                                        if (parsedContent.illustrations && parsedContent.illustrations.length > 0) completed++;
                                        if (parsedContent.enhancement) completed++;
                                        return (completed / 4) * 100;
                                      })()}%` 
                                    }}
                                  ></div>
                                </div>
                              </div>
                              
                              {parsedContent.outline && (
                                <p className="text-sm text-gray-700 mb-1">
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
                                  // Smart navigation - go to the most logical next step
                                  const nextStep = getNextStep();
                                  if (nextStep) {
                                    setActiveTab(nextStep.tab);
                                  } else {
                                    // If all steps are complete, go to enhance tab for final editing
                                    setActiveTab('enhance');
                                  }
                                  toast({
                                    title: "Draft Loaded",
                                    description: `Sermon draft loaded. ${nextStep ? `Next: ${nextStep.title}` : 'Continue editing your sermon.'}`
                                  });
                                }}
                                className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                              >
                                <FileText className="w-4 h-4 mr-1" />
                                Continue Editing
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
                                Completed: {sermon.publishedAt ? new Date(sermon.publishedAt).toLocaleDateString() : 'Recently'}
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
            <div className="flex justify-end items-center">
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

      {/* Enhanced Share Dialog */}
      <ShareDialog
        isOpen={shareDialogOpen}
        onClose={() => setShareDialogOpen(false)}
        title="Share Sermon"
        content={
          currentOutline || enhancedOutline 
            ? `Check out this sermon: "${(enhancedOutline || currentOutline)?.title}" 🙏 #SoapBoxApp` 
            : ""
        }
        url={window.location.href}
      />
    </div>
  );
}