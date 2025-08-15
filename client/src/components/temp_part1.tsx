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
  
  return parts.map((part: string, index: number) => {
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
    if (enhancedOutline) {
      return {
        tab: 'completed',
        title: contentType === "sermon" ? 'View Completed Sermon' : 'View Completed Lesson',
        description: contentType === "sermon" 
          ? 'Your enhanced sermon is ready - view, save, or share it'
          : 'Your enhanced lesson is ready - view, save, or share it'
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
                <div className="flex items-center gap-2">
                  {/* Back Button - only show if not on first step */}
                  {getProgressSteps().completed > 0 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700"
                      onClick={() => {
                        // Navigate to previous step based on current progress
                        if (activeTab === 'completed' && enhancedOutline) {
                          setActiveTab('enhance');
                        } else if (activeTab === 'enhance' || (contentType === "sundayschool" && activeTab === 'lesson')) {
                          if (contentType === "sundayschool") {
                            setActiveTab('lesson');
                          } else {
                            setActiveTab('illustrations');
                          }
                        } else if ((activeTab === 'lesson' && contentType === "sundayschool") || activeTab === 'illustrations') {
                          setActiveTab('outline');
                        } else if (activeTab === 'outline') {
                          setActiveTab('research');
                        }
                      }}
                    >
                      ← Back
                    </Button>
                  )}
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
                      } else if (nextStep?.tab === 'completed') {
                        // If completed step, navigate to completed tab
                        setActiveTab('completed');
                      } else {
                        setActiveTab(nextStep?.tab || 'research');
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
