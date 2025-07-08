import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/use-toast';
import { apiRequest, queryClient } from '../lib/queryClient';
import { Card, CardContent, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Heart, MessageCircle, Share, Bookmark, Eye, ChevronDown, ChevronUp, MapPin, Users, Award, TrendingUp, Zap, Plus, Filter, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { formatDistanceToNow } from 'date-fns';
import type { PrayerRequest, PrayerCircle, PrayerCircleMember } from '../../../shared/schema';
import PrayerAnalyticsBadges from './PrayerAnalyticsBadges';

const prayerRequestSchema = z.object({
  title: z.string().optional(),
  content: z.string().min(1, "Prayer request content is required"),
  isAnonymous: z.boolean().default(false),
  category: z.string().default("general"),
  churchId: z.number().optional(),
  isPublic: z.boolean().default(true),
  isUrgent: z.boolean().default(false),
  isSilent: z.boolean().default(false),
});

type PrayerRequestFormData = z.infer<typeof prayerRequestSchema>;
// Simplified form type without complex validation
interface PrayerCircleFormData {
  name: string;
  description: string;
  isPublic: boolean;
  memberLimit?: number;
  focusAreas: string[];
}

const prayerCategories = [
  { id: 'all', label: 'All Prayers', icon: '🙏', count: 47 },
  { id: 'health', label: 'Health', icon: '💊', count: 12 },
  { id: 'career', label: 'Career', icon: '💼', count: 8 },
  { id: 'relationships', label: 'Relationships', icon: '❤️', count: 15 },
  { id: 'spiritual', label: 'Spiritual Growth', icon: '✝️', count: 9 },
  { id: 'family', label: 'Family', icon: '👨‍👩‍👧‍👦', count: 6 },
  { id: 'urgent', label: 'Urgent', icon: '⚡', count: 3 },
  { id: 'general', label: 'General', icon: '🤲', count: 8 },
];

const prayerFocusAreas = [
  { id: 'healing', label: 'Healing & Health', icon: '💊', description: 'Physical and emotional healing prayers' },
  { id: 'family', label: 'Family & Relationships', icon: '👨‍👩‍👧‍👦', description: 'Marriage, children, and family unity' },
  { id: 'students', label: 'Students & Education', icon: '🎓', description: 'Academic success and wisdom' },
  { id: 'career', label: 'Career & Finances', icon: '💼', description: 'Job opportunities and financial provision' },
  { id: 'missions', label: 'Missions & Outreach', icon: '🌍', description: 'Global ministry and evangelism' },
  { id: 'spiritual_growth', label: 'Spiritual Growth', icon: '✝️', description: 'Discipleship and spiritual maturity' },
  { id: 'breakthrough', label: 'Breakthrough & Victory', icon: '⚡', description: 'Overcoming challenges and obstacles' },
  { id: 'worship', label: 'Worship & Praise', icon: '🙌', description: 'Celebration and thanksgiving' },
];

interface PrayerCircleCardProps {
  circle: any;
  onJoin: () => void;
  onLeave: () => void;
  onDelete: () => void;
  isJoining: boolean;
  isLeaving: boolean;
  isDeleting: boolean;
  userCircles: any[];
  currentUserId: string;
}

function PrayerCircleCard({ circle, onJoin, onLeave, onDelete, isJoining, isLeaving, isDeleting, userCircles, currentUserId }: PrayerCircleCardProps) {
  const isUserMember = userCircles.some((uc: any) => uc.id === circle.id);
  const isCreator = circle.createdBy === currentUserId;
  
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <div className="flex-1">
        <div className="font-semibold">{circle.name}</div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {circle.memberCount || 0} members • {circle.activeMembers || 0} active
          {isCreator && <span className="text-purple-600 ml-2">• Creator</span>}
        </div>
        {circle.description && (
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {circle.description}
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Badge variant={!circle.isPublic ? "default" : "outline"}>
          {!circle.isPublic ? "Private" : "Public"}
        </Badge>
        {isCreator && (
          <Button
            variant="destructive"
            size="sm"
            onClick={onDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        )}
        {!isCreator && (
          isUserMember ? (
            <Button
              variant="outline"
              size="sm"
              onClick={onLeave}
              disabled={isLeaving}
            >
              {isLeaving ? "Leaving..." : "Leave"}
            </Button>
          ) : (
            <Button
              variant="default"
              size="sm"
              onClick={onJoin}
              disabled={isJoining || (circle.memberLimit && circle.memberCount >= circle.memberLimit)}
            >
              {isJoining ? "Joining..." : "Join"}
            </Button>
          )
        )}
      </div>
    </div>
  );
}

export default function EnhancedPrayerWall() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreateCircleDialogOpen, setIsCreateCircleDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());
  const [prayedRequests, setPrayedRequests] = useState<Set<number>>(new Set());
  const [bookmarkedRequests, setBookmarkedRequests] = useState<Set<number>>(new Set());
  const [showWhosPraying, setShowWhosPraying] = useState<Map<number, boolean>>(new Map());
  const [reactions, setReactions] = useState<Map<number, {praying: number, heart: number, fire: number, praise: number}>>(new Map());
  
  // Check user's church status for prayer circle limits
  const { data: userChurchStatus } = useQuery({
    queryKey: ["/api/user/church-status"],
  });

  const form = useForm<PrayerRequestFormData>({
    resolver: zodResolver(prayerRequestSchema),
    defaultValues: {
      title: "",
      content: "",
      isAnonymous: false,
      category: "general",
      isPublic: true,
      isUrgent: false,
      isSilent: false,
    },
  });

  const circleForm = useForm({
    defaultValues: {
      name: "",
      description: "",
      isPublic: true,
      memberLimit: 25,
      focusAreas: [],
    },
  });

  // Fetch prayer requests
  const { data: prayerRequests = [], isLoading } = useQuery<PrayerRequest[]>({
    queryKey: ["/api/prayers"],
  });

  // Fetch prayer circles with error handling
  const { data: prayerCircles = [], isLoading: circlesLoading, error: circlesError } = useQuery({
    queryKey: ["/api/prayer-circles"],
    retry: 3,
    retryDelay: 1000,
  });

  // Fetch user's prayer circles with error handling
  const { data: userPrayerCircles = [], isLoading: userCirclesLoading, error: userCirclesError } = useQuery({
    queryKey: ["/api/user/prayer-circles"],
    retry: 3,
    retryDelay: 1000,
  });

  // Filter prayers by category
  const filteredPrayers = selectedCategory === 'all' 
    ? prayerRequests 
    : selectedCategory === 'urgent'
      ? prayerRequests.filter(prayer => prayer.isUrgent)
      : prayerRequests.filter(prayer => (prayer.category || 'general') === selectedCategory);

  // Create prayer request mutation
  const createPrayerMutation = useMutation({
    mutationFn: async (data: PrayerRequestFormData) => {
      return await apiRequest("POST", "/api/prayers", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prayers"] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: "Prayer Request Posted",
        description: "Your prayer request has been shared with the community.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to post prayer request. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Create prayer circle mutation
  const createCircleMutation = useMutation({
    mutationFn: async (data: PrayerCircleFormData) => {

      return await apiRequest("POST", "/api/prayer-circles", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prayer-circles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/prayer-circles"] });
      setIsCreateCircleDialogOpen(false);
      circleForm.reset();
      toast({
        title: "Prayer Circle Created",
        description: "Your prayer circle has been created successfully.",
      });
    },
    onError: (error: any) => {
      let errorMessage = "Failed to create prayer circle. Please try again.";
      
      if (error?.requiresVerification) {
        errorMessage = "Please verify your email and complete your profile before creating prayer circles.";
      } else if (error?.limitReached) {
        errorMessage = "You can create up to 2 independent prayer circles. Consider joining a local church for unlimited circles.";
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  // Join prayer circle mutation
  const joinCircleMutation = useMutation({
    mutationFn: async (circleId: number) => {
      return await apiRequest("POST", `/api/prayer-circles/${circleId}/join`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prayer-circles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/prayer-circles"] });
      toast({
        title: "Joined Prayer Circle",
        description: "You have successfully joined the prayer circle.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to join prayer circle. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Leave prayer circle mutation
  const leaveCircleMutation = useMutation({
    mutationFn: async (circleId: number) => {
      return await apiRequest("DELETE", `/api/prayer-circles/${circleId}/leave`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prayer-circles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/prayer-circles"] });
      toast({
        title: "Left Prayer Circle",
        description: "You have successfully left the prayer circle.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to leave prayer circle. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete prayer circle mutation
  const deleteCircleMutation = useMutation({
    mutationFn: async (circleId: number) => {
      return await apiRequest("DELETE", `/api/prayer-circles/${circleId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prayer-circles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/prayer-circles"] });
      toast({
        title: "Prayer Circle Deleted",
        description: "Prayer circle has been permanently deleted.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete prayer circle. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Pray for request mutation
  const prayForRequestMutation = useMutation({
    mutationFn: async (prayerId: number) => {
      return await apiRequest("POST", `/api/prayers/${prayerId}/pray`, {});
    },
    onSuccess: (_, prayerId) => {
      setPrayedRequests(prev => new Set(Array.from(prev).concat([prayerId])));
      // Update reaction count simply - just increment by 1
      setReactions(prev => {
        const newMap = new Map(prev);
        const current = newMap.get(prayerId) || { praying: 3, heart: 0, fire: 0, praise: 0 }; // Start with baseline 3
        newMap.set(prayerId, { ...current, praying: current.praying + 1 }); // Always increment by 1
        return newMap;
      });
      toast({
        title: "Prayer Added",
        description: "Thank you for praying for this request.",
      });
    },
  });

  // React to prayer mutation
  const reactToPrayerMutation = useMutation({
    mutationFn: async ({ prayerId, reaction }: { prayerId: number, reaction: string }) => {
      return await apiRequest("POST", `/api/prayers/${prayerId}/react`, { reaction });
    },
    onSuccess: (_, { prayerId, reaction }) => {
      setReactions(prev => {
        const newMap = new Map(prev);
        const current = newMap.get(prayerId) || { praying: 0, heart: 0, fire: 0, praise: 0 };
        newMap.set(prayerId, { 
          ...current, 
          [reaction]: current[reaction as keyof typeof current] + 1 
        });
        return newMap;
      });
    },
  });

  // Bookmark prayer mutation
  const bookmarkPrayerMutation = useMutation({
    mutationFn: async (prayerId: number) => {
      return await apiRequest("POST", `/api/prayers/${prayerId}/bookmark`, {});
    },
    onSuccess: (_, prayerId) => {
      setBookmarkedRequests(prev => {
        const newSet = new Set(Array.from(prev));
        if (newSet.has(prayerId)) {
          newSet.delete(prayerId);
        } else {
          newSet.add(prayerId);
        }
        return newSet;
      });
      toast({
        title: bookmarkedRequests.has(prayerId) ? "Bookmark Removed" : "Prayer Bookmarked",
        description: bookmarkedRequests.has(prayerId) 
          ? "Prayer removed from your bookmarks." 
          : "Prayer saved to your bookmarks for follow-up.",
      });
    },
  });

  const toggleExpandCard = (prayerId: number) => {
    setExpandedCards(prev => {
      const newSet = new Set(Array.from(prev));
      if (newSet.has(prayerId)) {
        newSet.delete(prayerId);
      } else {
        newSet.add(prayerId);
      }
      return newSet;
    });
  };

  const toggleWhosPraying = (prayerId: number) => {
    setShowWhosPraying(prev => {
      const newMap = new Map(prev);
      newMap.set(prayerId, !newMap.get(prayerId));
      return newMap;
    });
  };

  const onSubmit = (data: PrayerRequestFormData) => {
    createPrayerMutation.mutate(data);
  };

  const getCategoryIcon = (category: string) => {
    const cat = prayerCategories.find(c => c.id === category);
    return cat ? cat.icon : '🙏';
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Prayer Wall
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Share your prayer requests and pray for others in our community
        </p>
      </div>

      <Tabs defaultValue="prayers" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="prayers">Prayer Requests</TabsTrigger>
          <TabsTrigger value="circles">Prayer Circles</TabsTrigger>
          <TabsTrigger value="analytics">Analytics & Badges</TabsTrigger>
        </TabsList>

        <TabsContent value="prayers" className="space-y-6">
          {/* Category Filters */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Prayer Categories
                </h3>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      New Prayer Request
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Share a Prayer Request</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Title (Optional)</FormLabel>
                              <FormControl>
                                <Input placeholder="Brief title for your prayer request" {...field} />
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
                              <FormLabel>Prayer Request</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Share what you'd like prayer for..." 
                                  className="min-h-[100px]"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Category</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a category" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {prayerCategories.filter(cat => cat.id !== 'all').map((category) => (
                                    <SelectItem key={category.id} value={category.id}>
                                      <div className="flex items-center gap-2">
                                        <span>{category.icon}</span>
                                        {category.label}
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="space-y-3">
                          <FormField
                            control={form.control}
                            name="isUrgent"
                            render={({ field }) => (
                              <FormItem className="flex items-center justify-between">
                                <FormLabel>Mark as Urgent</FormLabel>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="isAnonymous"
                            render={({ field }) => (
                              <FormItem className="flex items-center justify-between">
                                <FormLabel>Post Anonymously</FormLabel>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="isSilent"
                            render={({ field }) => (
                              <FormItem className="flex items-center justify-between">
                                <FormLabel>Silent Prayer Mode</FormLabel>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>

                        <Button 
                          type="submit" 
                          className="w-full"
                          disabled={createPrayerMutation.isPending}
                        >
                          {createPrayerMutation.isPending ? "Posting..." : "Share Prayer Request"}
                        </Button>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {prayerCategories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                    className="flex items-center gap-2"
                  >
                    <span>{category.icon}</span>
                    {category.label}
                    <Badge variant="secondary" className="ml-1">
                      {category.count}
                    </Badge>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Prayer Requests Feed */}
          <div className="space-y-4">
            <AnimatePresence>
              {filteredPrayers.map((prayer) => {
                // Calculate prayer count consistently
                const currentReactions = reactions.get(prayer.id) || { 
                  praying: 3, // Start with baseline of 3 (Sarah M., Pastor Tom, Maria G.)
                  heart: 0, 
                  fire: 0, 
                  praise: 0 
                };
                const isExpanded = expandedCards.has(prayer.id);
                const showingWhosPraying = showWhosPraying.get(prayer.id) || false;
                const authorName = prayer.isAnonymous ? 'Anonymous' : (prayer.authorId ? 'Community Member' : 'Anonymous');
                const churchName = prayer.churchId ? 'Local Church' : 'Community Prayer';

                return (
                  <motion.div
                    key={prayer.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card 
                      className={`transition-all duration-200 hover:shadow-lg ${
                        prayer.isUrgent ? 'border-l-4 border-l-red-500 bg-gradient-to-r from-red-50 to-white dark:from-red-900/20 dark:to-transparent' : ''
                      }`}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                              {prayer.isAnonymous ? '?' : getInitials(authorName)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">
                                  {authorName}
                                </span>
                                {prayer.isUrgent && (
                                  <Badge variant="destructive" className="text-xs flex items-center gap-1">
                                    <Zap className="w-3 h-3" />
                                    Urgent
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <MapPin className="w-3 h-3" />
                                {churchName}
                                <span>•</span>
                                <span>{prayer.createdAt ? formatDistanceToNow(new Date(prayer.createdAt)) : 'Recently'} ago</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{getCategoryIcon(prayer.category || 'general')}</span>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                // Create file input element
                                const input = document.createElement('input');
                                input.type = 'file';
                                input.accept = 'image/*';
                                input.onchange = async (e) => {
                                  const file = (e.target as HTMLInputElement).files?.[0];
                                  if (file) {
                                    try {
                                      const formData = new FormData();
                                      formData.append('photo', file);
                                      
                                      const response = await fetch(`/api/prayers/${prayer.id}/upload`, {
                                        method: 'POST',
                                        body: formData,
                                        credentials: 'include'
                                      });
                                      
                                      if (response.ok) {
                                        const result = await response.json();
                                        toast({
                                          title: "Photo Uploaded",
                                          description: "Your photo has been uploaded successfully!",
                                        });
                                      } else {
                                        const error = await response.json();
                                        toast({
                                          title: "Upload Failed",
                                          description: error.message || "Failed to upload photo",
                                          variant: "destructive"
                                        });
                                      }
                                    } catch (error) {

                                      toast({
                                        title: "Upload Error",
                                        description: "An error occurred while uploading the photo",
                                        variant: "destructive"
                                      });
                                    }
                                  }
                                };
                                input.click();
                              }}
                              title="Upload photo or attachment"
                            >
                              <Upload className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => bookmarkPrayerMutation.mutate(prayer.id)}
                              className={bookmarkedRequests.has(prayer.id) ? 'text-yellow-600' : ''}
                              title="Bookmark this prayer"
                            >
                              <Bookmark className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                if (navigator.share) {
                                  navigator.share({
                                    title: `Prayer Request: ${prayer.title || 'Community Prayer'}`,
                                    text: prayer.content,
                                    url: window.location.href
                                  });
                                } else {
                                  navigator.clipboard.writeText(`Prayer Request: ${prayer.content}\n\nJoin us in prayer at ${window.location.href}`);
                                  toast({
                                    title: "Prayer Link Copied",
                                    description: "Share this prayer with others.",
                                  });
                                }
                              }}
                              title="Share this prayer"
                            >
                              <Share className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        {prayer.title && (
                          <h4 className="font-semibold text-lg">{prayer.title}</h4>
                        )}
                        
                        <div className="text-gray-700 dark:text-gray-300">
                          {isExpanded ? (
                            <div>
                              <p>{prayer.content}</p>
                              {prayer.content.length > 150 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleExpandCard(prayer.id)}
                                  className="mt-2 text-blue-600 p-0 h-auto"
                                >
                                  <ChevronUp className="w-4 h-4 mr-1" />
                                  Show Less
                                </Button>
                              )}
                            </div>
                          ) : (
                            <div>
                              <p className="line-clamp-3">
                                {prayer.content.length > 150 
                                  ? `${prayer.content.substring(0, 150)}...` 
                                  : prayer.content
                                }
                              </p>
                              {prayer.content.length > 150 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleExpandCard(prayer.id)}
                                  className="mt-2 text-blue-600 p-0 h-auto"
                                >
                                  <ChevronDown className="w-4 h-4 mr-1" />
                                  Read More
                                </Button>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Rich Reactions */}
                        <div className="flex items-center justify-between pt-2 border-t dark:border-gray-700">
                          <div className="flex items-center gap-4">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className={`flex items-center gap-2 ${prayedRequests.has(prayer.id) ? 'text-blue-600' : ''}`}
                              onClick={() => prayForRequestMutation.mutate(prayer.id)}
                              disabled={prayedRequests.has(prayer.id)}
                              title="Pray for this request"
                            >
                              🙏 <span className="font-semibold">{currentReactions.praying}</span>
                              <span className="text-sm">Praying</span>
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="flex items-center gap-2 hover:text-red-500"
                              onClick={() => reactToPrayerMutation.mutate({ prayerId: prayer.id, reaction: 'heart' })}
                              title="Show love and support"
                            >
                              ❤️ <span>{currentReactions.heart}</span>
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="flex items-center gap-2 hover:text-orange-500"
                              onClick={() => reactToPrayerMutation.mutate({ prayerId: prayer.id, reaction: 'fire' })}
                              title="This is powerful!"
                            >
                              🔥 <span>{currentReactions.fire}</span>
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="flex items-center gap-2 hover:text-yellow-500"
                              onClick={() => reactToPrayerMutation.mutate({ prayerId: prayer.id, reaction: 'praise' })}
                              title="Praise God!"
                            >
                              🙌 <span>{currentReactions.praise}</span>
                            </Button>
                          </div>
                          
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="flex items-center gap-2 text-gray-600"
                            onClick={() => toggleWhosPraying(prayer.id)}
                          >
                            <Users className="w-4 h-4" />
                            <Eye className="w-4 h-4" />
                            Who's Praying
                          </Button>
                        </div>

                        {/* Who's Praying Display */}
                        {showingWhosPraying && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3"
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <Users className="w-4 h-4 text-blue-600" />
                              <span className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                                {currentReactions.praying} people praying
                              </span>
                            </div>
                            <div className="text-sm text-blue-700 dark:text-blue-300">
                              {/* Mock data for demo - would be replaced with actual praying users */}
                              Sarah M., Pastor Tom, Maria G., +{Math.max(0, currentReactions.praying - 3)} others
                            </div>
                          </motion.div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </TabsContent>

        <TabsContent value="circles" className="space-y-6">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Prayer Circles
              </h3>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Join private or public prayer groups for deeper fellowship and focused prayer.
              </p>
              <div className="space-y-3">
                {prayerCircles.length > 0 ? (
                  prayerCircles.map((circle: any) => (
                    <PrayerCircleCard 
                      key={circle.id} 
                      circle={circle}
                      onJoin={() => joinCircleMutation.mutate(circle.id)}
                      onLeave={() => leaveCircleMutation.mutate(circle.id)}
                      onDelete={() => deleteCircleMutation.mutate(circle.id)}
                      isJoining={joinCircleMutation.isPending}
                      isLeaving={leaveCircleMutation.isPending}
                      isDeleting={deleteCircleMutation.isPending}
                      userCircles={userPrayerCircles}
                      currentUserId={user?.id || ''}
                    />
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No prayer circles available yet. Create the first one!
                  </div>
                )}
              </div>
              <Dialog open={isCreateCircleDialogOpen} onOpenChange={setIsCreateCircleDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full mt-4">
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Prayer Circle
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Create New Prayer Circle</DialogTitle>
                  </DialogHeader>

                  {/* Church Status Information */}
                  {userChurchStatus && !userChurchStatus.hasChurch && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                      <div className="flex items-start gap-3">
                        <div className="text-blue-600 dark:text-blue-400 mt-0.5">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                            Independent Prayer Circle
                          </h4>
                          <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
                            You can create up to 2 independent prayer circles ({userChurchStatus.independentCirclesCount}/2 created).
                          </p>
                          <p className="text-xs text-blue-700 dark:text-blue-300">
                            💡 Join a local church to create unlimited prayer circles and connect with a larger faith community.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {userChurchStatus?.hasChurch && (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 mb-4">
                      <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm font-medium">
                          Church Member • {userChurchStatus.churchName}
                        </span>
                      </div>
                    </div>
                  )}

                  <Form {...circleForm}>
                    <form onSubmit={circleForm.handleSubmit((data) => {

                      createCircleMutation.mutate(data);
                    })} className="space-y-6">
                      <FormField
                        control={circleForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Circle Name</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Youth Ministry Circle" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={circleForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Describe the purpose and focus of this prayer circle..."
                                className="min-h-[100px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={circleForm.control}
                        name="focusAreas"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Prayer Focus Area</FormLabel>
                            <Select onValueChange={(value) => field.onChange([value])} defaultValue={field.value?.[0]}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a prayer focus" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {prayerFocusAreas.map((focus) => (
                                  <SelectItem key={focus.id} value={focus.id}>
                                    <div className="flex items-center gap-2">
                                      <span>{focus.icon}</span>
                                      <div>
                                        <div className="font-medium">{focus.label}</div>
                                        <div className="text-xs text-gray-500">{focus.description}</div>
                                      </div>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={circleForm.control}
                        name="memberLimit"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Maximum Members (optional)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="2" 
                                max="10000" 
                                placeholder="50"
                                {...field}
                                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={circleForm.control}
                        name="isPublic"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Public Circle</FormLabel>
                              <div className="text-sm text-gray-600">
                                Public circles are visible to all church members and can be joined freely
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

                      <div className="flex justify-end gap-3">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsCreateCircleDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={createCircleMutation.isPending}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          {createCircleMutation.isPending ? "Creating..." : "Create Circle"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <PrayerAnalyticsBadges />
        </TabsContent>
      </Tabs>
    </div>
  );
}