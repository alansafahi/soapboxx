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
const renderFormattedText = (text: string | any) => {
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
  const [sundaySchoolActivities, setSundaySchoolActivities] = useState<any[]>([]);
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

  // Fetch teaching guidelines for Sunday School
  const { data: teachingGuidelines } = useQuery({
    queryKey: ['/api/sunday-school/teaching-guidelines'],
    queryFn: () => apiRequest('GET', '/api/sunday-school/teaching-guidelines'),
    enabled: contentType === "sunday-school",
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
    // Use correct activities array based on content type
    if (contentType === "sermon" ? illustrations.length > 0 : sundaySchoolActivities.length > 0) completed++;
    // For Sunday School, count lesson step when all prerequisites are complete
    if (contentType === "sundayschool" && currentResearch && currentOutline && sundaySchoolActivities.length > 0) completed++;
    if (enhancedOutline) completed++;
    return { completed, total: contentType === "sundayschool" ? 5 : 4 }; // Sunday School has extra "Lesson" step
  };

  const getNextStep = () => {
    if (!currentResearch) {
      return {
        tab: 'research',
        title: 'Generate Biblical Research',
        description: contentType === "sermon" 
          ? 'Start with biblical commentary and context for your sermon'
          : 'Start with biblical research and child-friendly applications'
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
    if (contentType === "sermon" ? illustrations.length === 0 : sundaySchoolActivities.length === 0) {
      return {
        tab: 'illustrations',
        title: contentType === "sermon" ? 'Add Stories & Content' : 'Add Activities & Games',
        description: contentType === "sermon" 
          ? 'Find compelling illustrations and stories for your sermon'
          : 'Create detailed activities with instructions and materials needed'
      };
    }
    if (contentType === "sundayschool" && currentResearch && currentOutline && sundaySchoolActivities.length > 0 && activeTab !== 'lesson') {
      return {
        tab: 'lesson',
        title: 'Review Complete Lesson',
        description: 'Review your complete lesson draft before enhancement'
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
      // User controls when to proceed to lesson plan - no auto-generation
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
      // User controls when to proceed to activities - no auto-generation
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
      // Store Sunday School activities in the illustrations array for unified handling
      setIllustrations(data.activities || []);
      setSundaySchoolActivities(data.activities || []);
      toast({
        title: "Activities Generated",
        description: "Sunday School activities and games created successfully.",
      });
      // Do not auto-advance to enhance for Sunday School - stay on activities tab
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
        ageGroup: ageGroup,
        scripture: scriptureText,
        research: currentResearch,
        duration: sermonLength
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
        <TabsList className={contentType === "sundayschool" ? "grid w-full grid-cols-3 sm:grid-cols-7 gap-1" : "grid w-full grid-cols-3 sm:grid-cols-6 gap-1"}>
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
          {contentType === "sundayschool" && (
            <TabsTrigger value="lesson" className="flex items-center justify-center text-xs sm:text-sm px-1 sm:px-3">
              <FileText className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
              <span className="hidden sm:inline">Lesson</span>
            </TabsTrigger>
          )}
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
          <div className={contentType === "sundayschool" ? "flex justify-between mt-2 space-x-1" : "flex justify-between mt-2"}>
            <div className={`text-xs ${currentResearch ? 'text-green-600 font-medium' : 'text-gray-400'}`}>
              ✓ Research
            </div>
            <div className={`text-xs ${currentOutline ? 'text-green-600 font-medium' : 'text-gray-400'}`}>
              ✓ {contentType === "sermon" ? "Outline" : "Plan"}
            </div>
            <div className={`text-xs ${(contentType === "sermon" ? illustrations.length > 0 : sundaySchoolActivities.length > 0) ? 'text-green-600 font-medium' : 'text-gray-400'}`}>
              ✓ {contentType === "sermon" ? "Stories" : "Activities"}
            </div>
            {contentType === "sundayschool" && (
              <div className={`text-xs ${(currentOutline && currentResearch && sundaySchoolActivities.length > 0) ? 'text-green-600 font-medium' : 'text-gray-400'}`}>
                ✓ Lesson
              </div>
            )}
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
                    } else if (nextStep?.tab === 'lesson') {
                      // If lesson review step, just navigate to lesson tab
                      setActiveTab('lesson');
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
                {(outlineMutation.isPending || sundaySchoolLessonPlanMutation.isPending) ? 
                  (contentType === "sermon" ? "Generating Outline..." : "Creating Lesson Plan...") :
                  (contentType === "sermon" ? "Generate Outline" : "Create Lesson Plan")
                }
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
              {/* Teaching Guidelines for Sunday School */}
              {contentType === "sunday-school" && teachingGuidelines && (
                <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900 dark:to-indigo-900 p-6 rounded-lg border border-blue-200 dark:border-blue-700">
                  <div className="flex items-center mb-4">
                    <GraduationCap className="w-6 h-6 mr-3 text-blue-600" />
                    <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">Teacher Resource Guide</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {/* Age-Specific Guidelines */}
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center">
                        <Baby className="w-4 h-4 mr-2 text-orange-500" />
                        {ageGroup} Age Guidelines
                      </h4>
                      {teachingGuidelines.ageSpecificGuidelines?.[ageGroup] && (
                        <div className="space-y-2 text-sm">
                          <div><strong>Attention Span:</strong> {teachingGuidelines.ageSpecificGuidelines[ageGroup].attentionSpan}</div>
                          <div><strong>Learning Style:</strong> {teachingGuidelines.ageSpecificGuidelines[ageGroup].learningStyle}</div>
                          <div><strong>Classroom Tips:</strong> {teachingGuidelines.ageSpecificGuidelines[ageGroup].classroom}</div>
                        </div>
                      )}
                    </div>

                    {/* General Guidelines */}
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center">
                        <Users className="w-4 h-4 mr-2 text-green-500" />
                        Professional Standards
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div><strong>Preparation:</strong> {teachingGuidelines.professionalStandards?.preparation}</div>
                        <div><strong>Safety:</strong> {teachingGuidelines.professionalStandards?.safetyFirst}</div>
                        <div><strong>Parent Connection:</strong> {teachingGuidelines.professionalStandards?.parentCommunication}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

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
                              {contentType === "sundayschool" && illustration.type && (
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
                        {contentType === "sundayschool" ? (
                          <div className="space-y-4">
                            {/* Setup Instructions */}
                            {illustration.setupInstructions && (
                              <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg border-l-4 border-blue-400">
                                <h5 className="font-medium text-blue-900 dark:text-blue-200 mb-2 flex items-center">
                                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
                                  </svg>
                                  Room Setup & Preparation
                                </h5>
                                <p className="text-sm text-blue-800 dark:text-blue-300 leading-relaxed">{illustration.setupInstructions}</p>
                              </div>
                            )}

                            {/* Teacher Script */}
                            {illustration.teacherScript && (
                              <div className="bg-purple-50 dark:bg-purple-900 p-4 rounded-lg border-l-4 border-purple-400">
                                <h5 className="font-medium text-purple-900 dark:text-purple-200 mb-2 flex items-center">
                                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd"/>
                                  </svg>
                                  What to Say (Teacher Script)
                                </h5>
                                <div className="bg-purple-100 dark:bg-purple-800 p-3 rounded border-l-2 border-purple-300">
                                  <p className="text-sm text-purple-800 dark:text-purple-300 italic leading-relaxed">"{illustration.teacherScript}"</p>
                                </div>
                              </div>
                            )}

                            {/* Detailed Instructions */}
                            {illustration.instructions && (
                              <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg">
                                <h5 className="font-medium text-green-900 dark:text-green-200 mb-3 flex items-center">
                                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd"/>
                                  </svg>
                                  Detailed Step-by-Step Instructions
                                </h5>
                                <div className="space-y-2">
                                  {illustration.instructions.split(/\d+\.|\n/).filter((step: string) => step.trim()).map((step: string, idx: number) => (
                                    <div key={idx} className="flex items-start bg-green-100 dark:bg-green-800 p-3 rounded">
                                      <span className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-0.5 flex-shrink-0">
                                        {idx + 1}
                                      </span>
                                      <span className="text-sm text-green-800 dark:text-green-200 leading-relaxed">{step.trim()}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Classroom Management Tips */}
                            {illustration.classroomManagement && (
                              <div className="bg-amber-50 dark:bg-amber-900 p-4 rounded-lg border-l-4 border-amber-400">
                                <h5 className="font-medium text-amber-900 dark:text-amber-200 mb-2 flex items-center">
                                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                                  </svg>
                                  Classroom Management Tips
                                </h5>
                                <p className="text-sm text-amber-800 dark:text-amber-300 leading-relaxed">{illustration.classroomManagement}</p>
                              </div>
                            )}

                            {/* Time Breakdown */}
                            {illustration.timeBreakdown && (
                              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                                <h6 className="font-medium text-gray-900 dark:text-gray-200 mb-2 flex items-center">
                                  <Clock className="w-4 h-4 mr-2" />
                                  Time Breakdown
                                </h6>
                                <p className="text-sm text-gray-700 dark:text-gray-300">{illustration.timeBreakdown}</p>
                              </div>
                            )}
                            
                            {/* Materials List */}
                            {illustration.materials && (
                              <div className="bg-indigo-50 dark:bg-indigo-900 p-4 rounded-lg">
                                <h5 className="font-medium text-indigo-900 dark:text-indigo-200 mb-3 flex items-center">
                                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                                  </svg>
                                  Complete Materials & Preparation List
                                </h5>
                                <div className="grid grid-cols-1 gap-2">
                                  {illustration.materials.map((material: any, idx: number) => (
                                    <div key={idx} className="flex items-start text-sm bg-indigo-100 dark:bg-indigo-800 p-3 rounded-lg">
                                      <span className="w-3 h-3 bg-indigo-600 rounded-full mr-3 mt-1 flex-shrink-0"></span>
                                      <span className="text-indigo-800 dark:text-indigo-200 font-medium">{material}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Safety Notes */}
                            {illustration.safetyNotes && (
                              <div className="bg-red-50 dark:bg-red-900 p-4 rounded-lg border-l-4 border-red-400">
                                <h5 className="font-medium text-red-900 dark:text-red-200 mb-2 flex items-center">
                                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                                  </svg>
                                  Safety Considerations
                                </h5>
                                <p className="text-sm text-red-800 dark:text-red-300 leading-relaxed">{illustration.safetyNotes}</p>
                              </div>
                            )}

                            {/* Potential Challenges & Adaptations */}
                            {(illustration.potentialChallenges || illustration.adaptations) && (
                              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                                <h5 className="font-medium text-slate-900 dark:text-slate-200 mb-3 flex items-center">
                                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/>
                                  </svg>
                                  Teacher Support & Adaptations
                                </h5>
                                {illustration.potentialChallenges && (
                                  <div className="mb-3">
                                    <h6 className="font-medium text-slate-800 dark:text-slate-300 mb-1">Common Challenges:</h6>
                                    <p className="text-sm text-slate-700 dark:text-slate-400 leading-relaxed">{illustration.potentialChallenges}</p>
                                  </div>
                                )}
                                {illustration.troubleshootingTips && (
                                  <div className="mb-3">
                                    <h6 className="font-medium text-slate-800 dark:text-slate-300 mb-1">Troubleshooting Tips:</h6>
                                    <p className="text-sm text-slate-700 dark:text-slate-400 leading-relaxed">{illustration.troubleshootingTips}</p>
                                  </div>
                                )}
                                {illustration.adaptations && (
                                  <div className="mb-3">
                                    <h6 className="font-medium text-slate-800 dark:text-slate-300 mb-1">Adaptations for Different Needs:</h6>
                                    <p className="text-sm text-slate-700 dark:text-slate-400 leading-relaxed">{illustration.adaptations}</p>
                                  </div>
                                )}
                                {illustration.accessibilityNotes && (
                                  <div>
                                    <h6 className="font-medium text-slate-800 dark:text-slate-300 mb-1">Accessibility Considerations:</h6>
                                    <p className="text-sm text-slate-700 dark:text-slate-400 leading-relaxed">{illustration.accessibilityNotes}</p>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Educational Objective */}
                            {illustration.educationalObjective && (
                              <div className="bg-emerald-50 dark:bg-emerald-900 p-4 rounded-lg border-l-4 border-emerald-400">
                                <h5 className="font-medium text-emerald-900 dark:text-emerald-200 mb-2 flex items-center">
                                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                  </svg>
                                  Learning Objective
                                </h5>
                                <p className="text-sm text-emerald-800 dark:text-emerald-300 leading-relaxed">{illustration.educationalObjective}</p>
                              </div>
                            )}

                            {/* Biblical Connection */}
                            {(illustration.biblicalConnection || illustration.lessonConnection) && (
                              <div className="bg-purple-50 dark:bg-purple-900 p-4 rounded-lg">
                                <h5 className="font-medium text-purple-900 dark:text-purple-200 mb-2 flex items-center">
                                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                                  </svg>
                                  Biblical Foundation
                                </h5>
                                <p className="text-sm text-purple-800 dark:text-purple-300 leading-relaxed">{illustration.biblicalConnection || illustration.lessonConnection}</p>
                              </div>
                            )}

                            {/* Assessment Methods */}
                            {illustration.assessmentMethods && (
                              <div className="bg-cyan-50 dark:bg-cyan-900 p-4 rounded-lg">
                                <h5 className="font-medium text-cyan-900 dark:text-cyan-200 mb-2 flex items-center">
                                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                                  </svg>
                                  How to Assess Learning
                                </h5>
                                <p className="text-sm text-cyan-800 dark:text-cyan-300 leading-relaxed">{illustration.assessmentMethods}</p>
                                {illustration.learningIndicators && (
                                  <div className="mt-2 bg-cyan-100 dark:bg-cyan-800 p-2 rounded">
                                    <h6 className="font-medium text-cyan-900 dark:text-cyan-200 text-xs mb-1">Success Indicators:</h6>
                                    <p className="text-xs text-cyan-800 dark:text-cyan-300">{illustration.learningIndicators}</p>
                                  </div>
                                )}
                              </div>
                            )}
                            
                            {illustration.ageAppropriate && (
                              <div className="bg-yellow-50 dark:bg-yellow-900 p-3 rounded-md">
                                <p className="text-sm font-medium text-yellow-900 dark:text-yellow-200 mb-1">Age Appropriateness:</p>
                                <p className="text-sm text-yellow-800 dark:text-yellow-300 leading-relaxed">{illustration.ageAppropriate}</p>
                              </div>
                            )}
                            
                            {illustration.application && (
                              <div className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900 dark:to-yellow-900 p-4 rounded-lg border border-orange-200 dark:border-orange-700">
                                <p className="text-sm font-semibold text-orange-900 dark:text-orange-200 mb-3 flex items-center">
                                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                                  </svg>
                                  How This Connects to Today's Lesson:
                                </p>
                                
                                <div className="space-y-3">
                                  <div className="bg-orange-100 dark:bg-orange-800 p-3 rounded-lg border-l-4 border-orange-400">
                                    <h5 className="font-medium text-orange-900 dark:text-orange-200 mb-2">Life Application for {ageGroup.replace('-', ' ')} students:</h5>
                                    <p className="text-sm text-orange-800 dark:text-orange-300 leading-relaxed italic">
                                      "{illustration.application}"
                                    </p>
                                  </div>
                                  
                                  {/* Add detailed application sections */}
                                  {illustration.practicalSteps && (
                                    <div className="bg-orange-50 dark:bg-orange-900 p-3 rounded">
                                      <h6 className="font-medium text-orange-900 dark:text-orange-200 mb-2">Action Steps Students Can Take:</h6>
                                      <ul className="space-y-1">
                                        {illustration.practicalSteps.map((step: string, stepIdx: number) => (
                                          <li key={stepIdx} className="flex items-start text-sm text-orange-800 dark:text-orange-300">
                                            <span className="bg-orange-200 dark:bg-orange-700 text-orange-800 dark:text-orange-200 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-2 mt-0.5 flex-shrink-0">
                                              {stepIdx + 1}
                                            </span>
                                            {step}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                  
                                  {illustration.discussionQuestions && (
                                    <div className="bg-yellow-50 dark:bg-yellow-900 p-3 rounded">
                                      <h6 className="font-medium text-yellow-900 dark:text-yellow-200 mb-2">Discussion Questions:</h6>
                                      <ul className="space-y-2">
                                        {illustration.discussionQuestions.map((question: string, qIdx: number) => (
                                          <li key={qIdx} className="flex items-start text-sm">
                                            <span className="bg-yellow-200 dark:bg-yellow-700 text-yellow-800 dark:text-yellow-200 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-2 mt-0.5 flex-shrink-0">
                                              Q{qIdx + 1}
                                            </span>
                                            <span className="text-yellow-800 dark:text-yellow-300">{question}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                  
                                  {illustration.memoryVerseConnection && (
                                    <div className="bg-purple-50 dark:bg-purple-900 p-3 rounded border-l-4 border-purple-400">
                                      <h6 className="font-medium text-purple-900 dark:text-purple-200 mb-1">Memory Verse Connection:</h6>
                                      <p className="text-sm text-purple-800 dark:text-purple-300 italic">{illustration.memoryVerseConnection}</p>
                                    </div>
                                  )}
                                  
                                  {/* Family Engagement */}
                                  {illustration.familyEngagement && (
                                    <div className="bg-blue-50 dark:bg-blue-900 p-3 rounded border-l-4 border-blue-400">
                                      <h6 className="font-medium text-blue-900 dark:text-blue-200 mb-1">Family Engagement:</h6>
                                      <p className="text-sm text-blue-800 dark:text-blue-300">{illustration.familyEngagement}</p>
                                    </div>
                                  )}

                                  {(illustration.takeHomeMessage || illustration.parentConnection) && (
                                    <div className="bg-green-50 dark:bg-green-900 p-3 rounded">
                                      <h6 className="font-medium text-green-900 dark:text-green-200 mb-2">Take Home Message:</h6>
                                      <p className="text-sm text-green-800 dark:text-green-300">
                                        {illustration.takeHomeMessage || illustration.parentConnection || `Students will understand how ${illustration.title || illustration.name} helps them apply today's lesson in their daily lives.`}
                                      </p>
                                    </div>
                                  )}

                                  {/* Expected Responses */}
                                  {illustration.expectedResponses && (
                                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                                      <h6 className="font-medium text-gray-900 dark:text-gray-200 mb-1">Expected Student Responses:</h6>
                                      <p className="text-sm text-gray-700 dark:text-gray-400">{illustration.expectedResponses}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                            
                            {/* Add Duration and Setup Time if available */}
                            {illustration.duration && (
                              <div className="bg-gray-50 p-3 rounded-md">
                                <div className="flex items-center justify-between text-sm">
                                  <div className="flex items-center text-gray-700">
                                    <Clock className="w-4 h-4 mr-1" />
                                    <span className="font-medium">Duration:</span>
                                    <span className="ml-1">{illustration.duration}</span>
                                  </div>
                                  {illustration.setupTime && (
                                    <div className="flex items-center text-gray-700">
                                      <span className="font-medium">Setup:</span>
                                      <span className="ml-1">{illustration.setupTime}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                            
                            {/* Add Safety Notes if available */}
                            {illustration.safetyNotes && (
                              <div className="bg-red-50 p-3 rounded-md border border-red-200">
                                <p className="text-sm font-medium text-red-900 mb-1 flex items-center">
                                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                                  </svg>
                                  Safety Considerations:
                                </p>
                                <p className="text-sm text-red-800">{illustration.safetyNotes}</p>
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

        {/* Lesson Tab - Sunday School Only */}
        {contentType === "sunday-school" && (
          <TabsContent value="lesson" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Complete Lesson Draft
                </CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Review your complete lesson plan with research, activities, and materials before AI enhancement
                </p>
              </CardHeader>
              <CardContent>
                {currentOutline && currentResearch && sundaySchoolActivities.length > 0 ? (
                  <div className="space-y-6">
                    {/* Lesson Overview */}
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900 dark:to-blue-900 p-6 rounded-lg border">
                      <h3 className="text-2xl font-bold text-purple-900 dark:text-purple-200 mb-2">{currentOutline.title}</h3>
                      <p className="text-purple-700 dark:text-purple-300 text-lg mb-4">{currentOutline.bigIdea}</p>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                        <div>
                          <span className="font-medium text-purple-800 dark:text-purple-300">Age Group:</span>
                          <span className="ml-2 text-purple-700 dark:text-purple-300 capitalize">{ageGroup.replace('-', ' ')}</span>
                        </div>
                        <div>
                          <span className="font-medium text-purple-800 dark:text-purple-300">Duration:</span>
                          <span className="ml-2 text-purple-700 dark:text-purple-300">
                            {sermonLength === "short" ? "20-30 minutes" : sermonLength === "medium" ? "35-45 minutes" : "50-60 minutes"}
                          </span>
                        </div>
                      </div>
                      
                      {/* Enhanced Learning Objectives */}
                      <div className="bg-purple-100 dark:bg-purple-800 p-4 rounded-lg border border-purple-200 dark:border-purple-600">
                        <h4 className="font-semibold text-purple-900 dark:text-purple-200 mb-2">Learning Objectives</h4>
                        <div className="text-sm text-purple-800 dark:text-purple-300 space-y-1">
                          <div className="flex items-start">
                            <span className="w-2 h-2 bg-purple-600 rounded-full mr-2 mt-2 flex-shrink-0"></span>
                            <span>Students will understand the main biblical truth from {currentOutline.scriptureReferences.join(', ')}</span>
                          </div>
                          <div className="flex items-start">
                            <span className="w-2 h-2 bg-purple-600 rounded-full mr-2 mt-2 flex-shrink-0"></span>
                            <span>Students will be able to apply this lesson to their daily lives</span>
                          </div>
                          <div className="flex items-start">
                            <span className="w-2 h-2 bg-purple-600 rounded-full mr-2 mt-2 flex-shrink-0"></span>
                            <span>Students will participate in engaging activities that reinforce the lesson</span>
                          </div>
                          {currentResearch.memoryVerse && (
                            <div className="flex items-start">
                              <span className="w-2 h-2 bg-purple-600 rounded-full mr-2 mt-2 flex-shrink-0"></span>
                              <span>Students will memorize and understand the significance of today's memory verse</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Scripture & Memory Verse */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-yellow-50 dark:bg-yellow-900 p-4 rounded-lg">
                        <h4 className="font-semibold text-yellow-900 dark:text-yellow-200 mb-2">Scripture References</h4>
                        <div className="space-y-1">
                          {currentOutline.scriptureReferences.map((ref, idx) => (
                            <Badge key={idx} variant="outline" className="mr-2 mb-1 bg-white dark:bg-yellow-800 border-yellow-300 dark:border-yellow-600 text-yellow-800 dark:text-yellow-200">
                              {ref}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      {currentResearch.memoryVerse && (
                        <div className="bg-indigo-50 dark:bg-indigo-900 p-4 rounded-lg">
                          <h4 className="font-semibold text-indigo-900 dark:text-indigo-200 mb-2">Memory Verse</h4>
                          <p className="text-indigo-800 dark:text-indigo-300 italic text-sm leading-relaxed">{currentResearch.memoryVerse}</p>
                        </div>
                      )}
                    </div>

                    {/* Lesson Structure */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border dark:border-gray-600">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 text-lg flex items-center">
                        <Clock className="w-5 h-5 mr-2 text-blue-600" />
                        Complete Lesson Structure & Timeline
                      </h4>
                      
                      {/* Pre-Lesson Preparation */}
                      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border-l-4 border-gray-400">
                        <h5 className="font-medium text-gray-900 dark:text-gray-200 mb-2">Pre-Lesson Preparation (10 minutes before class)</h5>
                        <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                          <div className="flex items-start">
                            <span className="w-2 h-2 bg-gray-500 rounded-full mr-2 mt-2 flex-shrink-0"></span>
                            <span>Set up materials and activity stations</span>
                          </div>
                          <div className="flex items-start">
                            <span className="w-2 h-2 bg-gray-500 rounded-full mr-2 mt-2 flex-shrink-0"></span>
                            <span>Review lesson flow and key points</span>
                          </div>
                          <div className="flex items-start">
                            <span className="w-2 h-2 bg-gray-500 rounded-full mr-2 mt-2 flex-shrink-0"></span>
                            <span>Prepare visual aids and handouts</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Opening Activity */}
                      {currentOutline.openingActivity && (
                        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900 rounded-lg border-l-4 border-green-400">
                          <h5 className="font-medium text-green-900 dark:text-green-200 mb-2">1. Opening Activity (5 minutes)</h5>
                          <p className="text-green-800 dark:text-green-300 text-sm">{currentOutline.openingActivity}</p>
                        </div>
                      )}

                      {/* Bible Story Method */}
                      {currentOutline.bibleStoryMethod && (
                        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg border-l-4 border-blue-400">
                          <h5 className="font-medium text-blue-900 dark:text-blue-200 mb-2">2. Bible Story Presentation (10-15 minutes)</h5>
                          <p className="text-blue-800 dark:text-blue-300 text-sm">{currentOutline.bibleStoryMethod}</p>
                        </div>
                      )}

                      {/* Main Points */}
                      <div className="mb-6 p-4 bg-purple-50 dark:bg-purple-900 rounded-lg border-l-4 border-purple-400">
                        <h5 className="font-medium text-purple-900 dark:text-purple-200 mb-3">3. Key Learning Points (10 minutes)</h5>
                        <div className="space-y-2">
                          {currentOutline.mainPoints.map((point: any, idx: number) => (
                            <div key={idx} className="flex items-start">
                              <span className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                                {idx + 1}
                              </span>
                              <div className="text-purple-800 dark:text-purple-300 text-sm leading-relaxed">
                                {renderFormattedText(typeof point === 'string' ? point : point.point || point.details || JSON.stringify(point))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Memory Verse Activity */}
                      {currentOutline.memoryVerseActivity && (
                        <div className="mb-6 p-4 bg-pink-50 dark:bg-pink-900 rounded-lg border-l-4 border-pink-400">
                          <h5 className="font-medium text-pink-900 dark:text-pink-200 mb-2">4. Memory Verse Activity (5 minutes)</h5>
                          <p className="text-pink-800 dark:text-pink-300 text-sm">{currentOutline.memoryVerseActivity}</p>
                        </div>
                      )}

                      {/* Closing Activity */}
                      {currentOutline.closingActivity && (
                        <div className="mb-6 p-4 bg-teal-50 dark:bg-teal-900 rounded-lg border-l-4 border-teal-400">
                          <h5 className="font-medium text-teal-900 dark:text-teal-200 mb-2">5. Closing & Prayer (5 minutes)</h5>
                          <p className="text-teal-800 dark:text-teal-300 text-sm">{currentOutline.closingActivity}</p>
                        </div>
                      )}
                    </div>

                    {/* Activities Summary */}
                    <div className="bg-orange-50 dark:bg-orange-900 p-6 rounded-lg border dark:border-orange-700">
                      <h4 className="font-semibold text-orange-900 dark:text-orange-200 mb-4 text-lg">Activities & Materials Summary</h4>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="font-medium text-orange-800 dark:text-orange-300 mb-2">Activities Included:</h5>
                          <ul className="space-y-1 text-sm">
                            {sundaySchoolActivities.map((activity, idx) => (
                              <li key={idx} className="flex items-center text-orange-700 dark:text-orange-300">
                                <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                                {activity.title || activity.name}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h5 className="font-medium text-orange-800 dark:text-orange-300 mb-2">Materials Needed:</h5>
                          <div className="space-y-1 text-sm text-orange-700 dark:text-orange-300">
                            {Array.from(new Set(sundaySchoolActivities.flatMap((activity: any) => activity.materials || []))).slice(0, 8).map((material: any, idx: number) => (
                              <div key={idx} className="flex items-center">
                                <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                                {material}
                              </div>
                            ))}
                            {Array.from(new Set(sundaySchoolActivities.flatMap(activity => activity.materials || []))).length > 8 && (
                              <div className="text-orange-600 dark:text-orange-400 italic">...and more</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Take Home */}
                    {currentOutline.takeHome && (
                      <div className="bg-cyan-50 dark:bg-cyan-900 p-4 rounded-lg">
                        <h4 className="font-semibold text-cyan-900 dark:text-cyan-200 mb-2">Take Home Activity</h4>
                        <p className="text-cyan-800 dark:text-cyan-300 text-sm">{currentOutline.takeHome}</p>
                      </div>
                    )}

                    {/* Ready for Enhancement Notice */}
                    <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                      <div className="flex items-center">
                        <CheckCircle className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3" />
                        <div>
                          <h4 className="font-medium text-blue-900 dark:text-blue-200">Lesson Draft Complete</h4>
                          <p className="text-blue-700 dark:text-blue-300 text-sm">
                            Your lesson is ready to teach as-is, or proceed to the Enhancement tab to improve it with AI recommendations.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">Complete All Previous Steps</h3>
                    <p className="text-gray-500">Generate research, create lesson plan, and add activities to view your complete lesson draft.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Complete Lesson Tab - Sunday School Only */}
        {contentType === "sundayschool" && (
          <TabsContent value="lesson" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Complete Sunday School Lesson Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                {currentOutline && currentResearch && sundaySchoolActivities.length > 0 ? (
                  <div className="space-y-6">
                    {/* Lesson Overview */}
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900 dark:to-pink-900 p-6 rounded-lg border border-purple-200 dark:border-purple-700">
                      <div className="text-center mb-4">
                        <h2 className="text-2xl font-bold text-purple-900 dark:text-purple-100">{currentOutline.title}</h2>
                        <p className="text-purple-700 dark:text-purple-300 mt-2">{currentOutline.bigIdea}</p>
                        <div className="flex justify-center gap-4 mt-3 text-sm">
                          <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">
                            Age: {ageGroup}
                          </Badge>
                          <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">
                            Duration: {sermonLength === 'short' ? '20-30 min' : sermonLength === 'medium' ? '35-45 min' : '50-60 min'}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Memory Verse */}
                    {currentResearch.memoryVerse && (
                      <div className="bg-yellow-50 dark:bg-yellow-900 p-4 rounded-lg border-l-4 border-yellow-400">
                        <h3 className="font-semibold text-yellow-900 dark:text-yellow-200 mb-2">Memory Verse</h3>
                        <p className="text-yellow-800 dark:text-yellow-300 italic text-lg">{currentResearch.memoryVerse}</p>
                      </div>
                    )}

                    {/* Activities Preview */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border dark:border-gray-600">
                      <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <Play className="w-5 h-5 mr-2 text-orange-600" />
                        Story-Specific Activities Ready
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {sundaySchoolActivities.slice(0, 4).map((activity, idx) => (
                          <div key={idx} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-gray-900 dark:text-gray-100">{activity.name}</h4>
                              <Badge variant="outline" className="text-xs">
                                {activity.duration || '8-12 min'}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{activity.type}</p>
                            {activity.materials && (
                              <div className="text-xs text-blue-600 dark:text-blue-400">
                                Materials: {Array.isArray(activity.materials) ? activity.materials.slice(0, 2).join(', ') : activity.materials}
                                {Array.isArray(activity.materials) && activity.materials.length > 2 && '...'}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      {sundaySchoolActivities.length > 4 && (
                        <div className="mt-4 text-center">
                          <Badge variant="outline" className="text-sm">
                            +{sundaySchoolActivities.length - 4} more activities available
                          </Badge>
                        </div>
                      )}
                    </div>

                    {/* Key Learning Points */}
                    <div className="bg-indigo-50 dark:bg-indigo-900 p-4 rounded-lg">
                      <h3 className="font-semibold text-indigo-900 dark:text-indigo-200 mb-3">Key Learning Objectives</h3>
                      <div className="space-y-2">
                        {currentOutline.mainPoints.map((point, idx) => (
                          <div key={idx} className="flex items-start">
                            <span className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5 flex-shrink-0">
                              {idx + 1}
                            </span>
                            <span className="text-indigo-800 dark:text-indigo-300 text-sm leading-relaxed">
                              {typeof point === 'string' ? point : point.point || point.details || JSON.stringify(point)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Ready to Enhance */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900 dark:to-emerald-900 p-4 rounded-lg border border-green-200 dark:border-green-700">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-green-900 dark:text-green-200">Lesson Complete!</h3>
                          <p className="text-green-700 dark:text-green-300 text-sm mt-1">
                            Your lesson plan is ready to teach. Click "Enhance" to add AI-powered improvements.
                          </p>
                        </div>
                        <Button
                          onClick={() => setActiveTab('enhance')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Star className="w-4 h-4 mr-2" />
                          Enhance Lesson
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                      Complete Your Lesson Foundation
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      Generate research, create your lesson plan, and add activities to see the complete lesson here.
                    </p>
                    <div className="space-y-2 text-sm text-gray-500">
                      <div className={`flex items-center justify-center ${currentResearch ? 'text-green-600' : ''}`}>
                        {currentResearch ? <CheckCircle className="w-4 h-4 mr-2" /> : <div className="w-4 h-4 mr-2 border border-gray-300 rounded-full"></div>}
                        Biblical Research Complete
                      </div>
                      <div className={`flex items-center justify-center ${currentOutline ? 'text-green-600' : ''}`}>
                        {currentOutline ? <CheckCircle className="w-4 h-4 mr-2" /> : <div className="w-4 h-4 mr-2 border border-gray-300 rounded-full"></div>}
                        Lesson Plan Created
                      </div>
                      <div className={`flex items-center justify-center ${sundaySchoolActivities.length > 0 ? 'text-green-600' : ''}`}>
                        {sundaySchoolActivities.length > 0 ? <CheckCircle className="w-4 h-4 mr-2" /> : <div className="w-4 h-4 mr-2 border border-gray-300 rounded-full"></div>}
                        Activities Generated
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}

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
{enhancedOutline ? 
                  (contentType === "sermon" ? "Sermon Enhanced With AI" : "Lesson Enhanced With AI") :
                  (contentType === "sermon" ? "Enhance Sermon" : "Enhance Lesson")
                }
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
                ) : (
                  <div className="space-y-4">
                    {/* Show Standard Lesson Plan First */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border dark:border-gray-600">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                        Standard {contentType === "sermon" ? "Sermon" : "Lesson"} Plan
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Your {contentType === "sermon" ? "sermon" : "lesson"} is ready to use as-is, or click "Enhance {contentType === "sermon" ? "Sermon" : "Lesson"}" above to see how AI can improve it further.
                      </p>
                      
                      <div className="space-y-4">
                        <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
                          <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
                            {contentType === "sermon" ? "Theme" : "Big Idea"}
                          </h4>
                          <p className="text-blue-800 dark:text-blue-300">{currentOutline.theme || currentOutline.bigIdea}</p>
                        </div>
                        
                        <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg">
                          <h4 className="font-semibold text-green-900 dark:text-green-200 mb-3">Main Points</h4>
                          <div className="space-y-2">
                            {currentOutline.mainPoints?.map((point: any, index: number) => (
                              <div key={index} className="border-l-4 border-green-400 pl-4">
                                <div className="font-medium text-green-900 dark:text-green-200">
                                  {index + 1}. {renderFormattedText(typeof point === 'string' ? point : point.point || point.details || JSON.stringify(point))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {currentOutline.conclusion && (
                          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                            <h4 className="font-semibold text-gray-900 dark:text-gray-200 mb-2">Conclusion</h4>
                            <p className="text-gray-700 dark:text-gray-300">{currentOutline.conclusion}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                {enhancedOutline && (
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
                )}
                
                {!enhancedOutline && (
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
                                  if (parsedContent.sundaySchoolActivities) setSundaySchoolActivities(parsedContent.sundaySchoolActivities);
                                  if (parsedContent.enhancement) {
                                    setEnhancedOutline(parsedContent.enhancement.enhancedOutline);
                                    setEnhancementRecommendations(parsedContent.enhancement.recommendations || []);
                                  }
                                  setSermonTopic(sermon.title || "");
                                  // Navigate to the appropriate view tab based on content type
                                  if (contentType === "sunday-school") {
                                    setActiveTab('lesson');
                                  } else {
                                    setActiveTab('outline');
                                  }
                                  toast({
                                    title: contentType === "sunday-school" ? "Lesson Loaded" : "Sermon Loaded",
                                    description: `Completed ${contentType === "sunday-school" ? "lesson" : "sermon"} has been loaded for viewing.`
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
                                    setSermonTopic(sermon.title || "");
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
                                    setSermonTopic(sermon.title || "");
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