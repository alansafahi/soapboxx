import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Slider } from "../components/ui/slider";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { useToast } from "../hooks/use-toast";
import { apiRequest } from "../lib/queryClient";
import { Play, Pause, Volume2, Settings, RefreshCw, Heart, Star, BookOpen, Headphones, Square } from "lucide-react";

interface BibleVerse {
  id: number;
  reference: string;
  text: string;
  category: string;
  topicTags?: string[];
}

interface AudioRoutine {
  id: string;
  verses: BibleVerse[];
  voice: string;
  musicBed: string;
  totalDuration: number;
  audioUrl?: string;
}

// Helper function to make Bible references TTS-friendly
function makeTTSFriendlyReference(reference: string): string {
  // Convert Bible references like "Jeremiah 29:11" to "Jeremiah chapter 29, verse 11"
  // This prevents TTS from reading "29:11" as "29 hours and 11 minutes"
  return reference.replace(/(\d+):(\d+)/g, 'chapter $1, verse $2');
}

export default function FreshAudioBible() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // State management
  const [selectedMood, setSelectedMood] = useState<string>("");
  const [isResearchingScripture, setIsResearchingScripture] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState("warm-female");
  const [selectedOpenAIVoice, setSelectedOpenAIVoice] = useState("alloy");
  const [selectedMusicBed, setSelectedMusicBed] = useState("gentle-piano");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState([0.8]);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [pendingSettingsUpdate, setPendingSettingsUpdate] = useState(false);
  const [useOpenAIVoice, setUseOpenAIVoice] = useState(true); // Default to premium voice
  const [audioPlayer, setAudioPlayer] = useState<HTMLAudioElement | null>(null);
  const [selectedBibleVersion, setSelectedBibleVersion] = useState("KJV"); // Default to KJV

  // Fetch available Bible versions
  const { data: bibleVersions = [] } = useQuery({
    queryKey: ['/api/bible/versions'],
    select: (data: any) => data.versions || []
  });

  // Real-time audio controls for premium voices (no restart needed)
  useEffect(() => {
    if (audioPlayer && useOpenAIVoice) {
      // Apply changes instantly to existing audio without restart
      audioPlayer.playbackRate = playbackSpeed;
      audioPlayer.volume = volume[0] || 0.8;
      return;
    }
    
    // Standard voice handling (requires restart due to browser limitations)
    if (isPlaying && window.speechSynthesis.speaking && !useOpenAIVoice) {
      setPendingSettingsUpdate(true);
      
      const debounceTimer = setTimeout(() => {
        if (isPlaying && window.speechSynthesis.speaking) {
          const currentIndex = currentVerseIndex;
          
          // Smooth transition with fade effect
          const fadeOutDuration = 200;
          const currentUtteranceRef = currentUtterance;
          
          // Gradually reduce volume for smoother transition
          if (currentUtteranceRef) {
            let fadeStep = 0;
            const fadeInterval = setInterval(() => {
              fadeStep += 0.1;
              if (fadeStep >= 1) {
                clearInterval(fadeInterval);
                window.speechSynthesis.cancel();
                
                // Quick restart with new settings
                setTimeout(() => {
                  if (isPlaying) {
                    speakVerse(currentIndex);
                    setPendingSettingsUpdate(false);
                  }
                }, 100);
              }
            }, fadeOutDuration / 10);
          } else {
            window.speechSynthesis.cancel();
            setTimeout(() => {
              if (isPlaying) {
                speakVerse(currentIndex);
                setPendingSettingsUpdate(false);
              }
            }, 100);
          }
        }
      }, 800); // Longer debounce for better user control
      
      return () => clearTimeout(debounceTimer);
    }
  }, [playbackSpeed, volume, audioPlayer, useOpenAIVoice]);

  // Monitor for speech synthesis events
  useEffect(() => {
    const handleSpeechEnd = () => {
      if (window.speechSynthesis.speaking === false && !isPaused) {
        // Speech ended unexpectedly, might be due to settings change
      }
    };

    if ('speechSynthesis' in window) {
      // Some browsers support these events
      window.speechSynthesis.addEventListener?.('voiceschanged', handleSpeechEnd);
    }

    return () => {
      window.speechSynthesis.removeEventListener?.('voiceschanged', handleSpeechEnd);
    };
  }, [isPaused]);
  const [selectedVerses, setSelectedVerses] = useState<BibleVerse[]>([]);
  const [customVerseCount, setCustomVerseCount] = useState(5);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [currentRoutine, setCurrentRoutine] = useState<AudioRoutine | null>(null);
  const [currentVerseIndex, setCurrentVerseIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentUtterance, setCurrentUtterance] = useState<SpeechSynthesisUtterance | null>(null);
  
  // Manual selection state
  const [manuallySelectedVerses, setManuallySelectedVerses] = useState<BibleVerse[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Comprehensive mood options organized by category
  const moodCategories = [
    {
      title: "Emotional & Spiritual Support",
      icon: "💔",
      moods: [
        { id: "lonely", label: "Feeling Lonely", color: "bg-blue-100 text-blue-800", icon: "🤗", theme: "God's presence and companionship" },
        { id: "overwhelmed", label: "Overwhelmed", color: "bg-purple-100 text-purple-800", icon: "😰", theme: "anxiety and fatigue relief" },
        { id: "shame", label: "Shame or Guilt", color: "bg-red-100 text-red-800", icon: "💔", theme: "forgiveness, grace, redemption" },
        { id: "doubting", label: "Doubting Faith", color: "bg-gray-100 text-gray-800", icon: "❓", theme: "wrestling with God, questions" },
        { id: "needing-forgiveness", label: "Needing Forgiveness", color: "bg-pink-100 text-pink-800", icon: "🙏", theme: "grace and mercy" },
        { id: "struggling-sin", label: "Struggling with Sin", color: "bg-orange-100 text-orange-800", icon: "⚖️", theme: "temptation, accountability, renewal" }
      ]
    },
    {
      title: "Growth & Transformation", 
      icon: "🌿",
      moods: [
        { id: "seeking-purpose", label: "Seeking Purpose", color: "bg-indigo-100 text-indigo-800", icon: "🎯", theme: "identity in Christ, calling, direction" },
        { id: "starting-over", label: "Starting Over", color: "bg-green-100 text-green-800", icon: "🌱", theme: "new beginnings, transformation" },
        { id: "wanting-growth", label: "Wanting to Grow", color: "bg-teal-100 text-teal-800", icon: "📈", theme: "wisdom, discipline, sanctification" },
        { id: "building-confidence", label: "Building Confidence", color: "bg-yellow-100 text-yellow-800", icon: "💪", theme: "strength, courage, fearlessness" },
        { id: "desiring-wisdom", label: "Desiring Wisdom", color: "bg-amber-100 text-amber-800", icon: "🦉", theme: "Proverbs, guidance, discernment" },
        { id: "serving-others", label: "Serving Others", color: "bg-emerald-100 text-emerald-800", icon: "🤝", theme: "compassion, generosity, humility" }
      ]
    },
    {
      title: "Life Situations",
      icon: "🌎", 
      moods: [
        { id: "big-decision", label: "Before a Big Decision", color: "bg-violet-100 text-violet-800", icon: "🤔", theme: "discernment scriptures" },
        { id: "waiting", label: "Waiting on God", color: "bg-slate-100 text-slate-800", icon: "⏰", theme: "patience, faith in timing" },
        { id: "relationships", label: "Struggling in Relationships", color: "bg-rose-100 text-rose-800", icon: "💕", theme: "family, marriage, forgiveness" },
        { id: "change", label: "Navigating Change", color: "bg-cyan-100 text-cyan-800", icon: "🔄", theme: "transitions, new seasons" },
        { id: "injustice", label: "Dealing with Injustice", color: "bg-red-100 text-red-800", icon: "⚖️", theme: "encouragement in trials" },
        { id: "illness", label: "Facing Illness", color: "bg-blue-100 text-blue-800", icon: "🩺", theme: "healing, peace in hardship" }
      ]
    },
    {
      title: "Faith & Worship",
      icon: "🙏",
      moods: [
        { id: "hungry-for-god", label: "Hungry for God", color: "bg-purple-100 text-purple-800", icon: "🔥", theme: "spiritual thirst, revival, intimacy" },
        { id: "worshipful", label: "Worshipful Heart", color: "bg-gold-100 text-gold-800", icon: "🎵", theme: "psalms, adoration, joy" },
        { id: "fasting-prayer", label: "Fasting/Prayer Mode", color: "bg-indigo-100 text-indigo-800", icon: "🕯️", theme: "intensified seeking" },
        { id: "grateful", label: "Grateful Heart", color: "bg-green-100 text-green-800", icon: "💚", theme: "thanksgiving and praise" }
      ]
    }
  ];

  // Voice options with enhanced descriptions
  const voiceOptions = [
    { id: "warm-female", label: "Sarah - Warm & Nurturing", description: "Gentle female voice perfect for comfort" },
    { id: "gentle-male", label: "David - Gentle & Wise", description: "Calm male voice with pastoral tone" },
    { id: "peaceful-female", label: "Grace - Peaceful & Serene", description: "Tranquil female voice for meditation" },
    { id: "authoritative-male", label: "Samuel - Strong & Clear", description: "Confident male voice for proclamation" }
  ];

  // Music bed options
  const musicBedOptions = [
    { id: "gentle-piano", label: "Gentle Piano", description: "Soft piano melodies for reflection" },
    { id: "nature-sounds", label: "Nature Sounds", description: "Birds and flowing water" },
    { id: "orchestral-ambient", label: "Orchestral Ambient", description: "Ethereal strings and choir" },
    { id: "worship-instrumental", label: "Worship Instrumental", description: "Contemporary worship background" }
  ];

  // Get contextual verse selection based on mood
  const { data: contextualVerses, isLoading: loadingVerses, refetch: refetchVerses } = useQuery({
    queryKey: ["/api/bible/contextual-selection", selectedMood, customVerseCount, selectedBibleVersion],
    enabled: !!selectedMood,
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/bible/contextual-selection?mood=${selectedMood}&count=${customVerseCount}&version=${selectedBibleVersion}`);
      return response;
    }
  });

  // Effect to handle completion of scripture research
  useEffect(() => {
    if (contextualVerses?.verses && isResearchingScripture) {
      setIsResearchingScripture(false);
      
      // Find the selected mood details for better messaging
      const selectedMoodInfo = moodCategories
        .flatMap(cat => cat.moods)
        .find(mood => mood.id === selectedMood);
      
      toast({
        title: "Perfect Scripture Match Found!",
        description: `${contextualVerses.verses.length} verses selected for "${selectedMoodInfo?.label}" based on AI analysis of your spiritual needs`,
      });
    }
  }, [contextualVerses, isResearchingScripture, selectedMood, moodCategories]);

  // Get Bible verses for manual selection with search and filtering
  const { data: manualVersesData, isLoading: loadingManualVerses } = useQuery({
    queryKey: ["/api/bible/verses", currentPage, searchQuery, selectedCategory],
    queryFn: async () => {
      const params = new URLSearchParams({
        limit: "20",
        page: currentPage.toString()
      });
      
      if (searchQuery.trim()) {
        params.append("search", searchQuery.trim());
      }
      
      if (selectedCategory !== "all") {
        params.append("category", selectedCategory);
      }
      
      const response = await apiRequest("GET", `/api/bible/verses?${params.toString()}`);
      return response;
    }
  });

  const categories = ["all", "Faith", "Hope", "Love", "Peace", "Strength", "Wisdom", "Comfort", "Forgiveness", "Joy", "Purpose", "Grace", "Worship", "Core"];

  // Generate audio routine mutation
  const generateRoutineMutation = useMutation({
    mutationFn: async (routine: { verseIds: number[], voice: string, musicBed: string }) => {
      return await apiRequest("POST", "/api/audio/routines/bible-integrated", routine);
    },
    onSuccess: (data) => {
      setCurrentRoutine(data);
      setCurrentVerseIndex(0);
      toast({
        title: "Audio Routine Ready",
        description: "Your personalized Bible audio experience has been created"
      });
    },
    onError: (error) => {
      toast({
        title: "Generation Failed", 
        description: "Please try again or select different options",
        variant: "destructive"
      });
    }
  });

  // Handle mood selection and verse generation
  const handleMoodSelection = (mood: string) => {
    setSelectedMood(mood);
    setSelectedVerses([]);
    setCurrentRoutine(null);
    setIsResearchingScripture(true);
    
    // Show immediate feedback to user
    toast({
      title: "Scripture Research Started",
      description: "Finding personalized verses for your current mood...",
    });
  };

  // Create audio routine from selected verses
  const createAudioRoutine = () => {
    if (selectedVerses.length === 0) {
      toast({
        title: "No Verses Selected",
        description: "Please select verses to create your audio routine",
        variant: "destructive"
      });
      return;
    }

    const verseIds = selectedVerses.map(v => v.id);
    generateRoutineMutation.mutate({
      verseIds,
      voice: selectedVoice,
      musicBed: selectedMusicBed
    });
  };

  // Audio control functions
  const togglePlayPause = () => {
    if ('speechSynthesis' in window) {
      if (isPlaying) {
        window.speechSynthesis.pause();
        setIsPlaying(false);
      } else {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        } else {
          handlePlayAudio();
        }
        setIsPlaying(true);
      }
    }
  };

  const generateOpenAIAudio = async (verses: any[]) => {
    try {
      // Stop and cleanup any existing audio first to prevent overlap
      if (audioPlayer) {
        audioPlayer.pause();
        audioPlayer.src = '';
        setAudioPlayer(null);
      }
      
      setIsGenerating(true);
      
      const response = await fetch('/api/audio/compile-verses', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg'
        },
        credentials: 'include', // Include session cookies for authentication
        body: JSON.stringify({
          verses,
          voice: selectedOpenAIVoice,
          speed: playbackSpeed
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Audio generation failed: ${response.status}`);
      }

      // Ensure we're getting audio data
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('audio')) {
        throw new Error('Invalid response format - expected audio data');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Create audio element with real-time controls
      const audio = new Audio(audioUrl);
      audio.volume = volume[0] || 0.8;
      audio.playbackRate = playbackSpeed;
      
      // Set up event listeners for seamless playback
      audio.addEventListener('loadedmetadata', () => {
        setDuration(audio.duration);
      });
      
      audio.addEventListener('timeupdate', () => {
        setCurrentTime(audio.currentTime);
      });
      
      audio.addEventListener('ended', () => {
        setIsPlaying(false);
        setIsPaused(false);
        setCurrentTime(0);
        URL.revokeObjectURL(audioUrl);
      });
      
      setAudioPlayer(audio);
      setIsGenerating(false);
      
      return audio;
    } catch (error) {
      setIsGenerating(false);
      toast({
        title: "Premium voice unavailable",
        description: "Switching to standard voice. Please try again."
      });
      setUseOpenAIVoice(false);
      return null;
    }
  };

  const speakVerse = (verseIndex: number) => {
    if (verseIndex >= selectedVerses.length) {
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentVerseIndex(0);
      toast({
        title: "Audio Bible completed",
        description: "All verses have been read"
      });
      return;
    }

    const verse = selectedVerses[verseIndex];
    const textToSpeak = `${makeTTSFriendlyReference(verse.reference)}. ${verse.text}`;
    
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.name.toLowerCase().includes('female') || 
      voice.name.toLowerCase().includes('samantha') ||
      voice.name.toLowerCase().includes('karen')
    ) || voices[0];
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    utterance.rate = playbackSpeed;
    utterance.volume = volume?.[0] || 0.8;
    utterance.pitch = 1;
    
    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
      setIsGenerating(false);
    };
    
    utterance.onend = () => {
      if (!isPaused) {
        const nextIndex = verseIndex + 1;
        setCurrentVerseIndex(nextIndex);
        setTimeout(() => speakVerse(nextIndex), 500);
      }
    };
    
    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setIsGenerating(false);
      toast({
        title: "Audio not available",
        description: "Please ensure your device volume is turned up and try again"
      });
    };
    
    setCurrentUtterance(utterance);
    window.speechSynthesis.speak(utterance);
  };

  const handlePlayAudio = async () => {
    if (selectedVerses.length === 0) {
      toast({
        title: "Please select verses first",
        description: "Choose a mood above to get personalized verse recommendations"
      });
      return;
    }

    // Stop all audio sources when switching between voice types
    if (audioPlayer) {
      audioPlayer.pause();
      audioPlayer.src = '';
      setAudioPlayer(null);
    }
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
    
    // Reset states
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentTime(0);
    setDuration(0);

    if (useOpenAIVoice) {
      // Use premium OpenAI TTS with HTML5 audio controls
      if (isPlaying && audioPlayer) {
        audioPlayer.pause();
        setIsPlaying(false);
        setIsPaused(true);
        toast({
          title: "Audio paused",
          description: "Premium voice playback paused"
        });
      } else if (isPaused && audioPlayer) {
        audioPlayer.play();
        setIsPlaying(true);
        setIsPaused(false);
        toast({
          title: "Audio resumed",
          description: "Continuing from exact position"
        });
      } else {
        // Generate new OpenAI audio
        const audio = await generateOpenAIAudio(selectedVerses);
        if (audio) {
          audio.onended = () => {
            setIsPlaying(false);
            setIsPaused(false);
            setCurrentVerseIndex(0);
            toast({
              title: "Audio Bible completed",
              description: "All verses have been read"
            });
          };
          
          audio.ontimeupdate = () => {
            setCurrentTime(audio.currentTime);
            setDuration(audio.duration);
          };
          
          audio.play();
          setIsPlaying(true);
          setIsPaused(false);
          
          toast({
            title: "Premium Audio Started",
            description: `Playing ${selectedVerses.length} verses with OpenAI voice`
          });
        }
      }
    } else {
      // Use standard browser speech synthesis
      if ('speechSynthesis' in window) {
        if (isPlaying && !isPaused) {
          window.speechSynthesis.pause();
          setIsPaused(true);
          setIsPlaying(false);
          toast({
            title: "Audio paused",
            description: "Click play to resume where you left off"
          });
        } else if (isPaused) {
          window.speechSynthesis.resume();
          setIsPaused(false);
          setIsPlaying(true);
          toast({
            title: "Audio resumed",
            description: "Continuing from where you paused"
          });
        } else {
          window.speechSynthesis.cancel();
          setIsGenerating(true);
          setIsPaused(false);
          
          toast({
            title: "Audio Bible started",
            description: `Reading ${selectedVerses.length} verses aloud`
          });
          
          speakVerse(currentVerseIndex);
        }
      } else {
        toast({
          title: "Audio not available",
          description: "Please try refreshing the page or use a different browser"
        });
      }
    }
  };

  const handleStopAudio = () => {
    if (useOpenAIVoice && audioPlayer) {
      audioPlayer.pause();
      audioPlayer.currentTime = 0;
      setAudioPlayer(null);
    } else {
      window.speechSynthesis.cancel();
    }
    
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentVerseIndex(0);
    setCurrentTime(0);
    setDuration(0);
    setCurrentUtterance(null);
    setPendingSettingsUpdate(false);
    
    toast({
      title: "Audio stopped",
      description: "Ready to start from the beginning"
    });
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Helper functions for manual verse selection
  const toggleVerseSelection = (verse: BibleVerse) => {
    setManuallySelectedVerses(prev => {
      const isSelected = prev.some(v => v.id === verse.id);
      if (isSelected) {
        return prev.filter(v => v.id !== verse.id);
      } else {
        return [...prev, verse];
      }
    });
  };

  const clearManualSelection = () => {
    setManuallySelectedVerses([]);
  };

  const useManualSelection = () => {
    setSelectedVerses(manuallySelectedVerses);
    toast({
      title: "Manual Selection Applied",
      description: `${manuallySelectedVerses.length} verses selected for your audio routine`
    });
  };

  // Update selected verses when contextual verses are loaded
  useEffect(() => {
    if (contextualVerses?.verses) {
      setSelectedVerses(contextualVerses.verses);
    }
  }, [contextualVerses]);

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnd = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnd);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnd);
    };
  }, [currentRoutine]);

  // Update audio volume
  useEffect(() => {
    if (audioRef.current && volume && volume.length > 0) {
      audioRef.current.volume = volume[0];
    }
  }, [volume]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-2 sm:py-4 md:py-6 lg:py-8">
      <div className="max-w-6xl mx-auto px-2 sm:px-4 md:px-6">
        <div className="text-center mb-4 sm:mb-6 md:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">Audio Bible Experience</h1>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-300">AI-powered personalized scripture listening with premium voices</p>
        </div>

        <Tabs defaultValue="mood-selection" className="space-y-3 sm:space-y-4 md:space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="mood-selection" className="text-xs sm:text-sm">Mood-Based Selection</TabsTrigger>
            <TabsTrigger value="custom-routine" className="text-xs sm:text-sm">Custom Routine Builder</TabsTrigger>
          </TabsList>

          <TabsContent value="mood-selection" className="space-y-3 sm:space-y-4 md:space-y-6">
            {/* Bible Version Selection */}
            <Card>
              <CardHeader className="p-3 sm:p-4 md:p-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />
                  Bible Translation
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 md:p-6">
                <div className="space-y-3">
                  <Label htmlFor="bible-version">Choose your preferred Bible version</Label>
                  <Select value={selectedBibleVersion} onValueChange={setSelectedBibleVersion}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Bible Version" />
                    </SelectTrigger>
                    <SelectContent>
                      {bibleVersions.map((version: any) => (
                        <SelectItem key={version.code} value={version.code}>
                          {version.code} - {version.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {bibleVersions.find((v: any) => v.code === selectedBibleVersion)?.attribution && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {bibleVersions.find((v: any) => v.code === selectedBibleVersion)?.attribution}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Mood Selection */}
            <Card>
              <CardHeader className="p-3 sm:p-4 md:p-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Heart className="h-4 w-4 sm:h-5 sm:w-5" />
                  How are you feeling today?
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 md:p-6">
                <div className="space-y-4 sm:space-y-6">
                  {moodCategories.map((category) => {
                    const hasSelectedMood = category.moods.some(mood => mood.id === selectedMood);
                    return (
                      <div key={category.title} className="space-y-2 sm:space-y-3">
                        <div className={`flex items-center gap-2 pb-2 border-b ${hasSelectedMood ? 'border-purple-300 dark:border-purple-600' : 'border-gray-200 dark:border-gray-600'}`}>
                          <span className="text-base sm:text-lg">{category.icon}</span>
                          <h3 className={`font-semibold text-sm sm:text-base ${hasSelectedMood ? 'text-purple-700 dark:text-purple-300' : 'text-gray-800 dark:text-white'}`}>
                            {category.title}
                            {hasSelectedMood && (
                              <span className="ml-2 text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded-full">
                                Active
                              </span>
                            )}
                          </h3>
                        </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
                        {category.moods.map((mood) => (
                          <Button
                            key={mood.id}
                            variant={selectedMood === mood.id ? "default" : "outline"}
                            className={`h-auto p-2 sm:p-3 flex flex-col gap-1 sm:gap-2 text-left ${mood.color} ${
                              selectedMood === mood.id ? 'ring-2 ring-purple-500 bg-purple-100 dark:bg-purple-900' : ''
                            } ${isResearchingScripture && selectedMood === mood.id ? 'animate-pulse' : ''}`}
                            onClick={() => handleMoodSelection(mood.id)}
                            disabled={isResearchingScripture}
                          >
                            <div className="flex items-center gap-2 w-full">
                              <span className="text-lg sm:text-xl">{mood.icon}</span>
                              <span className="text-xs sm:text-sm font-medium flex-1">{mood.label}</span>
                              {selectedMood === mood.id && isResearchingScripture && (
                                <RefreshCw className="h-3 w-3 animate-spin text-purple-600" />
                              )}
                            </div>
                            <p className="text-xs opacity-75 text-left leading-tight">
                              {selectedMood === mood.id && isResearchingScripture 
                                ? "Researching scripture..." 
                                : mood.theme
                              }
                            </p>
                          </Button>
                        ))}
                      </div>
                    </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Scripture Research Status */}
            {selectedMood && isResearchingScripture && (
              <Card className="border-purple-200 bg-purple-50 dark:bg-purple-900/20 dark:border-purple-800">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <RefreshCw className="h-6 w-6 animate-spin text-purple-600" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-purple-900 dark:text-purple-100">
                        Researching Scripture for Your Mood
                      </h3>
                      <p className="text-sm text-purple-700 dark:text-purple-300">
                        Our AI is analyzing thousands of verses to find the perfect spiritual guidance for how you're feeling right now...
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 w-full bg-purple-200 dark:bg-purple-800 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full animate-pulse" style={{width: '70%'}}></div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Contextual Verse Display */}
            {selectedMood && !isResearchingScripture && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Recommended Verses
                    {loadingVerses && <RefreshCw className="h-4 w-4 animate-spin" />}
                  </CardTitle>
                  {contextualVerses?.verses?.length > 0 && (
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      <p>Personalized verses selected based on your current mood</p>
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  {loadingVerses ? (
                    <div className="text-center py-8">
                      <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
                      <p>Selecting personalized verses...</p>
                    </div>
                  ) : selectedVerses.length > 0 ? (
                    <div className="space-y-4">
                      {selectedVerses.map((verse, index) => (
                        <div key={verse.id} className="border rounded-lg p-4 bg-white dark:bg-gray-800 dark:border-gray-600">
                          <div className="flex flex-wrap justify-between items-start mb-2 gap-2">
                            <Badge variant="secondary" className="text-xs sm:text-sm flex-shrink-0">{verse.reference}</Badge>
                            <Badge variant="outline" className="text-xs sm:text-sm">{verse.category}</Badge>
                          </div>
                          <p className="text-gray-700 dark:text-gray-200 leading-relaxed break-words text-sm sm:text-base whitespace-pre-wrap overflow-wrap-anywhere hyphens-auto">{verse.text}</p>
                          {verse.topicTags && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {verse.topicTags.map((tag, i) => (
                                <Badge key={i} variant="outline" className="text-xs">{tag}</Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center py-8 text-gray-500 dark:text-gray-400">Select a mood to see personalized verse recommendations</p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Audio Controls for Mood-Based Selection */}
            {selectedVerses.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Headphones className="h-5 w-5" />
                    Audio Bible Player
                  </CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Listen to your personalized scripture selection with premium voice narration
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Voice Quality Selection */}
                  <div className="mb-6">
                    <Label className="text-sm font-medium mb-3 block">Voice Quality</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => {
                          // Stop all audio when switching voice types
                          if (audioPlayer) {
                            audioPlayer.pause();
                            audioPlayer.src = '';
                            setAudioPlayer(null);
                          }
                          if (window.speechSynthesis.speaking) {
                            window.speechSynthesis.cancel();
                          }
                          setIsPlaying(false);
                          setIsPaused(false);
                          setCurrentTime(0);
                          setDuration(0);
                          setUseOpenAIVoice(false);
                        }}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          !useOpenAIVoice 
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-900 dark:text-purple-300' 
                            : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:border-gray-300 dark:hover:border-gray-500'
                        }`}
                      >
                        <div className="font-medium">Standard Voice</div>
                        <div className="text-sm opacity-75">Browser built-in (Free)</div>
                        <div className="text-xs mt-1">Settings restart verse</div>
                      </button>
                      <button
                        onClick={() => {
                          // Stop all audio when switching voice types
                          if (audioPlayer) {
                            audioPlayer.pause();
                            audioPlayer.src = '';
                            setAudioPlayer(null);
                          }
                          if (window.speechSynthesis.speaking) {
                            window.speechSynthesis.cancel();
                          }
                          setIsPlaying(false);
                          setIsPaused(false);
                          setCurrentTime(0);
                          setDuration(0);
                          setUseOpenAIVoice(true);
                        }}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          useOpenAIVoice 
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-900 dark:text-purple-300' 
                            : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:border-gray-300 dark:hover:border-gray-500'
                        }`}
                      >
                        <div className="font-medium">Premium Voice</div>
                        <div className="text-sm opacity-75">OpenAI TTS (Pro)</div>
                        <div className="text-xs mt-1">True real-time controls</div>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {!useOpenAIVoice && (
                      <div>
                        <Label htmlFor="voice-select">Choose Voice</Label>
                        <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                          <SelectTrigger id="voice-select">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {voiceOptions.map((voice) => (
                              <SelectItem key={voice.id} value={voice.id}>
                                <div>
                                  <div className="font-medium">{voice.label}</div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">{voice.description}</div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {useOpenAIVoice && (
                      <div>
                        <Label htmlFor="ai-voice-select">Premium Voice</Label>
                        <Select value={selectedOpenAIVoice} onValueChange={setSelectedOpenAIVoice}>
                          <SelectTrigger id="ai-voice-select">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="alloy">Alloy - Natural & Clear</SelectItem>
                            <SelectItem value="echo">Echo - Deep & Resonant</SelectItem>
                            <SelectItem value="fable">Fable - Warm & Engaging</SelectItem>
                            <SelectItem value="onyx">Onyx - Rich & Authoritative</SelectItem>
                            <SelectItem value="nova">Nova - Bright & Expressive</SelectItem>
                            <SelectItem value="shimmer">Shimmer - Gentle & Soothing</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="text-xs text-green-600 mt-1">6 premium voices available</div>
                      </div>
                    )}

                    {/* Playback Speed */}
                    <div>
                      <div className="flex justify-between items-center">
                        <Label htmlFor="playback-speed">Playback Speed</Label>
                        {(isPlaying || isPaused) && !pendingSettingsUpdate && (
                          <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                            Will restart verse
                          </span>
                        )}
                        {pendingSettingsUpdate && (
                          <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                            Updating...
                          </span>
                        )}
                      </div>
                      <Select value={playbackSpeed.toString()} onValueChange={(value) => setPlaybackSpeed(parseFloat(value))}>
                        <SelectTrigger id="playback-speed">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0.5">0.5x (Slow)</SelectItem>
                          <SelectItem value="0.75">0.75x (Slower)</SelectItem>
                          <SelectItem value="1">1x (Normal)</SelectItem>
                          <SelectItem value="1.25">1.25x (Faster)</SelectItem>
                          <SelectItem value="1.5">1.5x (Fast)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Volume Control */}
                  <div>
                    <div className="flex justify-between items-center">
                      <Label htmlFor="volume-control">Volume: {Math.round((volume?.[0] || 0.8) * 100)}%</Label>
                      {(isPlaying || isPaused) && !pendingSettingsUpdate && (
                        <span className="text-xs text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 px-2 py-1 rounded-full">
                          Will restart verse
                        </span>
                      )}
                      {pendingSettingsUpdate && (
                        <span className="text-xs text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 px-2 py-1 rounded-full">
                          Updating...
                        </span>
                      )}
                    </div>
                    <Slider
                      id="volume-control"
                      min={0}
                      max={1}
                      step={0.1}
                      value={volume || [0.8]}
                      onValueChange={setVolume}
                      className="mt-2"
                    />
                  </div>

                  {/* Play Controls */}
                  <div className="flex justify-center gap-4">
                    <Button
                      onClick={handlePlayAudio}
                      disabled={isGenerating || selectedVerses.length === 0}
                      size="lg"
                      className="px-8"
                      variant={isPlaying || isPaused ? "secondary" : "default"}
                    >
                      {isGenerating ? (
                        <>
                          <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                          Starting Audio...
                        </>
                      ) : isPaused ? (
                        <>
                          <Play className="h-5 w-5 mr-2" />
                          Resume Audio Bible
                        </>
                      ) : isPlaying ? (
                        <>
                          <Pause className="h-5 w-5 mr-2" />
                          Pause Audio Bible
                        </>
                      ) : (
                        <>
                          <Play className="h-5 w-5 mr-2" />
                          Play Audio Bible ({selectedVerses.length} verses)
                        </>
                      )}
                    </Button>
                    
                    {(isPlaying || isPaused) && (
                      <Button
                        onClick={handleStopAudio}
                        size="lg"
                        variant="outline"
                        className="px-6"
                      >
                        ⏹️
                        Stop
                      </Button>
                    )}
                  </div>

                  {/* Audio Progress Indicator */}
                  {(isPlaying || isPaused) && (
                    <div className="border rounded-lg p-4 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-600">
                      <div className="text-center">
                        <p className="text-purple-800 dark:text-purple-300 font-medium">
                          {isPaused ? "⏸️ Audio Paused" : "🎵 Audio Bible Playing"}
                        </p>
                        <p className="text-purple-600 dark:text-purple-400 text-sm mt-1">
                          Verse {currentVerseIndex + 1} of {selectedVerses.length}
                          {selectedVerses[currentVerseIndex] && (
                            <span className="block mt-1 font-medium">
                              {selectedVerses[currentVerseIndex].reference}
                            </span>
                          )}
                        </p>
                        
                        {/* Progress bar */}
                        <div className="w-full bg-purple-200 dark:bg-purple-800 rounded-full h-2 mt-3">
                          <div 
                            className="bg-purple-600 dark:bg-purple-400 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${((currentVerseIndex + 1) / selectedVerses.length) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="custom-routine" className="space-y-6">
            {/* Manual Selection Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Manual Scripture Selection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Search and Filter Controls */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="search-verses">Search Verses</Label>
                      <Input
                        id="search-verses"
                        placeholder="Search by reference or text..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="category-filter">Filter by Category</Label>
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger id="category-filter">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category === "all" ? "All Categories" : category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Manual Selection Summary */}
                  {manuallySelectedVerses.length > 0 && (
                    <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-600 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-purple-900 dark:text-purple-300">
                          {manuallySelectedVerses.length} verses selected
                        </span>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={clearManualSelection}
                          >
                            Clear All
                          </Button>
                          <Button 
                            size="sm"
                            onClick={useManualSelection}
                          >
                            Use Selection
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Verse Browser */}
            <Card>
              <CardHeader>
                <CardTitle>Available Verses</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingManualVerses ? (
                  <div className="text-center py-8">
                    <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
                    <p>Loading verses...</p>
                  </div>
                ) : manualVersesData?.verses?.length > 0 ? (
                  <div className="space-y-3">
                    {manualVersesData.verses.map((verse: BibleVerse) => {
                      const isSelected = manuallySelectedVerses.some(v => v.id === verse.id);
                      return (
                        <div 
                          key={verse.id}
                          className={`border rounded-lg p-4 cursor-pointer transition-all ${
                            isSelected 
                              ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 dark:border-purple-400' 
                              : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                          onClick={() => toggleVerseSelection(verse)}
                        >
                          <div className="flex flex-wrap justify-between items-start mb-2 gap-2">
                            <Badge variant={isSelected ? "default" : "secondary"} className="text-xs sm:text-sm flex-shrink-0">
                              {verse.reference}
                            </Badge>
                            <Badge variant="outline" className="text-xs sm:text-sm">{verse.category}</Badge>
                          </div>
                          <p className="text-gray-700 dark:text-gray-200 leading-relaxed break-words text-sm sm:text-base whitespace-pre-wrap overflow-wrap-anywhere hyphens-auto">{verse.text}</p>
                          {verse.topicTags && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {verse.topicTags.map((tag, i) => (
                                <Badge key={i} variant="outline" className="text-xs">{tag}</Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                    
                    {/* Pagination */}
                    {manualVersesData.totalPages > 1 && (
                      <div className="flex justify-center gap-2 mt-6">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={currentPage <= 1}
                          onClick={() => setCurrentPage(currentPage - 1)}
                        >
                          Previous
                        </Button>
                        <span className="flex items-center px-3 py-2 text-sm">
                          Page {currentPage} of {manualVersesData.totalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={currentPage >= manualVersesData.totalPages}
                          onClick={() => setCurrentPage(currentPage + 1)}
                        >
                          Next
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                    <p>No verses found. Try adjusting your search or filter.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>



        {/* Audio Player */}
        {currentRoutine && (
          <Card>
            <CardHeader>
              <CardTitle>Now Playing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={togglePlayPause}
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <div className="flex-1">
                    <div className="text-sm font-medium">
                      Verse {currentVerseIndex + 1} of {selectedVerses.length}
                    </div>
                    <div className="text-xs text-gray-500">
                      {selectedVerses[currentVerseIndex]?.reference}
                    </div>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-200"
                    style={{ width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%' }}
                  />
                </div>
                
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{Math.floor(currentTime / 60)}:{String(Math.floor(currentTime % 60)).padStart(2, '0')}</span>
                  <span>{Math.floor(duration / 60)}:{String(Math.floor(duration % 60)).padStart(2, '0')}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Hidden audio element */}
        <audio ref={audioRef} />
      </div>
    </div>
  );
}