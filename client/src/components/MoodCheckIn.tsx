import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Textarea } from "./ui/textarea";
import { Checkbox } from "./ui/checkbox";
import { Badge } from "./ui/badge";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import { useToast } from "../hooks/use-toast";
import { Heart, BookOpen, Brain, X } from "lucide-react";

interface MoodCheckInProps {
  onComplete?: () => void;
}

import { moodCategories, allMoods } from "../lib/moodCategories";

export default function MoodCheckIn({ onComplete }: MoodCheckInProps) {
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [shareWithStaff, setShareWithStaff] = useState(false);
  const [personalizedContent, setPersonalizedContent] = useState<any>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const toggleMoodSelection = (moodId: string) => {
    setSelectedMoods(prev => 
      prev.includes(moodId) 
        ? prev.filter(id => id !== moodId)
        : [...prev, moodId]
    );
  };

  const clearMoods = () => {
    setSelectedMoods([]);
  };

  const getSelectedMoodsData = () => {
    return allMoods.filter(mood => selectedMoods.includes(mood.id));
  };

  const submitMoodMutation = useMutation({
    mutationFn: async () => {
      if (selectedMoods.length === 0) throw new Error("Please select at least one feeling");
      
      const selectedMoodsData = getSelectedMoodsData();
      const primaryMood = selectedMoodsData[0];
      const averageScore = selectedMoodsData.length > 0 ? 
        Math.round(selectedMoodsData.reduce((sum, mood) => {
          // Assign scores based on category and mood type
          let score = 3; // neutral default
          if (mood.category === "Faith & Worship") score = 4;
          if (mood.category === "Growth & Transformation") score = 3;
          if (mood.category === "Life Situations") score = 3;
          if (mood.category === "Emotional & Spiritual Support") score = 2;
          return sum + score;
        }, 0) / selectedMoodsData.length) : 3;
      
      try {
        const response = await fetch("/api/mood-checkins", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
            "Referer": window.location.href,
          },
          body: JSON.stringify({
            mood: selectedMoods.join(", "),
            moodScore: averageScore,
            moodEmoji: primaryMood?.icon || "😊",
            notes: notes.trim() || null,
            shareWithStaff,
            generatePersonalizedContent: true,
            selectedMoods: selectedMoodsData.map(mood => ({
              id: mood.id,
              label: mood.label,
              category: mood.category,
              subtitle: mood.subtitle
            }))
          }),
          credentials: "include",
        });
        
        
        if (!response.ok) {
          const errorText = await response.text();
          
          if (response.status === 401) {
            throw new Error("Authentication required. Please refresh the page and try again.");
          }
          
          throw new Error(`Server error: ${response.status} - ${errorText}`);
        }
        
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          const text = await response.text();
          throw new Error("Server returned unexpected response format");
        }
        
        return await response.json();
      } catch (error) {
        throw error;
      }
    },
    onSuccess: (data) => {
      setPersonalizedContent(data.personalizedContent);
      toast({
        title: "Mood check-in recorded",
        description: "We've prepared some personalized content for you based on how you're feeling."
      });
      queryClient.invalidateQueries({ queryKey: ["/api/checkins"] });
      if (onComplete) onComplete();
    },
    onError: (error) => {
      toast({
        title: "Check-in Failed",
        description: error.message || "Failed to record mood check-in. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = () => {
    submitMoodMutation.mutate();
  };

  if (personalizedContent) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Heart className="h-5 w-5 text-purple-600" />
            Personalized Content for You
          </CardTitle>
          <CardDescription>
            Based on how you're feeling, here's some spiritual guidance just for you
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {personalizedContent.recommendations?.map((rec: any, index: number) => (
            <Card key={index} className="border-l-4 border-l-purple-600">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  {rec.type === 'verse' && <BookOpen className="h-4 w-4 text-purple-600" />}
                  {rec.type === 'prayer' && <Pray className="h-4 w-4 text-purple-600" />}
                  {rec.type === 'devotional' && <Heart className="h-4 w-4 text-purple-600" />}
                  {rec.type === 'meditation' && <Brain className="h-4 w-4 text-purple-600" />}
                  <CardTitle className="text-lg">{rec.title}</CardTitle>
                </div>
                <CardDescription>{rec.reason}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed mb-3">{rec.content}</p>
                <div className="flex flex-wrap gap-1 mb-2">
                  {rec.topics?.map((topic: string) => (
                    <Badge key={topic} variant="secondary" className="text-xs">
                      {topic}
                    </Badge>
                  ))}
                </div>
                {rec.scriptureReferences && (
                  <p className="text-xs text-muted-foreground">
                    Scripture: {rec.scriptureReferences.join(", ")}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  ⏱️ {rec.estimatedReadTime} min read
                </p>
              </CardContent>
            </Card>
          ))}
          <Button 
            onClick={() => {
              setPersonalizedContent(null);
              setSelectedMoods([]);
              setNotes("");
              setShareWithStaff(false);
            }} 
            variant="outline" 
            className="w-full"
          >
            New Mood Check-in
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Heart className="h-5 w-5 text-purple-600" />
          How are you feeling today?
        </CardTitle>
        <CardDescription>
          Share your mood to receive personalized spiritual content
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Selected Moods Display */}
        {selectedMoods.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Selected feelings:</div>
            <div className="flex flex-wrap gap-2">
              {getSelectedMoodsData().map((mood) => (
                <div key={mood.id} className="flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/20 rounded-full border border-purple-200 dark:border-purple-700">
                  <span className="text-sm">{mood.icon}</span>
                  <span className="text-xs font-medium text-purple-800 dark:text-purple-200">{mood.label}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleMoodSelection(mood.id)}
                    className="h-4 w-4 p-0 text-purple-400 hover:text-purple-600 ml-1"
                  >
                    <X className="h-2 w-2" />
                  </Button>
                </div>
              ))}
              {selectedMoods.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearMoods}
                  className="h-6 px-2 text-xs text-gray-500 hover:text-gray-700"
                >
                  Clear all
                </Button>
              )}
            </div>
          </div>
        )}

        {/* 4-Pillar Feelings Selector */}
        <div className="space-y-4 max-h-64 overflow-y-auto">
          {moodCategories.map((category) => {
            const hasSelectedMood = category.moods.some(mood => selectedMoods.includes(mood.id));
            return (
              <div key={category.title} className="space-y-2">
                <div className={`flex items-center gap-2 pb-2 border-b ${hasSelectedMood ? 'border-purple-300 dark:border-purple-600' : 'border-gray-200 dark:border-gray-600'}`}>
                  <span className="text-lg">{category.icon}</span>
                  <h3 className={`font-semibold text-sm ${hasSelectedMood ? 'text-purple-700 dark:text-purple-300' : 'text-gray-800 dark:text-white'}`}>
                    {category.title}
                    {hasSelectedMood && (
                      <span className="ml-2 text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded-full">
                        Selected
                      </span>
                    )}
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {category.moods.map((mood) => {
                    const isSelected = selectedMoods.includes(mood.id);
                    return (
                      <Button
                        key={mood.id}
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        className={`h-auto p-2 flex flex-col items-center gap-1 text-xs ${
                          isSelected 
                            ? "bg-purple-600 hover:bg-purple-700 text-white border-purple-600" 
                            : "hover:bg-purple-50 dark:hover:bg-purple-900/20 border-gray-200 dark:border-gray-600"
                        }`}
                        onClick={() => toggleMoodSelection(mood.id)}
                        title={mood.subtitle}
                      >
                        <span className="text-lg">{mood.icon}</span>
                        <span className="text-xs font-medium leading-tight text-center">
                          {mood.label}
                        </span>
                      </Button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">
            What's on your heart? (optional)
          </label>
          <Textarea
            placeholder="Share what's on your mind..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-[80px]"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="share-staff"
            checked={shareWithStaff}
            onCheckedChange={(checked) => setShareWithStaff(checked as boolean)}
          />
          <label
            htmlFor="share-staff"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Share with church staff for prayer support
          </label>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={selectedMoods.length === 0 || submitMoodMutation.isPending}
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          {submitMoodMutation.isPending ? "Recording..." : "Get Personalized Content"}
        </Button>
      </CardContent>
    </Card>
  );
}