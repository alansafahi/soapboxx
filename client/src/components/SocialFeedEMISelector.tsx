import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import { X, Heart } from "lucide-react";
import type { EnhancedMoodIndicator } from "@shared/schema";

interface SocialFeedEMISelectorProps {
  selectedMoods: number[];
  onMoodToggle: (moodId: number) => void;
  maxMoods?: number;
  compact?: boolean;
}

export default function SocialFeedEMISelector({
  selectedMoods,
  onMoodToggle,
  maxMoods = 3,
  compact = false
}: SocialFeedEMISelectorProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  



  // Fetch mood indicators by category - use the correct endpoint that groups by category
  const { data: moodsByCategory = {}, isLoading } = useQuery<Record<string, EnhancedMoodIndicator[]>>({
    queryKey: ["/api/enhanced-mood-indicators/by-category"],
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  // Get all moods as flat array for compatibility
  const allMoods = Object.values(moodsByCategory).flat();

  // FORCE CONSOLE LOGGING ALWAYS







  const getSelectedMoodsData = (): EnhancedMoodIndicator[] => {
    const allMoods: EnhancedMoodIndicator[] = [];
    Object.values(moodsByCategory).forEach((categoryMoods: any) => {
      allMoods.push(...categoryMoods);
    });
    return allMoods.filter(mood => selectedMoods.includes(mood.id));
  };

  const isMoodSelected = (moodId: number) => selectedMoods.includes(moodId);
  const canSelectMore = selectedMoods.length < maxMoods;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  let categories = Object.keys(moodsByCategory);
  
  // SHOW ALL 6 CATEGORIES - NO FILTERING
  
  
  
  
  const selectedMoodsData = getSelectedMoodsData();

  return (
    <div className="space-y-4">
      {/* Selected Moods Display */}
      {selectedMoods.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Selected moods ({selectedMoods.length}/{maxMoods}):
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedMoodsData.map((mood) => (
              <div
                key={mood.id}
                className="flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/20 rounded-full border border-purple-200 dark:border-purple-700"
              >
                <span className="text-sm">{mood.emoji}</span>
                <span className="text-xs font-medium text-purple-800 dark:text-purple-200">
                  {mood.name}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onMoodToggle(mood.id)}
                  className="h-4 w-4 p-0 text-purple-400 hover:text-purple-600 ml-1"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mood Categories */}
      <div className="space-y-3">
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
          How are you feeling? {!canSelectMore && "(Max 3 selected)"}
        </div>

        {compact ? (
          // Compact view for smaller spaces - test with 2x3 grid (should show 6 but was showing 4)
          <div className="grid grid-cols-2 gap-2 max-h-none overflow-visible">
            {categories.sort().map((categoryName) => {
              const categoryMoods = moodsByCategory[categoryName];
              const hasSelected = categoryMoods.some((mood: EnhancedMoodIndicator) => isMoodSelected(mood.id));
              
              return (
                <Button
                  key={categoryName}
                  variant={hasSelected ? "default" : "outline"}
                  size="sm"
                  onClick={() => setExpandedCategory(expandedCategory === categoryName ? null : categoryName)}
                  className={`h-auto p-2 justify-start ${hasSelected ? 'bg-purple-600 hover:bg-purple-700' : ''}`}
                >
                  <div className="text-left w-full">
                    <div className="text-xs font-medium">{categoryName}</div>
                    {hasSelected && (
                      <div className="text-xs opacity-75">
                        {categoryMoods.filter((m: EnhancedMoodIndicator) => isMoodSelected(m.id)).length} selected
                      </div>
                    )}
                  </div>
                </Button>
              );
            })}
          </div>
        ) : (
          // Full view
          <ScrollArea className="h-64">
            <div className="space-y-3">
              {categories.sort().map((categoryName) => {
                const categoryMoods = moodsByCategory[categoryName];
                const isExpanded = expandedCategory === categoryName;
                const hasSelected = categoryMoods.some((mood: EnhancedMoodIndicator) => isMoodSelected(mood.id));

                return (
                  <Card key={categoryName} className={`${hasSelected ? 'border-purple-200 dark:border-purple-700' : ''}`}>
                    <CardHeader 
                      className="pb-2 cursor-pointer"
                      onClick={() => setExpandedCategory(isExpanded ? null : categoryName)}
                    >
                      <CardTitle className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                          {categoryName}
                          {hasSelected && (
                            <Badge variant="secondary" className="text-xs">
                              {categoryMoods.filter((m: EnhancedMoodIndicator) => isMoodSelected(m.id)).length} selected
                            </Badge>
                          )}
                        </span>
                        <span className="text-gray-400">{isExpanded ? '−' : '+'}</span>
                      </CardTitle>
                    </CardHeader>
                    
                    {isExpanded && (
                      <CardContent className="pt-0">
                        <div className="grid grid-cols-3 gap-2">
                          {categoryMoods.map((mood: EnhancedMoodIndicator) => {
                            const isSelected = isMoodSelected(mood.id);
                            const canSelect = canSelectMore || isSelected;

                            return (
                              <Button
                                key={mood.id}
                                variant={isSelected ? "default" : "outline"}
                                size="sm"
                                onClick={() => canSelect && onMoodToggle(mood.id)}
                                disabled={!canSelect}
                                className={`h-auto p-2 flex flex-col items-center gap-1 text-xs ${
                                  isSelected 
                                    ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                                    : !canSelect 
                                    ? 'opacity-50 cursor-not-allowed' 
                                    : 'hover:bg-purple-50 dark:hover:bg-purple-900/20'
                                }`}
                                title={mood.description || `${mood.name} - ${mood.subcategory || categoryName}`}
                              >
                                <span className="text-base">{mood.emoji}</span>
                                <span className="text-xs font-medium leading-tight text-center">
                                  {mood.name}
                                </span>
                                {mood.subcategory && (
                                  <span className="text-xs opacity-75">
                                    {mood.subcategory}
                                  </span>
                                )}
                              </Button>
                            );
                          })}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        )}

        {/* Expanded Category Modal for Compact View */}
        {compact && expandedCategory && (
          <Card className="border-purple-200 dark:border-purple-700">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-sm">
                <span>{expandedCategory}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setExpandedCategory(null)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-3 gap-2">
                {moodsByCategory[expandedCategory]?.map((mood: EnhancedMoodIndicator) => {
                  const isSelected = isMoodSelected(mood.id);
                  const canSelect = canSelectMore || isSelected;

                  return (
                    <Button
                      key={mood.id}
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      onClick={() => canSelect && onMoodToggle(mood.id)}
                      disabled={!canSelect}
                      className={`h-auto p-2 flex flex-col items-center gap-1 text-xs ${
                        isSelected 
                          ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                          : !canSelect 
                          ? 'opacity-50 cursor-not-allowed' 
                          : 'hover:bg-purple-50 dark:hover:bg-purple-900/20'
                      }`}
                      title={mood.description || `${mood.name} - ${mood.subcategory || expandedCategory}`}
                    >
                      <span className="text-base">{mood.emoji}</span>
                      <span className="text-xs font-medium leading-tight text-center">
                        {mood.name}
                      </span>
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}