import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Play, Headphones, Volume2, CheckCircle, Square, Mic } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AudioRoutine {
  id: number;
  name: string;
  description: string;
  category: string;
  totalDuration: number;
}

export default function AudioRoutines() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRoutineId, setSelectedRoutineId] = useState<number | null>(null);
  const [playingRoutine, setPlayingRoutine] = useState<number | null>(null);
  const [currentAudioContext, setCurrentAudioContext] = useState<AudioContext | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<string>('nova');
  const { toast } = useToast();

  const premiumVoices = [
    { id: 'nova', name: 'Nova', description: 'Warm, calming female voice - perfect for meditation' },
    { id: 'shimmer', name: 'Shimmer', description: 'Gentle, peaceful female voice - ideal for spiritual content' },
    { id: 'alloy', name: 'Alloy', description: 'Balanced, clear voice - versatile for all routines' },
    { id: 'echo', name: 'Echo', description: 'Resonant, authoritative voice - great for scripture reading' },
    { id: 'fable', name: 'Fable', description: 'Storytelling voice - engaging for guided meditations' },
    { id: 'onyx', name: 'Onyx', description: 'Deep, grounding voice - powerful for prayer guidance' }
  ];

  const { data: routines = [], isLoading, error } = useQuery<AudioRoutine[]>({
    queryKey: ['/api/audio/routines'],
    enabled: true
  });

  console.log('AudioRoutines component rendering', { routines, isLoading, error });

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCategoryIcon = (category: string): string => {
    switch (category) {
      case 'morning': return '🌅';
      case 'evening': return '🌙';
      case 'midday': return '☀️';
      default: return '✨';
    }
  };

  const getCategoryColor = (category: string): string => {
    switch (category) {
      case 'morning': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'evening': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'midday': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const handleStartRoutine = (routine: AudioRoutine, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Starting routine:', routine.name);
    setPlayingRoutine(routine.id);
    
    // Beautiful toast notification
    toast({
      title: "🎵 Starting Audio Routine",
      description: `"${routine.name}" - ${routine.description}`,
      duration: 4000,
    });
    
    // Start actual audio playback
    startAudioRoutine(routine);
  };

  const startAudioRoutine = async (routine: AudioRoutine) => {
    try {
      // iOS-compatible AudioContext creation
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContextClass({
        sampleRate: 44100, // Standard sample rate for better iOS compatibility
        latencyHint: 'interactive'
      });
      
      // Critical iOS fix: Ensure AudioContext is running
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }
      
      // Additional iOS check - create a silent buffer to "unlock" audio
      const silentBuffer = audioContext.createBuffer(1, 1, audioContext.sampleRate);
      const silentSource = audioContext.createBufferSource();
      silentSource.buffer = silentBuffer;
      silentSource.connect(audioContext.destination);
      silentSource.start();
      
      setCurrentAudioContext(audioContext);
      
      // Generate peaceful ambient soundscape
      const masterGain = audioContext.createGain();
      masterGain.connect(audioContext.destination);
      masterGain.gain.setValueAtTime(0, audioContext.currentTime);
      masterGain.gain.linearRampToValueAtTime(0.08, audioContext.currentTime + 2);
      
      // Create highly contrasting chord progression for clear variation
      const backgroundTones = [
        { freq: 196.00, type: 'triangle' as OscillatorType }, // G note - grounding
        { freq: 261.63, type: 'sine' as OscillatorType },     // C note - peace  
        { freq: 329.63, type: 'triangle' as OscillatorType }, // E note - hope
        { freq: 293.66, type: 'sine' as OscillatorType }      // D note - reflection
      ];
      
      const oscillators: OscillatorNode[] = [];
      let toneIndex = 0;
      
      // Create very noticeable background tone sequence
      const createBackgroundTone = (tone: typeof backgroundTones[0], startTime: number, duration: number) => {
        console.log(`Playing tone ${tone.freq}Hz (${tone.type}) at time ${startTime.toFixed(2)}`);
        
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        
        osc.frequency.setValueAtTime(tone.freq, startTime);
        osc.type = tone.type;
        
        // Very clear volume envelope for distinct changes
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.25, startTime + 0.5);
        gain.gain.linearRampToValueAtTime(0.15, startTime + duration/2);
        gain.gain.linearRampToValueAtTime(0.20, startTime + duration - 0.5);
        gain.gain.linearRampToValueAtTime(0, startTime + duration);
        
        osc.connect(gain);
        gain.connect(masterGain);
        
        osc.start(startTime);
        osc.stop(startTime + duration);
        oscillators.push(osc);
      };
      
      // Create sequence of clearly different background tones
      let currentTime = audioContext.currentTime;
      for (let i = 0; i < 15; i++) {
        createBackgroundTone(backgroundTones[toneIndex % backgroundTones.length], currentTime, 6);
        toneIndex++;
        currentTime += 6; // 6-second intervals for clear changes
      }
      
      // Store reference for cleanup
      const backgroundMusic = {
        stop: () => {
          oscillators.forEach(osc => {
            try { osc.stop(); } catch (e) { /* Already stopped */ }
          });
        }
      };
      
      // Generate premium voice using OpenAI TTS
      try {
        const voiceText = `Welcome to ${routine.name}. ${routine.description}. Take a deep breath and let yourself relax into this peaceful moment with God.`;
        
        toast({
          title: "🎙️ Preparing Premium Voice",
          description: "Creating beautiful audio with AI voice technology...",
          duration: 3000,
        });
        
        const response = await fetch('/api/audio/generate-speech', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            text: voiceText,
            voice: selectedVoice, // User-selected premium voice
            model: 'tts-1-hd', // High quality model
            speed: 0.85 // Slightly slower for meditation
          }),
        });
        
        if (response.ok) {
          const audioBlob = await response.blob();
          const audioUrl = URL.createObjectURL(audioBlob);
          const premiumAudio = new Audio(audioUrl);
          
          // iOS compatibility fixes
          premiumAudio.preload = 'auto';
          premiumAudio.playsInline = true;
          premiumAudio.volume = 0.8;
          
          premiumAudio.onloadeddata = () => {
            toast({
              title: "✨ Premium Voice Ready",
              description: "Now playing with studio-quality AI narration",
              duration: 2000,
            });
            
            // iOS requires promise-based play handling
            const playPromise = premiumAudio.play();
            if (playPromise !== undefined) {
              playPromise.catch(error => {
                console.error('Audio play failed on iOS:', error);
                // Fallback to system voice
                fallbackToSystemVoice(routine, masterGain, backgroundMusic, audioContext);
              });
            }
          };
          
          premiumAudio.onended = () => {
            // Fade out ambient soundscape
            masterGain.gain.linearRampToValueAtTime(0, audioContext.currentTime + 2);
            setTimeout(() => {
              backgroundMusic.stop();
              setPlayingRoutine(null);
              setCurrentAudioContext(null);
              URL.revokeObjectURL(audioUrl);
              toast({
                title: "🕊️ Session Complete",
                description: "Your peaceful routine has finished. May you carry this tranquility with you.",
                duration: 4000,
              });
            }, 2000);
          };
          
          premiumAudio.onerror = () => {
            // Fallback to system voice if premium fails
            fallbackToSystemVoice(routine, masterGain, backgroundMusic, audioContext);
          };
        } else {
          // Fallback to system voice if API fails
          fallbackToSystemVoice(routine, masterGain, backgroundMusic, audioContext);
        }
      } catch (error) {
        console.error('Premium voice error:', error);
        // Fallback to system voice if premium fails
        fallbackToSystemVoice(routine, masterGain, backgroundMusic, audioContext);
      }
    } catch (error) {
      console.error('Audio playback error:', error);
      toast({
        title: "Audio Permission Needed",
        description: "Please allow audio playback to enjoy your meditation routine.",
        duration: 3000,
      });
      setPlayingRoutine(null);
    }
  };

  const fallbackToSystemVoice = (routine: AudioRoutine, masterGain: GainNode, backgroundMusic: { stop: () => void }, audioContext: AudioContext) => {
    const utterance = new SpeechSynthesisUtterance(
      `Welcome to ${routine.name}. ${routine.description}. Take a deep breath and let yourself relax into this peaceful moment with God.`
    );
    
    // Use a calm, slower speaking voice
    utterance.rate = 0.8;
    utterance.pitch = 0.9;
    utterance.volume = 0.7;
    
    // Try to find the best available system voice
    const voices = speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.name.includes('Female') || 
      voice.name.includes('Samantha') ||
      voice.name.includes('Victoria') ||
      voice.name.toLowerCase().includes('female')
    );
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    speechSynthesis.speak(utterance);
    
    utterance.onend = () => {
      // Fade out ambient soundscape
      masterGain.gain.linearRampToValueAtTime(0, audioContext.currentTime + 2);
      setTimeout(() => {
        backgroundMusic.stop();
        setPlayingRoutine(null);
        setCurrentAudioContext(null);
        toast({
          title: "🕊️ Session Complete",
          description: "Your peaceful routine has finished. May you carry this tranquility with you.",
          duration: 4000,
        });
      }, 2000);
    };
  };

  const stopAudioRoutine = () => {
    if (currentAudioContext) {
      currentAudioContext.close();
      setCurrentAudioContext(null);
    }
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
    setPlayingRoutine(null);
    toast({
      title: "Session Stopped",
      description: "Your routine has been paused. You can restart anytime.",
      duration: 3000,
    });
  };

  const handleRoutineClick = (routine: AudioRoutine) => {
    console.log('Routine clicked:', routine.name);
    // Show routine details in a beautiful toast instead of navigation
    toast({
      title: `🎯 ${routine.name}`,
      description: `${routine.description} • Duration: ${formatDuration(routine.totalDuration || 600)}`,
      duration: 3000,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <Headphones className="h-8 w-8 text-purple-600" />
                Audio Spiritual Routines
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Guided meditation, prayer, and scripture experiences with personalized audio
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Features Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <Volume2 className="h-6 w-6 text-purple-600" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Multiple Voices</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Choose from warm, gentle, peaceful, or authoritative voice options
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <Play className="h-6 w-6 text-blue-600" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Autoplay Sequences</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Seamless transitions between meditation, prayer, and scripture
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <Headphones className="h-6 w-6 text-green-600" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Music Beds</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Ambient backgrounds with gentle piano and nature sounds
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Voice Selection */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border p-6 space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <Mic className="h-6 w-6 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Premium AI Voice Selection</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Choose Your Narrator
              </label>
              <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a premium voice" />
                </SelectTrigger>
                <SelectContent>
                  {premiumVoices.map((voice) => (
                    <SelectItem key={voice.id} value={voice.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{voice.name}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{voice.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">Selected:</span> {premiumVoices.find(v => v.id === selectedVoice)?.name}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500">
                {premiumVoices.find(v => v.id === selectedVoice)?.description}
              </div>
              <div className="flex items-center gap-2 text-xs text-purple-600 dark:text-purple-400">
                <CheckCircle className="h-3 w-3" />
                Studio-quality AI narration powered by OpenAI
              </div>
            </div>
          </div>
        </div>

        {/* Routines Grid */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Available Routines
          </h2>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Headphones className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Unable to Load Routines
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Please check your connection and try again.
                </p>
              </CardContent>
            </Card>
          ) : routines.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {routines.map((routine: AudioRoutine) => (
                <Card 
                  key={routine.id} 
                  className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-purple-200 dark:hover:border-purple-700"
                  onClick={() => handleRoutineClick(routine)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">
                          {getCategoryIcon(routine.category)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                            {routine.name}
                          </h3>
                          <Badge 
                            variant="outline" 
                            className={getCategoryColor(routine.category)}
                          >
                            {routine.category?.charAt(0).toUpperCase() + routine.category?.slice(1)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                      {routine.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <Clock className="h-4 w-4 mr-1" />
                        {formatDuration(routine.totalDuration || 600)}
                      </div>
                      
                      <Button 
                        size="sm" 
                        variant={playingRoutine === routine.id ? "destructive" : "outline"}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (playingRoutine === routine.id) {
                            stopAudioRoutine();
                          } else {
                            handleStartRoutine(routine, e);
                          }
                        }}
                      >
                        {playingRoutine === routine.id ? (
                          <>
                            <Square className="h-3 w-3 mr-1" />
                            Stop
                          </>
                        ) : (
                          <>
                            <Play className="h-3 w-3 mr-1" />
                            Start
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Headphones className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No Routines Available
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Check back later for new spiritual audio experiences.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}