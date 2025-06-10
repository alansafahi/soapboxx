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
import { Clock, BookOpen, Award, CheckCircle, Play, Pause, RotateCcw, Star } from 'lucide-react';
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
    title: 'Creation & The Fall',
    description: 'The beginning of everything and humanity\'s first choices',
    estimatedMinutes: 45,
    keyVerses: ['Genesis 1:1', 'Genesis 1:27', 'Genesis 3:15'],
    reflectionQuestion: 'How does understanding God as Creator change your perspective on your daily life?',
    content: 'In the beginning God created the heavens and the earth. The earth was without form and void, and darkness was over the face of the deep. And the Spirit of God was hovering over the face of the waters. And God said, "Let there be light," and there was light...'
  },
  {
    id: 'covenant',
    title: 'God\'s Covenant People',
    description: 'Abraham, Isaac, Jacob, and the formation of God\'s chosen people',
    estimatedMinutes: 60,
    keyVerses: ['Genesis 12:1-3', 'Genesis 17:7', 'Genesis 22:18'],
    reflectionQuestion: 'What does God\'s faithfulness to His promises with Abraham teach you about trusting God today?',
    content: 'Now the Lord said to Abram, "Go from your country and your kindred and your father\'s house to the land that I will show you. And I will make of you a great nation, and I will bless you and make your name great, so that you will be a blessing..."'
  },
  {
    id: 'exodus',
    title: 'Deliverance & The Law',
    description: 'God\'s rescue of Israel and establishment of His law',
    estimatedMinutes: 75,
    keyVerses: ['Exodus 3:14', 'Exodus 20:1-17', 'Exodus 34:6-7'],
    reflectionQuestion: 'How do you see God\'s character of both justice and mercy revealed in the Exodus story?',
    content: 'God said to Moses, "I AM WHO I AM." And he said, "Say this to the people of Israel: \'I AM has sent me to you.\'" God also said to Moses, "Say this to the people of Israel: \'The Lord, the God of your fathers, the God of Abraham, the God of Isaac, and the God of Jacob, has sent me to you...\'\"'
  },
  {
    id: 'kingdom',
    title: 'The Kingdom Era',
    description: 'From judges to kings - David, Solomon, and the divided kingdom',
    estimatedMinutes: 90,
    keyVerses: ['1 Samuel 16:7', '2 Samuel 7:16', '1 Kings 8:27'],
    reflectionQuestion: 'What can we learn from the successes and failures of Israel\'s kings about leadership and following God?',
    content: 'But the Lord said to Samuel, "Do not look on his appearance or on the height of his stature, because I have rejected him. For the Lord sees not as man sees: man looks on the outward appearance, but the Lord looks on the heart."'
  },
  {
    id: 'prophets',
    title: 'Prophets & Exile',
    description: 'God\'s warnings, judgment, and promises of restoration',
    estimatedMinutes: 60,
    keyVerses: ['Isaiah 53:4-6', 'Jeremiah 29:11', 'Ezekiel 36:26'],
    reflectionQuestion: 'How do the prophets\' messages of both judgment and hope speak to our world today?',
    content: 'Surely he has borne our griefs and carried our sorrows; yet we esteemed him stricken, smitten by God, and afflicted. But he was pierced for our transgressions; he was crushed for our iniquities; upon him was the chastisement that brought us peace, and with his wounds we are healed.'
  },
  {
    id: 'jesus',
    title: 'The Life of Jesus',
    description: 'The promised Messiah - His birth, ministry, death, and resurrection',
    estimatedMinutes: 120,
    keyVerses: ['John 1:14', 'John 3:16', 'John 14:6', 'Matthew 28:18-20'],
    reflectionQuestion: 'How does Jesus\' life, death, and resurrection change everything about how you understand God and life?',
    content: 'And the Word became flesh and dwelt among us, and we have seen his glory, glory as of the only Son from the Father, full of grace and truth... For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life.'
  },
  {
    id: 'church',
    title: 'The Early Church',
    description: 'Pentecost, Paul\'s missions, and the spread of the Gospel',
    estimatedMinutes: 75,
    keyVerses: ['Acts 2:38', 'Romans 8:28', '1 Corinthians 13:13', 'Ephesians 2:8-9'],
    reflectionQuestion: 'What does the early church\'s unity and mission teach us about Christian community today?',
    content: 'And Peter said to them, "Repent and be baptized every one of you in the name of Jesus Christ for the forgiveness of your sins, and you will receive the gift of the Holy Spirit. For the promise is for you and for your children and for all who are far off, everyone whom the Lord our God calls to himself."'
  },
  {
    id: 'revelation',
    title: 'The New Heaven & Earth',
    description: 'God\'s ultimate victory and the restoration of all things',
    estimatedMinutes: 45,
    keyVerses: ['Revelation 21:1-4', 'Revelation 22:20'],
    reflectionQuestion: 'How does the promise of God\'s ultimate victory and new creation give you hope for today?',
    content: 'Then I saw a new heaven and a new earth, for the first heaven and the first earth had passed away, and the sea was no more. And I saw the holy city, new Jerusalem, coming down out of heaven from God, prepared as a bride adorned for her husband...'
  }
];

