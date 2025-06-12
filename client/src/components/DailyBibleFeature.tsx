import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import SmartScriptureTextarea from "./SmartScriptureTextarea";
import { 
  BookOpen, 
  Play, 
  Pause, 
  Volume2, 
  Share2, 
  Heart, 
  Flame, 
  Heart as HandHeart, 
  Award,
  Calendar,
  Target,
  Users,
  MessageCircle,
  Clock,
  CheckCircle,
  Star,
  Bookmark,
  PenTool,
  Brain,
  Rocket,
  Bell,
  Square,
  Mail,
  Copy,
  Link,
  Smartphone
} from "lucide-react";
import { 
  FaFacebook, 
  FaTwitter, 
  FaInstagram, 
  FaLinkedin, 
  FaWhatsapp, 
  FaTelegram, 
  FaReddit, 
  FaPinterest 
} from "react-icons/fa";
import { BibleInADayFeature } from "./BibleInADayFeature";
import DevotionalPacks from "./DevotionalPacks";
import VerseArtGenerator from "./VerseArtGenerator";
import { NotificationScheduler } from "./NotificationScheduler";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Slider } from "@/components/ui/slider";

interface DailyVerse {
  id: number;
  date: Date;
  verseReference: string;
  verseText: string;
  verseTextNiv?: string;
  verseTextKjv?: string;
  verseTextEsv?: string;
  verseTextNlt?: string;
  theme?: string;
  reflectionPrompt?: string;
  guidedPrayer?: string;
  backgroundImageUrl?: string;
  audioUrl?: string;
}

interface UserBibleStreak {
  id: number;
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastReadDate?: Date;
  totalDaysRead: number;
  versesMemorized: number;
  graceDaysUsed: number;
}

interface BibleBadge {
  id: number;
  name: string;
  description: string;
  iconUrl?: string;
  earnedAt: Date;
  badge: {
    id: number;
    name: string;
    description: string;
    iconUrl?: string;
    requirement: any;
  };
}

