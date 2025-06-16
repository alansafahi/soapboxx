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
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min`;
  };

  const handleStartRoutine = (routine: AudioRoutine) => {
    console.log('Starting routine:', routine.name);
    setPlayingRoutine(routine.id);
    startFullMeditationSession(routine);
  };

  const startFullMeditationSession = async (routine: AudioRoutine) => {
    try {
      console.log('Device detected:', { isIOS, isAndroid, isSafari, isKindle, isAppleWatch, isMobile });
      
      // Cross-platform AudioContext creation
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      let audioContextOptions: any = {
        sampleRate: 44100,
        latencyHint: 'interactive'
      };
      
      if (isIOS || isSafari) {
        audioContextOptions.latencyHint = 'playback';
      } else if (isAndroid) {
        audioContextOptions.sampleRate = 48000;
      } else if (isKindle) {
        audioContextOptions.latencyHint = 'balanced';
      }
      
      const audioContext = new AudioContextClass(audioContextOptions);
      
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }
      
      // Audio unlock for mobile devices
      if (isMobile) {
        const silentBuffer = audioContext.createBuffer(1, 1, audioContext.sampleRate);
        const silentSource = audioContext.createBufferSource();
        silentSource.buffer = silentBuffer;
        silentSource.connect(audioContext.destination);
        silentSource.start();
      }
      
      setCurrentAudioContext(audioContext);
      
      // Create rich ambient soundscape
      const masterGain = audioContext.createGain();
      masterGain.connect(audioContext.destination);
      masterGain.gain.setValueAtTime(0, audioContext.currentTime);
      masterGain.gain.linearRampToValueAtTime(0.06, audioContext.currentTime + 3);
      
      const sessionDuration = routine.totalDuration || 900; // 15 minutes default
      
      // Enhanced ambient soundscape with multiple layers
      const ambientLayers = [
        { freq: 130.81, type: 'sine' as OscillatorType, volume: 0.03 },    // C3 foundation
        { freq: 164.81, type: 'triangle' as OscillatorType, volume: 0.025 }, // E3 warmth
        { freq: 196.00, type: 'sine' as OscillatorType, volume: 0.02 },   // G3 peace
        { freq: 220.00, type: 'triangle' as OscillatorType, volume: 0.015 }, // A3 harmony
        { freq: 261.63, type: 'sine' as OscillatorType, volume: 0.01 },   // C4 clarity
      ];
      
      const oscillators: OscillatorNode[] = [];
      
      // Create layered ambient soundscape
      ambientLayers.forEach((layer, index) => {
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
      
      // Generate guided meditation segments
      const meditationSegments = [
        {
          text: `Welcome to ${routine.name}. ${routine.description}. Close your eyes and take a deep, peaceful breath.`,
          delay: 3
        },
        {
          text: "As you breathe slowly and deeply, feel God's presence surrounding you with love and peace. Let all tension leave your body.",
          delay: 45
        },
        {
          text: "Continue breathing gently. With each breath, feel yourself drawing closer to the Divine light within your heart.",
          delay: 180
        },
        {
          text: "Rest in this sacred stillness. Allow God's grace to fill every part of your being with tranquility and hope.",
          delay: 360
        },
        {
          text: "In this moment of peace, open your heart to receive whatever God wishes to share with you today.",
          delay: 540
        },
        {
          text: "As our time together draws to a close, take a moment to offer gratitude for this peaceful communion.",
          delay: sessionDuration - 90
        },
        {
          text: "Carry this peace with you into your day. May God's presence continue to guide and bless you. Amen.",
          delay: sessionDuration - 30
        }
      ];
      
      toast({
        title: "Starting Guided Session",
        description: `${Math.round(sessionDuration/60)}-minute meditation with premium voice guidance`,
        duration: 4000,
      });
      
      // Play each meditation segment at scheduled times
      let completedSegments = 0;
      
      // Immediate audio test to ensure iOS audio context is working
      const testAudioGeneration = async () => {
        try {
          console.log('Testing immediate audio generation...');
          const testResponse = await fetch('/api/audio/generate-speech', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              text: "Audio system is ready. Your meditation will begin now.",
              voice: selectedVoice,
              model: 'tts-1-hd',
              speed: 0.75
            }),
          });
          
          if (testResponse.ok) {
            const audioBlob = await testResponse.blob();
            const audioUrl = URL.createObjectURL(audioBlob);
            const testAudio = new Audio(audioUrl);
            
            testAudio.volume = isMobile ? 0.8 : 0.6;
            if (isMobile) {
              (testAudio as any).playsInline = true;
            }
            
            const playPromise = testAudio.play();
            if (playPromise !== undefined) {
              await playPromise;
              console.log('Audio test successful - meditation audio will work');
              
              testAudio.onended = () => {
                URL.revokeObjectURL(audioUrl);
                console.log('Test audio finished, starting meditation segments...');
                // Start the actual meditation segments after test audio
                setTimeout(() => {
                  startMeditationSegments();
                }, 1000); // Small delay to ensure smooth transition
              };
            }
          } else {
            console.error('Audio test failed, using fallback');
            startMeditationSegments();
          }
        } catch (error) {
          console.error('Audio test error:', error);
          toast({
            title: "Audio Setup Issue",
            description: "Please check your device volume and internet connection",
            duration: 4000,
          });
          startMeditationSegments();
        }
      };
      
      const startMeditationSegments = () => {
        console.log('Starting meditation segments:', meditationSegments.length, 'total segments');
        
        meditationSegments.forEach((segment, index) => {
          console.log(`Scheduling segment ${index + 1} for ${segment.delay} seconds`);
          
          setTimeout(async () => {
            if (playingRoutine === routine.id) {
              try {
                console.log(`Generating audio for segment ${index + 1}:`, segment.text.substring(0, 50) + '...');
              
              const response = await fetch('/api/audio/generate-speech', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                  text: segment.text,
                  voice: selectedVoice,
                  model: 'tts-1-hd',
                  speed: 0.75
                }),
              });
              
              console.log(`Audio API response for segment ${index + 1}:`, response.status, response.statusText);
              
              if (response.ok) {
                const audioBlob = await response.blob();
                console.log(`Audio blob size for segment ${index + 1}:`, audioBlob.size, 'bytes');
                
                const audioUrl = URL.createObjectURL(audioBlob);
                const segmentAudio = new Audio(audioUrl);
                
                // Enhanced cross-platform audio setup
                segmentAudio.preload = 'auto';
                segmentAudio.crossOrigin = 'anonymous';
                segmentAudio.volume = isAppleWatch ? 1.0 : (isMobile ? 0.9 : 0.8);
                
                // iOS-specific audio attributes
                if (isMobile) {
                  (segmentAudio as any).playsInline = true;
                  (segmentAudio as any).controls = false;
                  (segmentAudio as any).muted = false;
                }
                
                // Webkit optimizations for Safari/iOS
                if (isIOS || isSafari) {
                  (segmentAudio as any).webkitPlaysinline = true;
                  (segmentAudio as any).webkit = true;
                }
                
                // Error handling for audio playback
                segmentAudio.onerror = (error) => {
                  console.error(`Audio playback error for segment ${index + 1}:`, error);
                  toast({
                    title: "Audio Issue",
                    description: `Segment ${index + 1} couldn't play. Please check your device audio settings.`,
                    duration: 3000,
                  });
                };
                
                segmentAudio.onloadeddata = () => {
                  console.log(`Audio loaded for segment ${index + 1}, duration:`, segmentAudio.duration);
                };
                
                segmentAudio.oncanplay = () => {
                  console.log(`Audio ready to play for segment ${index + 1}`);
                };
                
                try {
                  console.log(`Attempting to play segment ${index + 1}`);
                  const playPromise = segmentAudio.play();
                  
                  if (playPromise !== undefined) {
                    await playPromise;
                    console.log(`Successfully started playback for segment ${index + 1}`);
                    
                    toast({
                      title: `Guidance ${index + 1}`,
                      description: "Audio meditation guidance playing",
                      duration: 2000,
                    });
                  }
                } catch (playError: any) {
                  console.error(`Play failed for segment ${index + 1}:`, playError);
                  
                  // iOS-specific play retry
                  if (isIOS && playError.name === 'NotAllowedError') {
                    toast({
                      title: "Audio Permission Needed",
                      description: "Please tap to enable audio for your meditation",
                      duration: 4000,
                    });
                  } else {
                    toast({
                      title: "Audio Playback Issue",
                      description: "Please check your device volume and audio settings",
                      duration: 3000,
                    });
                  }
                }
                
                segmentAudio.onended = () => {
                  console.log(`Segment ${index + 1} finished playing`);
                  URL.revokeObjectURL(audioUrl);
                  completedSegments++;
                  
                  // End session after final segment
                  if (index === meditationSegments.length - 1) {
                    setTimeout(() => {
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
                      }, 5000);
                    }, 3000);
                  }
                };
              } else {
                const errorText = await response.text();
                console.error(`API error for segment ${index + 1}:`, response.status, errorText);
                
                toast({
                  title: "Connection Issue",
                  description: `Segment ${index + 1} couldn't load. Please check your internet connection.`,
                  duration: 3000,
                });
              }
            } catch (error) {
              console.error(`Segment ${index + 1} failed:`, error);
              toast({
                title: "Audio Generation Failed",
                description: `Segment ${index + 1} encountered an error. Please try restarting the session.`,
                duration: 3000,
              });
            }
          }
        }, segment.delay * 1000);
        });
      };
      
      // Start with immediate audio test
      testAudioGeneration();
      
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
      description: "Your meditation has been paused. You can restart anytime.",
      duration: 3000,
    });
  };

  const handleRoutineClick = (routine: AudioRoutine) => {
    toast({
      title: `${routine.name}`,
      description: `${routine.description} • Duration: ${formatDuration(routine.totalDuration || 600)}`,
      duration: 3000,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Connection Issue
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Unable to load meditation routines. Please check your connection.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Devotional Routines
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Guided meditation sessions with premium AI voice and peaceful soundscapes
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Headphones className="w-5 h-5 text-purple-600" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Premium Voice Experience
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Routines Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {(routines as AudioRoutine[]).map((routine: AudioRoutine) => (
            <Card key={routine.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1" onClick={() => handleRoutineClick(routine)}>
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                      {routine.name}
                    </CardTitle>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-1 line-clamp-2">
                      {routine.description}
                    </p>
                  </div>
                  <Badge variant="secondary" className="ml-2">
                    {routine.category}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Clock className="w-4 h-4 mr-1" />
                    {formatDuration(routine.totalDuration || 600)}
                  </div>
                  
                  {playingRoutine === routine.id ? (
                    <Button
                      onClick={stopAudioRoutine}
                      variant="destructive"
                      size="sm"
                      className="flex items-center space-x-1"
                    >
                      <Square className="w-4 h-4" />
                      <span>Stop</span>
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleStartRoutine(routine)}
                      className="flex items-center space-x-1 bg-purple-600 hover:bg-purple-700"
                      size="sm"
                      disabled={playingRoutine !== null}
                    >
                      <Play className="w-4 h-4" />
                      <span>Start</span>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}