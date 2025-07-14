import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "../hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { BookOpen, Calendar, Heart, Share2 } from "lucide-react";
import MobileNav from "../components/mobile-nav";
import { useToast } from "../hooks/use-toast";
import { useLanguage } from "../contexts/LanguageContext";

export default function BiblePage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [, setLocation] = useLocation();

  // Fetch daily verse from API
  const { data: dailyVerse, isLoading: verseLoading, error: verseError } = useQuery({
    queryKey: ["/api/bible/daily-verse"],
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 60, // Cache for 1 hour since verse changes daily
    cacheTime: 1000 * 60 * 60 * 24, // Keep in cache for 24 hours
  });

  const currentVerse = dailyVerse || {
    verseReference: "Loading...",
    verseText: "Loading today's verse...",
    theme: "Daily Inspiration"
  };

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Welcome! Please sign in",
        description: "Sign in for personalized Bible reading.",
        variant: "default",
      });
      setTimeout(() => {
        setLocation("/login");
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Today's Reading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 pb-16 sm:pb-20 md:pb-0">
      <div className="max-w-4xl mx-auto px-2 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6">
        {/* Header */}
        <div className="text-center mb-4 sm:mb-6 md:mb-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">
            {t('nav.todaysReading')}
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

        {/* Daily Verse Card */}
        <Card className="mb-4 sm:mb-6 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <BookOpen className="w-6 h-6 text-blue-600" />
              <CardTitle className="text-xl text-gray-900">{t('bible.dailyVerse')}</CardTitle>
            </div>
            <Badge variant="secondary" className="mx-auto">
              {currentVerse?.theme || t('bible.dailyInspiration')}
            </Badge>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <blockquote className="text-lg italic text-gray-700 leading-relaxed">
              "{currentVerse?.verseText || t('bible.loadingVerse')}"
            </blockquote>
            <p className="font-semibold text-blue-600">
              {currentVerse?.verseReference || t('common.loading')}
            </p>
            
            {/* Personalization indicator */}
            {dailyVerse?.isPersonalized && (
              <div className="mt-2">
                <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                  Personalized for your {dailyVerse.personalizedFor} mood
                </Badge>
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-3 pt-3 sm:pt-4">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center justify-center gap-2 text-xs sm:text-sm px-3 sm:px-4 py-2"
                onClick={() => {
                  toast({
                    title: t('bible.reflectionStarted'),
                    description: t('bible.reflectionDescription')
                  });
                }}
              >
                <Heart className="w-4 h-4" />
                {t('bible.reflect')}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center justify-center gap-2 text-xs sm:text-sm px-3 sm:px-4 py-2"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: t('bible.dailyVerse'),
                      text: `"${currentVerse?.verseText || ""}" - ${currentVerse?.verseReference || ""}`,
                      url: window.location.href
                    });
                  } else {
                    navigator.clipboard.writeText(`"${currentVerse?.verseText || ""}" - ${currentVerse?.verseReference || ""}"`);
                    toast({
                      title: t('bible.copiedToClipboard'),
                      description: t('bible.verseCopied')
                    });
                  }
                }}
              >
                <Share2 className="w-4 h-4" />
                {t('bible.share')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="text-center border-0 shadow-md bg-white/70 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-blue-600">7</div>
              <p className="text-sm text-gray-600">{t('bible.dayStreak')}</p>
            </CardContent>
          </Card>
          <Card className="text-center border-0 shadow-md bg-white/70 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">42</div>
              <p className="text-sm text-gray-600">{t('bible.versesRead')}</p>
            </CardContent>
          </Card>
          <Card className="text-center border-0 shadow-md bg-white/70 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-purple-600">3</div>
              <p className="text-sm text-gray-600">{t('bible.badgesEarned')}</p>
            </CardContent>
          </Card>
        </div>

        {/* Reading Plan */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              {t('bible.readingPlan')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="font-medium">{t('bible.dailyDevotional')}</span>
                <Badge variant="secondary">{t('bible.active')}</Badge>
              </div>
              <p className="text-sm text-gray-600">
                Continue your spiritual journey with daily scripture readings and reflections.
              </p>
              <Button 
                className="w-full mt-4"
                onClick={() => {
                  toast({
                    title: t('bible.readingPlanActive'),
                    description: t('bible.dailyContentPersonalized')
                  });
                }}
              >
                {t('bible.continueReading')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <MobileNav />
    </div>
  );
}