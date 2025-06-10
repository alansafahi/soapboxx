import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Filter, 
  Plus, 
  Users, 
  Flame,
  HandHeart,
  Star,
  ThumbsUp,
  Send,
  Search,
  Calendar,
  MapPin,
  Tag,
  Eye,
  EyeOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { format } from 'date-fns';

interface EnhancedPost {
  id: number;
  type: 'discussion' | 'prayer' | 'verse_share' | 'reflection';
  title: string;
  content: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
  };
  church?: {
    id: number;
    name: string;
  };
  group?: {
    id: number;
    name: string;
    category: string;
  };
  reactions: {
    type: string;
    emoji: string;
    count: number;
    userReacted: boolean;
  }[];
  commentCount: number;
  isPublic: boolean;
  tags?: string[];
  visibility: 'public' | 'friends' | 'group';
  createdAt: string;
  updatedAt: string;
}

interface ReactionType {
  type: string;
  emoji: string;
  label: string;
}

const REACTION_TYPES: ReactionType[] = [
  { type: 'heart', emoji: '❤️', label: 'Love' },
  { type: 'pray', emoji: '🙏', label: 'Praying' },
  { type: 'amen', emoji: '🙌', label: 'Amen' },
  { type: 'fire', emoji: '🔥', label: 'Fire' },
  { type: 'peace', emoji: '☮️', label: 'Peace' },
  { type: 'strength', emoji: '💪', label: 'Strength' },
  { type: 'joy', emoji: '😊', label: 'Joy' },
  { type: 'wisdom', emoji: '🧠', label: 'Wisdom' },
];

interface FilterOptions {
  type: string;
  category: string;
  timeRange: string;
  visibility: string;
  hasReactions: boolean;
  sortBy: string;
}

