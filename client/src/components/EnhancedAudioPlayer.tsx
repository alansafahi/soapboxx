import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, Settings, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';

interface AudioStep {
  id: string;
  type: 'meditation' | 'prayer' | 'scripture' | 'reflection' | 'worship';
  title: string;
  content: string;
  duration: number;
  voiceSettings?: {
    voice: string;
    voiceType: string;
    speed: number;
    pitch: string;
    style: string;
    musicBed: string;
    musicVolume: number;
  };
}

interface AudioConfig {
  voice: {
    name: string;
    type: string;
    characteristics: string;
    preferredRate: number;
    pitch: string;
    style: string;
  };
  musicBed: {
    baseTrack: string;
    volume: number;
    fadeIn: number;
    fadeOut: number;
    loop: boolean;
  };
  masterVolume: number;
  voiceVolume: number;
  musicVolume: number;
  crossfadeDuration: number;
}

interface AudioRoutine {
  id: string;
  name: string;
  description: string;
  totalDuration: number;
  steps: AudioStep[];
  category: string;
  autoAdvance: boolean;
  audioConfig: AudioConfig;
}

interface EnhancedAudioPlayerProps {
  routine: AudioRoutine;
  autoStart?: boolean;
  onComplete?: () => void;
  onProgress?: (stepIndex: number, timeElapsed: number) => void;
}

