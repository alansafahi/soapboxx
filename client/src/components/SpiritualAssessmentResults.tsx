import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  Heart, 
  BookOpen, 
  Brain, 
  Users, 
  Star, 
  Trophy, 
  Target,
  ChevronRight,
  CheckCircle 
} from 'lucide-react';

interface SpiritualAssessmentResultsProps {
  assessmentData: any;
  spiritualGifts: string[];
  spiritualProfile: any;
  welcomeContent: any;
  spiritualMaturityLevel: string;
  onContinue: () => void;
  returnTo?: string;
}

export default function SpiritualAssessmentResults({
  assessmentData,
  spiritualGifts,
  spiritualProfile,
  welcomeContent,
  spiritualMaturityLevel,
  onContinue,
  returnTo
}: SpiritualAssessmentResultsProps) {
  
  const getMaturityLevelColor = (level: string) => {
    switch (level) {
      case 'new': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'growing': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'mature': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getGiftIcon = (gift: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      'leadership': <Star className="h-4 w-4" />,
      'teaching': <BookOpen className="h-4 w-4" />,
      'mercy': <Heart className="h-4 w-4" />,
      'administration': <Brain className="h-4 w-4" />,
      'evangelism': <Users className="h-4 w-4" />,
      'service': <Target className="h-4 w-4" />,
      'encouragement': <Trophy className="h-4 w-4" />,
    };
    return iconMap[gift] || <Star className="h-4 w-4" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="max-w-4xl mx-auto py-8 space-y-6">
        
        {/* Header */}
        <Card className="border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
            <CardTitle className="text-3xl font-bold text-purple-900 dark:text-purple-100">
              Your Spiritual Assessment Results
            </CardTitle>
            <CardDescription className="text-lg text-purple-700 dark:text-purple-300">
              Discover your unique spiritual gifts and growth opportunities
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Spiritual Maturity Level */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Spiritual Maturity Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <Badge className={`text-lg px-4 py-2 ${getMaturityLevelColor(spiritualMaturityLevel)}`}>
                  {spiritualMaturityLevel?.charAt(0).toUpperCase() + spiritualMaturityLevel?.slice(1)} Believer
                </Badge>
                <p className="text-muted-foreground mt-2">
                  Based on your responses about faith journey, Bible familiarity, and spiritual practices
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Spiritual Gifts */}
        {spiritualGifts && spiritualGifts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Your Spiritual Gifts
              </CardTitle>
              <CardDescription>
                Top spiritual gifts identified through your assessment responses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {spiritualGifts.map((gift, index) => (
                  <div key={gift} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    {getGiftIcon(gift)}
                    <span className="font-medium capitalize">{gift.replace('_', ' ')}</span>
                    {index === 0 && <Badge variant="secondary" className="ml-auto">Primary</Badge>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Welcome Content */}
        {welcomeContent && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Personalized Welcome Package
              </CardTitle>
              <CardDescription>
                Custom spiritual content generated just for you
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {welcomeContent.welcomeMessage && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Welcome Message</h4>
                  <p className="text-blue-800 dark:text-blue-200">{welcomeContent.welcomeMessage}</p>
                </div>
              )}

              {welcomeContent.recommendations && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {welcomeContent.recommendations.devotionals && (
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2 flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        Recommended Devotionals
                      </h4>
                      <ul className="space-y-1 text-green-800 dark:text-green-200">
                        {Array.isArray(welcomeContent.recommendations.devotionals) ? 
                          welcomeContent.recommendations.devotionals.map((devotional: string, index: number) => (
                            <li key={index}>• {devotional}</li>
                          )) : 
                          <li>• {welcomeContent.recommendations.devotionals}</li>
                        }
                      </ul>
                    </div>
                  )}

                  {welcomeContent.recommendations.ministry && (
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2 flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Ministry Suggestions
                      </h4>
                      <p className="text-purple-800 dark:text-purple-200">• {welcomeContent.recommendations.ministry}</p>
                    </div>
                  )}
                </div>
              )}

              {welcomeContent.nextSteps && (
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                  <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-2 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Your Next Steps
                  </h4>
                  <ul className="space-y-1 text-amber-800 dark:text-amber-200">
                    {Array.isArray(welcomeContent.nextSteps) ? 
                      welcomeContent.nextSteps.map((step: string, index: number) => (
                        <li key={index}>• {step}</li>
                      )) : 
                      <li>• {welcomeContent.nextSteps}</li>
                    }
                  </ul>
                </div>
              )}

              {welcomeContent.encouragement && (
                <div className="p-4 bg-rose-50 dark:bg-rose-900/20 rounded-lg">
                  <h4 className="font-semibold text-rose-900 dark:text-rose-100 mb-2 flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    Encouragement
                  </h4>
                  <p className="text-rose-800 dark:text-rose-200 italic">"{welcomeContent.encouragement}"</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={onContinue}
                className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
                size="lg"
              >
                {returnTo === 'profile' ? 'Return to Profile' : 'Continue to Dashboard'}
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.location.href = '/spiritual-assessment'}
                size="lg"
              >
                Retake Assessment
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}