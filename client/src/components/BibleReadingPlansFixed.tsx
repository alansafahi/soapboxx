import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Book, Calendar, Clock, Heart, Play, CheckCircle, Users, BookOpen, Target, Star, ChevronRight, ChevronDown, ChevronUp, Lock, Crown, Sparkles, Headphones, User, Eye, Shield, Volume2, Brain, Filter, TrendingUp } from "lucide-react";
import FilterBar, { ReadingPlanFilters } from '@/components/reading-plans/FilterBar';
import EMIPreSelectionModal from '@/components/reading-plans/EMIPreSelectionModal';

import { usePlanFilters } from '@/hooks/usePlanFilters';
import { AIIndicator } from "@/components/AIIndicator";
import { AIPersonalizationModal } from "@/components/AIPersonalizationModal";
import type { ReadingPlan, ReadingPlanDay, UserReadingPlanSubscription, UserReadingProgress, EnhancedMoodIndicator } from "@shared/schema";
import { ScrollArea } from "@/components/ui/scroll-area";
import EnhancedMoodIndicatorManager from "@/components/emi/EnhancedMoodIndicatorManager";
import { useUpgradeFlow } from "@/hooks/useUpgradeFlow";
import UpgradePathManager from "@/components/upgrade-flow/UpgradePathManager";
import AudioPlayer from "@/components/reading-plans/AudioPlayer";

interface ReadingPlanWithProgress extends ReadingPlan {
  subscription?: UserReadingPlanSubscription;
  progressPercentage?: number;
  daysCompleted?: number;
}

interface DayReaderProps {
  plan: ReadingPlan;
  day: ReadingPlanDay;
  userProgress?: UserReadingProgress;
  onComplete: (dayNumber: number, progressData: any) => void;
}

