import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { BookOpen, Heart, Lightbulb, Clock, Star, ChevronRight, Sparkles } from 'lucide-react';
import { apiRequest } from '../lib/queryClient';

interface ContentRecommendation {
  type: 'verse' | 'prayer' | 'devotional' | 'meditation' | 'application';
  title: string;
  content: string;
  reason: string;
  confidence: number;
  priority: number;
  estimatedReadTime: number;
  difficulty: string;
  topics: string[];
  scriptureReferences?: string[];
  actionable?: boolean;
  emiAlignment?: string[];
}

interface EMIAwareRecommendationsProps {
  selectedMoodIds: number[];
  emiCategories: string[];
  isVisible?: boolean;
  compact?: boolean;
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'verse': return <BookOpen className="w-4 h-4" />;
    case 'prayer': return <Heart className="w-4 h-4" />;
    case 'devotional': return <Star className="w-4 h-4" />;
    case 'meditation': return <Lightbulb className="w-4 h-4" />;
    case 'application': return <ChevronRight className="w-4 h-4" />;
    default: return <Sparkles className="w-4 h-4" />;
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'verse': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-200';
    case 'prayer': return 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-200';
    case 'devotional': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200';
    case 'meditation': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200';
    case 'application': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-200';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200';
  }
};

export default function EMIAwareRecommendations({ 
  selectedMoodIds, 
  emiCategories, 
  isVisible = true,
  compact = false 
}: EMIAwareRecommendationsProps) {
  const [expandedCard, setExpandedCard] = useState<number | null>(null);

  // Debug logging
  console.log('EMIAwareRecommendations props:', { selectedMoodIds, emiCategories, isVisible, compact });

  // Only fetch recommendations when EMI moods are selected
  const { data: recommendations = [], isLoading, error } = useQuery<ContentRecommendation[]>({
    queryKey: ['/api/ai/emi-recommendations', selectedMoodIds.join(','), emiCategories.join(',')],
    queryFn: async () => {
      console.log('EMI Recommendations API call with:', { selectedMoodIds, emiCategories });
      if (selectedMoodIds.length === 0) return [];
      
      return apiRequest('POST', '/api/ai/emi-recommendations', {
        selectedMoodIds,
        emiCategories
      });
    },
    enabled: isVisible && selectedMoodIds.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  console.log('EMI Recommendations state:', { 
    selectedMoodCount: selectedMoodIds.length, 
    isLoading, 
    error: error?.message, 
    recommendationsCount: recommendations.length 
  });

  if (!isVisible || selectedMoodIds.length === 0) {
    console.log('EMI Recommendations not visible:', { isVisible, selectedMoodCount: selectedMoodIds.length });
    return null;
  }

  if (isLoading) {
    return (
      <Card className="mt-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600" />
            Personalized Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-purple-600 border-t-transparent"></div>
            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
              Generating personalized content based on your feelings...
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || recommendations.length === 0) {
    return (
      <Card className="mt-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600" />
            Personalized Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Select your feelings above to receive personalized spiritual content and guidance.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Sort recommendations by priority and confidence
  const sortedRecommendations = recommendations
    .sort((a, b) => (a.priority - b.priority) || (b.confidence - a.confidence))
    .slice(0, compact ? 3 : 6);

  return (
    <Card className="mt-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-600" />
          Personalized Recommendations
          <Badge variant="secondary" className="text-xs">
            {emiCategories.length} categories
          </Badge>
        </CardTitle>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          Based on your current emotional and spiritual state
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {sortedRecommendations.map((rec, index) => (
          <div
            key={index}
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:shadow-sm transition-shadow cursor-pointer"
            onClick={() => setExpandedCard(expandedCard === index ? null : index)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <div className={`p-1.5 rounded-full ${getTypeColor(rec.type)}`}>
                  {getTypeIcon(rec.type)}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm text-gray-900 dark:text-white">
                    {rec.title}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {rec.reason}
                  </p>
                  
                  {/* Content preview or full content */}
                  <div className="mt-2">
                    {expandedCard === index ? (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
                          {rec.content}
                        </p>
                        
                        {rec.scriptureReferences && rec.scriptureReferences.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {rec.scriptureReferences.map((ref, refIndex) => (
                              <Badge key={refIndex} variant="outline" className="text-xs">
                                {ref}
                              </Badge>
                            ))}
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          {rec.estimatedReadTime} min read
                          <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                          {rec.difficulty}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                        {rec.content.length > 100 
                          ? `${rec.content.substring(0, 100)}...` 
                          : rec.content
                        }
                      </p>
                    )}
                  </div>
                  
                  {rec.topics && rec.topics.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {rec.topics.slice(0, 3).map((topic, topicIndex) => (
                        <Badge key={topicIndex} variant="secondary" className="text-xs">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
              >
                <ChevronRight 
                  className={`w-3 h-3 transition-transform ${
                    expandedCard === index ? 'rotate-90' : ''
                  }`} 
                />
              </Button>
            </div>
          </div>
        ))}
        
        {recommendations.length > (compact ? 3 : 6) && (
          <div className="text-center pt-2">
            <Button variant="ghost" size="sm" className="text-xs text-purple-600 hover:text-purple-700">
              View {recommendations.length - (compact ? 3 : 6)} more recommendations
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}