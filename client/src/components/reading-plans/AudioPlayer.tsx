import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Pause, Square, Volume2, Loader2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { ReadingPlanDay } from '@shared/schema';

interface AudioPlayerProps {
  day: ReadingPlanDay;
  planName: string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ day, planName }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState("warm-female");
  const [audioError, setAudioError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();

  // Generate audio for the scripture text
  const generateAudio = async () => {
    setAudioLoading(true);
    setAudioError(null);
    
    try {
      const audioText = `${day.scriptureReference}. ${day.scriptureText}`;
      
      const response = await fetch('/api/audio/bible/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verseText: audioText,
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
          description: "Scripture audio has been generated successfully."
        });
      } else {
        throw new Error('Failed to generate audio');
      }
    } catch (error) {
      setAudioError('Unable to generate audio. Please try again.');
      toast({
        title: "Audio generation failed",
        description: "Unable to generate audio. Please try again.",
        variant: "destructive"
      });
    } finally {
      setAudioLoading(false);
    }
  };

  // Audio playback controls
  const playAudio = async () => {
    if (!audioRef.current?.src) {
      await generateAudio();
      if (audioRef.current?.src) {
        audioRef.current.play();
      }
    } else {
      audioRef.current.play();
    }
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
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
    const handleError = () => {
      setIsPlaying(false);
      setAudioError('Audio playback error occurred');
    };

    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('error', handleError);
    };
  }, []);

  return (
    <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-800 dark:text-purple-200">
          <Volume2 className="w-5 h-5" />
          Audio Bible
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Scripture Reference */}
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Listen to today's scripture: <span className="font-semibold text-purple-600 dark:text-purple-400">{day.scriptureReference}</span>
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
            onClick={playAudio}
            disabled={audioLoading || isPlaying}
            className="bg-green-600 hover:bg-green-700"
            size="sm"
          >
            {audioLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                {audioRef.current?.src ? 'Play' : 'Generate & Play'}
              </>
            )}
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
            <span className="text-sm text-purple-600 dark:text-purple-400 ml-2 flex items-center gap-1">
              <Volume2 className="w-4 h-4" />
              Playing...
            </span>
          )}
        </div>

        {/* Error Display */}
        {audioError && (
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
            <AlertCircle className="w-4 h-4" />
            {audioError}
          </div>
        )}

        {/* Hidden Audio Element */}
        <audio ref={audioRef} className="hidden" />
      </CardContent>
    </Card>
  );
};

export default AudioPlayer;