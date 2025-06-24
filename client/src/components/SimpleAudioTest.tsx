import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Pause, Volume2 } from 'lucide-react';

export default function SimpleAudioTest() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSupported, setIsSupported] = useState('speechSynthesis' in window);

  const testText = "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life. John 3:16";

  const handlePlay = () => {
    if (!isSupported) {
      alert('Speech synthesis not supported in your browser');
      return;
    }

    // Stop any current speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(testText);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 0.8;

    // Wait for voices to load
    const setVoiceAndSpeak = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        const englishVoice = voices.find(voice => 
          voice.lang.includes('en') && voice.name.toLowerCase().includes('female')
        ) || voices.find(voice => voice.lang.includes('en')) || voices[0];
        
        utterance.voice = englishVoice;
      }

      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = (event) => {
        setIsPlaying(false);
      };

      window.speechSynthesis.speak(utterance);
    };

    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = () => {
        setVoiceAndSpeak();
        window.speechSynthesis.onvoiceschanged = null;
      };
    } else {
      setVoiceAndSpeak();
    }
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Volume2 className="w-5 h-5" />
          Audio Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {testText}
        </p>
        
        {isSupported ? (
          <div className="flex gap-2">
            <Button 
              onClick={handlePlay}
              disabled={isPlaying}
              className="flex-1"
            >
              <Play className="w-4 h-4 mr-2" />
              Play
            </Button>
            <Button 
              onClick={handleStop}
              variant="outline"
              disabled={!isPlaying}
            >
              <Pause className="w-4 h-4 mr-2" />
              Stop
            </Button>
          </div>
        ) : (
          <div className="text-center text-red-600">
            <p>Speech synthesis not supported</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}