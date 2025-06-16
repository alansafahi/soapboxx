import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, Hand, Plus, CheckCircle, MessageCircle, Users, Clock, Send, ChevronDown, ChevronUp, Share, Bookmark, Eye, MapPin, Award, TrendingUp, Zap, Filter, Sparkles, Lightbulb, Pin, PinOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { formatDistanceToNow } from "date-fns";
import type { PrayerRequest } from "@shared/schema";
import SmartScriptureTextarea from "./SmartScriptureTextarea";
import { ScriptureExpandedText } from "./ScriptureExpandedText";

const prayerRequestSchema = z.object({
  title: z.string().optional(),
  content: z.string().min(1, "Prayer request content is required"),
  isAnonymous: z.boolean().default(false),
  category: z.string().default("general"),
  churchId: z.number().optional(),
  isPublic: z.boolean().default(true),
  isUrgent: z.boolean().default(false),
});

const commentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty"),
});

const updateSchema = z.object({
  content: z.string().min(1, "Update cannot be empty"),
});

type PrayerRequestFormData = z.infer<typeof prayerRequestSchema>;
type CommentFormData = z.infer<typeof commentSchema>;
type UpdateFormData = z.infer<typeof updateSchema>;

const prayerCategories = [
  { id: 'all', label: 'All Prayers', icon: '🙏', color: 'gray' },
  { id: 'health', label: 'Health', icon: '💊', color: 'red' },
  { id: 'career', label: 'Career', icon: '💼', color: 'blue' },
  { id: 'relationships', label: 'Relationships', icon: '❤️', color: 'pink' },
  { id: 'spiritual', label: 'Spiritual Growth', icon: '✝️', color: 'purple' },
  { id: 'family', label: 'Family', icon: '👨‍👩‍👧‍👦', color: 'green' },
  { id: 'urgent', label: 'Urgent', icon: '⚡', color: 'yellow' },
  { id: 'general', label: 'General', icon: '🤲', color: 'gray' },
];

