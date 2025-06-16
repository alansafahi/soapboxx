import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Square, Clock, Headphones, Pause } from "lucide-react";
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
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [selectedVoice, setSelectedVoice] = useState('nova');
  const [backgroundMusicType, setBackgroundMusicType] = useState('gentle-chords');
  const [isPaused, setIsPaused] = useState(false);
  const [autoPauseTimeout, setAutoPauseTimeout] = useState<NodeJS.Timeout | null>(null);
  const [sessionProgress, setSessionProgress] = useState(0);
  const [currentSegment, setCurrentSegment] = useState(0);
  const [isInSilencePeriod, setIsInSilencePeriod] = useState(false);
  const { toast } = useToast();

  // Meditation segments with their durations and pause points
  const meditationSegments = [
    { name: "Welcome & Breathing", duration: 120, pauseAfter: 15 }, // 2 min segment + 15s pause
    { name: "Body Awareness", duration: 90, pauseAfter: 45 }, // 1.5 min segment + 45s pause
    { name: "Mind Settling", duration: 100, pauseAfter: 90 }, // 1.67 min segment + 90s pause
    { name: "Heart Center", duration: 110, pauseAfter: 120 }, // 1.83 min segment + 2min pause
    { name: "Spiritual Connection", duration: 120, pauseAfter: 180 }, // 2 min segment + 3min pause
    { name: "Gratitude Practice", duration: 90, pauseAfter: 30 }, // 1.5 min segment + 30s pause
    { name: "Closing Blessing", duration: 70, pauseAfter: 0 }, // 1.17 min segment (no pause at end)
  ];

  // Calculate total session duration (15 minutes = 900 seconds)
  const totalSessionDuration = meditationSegments.reduce((total, segment) => 
    total + segment.duration + segment.pauseAfter, 0
  );

  // Calculate pause points for red dots on progress bar
  const pausePoints: number[] = [];
  let cumulativeTime = 0;
  meditationSegments.forEach((segment, index) => {
    cumulativeTime += segment.duration;
    if (segment.pauseAfter > 0) {
      pausePoints.push((cumulativeTime / totalSessionDuration) * 100);
      cumulativeTime += segment.pauseAfter;
    }
  });

  // Background music options
  const backgroundMusicOptions = {
    'off': {
      name: 'No Background Music',
      description: 'Pure voice guidance without background sounds',
      icon: '🔇'
    },
    'gentle-chords': {
      name: 'Gentle Chords',
      description: 'Flowing chord progressions for peaceful meditation',
      icon: '🎵'
    },
    'nature-sounds': {
      name: 'Nature Sounds',
      description: 'Soft rain, gentle breeze, and natural ambience',
      icon: '🌿'
    },
    'ocean-waves': {
      name: 'Ocean Waves',
      description: 'Rhythmic waves for deep relaxation',
      icon: '🌊'
    },
    'soft-piano': {
      name: 'Soft Piano',
      description: 'Delicate piano melodies for contemplation',
      icon: '🎹'
    },
    'ethereal-pads': {
      name: 'Ethereal Pads',
      description: 'Ambient soundscapes for spiritual focus',
      icon: '✨'
    },
    'tibetan-bowls': {
      name: 'Tibetan Bowls',
      description: 'Sacred singing bowls for meditation',
      icon: '🔔'
    }
  };

  const { data: routines = [], isLoading, error } = useQuery({
    queryKey: ["/api/audio/routines"],
    retry: false,
  });

  // Background music generation functions
  const createGentleChords = (audioContext: AudioContext, masterGain: GainNode, oscillators: OscillatorNode[], duration: number) => {
    const chordProgression = [
      { freqs: [261.63, 329.63, 392.00], duration: 8 }, // C Major
      { freqs: [293.66, 369.99, 440.00], duration: 8 }, // D Minor
      { freqs: [246.94, 311.13, 369.99], duration: 8 }, // B Diminished
      { freqs: [220.00, 277.18, 329.63], duration: 8 }, // A Minor
    ];
    
    chordProgression.forEach((chord, chordIndex) => {
      chord.freqs.forEach((freq, noteIndex) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        const filter = audioContext.createBiquadFilter();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, audioContext.currentTime);
        
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800 + (noteIndex * 200), audioContext.currentTime);
        filter.Q.setValueAtTime(0.5, audioContext.currentTime);
        
        const startTime = audioContext.currentTime + (chordIndex * chord.duration);
        const endTime = startTime + chord.duration;
        
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.15 - (noteIndex * 0.03), startTime + 2);
        gain.gain.linearRampToValueAtTime(0.1 - (noteIndex * 0.02), endTime - 2);
        gain.gain.linearRampToValueAtTime(0, endTime);
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(masterGain);
        
        osc.start(startTime);
        osc.stop(endTime);
        oscillators.push(osc);
      });
    });
  };

  const createNatureSounds = (audioContext: AudioContext, masterGain: GainNode, oscillators: OscillatorNode[], duration: number) => {
    // Rain simulation with filtered noise
    const bufferSize = audioContext.sampleRate * 2;
    const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    
    const noiseSource = audioContext.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;
    
    const rainFilter = audioContext.createBiquadFilter();
    rainFilter.type = 'lowpass';
    rainFilter.frequency.setValueAtTime(2000, audioContext.currentTime);
    rainFilter.Q.setValueAtTime(0.3, audioContext.currentTime);
    
    const rainGain = audioContext.createGain();
    rainGain.gain.setValueAtTime(0.03, audioContext.currentTime);
    
    noiseSource.connect(rainFilter);
    rainFilter.connect(rainGain);
    rainGain.connect(masterGain);
    
    noiseSource.start(audioContext.currentTime);
    noiseSource.stop(audioContext.currentTime + duration);
  };

  const createOceanWaves = (audioContext: AudioContext, masterGain: GainNode, oscillators: OscillatorNode[], duration: number) => {
    // Wave simulation using low-frequency oscillations
    for (let i = 0; i < 3; i++) {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      const filter = audioContext.createBiquadFilter();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(0.2 + (i * 0.1), audioContext.currentTime); // Very low frequencies
      
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(300, audioContext.currentTime);
      
      gain.gain.setValueAtTime(0.08 - (i * 0.02), audioContext.currentTime);
      
      // Add wave-like amplitude modulation
      const lfo = audioContext.createOscillator();
      const lfoGain = audioContext.createGain();
      lfo.frequency.setValueAtTime(0.05 + (i * 0.02), audioContext.currentTime);
      lfo.type = 'sine';
      lfoGain.gain.setValueAtTime(0.04, audioContext.currentTime);
      
      lfo.connect(lfoGain);
      lfoGain.connect(gain.gain);
      
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);
      
      osc.start(audioContext.currentTime);
      osc.stop(audioContext.currentTime + duration);
      lfo.start(audioContext.currentTime);
      lfo.stop(audioContext.currentTime + duration);
      
      oscillators.push(osc);
    }
  };

  const createSoftPiano = (audioContext: AudioContext, masterGain: GainNode, oscillators: OscillatorNode[], duration: number) => {
    const pianoNotes = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88]; // C major scale
    
    for (let i = 0; i < 20; i++) {
      const noteIndex = Math.floor(Math.random() * pianoNotes.length);
      const freq = pianoNotes[noteIndex];
      const startTime = audioContext.currentTime + (Math.random() * duration * 0.8);
      
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);
      
      // Piano-like envelope
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.1, startTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 3);
      
      osc.connect(gain);
      gain.connect(masterGain);
      
      osc.start(startTime);
      osc.stop(startTime + 3);
      oscillators.push(osc);
    }
  };

  const createEtherealPads = (audioContext: AudioContext, masterGain: GainNode, oscillators: OscillatorNode[], duration: number) => {
    const etherealFreqs = [65.41, 82.41, 98.00, 123.47, 146.83]; // Low ethereal tones
    
    etherealFreqs.forEach((freq, index) => {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      const filter = audioContext.createBiquadFilter();
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, audioContext.currentTime);
      
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400 + (index * 100), audioContext.currentTime);
      filter.Q.setValueAtTime(2, audioContext.currentTime);
      
      gain.gain.setValueAtTime(0, audioContext.currentTime);
      gain.gain.linearRampToValueAtTime(0.06 - (index * 0.01), audioContext.currentTime + 10);
      gain.gain.linearRampToValueAtTime(0, audioContext.currentTime + duration - 10);
      
      // Add slow modulation
      const lfo = audioContext.createOscillator();
      const lfoGain = audioContext.createGain();
      lfo.frequency.setValueAtTime(0.1 + (index * 0.05), audioContext.currentTime);
      lfo.type = 'sine';
      lfoGain.gain.setValueAtTime(20, audioContext.currentTime);
      
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);
      
      osc.start(audioContext.currentTime);
      osc.stop(audioContext.currentTime + duration);
      lfo.start(audioContext.currentTime);
      lfo.stop(audioContext.currentTime + duration);
      
      oscillators.push(osc);
    });
  };

  const createTibetanBowls = (audioContext: AudioContext, masterGain: GainNode, oscillators: OscillatorNode[], duration: number) => {
    const bowlFreqs = [256, 341.3, 426.7, 512]; // Traditional bowl frequencies
    
    for (let i = 0; i < 8; i++) {
      const freq = bowlFreqs[i % bowlFreqs.length];
      const startTime = audioContext.currentTime + (i * 30); // Spaced out strikes
      
      if (startTime < audioContext.currentTime + duration) {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);
        
        // Bowl-like envelope with long decay
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.2, startTime + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 15);
        
        osc.connect(gain);
        gain.connect(masterGain);
        
        osc.start(startTime);
        osc.stop(startTime + 15);
        oscillators.push(osc);
      }
    }
  };

  // Automatic pause detection function
  const setupAutoPauseDetection = (audio: HTMLAudioElement) => {
    const pausePatterns = [
      /pause for (\d+) seconds?/i,
      /pause for (\d+) minutes?/i,
      /take (\d+) seconds? to/i,
      /rest for (\d+) seconds?/i,
      /(\d+) seconds? of silence/i
    ];

    // Monitor audio for pause cues by tracking time and checking against meditation script
    const checkForPauseCues = () => {
      if (!audio || audio.paused) return;
      
      const currentTime = audio.currentTime;
      
      // Meditation timing markers for automatic pauses
      const pauseMarkers = [
        { time: 35, duration: 15 }, // "pause for 15 seconds"
        { time: 75, duration: 45 }, // "pause for 45 seconds"  
        { time: 140, duration: 90 }, // "pause for 90 seconds"
        { time: 250, duration: 120 }, // "pause for 2 minutes"
        { time: 390, duration: 180 }, // "pause for 3 minutes"
        { time: 590, duration: 30 } // "pause for 30 seconds"
      ];
      
      for (const marker of pauseMarkers) {
        if (Math.abs(currentTime - marker.time) < 2 && !isPaused) {
          // Trigger automatic pause
          audio.pause();
          setIsPaused(true);
          
          toast({
            title: "Automatic Pause",
            description: `Pausing for ${marker.duration} seconds as instructed`,
            duration: 3000,
          });
          
          // Auto-resume after specified duration
          const resumeTimeout = setTimeout(() => {
            if (audio && isPaused) {
              audio.play();
              setIsPaused(false);
              
              toast({
                title: "Resuming",
                description: "Continuing your meditation session",
                duration: 2000,
              });
            }
          }, marker.duration * 1000);
          
          setAutoPauseTimeout(resumeTimeout);
          break;
        }
      }
    };

    // Check for pause cues every 2 seconds
    const intervalId = setInterval(checkForPauseCues, 2000);
    
    // Clean up on audio end
    audio.addEventListener('ended', () => {
      clearInterval(intervalId);
    });
  };

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
      
      // Create background music based on selected type
      const masterGain = audioContext.createGain();
      masterGain.connect(audioContext.destination);
      masterGain.gain.setValueAtTime(backgroundMusicType === 'off' ? 0 : 0.08, audioContext.currentTime);
      
      const oscillators: OscillatorNode[] = [];
      
      if (backgroundMusicType !== 'off') {
        switch (backgroundMusicType) {
          case 'gentle-chords':
            createGentleChords(audioContext, masterGain, oscillators, sessionDuration);
            break;
          case 'nature-sounds':
            createNatureSounds(audioContext, masterGain, oscillators, sessionDuration);
            break;
          case 'ocean-waves':
            createOceanWaves(audioContext, masterGain, oscillators, sessionDuration);
            break;
          case 'soft-piano':
            createSoftPiano(audioContext, masterGain, oscillators, sessionDuration);
            break;
          case 'ethereal-pads':
            createEtherealPads(audioContext, masterGain, oscillators, sessionDuration);
            break;
          case 'tibetan-bowls':
            createTibetanBowls(audioContext, masterGain, oscillators, sessionDuration);
            break;
        }
      }
      
      const backgroundMusic = {
        stop: () => {
          oscillators.forEach(osc => {
            try { osc.stop(); } catch (e) { /* Already stopped */ }
          });
        }
      };
      
      // Create segmented meditation with proper timing for 15-minute session
      const meditationSegments = [
        {
          text: `Welcome to ${routine.name}. ${routine.description}. Find a comfortable position where you can remain still and peaceful for the next fifteen minutes. Close your eyes gently, allowing your eyelids to feel heavy and relaxed. Begin by taking a deep, slow breath in through your nose, filling your lungs completely with fresh, life-giving air. Hold this breath for just a moment, feeling the fullness in your chest. Now slowly exhale through your mouth, releasing all tension and worry with each breath out.`,
          pauseAfter: 15
        },
        {
          text: `Continue this gentle rhythm of breathing. With each inhale, imagine you are drawing in God's peace and love. With each exhale, release any stress, anxiety, or concerns that may be weighing on your heart and mind. As you breathe, feel your body beginning to relax. Start with the top of your head, allowing any tension in your scalp to melt away. Let this wave of relaxation flow down to your forehead, smoothing away any lines of worry or stress.`,
          pauseAfter: 45
        },
        {
          text: `Allow your eyes to feel completely at rest behind your closed lids. Release any tension around your temples and let your jaw soften and relax. Feel your neck and shoulders dropping down, releasing the weight of the day. Let this peaceful feeling continue down your arms, through your chest, and into your heart space. Your heart is the sacred center where God's love dwells within you. Feel this divine love radiating warmth throughout your entire being.`,
          pauseAfter: 90
        },
        {
          text: `Continue to breathe slowly and deeply as this relaxation flows down through your torso, your abdomen, your hips, and into your legs. Feel your feet connecting you to the earth while your spirit soars toward heaven. Now that your body is completely relaxed, turn your attention to your heart and mind. In this sacred stillness, you are creating space for God to speak to your soul. You are opening yourself to receive divine wisdom, comfort, and guidance.`,
          pauseAfter: 120
        },
        {
          text: `Imagine yourself in a beautiful, peaceful garden where you can meet with the Divine. This is your sacred space, filled with everything that brings you peace. Perhaps there are gentle flowers swaying in a soft breeze, or a calm stream flowing nearby. In this garden of peace, you are completely safe and loved. God's presence surrounds you like warm sunlight, filling every cell of your body with healing light and unconditional love. Rest in this divine presence. You don't need to say anything or do anything. Simply be present with the One who created you and loves you beyond measure.`,
          pauseAfter: 180
        },
        {
          text: `If thoughts try to pull your attention away, gently acknowledge them without judgment and then return your focus to your breath and to God's loving presence with you. In this holy silence, allow your heart to open completely. If there are any burdens you've been carrying, offer them now to God. If there are any fears or worries troubling your mind, release them into divine care. Rest assured that you are deeply loved, perfectly known, and completely accepted just as you are in this moment. Continue to breathe peacefully in this sacred communion. Let your soul be nourished by this divine connection. Allow God's peace to penetrate every corner of your being. Take this time to listen with your heart. God may speak to you through a sense of peace, a gentle insight, or simply through the profound love you feel in this moment.`,
          pauseAfter: 30
        },
        {
          text: `As we begin to draw our time together to a close, take a moment to offer gratitude for this peaceful communion. Thank God for this time of rest and renewal, for the breath in your lungs, and for the love that surrounds you always. When you're ready, begin to gently wiggle your fingers and toes, bringing gentle movement back to your body. Take a deep breath and slowly open your eyes when it feels right. Carry this peace with you into your day. Remember that God's presence is always available to you, and you can return to this inner sanctuary of peace whenever you need comfort or guidance. May you walk forward with confidence, knowing you are loved, guided, and blessed. May God's peace be with you always. Amen.`,
          pauseAfter: 0
        }
      ];

      // Generate complete meditation audio with proper segmentation
      console.log('Starting segmented meditation session...');
      
      let currentSegmentIndex = 0;
      let sessionStartTime = Date.now();
      
      // Progress tracking
      const updateProgress = () => {
        const elapsed = (Date.now() - sessionStartTime) / 1000;
        const progress = Math.min((elapsed / totalSessionDuration) * 100, 100);
        setSessionProgress(progress);
        setCurrentSegment(currentSegmentIndex);
      };
      
      // Update progress every second
      const progressInterval = setInterval(updateProgress, 1000);
      
      const playNextSegment = async () => {
        if (currentSegmentIndex >= meditationSegments.length) {
          // Session complete
          masterGain.gain.linearRampToValueAtTime(0, audioContext.currentTime + 5);
          setTimeout(() => {
            backgroundMusic.stop();
            setPlayingRoutine(null);
            setCurrentAudioContext(null);
            toast({
              title: "Session Complete",
              description: "Your 15-minute meditation has finished. Carry this peace with you.",
              duration: 5000,
            });
          }, 6000);
          return;
        }
        
        const segment = meditationSegments[currentSegmentIndex];
        console.log(`Playing segment ${currentSegmentIndex + 1}/${meditationSegments.length}`);
        
        // Generate audio for this segment
        const response = await fetch('/api/meditation/audio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: segment.text,
            voice: selectedVoice,
            speed: 0.95
          }),
        });
        
        if (response.ok) {
          const audioBlob = await response.blob();
          const audioUrl = URL.createObjectURL(audioBlob);
          const segmentAudio = new Audio(audioUrl);
          setCurrentAudio(segmentAudio);
          
          // Cross-platform audio setup
          segmentAudio.preload = 'auto';
          segmentAudio.volume = isAppleWatch ? 1.0 : (isMobile ? 0.85 : 0.75);
          
          if (isMobile) {
            (segmentAudio as any).playsInline = true;
          }
          
          toast({
            title: `Meditation Segment ${currentSegmentIndex + 1}`,
            description: `${meditationSegments.length - currentSegmentIndex} segments remaining`,
            duration: 3000,
          });
          
          await segmentAudio.play();
          
          // When segment ends, pause for specified duration then play next
          segmentAudio.onended = () => {
            URL.revokeObjectURL(audioUrl);
            currentSegmentIndex++;
            
            if (segment.pauseAfter > 0) {
              // Show pause notification
              toast({
                title: "Silent Meditation",
                description: `Pausing for ${segment.pauseAfter} seconds of peaceful silence`,
                duration: Math.min(segment.pauseAfter * 1000, 5000),
              });
              
              // Wait for pause duration then continue
              setTimeout(() => {
                if (playingRoutine === routine.id) {
                  playNextSegment();
                }
              }, segment.pauseAfter * 1000);
            } else {
              // No pause, continue immediately
              playNextSegment();
            }
          };
        } else {
          throw new Error('Failed to generate segment audio');
        }
      };
      
      // Start the segmented meditation
      await playNextSegment();
      
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

  const pauseAudioRoutine = () => {
    if (currentAudio && !isPaused) {
      currentAudio.pause();
      setIsPaused(true);
      
      toast({
        title: "Session Paused",
        description: "Meditation session paused. Click resume to continue.",
        duration: 2000,
      });
    }
  };

  const resumeAudioRoutine = () => {
    if (currentAudio && isPaused) {
      currentAudio.play();
      setIsPaused(false);
      
      toast({
        title: "Session Resumed",
        description: "Continuing your meditation session",
        duration: 2000,
      });
    }
  };

  const stopAudioRoutine = () => {
    // Clear any auto-pause timeouts
    if (autoPauseTimeout) {
      clearTimeout(autoPauseTimeout);
      setAutoPauseTimeout(null);
    }
    
    // Stop meditation audio
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setCurrentAudio(null);
    }
    
    // Stop background music by closing audio context
    if (currentAudioContext) {
      currentAudioContext.close();
      setCurrentAudioContext(null);
    }
    
    // Stop any browser speech synthesis
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
    
    setPlayingRoutine(null);
    setIsPaused(false);
    
    toast({
      title: "Session Stopped",
      description: "Meditation session has been stopped successfully",
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
              {playingRoutine === routine.id ? (
                <div className="space-y-4">
                  {/* Progress Bar with Pause Points */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                      <span>{meditationSegments[currentSegment]?.name || "Preparing..."}</span>
                      <span>{Math.round(sessionProgress)}%</span>
                    </div>
                    
                    <div className="relative">
                      {/* Progress Bar Background */}
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        {/* Progress Fill */}
                        <div 
                          className="h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-1000 ease-out"
                          style={{ width: `${sessionProgress}%` }}
                        />
                      </div>
                      
                      {/* Red Dots for Pause Points */}
                      {pausePoints.map((point, index) => (
                        <div
                          key={index}
                          className="absolute top-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-gray-800 shadow-sm transform -translate-y-0.5"
                          style={{ left: `${point}%`, transform: 'translateX(-50%) translateY(-25%)' }}
                          title={`Pause point ${index + 1}`}
                        />
                      ))}
                    </div>
                    
                    {isInSilencePeriod && (
                      <div className="text-center text-sm text-purple-600 dark:text-purple-400 font-medium">
                        🕊️ Silent Reflection Time
                      </div>
                    )}
                  </div>
                  
                  {/* Pause/Resume Button */}
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={isPaused ? resumeAudioRoutine : pauseAudioRoutine}
                      className="flex-1 bg-orange-600 hover:bg-orange-700"
                    >
                      {isPaused ? (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Resume
                        </>
                      ) : (
                        <>
                          <Pause className="h-4 w-4 mr-2" />
                          Pause
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => handleRoutineClick(routine)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <Square className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  onClick={() => handleRoutineClick(routine)}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  disabled={playingRoutine !== null}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start Meditation
                </Button>
              )}
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