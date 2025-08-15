import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Brain, Users, Sparkles, ArrowRight } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface EMIMood {
  id: number;
  name: string;
  emoji: string;
  category: string;
  subcategory?: string;
  colorHex: string;
  moodScore: number;
}

interface EMIPreSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (selectedMoods: number[], curatedPlans: any[]) => void;
  planType: 'advanced' | 'torchbearer';
}

const categoryIcons: Record<string, any> = {
  'Spiritual States': Sparkles,
  'Emotional Well-being': Heart,
  'Life Circumstances': Users,
  'Seeking Support': Brain,
};

export default function EMIPreSelectionModal({ 
  isOpen, 
  onClose, 
  onComplete,
  planType 
}: EMIPreSelectionModalProps) {
  const [selectedMoods, setSelectedMoods] = useState<number[]>([]);
  const [step, setStep] = useState<'intro' | 'selection' | 'preferences' | 'loading' | 'results'>('intro');
  const [curatedPlans, setCuratedPlans] = useState<any[]>([]);
  const [preferences, setPreferences] = useState({
    testament: 'both',
    order: 'canonical',
    translation: 'all',
    difficulty: 'advanced',
    duration: 21,
    dailyTime: '15-30'
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch EMI moods
  const { data: emiMoods = [], isLoading: moodsLoading } = useQuery<EMIMood[]>({
    queryKey: ['/api/enhanced-mood-indicators'],
    enabled: isOpen,
  });

  // Group moods by category
  const moodsByCategory = emiMoods.reduce((acc, mood) => {
    if (!acc[mood.category]) {
      acc[mood.category] = [];
    }
    acc[mood.category].push(mood);
    return acc;
  }, {} as Record<string, EMIMood[]>);

  const generateCuratedPlans = useMutation({
    mutationFn: async (emiData: { selectedMoods: number[]; preferences: any }) => {
      return await apiRequest('POST', '/api/reading-plans/ai-curated', {
        ...emiData,
        planType,
        requestType: 'pre-selection-curation'
      });
    },
    onSuccess: (data) => {
      setCuratedPlans(data.curatedPlans || []);
      setStep('results');
    },
    onError: (error) => {

      toast({
        title: "Error",
        description: "Unable to generate personalized recommendations. Please try again.",
        variant: "destructive",
      });
      setStep('selection');
    },
  });

  const createCustomPlan = useMutation({
    mutationFn: async (customPlanData: any) => {
      return await apiRequest('POST', '/api/reading-plans/create-custom', {
        customPlanData
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Success!",
        description: "Your custom reading plan has been saved to 'My Reading Plans' and you can now access it daily!",
        variant: "default",
      });
      // Invalidate reading plans cache to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['/api/reading-plans'] });
      queryClient.invalidateQueries({ queryKey: ['/api/reading-plans/user/subscriptions'] });
      onClose();
    },
    onError: (error) => {

      toast({
        title: "Error",
        description: "Failed to create your custom reading plan. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleMoodToggle = (moodId: number) => {
    setSelectedMoods(prev => 
      prev.includes(moodId) 
        ? prev.filter(id => id !== moodId)
        : [...prev, moodId]
    );
  };

  const handleContinueToPreferences = () => {
    if (selectedMoods.length === 0) {
      toast({
        title: "Selection Required",
        description: "Please select at least one mood to get personalized recommendations.",
        variant: "destructive",
      });
      return;
    }
    setStep('preferences');
  };

  const handleGenerateRecommendations = () => {
    setStep('loading');
    generateCuratedPlans.mutate({ selectedMoods, preferences });
  };

  const handleComplete = () => {
    onComplete(selectedMoods, curatedPlans);
    onClose();
  };

  const handleSkip = () => {
    onComplete([], []);
    onClose();
  };

  const handleCreateCustomPlan = (plan: any) => {
    if (plan.customPlanData) {
      createCustomPlan.mutate(plan.customPlanData);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        {step === 'intro' && (
          <div className="text-center py-6">
            <DialogHeader>
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-blue-600" />
              </div>
              <DialogTitle className="text-2xl">
                Get Personalized {planType === 'advanced' ? 'Advanced' : 'Torchbearer'} Reading Plans
              </DialogTitle>
              <DialogDescription className="text-lg mt-4 max-w-2xl mx-auto">
                To give you the most meaningful spiritual journey, let us understand your current emotional and spiritual state. 
                This helps us recommend the best {planType} reading plans for you right now.
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Button onClick={() => setStep('selection')} className="bg-blue-600 hover:bg-blue-700">
                <Heart className="w-4 h-4 mr-2" />
                Share My Current State
              </Button>
              <Button variant="outline" onClick={handleSkip}>
                Skip & Browse All Plans
              </Button>
            </div>
          </div>
        )}

        {step === 'selection' && (
          <div>
            <DialogHeader>
              <DialogTitle>How are you feeling today?</DialogTitle>
              <DialogDescription>
                Select all moods that resonate with your current spiritual and emotional state. 
                This helps us recommend reading plans that will meet you exactly where you are.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-6 space-y-6">
              {moodsLoading && (
                <div className="text-center py-8 text-gray-500">
                  Loading moods...
                </div>
              )}
              
              {!moodsLoading && emiMoods.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No moods available
                </div>
              )}
              
              {Object.entries(moodsByCategory).map(([category, moods]) => {
                const IconComponent = categoryIcons[category] || Heart;
                const categorySelectionCount = moods.filter(mood => selectedMoods.includes(mood.id)).length;
                
                return (
                  <div key={category} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <IconComponent className="w-5 h-5 text-blue-600" />
                      <h3 className="font-medium text-gray-900">{category}</h3>
                      {categorySelectionCount > 0 && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          {categorySelectionCount} selected
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 pl-7">
                      {moods.map((mood) => (
                        <button
                          key={mood.id}
                          onClick={() => handleMoodToggle(mood.id)}
                          className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                            selectedMoods.includes(mood.id)
                              ? 'bg-blue-600 text-white shadow-md transform scale-105'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <span className="mr-1">{mood.emoji}</span>
                          {mood.name}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between items-center mt-8 pt-6 border-t">
              <div className="text-sm text-gray-600">
                {selectedMoods.length} mood{selectedMoods.length !== 1 ? 's' : ''} selected
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleSkip}>
                  Skip This Step
                </Button>
                <Button 
                  onClick={handleContinueToPreferences}
                  disabled={selectedMoods.length === 0}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Continue to Preferences
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {step === 'preferences' && (
          <div>
            <DialogHeader>
              <DialogTitle>Customize Your Reading Plan Preferences</DialogTitle>
              <DialogDescription>
                Help us create the perfect reading plan by sharing your preferences for scripture study.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Testament Focus
                  </label>
                  <select 
                    value={preferences.testament} 
                    onChange={(e) => setPreferences({...preferences, testament: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="both">Both Old & New Testament</option>
                    <option value="old">Old Testament</option>
                    <option value="new">New Testament</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reading Order
                  </label>
                  <select 
                    value={preferences.order} 
                    onChange={(e) => setPreferences({...preferences, order: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="canonical">Canonical (Biblical order)</option>
                    <option value="chronological">Chronological (Historical order)</option>
                    <option value="thematic">Thematic (Topic-based)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bible Translation
                  </label>
                  <select 
                    value={preferences.translation} 
                    onChange={(e) => setPreferences({...preferences, translation: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All translations</option>
                    <option value="NIV">NIV (New International Version)</option>
                    <option value="KJV">KJV (King James Version)</option>
                    <option value="ESV">ESV (English Standard Version)</option>
                    <option value="NLT">NLT (New Living Translation)</option>
                    <option value="NASB">NASB (New American Standard Bible)</option>
                    <option value="CSB">CSB (Christian Standard Bible)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Plan Duration
                  </label>
                  <select 
                    value={preferences.duration} 
                    onChange={(e) => setPreferences({...preferences, duration: parseInt(e.target.value)})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="14">14 days (2 weeks)</option>
                    <option value="21">21 days (3 weeks)</option>
                    <option value="30">30 days (1 month)</option>
                    <option value="60">60 days (2 months)</option>
                    <option value="90">90 days (3 months)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Daily Reading Time
                  </label>
                  <select 
                    value={preferences.dailyTime} 
                    onChange={(e) => setPreferences({...preferences, dailyTime: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="5-10">5-10 minutes</option>
                    <option value="10-15">10-15 minutes</option>
                    <option value="15-30">15-30 minutes</option>
                    <option value="30-45">30-45 minutes</option>
                    <option value="45+">45+ minutes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Study Depth
                  </label>
                  <select 
                    value={preferences.difficulty} 
                    onChange={(e) => setPreferences({...preferences, difficulty: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="beginner">Beginner (Simple devotions)</option>
                    <option value="intermediate">Intermediate (Balanced study)</option>
                    <option value="advanced">Advanced (Deep theological study)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center mt-8 pt-6 border-t">
              <Button variant="outline" onClick={() => setStep('selection')}>
                Back to Mood Selection
              </Button>
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleSkip}>
                  Skip & Use Defaults
                </Button>
                <Button 
                  onClick={handleGenerateRecommendations}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Generate My Custom Plan
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {step === 'loading' && (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <DialogTitle>Creating Your Personalized Recommendations</DialogTitle>
            <DialogDescription className="mt-2">
              Our AI is analyzing your emotional state to find the perfect reading plans for your spiritual journey...
            </DialogDescription>
          </div>
        )}

        {step === 'results' && (
          <div>
            <DialogHeader>
              <DialogTitle>Your Personalized {planType} Reading Plans</DialogTitle>
              <DialogDescription>
                Based on your current state, here are the reading plans that will best support your spiritual journey:
              </DialogDescription>
            </DialogHeader>

            <div className="mt-6 space-y-4">
              {curatedPlans.length > 0 ? (
                <>
                  {curatedPlans.map((plan, index) => (
                    <div key={plan.id || index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{plan.title}</h3>
                          <p className="text-gray-600 mt-1">{plan.description}</p>
                          <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                            <span>{plan.duration} days</span>
                            <span>•</span>
                            <span className="capitalize">{plan.difficulty}</span>
                            {plan.aiReason && (
                              <>
                                <span>•</span>
                                <span className="text-blue-600 italic">{plan.aiReason}</span>
                              </>
                            )}
                          </div>
                          {plan.isCustomPlan && (
                            <Button 
                              className="mt-3 bg-purple-600 hover:bg-purple-700 text-white"
                              onClick={() => handleCreateCustomPlan(plan)}
                            >
                              Start This Custom Plan
                            </Button>
                          )}
                        </div>
                        <Badge className={plan.isCustomPlan ? "bg-purple-100 text-purple-800" : "bg-green-100 text-green-800"}>
                          {plan.isCustomPlan ? "AI Generated" : "Recommended"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600">No specific recommendations generated. You'll see all available plans.</p>
                </div>
              )}
            </div>

            <div className="flex justify-center mt-8">
              <Button onClick={handleComplete} className="bg-blue-600 hover:bg-blue-700">
                View These Plans
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}