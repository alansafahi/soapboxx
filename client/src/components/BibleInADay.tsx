import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Separator } from "./ui/separator";
import { 
  BookOpen, 
  Clock, 
  Play, 
  CheckCircle, 
  ArrowRight,
  Volume2,
  Timer,
  Target
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";

interface BibleSegment {
  id: number;
  title: string;
  description: string;
  scriptures: string[];
  estimatedTime: {
    fast: number;
    deep: number;
    audio: number;
  };
  completed: boolean;
  order: number;
}

const BIBLE_SEGMENTS: Omit<BibleSegment, 'completed'>[] = [
  {
    id: 1,
    title: "Creation",
    description: "The beginning of all things and God's perfect design",
    scriptures: ["Genesis 1-2", "Psalm 8", "John 1:1-14"],
    estimatedTime: { fast: 8, deep: 45, audio: 15 },
    order: 1
  },
  {
    id: 2,
    title: "Fall & Promise",
    description: "Humanity's rebellion and God's covenant of hope",
    scriptures: ["Genesis 3", "Genesis 12:1-3", "Romans 5:12-21"],
    estimatedTime: { fast: 10, deep: 50, audio: 18 },
    order: 2
  },
  {
    id: 3,
    title: "Kings & Prophets",
    description: "God's people, their leaders, and divine messages",
    scriptures: ["1 Samuel 16", "Isaiah 53", "Jeremiah 31:31-34"],
    estimatedTime: { fast: 12, deep: 65, audio: 22 },
    order: 3
  },
  {
    id: 4,
    title: "Christ the Messiah",
    description: "The promised Savior's life, death, and resurrection",
    scriptures: ["Matthew 1-2", "John 19-20", "1 Corinthians 15:1-28"],
    estimatedTime: { fast: 15, deep: 75, audio: 25 },
    order: 4
  },
  {
    id: 5,
    title: "Church Born",
    description: "The Spirit's power and the early Christian community",
    scriptures: ["Acts 2", "Ephesians 2:11-22", "1 Corinthians 12"],
    estimatedTime: { fast: 10, deep: 55, audio: 20 },
    order: 5
  },
  {
    id: 6,
    title: "Future Hope",
    description: "Christ's return and the restoration of all things",
    scriptures: ["Revelation 21-22", "1 Thessalonians 4:13-18", "2 Peter 3:8-13"],
    estimatedTime: { fast: 8, deep: 40, audio: 15 },
    order: 6
  }
];

type TrackMode = 'fast' | 'deep' | 'audio';

export default function BibleInADay() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedTrack, setSelectedTrack] = useState<TrackMode>('fast');
  const [currentSegment, setCurrentSegment] = useState<number | null>(null);

  const { data: userProgress } = useQuery({
    queryKey: ['/api/bible-in-a-day/progress'],
    enabled: !!user
  });

  const startSegmentMutation = useMutation({
    mutationFn: (segmentId: number) => 
      apiRequest(`/api/bible-in-a-day/start-segment`, {
        method: 'POST',
        body: JSON.stringify({ segmentId, trackMode: selectedTrack })
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bible-in-a-day/progress'] });
    }
  });

  const completeSegmentMutation = useMutation({
    mutationFn: (segmentId: number) => 
      apiRequest(`/api/bible-in-a-day/complete-segment`, {
        method: 'POST',
        body: JSON.stringify({ segmentId, trackMode: selectedTrack })
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bible-in-a-day/progress'] });
      setCurrentSegment(null);
    }
  });

  const segments = BIBLE_SEGMENTS.map(segment => ({
    ...segment,
    completed: userProgress?.completedSegments?.includes(segment.id) || false
  }));

  const completedCount = segments.filter(s => s.completed).length;
  const progressPercentage = (completedCount / segments.length) * 100;
  const totalTime = segments.reduce((sum, segment) => sum + segment.estimatedTime[selectedTrack], 0);

  const getTrackInfo = () => {
    switch (selectedTrack) {
      case 'fast':
        return {
          title: 'Fast Track',
          description: 'Key verses and summaries',
          icon: Timer,
          color: 'bg-blue-600'
        };
      case 'deep':
        return {
          title: 'Deep Dive',
          description: 'Full chapters with reflection',
          icon: Target,
          color: 'bg-purple-600'
        };
      case 'audio':
        return {
          title: 'Audio-Only',
          description: 'Listen while you go',
          icon: Volume2,
          color: 'bg-green-600'
        };
    }
  };

  const trackInfo = getTrackInfo();
  const TrackIcon = trackInfo.icon;

  return (
    <div className="space-y-6 p-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Bible In A Day</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Journey through God's story from Creation to Future Hope
        </p>
        
        {/* Progress Overview */}
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6">
            <div className="text-center space-y-3">
              <div className="text-4xl font-bold" style={{ color: '#5A2671' }}>
                {completedCount}/{segments.length}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Segments Completed</p>
              <Progress value={progressPercentage} className="h-3" />
              <p className="text-xs text-gray-500">
                {progressPercentage.toFixed(0)}% Complete
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Track Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" style={{ color: '#5A2671' }} />
            Choose Your Journey
          </CardTitle>
          <CardDescription>
            Select the experience that fits your schedule and style
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(['fast', 'deep', 'audio'] as TrackMode[]).map((track) => {
              const info = track === 'fast' 
                ? { title: 'Fast Track', description: 'Key verses and summaries', icon: Timer, time: '~60 min total' }
                : track === 'deep'
                ? { title: 'Deep Dive', description: 'Full chapters with reflection', icon: Target, time: '~5 hrs total' }
                : { title: 'Audio-Only', description: 'Listen while you go', icon: Volume2, time: '~2 hrs total' };
              
              const Icon = info.icon;
              
              return (
                <Card 
                  key={track}
                  className={`cursor-pointer transition-all border-2 ${
                    selectedTrack === track 
                      ? 'border-[#5A2671] bg-purple-50 dark:bg-purple-900/20' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedTrack(track)}
                >
                  <CardContent className="p-4 text-center">
                    <Icon className={`h-8 w-8 mx-auto mb-2 ${
                      selectedTrack === track ? 'text-[#5A2671]' : 'text-gray-400'
                    }`} />
                    <h3 className="font-semibold">{info.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {info.description}
                    </p>
                    <Badge variant="outline" className="text-xs">
                      {info.time}
                    </Badge>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Segments */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Your Journey ({totalTime} minutes total)
        </h2>
        
        {segments.map((segment, index) => (
          <Card key={segment.id} className={`transition-all ${
            segment.completed ? 'bg-green-50 dark:bg-green-900/20 border-green-200' : ''
          }`}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      segment.completed 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}>
                      {segment.completed ? <CheckCircle className="h-4 w-4" /> : segment.order}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {segment.title}
                    </h3>
                    {segment.completed && (
                      <Badge className="bg-green-100 text-green-800">Completed</Badge>
                    )}
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-400 mb-3">
                    {segment.description}
                  </p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Clock className="h-4 w-4" />
                      <span>{segment.estimatedTime[selectedTrack]} minutes</span>
                      <TrackIcon className="h-4 w-4" />
                      <span>{trackInfo.title}</span>
                    </div>
                    
                    <div className="text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Scriptures: </span>
                      <span className="text-gray-800 dark:text-gray-200">
                        {segment.scriptures.join(', ')}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="ml-4">
                  {!segment.completed ? (
                    <Button
                      onClick={() => {
                        setCurrentSegment(segment.id);
                        startSegmentMutation.mutate(segment.id);
                      }}
                      disabled={startSegmentMutation.isPending}
                      className="bg-[#5A2671] hover:bg-[#4A1F5F]"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Start
                    </Button>
                  ) : (
                    <Button variant="outline" disabled>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Complete
                    </Button>
                  )}
                </div>
              </div>
              
              {currentSegment === segment.id && (
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-blue-900 dark:text-blue-100">
                        Reading in progress...
                      </p>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        Take your time and reflect on God's word
                      </p>
                    </div>
                    <Button
                      onClick={() => completeSegmentMutation.mutate(segment.id)}
                      disabled={completeSegmentMutation.isPending}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Mark Complete
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {completedCount === segments.length && (
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200">
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Congratulations! 🎉
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              You've completed your Bible In A Day journey! You've experienced God's story from Creation to Future Hope.
            </p>
            <Button className="bg-[#5A2671] hover:bg-[#4A1F5F]">
              Share Your Achievement
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}