import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, SkipForward, SkipBack, Volume2, Settings, BookOpen } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface BibleAudioPlayerProps {
  verseId?: number;
  autoplay?: boolean;
  showControls?: boolean;
}

export default function BibleAudioPlayer({ 
  verseId, 
  autoplay = false, 
  showControls = true 
}: BibleAudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [selectedVoice, setSelectedVoice] = useState("warm-female");
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [selectedMusicBed, setSelectedMusicBed] = useState("gentle-piano");
  const [showSettings, setShowSettings] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Get Bible verse data
  const { data: verse } = useQuery({
    queryKey: ["/api/bible/verses", verseId],
    enabled: !!verseId,
  });

  // Generate audio mutation
  const generateAudioMutation = useMutation({
    mutationFn: async ({ text, voice, musicBed }: { text: string; voice: string; musicBed?: string }) => {
      return await apiRequest("POST", "/api/audio/generate", { text, voice, musicBed });
    },
  });

  const voiceOptions = [
    { value: "warm-female", label: "Warm Female", description: "Nurturing and comforting" },
    { value: "gentle-male", label: "Gentle Male", description: "Calm and reassuring" },
    { value: "peaceful-female", label: "Peaceful Female", description: "Meditative and serene" },
    { value: "authoritative-male", label: "Authoritative Male", description: "Strong and confident" }
  ];

  const musicBedOptions = [
    { value: "none", label: "No Music", description: "Voice only" },
    { value: "gentle-piano", label: "Gentle Piano", description: "Soft piano melodies" },
    { value: "nature-sounds", label: "Nature Sounds", description: "Peaceful outdoor ambience" },
    { value: "ambient-strings", label: "Ambient Strings", description: "Ethereal string arrangements" },
    { value: "worship-instrumental", label: "Worship Instrumental", description: "Contemporary worship background" }
  ];

  const playAudio = async () => {
    if (!verse) return;

    try {
      const verseText = `${verse.reference}. ${verse.text}`;
      const audioData = await generateAudioMutation.mutateAsync({
        text: verseText,
        voice: selectedVoice,
        musicBed: selectedMusicBed === "none" ? undefined : selectedMusicBed
      });

      if (audioRef.current) {
        audioRef.current.src = audioData.audioUrl;
        audioRef.current.load();
        audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      if (audioRef.current.src) {
        audioRef.current.play();
        setIsPlaying(true);
      } else {
        playAudio();
      }
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const handleSpeedChange = (value: number[]) => {
    const newSpeed = value[0];
    setPlaybackSpeed(newSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = newSpeed;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (autoplay && verse) {
      playAudio();
    }
  }, [verse, autoplay]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('loadedmetadata', handleLoadedMetadata);
      audio.addEventListener('ended', () => setIsPlaying(false));

      return () => {
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audio.removeEventListener('ended', () => setIsPlaying(false));
      };
    }
  }, []);

  if (!verse) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2 text-gray-500 dark:text-gray-400">
            <BookOpen className="w-5 h-5" />
            <span>Select a Bible verse to enable audio playback</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-purple-600" />
            <span>Audio Bible Player</span>
          </CardTitle>
          <Badge variant="outline" className="text-purple-700 border-purple-300">
            {verse.reference}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Verse Text */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-l-4 border-purple-500">
          <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
            {verse.text}
          </p>
          <p className="text-sm text-purple-600 dark:text-purple-400 mt-2 font-medium">
            — {verse.reference}
          </p>
        </div>

        {showControls && (
          <>
            {/* Main Controls */}
            <div className="flex items-center justify-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (audioRef.current) {
                    audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10);
                  }
                }}
                disabled={!duration}
              >
                <SkipBack className="w-4 h-4" />
              </Button>

              <Button
                onClick={togglePlayPause}
                className="bg-purple-600 hover:bg-purple-700 text-white w-12 h-12 rounded-full"
                disabled={generateAudioMutation.isPending}
              >
                {generateAudioMutation.isPending ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5" />
                )}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (audioRef.current) {
                    audioRef.current.currentTime = Math.min(duration, audioRef.current.currentTime + 10);
                  }
                }}
                disabled={!duration}
              >
                <SkipForward className="w-4 h-4" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>

            {/* Progress Bar */}
            {duration > 0 && (
              <div className="space-y-2">
                <Slider
                  value={[currentTime]}
                  max={duration}
                  step={1}
                  onValueChange={handleSeek}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>
            )}

            {/* Settings Panel */}
            {showSettings && (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 space-y-4 border">
                <h4 className="font-medium text-gray-900 dark:text-white">Audio Settings</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Voice
                    </label>
                    <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {voiceOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div>
                              <div className="font-medium">{option.label}</div>
                              <div className="text-xs text-gray-500">{option.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Background Music
                    </label>
                    <Select value={selectedMusicBed} onValueChange={setSelectedMusicBed}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {musicBedOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div>
                              <div className="font-medium">{option.label}</div>
                              <div className="text-xs text-gray-500">{option.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Volume: {Math.round(volume * 100)}%
                    </label>
                    <Slider
                      value={[volume]}
                      max={1}
                      step={0.1}
                      onValueChange={handleVolumeChange}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Speed: {playbackSpeed}x
                    </label>
                    <Slider
                      value={[playbackSpeed]}
                      min={0.5}
                      max={2.0}
                      step={0.1}
                      onValueChange={handleSpeedChange}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        <audio
          ref={audioRef}
          preload="metadata"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
        />
      </CardContent>
    </Card>
  );
}