export default function PrayerWall() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTab, setSelectedTab] = useState('prayers');
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());
  const [prayedRequests, setPrayedRequests] = useState<Set<number>>(new Set());
  const [likedRequests, setLikedRequests] = useState<Set<number>>(new Set());
  const [bookmarkedRequests, setBookmarkedRequests] = useState<Set<number>>(new Set());
  const [animatingButtons, setAnimatingButtons] = useState<Set<number>>(new Set());
  const [expandedComments, setExpandedComments] = useState<Set<number>>(new Set());
  const [showWhosPraying, setShowWhosPraying] = useState<Map<number, boolean>>(new Map());
  const [supportComments, setSupportComments] = useState<Map<number, string>>(new Map());
  const [supportMessages, setSupportMessages] = useState<Map<number, any[]>>(new Map());
  const [prayerCircles, setPrayerCircles] = useState<any[]>([]);
  const [reactions, setReactions] = useState<Map<number, {praying: number, heart: number, fire: number, praise: number}>>(new Map());
  const [isAIAssistanceOpen, setIsAIAssistanceOpen] = useState(false);
  const [aiAssistanceData, setAIAssistanceData] = useState({
    topic: '',
    situation: '',
    tone: 'hopeful',
    prayerType: 'request'
  });
  const [aiSuggestions, setAISuggestions] = useState<any[]>([]);
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  const form = useForm<PrayerRequestFormData>({
    resolver: zodResolver(prayerRequestSchema),
    defaultValues: {
      title: "",
      content: "",
      isAnonymous: false,
      category: "general",
      churchId: undefined,
      isPublic: true,
    },
  });

  // Fetch prayer requests
  const { data: prayerRequests = [], isLoading } = useQuery<PrayerRequest[]>({
    queryKey: ["/api/prayers"],
  });

  // Comment handling functions
  const toggleComments = async (prayerId: number) => {
    setExpandedComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(prayerId)) {
        newSet.delete(prayerId);
      } else {
        newSet.add(prayerId);
        // Fetch support messages when expanding comments
        fetchSupportMessages(prayerId);
      }
      return newSet;
    });
  };

  const fetchSupportMessages = async (prayerId: number) => {
    try {
      const response = await fetch(`/api/prayers/${prayerId}/support`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        console.error(`Failed to fetch support messages: ${response.status}`);
        return;
      }
      
      const messages = await response.json();
      setSupportMessages(prev => {
        const newMap = new Map(prev);
        newMap.set(prayerId, messages || []);
        return newMap;
      });
    } catch (error) {
      console.error("Error fetching support messages:", error);
    }
  };

  // Pray for request mutation (prayer counter)
  const prayForRequestMutation = useMutation({
    mutationFn: async (prayerRequestId: number) => {
      await apiRequest("POST", `/api/prayers/${prayerRequestId}/pray`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prayers"] });
      toast({
        title: "Prayer Added",
        description: "Thank you for praying for this request.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to add prayer. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Like prayer mutation (separate from pray counter)
  const likePrayerMutation = useMutation({
    mutationFn: async (prayerRequestId: number) => {
      const response = await fetch(`/api/prayers/${prayerRequestId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to toggle prayer like');
      }
      return response.json();
    },
    onSuccess: (data, prayerRequestId) => {
      queryClient.invalidateQueries({ queryKey: ["/api/prayers"] });
      setLikedRequests(prev => {
        const newSet = new Set(prev);
        if (data.liked) {
          newSet.add(prayerRequestId);
        } else {
          newSet.delete(prayerRequestId);
        }
        return newSet;
      });
      toast({
        title: data.liked ? "Liked" : "Unliked",
        description: data.liked ? "Prayer request liked" : "Prayer request unliked",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to toggle like. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Create prayer request mutation
  const createPrayerMutation = useMutation({
    mutationFn: async (data: PrayerRequestFormData) => {
      console.log('Submitting prayer data:', data);
      const response = await fetch('/api/prayers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit prayer request');
      }
      
      const result = await response.json();
      console.log('Prayer submission result:', result);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prayers"] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: "Prayer Request Posted",
        description: "Your prayer request has been added to the Prayer Wall.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to submit prayer request. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Support comment mutation
  const supportCommentMutation = useMutation({
    mutationFn: async ({ prayerRequestId, content }: { prayerRequestId: number; content: string }) => {
      const response = await fetch(`/api/prayers/${prayerRequestId}/support`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ content })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send support message');
      }
      
      return response.json();
    },
    onSuccess: (_, { prayerRequestId }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/prayers"] });
      setSupportComments(prev => {
        const newMap = new Map(prev);
        newMap.set(prayerRequestId, '');
        return newMap;
      });
      // Refresh support messages for this prayer
      fetchSupportMessages(prayerRequestId);
      toast({
        title: "Support sent",
        description: "Your encouraging message has been shared.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to send support message. Please try again.",
        variant: "destructive",
      });
    },
  });

  // AI Prayer Assistance function
  const getAIPrayerAssistance = async () => {
    setIsLoadingAI(true);
    try {
      const response = await fetch('/api/prayers/ai-assistance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(aiAssistanceData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to get AI assistance');
      }

      const data = await response.json();
      setAISuggestions(data.suggestions || []);
      
      if (data.suggestions && data.suggestions.length > 0) {
        toast({
          title: "AI Suggestions Ready",
          description: `Generated ${data.suggestions.length} prayer suggestions for you`,
        });
      } else {
        toast({
          title: "No suggestions generated",
          description: "Please try providing more details about your prayer topic",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('AI assistance error:', error);
      toast({
        title: "AI assistance unavailable",
        description: "Please write your prayer manually or try again later",
        variant: "destructive",
      });
    } finally {
      setIsLoadingAI(false);
    }
  };

  const selectAISuggestion = (suggestion: any) => {
    console.log('Selecting AI suggestion:', suggestion);
    
    // Automatically submit the AI-generated prayer
    const prayerData = {
      title: suggestion.title || '',
      content: suggestion.content || '',
      isAnonymous: false,
      category: 'general',
      churchId: undefined,
      isPublic: true,
      isUrgent: false,
    };
    
    console.log('Auto-submitting AI prayer:', prayerData);
    createPrayerMutation.mutate(prayerData);
    
    setIsAIAssistanceOpen(false);
    setAISuggestions([]);
    
    toast({
      title: "Prayer posted automatically",
      description: "Your AI-generated prayer has been added to the Prayer Wall",
    });
  };

  const handlePrayForRequest = (prayerRequestId: number) => {
    // Add animation state
    setAnimatingButtons(prev => new Set([...Array.from(prev), prayerRequestId]));
    
    // Toggle prayed state optimistically
    const isCurrentlyPrayed = prayedRequests.has(prayerRequestId);
    setPrayedRequests(prev => {
      const newSet = new Set(prev);
      if (isCurrentlyPrayed) {
        newSet.delete(prayerRequestId);
      } else {
        newSet.add(prayerRequestId);
      }
      return newSet;
    });

    // Remove animation state after animation completes
    setTimeout(() => {
      setAnimatingButtons(prev => {
        const newSet = new Set(prev);
        newSet.delete(prayerRequestId);
        return newSet;
      });
    }, 400);

    prayForRequestMutation.mutate(prayerRequestId);
  };

  const handleLikePrayer = (prayerRequestId: number) => {
    likePrayerMutation.mutate(prayerRequestId);
  };

  const handleCreatePrayer = (data: PrayerRequestFormData) => {
    console.log('handleCreatePrayer called with data:', data);
    console.log('Form validation state:', form.formState);
    console.log('Form errors:', form.formState.errors);
    createPrayerMutation.mutate(data);
  };

  const formatTimeAgo = (date: string) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-8 bg-gray-200 rounded w-full"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-y-auto space-y-6 pb-8">
      {/* Prayer Wall Header */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-0 shadow-sm">
        <CardHeader className="text-center pb-4">
          <CardTitle className="flex items-center justify-center space-x-2 text-2xl font-bold text-gray-900 dark:text-white">
            <Hand className="w-6 h-6 text-purple-600" />
            <span>Prayer Wall</span>
          </CardTitle>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Share your prayer requests and pray for others in our community
          </p>
          <div className="flex items-center justify-center space-x-6 mt-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Users className="w-4 h-4" />
              <span>{prayerRequests.length} requests</span>
            </div>
            <div className="flex items-center space-x-1">
              <Hand className="w-4 h-4" />
              <span>Community prayers</span>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* AI Prayer Assistance Button */}
        <Button 
          onClick={() => setIsAIAssistanceOpen(true)}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-6 text-lg"
        >
          <Sparkles className="w-5 h-5 mr-2" />
          Get AI Help Writing Prayer
        </Button>

        {/* Create Prayer Request Button */}
        <Button 
          onClick={() => setIsCreateDialogOpen(true)}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-6 text-lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Prayer Request to Wall
        </Button>
      </div>

      {/* Create Prayer Request Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Your Prayer Request</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={(e) => {
              console.log('Form submit event triggered');
              console.log('Form data before submission:', form.getValues());
              return form.handleSubmit(handleCreatePrayer)(e);
            }} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Brief prayer request title..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <SmartScriptureTextarea
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Please pray for... (Include scripture references like 'Psalm 23:1' for auto-population)"
                        label="Prayer Request"
                        minHeight="min-h-[100px]"
                        maxLength={1000}
                        helpText="Share your prayer request with our community. Scripture references will be automatically expanded."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isAnonymous"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Post Anonymously</FormLabel>
                      <div className="text-sm text-gray-500">
                        Hide your name from this request
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createPrayerMutation.isPending}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  {createPrayerMutation.isPending ? "Posting..." : "Post to Wall"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* AI Prayer Assistance Modal */}
      <Dialog open={isAIAssistanceOpen} onOpenChange={setIsAIAssistanceOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-blue-600" />
              AI Prayer Writing Assistant
            </DialogTitle>
            <p className="text-sm text-gray-600">
              Share what's on your heart and get personalized prayer suggestions
            </p>
          </DialogHeader>
          
          <div className="space-y-4 overflow-y-auto flex-1 pr-2">
            <div>
              <label className="text-sm font-medium">What would you like to pray about?</label>
              <Input
                placeholder="e.g., Family healing, job interview, spiritual growth..."
                value={aiAssistanceData.topic}
                onChange={(e) => setAIAssistanceData(prev => ({ ...prev, topic: e.target.value }))}
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Describe your situation (optional)</label>
              <Textarea
                placeholder="Share more details about your prayer need..."
                value={aiAssistanceData.situation}
                onChange={(e) => setAIAssistanceData(prev => ({ ...prev, situation: e.target.value }))}
                className="mt-1 min-h-[80px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Prayer Type</label>
                <Select
                  value={aiAssistanceData.prayerType}
                  onValueChange={(value) => setAIAssistanceData(prev => ({ ...prev, prayerType: value }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="request">Prayer Request</SelectItem>
                    <SelectItem value="thanksgiving">Thanksgiving</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Tone</label>
                <Select
                  value={aiAssistanceData.tone}
                  onValueChange={(value) => setAIAssistanceData(prev => ({ ...prev, tone: value }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hopeful">Hopeful</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="grateful">Grateful</SelectItem>
                    <SelectItem value="peaceful">Peaceful</SelectItem>
                    <SelectItem value="humble">Humble</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAIAssistanceOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={getAIPrayerAssistance}
                disabled={isLoadingAI || (!aiAssistanceData.topic && !aiAssistanceData.situation)}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {isLoadingAI ? (
                  <>
                    <Lightbulb className="w-4 h-4 mr-2 animate-pulse" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Get Suggestions
                  </>
                )}
              </Button>
            </div>

            {/* AI Suggestions */}
            {aiSuggestions.length > 0 && (
              <div className="mt-6 space-y-3">
                <h4 className="font-medium text-gray-900 sticky top-0 bg-white pb-2 border-b">AI Prayer Suggestions</h4>
                <div className="max-h-[400px] overflow-y-auto space-y-3 pr-2">
                  {aiSuggestions.map((suggestion, index) => (
                    <Card key={index} className="p-4 hover:bg-gray-50 cursor-pointer transition-colors" onClick={() => selectAISuggestion(suggestion)}>
                      <div className="space-y-2">
                        <h5 className="font-medium text-sm text-purple-600">{suggestion.title}</h5>
                        <p className="text-sm text-gray-700">{suggestion.content}</p>
                        <Button size="sm" variant="outline" className="w-full mt-2">
                          <Plus className="w-3 h-3 mr-1" />
                          Use This Prayer
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2 sticky bottom-0 bg-white pt-2 border-t">
                  Click any suggestion to use it as a starting point. You can edit it before posting.
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Prayer Requests */}
      <div className="space-y-4">
        <AnimatePresence>
          {prayerRequests.map((prayer) => (
            <motion.div
              key={prayer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="hover:shadow-md transition-shadow duration-200 border-l-4 border-l-purple-500">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src="/placeholder-avatar.png" />
                          <AvatarFallback className="bg-purple-100 text-purple-600">
                            {prayer.isAnonymous ? "?" : "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {prayer.isAnonymous ? "Anonymous" : "Community Member"}
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <Clock className="w-3 h-3" />
                            <span>{formatTimeAgo(prayer.createdAt?.toString() || new Date().toISOString())}</span>
                            {prayer.isAnswered && (
                              <Badge className="bg-green-100 text-green-800 ml-2">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Answered
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Content */}
                    {prayer.title && (
                      <h4 className="font-semibold text-lg text-gray-900 dark:text-white">{prayer.title}</h4>
                    )}
                    
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {prayer.content}
                    </p>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                      <div className="flex space-x-4">
                        {/* Pray Button (Prayer Counter) */}
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          transition={{ type: "spring", stiffness: 400, damping: 17 }}
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePrayForRequest(prayer.id)}
                            disabled={prayForRequestMutation.isPending}
                            className={`text-sm transition-all duration-300 ${
                              prayedRequests.has(prayer.id)
                                ? 'text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100'
                                : prayer.isAnswered 
                                  ? 'text-green-500 hover:text-green-600 hover:bg-green-50' 
                                  : 'text-purple-500 hover:text-purple-600 hover:bg-purple-50'
                            }`}
                          >
                            <motion.div
                              animate={animatingButtons.has(prayer.id) ? {
                                scale: [1, 1.4, 1],
                                rotate: [0, 10, -10, 0]
                              } : {}}
                              transition={{ duration: 0.4 }}
                            >
                              <Hand className="w-4 h-4 mr-1" />
                            </motion.div>
                            <motion.span
                              animate={animatingButtons.has(prayer.id) ? {
                                scale: [1, 1.1, 1]
                              } : {}}
                              transition={{ duration: 0.4 }}
                            >
                              {prayer.isAnswered 
                                ? `${(prayer.prayerCount || 0) + (prayedRequests.has(prayer.id) ? 1 : 0)} prayed` 
                                : `${(prayer.prayerCount || 0) + (prayedRequests.has(prayer.id) ? 1 : 0)} praying`
                              }
                            </motion.span>
                          </Button>
                        </motion.div>
                        
                        {/* Like Button (Separate from prayer counter) */}
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          transition={{ type: "spring", stiffness: 400, damping: 17 }}
                        >
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleLikePrayer(prayer.id)}
                            disabled={likePrayerMutation.isPending}
                            className={`transition-all duration-300 ${
                              likedRequests.has(prayer.id) 
                                ? 'text-red-600 hover:text-red-700' 
                                : 'text-gray-500 hover:text-red-500'
                            }`}
                          >
                            <Heart className={`w-4 h-4 ${likedRequests.has(prayer.id) ? 'fill-current' : ''}`} />
                          </Button>
                        </motion.div>

                        {/* Comments Button */}
                        <Collapsible 
                          open={expandedComments.has(prayer.id)}
                          onOpenChange={() => toggleComments(prayer.id)}
                        >
                          <CollapsibleTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-gray-500 hover:text-blue-500 transition-colors"
                            >
                              <MessageCircle className="w-4 h-4 mr-1" />
                              <span className="text-sm">Support</span>
                              {expandedComments.has(prayer.id) ? (
                                <ChevronUp className="w-3 h-3 ml-1" />
                              ) : (
                                <ChevronDown className="w-3 h-3 ml-1" />
                              )}
                            </Button>
                          </CollapsibleTrigger>
                        </Collapsible>
                      </div>
                    </div>

                    {/* Collapsible Comments Section */}
                    <Collapsible 
                      open={expandedComments.has(prayer.id)}
                      onOpenChange={() => toggleComments(prayer.id)}
                    >
                      <CollapsibleContent className="pt-4 border-t border-gray-100 dark:border-gray-700">
                        <div className="space-y-4">
                          {/* Support Messages */}
                          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center">
                              <MessageCircle className="w-4 h-4 mr-2" />
                              Community Support
                            </h4>
                            <div className="space-y-3 text-sm">
                              {supportMessages.get(prayer.id)?.map((message: any) => (
                                <div key={message.id} className="flex items-start space-x-3">
                                  <Avatar className="w-6 h-6">
                                    <AvatarImage src={message.user?.profileImageUrl} />
                                    <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                                      {message.user?.firstName?.[0] || message.user?.email?.[0]?.toUpperCase() || "U"}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1">
                                    <p className="text-blue-800 dark:text-blue-200">
                                      {message.content}
                                    </p>
                                    <span className="text-blue-600 dark:text-blue-400 text-xs">
                                      {message.user?.firstName || message.user?.email || "Community Member"} • {new Date(message.createdAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                              )) || (
                                <p className="text-blue-700 dark:text-blue-300 text-sm italic">
                                  No support messages yet. Be the first to share encouragement!
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Add Support Comment Form */}
                          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                            <h5 className="font-medium text-gray-900 dark:text-white mb-3">Share Words of Encouragement</h5>
                            <div className="flex space-x-3">
                              <Avatar className="w-8 h-8">
                                <AvatarImage src="/placeholder-avatar.png" />
                                <AvatarFallback className="bg-purple-100 text-purple-600">
                                  {user?.firstName?.[0] || "U"}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <SmartScriptureTextarea
                                  value={supportComments.get(prayer.id) || ''}
                                  onChange={(value) => {
                                    const newMap = new Map(supportComments);
                                    newMap.set(prayer.id, value);
                                    setSupportComments(newMap);
                                  }}
                                  placeholder="Share an encouraging message or Bible verse... (Type 'Romans 8:28' for auto-population)"
                                  className="border-gray-200 dark:border-gray-700"
                                  minHeight="min-h-[80px]"
                                  maxLength={500}
                                />
                                <div className="flex justify-between items-center mt-3">
                                  <span className="text-xs text-gray-500">Your words can bring hope and comfort</span>
                                  <Button 
                                    size="sm" 
                                    className="bg-blue-600 hover:bg-blue-700"
                                    onClick={() => {
                                      const content = supportComments.get(prayer.id)?.trim();
                                      if (content) {
                                        supportCommentMutation.mutate({ 
                                          prayerRequestId: prayer.id, 
                                          content 
                                        });
                                      }
                                    }}
                                    disabled={supportCommentMutation.isPending || !supportComments.get(prayer.id)?.trim()}
                                  >
                                    <Send className="w-3 h-3 mr-1" />
                                    {supportCommentMutation.isPending ? 'Sending...' : 'Send Support'}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Prayer Updates Section */}
                          {prayer.isAnswered && (
                            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                              <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2 flex items-center">
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Prayer Update
                              </h4>
                              <p className="text-green-800 dark:text-green-200 text-sm">
                                "Thank you all for your prayers! God has answered in such a beautiful way. 
                                Feeling grateful for this amazing community. 🌟"
                              </p>
                              <span className="text-green-600 dark:text-green-400 text-xs">Prayer Author • 1 day ago</span>
                            </div>
                          )}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {prayerRequests.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Hand className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No Prayer Requests Yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Be the first to share a prayer request with the community.
              </p>
              <Button
                onClick={() => setIsCreateDialogOpen(true)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add First Prayer Request
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}