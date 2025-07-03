import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward, Settings } from 'lucide-react';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';

interface AudioTrack {
  id: string;
  title: string;
  type: 'voice' | 'music' | 'nature' | 'ambient';
  url: string;
  duration: number;
  voice?: {
    gender: 'male' | 'female';
    accent: 'american' | 'british' | 'australian';
    tone: 'warm' | 'gentle' | 'authoritative' | 'peaceful';
  };
  tags: string[];
}

interface AudioPlayerProps {
  tracks: AudioTrack[];
  currentTrackId?: string;
  autoplay?: boolean;
  showPlaylist?: boolean;
  routine?: {
    name: string;
    sequence: string[];
    autoAdvance: boolean;
  };
  onTrackChange?: (trackId: string) => void;
  onComplete?: () => void;
}

export default function AudioPlayer({ 
  tracks, 
  currentTrackId, 
  autoplay = false, 
  showPlaylist = true,
  routine,
  onTrackChange,
  onComplete 
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState('warm-female');
  const [musicBed, setMusicBed] = useState('gentle-piano');
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);

  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const currentTrack = tracks.find(t => t.id === currentTrackId) || tracks[currentIndex];

  const voiceOptions = [
    { id: 'warm-female', label: 'Sarah (Warm, Female)', accent: 'american', tone: 'warm' },
    { id: 'gentle-male', label: 'David (Gentle, Male)', accent: 'american', tone: 'gentle' },
    { id: 'peaceful-female', label: 'Grace (Peaceful, Female)', accent: 'british', tone: 'peaceful' },
    { id: 'authoritative-male', label: 'Michael (Strong, Male)', accent: 'american', tone: 'authoritative' },
    { id: 'soothing-female', label: 'Emma (Soothing, Female)', accent: 'australian', tone: 'warm' }
  ];

  const musicBeds = [
    { id: 'gentle-piano', label: 'Gentle Piano', description: 'Soft, meditative piano melodies' },
    { id: 'nature-sounds', label: 'Nature Sounds', description: 'Birds, water, gentle breeze' },
    { id: 'ambient-strings', label: 'Ambient Strings', description: 'Ethereal string arrangements' },
    { id: 'worship-instrumental', label: 'Worship Instrumental', description: 'Contemporary worship backing' },
    { id: 'silence', label: 'No Music', description: 'Voice only, no background music' }
  ];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [volume, isMuted, playbackSpeed]);

  useEffect(() => {
    if (autoplay && currentTrack) {
      handlePlay();
    }
  }, [autoplay, currentTrack]);

  const handlePlay = () => {
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
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
    if (audioRef.current && duration > 0) {
      const newTime = (value[0] / 100) * duration;
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleNext = () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < tracks.length) {
      setCurrentIndex(nextIndex);
      onTrackChange?.(tracks[nextIndex].id);
    } else if (routine?.autoAdvance) {
      onComplete?.();
    }
  };

  const handlePrevious = () => {
    const prevIndex = currentIndex - 1;
    if (prevIndex >= 0) {
      setCurrentIndex(prevIndex);
      onTrackChange?.(tracks[prevIndex].id);
    }
  };

  const handleEnded = () => {
    if (routine?.autoAdvance) {
      handleNext();
    } else {
      setIsPlaying(false);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <Card className="w-full max-w-2xl mx-auto bg-white dark:bg-gray-800 shadow-lg">
      <CardContent className="p-6 space-y-6">
        {/* Current Track Info */}
        {currentTrack && (
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {currentTrack.title}
            </h3>
            <div className="flex justify-center gap-2">
              <Badge variant="secondary" className="capitalize">
                {currentTrack.type}
              </Badge>
              {currentTrack.voice && (
                <Badge variant="outline">
                  {currentTrack.voice.tone} {currentTrack.voice.gender}
                </Badge>
              )}
            </div>
            {routine && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Part of: {routine.name} ({currentIndex + 1} of {tracks.length})
              </p>
            )}
          </div>
        )}

        {/* Audio Element */}
        <audio
          ref={audioRef}
          src={currentTrack?.url}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
          preload="metadata"
        />

        {/* Progress Bar */}
        <div className="space-y-2">
          <Slider
            value={[progress]}
            onValueChange={handleSeek}
            max={100}
            step={0.1}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Main Controls */}
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
          >
            <SkipBack className="h-4 w-4" />
          </Button>

          <Button
            size="lg"
            onClick={isPlaying ? handlePause : handlePlay}
            className="w-12 h-12 rounded-full bg-purple-600 hover:bg-purple-700"
          >
            {isPlaying ? (
              <Pause className="h-6 w-6 text-white" />
            ) : (
              <Play className="h-6 w-6 text-white ml-1" />
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleNext}
            disabled={currentIndex === tracks.length - 1 && !routine?.autoAdvance}
          >
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>

        {/* Volume and Settings */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMuted(!isMuted)}
            >
              {isMuted ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>
            <Slider
              value={[isMuted ? 0 : volume * 100]}
              onValueChange={(value) => {
                const newVolume = value[0] / 100;
                setVolume(newVolume);
                setIsMuted(newVolume === 0);
              }}
              max={100}
              step={1}
              className="w-20"
            />
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="border-t pt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Voice Selection</label>
                <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {voiceOptions.map((voice) => (
                      <SelectItem key={voice.id} value={voice.id}>
                        {voice.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Music Bed</label>
                <Select value={musicBed} onValueChange={setMusicBed}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {musicBeds.map((music) => (
                      <SelectItem key={music.id} value={music.id}>
                        {music.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Playback Speed</label>
              <div className="flex items-center gap-4">
                <Slider
                  value={[playbackSpeed]}
                  onValueChange={(value) => setPlaybackSpeed(value[0])}
                  min={0.5}
                  max={2.0}
                  step={0.1}
                  className="flex-1"
                />
                <span className="text-sm w-12">{playbackSpeed.toFixed(1)}x</span>
              </div>
            </div>
          </div>
        )}

        {/* Playlist */}
        {showPlaylist && tracks.length > 1 && (
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium mb-2">Playlist</h4>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {tracks.map((track, index) => (
                <div
                  key={track.id}
                  className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                    index === currentIndex
                      ? 'bg-purple-100 dark:bg-purple-900/20'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => {
                    setCurrentIndex(index);
                    onTrackChange?.(track.id);
                  }}
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium">{track.title}</p>
                    <p className="text-xs text-gray-500 capitalize">{track.type}</p>
                  </div>
                  <span className="text-xs text-gray-400">
                    {formatTime(track.duration)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}