export function DailyBibleFeature() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [selectedVersion, setSelectedVersion] = useState<string>("niv");
  const [reflection, setReflection] = useState("");
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioVolume, setAudioVolume] = useState(1);
  const [showMeditativeMode, setShowMeditativeMode] = useState(false);
  const [emotionalReaction, setEmotionalReaction] = useState<string>("");
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [shareText, setShareText] = useState("");
  const [hasReadToday, setHasReadToday] = useState(false);
  const [showJournalNote, setShowJournalNote] = useState(false);
  const [journalNote, setJournalNote] = useState("");
  const [showETHOSDialog, setShowETHOSDialog] = useState(false);
  const [ethosResponse, setEthosResponse] = useState<string>('');
  const [showEthosResponse, setShowEthosResponse] = useState(false);
  const [customQuestion, setCustomQuestion] = useState('');
  const [savedInsights, setSavedInsights] = useState<string[]>([]);
  const [communityStats, setCommunityStats] = useState({ todayReads: 0, weekReads: 0 });
  const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null);
  const [aiReflectionData, setAiReflectionData] = useState<any>(null);
  const [showAiReflection, setShowAiReflection] = useState(false);
  const [userContext, setUserContext] = useState("");
  const [showNotificationScheduler, setShowNotificationScheduler] = useState(false);
  const [currentJourneyType, setCurrentJourneyType] = useState("reading");
  const [showJourneySelector, setShowJourneySelector] = useState(false);
  const [availableJourneys] = useState([
    { type: "reading", name: "Scripture Reading", description: "Daily verses with reflection questions", icon: "📖" },
    { type: "audio", name: "Audio Journey", description: "Listen to narrated Bible passages", icon: "🎧" },
    { type: "meditation", name: "Meditative Study", description: "Guided meditation on God's Word", icon: "🧘" },
    { type: "study", name: "Deep Study", description: "In-depth Bible study with commentary", icon: "📚" }
  ]);

  // Fetch daily verse based on current journey type
  const { data: dailyVerse, isLoading: verseLoading, error: verseError, refetch: refetchVerse } = useQuery<DailyVerse>({
    queryKey: ["/api/bible/daily-verse", currentJourneyType],
    queryFn: () => fetch(`/api/bible/daily-verse?journeyType=${currentJourneyType}`).then(res => res.json()),
    enabled: isAuthenticated,
  });

  // Fetch user streak
  const { data: streak, isLoading: streakLoading, error: streakError } = useQuery<UserBibleStreak>({
    queryKey: ["/api/bible/streak"],
    enabled: isAuthenticated,
  });

  // Fetch user badges
  const { data: badges, error: badgesError } = useQuery<BibleBadge[]>({
    queryKey: ["/api/bible/badges"],
    enabled: isAuthenticated,
  });

  // Fetch community statistics
  const { data: communityStatsData } = useQuery<{todayReads: number, weekReads: number}>({
    queryKey: ["/api/bible/community-stats"],
  });

  // Record bible reading mutation
  const recordReadingMutation = useMutation({
    mutationFn: async (data: {
      dailyVerseId: number;
      reflectionText?: string;
      emotionalReaction?: string;
      audioListened?: boolean;
    }) => {
      return await apiRequest("POST", "/api/bible/reading", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bible/streak"] });
      queryClient.invalidateQueries({ queryKey: ["/api/bible/badges"] });
      setHasReadToday(true);
      toast({
        title: "Reading Recorded",
        description: "Your daily Bible reading has been recorded! Keep up the great work.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to record reading. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Share verse mutation
  const shareVerseMutation = useMutation({
    mutationFn: async (data: {
      dailyVerseId: number;
      platform: string;
      shareText: string;
    }) => {
      return await apiRequest("POST", "/api/bible/share", data);
    },
    onSuccess: (data, variables) => {
      setShowShareDialog(false);
      toast({
        title: "Verse Shared Successfully",
        description: variables.platform === "soapbox" 
          ? "Your verse has been shared to the SoapBox community!" 
          : "Your verse has been prepared for external sharing!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to share verse. Please try again.",
        variant: "destructive",
      });
    },
  });

  // AI-powered reflection mutation
  const aiReflectionMutation = useMutation({
    mutationFn: async (data: {
      verseText: string;
      verseReference: string;
      userContext?: string;
      emotionalState?: string;
    }) => {
      return await apiRequest("/api/bible/ai-reflection", {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: (data) => {
      setAiReflectionData(data);
      setShowAiReflection(true);
      toast({
        title: "AI Reflection Generated",
        description: "Personalized reflection questions are ready for you.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate AI reflection. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getVerseText = () => {
    if (!dailyVerse) return "";
    switch (selectedVersion) {
      case "kjv":
        return dailyVerse.verseTextKjv || dailyVerse.verseText;
      case "esv":
        return dailyVerse.verseTextEsv || dailyVerse.verseText;
      case "nlt":
        return dailyVerse.verseTextNlt || dailyVerse.verseText;
      default:
        return dailyVerse.verseTextNiv || dailyVerse.verseText;
    }
  };



  // Audio playback functions
  const initializeAudio = () => {
    if (dailyVerse?.audioUrl && !audioRef) {
      const audio = new Audio(dailyVerse.audioUrl);
      audio.addEventListener('loadedmetadata', () => {
        setAudioDuration(audio.duration);
      });
      audio.addEventListener('timeupdate', () => {
        setAudioCurrentTime(audio.currentTime);
      });
      audio.addEventListener('ended', () => {
        setIsAudioPlaying(false);
        setAudioCurrentTime(0);
      });
      audio.volume = audioVolume;
      setAudioRef(audio);
    }
  };

  const toggleAudioPlayback = () => {
    if (!audioRef) {
      initializeAudio();
      return;
    }

    if (isAudioPlaying) {
      audioRef.pause();
      setIsAudioPlaying(false);
    } else {
      audioRef.play();
      setIsAudioPlaying(true);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setAudioVolume(newVolume);
    if (audioRef) {
      audioRef.volume = newVolume;
    }
  };

  const handleSeek = (newTime: number) => {
    if (audioRef) {
      audioRef.currentTime = newTime;
      setAudioCurrentTime(newTime);
    }
  };

  // Text-to-speech for verses without audio URLs
  const speakVerse = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(`${dailyVerse?.verseReference}. ${getVerseText()}`);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
      setIsAudioPlaying(true);
      utterance.onend = () => setIsAudioPlaying(false);
    }
  };

  useEffect(() => {
    initializeAudio();
    return () => {
      if (audioRef) {
        audioRef.pause();
        audioRef.removeEventListener('loadedmetadata', () => {});
        audioRef.removeEventListener('timeupdate', () => {});
        audioRef.removeEventListener('ended', () => {});
      }
    };
  }, [dailyVerse?.audioUrl]);

  const handleShare = (platform: string) => {
    if (!dailyVerse) return;
    
    const defaultShareText = `${dailyVerse.verseReference} 🙏 #SoapBoxApp`;
    const finalShareText = shareText || defaultShareText;
    const shareUrl = window.location.origin + '/bible';
    
    // Handle external sharing platforms directly
    if (platform !== 'soapbox') {
      let url = '';
      switch (platform) {
        case 'twitter':
          url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(finalShareText)}&url=${encodeURIComponent(shareUrl)}`;
          break;
        case 'facebook':
          url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
          navigator.clipboard.writeText(finalShareText).then(() => {
            toast({ 
              title: "Text copied to clipboard", 
              description: "Paste the copied text into your Facebook post" 
            });
          });
          break;
        case 'instagram':
          // Instagram doesn't support direct URL sharing, copy text for manual posting
          navigator.clipboard.writeText(finalShareText).then(() => {
            toast({ 
              title: "Text copied to clipboard", 
              description: "Open Instagram and paste the text into your story or post" 
            });
          });
          break;
        case 'linkedin':
          url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent('Daily Bible Verse')}&summary=${encodeURIComponent(finalShareText)}`;
          break;
        case 'whatsapp':
          url = `https://wa.me/?text=${encodeURIComponent(finalShareText + ' ' + shareUrl)}`;
          break;
        case 'telegram':
          url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(finalShareText)}`;
          break;
        case 'reddit':
          url = `https://reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(finalShareText)}`;
          break;
        case 'pinterest':
          url = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(shareUrl)}&description=${encodeURIComponent(finalShareText)}`;
          break;
        case 'email':
          const subject = encodeURIComponent('Daily Bible Verse - ' + dailyVerse.verseReference);
          const body = encodeURIComponent(`${finalShareText}\n\nRead more daily verses at: ${shareUrl}`);
          url = `mailto:?subject=${subject}&body=${body}`;
          break;
        case 'sms':
          const smsText = encodeURIComponent(finalShareText + ' ' + shareUrl);
          url = `sms:?body=${smsText}`;
          break;
        case 'copy':
          navigator.clipboard.writeText(finalShareText + ' ' + shareUrl).then(() => {
            toast({ 
              title: "Link copied to clipboard", 
              description: "You can now paste it anywhere you'd like to share" 
            });
          });
          setShowShareDialog(false);
          return;
      }
      
      if (url) {
        if (platform === 'email' || platform === 'sms') {
          window.location.href = url;
        } else {
          window.open(url, '_blank', 'width=600,height=400,scrollbars=yes,resizable=yes');
        }
      }
      
      setShowShareDialog(false);
      toast({
        title: "Verse Shared",
        description: `Your verse is ready to share${platform !== 'instagram' && platform !== 'copy' ? ' on ' + platform.charAt(0).toUpperCase() + platform.slice(1) : ''}`,
      });
      return;
    }
    
    setShareText(finalShareText);
    
    // If this is the default verse (id: 0), handle sharing differently
    if (dailyVerse.id === 0) {
      setShowShareDialog(false);
      toast({
        title: "Verse Shared",
        description: platform === "soapbox" 
          ? "Your verse has been shared to the SoapBox community!" 
          : "Your verse text has been prepared for external sharing!",
      });
      return;
    }
    
    shareVerseMutation.mutate({
      dailyVerseId: dailyVerse.id,
      platform,
      shareText: finalShareText,
    });
  };

  const handleMarkAsRead = async () => {
    if (!dailyVerse || hasReadToday) return;
    
    recordReadingMutation.mutate({
      dailyVerseId: dailyVerse.id,
      reflectionText: reflection,
      emotionalReaction: emotionalReaction,
      audioListened: isAudioPlaying,
    });
  };

  const handleEmotionalReaction = (reaction: string) => {
    setEmotionalReaction(reaction);
  };

  const handleSaveToFavorites = () => {
    if (!dailyVerse) return;
    toast({
      title: "Saved to Favorites",
      description: "This verse has been added to your favorites collection.",
    });
  };

  const handleAskETHOS = () => {
    setShowETHOSDialog(true);
  };

  const handleETHOSQuestion = (question: string) => {
    // Close the dialog first
    setShowETHOSDialog(false);
    
    // Generate AI response based on the question and current verse
    const verseText = getVerseText();
    const verseRef = dailyVerse?.verseReference;
    
    let response = "";
    
    if (question.includes("historical context")) {
      response = `The historical context of ${verseRef}: This verse was written during a time when Jesus used parables to teach spiritual truths to diverse audiences. The parable of the sower illustrates how different hearts receive God's word differently, reflecting the varied spiritual conditions Jesus encountered in first-century Palestine.`;
    } else if (question.includes("apply this verse")) {
      response = `Applying ${verseRef} to daily life: Consider what type of soil your heart represents today. Are you receptive to God's word like good soil, or are there distractions (thorns) or hardness (rocky ground) preventing spiritual growth? Make space for God's word to take root through prayer, meditation, and removing barriers to spiritual growth.`;
    } else if (question.includes("other verses")) {
      response = `Related verses to ${verseRef}: See Mark 4:3-20 (parallel account), Luke 8:4-15 (another parallel), Isaiah 55:10-11 (God's word accomplishing its purpose), and 1 Peter 1:23 (being born again through God's word). These passages explore similar themes of God's word taking root and bearing fruit.`;
    } else {
      // Handle custom questions
      response = `Thank you for your question "${question}" about ${verseRef}. This verse teaches us about the importance of having a receptive heart to God's word. Consider how you can apply this spiritual truth to your specific question and cultivate good spiritual soil in your life through prayer, study, and removing distractions that might hinder spiritual growth.`;
    }
    
    // Show response in dedicated panel
    setEthosResponse(response);
    setShowEthosResponse(true);
    
    // Also show a brief toast notification
    toast({
      title: "ETHOS Response Ready",
      description: "Scroll down to see the detailed spiritual insight.",
      duration: 3000,
    });
  };

  const handleSaveInsight = () => {
    if (ethosResponse && !savedInsights.includes(ethosResponse)) {
      setSavedInsights([...savedInsights, ethosResponse]);
      toast({
        title: "Insight Saved",
        description: "This spiritual insight has been saved to your collection.",
        duration: 2000,
      });
    }
  };

  const handleCustomQuestion = () => {
    if (customQuestion.trim()) {
      handleETHOSQuestion(customQuestion);
      setCustomQuestion('');
    }
  };

  const handleGenerateAiReflection = () => {
    if (!dailyVerse) return;
    
    aiReflectionMutation.mutate({
      verseText: getVerseText(),
      verseReference: dailyVerse.verseReference,
      userContext: userContext || "General spiritual growth",
      emotionalState: emotionalReaction || "seeking guidance"
    });
  };

  const handleJourneySwitch = async (journeyType: string) => {
    try {
      // Call API to switch journey
      const response = await fetch('/api/bible/switch-journey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ journeyType })
      });
      
      if (response.ok) {
        setCurrentJourneyType(journeyType);
        setShowJourneySelector(false);
        
        // Refetch verse with new journey type
        refetchVerse();
        
        toast({
          title: "Journey Changed",
          description: `Switched to ${availableJourneys.find(j => j.type === journeyType)?.name}`,
        });
      } else {
        throw new Error('Failed to switch journey');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to switch journey. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getJourneyContent = () => {
    switch (currentJourneyType) {
      case "audio":
        return {
          title: "Today's Audio Journey",
          description: "Listen to God's Word with guided narration",
          actionText: "Play Audio",
          icon: "🎧"
        };
      case "meditation":
        return {
          title: "Meditative Study",
          description: "Quiet reflection on Scripture",
          actionText: "Begin Meditation",
          icon: "🧘"
        };
      case "study":
        return {
          title: "Deep Bible Study",
          description: "Explore Scripture with commentary",
          actionText: "Start Study",
          icon: "📚"
        };
      default:
        return {
          title: "Daily Bible Reading",
          description: "Today's verse for reflection",
          actionText: "Read & Reflect",
          icon: "📖"
        };
    }
  };

  const handleSaveJournalNote = () => {
    if (journalNote.trim()) {
      toast({
        title: "Journal Note Saved",
        description: "Your reflection has been saved to your journal.",
      });
      setJournalNote("");
      setShowJournalNote(false);
    }
  };

  const getStreakMessage = () => {
    if (!streak) return "Start your journey today";
    if (streak.currentStreak === 0) return "Ready to begin your streak";
    if (streak.currentStreak === 1) return "Great start! Keep it going";
    if (streak.currentStreak < 7) return `${streak.currentStreak} days strong!`;
    if (streak.currentStreak < 30) return `Amazing ${streak.currentStreak}-day streak!`;
    return `Incredible ${streak.currentStreak}-day journey!`;
  };

  const MeditativeMode = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gradient-to-b from-blue-900 to-purple-900 z-50 flex items-center justify-center p-6"
    >
      <div className="max-w-2xl text-center text-white">
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="mb-8"
        >
          <h2 className="text-2xl font-light mb-4">Breathe and Reflect</h2>
          <p className="text-lg opacity-90">Inhale: "The Lord is..."</p>
          <p className="text-lg opacity-90">Exhale: "My Shepherd"</p>
        </motion.div>
        
        <motion.div
          className="mb-8 p-6 bg-white/10 rounded-lg backdrop-blur-sm"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-xl font-light leading-relaxed">
            {getVerseText()}
          </p>
          <p className="text-sm opacity-75 mt-4">— {dailyVerse?.verseReference}</p>
        </motion.div>

        <Button
          onClick={() => setShowMeditativeMode(false)}
          variant="outline"
          className="bg-white/20 border-white/30 text-white hover:bg-white/30"
        >
          End Meditation
        </Button>
      </div>
    </motion.div>
  );

  // Handle authentication loading
  if (authLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <div className="text-red-600 mb-4">
              <BookOpen className="h-12 w-12 mx-auto mb-2" />
              <h2 className="text-lg font-semibold">Authentication Required</h2>
            </div>
            <p className="text-red-700 mb-4">
              Please log in to access your Daily Bible reading experience.
            </p>
            <Button onClick={() => window.location.href = '/api/login'} className="bg-red-600 hover:bg-red-700">
              Log In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Handle API errors
  if (verseError || streakError || badgesError) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <div className="text-red-600 mb-4">
              <BookOpen className="h-12 w-12 mx-auto mb-2" />
              <h2 className="text-lg font-semibold">Unable to Load Daily Bible</h2>
            </div>
            <p className="text-red-700 mb-4">
              There was an error connecting to the Bible service. Please try refreshing the page.
            </p>
            <Button onClick={() => window.location.reload()} variant="outline" className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white">
              Refresh Page
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (verseLoading || streakLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <AnimatePresence>
        {showMeditativeMode && <MeditativeMode />}
      </AnimatePresence>

      {/* Header with Journey Selection */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="flex items-center justify-center gap-3 mb-2">
          <span className="text-3xl">{getJourneyContent().icon}</span>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{getJourneyContent().title}</h1>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowJourneySelector(true)}
            className="ml-2"
          >
            Switch Journey
          </Button>
        </div>
        <p className="text-gray-600 dark:text-gray-300 mb-2">{getJourneyContent().description}</p>
        <p className="text-gray-600">{format(new Date(), "EEEE, MMMM d, yyyy")}</p>
        
        {streak && (
          <div className="mt-4 flex items-center justify-center space-x-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{streak.currentStreak}</div>
              <div className="text-sm text-gray-500">Current Streak</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{streak.longestStreak}</div>
              <div className="text-sm text-gray-500">Best Streak</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{streak.totalDaysRead}</div>
              <div className="text-sm text-gray-500">Total Days</div>
            </div>
          </div>
        )}
        
        <p className="text-lg text-blue-600 font-medium mt-2">{getStreakMessage()}</p>
      </motion.div>

      {/* Daily Verse Card */}
      {dailyVerse && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50 border-0 shadow-xl">
            {dailyVerse.backgroundImageUrl && (
              <div
                className="absolute inset-0 bg-cover bg-center opacity-20"
                style={{ backgroundImage: `url(${dailyVerse.backgroundImageUrl})` }}
              />
            )}
            
            <CardHeader className="relative">
              <div className="flex items-center justify-between">
                <div>
                  {dailyVerse.theme && (
                    <Badge variant="secondary" className="mb-2">
                      {dailyVerse.theme}
                    </Badge>
                  )}
                  <CardTitle className="text-xl text-gray-800">
                    {dailyVerse.verseReference}
                  </CardTitle>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Select value={selectedVersion} onValueChange={setSelectedVersion}>
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="niv">NIV</SelectItem>
                      <SelectItem value="kjv">KJV</SelectItem>
                      <SelectItem value="esv">ESV</SelectItem>
                      <SelectItem value="nlt">NLT</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <div className="flex items-center space-x-2">
                    {dailyVerse.audioUrl ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={toggleAudioPlayback}
                        className="bg-white/80"
                      >
                        {isAudioPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={speakVerse}
                        className="bg-white/80"
                        disabled={isAudioPlaying}
                      >
                        <Volume2 className="h-4 w-4" />
                      </Button>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowNotificationScheduler(true)}
                      className="bg-white/80"
                    >
                      <Bell className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="relative space-y-6">
              <div className="text-lg leading-relaxed text-gray-800 font-medium">
                "{getVerseText()}"
              </div>

              {/* Enhanced Audio Controls */}
              {(dailyVerse.audioUrl || isAudioPlaying) && (
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Audio Playback</span>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={dailyVerse.audioUrl ? toggleAudioPlayback : speakVerse}
                        disabled={!dailyVerse.audioUrl && isAudioPlaying}
                      >
                        {isAudioPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                      {dailyVerse.audioUrl && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.speechSynthesis.cancel()}
                        >
                          <Square className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {dailyVerse.audioUrl && audioDuration > 0 && (
                    <div className="space-y-2">
                      <Slider
                        value={[audioCurrentTime]}
                        max={audioDuration}
                        step={1}
                        onValueChange={(value) => handleSeek(value[0])}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{Math.floor(audioCurrentTime / 60)}:{(audioCurrentTime % 60).toFixed(0).padStart(2, '0')}</span>
                        <span>{Math.floor(audioDuration / 60)}:{(audioDuration % 60).toFixed(0).padStart(2, '0')}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Volume2 className="h-4 w-4 text-gray-500" />
                        <Slider
                          value={[audioVolume]}
                          max={1}
                          step={0.1}
                          onValueChange={(value) => handleVolumeChange(value[0])}
                          className="w-24"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Micro-Actions Under Verse */}
              <div className="flex items-center justify-center space-x-3 py-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSaveToFavorites()}
                  className="text-xs px-3 py-1 hover:bg-blue-50"
                >
                  <Bookmark className="h-3 w-3 mr-1" />
                  Save to Favorites
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowJournalNote(true)}
                  className="text-xs px-3 py-1 hover:bg-green-50"
                >
                  <PenTool className="h-3 w-3 mr-1" />
                  Add Journal Note
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAskETHOS()}
                  className="text-xs px-3 py-1 hover:bg-purple-50"
                >
                  <Brain className="h-3 w-3 mr-1" />
                  Ask ETHOS
                </Button>
              </div>
              
              {/* Mark as Read Button */}
              {!hasReadToday && (
                <div className="flex justify-center">
                  <Button
                    onClick={handleMarkAsRead}
                    disabled={recordReadingMutation.isPending}
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg font-semibold rounded-lg shadow-lg"
                  >
                    {recordReadingMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Recording...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Mark as Read Today
                      </>
                    )}
                  </Button>
                </div>
              )}

              {hasReadToday && (
                <div className="flex justify-center">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
                    <p className="text-green-800 font-medium">You've read today's verse!</p>
                    <p className="text-green-600 text-sm">Great job staying consistent with your daily reading.</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowMeditativeMode(true)}
                  className="bg-white/80"
                >
                  <HandHeart className="h-4 w-4 mr-2" />
                  Pause & Reflect
                </Button>
                
                <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="bg-white/80">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Share This Verse</DialogTitle>
                      <DialogDescription>
                        Share "{dailyVerse?.verseReference}" with your community
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6">
                      <Textarea
                        value={shareText}
                        onChange={(e) => setShareText(e.target.value)}
                        placeholder="Add your thoughts..."
                        className="min-h-20"
                      />
                      
                      {/* SoapBox Community */}
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium text-gray-900">Share to Community</h4>
                        <Button onClick={() => handleShare("soapbox")} className="w-full">
                          <Users className="h-4 w-4 mr-2" />
                          Share to SoapBox Community
                        </Button>
                      </div>

                      {/* Social Media Platforms */}
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium text-gray-900">Share to Social Media</h4>
                        <div className="grid grid-cols-4 gap-3">
                          <Button
                            onClick={() => handleShare('facebook')}
                            variant="outline"
                            size="sm"
                            className="flex flex-col items-center space-y-1 h-auto p-3"
                          >
                            <FaFacebook className="w-5 h-5 text-blue-600" />
                            <span className="text-xs">Facebook</span>
                          </Button>
                          
                          <Button
                            onClick={() => handleShare('twitter')}
                            variant="outline"
                            size="sm"
                            className="flex flex-col items-center space-y-1 h-auto p-3"
                          >
                            <FaTwitter className="w-5 h-5 text-blue-400" />
                            <span className="text-xs">Twitter</span>
                          </Button>
                          
                          <Button
                            onClick={() => handleShare('instagram')}
                            variant="outline"
                            size="sm"
                            className="flex flex-col items-center space-y-1 h-auto p-3"
                          >
                            <FaInstagram className="w-5 h-5 text-pink-500" />
                            <span className="text-xs">Instagram</span>
                          </Button>
                          
                          <Button
                            onClick={() => handleShare('linkedin')}
                            variant="outline"
                            size="sm"
                            className="flex flex-col items-center space-y-1 h-auto p-3"
                          >
                            <FaLinkedin className="w-5 h-5 text-blue-700" />
                            <span className="text-xs">LinkedIn</span>
                          </Button>
                          
                          <Button
                            onClick={() => handleShare('whatsapp')}
                            variant="outline"
                            size="sm"
                            className="flex flex-col items-center space-y-1 h-auto p-3"
                          >
                            <FaWhatsapp className="w-5 h-5 text-green-500" />
                            <span className="text-xs">WhatsApp</span>
                          </Button>
                          
                          <Button
                            onClick={() => handleShare('telegram')}
                            variant="outline"
                            size="sm"
                            className="flex flex-col items-center space-y-1 h-auto p-3"
                          >
                            <FaTelegram className="w-5 h-5 text-blue-500" />
                            <span className="text-xs">Telegram</span>
                          </Button>
                          
                          <Button
                            onClick={() => handleShare('reddit')}
                            variant="outline"
                            size="sm"
                            className="flex flex-col items-center space-y-1 h-auto p-3"
                          >
                            <FaReddit className="w-5 h-5 text-orange-500" />
                            <span className="text-xs">Reddit</span>
                          </Button>
                          
                          <Button
                            onClick={() => handleShare('pinterest')}
                            variant="outline"
                            size="sm"
                            className="flex flex-col items-center space-y-1 h-auto p-3"
                          >
                            <FaPinterest className="w-5 h-5 text-red-600" />
                            <span className="text-xs">Pinterest</span>
                          </Button>
                        </div>
                      </div>

                      {/* Direct Communication */}
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium text-gray-900">Direct Sharing</h4>
                        <div className="grid grid-cols-3 gap-3">
                          <Button
                            onClick={() => handleShare('email')}
                            variant="outline"
                            size="sm"
                            className="flex flex-col items-center space-y-1 h-auto p-3"
                          >
                            <Mail className="w-5 h-5 text-gray-600" />
                            <span className="text-xs">Email</span>
                          </Button>
                          
                          <Button
                            onClick={() => handleShare('sms')}
                            variant="outline"
                            size="sm"
                            className="flex flex-col items-center space-y-1 h-auto p-3"
                          >
                            <Smartphone className="w-5 h-5 text-green-600" />
                            <span className="text-xs">SMS</span>
                          </Button>
                          
                          <Button
                            onClick={() => handleShare('copy')}
                            variant="outline"
                            size="sm"
                            className="flex flex-col items-center space-y-1 h-auto p-3"
                          >
                            <Copy className="w-5 h-5 text-gray-600" />
                            <span className="text-xs">Copy Link</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Emotional Reactions */}
              <div className="flex items-center justify-center space-x-4">
                <span className="text-sm text-gray-600">How does this make you feel?</span>
                <div className="flex space-x-2">
                  {[
                    { emoji: "🔥", value: "fire", label: "Inspired" },
                    { emoji: "🙏", value: "pray", label: "Prayerful" },
                    { emoji: "💖", value: "heart", label: "Loved" },
                    { emoji: "☮️", value: "peace", label: "Peaceful" }
                  ].map((reaction) => (
                    <Button
                      key={reaction.value}
                      variant={emotionalReaction === reaction.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleEmotionalReaction(reaction.value)}
                      className="px-3"
                    >
                      <span className="text-lg mr-1">{reaction.emoji}</span>
                      {reaction.label}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Reflection & Prayer Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Tabs defaultValue="reflection" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger 
              value="reflection" 
              className="transition-all duration-200 hover:bg-blue-50 hover:shadow-sm"
            >
              Reflection
            </TabsTrigger>
            <TabsTrigger 
              value="prayer" 
              className="transition-all duration-200 hover:bg-green-50 hover:shadow-sm"
            >
              Guided Prayer
            </TabsTrigger>
            <TabsTrigger 
              value="verse-art" 
              className="transition-all duration-200 hover:bg-purple-50 hover:shadow-sm"
            >
              Verse Art
            </TabsTrigger>
            <TabsTrigger 
              value="devotional-packs" 
              className="flex items-center space-x-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <BookOpen className="h-4 w-4" />
              <span className="font-semibold">Devotional Packs</span>
            </TabsTrigger>
            <TabsTrigger 
              value="bible-in-a-day" 
              className="flex items-center space-x-1 bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:from-indigo-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Rocket className="h-4 w-4" />
              <span className="font-semibold">Bible in a Day</span>
            </TabsTrigger>
          </TabsList>
          
          {/* ETHOS Response Panel */}
          {showEthosResponse && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-6"
            >
              <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Brain className="h-5 w-5 text-purple-600" />
                      <CardTitle className="text-purple-800">ETHOS Spiritual Insight</CardTitle>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setShowEthosResponse(false)}
                      className="text-purple-600 hover:text-purple-800"
                    >
                      ✕
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-white rounded-lg p-4 border border-purple-100">
                    <p className="text-gray-800 leading-relaxed">{ethosResponse}</p>
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={handleSaveInsight}
                      className="flex items-center space-x-2 text-sm text-purple-600 hover:text-purple-800 hover:bg-purple-100"
                    >
                      <Bookmark className="h-4 w-4" />
                      <span>Save this insight</span>
                    </Button>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => setShowETHOSDialog(true)}>
                        Ask Another Question
                      </Button>
                      <Button variant="outline" size="sm">
                        <Share2 className="h-4 w-4 mr-1" />
                        Share
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
          
          <TabsContent value="reflection" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Reflect & Journal</CardTitle>
                {dailyVerse?.reflectionPrompt && (
                  <p className="text-gray-600">{dailyVerse.reflectionPrompt}</p>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {/* AI-Powered Reflection Section */}
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-purple-600" />
                      <h4 className="font-semibold text-purple-800">AI-Powered Reflection</h4>
                    </div>
                    <Button
                      onClick={handleGenerateAiReflection}
                      disabled={aiReflectionMutation.isPending}
                      size="sm"
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      {aiReflectionMutation.isPending ? (
                        <>
                          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Brain className="h-4 w-4 mr-2" />
                          Generate Reflection
                        </>
                      )}
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">
                        Current Context (Optional)
                      </label>
                      <Input
                        value={userContext}
                        onChange={(e) => setUserContext(e.target.value)}
                        placeholder="e.g., going through a difficult time, starting new job..."
                        className="text-sm"
                      />
                    </div>
                    <p className="text-xs text-gray-600">
                      Get personalized reflection questions based on this verse and your current life situation.
                    </p>
                  </div>
                </div>

                <Textarea
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  placeholder="Write your thoughts and reflections here..."
                  className="min-h-32 resize-none"
                />
              </CardContent>
            </Card>
            
            {/* AI Reflection Results */}
            {showAiReflection && aiReflectionData && (
              <Card className="border-purple-200 bg-purple-50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-purple-600" />
                      <CardTitle className="text-purple-800">AI-Generated Reflection</CardTitle>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setShowAiReflection(false)}
                      className="text-purple-600 hover:text-purple-800"
                    >
                      ✕
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Reflection Questions */}
                  <div>
                    <h4 className="font-semibold text-purple-900 mb-2">Reflection Questions</h4>
                    <div className="space-y-2">
                      {aiReflectionData.reflectionQuestions?.map((question: string, index: number) => (
                        <div key={index} className="bg-white p-3 rounded border border-purple-200">
                          <p className="text-sm text-gray-700">{question}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Practical Application */}
                  {aiReflectionData.practicalApplication && (
                    <div>
                      <h4 className="font-semibold text-purple-900 mb-2">Practical Application</h4>
                      <div className="bg-blue-50 p-3 rounded border border-blue-200">
                        <p className="text-sm text-blue-800">{aiReflectionData.practicalApplication}</p>
                      </div>
                    </div>
                  )}
                  
                  {/* AI-Generated Prayer */}
                  {aiReflectionData.prayer && (
                    <div>
                      <h4 className="font-semibold text-purple-900 mb-2">Suggested Prayer</h4>
                      <div className="bg-green-50 p-3 rounded border border-green-200">
                        <p className="text-sm text-green-800 italic">{aiReflectionData.prayer}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center pt-3">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => {
                        if (aiReflectionData.practicalApplication && !savedInsights.includes(aiReflectionData.practicalApplication)) {
                          setSavedInsights([...savedInsights, aiReflectionData.practicalApplication]);
                          toast({
                            title: "Insight Saved",
                            description: "AI reflection saved to your collection.",
                          });
                        }
                      }}
                      className="text-purple-600 hover:text-purple-800"
                    >
                      <Bookmark className="h-4 w-4 mr-2" />
                      Save Reflection
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleGenerateAiReflection}
                      className="border-purple-300 text-purple-700 hover:bg-purple-100"
                    >
                      Generate New Reflection
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="prayer" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Guided Prayer</CardTitle>
              </CardHeader>
              <CardContent>
                {dailyVerse?.guidedPrayer ? (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-gray-800 leading-relaxed italic">
                      {dailyVerse.guidedPrayer}
                    </p>
                  </div>
                ) : (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-gray-800 leading-relaxed italic">
                      Heavenly Father, thank you for your Word that guides and strengthens us. 
                      Help us to apply what we've read today in our lives. May your truth transform 
                      our hearts and minds. In Jesus' name, Amen.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="bible-in-a-day" className="space-y-4">
            <BibleInADayFeature />
          </TabsContent>
          
          <TabsContent value="verse-art" className="space-y-4">
            <VerseArtGenerator 
              currentVerse={dailyVerse ? {
                text: getVerseText(),
                reference: dailyVerse.verseReference
              } : undefined}
            />
          </TabsContent>
          
          <TabsContent value="devotional-packs" className="space-y-4">
            <DevotionalPacks />
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Mark as Read Button */}
      {!hasReadToday && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center"
        >
          <Button
            onClick={handleMarkAsRead}
            disabled={recordReadingMutation.isPending}
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3"
          >
            {recordReadingMutation.isPending ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Recording...
              </div>
            ) : (
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                Mark as Read
              </div>
            )}
          </Button>
        </motion.div>
      )}

      {/* Badges Section */}
      {badges && badges.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="h-5 w-5 mr-2" />
                Your Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {badges.map((badge) => (
                  <motion.div
                    key={badge.id}
                    whileHover={{ scale: 1.05 }}
                    className="text-center p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border border-yellow-200"
                  >
                    <div className="text-2xl mb-2">🏆</div>
                    <h3 className="font-semibold text-sm">{badge.badge.name}</h3>
                    <p className="text-xs text-gray-600 mt-1">{badge.badge.description}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Earned {format(new Date(badge.earnedAt), "MMM d")}
                    </p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Community Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
      >
        <Card className="bg-gradient-to-r from-green-50 to-blue-50">
          <CardContent className="p-6">
            {/* Show community stats if there's activity, otherwise show invite */}
{communityStatsData && (communityStatsData.todayReads > 0 || communityStatsData.weekReads > 0) ? (
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  You're not alone in this journey
                </h3>
                <p className="text-gray-600">
                  Join thousands of believers reading God's Word daily
                </p>
                <div className="flex items-center justify-center mt-4 space-x-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {communityStatsData.todayReads.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500">Read today</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {communityStatsData.weekReads.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500">This week</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-3 text-gray-800">
                  🌟 Start a Spiritual Journey Together
                </h3>
                <p className="text-gray-600 mb-4">
                  Invite friends and family to join you in daily Bible reading and grow in faith together
                </p>
                <div className="bg-white rounded-lg p-4 border-2 border-dashed border-purple-200 mb-4">
                  <p className="text-sm font-medium text-purple-700 mb-2">Share this invitation link:</p>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={`${window.location.origin}?ref=${(user as any)?.referralCode || 'SOAPBOX'}`}
                      readOnly
                      className="flex-1 text-sm bg-purple-50 border border-purple-200 rounded px-3 py-2 text-purple-800"
                    />
                    <Button
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}?ref=${(user as any)?.referralCode || 'SOAPBOX'}`);
                        toast({
                          title: "Invitation link copied!",
                          description: "Share this with friends and family. You'll both earn bonus points when they join!",
                          duration: 3000,
                        });
                      }}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-4"
                    >
                      Copy Link
                    </Button>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 border border-yellow-200 mb-3">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">✨</span>
                      <p className="text-sm font-semibold text-orange-800">Share the Light. Earn the Rewards.</p>
                    </div>
                    <div className="text-xs text-orange-700 space-y-1">
                      <p className="font-medium">When you invite a friend to SoapBox:</p>
                      <p>• You earn 500 points toward spiritual milestones</p>
                      <p>• They start with 250 bonus points to kickstart their journey</p>
                      <p className="italic font-medium mt-2">Faith grows stronger when shared.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <p className="text-sm text-blue-800 italic font-medium">
                    "As iron sharpens iron, so one person sharpens another." - Proverbs 27:17
                  </p>
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  Build accountability and encouragement in your daily Bible reading
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Journal Note Dialog */}
      <Dialog open={showJournalNote} onOpenChange={setShowJournalNote}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Journal Note</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Write your personal reflection about today's verse:
            </p>
            <Textarea
              value={journalNote}
              onChange={(e) => setJournalNote(e.target.value)}
              placeholder="What does this verse mean to you today? How might you apply it in your life?"
              className="min-h-32"
            />
            <div className="flex space-x-2">
              <Button onClick={handleSaveJournalNote} className="flex-1">
                <PenTool className="h-4 w-4 mr-2" />
                Save Note
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowJournalNote(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Notification Scheduler Dialog */}
      <Dialog open={showNotificationScheduler} onOpenChange={setShowNotificationScheduler}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Set Daily Bible Reminders</DialogTitle>
          </DialogHeader>
          <NotificationScheduler />
        </DialogContent>
      </Dialog>

      {/* ETHOS Dialog */}
      <Dialog open={showETHOSDialog} onOpenChange={setShowETHOSDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ask ETHOS about this verse</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-purple-800 font-medium mb-2">
                Current verse: {dailyVerse?.verseReference}
              </p>
              <p className="text-sm text-purple-700 italic">
                "{getVerseText()}"
              </p>
            </div>
            <div className="space-y-3">
              <p className="text-sm text-gray-600">What would you like to know?</p>
              <div className="grid gap-2">
                <Button 
                  variant="outline" 
                  className="justify-start text-left p-3 h-auto"
                  onClick={() => handleETHOSQuestion("What is the historical context of this verse?")}
                >
                  <Brain className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span>What is the historical context of this verse?</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="justify-start text-left p-3 h-auto"
                  onClick={() => handleETHOSQuestion("How can I apply this verse to my daily life?")}
                >
                  <Brain className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span>How can I apply this verse to my daily life?</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="justify-start text-left p-3 h-auto"
                  onClick={() => handleETHOSQuestion("What other verses relate to this theme?")}
                >
                  <Brain className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span>What other verses relate to this theme?</span>
                </Button>
                <div className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <Brain className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium">Ask your own question:</span>
                  </div>
                  <div className="flex space-x-2">
                    <Input
                      value={customQuestion}
                      onChange={(e) => setCustomQuestion(e.target.value)}
                      placeholder="Type your question about this verse..."
                      className="flex-1"
                      onKeyPress={(e) => e.key === 'Enter' && handleCustomQuestion()}
                    />
                    <Button 
                      size="sm" 
                      onClick={handleCustomQuestion}
                      disabled={!customQuestion.trim()}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      Ask
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Journey Selector Dialog */}
      <Dialog open={showJourneySelector} onOpenChange={setShowJourneySelector}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Choose Your Bible Journey</DialogTitle>
            <DialogDescription>
              Select how you'd like to experience God's Word today
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
            {availableJourneys.map((journey) => (
              <Card 
                key={journey.type}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  currentJourneyType === journey.type ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                }`}
                onClick={() => handleJourneySwitch(journey.type)}
              >
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-3">{journey.icon}</div>
                  <h3 className="font-semibold text-lg mb-2">{journey.name}</h3>
                  <p className="text-sm text-gray-600">{journey.description}</p>
                  {currentJourneyType === journey.type && (
                    <Badge className="mt-3 bg-blue-600">Currently Active</Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="p-4 bg-gray-50 rounded-lg mx-4 mb-4">
            <h4 className="font-medium mb-2">Journey Features:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Daily verse progression through themed series</li>
              <li>• Adaptive content based on your reading history</li>
              <li>• Streak tracking and achievement badges</li>
              <li>• Switch between journeys anytime</li>
            </ul>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}