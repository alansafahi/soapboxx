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
import { Book, Calendar, Clock, Heart, Play, CheckCircle, Users, BookOpen, Target, Star, ChevronRight, Lock, Crown, Sparkles, Headphones, User, Eye } from "lucide-react";
import type { ReadingPlan, ReadingPlanDay, UserReadingPlanSubscription, UserReadingProgress, EnhancedMoodIndicator } from "@shared/schema";
import { ScrollArea } from "@/components/ui/scroll-area";
import EnhancedMoodIndicatorManager from "@/components/emi/EnhancedMoodIndicatorManager";
import { useUpgradeFlow } from "@/hooks/useUpgradeFlow";
import UpgradePathManager from "@/components/upgrade-flow/UpgradePathManager";

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

  const handleMoodSelect = (mood: EnhancedMoodIndicator) => {
    setSelectedMood(mood);
    setEmotionalReaction(mood.name);
  };

  const isCompleted = !!userProgress?.completedAt;

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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{day.title}</h1>
      </div>

      {/* Scripture Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-blue-600 dark:text-blue-400">
            <BookOpen className="w-5 h-5 mr-2" />
            Today's Scripture
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              {day.scriptureReference}
            </p>
            {day.scriptureText && (
              <blockquote className="text-lg italic border-l-4 border-blue-500 pl-4 text-gray-700 dark:text-gray-300">
                "{day.scriptureText}"
              </blockquote>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Devotional Content */}
      {day.devotionalContent && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-purple-600 dark:text-purple-400">
              <Heart className="w-5 h-5 mr-2" />
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

      {/* Reflection Question */}
      {day.reflectionQuestion && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-orange-600 dark:text-orange-400">
              <Target className="w-5 h-5 mr-2" />
              Reflection Question
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 dark:text-gray-300 mb-4 font-medium">
              {day.reflectionQuestion}
            </p>
            <Textarea
              placeholder="Share your thoughts and reflections..."
              value={reflectionText}
              onChange={(e) => setReflectionText(e.target.value)}
              className="min-h-[100px]"
            />
          </CardContent>
        </Card>
      )}

      {/* Prayer Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-green-600 dark:text-green-400">
            <Heart className="w-5 h-5 mr-2" />
            Prayer & Personal Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {day.prayerPrompt && (
            <div>
              <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Prayer Prompt
              </Label>
              <p className="text-gray-700 dark:text-gray-300 mt-1">
                {day.prayerPrompt}
              </p>
            </div>
          )}
          
          <div>
            <Label htmlFor="prayer" className="text-sm font-medium">
              Your Prayer
            </Label>
            <Textarea
              id="prayer"
              placeholder="Write your prayer or thoughts here..."
              value={prayerText}
              onChange={(e) => setPrayerText(e.target.value)}
              className="min-h-[80px] mt-1"
            />
          </div>

          <div>
            <Label htmlFor="insights" className="text-sm font-medium">
              Personal Insights
            </Label>
            <Textarea
              id="insights"
              placeholder="What is God teaching you through this reading?"
              value={personalInsights}
              onChange={(e) => setPersonalInsights(e.target.value)}
              className="min-h-[80px] mt-1"
            />
          </div>

          <div>
            <Label className="text-sm font-medium mb-2 block">
              How do you feel after reading?
            </Label>
            <div className="max-h-64 overflow-y-auto border rounded-lg p-2">
              <EnhancedMoodIndicatorManager 
                onMoodSelect={handleMoodSelect}
                showAdminControls={false}
              />
            </div>
            {selectedMood && (
              <div className="mt-2 p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{selectedMood.emoji}</span>
                  <span className="text-sm font-medium text-purple-800 dark:text-purple-200">
                    {selectedMood.name}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="readingTime" className="text-sm font-medium">
              Reading Time (minutes)
            </Label>
            <Input
              id="readingTime"
              type="number"
              min="1"
              max="120"
              value={readingTimeMinutes}
              onChange={(e) => setReadingTimeMinutes(parseInt(e.target.value) || 0)}
              placeholder="15"
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Complete Button */}
      <div className="text-center pt-4">
        <Button
          onClick={handleComplete}
          className="px-8 py-3 text-lg"
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
              Mark Complete & Earn 10 Points
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default function BibleReadingPlans() {
  const [selectedPlan, setSelectedPlan] = useState<ReadingPlan | null>(null);
  const [selectedDay, setSelectedDay] = useState<ReadingPlanDay | null>(null);
  const [activeTab, setActiveTab] = useState("discover");
  const [previousTab, setPreviousTab] = useState("discover");
  const [categoryFilter, setCategoryFilter] = useState("all");
  


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

  // Fetch all available reading plans
  const { data: plans = [], isLoading: plansLoading } = useQuery<ReadingPlan[]>({
    queryKey: ["/api/reading-plans"],
    staleTime: 0, // Force fresh data
    gcTime: 0, // Disable caching temporarily (updated from cacheTime)
  });

  // Fetch user's subscriptions
  const { 
    data: subscriptions = [], 
    error: subscriptionsError, 
    isLoading: subscriptionsLoading,
    refetch: refetchSubscriptions 
  } = useQuery<UserReadingPlanSubscription[]>({
    queryKey: ["/api/reading-plans/user/subscriptions"],
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: true,
  });
  


  // Fetch plan days when a plan is selected
  const { data: planDays = [], isLoading: planDaysLoading } = useQuery<ReadingPlanDay[]>({
    queryKey: ["/api/reading-plans", selectedPlan?.id, "days"],
    enabled: !!selectedPlan?.id,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
  
  console.log("DEBUG - Selected plan ID:", selectedPlan?.id);
  console.log("DEBUG - Plan days query enabled:", !!selectedPlan?.id);
  console.log("DEBUG - Plan days loading:", planDaysLoading);
  console.log("DEBUG - Plan days count:", planDays.length);
  

  


  // Fetch all user progress for card listings
  const { data: allUserProgress = [] } = useQuery<UserReadingProgress[]>({
    queryKey: ["/api/reading-plans/user/progress/all"],
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes
  });

  // Fetch user progress for selected plan
  const { data: userProgress = [] } = useQuery<UserReadingProgress[]>({
    queryKey: ["/api/reading-plans", selectedPlan?.id, "progress"],
    enabled: !!selectedPlan?.id,
  });

  // Subscribe to plan mutation
  const subscribeToPlanning = useMutation({
    mutationFn: async (planId: number) => {
      return apiRequest("POST", `/api/reading-plans/${planId}/subscribe`);
    },
    onSuccess: (data, planId) => {
      toast({
        title: "Subscribed Successfully!",
        description: "You've joined this reading plan. Start reading today!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/reading-plans/user/subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/reading-plans"] });
      
      // Find the newly subscribed plan and select it directly
      const newPlan = plans.find(p => p.id === planId);
      if (newPlan) {
        setSelectedPlan(newPlan);
        setActiveTab("my-plans");
      }
    },
    onError: () => {
      toast({
        title: "Subscription Failed",
        description: "Unable to subscribe to reading plan. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Record progress mutation
  const recordProgress = useMutation({
    mutationFn: async ({ planId, dayNumber, progressData }: { planId: number; dayNumber: number; progressData: any }) => {
      return apiRequest("POST", `/api/reading-plans/${planId}/progress/${dayNumber}`, progressData);
    },
    onSuccess: () => {
      toast({
        title: "Progress Recorded!",
        description: "Great job completing today's reading! You earned 10 SoapBox Points.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/reading-plans", selectedPlan?.id, "progress"] });
      queryClient.invalidateQueries({ queryKey: ["/api/reading-plans/user/progress/all"] });
      queryClient.invalidateQueries({ queryKey: ["/api/reading-plans/user/subscriptions"] });
      setSelectedDay(null);
    },
    onError: () => {
      toast({
        title: "Failed to Save Progress",
        description: "Unable to record your progress. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Create plans with progress information
  const plansWithProgress: ReadingPlanWithProgress[] = useMemo(() => {
    return plans.map(plan => {
      const subscription = subscriptions.find(sub => sub.planId === plan.id);
      const progress = allUserProgress.filter(p => p.planId === plan.id);
      const completedDays = progress.filter(p => p.completedAt).length;
      const progressPercentage = plan.duration > 0
        ? Math.round((completedDays / plan.duration) * 100)
        : 0;
      
      return {
        ...plan,
        subscription,
        progressPercentage,
        daysCompleted: completedDays,
      };
    });
  }, [plans, subscriptions, allUserProgress]);

  // Filter plans by category
  const filteredPlans = useMemo(() => {
    if (categoryFilter === "all") return plansWithProgress;
    return plansWithProgress.filter(plan => plan.category === categoryFilter);
  }, [plansWithProgress, categoryFilter]);

  // Helper functions - defined before use
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "intermediate": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "advanced": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "topical": return <Target className="w-4 h-4" />;
      case "chronological": return <Calendar className="w-4 h-4" />;
      case "book_study": return <BookOpen className="w-4 h-4" />;
      case "devotional": return <Heart className="w-4 h-4" />;
      case "character_study": return <User className="w-4 h-4" />;
      case "thematic": return <Sparkles className="w-4 h-4" />;
      case "audio": return <Headphones className="w-4 h-4" />;
      default: return <Book className="w-4 h-4" />;
    }
  };

  // Get subscribed plans
  const subscribedPlans = plansWithProgress.filter(plan => plan.subscription?.isActive);

  // Auto-select single subscribed plan when on my-plans tab (only once) - but only if no plan is explicitly selected
  const [hasAutoSelected, setHasAutoSelected] = React.useState(false);
  React.useEffect(() => {
    // Only auto-select if user hasn't explicitly selected a plan and there's exactly one subscribed plan
    if (activeTab === "my-plans" && subscribedPlans.length === 1 && !selectedPlan && subscribedPlans[0] && !hasAutoSelected) {
      console.log("DEBUG - Auto-selecting single plan:", subscribedPlans[0].name);
      setSelectedPlan(subscribedPlans[0]);
      setHasAutoSelected(true);
    }
    // Reset auto-selection flag when leaving my-plans tab
    if (activeTab !== "my-plans") {
      setHasAutoSelected(false);
    }
  }, [activeTab, subscribedPlans, selectedPlan, hasAutoSelected]);

  // Get categories for filter
  const categories = useMemo(() => {
    const cats = [...new Set(plans.map(plan => plan.category))];
    return cats.sort();
  }, [plans]);

  const getSubscriptionTierInfo = (tier: string) => {
    switch (tier) {
      case "disciple":
      case "free":
        return {
          label: "Disciple Plan",
          icon: <Book className="w-4 h-4" />,
          color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
          description: "Walk with Christ each day"
        };
      case "servant":
      case "standard":
        return {
          label: "Servant Plan", 
          icon: <Star className="w-4 h-4" />,
          color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
          description: "Serve faithfully and grow deeply"
        };
      case "torchbearer":
      case "premium":
        return {
          label: "Torchbearer Plan",
          icon: <Crown className="w-4 h-4" />,
          color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
          description: "Shine your light further"
        };
      default:
        return {
          label: "Unknown",
          icon: <Book className="w-4 h-4" />,
          color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
          description: ""
        };
    }
  };

  if (selectedDay) {
    const currentUserProgress = userProgress.find(p => 
      p.planId === selectedPlan?.id && p.dayNumber === selectedDay.dayNumber
    );

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-6">
            <Button 
              variant="outline" 
              onClick={() => setSelectedDay(null)}
              className="mb-4"
            >
              ← Back to Plan
            </Button>
          </div>
          
          <DayReader
            plan={selectedPlan!}
            day={selectedDay}
            userProgress={currentUserProgress}
            onComplete={(dayNumber, progressData) => {
              recordProgress.mutate({
                planId: selectedPlan!.id,
                dayNumber,
                progressData,
              });
            }}
          />
        </div>
      </div>
    );
  }

  if (selectedPlan) {
    const subscription = subscriptions.find(sub => sub.planId === selectedPlan.id);
    const progress = userProgress.filter(p => p.planId === selectedPlan.id);
    const completedDays = progress.filter(p => p.completedAt).length;
    const progressPercentage = selectedPlan.duration > 0
      ? Math.round((completedDays / selectedPlan.duration) * 100)
      : 0;

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-6">
            <Button 
              variant="outline" 
              onClick={() => {
                setSelectedPlan(null);
                setActiveTab(previousTab);
              }}
              className="mb-4"
            >
              ← Back to All Plans
            </Button>
          </div>

          {/* Plan Header */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  {getTypeIcon(selectedPlan.type)}
                  <Badge className={getDifficultyColor(selectedPlan.difficulty)}>
                    {selectedPlan.difficulty}
                  </Badge>
                  <Badge variant="outline">{selectedPlan.duration} days</Badge>
                </div>
                
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  {selectedPlan.name}
                </h1>
                
                {selectedPlan.description && (
                  <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                    {selectedPlan.description}
                  </p>
                )}
              </div>

              <div className="lg:text-right space-y-4">
                {subscription ? (
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Progress</p>
                      <div className="flex items-center gap-2">
                        <Progress value={isNaN(progressPercentage) ? 0 : progressPercentage} className="w-32" />
                        <span className="text-sm font-medium">{isNaN(progressPercentage) ? 0 : progressPercentage}%</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Day {subscription.currentDay} of {selectedPlan.duration}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {completedDays} days completed
                    </p>
                  </div>
                ) : (
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
                      <Badge variant="outline" size="sm">
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full mb-6">
            <BookOpen className="w-6 h-6" />
            <span className="font-semibold text-lg">Bible Reading Plans</span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Deepen Your Faith Journey
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
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
            {/* Enhanced Filters */}
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 dark:border-gray-700/50">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div>
                  <Label htmlFor="category" className="text-sm font-medium">
                    Filter by Category
                  </Label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-[200px] mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category.split('_').map(word => 
                            word.charAt(0).toUpperCase() + word.slice(1)
                          ).join(' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {filteredPlans.length} reading plans available
                </div>
              </div>
            </div>

            {/* Plans Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredPlans.map((plan) => {
                const tierInfo = getSubscriptionTierInfo(plan.subscriptionTier || 'free');
                const isSubscribed = !!plan.subscription?.isActive;
                const canAccess = ['disciple', 'free'].includes(plan.subscriptionTier || 'disciple'); // For now, allow access to all plans
                
                return (
                  <Card 
                    key={plan.id} 
                    className={`relative transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/50 ${
                      isSubscribed ? 'ring-2 ring-gradient-to-r from-blue-500 to-purple-500 shadow-lg' : ''
                    } ${!canAccess ? 'opacity-75' : ''}`}
                  >
                    {/* Subscription Tier Badge */}
                    <div className="absolute top-3 right-3 z-10">
                      <Badge 
                        variant="outline" 
                        className={`${tierInfo.color} border-0 shadow-sm`}
                      >
                        <span className="flex items-center gap-1">
                          {tierInfo.icon}
                          {tierInfo.label}
                        </span>
                      </Badge>
                    </div>

                    {/* AI Generated Badge */}
                    {plan.isAiGenerated && (
                      <div className="absolute top-12 right-3 z-10">
                        <Badge 
                          variant="outline" 
                          className={`${
                            plan.subscriptionTier === 'servant'
                              ? "bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-200 dark:from-blue-900 dark:to-indigo-900 dark:text-blue-200 dark:border-blue-700"
                              : "bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border-purple-200 dark:from-purple-900 dark:to-pink-900 dark:text-purple-200 dark:border-purple-700"
                          }`}
                        >
                          <Sparkles className="w-3 h-3 mr-1" />
                          {plan.subscriptionTier === 'servant' ? 'AI Enhanced' : 'AI Curated'}
                        </Badge>
                      </div>
                    )}

                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(plan.type)}
                          <Badge 
                            variant="outline" 
                            className={getDifficultyColor(plan.difficulty)}
                          >
                            {plan.difficulty}
                          </Badge>
                        </div>
                        {isSubscribed && (
                          <Badge variant="default" className="bg-blue-600">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Joined
                          </Badge>
                        )}
                      </div>
                      
                      <CardTitle className="text-xl mb-2 leading-tight pr-8">
                        {plan.name}
                      </CardTitle>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {plan.duration} days
                        </div>
                        {plan.totalDays && plan.totalDays !== plan.duration && (
                          <div className="flex items-center gap-1">
                            <BookOpen className="w-4 h-4" />
                            {plan.totalDays} readings
                          </div>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="flex-1">
                      {plan.description && (
                        <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 mb-4">
                          {plan.description}
                        </p>
                      )}

                      {/* Progress Bar for Subscribed Plans */}
                      {isSubscribed && plan.progressPercentage !== undefined && (
                        <div className="mb-4">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-gray-600 dark:text-gray-400">Progress</span>
                            <span className="font-medium">{isNaN(plan.progressPercentage) ? 0 : plan.progressPercentage}%</span>
                          </div>
                          <Progress value={isNaN(plan.progressPercentage) ? 0 : plan.progressPercentage} className="h-2" />
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {plan.daysCompleted} of {plan.duration} days completed
                          </p>
                        </div>
                      )}

                      {/* Plan Features */}
                      <div className="space-y-2 mb-4">
                        {plan.type === 'audio' && (
                          <div className="flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400">
                            <Headphones className="w-4 h-4" />
                            <span>Audio-optimized content</span>
                          </div>
                        )}
                        {plan.type === 'thematic' && plan.isAiGenerated && (
                          <div className="flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400">
                            <Sparkles className="w-4 h-4" />
                            <span>AI-personalized selections</span>
                          </div>
                        )}
                        {plan.type === 'chronological' && (
                          <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                            <Calendar className="w-4 h-4" />
                            <span>Historical sequence</span>
                          </div>
                        )}
                        {plan.type === 'character_study' && (
                          <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                            <User className="w-4 h-4" />
                            <span>Character-focused journey</span>
                          </div>
                        )}
                      </div>

                      {/* Action Button */}
                      <div className="mt-auto">
                        {isSubscribed ? (
                          <Button
                            onClick={() => {
                              setPreviousTab(activeTab);
                              setSelectedPlan(plan);
                            }}
                            variant="outline"
                            className="w-full"
                          >
                            <BookOpen className="w-4 h-4 mr-2" />
                            Continue Reading
                          </Button>
                        ) : canAccess || (plan.subscriptionTier === 'servant' && plan.isAiGenerated) ? (
                          <div className="space-y-2">
                            <Button
                              onClick={() => {
                                setPreviousTab(activeTab);
                                setSelectedPlan(plan);
                              }}
                              variant="outline"
                              className="w-full"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Plan
                            </Button>
                            {plan.subscriptionTier === 'servant' && plan.isAiGenerated && (
                              <p className="text-xs text-center text-blue-600 dark:text-blue-400">
                                AI-Curated Servant Plan
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <Button
                              variant="outline"
                              className="w-full"
                              disabled
                            >
                              <Lock className="w-4 h-4 mr-2" />
                              {tierInfo.label} Required
                            </Button>
                            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                              {tierInfo.description}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Enhanced AI Plan Generation Section */}
            <div className="bg-gradient-to-br from-purple-50/80 via-pink-50/80 to-indigo-50/80 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-indigo-900/20 backdrop-blur-sm rounded-xl p-8 shadow-xl border border-white/30 dark:border-gray-700/30">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 text-white px-6 py-3 rounded-full mb-6 shadow-lg">
                  <Crown className="w-6 h-6" />
                  <span className="font-semibold text-lg">Torchbearer Feature</span>
                </div>
                <h3 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                  Generate AI-Powered Reading Plans
                </h3>
                <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                  Create personalized Bible reading plans powered by AI technology. Choose your topic and let our system craft a unique spiritual journey tailored to your needs.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Thematic Plan Generator */}
                <div className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                      <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Thematic Journey
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        AI-curated scripture around a specific theme
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Personalized verse selection</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>AI-generated reflections</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Adaptive difficulty levels</span>
                    </div>
                  </div>

                  <Button 
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    disabled
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Torchbearer Plan Required
                  </Button>
                </div>

                {/* Audio Plan Generator */}
                <div className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      <Headphones className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Audio Experience
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Plans optimized for listening and meditation
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Time-based sessions</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Meditation-focused content</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Commute-friendly format</span>
                    </div>
                  </div>

                  <Button 
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    disabled
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Torchbearer Plan Required
                  </Button>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className="flex items-start gap-3">
                  <Crown className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5" />
                  <div>
                    <h5 className="font-semibold text-purple-900 dark:text-purple-100 mb-1">
                      Upgrade to Torchbearer for AI-Powered Plans
                    </h5>
                    <p className="text-sm text-purple-700 dark:text-purple-300 mb-3">
                      Unlock personalized Bible reading experiences with advanced AI technology. Create custom thematic journeys and audio-optimized plans tailored to your spiritual growth needs.
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="border-purple-300 text-purple-700 hover:bg-purple-50 dark:border-purple-600 dark:text-purple-300 dark:hover:bg-purple-900/50"
                    >
                      <Crown className="w-4 h-4 mr-2" />
                      Begin Your Journey
                    </Button>
                  </div>
                </div>
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
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {subscribedPlans.map((plan) => (
                  <Card 
                    key={plan.id}
                    className="cursor-pointer transition-all hover:shadow-lg"
                    onClick={() => setSelectedPlan(plan)}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between mb-3">
                        <Badge className={getDifficultyColor(plan.difficulty)} size="sm">
                          {plan.difficulty}
                        </Badge>
                        <Badge variant="outline" size="sm">
                          Day {plan.subscription?.currentDay} of {plan.duration}
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
        <UpgradePathManager 
          isVisible={showUpgradeFlow}
          trigger={trigger}
          planData={planData}
          onClose={closeUpgradeFlow}
          onUpgrade={handleUpgradeSuccess}
        />
      </div>
    </div>
  );
}