import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { BookOpen, Play, Volume2, Music, Headphones, Sparkles, Heart, Search, Filter } from "lucide-react";
import BibleAudioPlayer from "@/components/BibleAudioPlayer";
import WebSpeechAudioPlayer from "@/components/WebSpeechAudioPlayer";
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
  }, [verses, categoryFilter, searchTerm]);

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

    try {
      const routine = await generateRoutineMutation.mutateAsync({
        verseIds: selectedVerses,
        voice: selectedVoice,
        musicBed: selectedMusicBed
      });
      
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

        <Tabs defaultValue="individual" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="individual">Individual Verses</TabsTrigger>
            <TabsTrigger value="custom-routine">Custom Routine</TabsTrigger>
          </TabsList>

          <TabsContent value="individual" className="space-y-6">
            {/* Individual Verse Player */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Volume2 className="w-5 h-5 text-purple-600" />
                  Single Verse Audio Player
                </CardTitle>
                <CardDescription>
                  Select any verse to hear it with professional voice narration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {filteredVerses.slice(0, 12).map((verse: any) => (
                    <Card 
                      key={verse.id} 
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        currentVerseId === verse.id ? 'ring-2 ring-purple-500' : ''
                      }`}
                      onClick={() => setCurrentVerseId(verse.id)}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm">{verse.reference}</CardTitle>
                          {verse.category && (
                            <Badge variant="secondary" className="text-xs">
                              {verse.category.charAt(0).toUpperCase() + verse.category.slice(1)}
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                          {verse.text}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {currentVerseId && (
                  <BibleAudioPlayer 
                    verseId={currentVerseId}
                    showControls={true}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="custom-routine" className="space-y-6">
            {/* Custom Routine Builder */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  Custom Audio Routine Builder
                </CardTitle>
                <CardDescription>
                  Create a personalized meditation experience with multiple verses
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
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

                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Found {filteredVerses.length} verses • {selectedVerses.length}/10 selected
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
          </TabsContent>
        </Tabs>

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
                <WebSpeechAudioPlayer 
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