export default function EnhancedAudioPlayer({ 
  routine, 
  autoStart = false, 
  onComplete,
  onProgress 
}: EnhancedAudioPlayerProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [stepProgress, setStepProgress] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [audioSettings, setAudioSettings] = useState({
    rate: routine.audioConfig?.voice?.preferredRate || 0.85,
    pitch: 1,
    volume: routine.audioConfig?.voiceVolume || 0.9,
    musicVolume: routine.audioConfig?.musicVolume || 0.3
  });

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const backgroundAudioRef = useRef<any>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const [voicesLoaded, setVoicesLoaded] = useState(false);

  const currentStep = routine.steps[currentStepIndex];

  // Initialize voices
  useEffect(() => {
    const loadVoices = () => {
      const voices = speechSynthesis.getVoices();
      if (voices.length > 0) {
        setVoicesLoaded(true);
        console.log('Available voices:', voices.map(v => ({ name: v.name, lang: v.lang })));
      }
    };

    loadVoices();
    speechSynthesis.addEventListener('voiceschanged', loadVoices);

    return () => {
      speechSynthesis.removeEventListener('voiceschanged', loadVoices);
    };
  }, []);

  // Initialize background music with simpler approach
  useEffect(() => {
    if (routine.audioConfig?.musicBed?.baseTrack) {
      console.log('Initializing background music system');
      
      // Create a simple audio element approach for background music
      const createBackgroundAudio = () => {
        try {
          // Use Web Audio API for a simple background tone
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          
          backgroundAudioRef.current = {
            context: audioContext,
            oscillator: null,
            gainNode: null,
            isPlaying: false,
            
            play: async () => {
              try {
                if (backgroundAudioRef.current?.isPlaying) return;
                
                if (audioContext.state === 'suspended') {
                  await audioContext.resume();
                }
                
                // Create professional orchestral-quality ambient soundscape
                const fundamentalOsc = audioContext.createOscillator(); // Root note
                const thirdOsc = audioContext.createOscillator(); // Major third
                const fifthOsc = audioContext.createOscillator(); // Perfect fifth
                const seventhOsc = audioContext.createOscillator(); // Major seventh for sophistication
                const octaveOsc = audioContext.createOscillator(); // Octave for depth
                const subBassOsc = audioContext.createOscillator(); // Sub-bass foundation
                
                // Individual gain controls for professional mixing
                const fundamentalGain = audioContext.createGain();
                const thirdGain = audioContext.createGain();
                const fifthGain = audioContext.createGain();
                const seventhGain = audioContext.createGain();
                const octaveGain = audioContext.createGain();
                const subBassGain = audioContext.createGain();
                
                // Professional EQ simulation with filters
                const lowFilter = audioContext.createBiquadFilter();
                const midFilter = audioContext.createBiquadFilter();
                const highFilter = audioContext.createBiquadFilter();
                
                // Configure professional-grade filters
                lowFilter.type = 'lowpass';
                lowFilter.frequency.setValueAtTime(800, audioContext.currentTime);
                lowFilter.Q.setValueAtTime(0.7, audioContext.currentTime);
                
                midFilter.type = 'peaking';
                midFilter.frequency.setValueAtTime(440, audioContext.currentTime);
                midFilter.Q.setValueAtTime(1.2, audioContext.currentTime);
                midFilter.gain.setValueAtTime(2, audioContext.currentTime);
                
                highFilter.type = 'highpass';
                highFilter.frequency.setValueAtTime(60, audioContext.currentTime);
                highFilter.Q.setValueAtTime(0.5, audioContext.currentTime);
                
                // Master mixing console
                const masterGain = audioContext.createGain();
                const compressor = audioContext.createDynamicsCompressor();
                
                // Professional compressor settings for broadcast quality
                compressor.threshold.setValueAtTime(-18, audioContext.currentTime);
                compressor.knee.setValueAtTime(6, audioContext.currentTime);
                compressor.ratio.setValueAtTime(3, audioContext.currentTime);
                compressor.attack.setValueAtTime(0.003, audioContext.currentTime);
                compressor.release.setValueAtTime(0.1, audioContext.currentTime);
                
                // Create sophisticated chord progression (Cmaj7 with extensions)
                fundamentalOsc.frequency.setValueAtTime(130.81, audioContext.currentTime); // C3 - fundamental
                thirdOsc.frequency.setValueAtTime(164.81, audioContext.currentTime); // E3 - major third
                fifthOsc.frequency.setValueAtTime(196.00, audioContext.currentTime); // G3 - perfect fifth
                seventhOsc.frequency.setValueAtTime(246.94, audioContext.currentTime); // B3 - major seventh
                octaveOsc.frequency.setValueAtTime(261.63, audioContext.currentTime); // C4 - octave
                subBassOsc.frequency.setValueAtTime(65.41, audioContext.currentTime); // C2 - sub-bass
                
                // Use sophisticated waveforms for orchestral texture
                fundamentalOsc.type = 'sine'; // Pure foundation
                thirdOsc.type = 'triangle'; // Warm harmonics
                fifthOsc.type = 'sine'; // Clean support
                seventhOsc.type = 'triangle'; // Color tone
                octaveOsc.type = 'sine'; // Brightness
                subBassOsc.type = 'sine'; // Deep foundation
                
                // Professional mixing levels for broadcast quality
                fundamentalGain.gain.setValueAtTime(0.08, audioContext.currentTime); // Strong foundation
                thirdGain.gain.setValueAtTime(0.05, audioContext.currentTime); // Warm presence
                fifthGain.gain.setValueAtTime(0.06, audioContext.currentTime); // Harmonic support
                seventhGain.gain.setValueAtTime(0.03, audioContext.currentTime); // Subtle sophistication
                octaveGain.gain.setValueAtTime(0.04, audioContext.currentTime); // Brightness
                subBassGain.gain.setValueAtTime(0.03, audioContext.currentTime); // Deep foundation
                
                // Master volume with dynamic range
                masterGain.gain.setValueAtTime(audioSettings.musicVolume * 0.4, audioContext.currentTime);
                
                // Connect professional audio chain
                fundamentalOsc.connect(fundamentalGain);
                thirdOsc.connect(thirdGain);
                fifthOsc.connect(fifthGain);
                seventhOsc.connect(seventhGain);
                octaveOsc.connect(octaveGain);
                subBassOsc.connect(subBassGain);
                
                // Route through professional EQ chain
                fundamentalGain.connect(lowFilter);
                thirdGain.connect(midFilter);
                fifthGain.connect(midFilter);
                seventhGain.connect(highFilter);
                octaveGain.connect(highFilter);
                subBassGain.connect(lowFilter);
                
                // Master bus processing
                lowFilter.connect(compressor);
                midFilter.connect(compressor);
                highFilter.connect(compressor);
                compressor.connect(masterGain);
                masterGain.connect(audioContext.destination);
                
                // Add professional modulation for organic movement
                const mainLFO = audioContext.createOscillator();
                const lfoGain = audioContext.createGain();
                const tremoloLFO = audioContext.createOscillator();
                const tremoloGain = audioContext.createGain();
                
                // Slow, organic pitch modulation
                mainLFO.frequency.setValueAtTime(0.08, audioContext.currentTime);
                lfoGain.gain.setValueAtTime(1.5, audioContext.currentTime);
                mainLFO.connect(lfoGain);
                lfoGain.connect(fundamentalOsc.frequency);
                
                // Gentle amplitude modulation for breathing effect
                tremoloLFO.frequency.setValueAtTime(0.12, audioContext.currentTime);
                tremoloGain.gain.setValueAtTime(0.02, audioContext.currentTime);
                tremoloLFO.connect(tremoloGain);
                tremoloGain.connect(masterGain.gain);
                
                if (backgroundAudioRef.current) {
                  backgroundAudioRef.current.oscillators = [
                    fundamentalOsc, thirdOsc, fifthOsc, seventhOsc, octaveOsc, subBassOsc, 
                    mainLFO, tremoloLFO
                  ];
                  backgroundAudioRef.current.gainNode = masterGain;
                  backgroundAudioRef.current.isPlaying = true;
                }
                
                // Start all oscillators for professional orchestral sound
                fundamentalOsc.start();
                thirdOsc.start();
                fifthOsc.start();
                seventhOsc.start();
                octaveOsc.start();
                subBassOsc.start();
                mainLFO.start();
                tremoloLFO.start();
                
                console.log('Enhanced background music started');
              } catch (e) {
                console.log('Background music unavailable:', e);
              }
            },
            
            pause: () => {
              try {
                if (backgroundAudioRef.current?.oscillators && backgroundAudioRef.current?.isPlaying) {
                  // Stop all oscillators
                  backgroundAudioRef.current.oscillators.forEach(osc => {
                    try {
                      osc.stop();
                    } catch (e) {
                      // Oscillator might already be stopped
                    }
                  });
                  backgroundAudioRef.current.oscillators = null;
                  backgroundAudioRef.current.isPlaying = false;
                  console.log('Enhanced background music stopped');
                }
              } catch (e) {
                console.log('Background music stop error:', e);
              }
            }
          };
        } catch (e) {
          console.log('Web Audio API not supported:', e);
          backgroundAudioRef.current = null;
        }
      };
      
      createBackgroundAudio();
    }

    return () => {
      if (backgroundAudioRef.current) {
        try {
          backgroundAudioRef.current.pause();
        } catch (e) {
          // Cleanup
        }
        backgroundAudioRef.current = null;
      }
    };
  }, [routine]);

  // Enhanced voice selection with proper loading
  const getOptimalVoice = () => {
    if (!voicesLoaded) {
      return null;
    }

    const voices = speechSynthesis.getVoices();
    const voiceType = routine.audioConfig?.voice?.type || 'female';
    const voiceName = routine.audioConfig?.voice?.name || 'Sarah';
    
    console.log('Voice selection - Type:', voiceType, 'Name:', voiceName);
    console.log('Available voices:', voices.map(v => ({ name: v.name, lang: v.lang })));
    
    // Priority order for voice selection
    let selectedVoice = null;
    
    // 1. Try to find exact name match first
    selectedVoice = voices.find(voice => 
      voice.name.toLowerCase().includes(voiceName.toLowerCase()) && 
      voice.lang.startsWith('en')
    );
    
    // 2. Premium voice preferences for natural, high-quality speech
    if (!selectedVoice) {
      const premiumVoicePreferences = {
        'female': [
          // Microsoft Neural voices (Windows 11/Server) - studio quality
          'Microsoft Aria Online (Natural) - English (United States)', 'Microsoft Jenny Online (Natural) - English (United States)',
          'Microsoft Zira Desktop - English (United States)', 'Microsoft Hazel Desktop', 'Microsoft Eva Desktop',
          // Google Cloud Text-to-Speech Neural voices - broadcast quality
          'Google en-US-Neural2-F', 'Google en-US-Neural2-G', 'Google en-US-Neural2-H',
          'Google en-US-Wavenet-F', 'Google en-US-Wavenet-G', 'Google en-US-Wavenet-H',
          'Google US English Female', 'Google en-US-Standard-F',
          // Amazon Polly Neural voices - professional quality
          'Amazon Polly Joanna (Neural)', 'Amazon Polly Kendra (Neural)', 'Amazon Polly Salli (Neural)',
          'Amazon Polly Ivy (Neural)', 'Amazon Polly Kimberly (Neural)',
          // macOS premium voices - high quality
          'Allison (Premium)', 'Ava (Enhanced)', 'Susan (Premium)', 'Victoria', 'Kathy', 'Princess',
          // Enhanced system voices
          'Microsoft Zira', 'Enhanced Female Voice',
          // Quality fallbacks
          'Allison', 'Ava', 'Susan', 'Alice', 'Catherine', 'Anna'
        ],
        'male': [
          // Microsoft Neural voices - studio quality
          'Microsoft Guy Online (Natural) - English (United States)', 'Microsoft Davis Online (Natural) - English (United States)',
          'Microsoft David Desktop - English (United States)', 'Microsoft Mark Desktop', 'Microsoft Richard Desktop',
          // Google Cloud Text-to-Speech Neural voices - broadcast quality
          'Google en-US-Neural2-D', 'Google en-US-Neural2-A', 'Google en-US-Neural2-J',
          'Google en-US-Wavenet-D', 'Google en-US-Wavenet-A', 'Google en-US-Wavenet-B',
          'Google US English Male', 'Google en-US-Standard-D',
          // Amazon Polly Neural voices - professional quality
          'Amazon Polly Matthew (Neural)', 'Amazon Polly Justin (Neural)', 'Amazon Polly Joey (Neural)',
          'Amazon Polly Brian (Neural)', 'Amazon Polly Kevin (Neural)',
          // macOS premium voices - high quality
          'Alex (Premium)', 'Daniel (Enhanced)', 'Tom (Premium)', 'Oliver', 'Diego',
          // Enhanced system voices
          'Microsoft David', 'Enhanced Male Voice',
          // Quality fallbacks
          'Alex', 'Daniel', 'Tom', 'Aaron', 'Albert'
        ]
      };
      
      const preferredVoices = premiumVoicePreferences[voiceType] || premiumVoicePreferences['female'];
      
      // Try exact matches for premium voices first
      for (const voiceName of preferredVoices) {
        selectedVoice = voices.find(voice => 
          voice.name === voiceName && voice.lang.startsWith('en')
        );
        if (selectedVoice) {
          console.log('Selected premium voice (exact):', selectedVoice.name);
          break;
        }
      }
      
      // Try partial matches for premium voices
      if (!selectedVoice) {
        for (const voiceName of preferredVoices) {
          selectedVoice = voices.find(voice => 
            voice.name.toLowerCase().includes(voiceName.toLowerCase()) && 
            voice.lang.startsWith('en')
          );
          if (selectedVoice) {
            console.log('Selected premium voice (partial):', selectedVoice.name);
            break;
          }
        }
      }
    }
    
    // 3. Look for enhanced/neural indicators in voice names
    if (!selectedVoice) {
      const enhancedKeywords = ['enhanced', 'premium', 'neural', 'natural', 'pro', 'hd', 'desktop'];
      selectedVoice = voices.find(voice => 
        voice.lang.startsWith('en') && 
        enhancedKeywords.some(keyword => voice.name.toLowerCase().includes(keyword))
      );
      if (selectedVoice) {
        console.log('Selected enhanced voice:', selectedVoice.name);
      }
    }
    
    // 4. Final fallback to first English voice
    if (!selectedVoice) {
      selectedVoice = voices.find(voice => voice.lang.startsWith('en'));
    }
    
    console.log('Selected voice:', selectedVoice?.name, 'for requested:', voiceType, voiceName);
    return selectedVoice;
  };

  const speakText = async (text: string, stepVoiceSettings?: any) => {
    if ('speechSynthesis' in window) {
      // Cancel any existing speech
      speechSynthesis.cancel();
      
      // Wait a moment for voices to be available
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const utterance = new SpeechSynthesisUtterance(text);
      const voice = getOptimalVoice();
      
      if (voice) {
        utterance.voice = voice;
        console.log('Voice applied:', voice.name, 'for step:', currentStep?.title);
      } else {
        console.log('No voice selected, using browser default');
        // Force a specific voice if available
        const voices = speechSynthesis.getVoices();
        const fallbackVoice = voices.find(v => v.lang.startsWith('en'));
        if (fallbackVoice) {
          utterance.voice = fallbackVoice;
          console.log('Using fallback voice:', fallbackVoice.name);
        }
      }
      
      // Apply enhanced voice settings with quality optimizations
      utterance.rate = stepVoiceSettings?.speed || routine.audioConfig?.voice?.preferredRate || audioSettings.rate || 0.85;
      utterance.pitch = audioSettings.pitch || 1.0;
      utterance.volume = audioSettings.volume || 0.9;
      
      // Optimize speech quality for premium voices
      if (voice && (voice.name.includes('Desktop') || voice.name.includes('Premium') || voice.name.includes('Enhanced'))) {
        // Slightly slower rate for premium voices to showcase quality
        utterance.rate *= 0.95;
        // Enhanced volume control for clearer audio
        utterance.volume = Math.min(utterance.volume * 1.1, 1.0);
      }
      
      console.log('Voice settings applied - Rate:', utterance.rate, 'Pitch:', utterance.pitch, 'Volume:', utterance.volume);
      
      // Style-based adjustments
      const style = stepVoiceSettings?.style || routine.audioConfig?.voice?.style;
      if (style === 'reverent' || style === 'contemplative') {
        utterance.rate *= 0.9; // Slower for reverent content
      } else if (style === 'teaching') {
        utterance.rate *= 1.1; // Slightly faster for teaching
      }
      
      utterance.onstart = () => {
        startTimeRef.current = Date.now();
        startProgressTracking();
        
        // Start background music
        if (backgroundAudioRef.current) {
          backgroundAudioRef.current.play().catch((e: any) => console.log('Background audio not available:', e));
        }
      };
      
      utterance.onend = () => {
        stopProgressTracking();
        
        // Fade out background music
        if (backgroundAudioRef.current) {
          const fadeOutInterval = setInterval(() => {
            if (backgroundAudioRef.current) {
              const currentVol = backgroundAudioRef.current.volume;
              if (currentVol > 0.05) {
                backgroundAudioRef.current.volume = Math.max(currentVol - 0.05, 0);
              } else {
                backgroundAudioRef.current.pause();
                clearInterval(fadeOutInterval);
              }
            }
          }, 50);
        }
        
        // Mark step as complete
        setStepProgress(100);
        
        // Auto-advance to next step if enabled and not at the end
        if (routine.autoAdvance && currentStepIndex < routine.steps.length - 1) {
          setTimeout(() => {
            const nextIndex = currentStepIndex + 1;
            setCurrentStepIndex(nextIndex);
            setStepProgress(0);
            
            // Continue playing if still in playing state
            if (isPlaying) {
              setTimeout(async () => {
                const nextStepData = routine.steps[nextIndex];
                await speakText(nextStepData.content, nextStepData.voiceSettings);
              }, 500);
            }
          }, 1000);
        } else if (currentStepIndex >= routine.steps.length - 1) {
          // Reached the end of the routine
          setIsPlaying(false);
          console.log('Audio routine completed');
          onComplete?.();
        } else {
          // Not auto-advancing, just stop
          setIsPlaying(false);
        }
      };
      
      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        console.log('Error details:', {
          error: event.error,
          utterance: {
            text: utterance.text.substring(0, 50) + '...',
            voice: utterance.voice?.name || 'default',
            rate: utterance.rate,
            pitch: utterance.pitch,
            volume: utterance.volume
          }
        });
        
        stopProgressTracking();
        
        // Stop background music
        if (backgroundAudioRef.current) {
          try {
            backgroundAudioRef.current.pause();
          } catch (e) {
            console.log('Background music stop error:', e);
          }
        }
        
        // Handle different error types
        if (event.error === 'interrupted') {
          // Speech was interrupted, don't auto-advance
          console.log('Speech interrupted - pausing routine');
          setIsPlaying(false);
          return;
        }
        
        // For other errors, try to continue gracefully
        if (routine.autoAdvance && currentStepIndex < routine.steps.length - 1) {
          console.log('Advancing to next step after error');
          setTimeout(() => {
            const nextIndex = currentStepIndex + 1;
            setCurrentStepIndex(nextIndex);
            setStepProgress(0);
            
            // Only continue if still in playing state
            if (isPlaying) {
              setTimeout(async () => {
                const nextStepData = routine.steps[nextIndex];
                await speakText(nextStepData.content, nextStepData.voiceSettings);
              }, 1000);
            }
          }, 1500);
        } else {
          setIsPlaying(false);
        }
      };
      
      utteranceRef.current = utterance;
      speechSynthesis.speak(utterance);
    } else {
      console.error('Speech synthesis not supported');
    }
  };

  const startProgressTracking = () => {
    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const progress = (elapsed / (currentStep.duration * 1000)) * 100;
      setStepProgress(Math.min(progress, 100));
      onProgress?.(currentStepIndex, elapsed);
    }, 100);
  };

  const stopProgressTracking = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  const play = async () => {
    setIsPlaying(true);
    await speakText(currentStep.content, currentStep.voiceSettings);
  };

  const pause = () => {
    setIsPlaying(false);
    speechSynthesis.cancel();
    stopProgressTracking();
    
    if (backgroundAudioRef.current) {
      backgroundAudioRef.current.pause();
    }
  };

  const nextStep = () => {
    if (currentStepIndex < routine.steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
      setStepProgress(0);
      if (isPlaying) {
        speechSynthesis.cancel();
        stopProgressTracking();
        setTimeout(async () => {
          const nextStepData = routine.steps[currentStepIndex + 1];
          await speakText(nextStepData.content, nextStepData.voiceSettings);
        }, 500);
      }
    }
  };

  const previousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
      setStepProgress(0);
      if (isPlaying) {
        speechSynthesis.cancel();
        stopProgressTracking();
        setTimeout(async () => {
          const prevStepData = routine.steps[currentStepIndex - 1];
          await speakText(prevStepData.content, prevStepData.voiceSettings);
        }, 500);
      }
    }
  };

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'scripture': return '📖';
      case 'prayer': return '🙏';
      case 'meditation': return '🧘';
      case 'reflection': return '💭';
      case 'worship': return '🎵';
      default: return '✨';
    }
  };

  // Voice preview for testing
  const previewVoice = async () => {
    const voice = getOptimalVoice();
    const sampleText = "This is a voice preview for your audio Bible experience. Thank you for using SoapBox.";
    
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(sampleText);
      if (voice) {
        utterance.voice = voice;
        console.log('Voice preview using:', voice.name);
      }
      
      utterance.rate = audioSettings.rate || 0.9;
      utterance.pitch = audioSettings.pitch || 1.0;
      utterance.volume = audioSettings.volume || 0.8;
      
      speechSynthesis.speak(utterance);
    }
  };

  // Auto-start if requested
  useEffect(() => {
    if (autoStart && routine.steps.length > 0) {
      setTimeout(() => play(), 1000);
    }
  }, [autoStart, routine]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      speechSynthesis.cancel();
      stopProgressTracking();
      if (backgroundAudioRef.current) {
        backgroundAudioRef.current.pause();
      }
    };
  }, []);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{routine.name}</span>
          <Badge variant="outline" className="text-xs">
            {routine.audioConfig?.voice?.name} • {routine.audioConfig?.musicBed?.baseTrack}
          </Badge>
        </CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {routine.description}
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Current Step Display */}
        <div className="text-center space-y-2">
          <div className="text-4xl">{getStepIcon(currentStep.type)}</div>
          <h3 className="font-medium text-lg">{currentStep.title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 max-h-20 overflow-y-auto">
            {currentStep.content}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress value={stepProgress} className="w-full" />
          <div className="flex justify-between text-xs text-gray-500">
            <span>Step {currentStepIndex + 1} of {routine.steps.length}</span>
            <span>{Math.round(stepProgress)}%</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={previousStep}
            disabled={currentStepIndex === 0}
          >
            <SkipBack className="w-4 h-4" />
          </Button>
          
          <Button
            onClick={isPlaying ? pause : play}
            size="lg"
            className="w-16 h-16 rounded-full"
          >
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={nextStep}
            disabled={currentStepIndex === routine.steps.length - 1}
          >
            <SkipForward className="w-4 h-4" />
          </Button>
        </div>

        {/* Voice Settings */}
        {showSettings && (
          <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h4 className="font-medium">Audio Settings</h4>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Voice Speed</label>
                <Slider
                  value={[audioSettings.rate]}
                  onValueChange={([value]) => setAudioSettings(prev => ({ ...prev, rate: value }))}
                  min={0.5}
                  max={2}
                  step={0.1}
                  className="mt-1"
                />
                <span className="text-xs text-gray-500">{audioSettings.rate.toFixed(1)}x</span>
              </div>
              
              <div>
                <label className="text-sm font-medium">Voice Volume</label>
                <Slider
                  value={[audioSettings.volume]}
                  onValueChange={([value]) => setAudioSettings(prev => ({ ...prev, volume: value }))}
                  min={0}
                  max={1}
                  step={0.1}
                  className="mt-1"
                />
                <span className="text-xs text-gray-500">{Math.round(audioSettings.volume * 100)}%</span>
              </div>
              
              <div>
                <label className="text-sm font-medium">Background Music</label>
                <Slider
                  value={[audioSettings.musicVolume]}
                  onValueChange={([value]) => setAudioSettings(prev => ({ ...prev, musicVolume: value }))}
                  min={0}
                  max={0.8}
                  step={0.05}
                  className="mt-1"
                />
                <span className="text-xs text-gray-500">{Math.round(audioSettings.musicVolume * 100)}%</span>
              </div>
              
              {/* Voice Preview */}
              <div className="flex items-center justify-between pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={previewVoice}
                  className="flex items-center gap-2"
                >
                  <Volume2 className="w-4 h-4" />
                  Test Voice
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (backgroundAudioRef.current?.isPlaying) {
                      backgroundAudioRef.current.pause();
                    } else {
                      backgroundAudioRef.current?.play();
                    }
                  }}
                  className="flex items-center gap-2"
                >
                  <Music className="w-4 h-4" />
                  Test Music
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          
          <div className="text-xs text-gray-500">
            Voice: {routine.audioConfig?.voice?.characteristics}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}