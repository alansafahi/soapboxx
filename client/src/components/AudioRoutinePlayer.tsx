import React, { useState, useEffect } from 'react';
import { Play, Pause, SkipForward, Clock, Volume2, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import AudioPlayer from './AudioPlayer';

interface RoutineStep {
  id: string;
  type: 'meditation' | 'prayer' | 'scripture' | 'reflection' | 'worship';
  title: string;
  content: string;
  audioUrl?: string;
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

interface AudioRoutinePlayerProps {
  routine: AudioRoutine;
  autoStart?: boolean;
  onComplete?: () => void;
  onProgress?: (stepIndex: number, timeElapsed: number) => void;
}

export default function AudioRoutinePlayer({ 
  routine, 
  autoStart = false, 
  onComplete,
  onProgress 
}: AudioRoutinePlayerProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [stepProgress, setStepProgress] = useState(0);
  const [totalElapsed, setTotalElapsed] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [userSettings, setUserSettings] = useState({
    voice: 'warm-female',
    musicBed: 'gentle-piano',
    autoAdvance: true,
    pauseBetweenSteps: true,
    pauseDuration: 3
  });

  const currentStep = routine.steps[currentStepIndex];
  const totalProgress = ((currentStepIndex * 100) + stepProgress) / routine.steps.length;

  useEffect(() => {
    if (autoStart && routine.steps.length > 0) {
      setIsPlaying(true);
    }
  }, [autoStart, routine]);

  useEffect(() => {
    onProgress?.(currentStepIndex, totalElapsed);
  }, [currentStepIndex, totalElapsed, onProgress]);

  const handleStepComplete = () => {
    if (currentStepIndex < routine.steps.length - 1) {
      if (userSettings.autoAdvance) {
        if (userSettings.pauseBetweenSteps) {
          setIsPlaying(false);
          setTimeout(() => {
            setCurrentStepIndex(prev => prev + 1);
            setStepProgress(0);
            setIsPlaying(true);
          }, userSettings.pauseDuration * 1000);
        } else {
          setCurrentStepIndex(prev => prev + 1);
          setStepProgress(0);
        }
      } else {
        setIsPlaying(false);
      }
    } else {
      // Routine complete
      setIsPlaying(false);
      onComplete?.();
    }
  };

  const handleNextStep = () => {
    if (currentStepIndex < routine.steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
      setStepProgress(0);
    }
  };

  const generateAudioTracks = () => {
    return routine.steps.map((step, index) => ({
      id: step.id,
      title: step.title,
      type: step.type as 'voice',
      url: step.audioUrl || `/api/audio/generate?text=${encodeURIComponent(step.content)}&voice=${userSettings.voice}&musicBed=${userSettings.musicBed}`,
      duration: step.duration,
      voice: {
        gender: userSettings.voice.includes('female') ? 'female' as const : 'male' as const,
        accent: 'american' as const,
        tone: userSettings.voice.split('-')[0] as 'warm' | 'gentle' | 'authoritative' | 'peaceful'
      },
      tags: [step.type, routine.category]
    }));
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'meditation': return '🧘';
      case 'prayer': return '🙏';
      case 'scripture': return '📖';
      case 'reflection': return '💭';
      case 'worship': return '🎵';
      default: return '✨';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Routine Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl text-purple-800 dark:text-purple-300">
                {routine.name}
              </CardTitle>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {routine.description}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="capitalize">
                {routine.category}
              </Badge>
              <span className="text-sm text-gray-500 flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {formatDuration(routine.totalDuration)}
              </span>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Progress Overview */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Routine Progress</h3>
              <span className="text-sm text-gray-500">
                Step {currentStepIndex + 1} of {routine.steps.length}
              </span>
            </div>
            
            <Progress value={totalProgress} className="h-2" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {routine.steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`p-3 rounded-lg border transition-all cursor-pointer ${
                    index === currentStepIndex
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                      : index < currentStepIndex
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                  onClick={() => {
                    if (index <= currentStepIndex) {
                      setCurrentStepIndex(index);
                      setStepProgress(0);
                    }
                  }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{getStepIcon(step.type)}</span>
                    <span className="text-xs font-medium uppercase text-gray-500">
                      {step.type}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDuration(step.duration)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Step Content */}
      {currentStep && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getStepIcon(currentStep.type)}</span>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {currentStep.title}
                    </h3>
                    <Badge variant="secondary" className="capitalize mt-1">
                      {currentStep.type}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSettings(!showSettings)}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={handleNextStep}
                    disabled={currentStepIndex >= routine.steps.length - 1}
                  >
                    <SkipForward className="h-4 w-4 mr-2" />
                    Next
                  </Button>
                </div>
              </div>

              {/* Step Content */}
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {currentStep.content}
                </p>
              </div>

              {/* Settings Panel */}
              {showSettings && (
                <div className="border-t pt-4 space-y-4">
                  <h4 className="font-medium">Audio Settings</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Voice</label>
                      <Select 
                        value={userSettings.voice} 
                        onValueChange={(value) => setUserSettings(prev => ({ ...prev, voice: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="warm-female">Sarah (Warm, Female)</SelectItem>
                          <SelectItem value="gentle-male">David (Gentle, Male)</SelectItem>
                          <SelectItem value="peaceful-female">Grace (Peaceful, Female)</SelectItem>
                          <SelectItem value="authoritative-male">Michael (Strong, Male)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Background Music</label>
                      <Select 
                        value={userSettings.musicBed} 
                        onValueChange={(value) => setUserSettings(prev => ({ ...prev, musicBed: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gentle-piano">Gentle Piano</SelectItem>
                          <SelectItem value="nature-sounds">Nature Sounds</SelectItem>
                          <SelectItem value="ambient-strings">Ambient Strings</SelectItem>
                          <SelectItem value="worship-instrumental">Worship Instrumental</SelectItem>
                          <SelectItem value="silence">No Music</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Auto-advance between steps</label>
                    <Switch
                      checked={userSettings.autoAdvance}
                      onCheckedChange={(checked) => 
                        setUserSettings(prev => ({ ...prev, autoAdvance: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Pause between steps</label>
                    <Switch
                      checked={userSettings.pauseBetweenSteps}
                      onCheckedChange={(checked) => 
                        setUserSettings(prev => ({ ...prev, pauseBetweenSteps: checked }))
                      }
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Audio Player */}
      <AudioPlayer
        tracks={generateAudioTracks()}
        currentTrackId={currentStep?.id}
        autoplay={isPlaying}
        showPlaylist={false}
        routine={{
          name: routine.name,
          sequence: routine.steps.map(s => s.id),
          autoAdvance: userSettings.autoAdvance
        }}
        onTrackChange={(trackId) => {
          const stepIndex = routine.steps.findIndex(step => step.id === trackId);
          if (stepIndex !== -1) {
            setCurrentStepIndex(stepIndex);
          }
        }}
        onComplete={handleStepComplete}
      />
    </div>
  );
}