export function BibleInADayFeature() {
  const { toast } = useToast();
  const [selectedSessionType, setSelectedSessionType] = useState<'fast_track' | 'full_immersion'>('fast_track');
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [isReading, setIsReading] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [sectionStartTime, setSectionStartTime] = useState<Date | null>(null);
  const [reflectionAnswer, setReflectionAnswer] = useState('');
  const [finalRating, setFinalRating] = useState<number>(0);
  const [finalReflection, setFinalReflection] = useState('');

  // Fetch active session
  const { data: activeSession, refetch: refetchActiveSession } = useQuery({
    queryKey: ['/api/bible-in-a-day/sessions/active'],
    enabled: true,
  });

  // Fetch session progress
  const { data: sessionProgress } = useQuery({
    queryKey: ['/api/bible-in-a-day/sessions', activeSession?.id, 'progress'],
    enabled: !!activeSession?.id,
  });

  // Fetch user badges
  const { data: badges } = useQuery({
    queryKey: ['/api/bible-in-a-day/badges'],
  });

  // Start new session mutation
  const startSessionMutation = useMutation({
    mutationFn: async (sessionType: 'fast_track' | 'full_immersion') => {
      return await apiRequest('/api/bible-in-a-day/sessions', {
        method: 'POST',
        body: { sessionType, targetDuration: sessionType === 'fast_track' ? 360 : 600 },
      });
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
      return await apiRequest('/api/bible-in-a-day/progress', {
        method: 'POST',
        body: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bible-in-a-day/sessions', activeSession?.id, 'progress'] });
    },
  });

  // Complete section mutation
  const completeSectionMutation = useMutation({
    mutationFn: async ({ progressId, reflectionAnswer }: { progressId: number; reflectionAnswer: string }) => {
      return await apiRequest(`/api/bible-in-a-day/progress/${progressId}/complete`, {
        method: 'POST',
        body: { reflectionAnswer },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bible-in-a-day/sessions', activeSession?.id, 'progress'] });
      toast({ title: "Section Complete!", description: "Great progress on your journey." });
    },
  });

  // Complete session mutation
  const completeSessionMutation = useMutation({
    mutationFn: async ({ sessionId, finalRating, reflectionNotes }: { sessionId: number; finalRating: number; reflectionNotes: string }) => {
      return await apiRequest(`/api/bible-in-a-day/sessions/${sessionId}/complete`, {
        method: 'POST',
        body: { finalRating, reflectionNotes },
      });
    },
    onSuccess: () => {
      refetchActiveSession();
      queryClient.invalidateQueries({ queryKey: ['/api/bible-in-a-day/badges'] });
      toast({ 
        title: "🎉 Journey Complete!", 
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
      sectionName: currentSection.title,
      sectionOrder: currentSectionIndex + 1,
      estimatedDuration: currentSection.estimatedMinutes,
    });
  };

  const handleCompleteSection = () => {
    if (!reflectionAnswer.trim()) {
      toast({ title: "Reflection Required", description: "Please share your reflection before continuing.", variant: "destructive" });
      return;
    }

    const currentProgress = sessionProgress?.find((p: any) => 
      p.sectionName === currentSection.title && !p.isCompleted
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
  const filteredSections = selectedSessionType === 'fast_track' 
    ? BIBLE_SECTIONS.filter((_, index) => [0, 2, 5, 7].includes(index))
    : BIBLE_SECTIONS;

  if (!activeSession) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Bible in a Day
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Experience the complete story of God's love through an accelerated journey
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
            selectedSessionType === 'fast_track' ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950' : ''
          }`} onClick={() => setSelectedSessionType('fast_track')}>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-blue-600" />
                <CardTitle>Fast Track (6 Hours)</CardTitle>
              </div>
              <CardDescription>
                Essential Bible narrative in focused sections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li>• 4 core sections</li>
                <li>• Key biblical themes</li>
                <li>• Perfect for busy schedules</li>
                <li>• Guided reflections</li>
              </ul>
            </CardContent>
          </Card>

          <Card className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
            selectedSessionType === 'full_immersion' ? 'ring-2 ring-purple-500 bg-purple-50 dark:bg-purple-950' : ''
          }`} onClick={() => setSelectedSessionType('full_immersion')}>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5 text-purple-600" />
                <CardTitle>Full Immersion (10 Hours)</CardTitle>
              </div>
              <CardDescription>
                Complete biblical story with deep exploration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li>• All 8 major sections</li>
                <li>• Comprehensive coverage</li>
                <li>• In-depth reflections</li>
                <li>• Ultimate spiritual challenge</li>
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
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">🎉 Journey Complete!</CardTitle>
            <CardDescription>
              You've experienced the entire Bible story. How was your experience?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
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
                    <Star className="h-4 w-4" />
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

            <Button 
              onClick={handleCompleteSession}
              disabled={finalRating === 0 || completeSessionMutation.isPending}
              className="w-full"
            >
              {completeSessionMutation.isPending ? 'Completing...' : 'Complete Journey'}
            </Button>
          </CardContent>
        </Card>
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