const DayReader = ({ plan, day, userProgress, onComplete }: DayReaderProps) => {
  const [reflectionText, setReflectionText] = useState(userProgress?.reflectionText || "");
  const [prayerText, setPrayerText] = useState(userProgress?.prayerText || "");
  const [emotionalReaction, setEmotionalReaction] = useState(userProgress?.emotionalReaction || "");
  const [personalInsights, setPersonalInsights] = useState(userProgress?.personalInsights || "");
  const [readingTimeMinutes, setReadingTimeMinutes] = useState(userProgress?.readingTimeMinutes || 0);
  const [selectedMood, setSelectedMood] = useState<EnhancedMoodIndicator | null>(null);

  // EMI should never be shown for existing plans - only for custom AI plan creation
  const shouldShowEMI = false;

  const handleComplete = () => {
    const progressData = {
      reflectionText,
      prayerText,
      emotionalReaction: selectedMood?.name || emotionalReaction,
      personalInsights,
      readingTimeMinutes
    };
    onComplete(day.dayNumber, progressData);
  };



  const isCompleted = !!userProgress?.completedAt;
  
  // Check if this is an audio reading plan
  const isAudioPlan = plan.name.includes('Audio') || plan.name.includes('Commute') || plan.name.includes('Quiet Mind') || plan.type === 'audio';

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Day Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center space-x-2">
          <Badge variant="outline" className="text-lg px-3 py-1">
            Day {day.dayNumber}
          </Badge>
          {isCompleted && (
            <Badge variant="default" className="bg-green-600 text-white">
              <CheckCircle className="w-4 h-4 mr-1" />
              Completed
            </Badge>
          )}
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{day.title}</h1>
        <p className="text-lg text-blue-600 dark:text-blue-400 font-semibold">{day.scriptureReference}</p>
      </div>

      {/* Scripture */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
            <BookOpen className="w-5 h-5" />
            Today's Scripture
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-200 italic">
            "{day.scriptureText}"
          </p>
        </CardContent>
      </Card>

      {/* Audio Player for Audio Reading Plans */}
      {isAudioPlan && (
        <AudioPlayer day={day} planName={plan.name} />
      )}

      {/* Devotional Content */}
      {day.devotionalContent && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500" />
              Reflection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {day.devotionalContent}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Interactive Elements */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Reflection */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Reflection</CardTitle>
            {day.reflectionQuestion && (
              <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  {day.reflectionQuestion}
                </p>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Write your thoughts and reflections here..."
              value={reflectionText}
              onChange={(e) => setReflectionText(e.target.value)}
              className="min-h-[100px]"
            />
          </CardContent>
        </Card>

        {/* Prayer */}
        <Card>
          <CardHeader>
            <CardTitle>Prayer Response</CardTitle>
            <CardDescription>How will you pray about today's reading?</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Write a prayer or prayer request..."
              value={prayerText}
              onChange={(e) => setPrayerText(e.target.value)}
              className="min-h-[100px]"
            />
          </CardContent>
        </Card>
      </div>



      {/* Additional Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Insights</CardTitle>
          <CardDescription>What is God teaching you through this passage?</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Record any personal insights, applications, or ways you want to live this out..."
            value={personalInsights}
            onChange={(e) => setPersonalInsights(e.target.value)}
            className="min-h-[100px]"
          />
        </CardContent>
      </Card>

      {/* Reading Time */}
      <Card>
        <CardHeader>
          <CardTitle>Reading Time</CardTitle>
          <CardDescription>How long did you spend reading and reflecting?</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={readingTimeMinutes}
              onChange={(e) => setReadingTimeMinutes(parseInt(e.target.value) || 0)}
              className="w-20"
              min="0"
            />
            <span className="text-gray-600 dark:text-gray-400">minutes</span>
          </div>
        </CardContent>
      </Card>

      {/* Complete Button */}
      <div className="text-center">
        <Button
          onClick={handleComplete}
          size="lg"
          className="px-12 py-3 text-lg"
          disabled={isCompleted}
        >
          {isCompleted ? (
            <>
              <CheckCircle className="w-5 h-5 mr-2" />
              Completed
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5 mr-2" />
              Complete Day {day.dayNumber}
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default function BibleReadingPlansFixed() {
  const [selectedPlan, setSelectedPlan] = useState<ReadingPlan | null>(null);
  const [selectedDay, setSelectedDay] = useState<ReadingPlanDay | null>(null);
  const [activeTab, setActiveTab] = useState("discover");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiPersonalizationEnabled, setAIPersonalizationEnabled] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showEMIModal, setShowEMIModal] = useState(false);

  const [selectedPlanForEMI, setSelectedPlanForEMI] = useState<ReadingPlan | null>(null);
  
  // Initialize plan filters hook
  const { filters, debouncedFilters, updateFilters, clearFilters } = usePlanFilters();
  
  // Collapsible state for each tier
  const [discipleExpanded, setDiscipleExpanded] = useState(false);
  const [servantExpanded, setServantExpanded] = useState(false);
  const [torchbearerExpanded, setTorchbearerExpanded] = useState(false);
  
  // Helper function to maintain scroll position when collapsing
  const handleToggleExpanded = (currentState: boolean, setter: (value: boolean) => void, sectionId: string) => {
    if (currentState) {
      // When collapsing, scroll to the section header to maintain context
      const sectionElement = document.getElementById(sectionId);
      if (sectionElement) {
        setter(!currentState);
        setTimeout(() => {
          sectionElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      } else {
        setter(!currentState);
      }
    } else {
      // When expanding, just toggle without scrolling
      setter(!currentState);
    }
  };
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Initialize upgrade flow
  const {
    showUpgradeFlow,
    trigger,
    planData,
    triggerLockedFeature,
    closeUpgradeFlow,
    handleUpgradeSuccess,
    userTier
  } = useUpgradeFlow(selectedPlan?.id);

  // Fetch all available reading plans - use filtered endpoint when filters are active
  const hasActiveFilters = Object.values(debouncedFilters).some(val => 
    Array.isArray(val) ? val.length > 0 : val
  );

  const { data: plans = [], isLoading: plansLoading } = useQuery<ReadingPlan[]>({
    queryKey: hasActiveFilters 
      ? ["/api/reading-plans/filtered", debouncedFilters] 
      : ["/api/reading-plans"],
    queryFn: async () => {
      if (hasActiveFilters) {
        const params = new URLSearchParams();
        Object.entries(debouncedFilters).forEach(([key, value]) => {
          if (Array.isArray(value) && value.length > 0) {
            params.set(key, value.join(','));
          } else if (typeof value === 'string' && value) {
            params.set(key, value);
          }
        });
        
        const response = await fetch(`/api/reading-plans/filtered?${params}`);
        if (!response.ok) {
          console.warn('Filtered API failed, falling back to all plans');
          const fallbackResponse = await fetch('/api/reading-plans');
          return fallbackResponse.json();
        }
        const data = await response.json();
        return data.items || data;
      } else {
        const response = await fetch('/api/reading-plans');
        if (!response.ok) throw new Error('Failed to fetch plans');
        return response.json();
      }
    },
    staleTime: 0,
    gcTime: 0,
  });

  // Fetch user's subscriptions
  const { data: subscriptions = [] } = useQuery<UserReadingPlanSubscription[]>({
    queryKey: ["/api/reading-plans/user/subscriptions"],
    staleTime: 5 * 60 * 1000,
    refetchOnMount: true,
  });

  // Fetch plan days when a plan is selected
  const { data: planDays = [], isLoading: planDaysLoading } = useQuery<ReadingPlanDay[]>({
    queryKey: ["/api/reading-plans", selectedPlan?.id, "days"],
    enabled: !!selectedPlan?.id,
    staleTime: 0, // Force fresh data to ensure reflections show up
    gcTime: 0,
  });

  // Fetch user progress for selected plan
  const { data: progress = [] } = useQuery<UserReadingProgress[]>({
    queryKey: ["/api/reading-plans", selectedPlan?.id, "progress"],
    enabled: !!selectedPlan?.id,
  });

  // Subscribe to plan mutation
  const subscribeToPlanning = useMutation({
    mutationFn: async (planId: number) => {
      return apiRequest("POST", `/api/reading-plans/${planId}/subscribe`);
    },
    onSuccess: () => {
      toast({
        title: "Subscribed Successfully!",
        description: "You've joined this reading plan. Start reading today!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/reading-plans/user/subscriptions"] });
    },
  });

  // Complete day mutation
  const completeDayMutation = useMutation({
    mutationFn: async (data: { planId: number; dayNumber: number; progressData: any }) => {
      return apiRequest("POST", `/api/reading-plans/${data.planId}/progress/${data.dayNumber}`, data.progressData);
    },
    onSuccess: (_, variables) => {
      const nextDay = variables.dayNumber + 1;
      const hasNextDay = planDays.some(day => day.dayNumber === nextDay);
      
      toast({
        title: "Day Completed!",
        description: hasNextDay 
          ? `Great job! Day ${nextDay} is now available.`
          : "Congratulations on completing this reading plan!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/reading-plans", selectedPlan?.id, "progress"] });
      queryClient.invalidateQueries({ queryKey: ["/api/reading-plans/user/subscriptions"] });
      setSelectedDay(null);
      
      // Auto-advance to next day if available
      if (hasNextDay) {
        setTimeout(() => {
          const nextDayData = planDays.find(day => day.dayNumber === nextDay);
          if (nextDayData) {
            setSelectedDay(nextDayData);
          }
        }, 1500);
      }
    },
  });

  const handleDayComplete = (dayNumber: number, progressData: any) => {
    if (selectedPlan) {
      completeDayMutation.mutate({
        planId: selectedPlan.id,
        dayNumber,
        progressData
      });
    }
  };

  const handleStartPlan = (plan: ReadingPlan) => {
    // For Torchbearer AI plans, show personalization modal first
    if (plan.subscriptionTier === 'torchbearer' && plan.isAiGenerated) {
      setSelectedPlan(plan);
      setShowAIModal(true);
    } else {
      subscribeToPlanning.mutate(plan.id);
    }
  };

  const handleAIPersonalized = () => {
    setAIPersonalizationEnabled(true);
    if (selectedPlan) {
      subscribeToPlanning.mutate(selectedPlan.id);
    }
  };

  // Handle creating a custom AI plan based on EMI
  const handleCreateCustomPlan = () => {
    setShowEMIModal(true);
  };

  const handleEMICurationComplete = (curatedPlans?: any[]) => {
    setShowEMIModal(false);
    if (curatedPlans && curatedPlans.length > 0) {
      toast({
        title: "Custom AI Plan Created!",
        description: `Your personalized reading plan has been generated based on your spiritual state.`,
      });
      // Refresh plans to show the new AI-generated plan
      queryClient.invalidateQueries({ queryKey: ["/api/reading-plans"] });
      queryClient.invalidateQueries({ queryKey: ["/api/reading-plans/user/subscriptions"] });
    }
  };

  const handleEMIModalClose = () => {
    setShowEMIModal(false);
  };

  // Helper functions
  const getSubscriptionTierInfo = (tier: string) => {
    const tierInfo = {
      disciple: { name: "Disciple Plan", color: "green", description: "Walk with Christ each day" },
      servant: { name: "Servant Plan", color: "blue", description: "Serve faithfully and grow deeply" },
      torchbearer: { name: "Torchbearer Plan", color: "purple", description: "Shine your light further" }
    };
    return tierInfo[tier as keyof typeof tierInfo] || tierInfo.disciple;
  };

  const getDifficultyColor = (difficulty: string | null) => {
    if (!difficulty) return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return "bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-400";
      case 'intermediate':
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-400";
      case 'advanced':
        return "bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  // Add subscription info to plans
  const plansWithSubscriptions = useMemo(() => {
    return plans.map(plan => {
      const subscription = subscriptions.find(sub => sub.planId === plan.id && sub.isActive);
      const progressPercentage = subscription ? Math.round(((subscription.currentDay || 1) / plan.duration) * 100) : 0;
      const daysCompleted = subscription?.currentDay || 0;
      
      return {
        ...plan,
        // Handle both camelCase and snake_case field naming from API
        subscriptionTier: plan.subscriptionTier || (plan as any).subscription_tier || 'disciple',
        subscription,
        progressPercentage,
        daysCompleted
      } as ReadingPlanWithProgress;
    });
  }, [plans, subscriptions]);

  // Filter plans based on category (legacy filter for backward compatibility)
  const filteredPlans = useMemo(() => {
    let filtered = plansWithSubscriptions;
    
    // Apply legacy category filter if no modern filters are active
    if (!hasActiveFilters && categoryFilter !== "all") {
      filtered = filtered.filter(plan => plan.category === categoryFilter);
    }
    
    return filtered;
  }, [plansWithSubscriptions, categoryFilter, hasActiveFilters]);

  // Get subscribed plans for "My Plans" tab
  const subscribedPlans = plansWithSubscriptions.filter(plan => plan.subscription?.isActive);

  // Get available categories
  const categories = useMemo(() => {
    return Array.from(new Set(plans.map(plan => plan.category).filter(Boolean)));
  }, [plans]);

  // Show loading state
  if (plansLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading reading plans...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show selected plan detail view
  if (selectedPlan && !selectedDay) {
    const subscription = subscriptions.find(sub => sub.planId === selectedPlan.id && sub.isActive);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 py-8">
        <div className="container mx-auto px-4">
          {/* Back Button */}
          <Button 
            variant="ghost" 
            onClick={() => setSelectedPlan(null)}
            className="mb-6"
          >
            ← Back to Reading Plans
          </Button>

          {/* Plan Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
              {selectedPlan.name}
            </h1>
            {selectedPlan.description && (
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                {selectedPlan.description}
              </p>
            )}
          </div>

          {/* Plan Details */}
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 dark:border-gray-700/50 mb-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  <span>{selectedPlan.duration} days</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  <span>{selectedPlan.category?.replace('_', ' ') || 'General'}</span>
                </div>
                <Badge className={getDifficultyColor(selectedPlan.difficulty)}>
                  {selectedPlan.difficulty || 'All Levels'}
                </Badge>
              </div>

              <div className="flex items-center gap-4">
                {subscription && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {Math.round(((subscription.currentDay || 1) / selectedPlan.duration) * 100)}%
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Complete</div>
                  </div>
                )}
                
                {!subscription && (
                  <Button
                    onClick={() => subscribeToPlanning.mutate(selectedPlan.id)}
                    disabled={subscribeToPlanning.isPending}
                    className="px-8 py-3 text-lg"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    {subscribeToPlanning.isPending ? "Joining..." : "Start Reading Plan"}
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Plan Days */}
          {planDaysLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading daily content...</p>
            </div>
          ) : planDays.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No daily content available for this plan</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {planDays.map((day) => {
                const dayProgress = progress.find(p => p.dayNumber === day.dayNumber);
                const isCompleted = !!dayProgress?.completedAt;
                const isAccessible = !subscription || day.dayNumber <= (subscription.currentDay || 1);

                return (
                  <Card 
                    key={day.id} 
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      isCompleted ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : ''
                    } ${!isAccessible ? 'opacity-50' : ''}`}
                    onClick={() => isAccessible && setSelectedDay(day)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">
                          Day {day.dayNumber}
                        </Badge>
                        <div className="flex items-center gap-2">
                          {isCompleted && (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          )}
                          {isAccessible && (
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                      </div>
                      <CardTitle className="text-lg leading-tight">
                        {day.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-2">
                        {day.scriptureReference}
                      </p>
                      {day.devotionalContent && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                          {day.devotionalContent}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Main reading plans view with subscription tiers
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 py-6 sm:py-8">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full mb-6">
            <BookOpen className="w-6 h-6" />
            <span className="font-semibold text-lg">Bible Reading Plans</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Deepen Your Faith Journey
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Transform your spiritual life with structured Bible reading plans designed to strengthen your relationship with God.
          </p>
        </div>

        {/* Enhanced Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-lg mx-auto grid-cols-2 mb-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-1 rounded-xl shadow-lg border border-white/20 dark:border-gray-700/50">
            <TabsTrigger 
              value="discover" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg px-6 py-3 font-medium transition-all duration-200"
            >
              All Reading Plans
            </TabsTrigger>
            <TabsTrigger 
              value="my-plans" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg px-6 py-3 font-medium transition-all duration-200"
            >
              My Plans ({subscribedPlans.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="discover" className="space-y-6">
            {/* Enhanced Filter Toggle */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                {showFilters ? 'Hide' : 'Show'} Filters
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-1">
                    Active
                  </Badge>
                )}
              </Button>
              
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear All Filters
                </Button>
              )}
            </div>

            {/* Comprehensive Filter Bar */}
            {showFilters && (
              <FilterBar 
                filters={filters} 
                onChange={updateFilters} 
                planCount={filteredPlans.length} 
              />
            )}

            {/* Subscription Tiers Section */}
            <div className="space-y-12">
              {/* Disciple Plan (Free) */}
              <div className="space-y-6">
                <div id="disciple-section" className="text-center">
                  <div className="inline-flex items-center gap-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-full shadow-lg">
                    <Shield className="w-6 h-6" />
                    <span className="font-bold text-xl">Disciple Plan</span>
                  </div>
                  <p className="text-lg text-gray-600 dark:text-gray-400 mt-3 font-medium">"Walk with Christ each day"</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Essential reading plans to begin your spiritual journey</p>
                </div>
                
                <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredPlans.filter(plan => ['disciple', 'free', null, undefined].includes(plan.subscriptionTier)).slice(0, discipleExpanded ? undefined : 6).map((plan) => {
                    const isSubscribed = !!plan.subscription?.isActive;

                    return (
                      <Card 
                        key={plan.id} 
                        className="relative transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/50"
                      >

                        
                        <CardHeader className="pb-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Book className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                              <Badge className={getDifficultyColor(plan.difficulty)}>
                                {plan.difficulty || 'All Levels'}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                              <Calendar className="w-4 h-4" />
                              <span>{plan.duration}d</span>
                            </div>
                          </div>
                          
                          <CardTitle className="text-xl leading-tight hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                            {plan.name}
                          </CardTitle>
                          
                          {plan.description && (
                            <CardDescription className="text-sm">
                              {plan.description}
                            </CardDescription>
                          )}
                        </CardHeader>
                        
                        <CardContent className="pt-0">
                          <div className="space-y-4">
                            {plan.subscription && (
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-gray-600 dark:text-gray-400">Progress</span>
                                  <span className="font-medium">{plan.progressPercentage}%</span>
                                </div>
                                <Progress value={plan.progressPercentage} className="h-2" />
                              </div>
                            )}
                            
                            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                              <div className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                <span>Community</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Target className="w-4 h-4" />
                                <span>{plan.category?.replace('_', ' ') || 'General'}</span>
                              </div>
                            </div>
                            
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => setSelectedPlan(plan)}
                                className="flex-1"
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View Plan
                              </Button>
                              {!isSubscribed && (
                                <Button 
                                  size="sm" 
                                  onClick={() => subscribeToPlanning.mutate(plan.id)}
                                  disabled={subscribeToPlanning.isPending}
                                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                                >
                                  <Shield className="w-4 h-4 mr-2" />
                                  Begin Journey
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
                
                {/* Show More Button for Disciple Plans */}
                {filteredPlans.filter(plan => ['disciple', 'free', null, undefined].includes(plan.subscriptionTier)).length > 6 && (
                  <div className="text-center">
                    <Button 
                      variant="outline" 
                      onClick={() => handleToggleExpanded(discipleExpanded, setDiscipleExpanded, 'disciple-section')}
                      className="px-6 py-2 border-green-200 text-green-600 hover:bg-green-50 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-900/20"
                    >
                      {discipleExpanded ? (
                        <>
                          Show Less
                          <ChevronUp className="w-4 h-4 ml-2" />
                        </>
                      ) : (
                        <>
                          Show More ({filteredPlans.filter(plan => ['disciple', 'free', null, undefined].includes(plan.subscriptionTier)).length - 6} more)
                          <ChevronDown className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>

              {/* Servant Plan (Standard) */}
              <div className="space-y-6">
                <div id="servant-section" className="text-center">
                  <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-full shadow-lg">
                    <Heart className="w-6 h-6" />
                    <span className="font-bold text-xl">Servant Plan</span>
                  </div>
                  <p className="text-lg text-gray-600 dark:text-gray-400 mt-3 font-medium">"Serve faithfully and grow deeply"</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Character studies, focused themes, and deeper spiritual growth</p>
                </div>
                
                <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredPlans.filter(plan => plan.subscriptionTier === 'servant').slice(0, servantExpanded ? undefined : 6).map((plan) => {
                    const canAccess = (userTier || 'torchbearer') === 'servant' || (userTier || 'torchbearer') === 'torchbearer';

                    return (
                      <Card 
                        key={plan.id} 
                        className={`relative transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/50 ${
                          !canAccess ? 'opacity-75' : ''
                        }`}
                      >
                        
                        <CardHeader className="pb-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Heart className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                              <Badge className={getDifficultyColor(plan.difficulty)}>
                                {plan.difficulty || 'Intermediate'}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                              <Calendar className="w-4 h-4" />
                              <span>{plan.duration}d</span>
                            </div>
                          </div>
                          
                          <CardTitle className="text-xl leading-tight hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                            {plan.name}
                          </CardTitle>
                          
                          {plan.description && (
                            <CardDescription className="text-sm">
                              {plan.description}
                            </CardDescription>
                          )}
                        </CardHeader>
                        
                        <CardContent className="pt-0">
                          <div className="space-y-4">
                            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                              <div className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                <span>Community</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Target className="w-4 h-4" />
                                <span>Leadership</span>
                              </div>
                            </div>
                            
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => setSelectedPlan(plan)}
                                className="flex-1"
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View Plan
                              </Button>
                              <Button 
                                size="sm" 
                                onClick={() => canAccess ? handleStartPlan(plan) : triggerLockedFeature('Servant Plan Features')}
                                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                              >
                                {canAccess ? (
                                  <>
                                    <Heart className="w-4 h-4 mr-2" />
                                    Step Deeper
                                  </>
                                ) : (
                                  <>
                                    <Lock className="w-4 h-4 mr-2" />
                                    Unlock Your Calling
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
                
                {/* Show More Button for Servant Plans */}
                {filteredPlans.filter(plan => plan.subscriptionTier === 'servant').length > 6 && (
                  <div className="text-center">
                    <Button 
                      variant="outline" 
                      onClick={() => handleToggleExpanded(servantExpanded, setServantExpanded, 'servant-section')}
                      className="px-6 py-2 border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/20"
                    >
                      {servantExpanded ? (
                        <>
                          Show Less
                          <ChevronUp className="w-4 h-4 ml-2" />
                        </>
                      ) : (
                        <>
                          Show More ({filteredPlans.filter(plan => plan.subscriptionTier === 'servant').length - 6} more)
                          <ChevronDown className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>

              {/* Torchbearer Plan (Premium) */}
              <div className="space-y-6">
                <div id="torchbearer-section" className="text-center">
                  <div className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full shadow-lg">
                    <Crown className="w-6 h-6" />
                    <span className="font-bold text-xl">Torchbearer Plan</span>
                  </div>
                  <p className="text-lg text-gray-600 dark:text-gray-400 mt-3 font-medium">"Shine your light further"</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">AI-powered personalization, advanced features, and leadership content</p>
                  
                  {/* Direct Journey Options for Torchbearer */}
                  <div className="mt-6 max-w-4xl mx-auto">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 text-center">
                      Choose how you'd like to begin your spiritual growth journey
                    </h3>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Select Existing Reading Plan */}
                      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-purple-200 dark:border-purple-800 rounded-xl p-6 text-center hover:shadow-lg transition-all duration-300">
                        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                          <BookOpen className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h4 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                          Select Existing Reading Plan
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                          Browse our curated collection of intermediate reading plans designed for deeper spiritual growth.
                        </p>
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <Users className="w-4 h-4" />
                            Community-tested plans
                          </div>
                          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <TrendingUp className="w-4 h-4" />
                            Structured spiritual growth
                          </div>
                          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <Play className="w-4 h-4" />
                            Immediate start
                          </div>
                        </div>
                        <Button 
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={() => {
                            // Scroll directly to the Torchbearer plans grid, skipping the journey options
                            const torchbearerPlansGrid = document.getElementById('torchbearer-plans-grid');
                            if (torchbearerPlansGrid) {
                              torchbearerPlansGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }
                          }}
                        >
                          Browse Reading Plans
                        </Button>
                      </div>

                      {/* Create Custom AI Reading Plan */}
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-6 text-center hover:shadow-lg transition-all duration-300">
                        <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Sparkles className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                        </div>
                        <h4 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                          Create Custom AI Reading Plan
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                          Let AI create a personalized reading plan based on your current spiritual and emotional state.
                        </p>
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <Brain className="w-4 h-4" />
                            AI-powered personalization
                          </div>
                          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <Heart className="w-4 h-4" />
                            Emotional state aware
                          </div>
                          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <Target className="w-4 h-4" />
                            Tailored to your needs
                          </div>
                        </div>
                        <Button 
                          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                          onClick={() => setShowEMIModal(true)}
                        >
                          Create My Plan
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div id="torchbearer-plans-grid" className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredPlans.filter(plan => plan.subscriptionTier === 'torchbearer').slice(0, torchbearerExpanded ? undefined : 6).map((plan) => {
                    const canAccess = (userTier || 'torchbearer') === 'torchbearer';

                    return (
                      <Card 
                        key={plan.id} 
                        className={`relative transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/50 ${
                          !canAccess ? 'opacity-75' : ''
                        }`}
                      >

                        
                        <CardHeader className="pb-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Crown className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                              <Badge className={getDifficultyColor(plan.difficulty)}>
                                {plan.difficulty || 'Advanced'}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                              <Calendar className="w-4 h-4" />
                              <span>{plan.duration}d</span>
                            </div>
                          </div>
                          
                          <div className="flex items-start justify-between gap-2">
                            <CardTitle className="text-xl leading-tight hover:text-purple-600 dark:hover:text-purple-400 transition-colors flex-1">
                              {plan.name}
                            </CardTitle>
                            {plan.isAiGenerated && (
                              <AIIndicator variant="badge" className="shrink-0" />
                            )}
                          </div>
                          
                          {plan.description && (
                            <CardDescription className="text-sm">
                              {plan.description}
                            </CardDescription>
                          )}
                        </CardHeader>
                        
                        <CardContent className="pt-0">
                          <div className="space-y-4">
                            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                              {plan.isAiGenerated && (
                                <div className="flex items-center gap-1">
                                  <Sparkles className="w-4 h-4" />
                                  <span>Personalized</span>
                                </div>
                              )}
                              {(plan.name.includes('Audio') || plan.name.includes('Commute') || plan.name.includes('Quiet Mind')) && (
                                <div className="flex items-center gap-1">
                                  <Volume2 className="w-4 h-4" />
                                  <span>Audio</span>
                                </div>
                              )}
                              {(plan.difficulty === 'advanced' || plan.name.includes('Leadership') || plan.name.includes('Chronological')) && (
                                <div className="flex items-center gap-1">
                                  <Target className="w-4 h-4" />
                                  <span>Leadership</span>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => setSelectedPlan(plan)}
                                className="flex-1"
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View Plan
                              </Button>
                              {canAccess ? (
                                <Button 
                                  size="sm"
                                  onClick={() => handleStartPlan(plan)}
                                  disabled={subscribeToPlanning.isPending}
                                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                                >
                                  {plan.isAiGenerated ? (
                                    <>
                                      <Brain className="w-4 h-4 mr-2" />
                                      Start AI Journey
                                    </>
                                  ) : (
                                    <>
                                      <Crown className="w-4 h-4 mr-2" />
                                      Shine Further
                                    </>
                                  )}
                                </Button>
                              ) : (
                                <Button 
                                  size="sm" 
                                  onClick={() => triggerLockedFeature('Torchbearer Plan Features')}
                                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                                >
                                  <Crown className="w-4 h-4 mr-2" />
                                  Embrace Your Purpose
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
                
                {/* Show More Button for Torchbearer Plans */}
                {filteredPlans.filter(plan => plan.subscriptionTier === 'torchbearer').length > 6 && (
                  <div className="text-center">
                    <Button 
                      variant="outline" 
                      onClick={() => handleToggleExpanded(torchbearerExpanded, setTorchbearerExpanded, 'torchbearer-section')}
                      className="px-6 py-2 border-purple-200 text-purple-600 hover:bg-purple-50 dark:border-purple-800 dark:text-purple-400 dark:hover:bg-purple-900/20"
                    >
                      {torchbearerExpanded ? (
                        <>
                          Show Less
                          <ChevronUp className="w-4 h-4 ml-2" />
                        </>
                      ) : (
                        <>
                          Show More ({filteredPlans.filter(plan => plan.subscriptionTier === 'torchbearer').length - 6} more)
                          <ChevronDown className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="my-plans" className="space-y-6">
            {subscribedPlans.length === 0 ? (
              <div className="text-center py-16">
                <BookOpen className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                  No Reading Plans Yet
                </h3>
                <p className="text-gray-500 dark:text-gray-500 mb-6">
                  Start your spiritual journey by joining a reading plan.
                </p>
                <Button onClick={() => setActiveTab("discover")}>
                  <BookOpen className="w-4 h-4 mr-2" />
                  Discover Reading Plans
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {subscribedPlans.map((plan) => (
                  <Card 
                    key={plan.id}
                    className="cursor-pointer transition-all hover:shadow-lg"
                    onClick={() => setSelectedPlan(plan)}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between mb-3">
                        <Badge className={getDifficultyColor(plan.difficulty)}>
                          {plan.difficulty || 'All Levels'}
                        </Badge>
                        <Badge variant="outline">
                          Day {plan.subscription?.currentDay || 1} of {plan.duration}
                        </Badge>
                      </div>
                      
                      <CardTitle className="text-xl leading-tight">
                        {plan.name}
                      </CardTitle>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Progress</span>
                          <span className="font-medium">{plan.progressPercentage}%</span>
                        </div>
                        <Progress value={plan.progressPercentage} className="h-2" />
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {plan.daysCompleted} of {plan.duration} days completed
                        </p>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <Button className="w-full" variant="outline">
                        <Play className="w-4 h-4 mr-2" />
                        Continue Reading
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Upgrade Flow Manager */}
        {showUpgradeFlow && (
          <UpgradePathManager 
            trigger={trigger}
            planData={planData}
            onClose={closeUpgradeFlow}
            onUpgrade={handleUpgradeSuccess}
          />
        )}
      </div>

      {/* EMI Pre-Selection Modal for Custom Plans */}
      <EMIPreSelectionModal
        isOpen={showEMIModal}
        onComplete={handleEMICurationComplete}
        onClose={handleEMIModalClose}
        planType="torchbearer"
      />



      {/* AI Personalization Modal */}
      {selectedPlan && (
        <AIPersonalizationModal
          isOpen={showAIModal}
          onClose={() => {
            setShowAIModal(false);
            setSelectedPlan(null);
          }}
          planId={selectedPlan.id}
          planName={selectedPlan.name}
          onPersonalized={handleAIPersonalized}
        />
      )}

      {/* Day Detail Modal */}
      <Dialog open={!!selectedDay} onOpenChange={() => setSelectedDay(null)}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center mb-4">
              {selectedPlan?.name}
            </DialogTitle>
            <DialogDescription className="text-center text-gray-600 dark:text-gray-400">
              Continue your spiritual journey with today's reading
            </DialogDescription>
          </DialogHeader>
          {selectedDay && selectedPlan && (
            <DayReader
              plan={selectedPlan}
              day={selectedDay}
              userProgress={progress.find(p => p.dayNumber === selectedDay.dayNumber)}
              onComplete={handleDayComplete}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}