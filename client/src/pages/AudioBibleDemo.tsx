import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { BookOpen, Play, Volume2, Music, Headphones, Sparkles, Heart } from "lucide-react";
import BibleAudioPlayer from "@/components/BibleAudioPlayer";
import AudioRoutinePlayer from "@/components/AudioRoutinePlayer";
import { apiRequest } from "@/lib/queryClient";

export default function AudioBibleDemo() {
  const [selectedVerses, setSelectedVerses] = useState<number[]>([]);
  const [selectedVoice, setSelectedVoice] = useState("warm-female");
  const [selectedMusicBed, setSelectedMusicBed] = useState("gentle-piano");
  const [currentVerseId, setCurrentVerseId] = useState<number | null>(null);
  const [generatedRoutine, setGeneratedRoutine] = useState<any>(null);
  const [showPlayer, setShowPlayer] = useState(false);

  // Get Bible verses for selection
  const { data: verses } = useQuery({
    queryKey: ["/api/bible/verses"],
  });

  // Generate custom Bible routine mutation
  const generateRoutineMutation = useMutation({
    mutationFn: async ({ verseIds, voice, musicBed }: { verseIds: number[]; voice: string; musicBed: string }) => {
      return await apiRequest("/api/audio/routines/bible-integrated", {
        method: "POST",
        body: JSON.stringify({
          verseIds,
          routineType: "custom",
          voice,
          musicBed
        }),
        headers: { "Content-Type": "application/json" }
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

  const popularVerses = [
    { id: 1, reference: "John 3:16", text: "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.", theme: "love" },
    { id: 2, reference: "Philippians 4:13", text: "I can do all this through him who gives me strength.", theme: "strength" },
    { id: 3, reference: "Psalm 23:1", text: "The Lord is my shepherd, I lack nothing.", theme: "comfort" },
    { id: 4, reference: "Romans 8:28", text: "And we know that in all things God works for the good of those who love him, who have been called according to his purpose.", theme: "purpose" },
    { id: 5, reference: "Jeremiah 29:11", text: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, to give you hope and a future.", theme: "hope" }
  ];

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
                  {popularVerses.map((verse) => (
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
                          <Badge className={getThemeColor(verse.theme)}>
                            {verse.theme}
                          </Badge>
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
                {/* Verse Selection */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Select Verses ({selectedVerses.length}/5)
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    {popularVerses.map((verse) => (
                      <div 
                        key={verse.id}
                        className="flex items-start space-x-3 p-4 bg-white dark:bg-gray-800 rounded-lg border"
                      >
                        <Checkbox
                          id={`verse-${verse.id}`}
                          checked={selectedVerses.includes(verse.id)}
                          onCheckedChange={(checked) => handleVerseSelection(verse.id, !!checked)}
                          disabled={!selectedVerses.includes(verse.id) && selectedVerses.length >= 5}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <label 
                              htmlFor={`verse-${verse.id}`}
                              className="text-sm font-medium text-gray-900 dark:text-white cursor-pointer"
                            >
                              {verse.reference}
                            </label>
                            <Badge className={getThemeColor(verse.theme)}>
                              {verse.theme}
                            </Badge>
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
          <AudioRoutinePlayer
            routine={generatedRoutine}
            isOpen={showPlayer}
            onClose={() => {
              setShowPlayer(false);
              setGeneratedRoutine(null);
            }}
          />
        )}
      </div>
    </div>
  );
}