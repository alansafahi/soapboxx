import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Play, Pause, Square, Volume2, Search, BookOpen } from "lucide-react";
import { useToast } from "../hooks/use-toast";

interface BibleVerse {
  reference: string;
  text: string;
  version: string;
  source?: string;
}

export default function SimpleAudioBible() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<BibleVerse[]>([]);
  const [selectedVerse, setSelectedVerse] = useState<BibleVerse | null>(null);
  const [loading, setLoading] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState("warm-female");
  const audioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();

  // Search Bible verses using the OpenAI-powered lookup system
  const searchVerses = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      // Use the existing three-tier Bible lookup system
      const response = await fetch(`/api/bible/search?q=${encodeURIComponent(query.trim())}&limit=10`);
      
      if (response.ok) {
        const results = await response.json();
        setSearchResults(results || []);
      } else {
        // Fallback to direct verse lookup for specific references like "psalm 1:1"
        const lookupResponse = await fetch('/api/bible/lookup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reference: query.trim(), version: 'NIV' })
        });
        
        if (lookupResponse.ok) {
          const result = await lookupResponse.json();
          if (result.success && result.verse) {
            setSearchResults([result.verse]);
          } else {
            setSearchResults([]);
            toast({
              title: "No verses found",
              description: `Could not find "${query}". Try a different search term or verse reference.`,
              variant: "destructive"
            });
          }
        } else {
          setSearchResults([]);
          toast({
            title: "Search failed",
            description: "Unable to search Bible verses. Please try again.",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      setSearchResults([]);
      toast({
        title: "Search error",
        description: "An error occurred while searching. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Generate audio for selected verse
  const generateAudio = async (verse: BibleVerse) => {
    setAudioLoading(true);
    try {
      const response = await fetch('/api/audio/bible/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verseText: `${verse.reference}. ${verse.text}`,
          voice: selectedVoice,
          musicBed: false
        })
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        
        if (audioRef.current) {
          audioRef.current.src = audioUrl;
          audioRef.current.load();
        }
        
        toast({
          title: "Audio ready",
          description: "Bible verse audio has been generated successfully."
        });
      } else {
        toast({
          title: "Audio generation failed",
          description: "Unable to generate audio. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Audio error",
        description: "An error occurred while generating audio.",
        variant: "destructive"
      });
    } finally {
      setAudioLoading(false);
    }
  };

  // Audio playback controls
  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  // Handle audio events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => setIsPlaying(false);
    const handlePause = () => setIsPlaying(false);
    const handlePlay = () => setIsPlaying(true);

    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('play', handlePlay);

    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('play', handlePlay);
    };
  }, []);

  // Handle search input
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    searchVerses(query);
  };

  // Select verse for audio
  const selectVerse = (verse: BibleVerse) => {
    setSelectedVerse(verse);
    stopAudio(); // Stop any currently playing audio
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-purple-600" />
            Audio Bible
          </CardTitle>
          <p className="text-gray-600">Search and listen to Bible verses with AI-powered voice narration</p>
        </CardHeader>
      </Card>

      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Manual Scripture Selection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Input
              placeholder="Search verses (e.g., John 3:16, Psalm 23:1, love, hope...)"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={() => searchVerses(searchQuery)}
              disabled={loading || !searchQuery.trim()}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {loading ? "Searching..." : "Search"}
            </Button>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              <h3 className="font-semibold text-gray-900">Available Verses</h3>
              {searchResults.map((verse, index) => (
                <div
                  key={index}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedVerse?.reference === verse.reference
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                  }`}
                  onClick={() => selectVerse(verse)}
                >
                  <div className="font-semibold text-purple-700">{verse.reference}</div>
                  <div className="text-gray-700 text-sm mt-1">{verse.text}</div>
                  {verse.source && (
                    <div className="text-xs text-gray-500 mt-1">Source: {verse.source}</div>
                  )}
                </div>
              ))}
            </div>
          )}

          {searchQuery && !loading && searchResults.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No verses found. Try adjusting your search or filter.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selected Verse & Audio Controls */}
      {selectedVerse && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="w-5 h-5" />
              Now Playing: {selectedVerse.reference}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Selected Verse Display */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="font-semibold text-purple-700 mb-2">{selectedVerse.reference}</div>
              <div className="text-gray-800 leading-relaxed">{selectedVerse.text}</div>
              {selectedVerse.source && (
                <div className="text-xs text-gray-500 mt-2">Source: {selectedVerse.source}</div>
              )}
            </div>

            {/* Voice Selection */}
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium">Voice:</label>
              <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="warm-female">Warm Female</SelectItem>
                  <SelectItem value="gentle-male">Gentle Male</SelectItem>
                  <SelectItem value="peaceful-female">Peaceful Female</SelectItem>
                  <SelectItem value="authoritative-male">Authoritative Male</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Audio Controls */}
            <div className="flex items-center gap-3">
              <Button
                onClick={() => generateAudio(selectedVerse)}
                disabled={audioLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                {audioLoading ? "Generating..." : "Generate Audio"}
              </Button>

              <Button
                onClick={playAudio}
                disabled={!audioRef.current?.src || isPlaying}
                variant="outline"
                size="sm"
              >
                <Play className="w-4 h-4" />
              </Button>

              <Button
                onClick={pauseAudio}
                disabled={!isPlaying}
                variant="outline"
                size="sm"
              >
                <Pause className="w-4 h-4" />
              </Button>

              <Button
                onClick={stopAudio}
                disabled={!audioRef.current?.src}
                variant="outline"
                size="sm"
              >
                <Square className="w-4 h-4" />
              </Button>

              {isPlaying && (
                <span className="text-sm text-gray-600 ml-2">Playing...</span>
              )}
            </div>

            {/* Hidden Audio Element */}
            <audio ref={audioRef} className="hidden" />
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-gray-600">
            <p className="text-sm">
              Search for any Bible verse by reference (e.g., "John 3:16", "Psalm 23:1") or by topic (e.g., "love", "hope", "faith").
              <br />
              Powered by OpenAI API with access to the complete Bible.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}