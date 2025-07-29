import { useState, useMemo } from "react";
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
import { Book, Calendar, Clock, Heart, Play, CheckCircle, Users, BookOpen, Target, Star, ChevronRight } from "lucide-react";
import type { ReadingPlan, ReadingPlanDay, UserReadingPlanSubscription, UserReadingProgress, EnhancedMoodIndicator } from "@shared/schema";

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

  // Fetch Enhanced Mood Indicators for proper EMI integration
  const { data: allMoods = [] } = useQuery<EnhancedMoodIndicator[]>({
    queryKey: ["/api/enhanced-mood-indicators"],
    staleTime: 5 * 60 * 1000, // 5 minute cache
  });

  // Group moods by category for organized display
  const moodsByCategory = allMoods.reduce((acc: Record<string, EnhancedMoodIndicator[]>, mood: EnhancedMoodIndicator) => {
    if (!acc[mood.category]) {
      acc[mood.category] = [];
    }
    acc[mood.category].push(mood);
    return acc;
  }, {});

  // Get selected mood data for display
  const selectedMoodData = allMoods.find(mood => mood.id.toString() === emotionalReaction);

  const handleComplete = () => {
    const progressData = {
      reflectionText,
      prayerText,
      emotionalReaction,
      personalInsights,
      readingTimeMinutes
    };
    onComplete(day.dayNumber, progressData);
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="emotion" className="text-sm font-medium">
                How do you feel after reading?
              </Label>
              <Select value={emotionalReaction} onValueChange={setEmotionalReaction}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your emotional response">
                    {selectedMoodData && (
                      <span className="flex items-center gap-2">
                        <span>{selectedMoodData.emoji}</span>
                        <span>{selectedMoodData.name}</span>
                      </span>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="max-h-[300px] overflow-y-auto">
                  {Object.keys(moodsByCategory).sort().map((categoryName) => (
                    <div key={categoryName}>
                      <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                        {categoryName}
                      </div>
                      {moodsByCategory[categoryName].map((mood) => (
                        <SelectItem key={mood.id} value={mood.id.toString()}>
                          <span className="flex items-center gap-2">
                            <span>{mood.emoji}</span>
                            <span>{mood.name}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </div>
                  ))}
                </SelectContent>
              </Select>
              {selectedMoodData && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {selectedMoodData.description || `Feeling ${selectedMoodData.name.toLowerCase()}`}
                </p>
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
              />
            </div>
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
  const [categoryFilter, setCategoryFilter] = useState("all");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all available reading plans
  const { data: plans = [], isLoading: plansLoading } = useQuery<ReadingPlan[]>({
    queryKey: ["/api/reading-plans"],
  });

  // Fetch user's subscriptions
  const { data: subscriptions = [] } = useQuery<UserReadingPlanSubscription[]>({
    queryKey: ["/api/reading-plans/user/subscriptions"],
  });

  // Fetch plan days when a plan is selected
  const { data: planDays = [] } = useQuery<ReadingPlanDay[]>({
    queryKey: ["/api/reading-plans", selectedPlan?.id, "days"],
    enabled: !!selectedPlan?.id,
  });

  // Fetch user progress for selected plan
  const { data: userProgress = [] } = useQuery<UserReadingProgress[]>({
    queryKey: ["/api/reading-plans", selectedPlan?.id, "progress"],
    enabled: !!selectedPlan?.id,
  });

  // Subscribe to plan mutation
  const subscribeToPlanning = useMutation({
    mutationFn: async (planId: number) => {
      return apiRequest(`/api/reading-plans/${planId}/subscribe`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      toast({
        title: "Subscribed Successfully!",
        description: "You've joined this reading plan. Start reading today!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/reading-plans/user/subscriptions"] });
      setActiveTab("my-plans");
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
      return apiRequest(`/api/reading-plans/${planId}/progress/${dayNumber}`, {
        method: "POST",
        body: JSON.stringify(progressData),
      });
    },
    onSuccess: () => {
      toast({
        title: "Progress Recorded!",
        description: "Great job completing today's reading! You earned 10 SoapBox Points.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/reading-plans", selectedPlan?.id, "progress"] });
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
      const progress = userProgress.filter(p => p.planId === plan.id);
      const progressPercentage = subscription 
        ? Math.round((subscription.totalDaysCompleted / plan.duration) * 100)
        : 0;
      
      return {
        ...plan,
        subscription,
        progressPercentage,
        daysCompleted: subscription?.totalDaysCompleted || 0,
      };
    });
  }, [plans, subscriptions, userProgress]);

  // Filter plans by category
  const filteredPlans = useMemo(() => {
    if (categoryFilter === "all") return plansWithProgress;
    return plansWithProgress.filter(plan => plan.category === categoryFilter);
  }, [plansWithProgress, categoryFilter]);

  // Get subscribed plans
  const subscribedPlans = plansWithProgress.filter(plan => plan.subscription?.isActive);

  // Get categories for filter
  const categories = useMemo(() => {
    const cats = [...new Set(plans.map(plan => plan.category))];
    return cats.sort();
  }, [plans]);

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
      default: return <Book className="w-4 h-4" />;
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
    const progressPercentage = subscription 
      ? Math.round((subscription.totalDaysCompleted / selectedPlan.duration) * 100)
      : 0;

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-6">
            <Button 
              variant="outline" 
              onClick={() => setSelectedPlan(null)}
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
                        <Progress value={progressPercentage} className="w-32" />
                        <span className="text-sm font-medium">{progressPercentage}%</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Day {subscription.currentDay} of {selectedPlan.duration}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {subscription.totalDaysCompleted} days completed
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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {planDays.map((day) => {
              const dayProgress = progress.find(p => p.dayNumber === day.dayNumber);
              const isCompleted = !!dayProgress?.completedAt;
              const isAccessible = !subscription || day.dayNumber <= subscription.currentDay;

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
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Bible Reading Plans
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Grow in your faith with structured Bible reading plans designed to deepen your relationship with God.
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="discover">Discover Plans</TabsTrigger>
            <TabsTrigger value="my-plans">My Reading Plans ({subscribedPlans.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="discover" className="space-y-6">
            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
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
              {filteredPlans.map((plan) => (
                <Card 
                  key={plan.id} 
                  className="cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]"
                  onClick={() => setSelectedPlan(plan)}
                >
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-3">
                      {getTypeIcon(plan.type)}
                      <Badge className={getDifficultyColor(plan.difficulty)} size="sm">
                        {plan.difficulty}
                      </Badge>
                      <Badge variant="outline" size="sm">
                        <Clock className="w-3 h-3 mr-1" />
                        {plan.duration} days
                      </Badge>
                    </div>
                    
                    <CardTitle className="text-xl leading-tight">
                      {plan.name}
                    </CardTitle>
                    
                    {plan.description && (
                      <CardDescription className="line-clamp-3">
                        {plan.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Users className="w-4 h-4 mr-1" />
                        <span>Join thousands reading</span>
                      </div>
                      
                      {plan.subscription ? (
                        <Badge variant="default" className="bg-blue-600">
                          <Star className="w-3 h-3 mr-1" />
                          Joined
                        </Badge>
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
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
      </div>
    </div>
  );
}