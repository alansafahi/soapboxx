import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Clock, BookOpen, Award, CheckCircle, Play, Pause, RotateCcw, Star, Volume2, Share2, Twitter, Facebook, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BibleSection {
  id: string;
  title: string;
  description: string;
  estimatedMinutes: number;
  keyVerses: string[];
  reflectionQuestion: string;
  content: string;
}

const BIBLE_SECTIONS: BibleSection[] = [
  {
    id: 'creation',
    title: 'Creation',
    description: 'In the beginning, God created everything perfect and good',
    estimatedMinutes: 30,
    keyVerses: ['Genesis 1:1', 'Genesis 1:27', 'Genesis 2:7', 'Genesis 3:15'],
    reflectionQuestion: 'What does it mean to you that you are created in God\'s image?',
    content: 'In the beginning God created the heavens and the earth... So God created mankind in his own image, in the image of God he created them; male and female he created them. Then the Lord God formed a man from the dust of the ground and breathed into his nostrils the breath of life, and the man became a living being.'
  },
  {
    id: 'fall_promise',
    title: 'Fall & Promise',
    description: 'Humanity\'s rebellion and God\'s promise of redemption through Abraham',
    estimatedMinutes: 45,
    keyVerses: ['Genesis 12:1-3', 'Exodus 20:1-17', 'Isaiah 53:4-6'],
    reflectionQuestion: 'How do you see God\'s faithfulness despite human failure in your own life?',
    content: 'Now the Lord had said to Abram: "Get out of your country, from your family and from your father\'s house, to a land that I will show you. I will make you a great nation; I will bless you and make your name great; and you shall be a blessing."'
  },
  {
    id: 'kings_prophets',
    title: 'Kings & Prophets',
    description: 'God\'s chosen leaders and messengers prepare the way',
    estimatedMinutes: 50,
    keyVerses: ['1 Samuel 16:7', 'Psalm 23:1', 'Isaiah 9:6'],
    reflectionQuestion: 'What does it mean that God looks at the heart rather than outward appearance?',
    content: 'But the Lord said to Samuel, "Do not look at his appearance or at his physical stature, because I have refused him. For the Lord does not see as man sees; for man looks at the outward appearance, but the Lord looks at the heart."'
  },
  {
    id: 'christ_messiah',
    title: 'Christ the Messiah',
    description: 'Jesus - the promised Savior arrives, lives, dies, and rises again',
    estimatedMinutes: 90,
    keyVerses: ['Luke 2:10-11', 'Matthew 5:3-4', 'John 1:14', 'John 19:30'],
    reflectionQuestion: 'How does knowing Jesus personally change how you live each day?',
    content: 'Then the angel said to them, "Do not be afraid, for behold, I bring you good tidings of great joy which will be to all people. For there is born to you this day in the city of David a Savior, who is Christ the Lord."'
  },
  {
    id: 'church_born',
    title: 'Church Born',
    description: 'The Holy Spirit empowers believers to spread the Gospel worldwide',
    estimatedMinutes: 60,
    keyVerses: ['Acts 2:1-4', 'Romans 8:28', 'Ephesians 2:8-9'],
    reflectionQuestion: 'What role do you feel called to play in God\'s mission in the world?',
    content: 'When the Day of Pentecost had fully come, they were all with one accord in one place. And suddenly there came a sound from heaven, as of a rushing mighty wind, and it filled the whole house where they were sitting.'
  },
  {
    id: 'future_hope',
    title: 'Future Hope',
    description: 'God\'s ultimate victory and the promise of new heaven and new earth',
    estimatedMinutes: 30,
    keyVerses: ['Revelation 21:1-4', 'Revelation 22:20'],
    reflectionQuestion: 'How does the promise of God\'s perfect future give you hope today?',
    content: 'Now I saw a new heaven and a new earth, for the first heaven and the first earth had passed away. Also there was no more sea. Then I, John, saw the holy city, New Jerusalem, coming down out of heaven from God, prepared as a bride adorned for her husband.'
  }
];

