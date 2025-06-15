import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Play, Pause, Volume2, Settings, RefreshCw, Heart, Star, BookOpen, Headphones } from "lucide-react";

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

export default function FreshAudioBible() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // State management
  const [selectedMood, setSelectedMood] = useState<string>("");
  const [selectedVoice, setSelectedVoice] = useState("warm-female");
  const [selectedMusicBed, setSelectedMusicBed] = useState("gentle-piano");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState([0.8]);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [selectedVerses, setSelectedVerses] = useState<BibleVerse[]>([]);
  const [customVerseCount, setCustomVerseCount] = useState(5);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [currentRoutine, setCurrentRoutine] = useState<AudioRoutine | null>(null);
  const [currentVerseIndex, setCurrentVerseIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Manual selection state
  const [manuallySelectedVerses, setManuallySelectedVerses] = useState<BibleVerse[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Mood options with enhanced spiritual context
  const moodOptions = [
    { id: "peaceful", label: "Seeking Peace", color: "bg-blue-100 text-blue-800", icon: "🕊️" },
    { id: "anxious", label: "Feeling Anxious", color: "bg-purple-100 text-purple-800", icon: "🙏" },
    { id: "grateful", label: "Grateful Heart", color: "bg-green-100 text-green-800", icon: "💚" },
    { id: "struggling", label: "Going Through Challenges", color: "bg-red-100 text-red-800", icon: "💪" },
    { id: "joyful", label: "Celebrating Joy", color: "bg-yellow-100 text-yellow-800", icon: "✨" },
    { id: "seeking", label: "Seeking Guidance", color: "bg-indigo-100 text-indigo-800", icon: "🧭" },
    { id: "mourning", label: "Processing Loss", color: "bg-gray-100 text-gray-800", icon: "🤗" },
    { id: "hopeful", label: "Looking Forward", color: "bg-orange-100 text-orange-800", icon: "🌅" }
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
    queryKey: ["/api/bible/contextual-selection", selectedMood, customVerseCount],
    enabled: !!selectedMood,
    queryFn: async () => {
      const response = await apiRequest(`/api/bible/contextual-selection?mood=${selectedMood}&count=${customVerseCount}`);
      return response;
    }
  });

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
      
      const response = await apiRequest(`/api/bible/verses?${params.toString()}`);
      return response;
    }
  });

  const categories = ["all", "Faith", "Hope", "Love", "Peace", "Strength", "Wisdom", "Comfort", "Forgiveness", "Joy", "Purpose", "Grace", "Worship", "Core"];

  // Generate audio routine mutation
  const generateRoutineMutation = useMutation({
    mutationFn: async (routine: { verseIds: number[], voice: string, musicBed: string }) => {
      return await apiRequest("/api/audio/routines/bible-integrated", {
        method: "POST",
        body: routine
      });
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

  const handlePlayAudio = () => {
    if (selectedVerses.length === 0) {
      toast({
        title: "Please select verses first",
        description: "Choose a mood above to get personalized verse recommendations"
      });
      return;
    }

    // If already playing, stop current playback
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    // Use Web Speech API for immediate text-to-speech
    if ('speechSynthesis' in window) {
      // Stop any current speech
      window.speechSynthesis.cancel();
      
      setIsGenerating(true);
      
      // Combine all verses into one text
      const textToSpeak = selectedVerses.map(verse => 
        `${verse.reference}. ${verse.text}`
      ).join('. ');
      
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      
      // Configure voice settings
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
        setIsGenerating(false);
      };
      
      utterance.onend = () => {
        setIsPlaying(false);
        setIsGenerating(false);
      };
      
      utterance.onerror = () => {
        setIsPlaying(false);
        setIsGenerating(false);
        toast({
          title: "Audio not available",
          description: "Please ensure your device volume is turned up and try again"
        });
      };
      
      window.speechSynthesis.speak(utterance);
      
      toast({
        title: "Audio Bible started",
        description: `Reading ${selectedVerses.length} verses aloud`
      });
    } else {
      toast({
        title: "Audio not available",
        description: "Please try refreshing the page or use a different browser"
      });
    }
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Audio Bible Experience</h1>
          <p className="text-lg text-gray-600">AI-powered personalized scripture listening with premium voices</p>
        </div>

        <Tabs defaultValue="mood-selection" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="mood-selection">Mood-Based Selection</TabsTrigger>
            <TabsTrigger value="custom-routine">Custom Routine Builder</TabsTrigger>
          </TabsList>

          <TabsContent value="mood-selection" className="space-y-6">
            {/* Mood Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  How are you feeling today?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {moodOptions.map((mood) => (
                    <Button
                      key={mood.id}
                      variant={selectedMood === mood.id ? "default" : "outline"}
                      className={`h-auto p-4 flex flex-col gap-2 ${mood.color}`}
                      onClick={() => handleMoodSelection(mood.id)}
                    >
                      <span className="text-2xl">{mood.icon}</span>
                      <span className="text-sm font-medium">{mood.label}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Contextual Verse Display */}
            {selectedMood && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Recommended Verses
                    {loadingVerses && <RefreshCw className="h-4 w-4 animate-spin" />}
                  </CardTitle>
                  {contextualVerses?.verses?.length > 0 && (
                    <div className="text-sm text-gray-600">
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
                        <div key={verse.id} className="border rounded-lg p-4 bg-white">
                          <div className="flex justify-between items-start mb-2">
                            <Badge variant="secondary">{verse.reference}</Badge>
                            <Badge variant="outline">{verse.category}</Badge>
                          </div>
                          <p className="text-gray-700 leading-relaxed">{verse.text}</p>
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
                    <p className="text-center py-8 text-gray-500">Select a mood to see personalized verse recommendations</p>
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
                  <p className="text-sm text-gray-600">
                    Listen to your personalized scripture selection with premium voice narration
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Voice Selection */}
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
                                <div className="text-sm text-gray-500">{voice.description}</div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Playback Speed */}
                    <div>
                      <Label htmlFor="playback-speed">Playback Speed</Label>
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
                    <Label htmlFor="volume-control">Volume: {Math.round((volume?.[0] || 0.8) * 100)}%</Label>
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
                  <div className="flex justify-center">
                    <Button
                      onClick={handlePlayAudio}
                      disabled={isGenerating || selectedVerses.length === 0}
                      size="lg"
                      className="px-8"
                      variant={isPlaying ? "secondary" : "default"}
                    >
                      {isGenerating ? (
                        <>
                          <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                          Starting Audio...
                        </>
                      ) : isPlaying ? (
                        <>
                          <Pause className="h-5 w-5 mr-2" />
                          Stop Audio Bible
                        </>
                      ) : (
                        <>
                          <Play className="h-5 w-5 mr-2" />
                          Play Audio Bible ({selectedVerses.length} verses)
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Simple Audio Controls */}
                  {isPlaying && (
                    <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
                      <div className="flex items-center gap-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={togglePlayPause}
                        >
                          {isPlaying ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-blue-900">
                            Now Reading: {selectedVerses.length} Bible verses
                          </div>
                          <div className="text-xs text-blue-700 mt-1">
                            Audio Bible playback active
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            window.speechSynthesis.cancel();
                            setIsPlaying(false);
                          }}
                        >
                          Stop
                        </Button>
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
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-blue-900">
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
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50'
                          }`}
                          onClick={() => toggleVerseSelection(verse)}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <Badge variant={isSelected ? "default" : "secondary"}>
                              {verse.reference}
                            </Badge>
                            <Badge variant="outline">{verse.category}</Badge>
                          </div>
                          <p className="text-gray-700 leading-relaxed">{verse.text}</p>
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
                  <div className="text-center py-8 text-gray-500">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
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