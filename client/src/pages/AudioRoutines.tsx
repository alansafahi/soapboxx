import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Square, Clock, Headphones } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AudioRoutine {
  id: number;
  name: string;
  description: string;
  totalDuration: number;
  category: string;
  autoAdvance: boolean;
  steps: Array<{
    id: string;
    type: string;
    title: string;
    content: string;
    duration: number;
    voiceSettings: {
      voice: string;
      speed: number;
      musicBed: string;
    };
  }>;
}

export default function AudioRoutines() {
  const [playingRoutine, setPlayingRoutine] = useState<number | null>(null);
  const [currentAudioContext, setCurrentAudioContext] = useState<AudioContext | null>(null);
  const [selectedVoice, setSelectedVoice] = useState('nova');
  const { toast } = useToast();

  const { data: routines = [], isLoading, error } = useQuery({
    queryKey: ["/api/audio/routines"],
    retry: false,
  });

  // Universal device detection for cross-platform support
  const userAgent = navigator.userAgent.toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(userAgent);
  const isAndroid = /android/.test(userAgent);
  const isSafari = /safari/.test(userAgent) && !/chrome/.test(userAgent);
  const isKindle = /kindle|silk/.test(userAgent);
  const isAppleWatch = /watchos/.test(userAgent);
  const isMobile = isIOS || isAndroid || /mobile/.test(userAgent);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartRoutine = (routine: AudioRoutine) => {
    if (playingRoutine === routine.id) {
      stopAudioRoutine();
      return;
    }
    startFullMeditationSession(routine);
  };

  const startFullMeditationSession = async (routine: AudioRoutine) => {
    try {
      setPlayingRoutine(routine.id);
      
      // Create audio context for background music
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      setCurrentAudioContext(audioContext);
      
      // Session duration in seconds (12-15 minutes)
      const sessionDuration = 900; // 15 minutes
      
      // Create multi-layered ambient background music
      const masterGain = audioContext.createGain();
      masterGain.connect(audioContext.destination);
      masterGain.gain.setValueAtTime(0.15, audioContext.currentTime);
      
      const oscillators: OscillatorNode[] = [];
      
      // Enhanced harmonic layers with warm frequencies
      const harmonicLayers = [
        { freq: 130.81, volume: 0.3, type: 'sine' as OscillatorType }, // C3
        { freq: 164.81, volume: 0.25, type: 'triangle' as OscillatorType }, // E3
        { freq: 196.00, volume: 0.2, type: 'sine' as OscillatorType }, // G3
        { freq: 220.00, volume: 0.15, type: 'triangle' as OscillatorType }, // A3
        { freq: 261.63, volume: 0.1, type: 'sine' as OscillatorType }, // C4
      ];
      
      harmonicLayers.forEach((layer, index) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        const filter = audioContext.createBiquadFilter();
        
        osc.frequency.setValueAtTime(layer.freq, audioContext.currentTime);
        osc.type = layer.type;
        
        // Warm filter
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1200, audioContext.currentTime);
        filter.Q.setValueAtTime(0.3, audioContext.currentTime);
        
        const startTime = audioContext.currentTime + (index * 3);
        const endTime = startTime + sessionDuration;
        
        // Gentle breathing pattern
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(layer.volume, startTime + 8);
        
        // Subtle variations throughout
        for (let t = startTime + 15; t < endTime - 15; t += 25) {
          gain.gain.linearRampToValueAtTime(layer.volume * 0.6, t);
          gain.gain.linearRampToValueAtTime(layer.volume, t + 12);
        }
        
        gain.gain.linearRampToValueAtTime(0, endTime - 8);
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(masterGain);
        
        osc.start(startTime);
        osc.stop(endTime);
        oscillators.push(osc);
      });
      
      const backgroundMusic = {
        stop: () => {
          oscillators.forEach(osc => {
            try { osc.stop(); } catch (e) { /* Already stopped */ }
          });
        }
      };
      
      // Create complete meditation script with natural pauses
      const fullMeditationText = `Welcome to ${routine.name}. ${routine.description}. 
      
      Close your eyes and take a deep, peaceful breath. Feel the air filling your lungs completely.
      
      (pause for 15 seconds)
      
      As you breathe slowly and deeply, feel God's presence surrounding you with love and peace. Let all tension leave your body.
      
      (pause for 45 seconds)
      
      Continue breathing gently. With each breath, feel yourself drawing closer to the Divine light within your heart.
      
      (pause for 90 seconds)
      
      Rest in this sacred stillness. Allow God's grace to fill every part of your being with tranquility and hope.
      
      (pause for 2 minutes)
      
      In this moment of peace, open your heart to receive whatever God wishes to share with you today.
      
      (pause for 3 minutes)
      
      As our time together draws to a close, take a moment to offer gratitude for this peaceful communion.
      
      (pause for 30 seconds)
      
      Carry this peace with you into your day. May God's presence continue to guide and bless you. Amen.`;

      // Generate complete meditation audio using working endpoint
      console.log('Generating complete meditation audio...');
      
      const response = await fetch('/api/meditation/audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: fullMeditationText,
          voice: selectedVoice,
          speed: 0.65
        }),
      });
      
      if (response.ok) {
        const audioBlob = await response.blob();
        console.log('Meditation audio generated, size:', audioBlob.size, 'bytes');
        
        const audioUrl = URL.createObjectURL(audioBlob);
        const meditationAudio = new Audio(audioUrl);
        
        // Cross-platform audio setup
        meditationAudio.preload = 'auto';
        meditationAudio.volume = isAppleWatch ? 1.0 : (isMobile ? 0.85 : 0.75);
        
        if (isMobile) {
          (meditationAudio as any).playsInline = true;
        }
        
        toast({
          title: "Complete Meditation Session",
          description: "15-minute guided meditation with peaceful background music",
          duration: 4000,
        });
        
        const playPromise = meditationAudio.play();
        if (playPromise !== undefined) {
          await playPromise;
          console.log('Complete meditation audio started successfully');
        }
        
        meditationAudio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          masterGain.gain.linearRampToValueAtTime(0, audioContext.currentTime + 5);
          setTimeout(() => {
            backgroundMusic.stop();
            setPlayingRoutine(null);
            setCurrentAudioContext(null);
            toast({
              title: "Session Complete",
              description: "Your peaceful meditation has finished. Carry this tranquility with you.",
              duration: 5000,
            });
          }, 6000);
        };
      } else {
        throw new Error('Failed to generate meditation audio');
      }
      
    } catch (error) {
      console.error('Meditation session error:', error);
      
      let errorMessage = "Please tap to enable audio for your meditation routine.";
      if (isIOS) {
        errorMessage = "Please enable audio in Safari settings for meditation.";
      } else if (isAndroid) {
        errorMessage = "Please allow audio permission for your meditation routine.";
      } else if (isKindle) {
        errorMessage = "Audio may be limited on Kindle. Please check volume settings.";
      } else if (isAppleWatch) {
        errorMessage = "Audio capabilities are limited on Apple Watch.";
      }
      
      toast({
        title: "Audio Setup Needed",
        description: errorMessage,
        duration: 4000,
      });
      setPlayingRoutine(null);
    }
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
      description: `Audio routine has been paused. Duration: ${formatDuration(900)}`,
      duration: 3000,
    });
  };

  const handleRoutineClick = (routine: AudioRoutine) => {
    handleStartRoutine(routine);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <Headphones className="h-12 w-12 mx-auto mb-4 text-purple-600" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Audio Routines
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Loading peaceful meditation experiences...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <Headphones className="h-12 w-12 mx-auto mb-4 text-purple-600" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Audio Routines
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Welcome! Your audio meditation routines are being prepared.
          </p>
        </div>
      </div>
    );
  }

  // Default routines if none available
  const defaultRoutines: AudioRoutine[] = [
    {
      id: 1,
      name: "Morning Prayer & Meditation",
      description: "Start your day with peaceful reflection and spiritual connection",
      totalDuration: 900, // 15 minutes
      category: "Spiritual",
      autoAdvance: true,
      steps: []
    },
    {
      id: 2,
      name: "Evening Gratitude Session",
      description: "End your day with thankfulness and peaceful rest",
      totalDuration: 600, // 10 minutes
      category: "Gratitude",
      autoAdvance: true,
      steps: []
    },
    {
      id: 3,
      name: "Scripture Meditation",
      description: "Deep reflection on God's word with guided contemplation",
      totalDuration: 720, // 12 minutes
      category: "Scripture",
      autoAdvance: true,
      steps: []
    }
  ];

  const displayRoutines = (routines as AudioRoutine[]).length > 0 ? routines as AudioRoutine[] : defaultRoutines;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Headphones className="h-12 w-12 mx-auto mb-4 text-purple-600" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Audio Routines
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Guided meditation experiences with premium AI narration and peaceful background music
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {displayRoutines.map((routine: AudioRoutine) => (
          <Card key={routine.id} className="group hover:shadow-lg transition-all duration-200">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2">{routine.name}</CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    {routine.description}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {routine.category}
                </Badge>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Clock className="h-4 w-4" />
                  {formatDuration(routine.totalDuration)}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <Button
                onClick={() => handleRoutineClick(routine)}
                className={`w-full ${
                  playingRoutine === routine.id
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-purple-600 hover:bg-purple-700'
                }`}
                disabled={playingRoutine !== null && playingRoutine !== routine.id}
              >
                {playingRoutine === routine.id ? (
                  <>
                    <Square className="h-4 w-4 mr-2" />
                    Stop Session
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Start Meditation
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Voice Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Voice Selection</CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Choose your preferred narration voice for meditation sessions
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { id: 'nova', name: 'Nova', description: 'Warm & calming female voice' },
              { id: 'shimmer', name: 'Shimmer', description: 'Gentle & soothing female voice' },
              { id: 'alloy', name: 'Alloy', description: 'Peaceful & balanced neutral voice' },
              { id: 'echo', name: 'Echo', description: 'Deep & contemplative male voice' },
              { id: 'fable', name: 'Fable', description: 'Wise & nurturing male voice' },
              { id: 'onyx', name: 'Onyx', description: 'Strong & grounding male voice' }
            ].map((voice) => (
              <Button
                key={voice.id}
                variant={selectedVoice === voice.id ? "default" : "outline"}
                className={`p-3 h-auto text-left flex-col items-start ${
                  selectedVoice === voice.id ? 'bg-purple-600 hover:bg-purple-700' : ''
                }`}
                onClick={() => setSelectedVoice(voice.id)}
              >
                <div className="font-medium">{voice.name}</div>
                <div className="text-xs opacity-75">{voice.description}</div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Feature Overview */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-2">Premium AI Narration</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Studio-quality voice generation using OpenAI's latest TTS technology for warm, natural guidance
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-2">Ambient Soundscapes</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Multi-layered harmonic background music designed to enhance spiritual focus and inner peace
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}