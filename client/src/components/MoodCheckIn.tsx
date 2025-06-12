import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Heart, BookOpen, Brain } from "lucide-react";

interface MoodCheckInProps {
  onComplete?: () => void;
}

const moodOptions = [
  { emoji: "😇", label: "Blessed", value: "blessed", score: 5 },
  { emoji: "😊", label: "Joyful", value: "joyful", score: 4 },
  { emoji: "😐", label: "Neutral", value: "neutral", score: 3 },
  { emoji: "😔", label: "Struggling", value: "struggling", score: 2 },
  { emoji: "😭", label: "Overwhelmed", value: "overwhelmed", score: 1 }
];

export default function MoodCheckIn({ onComplete }: MoodCheckInProps) {
  const [selectedMood, setSelectedMood] = useState<typeof moodOptions[0] | null>(null);
  const [notes, setNotes] = useState("");
  const [shareWithStaff, setShareWithStaff] = useState(false);
  const [personalizedContent, setPersonalizedContent] = useState<any>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const submitMoodMutation = useMutation({
    mutationFn: async () => {
      if (!selectedMood) throw new Error("Please select a mood");
      
      const response = await apiRequest("POST", "/api/mood-checkins", {
        mood: selectedMood.value,
        moodScore: selectedMood.score,
        moodEmoji: selectedMood.emoji,
        notes: notes.trim() || null,
        shareWithStaff,
        generatePersonalizedContent: true
      });
      return await response.json();
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
        title: "Error",
        description: "Failed to record mood check-in. Please try again.",
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
            onClick={() => setPersonalizedContent(null)} 
            variant="outline" 
            className="w-full"
          >
            Back to Mood Check-in
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
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
        <div className="grid grid-cols-5 gap-2">
          {moodOptions.map((mood) => (
            <Button
              key={mood.value}
              variant={selectedMood?.value === mood.value ? "default" : "outline"}
              className={`h-16 flex flex-col items-center gap-1 text-xs ${
                selectedMood?.value === mood.value 
                  ? "bg-purple-600 hover:bg-purple-700" 
                  : "hover:bg-purple-50"
              }`}
              onClick={() => setSelectedMood(mood)}
            >
              <span className="text-2xl">{mood.emoji}</span>
              <span className="text-xs">{mood.label}</span>
            </Button>
          ))}
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
          disabled={!selectedMood || submitMoodMutation.isPending}
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          {submitMoodMutation.isPending ? "Recording..." : "Get Personalized Content"}
        </Button>
      </CardContent>
    </Card>
  );
}