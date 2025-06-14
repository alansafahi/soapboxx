import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, Settings } from 'lucide-react';
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
  const backgroundAudioRef = useRef<HTMLAudioElement | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const currentStep = routine.steps[currentStepIndex];

  // Initialize background music
  useEffect(() => {
    if (routine.audioConfig?.musicBed?.baseTrack) {
      const audio = new Audio();
      // For demo purposes, we'll use a data URL or placeholder
      // In production, you would load actual audio files
      audio.loop = routine.audioConfig.musicBed.loop;
      audio.volume = audioSettings.musicVolume;
      backgroundAudioRef.current = audio;
    }

    return () => {
      if (backgroundAudioRef.current) {
        backgroundAudioRef.current.pause();
        backgroundAudioRef.current = null;
      }
    };
  }, [routine, audioSettings.musicVolume]);

  // Enhanced voice selection with better filtering
  const getOptimalVoice = () => {
    const voices = speechSynthesis.getVoices();
    const voiceType = routine.audioConfig?.voice?.type || 'female';
    const voiceName = routine.audioConfig?.voice?.name || 'Sarah';
    
    console.log('Available voices:', voices.map(v => ({ name: v.name, lang: v.lang })));
    
    // Priority order for voice selection
    let selectedVoice = null;
    
    // 1. Try to find exact name match
    selectedVoice = voices.find(voice => 
      voice.name.toLowerCase().includes(voiceName.toLowerCase())
    );
    
    // 2. Try to find gender-appropriate voice with English
    if (!selectedVoice) {
      const genderKeywords = voiceType === 'male' ? 
        ['male', 'man', 'david', 'alex', 'daniel', 'tom', 'john'] : 
        ['female', 'woman', 'sarah', 'samantha', 'alice', 'victoria', 'kate'];
      
      selectedVoice = voices.find(voice => 
        voice.lang.startsWith('en') && 
        genderKeywords.some(keyword => 
          voice.name.toLowerCase().includes(keyword)
        )
      );
    }
    
    // 3. Fallback to any English voice of the right gender
    if (!selectedVoice) {
      selectedVoice = voices.find(voice => 
        voice.lang.startsWith('en') && 
        (voiceType === 'male' ? !voice.name.toLowerCase().includes('female') : voice.name.toLowerCase().includes('female'))
      );
    }
    
    // 4. Final fallback to first English voice
    if (!selectedVoice) {
      selectedVoice = voices.find(voice => voice.lang.startsWith('en'));
    }
    
    console.log('Selected voice:', selectedVoice?.name, 'for', voiceType, voiceName);
    return selectedVoice;
  };

  const speakText = (text: string, stepVoiceSettings?: any) => {
    if ('speechSynthesis' in window) {
      // Cancel any existing speech
      speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      const voice = getOptimalVoice();
      
      if (voice) {
        utterance.voice = voice;
      }
      
      // Apply voice settings
      utterance.rate = stepVoiceSettings?.speed || audioSettings.rate;
      utterance.pitch = audioSettings.pitch;
      utterance.volume = audioSettings.volume;
      
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
        
        // Start background music with fade in
        if (backgroundAudioRef.current) {
          backgroundAudioRef.current.volume = 0;
          backgroundAudioRef.current.play().catch(e => console.log('Background audio not available'));
          
          // Fade in music
          const fadeInInterval = setInterval(() => {
            if (backgroundAudioRef.current) {
              const currentVol = backgroundAudioRef.current.volume;
              const targetVol = stepVoiceSettings?.musicVolume || audioSettings.musicVolume;
              if (currentVol < targetVol) {
                backgroundAudioRef.current.volume = Math.min(currentVol + 0.05, targetVol);
              } else {
                clearInterval(fadeInInterval);
              }
            }
          }, 100);
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
        
        if (routine.autoAdvance && currentStepIndex < routine.steps.length - 1) {
          setTimeout(() => {
            nextStep();
          }, 1000);
        } else if (currentStepIndex >= routine.steps.length - 1) {
          setIsPlaying(false);
          onComplete?.();
        } else {
          setIsPlaying(false);
        }
      };
      
      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        setIsPlaying(false);
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

  const play = () => {
    setIsPlaying(true);
    speakText(currentStep.content, currentStep.voiceSettings);
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
        setTimeout(() => {
          const nextStepData = routine.steps[currentStepIndex + 1];
          speakText(nextStepData.content, nextStepData.voiceSettings);
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
        setTimeout(() => {
          const prevStepData = routine.steps[currentStepIndex - 1];
          speakText(prevStepData.content, prevStepData.voiceSettings);
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