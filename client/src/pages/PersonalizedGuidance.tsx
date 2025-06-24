import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Heart, BookOpen, MessageCircle, Sparkles, Calendar, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

interface PersonalizedContent {
  id: number;
  userId: string;
  moodCheckinId: number;
  contentType: string;
  title: string;
  content: string;
  createdAt: string;
  viewed: boolean;
  helpful: boolean | null;
}

interface AIRecommendation {
  type: 'verse' | 'devotional' | 'prayer' | 'meditation' | 'article';
  title: string;
  content: string;
  reason: string;
}

interface AIContent {
  mood: string;
  moodScore: number;
  recommendations: AIRecommendation[];
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'verse':
      return <BookOpen className="h-4 w-4" />;
    case 'devotional':
      return <Heart className="h-4 w-4" />;
    case 'prayer':
      return <MessageCircle className="h-4 w-4" />;
    case 'meditation':
      return <Sparkles className="h-4 w-4" />;
    case 'article':
      return <BookOpen className="h-4 w-4" />;
    default:
      return <Heart className="h-4 w-4" />;
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'verse':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    case 'devotional':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
    case 'prayer':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'meditation':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300';
    case 'article':
      return 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  }
};

const getMoodEmoji = (mood: string, score: number) => {
  if (score >= 4) return '😊';
  if (score === 3) return '😐';
  if (score <= 2) return '😔';
  return '🙏';
};

export default function PersonalizedGuidance() {
  const { data: personalizedContent, isLoading, refetch } = useQuery<PersonalizedContent[]>({
    queryKey: ['/api/personalized-content'],
  });

  const markAsViewed = async (contentId: number) => {
    try {
      await fetch(`/api/personalized-content/${contentId}/viewed`, {
        method: 'POST',
      });
      refetch();
    } catch (error) {
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 rounded animate-pulse" />
          <div className="h-32 bg-gray-200 rounded animate-pulse" />
          <div className="h-32 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Spiritual Guidance</h1>
          <p className="text-muted-foreground">
            Personalized biblical guidance based on your mood check-ins
          </p>
        </div>
        <Button onClick={() => refetch()} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {!personalizedContent || personalizedContent.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No AI Guidance Yet</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Complete a mood check-in with "Generate Personalized Content" enabled to receive 
              AI-powered spiritual guidance tailored to your current state.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {personalizedContent.map((content) => {
            const aiContent: AIContent = JSON.parse(content.content);
            
            return (
              <Card key={content.id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">
                        {getMoodEmoji(aiContent.mood, aiContent.moodScore)}
                      </div>
                      <div>
                        <CardTitle className="text-xl">
                          Guidance for {aiContent.mood} mood
                        </CardTitle>
                        <CardDescription>
                          Generated on {format(new Date(content.createdAt), 'PPP')} • 
                          Mood Score: {aiContent.moodScore}/5
                        </CardDescription>
                      </div>
                    </div>
                    {!content.viewed && (
                      <Badge variant="secondary">New</Badge>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  {aiContent.recommendations.map((recommendation, index) => (
                    <div key={index}>
                      <div className="flex items-center space-x-2 mb-3">
                        {getTypeIcon(recommendation.type)}
                        <Badge className={getTypeColor(recommendation.type)}>
                          {recommendation.type.toUpperCase()}
                        </Badge>
                        <h3 className="font-semibold">{recommendation.title}</h3>
                      </div>
                      
                      <ScrollArea className="max-h-32 mb-3">
                        <p className="text-sm leading-relaxed pr-4">
                          {recommendation.content}
                        </p>
                      </ScrollArea>
                      
                      <div className="bg-muted p-3 rounded-lg">
                        <p className="text-xs text-muted-foreground">
                          <strong>Why this helps:</strong> {recommendation.reason}
                        </p>
                      </div>
                      
                      {index < aiContent.recommendations.length - 1 && (
                        <Separator className="mt-4" />
                      )}
                    </div>
                  ))}
                  
                  {!content.viewed && (
                    <div className="pt-4 border-t">
                      <Button 
                        onClick={() => markAsViewed(content.id)}
                        variant="outline" 
                        size="sm"
                      >
                        Mark as Read
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}