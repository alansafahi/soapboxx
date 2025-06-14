import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { BookOpen, Play, Volume2, Music, Headphones, Sparkles, Heart, Search, Filter, X } from "lucide-react";
import BibleAudioPlayer from "@/components/BibleAudioPlayer";
import EnhancedAudioPlayer from "@/components/EnhancedAudioPlayer";
import SimpleAudioTest from "@/components/SimpleAudioTest";
import { apiRequest } from "@/lib/queryClient";

export default function AudioBibleDemo() {
  const [selectedVerses, setSelectedVerses] = useState<number[]>([]);
  const [selectedVoice, setSelectedVoice] = useState("warm-female");
  const [selectedMusicBed, setSelectedMusicBed] = useState("gentle-piano");
  const [currentVerseId, setCurrentVerseId] = useState<number | null>(null);
  const [generatedRoutine, setGeneratedRoutine] = useState<any>(null);
  const [showPlayer, setShowPlayer] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedMood, setSelectedMood] = useState<string>("");
  const [contextualSelection, setContextualSelection] = useState<any>(null);
  const [useContextualSelection, setUseContextualSelection] = useState(false);

  // Get Bible verses for selection
  const { data: verses = [] } = useQuery({
    queryKey: ["/api/bible/verses"],
  });

  // Generate custom Bible routine mutation
  const generateRoutineMutation = useMutation({
    mutationFn: async ({ verseIds, voice, musicBed }: { verseIds: number[]; voice: string; musicBed: string }) => {
      return await apiRequest("/api/audio/routines/bible-integrated", {
        method: "POST",
        body: {
          verseIds,
          routineType: "custom",
          voice,
          musicBed
        }
      });
    },
  });

  // Contextual scripture selection mutation
  const contextualSelectionMutation = useMutation({
    mutationFn: async ({ mood, count, categories }: { mood: string; count?: number; categories?: string[] }) => {
      const params = new URLSearchParams();
      if (mood) params.append('mood', mood);
      if (count) params.append('count', count.toString());
      if (categories && categories.length > 0) {
        categories.forEach(cat => params.append('categories', cat));
      }
      
      return await apiRequest(`/api/bible/contextual-selection?${params.toString()}`);
    },
    onSuccess: (data) => {
      setContextualSelection(data);
      if (data.verses && data.verses.length > 0) {
        setSelectedVerses(data.verses.map((v: any) => v.id));
        setUseContextualSelection(true);
      }
    },
  });

  const voiceOptions = [
    { value: "warm-female", label: "Warm Female", description: "Nurturing and comforting", icon: "👩" },
    { value: "gentle-male", label: "Gentle Male", description: "Calm and reassuring", icon: "👨" },
    { value: "peaceful-female", label: "Peaceful Female", description: "Meditative and serene", icon: "🧘‍♀️" },
    { value: "authoritative-male", label: "Authoritative Male", description: "Strong and confident", icon: "👨‍🏫" }
  ];

  const musicBedOptions = [
    { value: "gentle-piano", label: "Gentle Piano", description: "Soft piano melodies", icon: "🎹" },
    { value: "nature-sounds", label: "Nature Sounds", description: "Peaceful outdoor ambience", icon: "🌿" },
    { value: "ambient-strings", label: "Ambient Strings", description: "Ethereal string arrangements", icon: "🎻" },
    { value: "worship-instrumental", label: "Worship Instrumental", description: "Contemporary worship background", icon: "🎵" }
  ];

  // Filter and search verses
  const filteredVerses = useMemo(() => {
    if (!Array.isArray(verses)) return [];
    
    // If we have contextual selection and user wants to use it, use those verses
    if (useContextualSelection && contextualSelection?.verses) {
      return contextualSelection.verses;
    }
    
    let filtered = verses;
    
    // Apply category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter((verse: any) => 
        verse.category?.toLowerCase() === categoryFilter.toLowerCase() ||
        verse.tags?.includes(categoryFilter)
      );
    }
    
    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter((verse: any) => 
        verse.reference?.toLowerCase().includes(search) ||
        verse.text?.toLowerCase().includes(search) ||
        verse.category?.toLowerCase().includes(search)
      );
    }
    
    return filtered.slice(0, 50); // Limit to 50 verses for performance
  }, [verses, categoryFilter, searchTerm, useContextualSelection, contextualSelection]);

  // Get unique categories from verses
  const categories = useMemo(() => {
    if (!Array.isArray(verses)) return [];
    const cats = verses.map((verse: any) => verse.category).filter(Boolean);
    return Array.from(new Set(cats));
  }, [verses]);

  const handleVerseSelection = (verseId: number, checked: boolean) => {
    if (checked) {
      setSelectedVerses(prev => [...prev, verseId]);
    } else {
      setSelectedVerses(prev => prev.filter(id => id !== verseId));
    }
  };

  const generateCustomRoutine = async () => {
    if (selectedVerses.length === 0) return;

    // Debug logging for selected verses
    console.log('Frontend - Selected verse IDs:', selectedVerses);
    
    // Get verse details for debugging
    const selectedVerseDetails = filteredVerses.filter((verse: any) => 
      selectedVerses.includes(verse.id)
    );
    console.log('Frontend - Selected verse details:', selectedVerseDetails.map((v: any) => ({
      id: v.id,
      reference: v.reference,
      text: v.text?.substring(0, 50) + '...'
    })));

    try {
      const routine = await generateRoutineMutation.mutateAsync({
        verseIds: selectedVerses,
        voice: selectedVoice,
        musicBed: selectedMusicBed
      });
      
      console.log('Frontend - Generated routine steps:', routine.steps?.map((step: any) => ({
        id: step.id,
        title: step.title,
        content: step.content?.substring(0, 50) + '...'
      })));
      
      setGeneratedRoutine(routine);
      setShowPlayer(true);
    } catch (error) {
      console.error("Error generating routine:", error);
    }
  };

  const getThemeColor = (theme: string) => {
    switch (theme) {
      case "love": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "strength": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "comfort": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "purpose": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "hope": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
              <BookOpen className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Audio Bible Experience
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Create personalized audio devotionals by selecting verses and customizing voice and music settings
          </p>
        </div>

        <div className="space-y-6">
            {/* Custom Routine Builder */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  Audio Bible Experience
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Contextual Scripture Selection */}
                <div className="space-y-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    <h4 className="font-medium text-gray-900 dark:text-white">AI-Powered Scripture Selection</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                        Current Mood/Need
                      </label>
                      <Select value={selectedMood} onValueChange={setSelectedMood}>
                        <SelectTrigger>
                          <Heart className="w-4 h-4 mr-2" />
                          <SelectValue placeholder="How are you feeling today?" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="anxious">Feeling anxious or worried</SelectItem>
                          <SelectItem value="grateful">Thankful and grateful</SelectItem>
                          <SelectItem value="seeking-peace">Seeking peace and calm</SelectItem>
                          <SelectItem value="needing-strength">Needing strength and courage</SelectItem>
                          <SelectItem value="joyful">Celebrating and joyful</SelectItem>
                          <SelectItem value="struggling">Going through difficulties</SelectItem>
                          <SelectItem value="seeking-guidance">Seeking direction and wisdom</SelectItem>
                          <SelectItem value="hopeful">Looking forward with hope</SelectItem>
                          <SelectItem value="reflective">In a contemplative mood</SelectItem>
                          <SelectItem value="seeking-purpose">Searching for purpose</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-end">
                      <Button
                        onClick={() => {
                          if (selectedMood) {
                            contextualSelectionMutation.mutate({
                              mood: selectedMood,
                              count: 10,
                              categories: categoryFilter !== 'all' ? [categoryFilter] : undefined
                            });
                          }
                        }}
                        disabled={!selectedMood || contextualSelectionMutation.isPending}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        {contextualSelectionMutation.isPending ? (
                          <>Selecting Verses...</>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Get Personalized Verses
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {contextualSelection && (
                    <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded border">
                      <div className="text-sm space-y-1">
                        <p><strong>Liturgical Season:</strong> {contextualSelection.context.liturgicalSeason}</p>
                        <p><strong>Spiritual Theme:</strong> {contextualSelection.context.spiritualTheme}</p>
                        <p><strong>Selection Reason:</strong> {contextualSelection.context.selectionReason}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Search and Filter Interface */}
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          placeholder="Search by reference, text, or theme..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="sm:w-48">
                      <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger>
                          <Filter className="w-4 h-4 mr-2" />
                          <SelectValue placeholder="Filter by theme" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Themes</SelectItem>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category.charAt(0).toUpperCase() + category.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {useContextualSelection ? (
                        <span className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-purple-600" />
                          AI-selected {filteredVerses.length} verses for your mood • {selectedVerses.length}/10 selected
                        </span>
                      ) : (
                        <span>Found {filteredVerses.length} verses • {selectedVerses.length}/10 selected</span>
                      )}
                    </div>
                    {useContextualSelection && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setUseContextualSelection(false);
                          setContextualSelection(null);
                          setSelectedVerses([]);
                        }}
                        className="text-xs"
                      >
                        <Filter className="w-3 h-3 mr-1" />
                        Clear AI Selection
                      </Button>
                    )}
                  </div>
                </div>

                {/* Verse Selection */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Choose Your Scripture ({selectedVerses.length}/10)
                  </h3>
                  <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
                    {filteredVerses.map((verse: any) => (
                      <div 
                        key={verse.id}
                        className="flex items-start space-x-3 p-4 bg-white dark:bg-gray-800 rounded-lg border"
                      >
                        <Checkbox
                          id={`verse-${verse.id}`}
                          checked={selectedVerses.includes(verse.id)}
                          onCheckedChange={(checked) => handleVerseSelection(verse.id, !!checked)}
                          disabled={!selectedVerses.includes(verse.id) && selectedVerses.length >= 10}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <label 
                              htmlFor={`verse-${verse.id}`}
                              className="text-sm font-medium text-gray-900 dark:text-white cursor-pointer"
                            >
                              {verse.reference}
                            </label>
                            {verse.category && (
                              <Badge variant="secondary" className="text-xs">
                                {verse.category.charAt(0).toUpperCase() + verse.category.slice(1)}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {verse.text}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Voice and Music Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Voice Selection
                    </h3>
                    <div className="space-y-2">
                      {voiceOptions.map((option) => (
                        <div
                          key={option.value}
                          className={`p-3 border rounded-lg cursor-pointer transition-all ${
                            selectedVoice === option.value
                              ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                          }`}
                          onClick={() => setSelectedVoice(option.value)}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{option.icon}</span>
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">
                                {option.label}
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                {option.description}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Background Music
                    </h3>
                    <div className="space-y-2">
                      {musicBedOptions.map((option) => (
                        <div
                          key={option.value}
                          className={`p-3 border rounded-lg cursor-pointer transition-all ${
                            selectedMusicBed === option.value
                              ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                          }`}
                          onClick={() => setSelectedMusicBed(option.value)}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{option.icon}</span>
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">
                                {option.label}
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                {option.description}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Generate Button */}
                <div className="flex justify-center pt-4">
                  <Button
                    onClick={generateCustomRoutine}
                    disabled={selectedVerses.length === 0 || generateRoutineMutation.isPending}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg"
                  >
                    {generateRoutineMutation.isPending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Creating Routine...
                      </>
                    ) : (
                      <>
                        <Heart className="w-5 h-5 mr-2" />
                        Create Audio Experience
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Generated Routine Preview */}
            {generatedRoutine && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Headphones className="w-5 h-5 text-purple-600" />
                    Your Custom Audio Routine
                  </CardTitle>
                  <CardDescription>
                    {generatedRoutine.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {generatedRoutine.steps?.length || 0}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Steps</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {Math.ceil(generatedRoutine.totalDuration / 60)}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Minutes</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {selectedVerses.length}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Verses</div>
                    </div>
                  </div>

                  <Button
                    onClick={() => setShowPlayer(true)}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Begin Audio Journey
                  </Button>
                </CardContent>
              </Card>
            )}
        </div>

        {/* Audio Routine Player Modal */}
        {showPlayer && generatedRoutine && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Your Custom Audio Experience</h2>
                  <Button 
                    variant="ghost" 
                    onClick={() => {
                      setShowPlayer(false);
                      setGeneratedRoutine(null);
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </Button>
                </div>
                <EnhancedAudioPlayer 
                  routine={generatedRoutine}
                  autoStart={true}
                  onComplete={() => {
                    setShowPlayer(false);
                    setGeneratedRoutine(null);
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}