export default function EnhancedCommunityFeed() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [filters, setFilters] = useState<FilterOptions>({
    type: 'all',
    category: 'all',
    timeRange: 'all',
    visibility: 'all',
    hasReactions: false,
    sortBy: 'recent'
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedReaction, setSelectedReaction] = useState<{ postId: number; reactionType: string } | null>(null);

  // Fetch enhanced community feed with filters
  const { data: posts = [], isLoading, refetch } = useQuery<EnhancedPost[]>({
    queryKey: ['/api/community/enhanced-feed', filters, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams({
        ...filters,
        search: searchQuery,
        hasReactions: filters.hasReactions.toString()
      });
      const response = await fetch(`/api/community/enhanced-feed?${params}`);
      if (!response.ok) throw new Error('Failed to fetch enhanced feed');
      return response.json();
    },
  });

  // Add reaction mutation
  const addReactionMutation = useMutation({
    mutationFn: async ({ postId, reactionType, emoji }: { postId: number; reactionType: string; emoji: string }) => {
      return await apiRequest('POST', '/api/community/reactions', {
        targetType: 'post',
        targetId: postId,
        reactionType,
        emoji,
        intensity: 1
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/community/enhanced-feed'] });
      toast({
        title: "Reaction added",
        description: "Your reaction has been shared with the community",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add reaction. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Remove reaction mutation
  const removeReactionMutation = useMutation({
    mutationFn: async ({ postId, reactionType }: { postId: number; reactionType: string }) => {
      return await apiRequest('DELETE', `/api/community/reactions/${postId}/${reactionType}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/community/enhanced-feed'] });
    },
  });

  const handleReaction = (post: EnhancedPost, reactionType: string) => {
    const reaction = REACTION_TYPES.find(r => r.type === reactionType);
    if (!reaction) return;

    const existingReaction = post.reactions.find(r => r.type === reactionType);
    
    if (existingReaction?.userReacted) {
      removeReactionMutation.mutate({ postId: post.id, reactionType });
    } else {
      addReactionMutation.mutate({ 
        postId: post.id, 
        reactionType, 
        emoji: reaction.emoji 
      });
    }
  };

  const updateFilter = (key: keyof FilterOptions, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case 'prayer': return '🙏';
      case 'verse_share': return '📖';
      case 'reflection': return '💭';
      default: return '💬';
    }
  };

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'public': return <Eye className="h-4 w-4" />;
      case 'friends': return <Users className="h-4 w-4" />;
      case 'group': return <EyeOff className="h-4 w-4" />;
      default: return <Eye className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                  <div className="space-y-1">
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Filter Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-64">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search posts, authors, or topics..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Filter Community Feed</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Post Type</label>
                      <Select value={filters.type} onValueChange={(value) => updateFilter('type', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="discussion">Discussions</SelectItem>
                          <SelectItem value="prayer">Prayer Requests</SelectItem>
                          <SelectItem value="verse_share">Verse Shares</SelectItem>
                          <SelectItem value="reflection">Reflections</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Time Range</label>
                      <Select value={filters.timeRange} onValueChange={(value) => updateFilter('timeRange', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Time</SelectItem>
                          <SelectItem value="today">Today</SelectItem>
                          <SelectItem value="week">This Week</SelectItem>
                          <SelectItem value="month">This Month</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Sort By</label>
                      <Select value={filters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="recent">Most Recent</SelectItem>
                          <SelectItem value="popular">Most Popular</SelectItem>
                          <SelectItem value="reactions">Most Reactions</SelectItem>
                          <SelectItem value="comments">Most Comments</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts Feed */}
      <div className="space-y-4">
        <AnimatePresence>
          {posts.map((post) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Post Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {post.author.firstName?.charAt(0)}{post.author.lastName?.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-gray-900">
                              {post.author.firstName} {post.author.lastName}
                            </span>
                            <span className="text-xl">{getPostTypeIcon(post.type)}</span>
                            {getVisibilityIcon(post.visibility)}
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <Calendar className="h-3 w-3" />
                            <span>{format(new Date(post.createdAt), 'MMM d, h:mm a')}</span>
                            {post.church && (
                              <>
                                <span>•</span>
                                <MapPin className="h-3 w-3" />
                                <span>{post.church.name}</span>
                              </>
                            )}
                            {post.group && (
                              <>
                                <span>•</span>
                                <Badge variant="secondary" className="text-xs">
                                  {post.group.name}
                                </Badge>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Post Content */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-lg text-gray-900">{post.title}</h3>
                      <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
                      
                      {/* Tags */}
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex items-center space-x-2">
                          <Tag className="h-4 w-4 text-gray-400" />
                          <div className="flex flex-wrap gap-1">
                            {post.tags.map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                #{tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Enhanced Reactions */}
                    <div className="space-y-3 border-t pt-4">
                      {/* Reaction Summary */}
                      {post.reactions.length > 0 && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <div className="flex -space-x-1">
                            {post.reactions.slice(0, 3).map((reaction, index) => (
                              <span 
                                key={index}
                                className="text-lg z-10 bg-white rounded-full border"
                                style={{ zIndex: 3 - index }}
                              >
                                {reaction.emoji}
                              </span>
                            ))}
                          </div>
                          <span>
                            {post.reactions.reduce((sum, r) => sum + r.count, 0)} reactions
                          </span>
                          {post.commentCount > 0 && (
                            <>
                              <span>•</span>
                              <span>{post.commentCount} comments</span>
                            </>
                          )}
                        </div>
                      )}

                      {/* Reaction Buttons */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1">
                          {REACTION_TYPES.slice(0, 4).map((reactionType) => {
                            const postReaction = post.reactions.find(r => r.type === reactionType.type);
                            const isActive = postReaction?.userReacted;
                            
                            return (
                              <Button
                                key={reactionType.type}
                                variant={isActive ? "default" : "ghost"}
                                size="sm"
                                onClick={() => handleReaction(post, reactionType.type)}
                                className={`text-sm ${isActive ? 'bg-blue-100 text-blue-600' : ''}`}
                              >
                                <span className="mr-1">{reactionType.emoji}</span>
                                {postReaction?.count || 0}
                              </Button>
                            );
                          })}
                        </div>

                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <MessageCircle className="h-4 w-4 mr-1" />
                            Comment
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Share2 className="h-4 w-4 mr-1" />
                            Share
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {posts.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="space-y-4">
                <div className="text-6xl">💬</div>
                <h3 className="text-lg font-semibold text-gray-900">No posts found</h3>
                <p className="text-gray-600">
                  {searchQuery || Object.values(filters).some(f => f !== 'all' && f !== false)
                    ? "Try adjusting your filters or search query"
                    : "Be the first to share something with the community!"}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}