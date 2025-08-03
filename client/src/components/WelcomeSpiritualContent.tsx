import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { Heart, BookOpen, Star, Lightbulb, ChevronRight, Clock, ArrowRight, Gift } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';

interface WelcomeContentPackage {
  welcomeMessage: string;
  scriptures: Array<{
    verse: string;
    reference: string;
    explanation?: string;
  }>;
  devotionals: Array<{
    day: number;
    title: string;
    content: string;
    readTime: number;
    theme: string;
  }>;
  personalizedPrayer: {
    title: string;
    content: string;
    guidance: string;
  };
  readingPlan: {
    title: string;
    description: string;
    duration: string;
    difficulty: string;
  };
  communityConnections: Array<{
    type: string;
    title: string;
    description: string;
  }>;
}

interface WelcomeSpiritualContentProps {
  onComplete: () => void;
  assessmentData: any;
}

export default function WelcomeSpiritualContent({ onComplete, assessmentData }: WelcomeSpiritualContentProps) {
  const [currentView, setCurrentView] = useState<'overview' | 'scriptures' | 'devotionals' | 'prayer' | 'reading'>('overview');
  const [expandedDevotional, setExpandedDevotional] = useState<number | null>(null);

  // Fetch AI-generated welcome content based on assessment
  const { data: welcomeContent, isLoading, error } = useQuery<WelcomeContentPackage>({
    queryKey: ['/api/ai/welcome-content', JSON.stringify(assessmentData)],
    queryFn: async () => {
      return apiRequest('POST', '/api/ai/welcome-content', {
        assessmentData
      });
    },
    enabled: !!assessmentData,
    staleTime: Infinity, // Cache forever for onboarding
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center py-16">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent mx-auto"></div>
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Creating Your Spiritual Welcome Package</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Personalizing content based on your assessment responses...
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !welcomeContent) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="text-center py-16">
            <Gift className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Welcome to Your Spiritual Journey!</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              We're preparing personalized content for you. You can continue to explore the app and check back later.
            </p>
            <Button onClick={onComplete}>Continue to App</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div className="text-center space-y-4 p-6 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg">
        <Gift className="w-16 h-16 text-purple-600 mx-auto" />
        <h2 className="text-2xl font-bold">Your Personalized Welcome Package</h2>
        <p className="text-gray-700 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
          {welcomeContent.welcomeMessage}
        </p>
      </div>

      {/* Content Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow border-l-4 border-l-purple-500"
          onClick={() => setCurrentView('scriptures')}
        >
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-600" />
              <CardTitle className="text-lg">Scripture Collection</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
              {welcomeContent.scriptures.length} carefully selected verses for your spiritual journey
            </p>
            <Button variant="ghost" size="sm" className="w-full">
              Explore Scriptures <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow border-l-4 border-l-blue-500"
          onClick={() => setCurrentView('devotionals')}
        >
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-blue-600" />
              <CardTitle className="text-lg">First Week Devotionals</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
              7 days of personalized devotional content to start your journey
            </p>
            <Button variant="ghost" size="sm" className="w-full">
              View Devotionals <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow border-l-4 border-l-green-500"
          onClick={() => setCurrentView('prayer')}
        >
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-green-600" />
              <CardTitle className="text-lg">Personal Prayer</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
              A personalized prayer and guidance for your specific needs
            </p>
            <Button variant="ghost" size="sm" className="w-full">
              View Prayer <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow border-l-4 border-l-orange-500"
          onClick={() => setCurrentView('reading')}
        >
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-orange-600" />
              <CardTitle className="text-lg">Reading Plan</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
              {welcomeContent.readingPlan.title} - {welcomeContent.readingPlan.duration}
            </p>
            <Button variant="ghost" size="sm" className="w-full">
              View Plan <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 border-l-4 border-l-teal-500">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-teal-600" />
              <CardTitle className="text-lg">Community Connections</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {welcomeContent.communityConnections.map((connection, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <ChevronRight className="w-3 h-3 text-gray-400" />
                  <span className="font-medium">{connection.title}</span>
                  <span className="text-gray-500">- {connection.description}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderScriptures = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <BookOpen className="w-6 h-6 text-purple-600" />
        <h3 className="text-xl font-semibold">Your Scripture Collection</h3>
      </div>
      
      {welcomeContent.scriptures.map((scripture, index) => (
        <Card key={index} className="border-l-4 border-l-purple-500">
          <CardContent className="pt-6">
            <blockquote className="text-lg italic text-gray-800 dark:text-gray-200 mb-3 leading-relaxed">
              "{scripture.verse}"
            </blockquote>
            <p className="text-right text-sm font-medium text-purple-600 mb-3">
              - {scripture.reference}
            </p>
            {scripture.explanation && (
              <div className="pt-3 border-t">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {scripture.explanation}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderDevotionals = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <Star className="w-6 h-6 text-blue-600" />
        <h3 className="text-xl font-semibold">Your First Week Journey</h3>
      </div>
      
      {welcomeContent.devotionals.map((devotional, index) => (
        <Card key={index} className="border-l-4 border-l-blue-500">
          <CardHeader 
            className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
            onClick={() => setExpandedDevotional(expandedDevotional === index ? null : index)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-blue-600">{devotional.day}</span>
                </div>
                <div>
                  <CardTitle className="text-lg">{devotional.title}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs">{devotional.theme}</Badge>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      {devotional.readTime} min
                    </div>
                  </div>
                </div>
              </div>
              <ChevronRight className={`w-4 h-4 transition-transform ${
                expandedDevotional === index ? 'rotate-90' : ''
              }`} />
            </div>
          </CardHeader>
          {expandedDevotional === index && (
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {devotional.content}
              </p>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );

  const renderPrayer = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Heart className="w-6 h-6 text-green-600" />
        <h3 className="text-xl font-semibold">Your Personal Prayer</h3>
      </div>
      
      <Card className="border-l-4 border-l-green-500">
        <CardHeader>
          <CardTitle className="text-lg">{welcomeContent.personalizedPrayer.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <p className="text-gray-800 dark:text-gray-200 leading-relaxed italic">
              {welcomeContent.personalizedPrayer.content}
            </p>
          </div>
          <Separator />
          <div>
            <h4 className="font-medium mb-2 text-green-700 dark:text-green-300">Prayer Guidance:</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {welcomeContent.personalizedPrayer.guidance}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderReadingPlan = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Lightbulb className="w-6 h-6 text-orange-600" />
        <h3 className="text-xl font-semibold">Your Recommended Reading Plan</h3>
      </div>
      
      <Card className="border-l-4 border-l-orange-500">
        <CardHeader>
          <CardTitle className="text-xl">{welcomeContent.readingPlan.title}</CardTitle>
          <div className="flex gap-2 mt-2">
            <Badge variant="outline">{welcomeContent.readingPlan.duration}</Badge>
            <Badge variant="outline">{welcomeContent.readingPlan.difficulty}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            {welcomeContent.readingPlan.description}
          </p>
          <Button className="w-full">
            Start Reading Plan
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {currentView !== 'overview' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentView('overview')}
                  className="text-sm"
                >
                  ← Back to Overview
                </Button>
              )}
            </div>
            <Button onClick={onComplete} variant="outline">
              Continue to App
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <ScrollArea className="h-[70vh]">
            {currentView === 'overview' && renderOverview()}
            {currentView === 'scriptures' && renderScriptures()}
            {currentView === 'devotionals' && renderDevotionals()}
            {currentView === 'prayer' && renderPrayer()}
            {currentView === 'reading' && renderReadingPlan()}
          </ScrollArea>
          
          {currentView === 'overview' && (
            <div className="mt-6 pt-6 border-t text-center">
              <Button onClick={onComplete} size="lg" className="min-w-[200px]">
                Enter Your Spiritual Home
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <p className="text-sm text-gray-500 mt-2">
                Your personalized content will be available anytime in your profile
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}