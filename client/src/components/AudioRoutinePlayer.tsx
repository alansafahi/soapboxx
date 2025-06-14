// Placeholder component - Use WebSpeechAudioPlayer for actual functionality
import React from 'react';

interface RoutineStep {
  id: string;
  type: 'meditation' | 'prayer' | 'scripture' | 'reflection' | 'worship';
  title: string;
  content: string;
  duration: number;
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
  return (
    <div className="p-8 text-center bg-gray-50 rounded-lg">
      <p className="text-gray-600 mb-2">This component has been replaced by WebSpeechAudioPlayer</p>
      <p className="text-sm text-gray-400">Please use WebSpeechAudioPlayer for audio playback functionality</p>
    </div>
  );
}