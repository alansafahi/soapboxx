import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, Volume2, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';

interface RoutineStep {
  id: string;
  type: 'meditation' | 'prayer' | 'scripture' | 'reflection' | 'worship';
  title: string;
  content: string;
  duration: number;
  voiceSettings?: {
    voice: string;
    speed: number;
    musicBed: string;
  };
}

interface AudioRoutine {
  id: string;
  name: string;
  description: string;
  totalDuration: number;
  steps: RoutineStep[];
  category: 'morning' | 'evening' | 'midday' | 'custom';
  autoAdvance: boolean;
}

interface WebSpeechAudioPlayerProps {
  routine: AudioRoutine;
  autoStart?: boolean;
  onComplete?: () => void;
  onProgress?: (stepIndex: number, timeElapsed: number) => void;
}

export default function WebSpeechAudioPlayer({ 
  routine, 
  autoStart = false, 
  onComplete,
  onProgress 
}: WebSpeechAudioPlayerProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [stepProgress, setStepProgress] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [voiceSettings, setVoiceSettings] = useState({
    rate: 0.9,
    pitch: 1.0,
    volume: 0.8
  });

  const speechSynthRef = useRef<SpeechSynthesisUtterance | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const currentStep = routine.steps[currentStepIndex];
  const totalSteps = routine.steps.length;

  // Check if Web Speech API is supported
  const isSupported = 'speechSynthesis' in window;

  useEffect(() => {
    if (autoStart && isSupported) {
      handlePlay();
    }
    return () => {
      handleStop();
    };
  }, [autoStart, isSupported]);

  const handlePlay = () => {
    if (!isSupported) {
      console.warn('Web Speech API not supported');
      return;
    }

    if (!currentStep) return;

    // Stop any current speech
    window.speechSynthesis.cancel();

    // Create new utterance
    const utterance = new SpeechSynthesisUtterance(currentStep.content);
    utterance.rate = voiceSettings.rate;
    utterance.pitch = voiceSettings.pitch;
    utterance.volume = voiceSettings.volume;

    // Wait for voices to load if needed
    const setVoiceAndSpeak = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        // Prefer female voices for nurturing spiritual content
        const femaleVoice = voices.find(voice => 
          voice.name.toLowerCase().includes('female') || 
          voice.name.toLowerCase().includes('woman') ||
          voice.name.toLowerCase().includes('samantha') ||
          voice.name.toLowerCase().includes('karen') ||
          voice.name.toLowerCase().includes('susan') ||
          voice.lang.includes('en')
        );
        if (femaleVoice) {
          utterance.voice = femaleVoice;
        } else if (voices.length > 0) {
          // Fallback to first available voice
          utterance.voice = voices[0];
        }
      }

      utterance.onstart = () => {
        setIsPlaying(true);
        startTimeRef.current = Date.now();
        startProgressTracking();
      };

      utterance.onend = () => {
        setIsPlaying(false);
        setStepProgress(100);
        stopProgressTracking();
        
        if (routine.autoAdvance && currentStepIndex < totalSteps - 1) {
          setTimeout(() => {
            goToNextStep();
          }, 1000);
        } else if (currentStepIndex >= totalSteps - 1) {
          onComplete?.();
        }
      };

      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        setIsPlaying(false);
        stopProgressTracking();
      };

      speechSynthRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    };

    // Check if voices are loaded
    if (window.speechSynthesis.getVoices().length === 0) {
      // Wait for voices to load
      window.speechSynthesis.onvoiceschanged = () => {
        setVoiceAndSpeak();
        window.speechSynthesis.onvoiceschanged = null;
      };
    } else {
      setVoiceAndSpeak();
    }
  };

  const handlePause = () => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
      setIsPlaying(false);
      stopProgressTracking();
    }
  };

  const handleResume = () => {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsPlaying(true);
      startProgressTracking();
    }
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setStepProgress(0);
    stopProgressTracking();
  };

  const goToNextStep = () => {
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
      setStepProgress(0);
      if (isPlaying) {
        setTimeout(() => handlePlay(), 500);
      }
    }
  };

  const goToPreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
      setStepProgress(0);
      if (isPlaying) {
        setTimeout(() => handlePlay(), 500);
      }
    }
  };

  const startProgressTracking = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    progressIntervalRef.current = setInterval(() => {
      if (currentStep && startTimeRef.current) {
        const elapsed = Date.now() - startTimeRef.current;
        const estimatedDuration = currentStep.duration * 1000; // Convert to milliseconds
        const progress = Math.min((elapsed / estimatedDuration) * 100, 100);
        setStepProgress(progress);
        onProgress?.(currentStepIndex, elapsed / 1000);
      }
    }, 100);
  };

  const stopProgressTracking = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  const getStepTypeColor = (type: string) => {
    const colors = {
      meditation: 'bg-purple-100 text-purple-800',
      prayer: 'bg-blue-100 text-blue-800',
      scripture: 'bg-green-100 text-green-800',
      reflection: 'bg-yellow-100 text-yellow-800',
      worship: 'bg-pink-100 text-pink-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (!isSupported) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p className="text-lg font-medium">Audio Not Supported</p>
            <p className="text-sm mt-2">Your browser doesn't support audio playback. Please try a different browser.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold">{routine.name}</CardTitle>
            <p className="text-sm text-gray-600 mt-1">{routine.description}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Current Step Info */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <Badge className={getStepTypeColor(currentStep?.type || '')}>
              {currentStep?.type}
            </Badge>
            <span className="text-sm text-gray-500">
              Step {currentStepIndex + 1} of {totalSteps}
            </span>
          </div>
          <h3 className="font-medium text-lg mb-2">{currentStep?.title}</h3>
          <p className="text-sm text-gray-700 line-clamp-3">{currentStep?.content}</p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Progress</span>
            <span>{Math.round(stepProgress)}%</span>
          </div>
          <Progress value={stepProgress} className="w-full" />
        </div>

        {/* Audio Controls */}
        <div className="flex items-center justify-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPreviousStep}
            disabled={currentStepIndex === 0}
          >
            <SkipForward className="h-4 w-4 rotate-180" />
          </Button>

          {isPlaying && !window.speechSynthesis.paused ? (
            <Button onClick={handlePause} className="px-8">
              <Pause className="h-5 w-5 mr-2" />
              Pause
            </Button>
          ) : window.speechSynthesis.paused ? (
            <Button onClick={handleResume} className="px-8">
              <Play className="h-5 w-5 mr-2" />
              Resume
            </Button>
          ) : (
            <Button onClick={handlePlay} className="px-8">
              <Play className="h-5 w-5 mr-2" />
              Play
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={goToNextStep}
            disabled={currentStepIndex === totalSteps - 1}
          >
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>

        {/* Voice Settings */}
        {showSettings && (
          <div className="border-t pt-4 space-y-4">
            <h4 className="font-medium">Voice Settings</h4>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-600">Speech Rate</label>
                <Slider
                  value={[voiceSettings.rate]}
                  onValueChange={([value]) => setVoiceSettings(prev => ({ ...prev, rate: value }))}
                  max={2}
                  min={0.5}
                  step={0.1}
                  className="mt-2"
                />
                <span className="text-xs text-gray-500">{voiceSettings.rate}x</span>
              </div>

              <div>
                <label className="text-sm text-gray-600">Volume</label>
                <Slider
                  value={[voiceSettings.volume]}
                  onValueChange={([value]) => setVoiceSettings(prev => ({ ...prev, volume: value }))}
                  max={1}
                  min={0}
                  step={0.1}
                  className="mt-2"
                />
                <span className="text-xs text-gray-500">{Math.round(voiceSettings.volume * 100)}%</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}