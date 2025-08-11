import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Brain, Sparkles, Heart } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface AIPersonalizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  planId: number;
  planName: string;
  onPersonalized: () => void;
}

export function AIPersonalizationModal({ 
  isOpen, 
  onClose, 
  planId, 
  planName, 
  onPersonalized 
}: AIPersonalizationModalProps) {
  const [currentMood, setCurrentMood] = useState("");
  const [currentStruggle, setCurrentStruggle] = useState("");
  const [focusArea, setFocusArea] = useState("");
  
  const queryClient = useQueryClient();

  // Get EMI prompts for this specific plan
  const { data: emiData } = useQuery({
    queryKey: ["/api/reading-plans", planId, "emi-prompts"],
    enabled: isOpen
  });

  const personalizeplanMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest(`/api/reading-plans/${planId}/personalize`, "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reading-plans", planId] });
      onPersonalized();
      onClose();
    }
  });

  const handlePersonalize = () => {
    personalizeplanMutation.mutate({
      currentMood,
      currentStruggle,
      focusArea
    });
  };

  const prompts = (emiData as any)?.prompts || [
    "How are you feeling today?",
    "What's on your heart as you begin this reading plan?",
    "Are there any specific areas where you'd like to grow spiritually?",
    "What challenges or blessings are you experiencing right now?"
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-600" />
            AI Personalization
            <Badge variant="secondary" className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              <Sparkles className="h-3 w-3 mr-1" />
              Torchbearer
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Help us personalize <strong>{planName}</strong> for your spiritual journey. 
            Your responses will be used to create relevant reflections and prayers.
          </p>

          <div className="space-y-3">
            <div>
              <Label htmlFor="mood" className="text-sm font-medium">
                {prompts[0]}
              </Label>
              <Textarea
                id="mood"
                placeholder="I'm feeling hopeful but also a bit overwhelmed..."
                value={currentMood}
                onChange={(e) => setCurrentMood(e.target.value)}
                className="mt-1"
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="struggle" className="text-sm font-medium">
                {prompts[1]}
              </Label>
              <Textarea
                id="struggle"
                placeholder="I'm struggling with finding peace in busy seasons..."
                value={currentStruggle}
                onChange={(e) => setCurrentStruggle(e.target.value)}
                className="mt-1"
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="focus" className="text-sm font-medium">
                {prompts[2]}
              </Label>
              <Textarea
                id="focus"
                placeholder="I want to grow in trusting God with my decisions..."
                value={focusArea}
                onChange={(e) => setFocusArea(e.target.value)}
                className="mt-1"
                rows={2}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <Heart className="h-4 w-4 text-blue-600" />
            <p className="text-xs text-blue-700 dark:text-blue-300">
              Your responses help create personalized reflections, prayers, and applications
              tailored to your current spiritual state and growth goals.
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
            >
              Maybe Later
            </Button>
            <Button 
              onClick={handlePersonalize}
              disabled={personalizeplanMutation.isPending}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {personalizeplanMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Personalizing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Personalize Plan
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}