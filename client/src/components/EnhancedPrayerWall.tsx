import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/use-toast';
import { apiRequest, queryClient } from '../lib/queryClient';
import { Card, CardContent, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Heart, MessageCircle, Share2, Bookmark, Eye, ChevronDown, ChevronUp, MapPin, Users, Award, TrendingUp, Zap, Plus, Filter, Upload, AlertCircle, Church, Shield, CheckCircle, ExternalLink, Trash2, AlertTriangle } from 'lucide-react';
import ExpirationSettings from './ExpirationSettings';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { formatDistanceToNow } from 'date-fns';
import type { PrayerRequest, PrayerCircle, PrayerCircleMember } from '../../../shared/schema';
import PrayerAnalyticsBadges from './PrayerAnalyticsBadges';
import ShareDialog from './ShareDialog';

const prayerRequestSchema = z.object({
  title: z.string().optional(),
  content: z.string().min(1, "Prayer request content is required"),
  isAnonymous: z.boolean().default(false),
  category: z.string().min(1, "Please select a category"),
  privacyLevel: z.string().default("public"),
  churchId: z.number().optional(),
  isPublic: z.boolean().default(true),
  isUrgent: z.boolean().default(false),
  expiresAt: z.date().optional(),
  allowsExpiration: z.boolean().default(false),
  attachmentUrl: z.string().optional(),
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
  { id: 'all', label: 'All Prayers', icon: '🙏', count: 47, group: 'filter' },
  
  // Core Life Areas
  { id: 'health', label: 'Health', icon: '💊', count: 12, group: 'life' },
  { id: 'family', label: 'Family', icon: '👨‍👩‍👧‍👦', count: 6, group: 'life' },
  { id: 'relationships', label: 'Relationships', icon: '❤️', count: 15, group: 'life' },
  { id: 'career', label: 'Career', icon: '💼', count: 8, group: 'life' },
  
  // Spiritual & Church
  { id: 'spiritual', label: 'Spiritual Growth', icon: '✝️', count: 9, group: 'spiritual' },
  { id: 'missions', label: 'Missions & Evangelism', icon: '🌍', count: 4, group: 'spiritual' },
  
  // Crisis & Support
  { id: 'grief', label: 'Grief & Loss', icon: '🕊️', count: 7, group: 'crisis' },
  { id: 'mental_health', label: 'Mental Health', icon: '🧠', count: 5, group: 'crisis' },
  { id: 'financial', label: 'Financial Hardship', icon: '💰', count: 9, group: 'crisis' },
  { id: 'parenting', label: 'Parenting', icon: '👶', count: 11, group: 'life' },
  
  // Additional Life Areas
  { id: 'education', label: 'Education & Studies', icon: '📚', count: 3, group: 'life' },
  { id: 'travel_safety', label: 'Travel & Safety', icon: '✈️', count: 2, group: 'life' },
  
  // Environmental & Disasters
  { id: 'natural_disasters', label: 'Natural Disasters', icon: '🌪️', count: 4, group: 'environmental' },
  { id: 'weather_conditions', label: 'Weather & Climate', icon: '🌦️', count: 3, group: 'environmental' },
  
  // General
  { id: 'general', label: 'General', icon: '🤲', count: 8, group: 'general' },
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
  const isUserMember = userCircles?.some((uc: any) => uc.id === circle.id) || false;
  const isCreator = circle.createdBy === currentUserId;
  const isFull = circle.memberLimit && circle.memberCount >= circle.memberLimit;
  
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-semibold text-lg truncate">{circle.name}</h4>
            <Badge variant={!circle.isPublic ? "default" : "outline"}>
              {!circle.isPublic ? "Private" : "Public"}
            </Badge>
            {circle.isIndependent && (
              <Badge variant="secondary" className="text-xs">
                Independent
              </Badge>
            )}
          </div>
          
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {circle.memberCount || 0} members
              </span>
              {circle.memberLimit && (
                <span>Limit: {circle.memberLimit}</span>
              )}
              {isCreator && <span className="text-purple-600">• Creator</span>}
            </span>
          </div>
          
          {circle.description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
              {circle.description}
            </p>
          )}
          
          {circle.focusAreas && circle.focusAreas.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {circle.focusAreas.slice(0, 3).map((area: string, index: number) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {prayerFocusAreas.find(fa => fa.id === area)?.label || area}
                </Badge>
              ))}
              {circle.focusAreas.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{circle.focusAreas.length - 3} more
                </Badge>
              )}
            </div>
          )}
          
          {circle.inviteCode && isCreator && (
            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded p-2 mb-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-purple-700 dark:text-purple-300">Invite Code</p>
                  <p className="text-sm font-mono text-purple-900 dark:text-purple-100">{circle.inviteCode}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(circle.inviteCode);
                    toast({ title: "Invite code copied!", duration: 2000 });
                  }}
                  className="text-purple-600 hover:text-purple-700"
                >
                  Copy
                </Button>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex flex-col gap-2 ml-4">
          {isCreator ? (
            <Button
              variant="destructive"
              size="sm"
              onClick={onDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          ) : (
            isUserMember ? (
              <Button
                variant="outline"
                size="sm"
                onClick={onLeave}
                disabled={isLeaving}
                className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
              >
                {isLeaving ? "Leaving..." : "Leave Circle"}
              </Button>
            ) : (
              <Button
                variant="default"
                size="sm"
                onClick={onJoin}
                disabled={isJoining || isFull}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isJoining ? "Joining..." : isFull ? "Circle Full" : "Join Circle"}
              </Button>
            )
          )}
          
          {!isUserMember && !isCreator && circle.inviteCode && (
            <p className="text-xs text-gray-500 text-center">
              Share code: {circle.inviteCode}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}

interface EnhancedPrayerWallProps {
  highlightId?: string | null;
}

export default function EnhancedPrayerWall({ highlightId }: EnhancedPrayerWallProps = {}) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreateCircleDialogOpen, setIsCreateCircleDialogOpen] = useState(false);
  const [showProfileVerificationDialog, setShowProfileVerificationDialog] = useState(false);
  const [showChurchPromptDialog, setShowChurchPromptDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());
  const [prayedRequests, setPrayedRequests] = useState<Set<number>>(new Set());
  const [bookmarkedRequests, setBookmarkedRequests] = useState<Set<number>>(new Set());
  const [showWhosPraying, setShowWhosPraying] = useState<Map<number, boolean>>(new Map());
  const [reactions, setReactions] = useState<Map<number, {praying: number, heart: number, fire: number, praise: number}>>(new Map());
  const [shareDialogOpen, setShareDialogOpen] = useState<{isOpen: boolean, prayer: PrayerRequest | null}>({isOpen: false, prayer: null});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<{isOpen: boolean, prayerId: number | null}>({isOpen: false, prayerId: null});
  
  // Expiration settings state
  const [expirationSettings, setExpirationSettings] = useState<{
    expiresAt: Date | null;
    allowsExpiration: boolean;
  }>({
    expiresAt: null,
    allowsExpiration: false,
  });
  
  // Check user's church status for prayer circle limits and profile completeness
  const { data: userChurchStatus } = useQuery({
    queryKey: ["/api/user/church-status"],
  });

  // Enhanced circle creation handler with smart guardrails
  const handleCreateCircleClick = () => {
    if (!userChurchStatus) {
      toast({
        title: "Loading...",
        description: "Checking your profile status...",
      });
      return;
    }

    // Check profile verification requirements
    if (!userChurchStatus?.profileComplete) {
      setShowProfileVerificationDialog(true);
      return;
    }

    // If user has no church, show smart church connection prompt
    if (!userChurchStatus?.hasChurch) {
      setShowChurchPromptDialog(true);
      return;
    }

    // Church members can create circles directly
    setIsCreateCircleDialogOpen(true);
  };

  const form = useForm<PrayerRequestFormData>({
    resolver: zodResolver(prayerRequestSchema),
    defaultValues: {
      title: "",
      content: "",
      isAnonymous: false,
      category: "",
      privacyLevel: "public",
      isPublic: true,
      isUrgent: false,
      allowsExpiration: false,
      attachmentUrl: "",
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

  // Auto-scroll to highlighted prayer request
  useEffect(() => {
    if (highlightId && prayerRequests.length > 0) {
      const timer = setTimeout(() => {
        const element = document.getElementById(`prayer-${highlightId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [highlightId, prayerRequests]);

  // Load initial reaction counts for all prayers
  useEffect(() => {
    const loadReactionCounts = async () => {
      if (prayerRequests.length === 0) return;
      
      const reactionPromises = prayerRequests.map(async (prayer: any) => {
        try {
          const response = await fetch(`/api/prayers/${prayer.id}/reactions`, {
            credentials: 'include',
          });
          if (response.ok) {
            const data = await response.json();
            return { prayerId: prayer.id, reactions: data.reactionCounts };
          }
        } catch (error) {
          // Silently handle errors
        }
        return { prayerId: prayer.id, reactions: { heart: 0, fire: 0, praise: 0 } };
      });
      
      const results = await Promise.all(reactionPromises);
      setReactions(prev => {
        const newMap = new Map(prev);
        results.forEach(({ prayerId, reactions }) => {
          const current = newMap.get(prayerId) || { praying: 0, heart: 0, fire: 0, praise: 0 };
          newMap.set(prayerId, { 
            ...current, 
            heart: reactions.heart || 0,
            fire: reactions.fire || 0,
            praise: reactions.praise || 0
          });
        });
        return newMap;
      });
    };
    
    loadReactionCounts();
  }, [prayerRequests]);

  // Fetch prayer circles with error handling
  const { data: prayerCircles = [], isLoading: circlesLoading, error: circlesError } = useQuery({
    queryKey: ["/api/prayer-circles"],
    retry: false, // Disable retries to reduce server load
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
  });

  // Fetch user's prayer circles with error handling
  const { data: userPrayerCircles = [], isLoading: userCirclesLoading, error: userCirclesError } = useQuery({
    queryKey: ["/api/user/prayer-circles"],
    retry: false, // Disable retries to reduce server load
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
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
      const requestData = {
        ...data,
        expiresAt: expirationSettings.expiresAt,
        allowsExpiration: expirationSettings.allowsExpiration,
      };
      return await apiRequest("POST", "/api/prayers", requestData);
    },
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/prayers"] });
      setIsCreateDialogOpen(false);
      form.reset();
      setExpirationSettings({ expiresAt: null, allowsExpiration: false });
      // Dynamic message based on privacy level
      const privacyMessages = {
        public: "Your prayer request has been shared publicly with everyone.",
        community: "Your prayer request has been shared with your church community.",
        prayer_circle: "Your prayer request has been shared with your prayer circle/team.",
        pastor_only: "Your prayer request has been shared privately with your pastor/priest."
      };
      
      const privacyLevel = variables.privacyLevel || "public";
      toast({
        title: "Prayer Request Posted",
        description: privacyMessages[privacyLevel] || "Your prayer request has been posted.",
      });
    },
    onError: (error: any) => {
      let errorMessage = "Failed to post prayer request. Please check your connection and try again.";
      
      // Check for authentication errors
      if (error?.message?.includes('Authentication required') || 
          error?.message?.includes('Unauthorized') ||
          error?.status === 401) {
        errorMessage = "Please sign in to post prayer requests.";
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      toast({
        title: "Unable to Post Prayer",
        description: errorMessage,
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
        const prayer = prayerRequests.find(p => p.id === prayerId);
        const current = newMap.get(prayerId) || { praying: prayer?.prayerCount || 0, heart: 0, fire: 0, praise: 0 }; // Use actual database count
        newMap.set(prayerId, { ...current, praying: Number(current.praying || 0) + 1 }); // Always increment by 1
        return newMap;
      });
      toast({
        title: "Prayer Added",
        description: "Thank you for praying for this request.",
      });
    },
  });

  // Delete prayer request mutation
  const deletePrayerMutation = useMutation({
    mutationFn: async (prayerId: number) => {
      await apiRequest("DELETE", `/api/prayers/${prayerId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prayers"] });
      toast({
        title: "Prayer Deleted",
        description: "Your prayer request has been removed from the Prayer Wall.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete prayer request. Please try again.",
        variant: "destructive",
      });
    },
  });

  // React to prayer mutation
  const reactToPrayerMutation = useMutation({
    mutationFn: async ({ prayerId, reaction }: { prayerId: number, reaction: string }) => {
      return await apiRequest("POST", `/api/prayers/${prayerId}/react`, { reaction });
    },
    onSuccess: (response, { prayerId, reaction }) => {
      // Update reaction counts immediately with the response data
      setReactions(prev => {
        const newMap = new Map(prev);
        const current = newMap.get(prayerId) || { praying: 0, heart: 0, fire: 0, praise: 0 };
        newMap.set(prayerId, { 
          ...current, 
          heart: response.reactionCounts?.heart || 0,
          fire: response.reactionCounts?.fire || 0,
          praise: response.reactionCounts?.praise || 0
        });
        return newMap;
      });
      
      // Refresh the prayer list to get updated data
      queryClient.invalidateQueries({ queryKey: ["/api/prayers"] });
      
      toast({
        title: response.reacted ? "Reaction Added" : "Reaction Removed",
        description: response.message,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to add reaction. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Bookmark prayer mutation
  const bookmarkPrayerMutation = useMutation({
    mutationFn: async (prayerId: number) => {
      return await apiRequest("POST", `/api/prayers/${prayerId}/bookmark`, {});
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["/api/prayers/bookmarked"] });
      toast({
        title: response.bookmarked ? "Prayer Bookmarked" : "Bookmark Removed",
        description: response.message,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to bookmark prayer. Please try again.",
        variant: "destructive",
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
    return cat ? cat.icon : '🤲'; // Changed from 🙏 to 🤲 to avoid confusion
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleDeletePrayer = (prayerId: number) => {
    setDeleteDialogOpen({isOpen: true, prayerId});
  };

  const confirmDeletePrayer = () => {
    if (deleteDialogOpen.prayerId) {
      deletePrayerMutation.mutate(deleteDialogOpen.prayerId);
      setDeleteDialogOpen({isOpen: false, prayerId: null});
    }
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
                  <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Share a Prayer Request</DialogTitle>
                      <DialogDescription>
                        Share what's on your heart for our community to pray for
                      </DialogDescription>
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
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Choose a prayer category..." />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {/* Core Life Categories */}
                                  <div className="px-2 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
                                    Daily Life
                                  </div>
                                  {prayerCategories.filter(cat => cat.group === 'life').map((category) => (
                                    <SelectItem key={category.id} value={category.id}>
                                      <div className="flex items-center gap-2">
                                        <span>{category.icon}</span>
                                        {category.label}
                                      </div>
                                    </SelectItem>
                                  ))}
                                  
                                  {/* Spiritual Categories */}
                                  <div className="px-2 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 border-t">
                                    Spiritual & Church
                                  </div>
                                  {prayerCategories.filter(cat => cat.group === 'spiritual').map((category) => (
                                    <SelectItem key={category.id} value={category.id}>
                                      <div className="flex items-center gap-2">
                                        <span>{category.icon}</span>
                                        {category.label}
                                      </div>
                                    </SelectItem>
                                  ))}
                                  
                                  {/* Crisis Support Categories */}
                                  <div className="px-2 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 border-t">
                                    Crisis & Support
                                  </div>
                                  {prayerCategories.filter(cat => cat.group === 'crisis').map((category) => (
                                    <SelectItem key={category.id} value={category.id}>
                                      <div className="flex items-center gap-2">
                                        <span>{category.icon}</span>
                                        {category.label}
                                      </div>
                                    </SelectItem>
                                  ))}
                                  
                                  {/* Environmental & Disasters */}
                                  <div className="px-2 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 border-t">
                                    Environmental & Disasters
                                  </div>
                                  {prayerCategories.filter(cat => cat.group === 'environmental').map((category) => (
                                    <SelectItem key={category.id} value={category.id}>
                                      <div className="flex items-center gap-2">
                                        <span>{category.icon}</span>
                                        {category.label}
                                      </div>
                                    </SelectItem>
                                  ))}
                                  
                                  {/* General */}
                                  <div className="px-2 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 border-t">
                                    General
                                  </div>
                                  {prayerCategories.filter(cat => cat.group === 'general').map((category) => (
                                    <SelectItem key={category.id} value={category.id}>
                                      <div className="flex items-center gap-2">
                                        <span>{category.icon}</span>
                                        {category.label}
                                      </div>
                                    </SelectItem>
                                  ))}
                                  
                                  {/* Note about General category */}
                                  <div className="px-2 py-1 text-xs text-gray-400 italic">
                                    Use "General" for prayers that don't fit other categories
                                  </div>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Upload Image/Video Field */}
                        <FormField
                          control={form.control}
                          name="attachmentUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Upload Prayer Image/Video (Optional)</FormLabel>
                              <FormControl>
                                <div className="flex items-center gap-2">
                                  <Input 
                                    type="file" 
                                    accept="image/*,video/*"
                                    onChange={async (e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        try {
                                          // Upload file to server
                                          const formData = new FormData();
                                          formData.append('file', file);
                                          
                                          const response = await fetch('/api/upload', {
                                            method: 'POST',
                                            body: formData,
                                            credentials: 'include'
                                          });
                                          
                                          if (response.ok) {
                                            const result = await response.json();
                                            field.onChange(result.url || result.filename);
                                            toast({
                                              title: "File Uploaded",
                                              description: "Your file has been uploaded successfully!",
                                            });
                                          } else {
                                            throw new Error('Upload failed');
                                          }
                                        } catch (error) {
                                          toast({
                                            title: "Upload Error",
                                            description: "Failed to upload file. Please try again.",
                                            variant: "destructive"
                                          });
                                          field.onChange(''); // Clear the field on error
                                        }
                                      }
                                    }}
                                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                  />
                                  <Upload className="w-4 h-4 text-gray-400" />
                                </div>
                              </FormControl>
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


                        </div>

                        {/* Privacy & Expiration Settings */}
                        <ExpirationSettings
                          contentType="prayer"
                          allowsExpiration={expirationSettings.allowsExpiration}
                          initialExpiresAt={expirationSettings.expiresAt}
                          privacyLevel={form.watch('privacyLevel')}
                          onSettingsChange={setExpirationSettings}
                          onPrivacyChange={(value) => form.setValue('privacyLevel', value)}
                        />

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
              <div className="space-y-3">
                {/* Primary Categories - Most Used */}
                <div className="flex flex-wrap gap-2">
                  {prayerCategories.filter(cat => ['all', 'health', 'family', 'relationships', 'spiritual', 'general'].includes(cat.id)).map((category) => (
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
                
                {/* Expandable Additional Categories */}
                <details className="group">
                  <summary className="cursor-pointer text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 list-none">
                    <div className="flex items-center gap-2">
                      <ChevronDown className="w-4 h-4 group-open:rotate-180 transition-transform" />
                      More Categories
                    </div>
                  </summary>
                  <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex flex-wrap gap-2">
                      {prayerCategories.filter(cat => !['all', 'health', 'family', 'relationships', 'spiritual', 'general'].includes(cat.id)).map((category) => (
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
                  </div>
                </details>
              </div>
            </CardContent>
          </Card>

          {/* Prayer Requests Feed */}
          <div className="space-y-4">
            <AnimatePresence>
              {filteredPrayers.map((prayer) => {
                // Calculate prayer count consistently
                const currentReactions = reactions.get(prayer.id) || { 
                  praying: prayer.prayerCount || 0, // Use actual database count
                  heart: 0, 
                  fire: 0, 
                  praise: 0 
                };
                const isExpanded = expandedCards.has(prayer.id);
                const showingWhosPraying = showWhosPraying.get(prayer.id) || false;
                const authorName = prayer.isAnonymous 
                  ? 'Anonymous' 
                  : ((prayer as any).authorFirstName && (prayer as any).authorLastName) 
                    ? `${(prayer as any).authorFirstName} ${(prayer as any).authorLastName}`
                    : (prayer as any).authorEmail 
                      ? (prayer as any).authorEmail.split('@')[0]
                      : 'Community Member';
                const churchName = prayer.churchId ? 'Local Church' : 'Community Prayer';

                return (
                  <motion.div
                    key={prayer.id}
                    id={`prayer-${prayer.id}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card 
                      className={`transition-all duration-200 hover:shadow-lg ${
                        highlightId && prayer.id.toString() === highlightId 
                          ? 'border-2 border-red-500 bg-red-50 dark:bg-red-900/20 shadow-lg' 
                          : prayer.isUrgent 
                            ? 'border-l-4 border-l-red-500 bg-gradient-to-r from-red-50 to-white dark:from-red-900/20 dark:to-transparent' 
                            : ''
                      }`}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={prayer.isAnonymous ? undefined : (prayer as any).authorProfileImageUrl} />
                              <AvatarFallback className="bg-blue-500 text-white">
                                {prayer.isAnonymous ? '?' : getInitials(authorName)}
                              </AvatarFallback>
                            </Avatar>
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
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => bookmarkPrayerMutation.mutate(prayer.id)}
                              className={bookmarkedRequests.has(prayer.id) ? 'text-yellow-600' : ''}
                              title="Bookmark this prayer"
                            >
                              <Bookmark className="w-4 h-4" />
                            </Button>
                            {/* Share Button - Only show for public prayers */}
                            {prayer.privacyLevel === 'public' && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => setShareDialogOpen({isOpen: true, prayer})}
                                title="Share this prayer"
                                className="text-blue-600 hover:text-blue-700"
                              >
                                <Share2 className="w-4 h-4" />
                              </Button>
                            )}
                            
                            {/* Delete Button - Only show for prayer author */}
                            {user && prayer.authorEmail && (
                              (String(user.id) === String(prayer.authorId) || user.email === prayer.authorEmail) && (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => handleDeletePrayer(prayer.id)}
                                  className="text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                                  title="Delete prayer request"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )
                            )}
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
                        
                        {/* Display attached photo if present */}
                        {prayer.attachmentUrl && (
                          <div className="mt-4">
                            <img 
                              src={prayer.attachmentUrl} 
                              alt="Prayer request attachment"
                              className="rounded-lg max-w-full h-auto border border-gray-200 dark:border-gray-700"
                              style={{ maxHeight: '300px', objectFit: 'contain' }}
                              onError={(e) => {
                                console.error('Image failed to load:', prayer.attachmentUrl);
                                e.currentTarget.style.display = 'none';
                              }}
                              onLoad={() => {
                                console.log('Image loaded successfully:', prayer.attachmentUrl);
                              }}
                            />
                          </div>
                        )}

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
                              {currentReactions.praying > 0 
                                ? `${currentReactions.praying} people are praying for this request` 
                                : "Be the first to pray for this request"
                              }
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
                  <Button className="w-full mt-4" onClick={handleCreateCircleClick}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Prayer Circle
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Create New Prayer Circle</DialogTitle>
                    <DialogDescription>
                      Create a small group prayer circle to pray together with specific people
                    </DialogDescription>
                  </DialogHeader>

                  {/* Church Status Information */}
                  {userChurchStatus && !(userChurchStatus as any)?.hasChurch && (
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
                            You can create up to 2 independent prayer circles ({(userChurchStatus as any)?.independentCirclesCount || 0}/2 created).
                          </p>
                          <p className="text-xs text-blue-700 dark:text-blue-300">
                            💡 Join a local church to create unlimited prayer circles and connect with a larger faith community.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {(userChurchStatus as any)?.hasChurch && (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 mb-4">
                      <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm font-medium">
                          Church Member • {(userChurchStatus as any)?.churchName || 'Local Church'}
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

      {/* Profile Verification Requirements Dialog */}
      <Dialog open={showProfileVerificationDialog} onOpenChange={setShowProfileVerificationDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-orange-500" />
              Profile Verification Required
            </DialogTitle>
            <DialogDescription>
              Complete your profile to create prayer circles and connect with others
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              To create prayer circles, please complete your profile verification:
            </div>
            <div className="space-y-2">
              {!(userChurchStatus as any)?.profileComplete && (
                <div className="flex items-center gap-2 text-sm">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <span>Missing: Email verification, full name, or phone number</span>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowProfileVerificationDialog(false)}>
                Later
              </Button>
              <Button onClick={() => window.location.href = '/profile'} className="bg-orange-600 hover:bg-orange-700">
                <ExternalLink className="w-4 h-4 mr-2" />
                Complete Profile
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Smart Church Connection Prompt Dialog */}
      <Dialog open={showChurchPromptDialog} onOpenChange={setShowChurchPromptDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Church className="w-5 h-5 text-blue-500" />
              Prayer Circle Options
            </DialogTitle>
            <DialogDescription>
              Choose how you'd like to create your prayer circle
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Create unlimited prayer circles by connecting with a local church, or continue with an independent circle:
            </div>
            
            <div className="grid gap-3">
              {/* Church Connection Option */}
              <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Church className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-blue-900 dark:text-blue-100">Join a Church</h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                        • Unlimited prayer circles
                        • Pastor support and guidance
                        • Enhanced community features
                        • Church-wide prayer requests
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Independent Circle Option */}
              <Card className="border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-gray-600 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">Independent Circle</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        • Create up to {(userChurchStatus as any)?.circleLimit || 2} prayer circles
                        • Self-managed community
                        • Basic prayer features
                        • {(userChurchStatus as any)?.independentCirclesCount || 0} of {(userChurchStatus as any)?.circleLimit || 2} used
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-between gap-3">
              <Button variant="outline" onClick={() => setShowChurchPromptDialog(false)}>
                Cancel
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => window.location.href = '/churches'}>
                  <Church className="w-4 h-4 mr-2" />
                  Find Church
                </Button>
                <Button 
                  onClick={() => {
                    setShowChurchPromptDialog(false);
                    setIsCreateCircleDialogOpen(true);
                  }}
                  disabled={!(userChurchStatus as any)?.canCreateMore}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Continue Independent
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <ShareDialog
        isOpen={shareDialogOpen.isOpen}
        onClose={() => setShareDialogOpen({isOpen: false, prayer: null})}
        title="Share Prayer Request"
        content={shareDialogOpen.prayer ? `Prayer Request: ${shareDialogOpen.prayer.title || 'Community Prayer'}\n\n${shareDialogOpen.prayer.content}` : ''}
        url={window.location.href}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen.isOpen} onOpenChange={(open) => !open && setDeleteDialogOpen({isOpen: false, prayerId: null})}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Delete Prayer Request
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. Your prayer request will be permanently removed from the Prayer Wall.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialogOpen({isOpen: false, prayerId: null})}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDeletePrayer}
              disabled={deletePrayerMutation.isPending}
            >
              {deletePrayerMutation.isPending ? "Deleting..." : "Delete Prayer"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}