export function BibleInADayFeature() {
  const { toast } = useToast();
  const [selectedSessionType, setSelectedSessionType] = useState<'fast_track' | 'deep_dive' | 'audio_only'>('fast_track');
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [isReading, setIsReading] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [sectionStartTime, setSectionStartTime] = useState<Date | null>(null);
  const [reflectionAnswer, setReflectionAnswer] = useState('');
  const [finalRating, setFinalRating] = useState<number>(0);
  const [finalReflection, setFinalReflection] = useState('');

  // Fetch active session
  const { data: activeSession, refetch: refetchActiveSession } = useQuery<any>({
    queryKey: ['/api/bible-in-a-day/sessions/active'],
    enabled: true,
  });

  // Fetch session progress
  const { data: sessionProgress } = useQuery<any[]>({
    queryKey: ['/api/bible-in-a-day/sessions', activeSession?.id, 'progress'],
    enabled: !!activeSession?.id,
  });

  // Fetch user badges
  const { data: badges } = useQuery<any[]>({
    queryKey: ['/api/bible-in-a-day/badges'],
  });

  // Start new session mutation
  const startSessionMutation = useMutation({
    mutationFn: async (sessionType: 'fast_track' | 'deep_dive' | 'audio_only') => {
      const targetDuration = sessionType === 'fast_track' ? 60 : sessionType === 'deep_dive' ? 300 : 45;
      const response = await apiRequest('POST', '/api/bible-in-a-day/sessions', { sessionType, targetDuration });
      return await response.json();
    },
    onSuccess: () => {
      refetchActiveSession();
      setSessionStartTime(new Date());
      toast({ title: "Session Started!", description: "Your Bible in a Day journey has begun." });
    },
    onError: (error) => {
      toast({ title: "Error", description: "Failed to start session. Please try again.", variant: "destructive" });
    },
  });

  // Create section progress mutation
  const createProgressMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/bible-in-a-day/progress', data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bible-in-a-day/sessions', activeSession?.id, 'progress'] });
    },
  });

  // Complete section mutation
  const completeSectionMutation = useMutation({
    mutationFn: async ({ progressId, reflectionAnswer }: { progressId: number; reflectionAnswer: string }) => {
      const response = await apiRequest('POST', `/api/bible-in-a-day/progress/${progressId}/complete`, { reflectionAnswer });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bible-in-a-day/sessions', activeSession?.id, 'progress'] });
      toast({ title: "Section Complete!", description: "Great progress on your journey." });
    },
  });

  // Complete session mutation
  const completeSessionMutation = useMutation({
    mutationFn: async ({ sessionId, finalRating, reflectionNotes }: { sessionId: number; finalRating: number; reflectionNotes: string }) => {
      const response = await apiRequest('POST', `/api/bible-in-a-day/sessions/${sessionId}/complete`, { finalRating, reflectionNotes });
      return await response.json();
    },
    onSuccess: () => {
      refetchActiveSession();
      queryClient.invalidateQueries({ queryKey: ['/api/bible-in-a-day/badges'] });
      toast({ 
        title: "Journey Complete!", 
        description: "You've completed the Bible in a Day! Check your new badge.",
      });
    },
  });

  const currentSection = BIBLE_SECTIONS[currentSectionIndex];
  const completedSections = sessionProgress?.filter((p: any) => p.isCompleted) || [];
  const totalProgress = (completedSections.length / BIBLE_SECTIONS.length) * 100;

  const handleStartSession = () => {
    startSessionMutation.mutate(selectedSessionType);
  };

  const handleStartSection = () => {
    if (!activeSession) return;
    
    setIsReading(true);
    setSectionStartTime(new Date());
    
    createProgressMutation.mutate({
      sessionId: activeSession.id,
      sectionKey: currentSection.id,
      sectionTitle: currentSection.title,
    });
  };

  const handleCompleteSection = () => {
    if (!reflectionAnswer.trim()) {
      toast({ title: "Reflection Required", description: "Please share your reflection before continuing.", variant: "destructive" });
      return;
    }

    const currentProgress = sessionProgress?.find((p: any) => 
      p.sectionKey === currentSection.id && !p.isCompleted
    );

    if (currentProgress) {
      completeSectionMutation.mutate({
        progressId: currentProgress.id,
        reflectionAnswer,
      });
    }

    setReflectionAnswer('');
    setIsReading(false);
    setSectionStartTime(null);

    if (currentSectionIndex < BIBLE_SECTIONS.length - 1) {
      setCurrentSectionIndex(prev => prev + 1);
    }
  };

  const handleCompleteSession = () => {
    if (!activeSession || finalRating === 0) return;

    completeSessionMutation.mutate({
      sessionId: activeSession.id,
      finalRating,
      reflectionNotes: finalReflection,
    });
  };

  const isSessionComplete = completedSections.length === BIBLE_SECTIONS.length;
  const filteredSections = BIBLE_SECTIONS; // All sections included for simplified implementation

  if (!activeSession) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Explore the Story of the Bible in Just One Day
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Discover God's amazing love story from Creation to New Creation through curated passages, guided reflections, and spiritual insights
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
            selectedSessionType === 'fast_track' ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950' : ''
          }`} onClick={() => setSelectedSessionType('fast_track')}>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-blue-600" />
                <CardTitle>Fast Track</CardTitle>
              </div>
              <CardDescription>
                ~60 minutes • 20 key passages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li>• Essential Bible narrative</li>
                <li>• Perfect for busy schedules</li>
                <li>• Core themes highlighted</li>
                <li>• Quick but meaningful</li>
              </ul>
            </CardContent>
          </Card>

          <Card className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
            selectedSessionType === 'deep_dive' ? 'ring-2 ring-purple-500 bg-purple-50 dark:bg-purple-950' : ''
          }`} onClick={() => setSelectedSessionType('deep_dive')}>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5 text-purple-600" />
                <CardTitle>Deep Dive</CardTitle>
              </div>
              <CardDescription>
                ~3-5 hours • 40+ passages with context
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li>• Comprehensive exploration</li>
                <li>• Includes minor prophets</li>
                <li>• Rich historical context</li>
                <li>• Deep spiritual insights</li>
              </ul>
            </CardContent>
          </Card>

          <Card className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
            selectedSessionType === 'audio_only' ? 'ring-2 ring-green-500 bg-green-50 dark:bg-green-950' : ''
          }`} onClick={() => setSelectedSessionType('audio_only')}>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Volume2 className="h-5 w-5 text-green-600" />
                <CardTitle>Audio-Only Mode</CardTitle>
              </div>
              <CardDescription>
                ~45 minutes • Listen while you go
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li>• Perfect for commuting</li>
                <li>• Narrated explanations</li>
                <li>• Background music</li>
                <li>• Hands-free experience</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Button 
            size="lg" 
            onClick={handleStartSession}
            disabled={startSessionMutation.isPending}
            className="px-8 py-3 text-lg"
          >
            {startSessionMutation.isPending ? 'Starting...' : 'Begin Your Journey'}
          </Button>
        </div>

        {badges && badges.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="h-5 w-5" />
                <span>Your Achievements</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {badges.map((badge: any) => (
                  <Badge key={badge.id} variant="secondary" className="flex items-center space-x-1">
                    <Star className="h-3 w-3" />
                    <span>{badge.badgeType.replace('_', ' ').toUpperCase()}</span>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  if (isSessionComplete && !activeSession.isCompleted) {
    const shareText = `I just completed the Bible In A Day journey on SoapBox! What an incredible experience discovering God's love story from Creation to New Creation. #BibleInADay #SoapBoxApp`;
    const shareUrl = window.location.origin;

    const handleShare = (platform: string) => {
      let url = '';
      switch (platform) {
        case 'twitter':
          url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
          break;
        case 'facebook':
          url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
          break;
        case 'copy':
          navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
          toast({ title: "Copied to clipboard!", description: "Share link copied successfully." });
          return;
      }
      if (url) window.open(url, '_blank');
    };

    return (
      <div className="max-w-3xl mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card>
            <CardHeader className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900 dark:to-blue-900 rounded-full mb-4">
                <Award className="h-10 w-10 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-3xl mb-2">Journey Complete!</CardTitle>
              <CardDescription className="text-lg">
                You've experienced God's amazing love story from Creation to New Creation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border-b pb-6">
                <h3 className="text-lg font-semibold mb-4">Share Your Achievement</h3>
                <div className="flex justify-center space-x-3">
                  <Button onClick={() => handleShare('twitter')} variant="outline" size="sm">
                    <Twitter className="h-4 w-4 mr-2" />
                    Twitter
                  </Button>
                  <Button onClick={() => handleShare('facebook')} variant="outline" size="sm">
                    <Facebook className="h-4 w-4 mr-2" />
                    Facebook
                  </Button>
                  <Button onClick={() => handleShare('copy')} variant="outline" size="sm">
                    <Share2 className="h-4 w-4 mr-2" />
                    Copy Link
                  </Button>
                </div>
              </div>

              <div>
                <Label>Rate Your Experience (1-5 stars)</Label>
                <div className="flex space-x-2 mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Button
                      key={star}
                      variant={finalRating >= star ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFinalRating(star)}
                    >
                      <Star className={`h-4 w-4 ${finalRating >= star ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                    </Button>
                  ))}
                </div>
              </div>
              
              <div>
                <Label htmlFor="final-reflection">Final Reflection</Label>
                <Textarea
                  id="final-reflection"
                  placeholder="What was the most meaningful part of your journey? How has this experience impacted your faith?"
                  value={finalReflection}
                  onChange={(e) => setFinalReflection(e.target.value)}
                  className="mt-2"
                  rows={4}
                />
              </div>

              <div className="flex space-x-3">
                <Button 
                  onClick={handleCompleteSession}
                  disabled={finalRating === 0 || completeSessionMutation.isPending}
                  className="flex-1"
                >
                  {completeSessionMutation.isPending ? 'Completing...' : 'Complete Journey'}
                </Button>
                <Button variant="outline" onClick={() => window.location.reload()}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  New Journey
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Bible in a Day Journey
          </h1>
          <Badge variant="outline" className="flex items-center space-x-1">
            <Clock className="h-3 w-3" />
            <span>{activeSession.sessionType === 'fast_track' ? 'Fast Track' : 'Full Immersion'}</span>
          </Badge>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
            <span>Progress: {completedSections.length} of {filteredSections.length} sections</span>
            <span>{Math.round(totalProgress)}% complete</span>
          </div>
          <Progress value={totalProgress} className="w-full" />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5" />
            <span>{currentSection.title}</span>
          </CardTitle>
          <CardDescription>{currentSection.description}</CardDescription>
          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300">
            <span className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>{currentSection.estimatedMinutes} min</span>
            </span>
            <span>Key verses: {currentSection.keyVerses.join(', ')}</span>
          </div>
        </CardHeader>
        
        <CardContent>
          {!isReading ? (
            <div className="text-center py-8">
              <Button onClick={handleStartSection} size="lg" className="mb-4">
                <Play className="h-4 w-4 mr-2" />
                Start Reading
              </Button>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Take your time to read and reflect on this section
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
                <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                  {currentSection.content}
                </p>
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                    Continue reading the full section in your Bible or Bible app...
                  </p>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-semibold mb-3">Reflection Question:</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-4 italic">
                  {currentSection.reflectionQuestion}
                </p>
                
                <Textarea
                  placeholder="Share your thoughts and reflections..."
                  value={reflectionAnswer}
                  onChange={(e) => setReflectionAnswer(e.target.value)}
                  rows={4}
                  className="mb-4"
                />

                <div className="flex space-x-3">
                  <Button onClick={handleCompleteSection} disabled={!reflectionAnswer.trim()}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Complete Section
                  </Button>
                  <Button variant="outline" onClick={() => setIsReading(false)}>
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {sessionProgress && sessionProgress.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Your Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sessionProgress.map((progress: any, index: number) => (
                <div key={progress.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded">
                  <div className="flex items-center space-x-3">
                    {progress.isCompleted ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-gray-300"></div>
                    )}
                    <span className={progress.isCompleted ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500'}>
                      {progress.sectionName}
                    </span>
                  </div>
                  {progress.isCompleted && (
                    <Badge variant="secondary">Complete</Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}