import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';

import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/use-toast';
import { Card, CardContent, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import SmartScriptureTextarea from './SmartScriptureTextarea';
import { apiRequest, queryClient } from '../lib/queryClient';
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
  EyeOff,
  Play,
  Trash2,
  Flag,
  Edit
} from 'lucide-react';
import { FlagContentDialog } from './content-moderation/FlagContentDialog';
import { ContentModerationStatus, HiddenContentPlaceholder } from './content-moderation/ContentModerationStatus';
import FormattedContent from '../utils/FormattedContent';
import ShareDialog from './ShareDialog';
import { CommentDialog } from './CommentDialog';

interface EnhancedPost {
  id: number;
  authorId: string;
  churchId?: number;
  title: string;
  content: string;
  category: string;
  isPublic: boolean;
  audience: string;
  mood?: string;
  suggestedVerses?: any;
  attachedMedia?: any;
  linkedVerse?: any;
  isPinned: boolean;
  pinnedBy?: string;
  pinnedAt?: string;
  pinnedUntil?: string;
  pinCategory?: string;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
  author?: {
    id: string;
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
  };
  reactions?: {
    type: string;
    emoji: string;
    count: number;
    userReacted: boolean;
  }[];
  tags?: string[];
  visibility?: 'public' | 'friends' | 'group';
}

interface ReactionType {
  type: string;
  emoji: string;
  label: string;
  tooltip: string;
}

const REACTION_TYPES: ReactionType[] = [
  { type: 'heart', emoji: '❤️', label: 'Love', tooltip: 'Show love and support' },
  { type: 'pray', emoji: '🙏', label: 'Praying', tooltip: 'Praying for this request' },
  { type: 'amen', emoji: '🙌', label: 'Amen', tooltip: 'Amen! Agreeing in faith' },
  { type: 'fire', emoji: '🔥', label: 'Fire', tooltip: 'This is powerful!' },
  { type: 'peace', emoji: '☮️', label: 'Peace', tooltip: 'Finding peace in this' },
  { type: 'strength', emoji: '💪', label: 'Strength', tooltip: 'Drawing strength from this' },
  { type: 'joy', emoji: '😊', label: 'Joy', tooltip: 'This brings me joy' },
  { type: 'wisdom', emoji: '🧠', label: 'Wisdom', tooltip: 'Wise words and insight' },
];

// Video Share Preview Component
function VideoSharePreview({ post }: { post: EnhancedPost }) {
  const extractVideoInfo = (content: string) => {
    // Extract video title (between "Shared Video: " and "**")
    const titleMatch = content.match(/📺 \*\*Shared Video: (.*?)\*\*/);
    const title = titleMatch ? titleMatch[1] : 'Shared Video';
    
    // Extract description (text between title and watch link)
    const descMatch = content.match(/\*\*\n\n(.*?)\n\n🎬 Watch:/);
    const description = descMatch ? descMatch[1].trim() : '';
    
    // Extract YouTube URL
    const urlMatch = content.match(/🎬 Watch: (https:\/\/[^\s]+)/);
    const url = urlMatch ? urlMatch[1] : '';
    
    // Extract YouTube video ID for thumbnail
    const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    const videoId = videoIdMatch ? videoIdMatch[1] : '';
    const thumbnail = videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : '';
    
    return { title, description, url, thumbnail, videoId };
  };

  const { title, description, url, thumbnail } = extractVideoInfo(post.content);
  
  // Debug video info
  

  const handleWatchVideo = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    
    
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
      <div className="flex items-start gap-4">
        {/* Video Thumbnail */}
        {thumbnail && (
          <div className="relative flex-shrink-0 w-32 h-20 sm:w-40 sm:h-24">
            <img 
              src={thumbnail} 
              alt={title}
              className="w-full h-full object-cover rounded-lg"
              onError={(e) => {
                // Fallback to hqdefault if maxresdefault fails
                const target = e.target as HTMLImageElement;
                if (target.src.includes('maxresdefault')) {
                  target.src = target.src.replace('maxresdefault', 'hqdefault');
                }
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 hover:bg-opacity-30 transition-all rounded-lg cursor-pointer" onClick={handleWatchVideo}>
              <Play className="w-8 h-8 text-white" />
            </div>
          </div>
        )}
        
        {/* Video Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base line-clamp-2">{title}</h4>
              {description && (
                <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm mt-1 line-clamp-2">{description}</p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-600">
                  📺 Video
                </Badge>
                <span className="text-xs text-gray-500 dark:text-gray-400">YouTube</span>
              </div>
            </div>
          </div>
          
          {/* Watch Button */}
          <Button 
            onClick={handleWatchVideo}
            size="sm" 
            className="mt-3 bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Play className="w-3 h-3 mr-1" />
            Watch Video
          </Button>
        </div>
      </div>
    </div>
  );
}

interface FilterOptions {
  type: string;
  category: string;
  timeRange: string;
  visibility: string;
  hasReactions: boolean;
  sortBy: string;
}

interface EnhancedCommunityFeedProps {
  highlightId?: string | null;
}

export default function EnhancedCommunityFeed({ highlightId }: EnhancedCommunityFeedProps = {}) {
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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<number | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [sharePost, setSharePost] = useState<EnhancedPost | null>(null);
  const [commentDialogOpen, setCommentDialogOpen] = useState<number | null>(null);

  // Fetch discussions
  const { data: posts = [], isLoading, refetch } = useQuery<EnhancedPost[]>({
    queryKey: ['/api/discussions', filters, searchQuery, highlightId],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (highlightId) {
        queryParams.append('highlight', highlightId);
      }
      
      const url = `/api/discussions${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch discussions');
      const data = await response.json();
      // Ensure each post has proper structure with default values
      return Array.isArray(data) ? data.map(post => ({
        ...post,
        reactions: post.reactions || [],
        author: post.author || { id: '', firstName: 'Anonymous', lastName: 'User' }
      })) : [];
    },
  });

  // Auto-scroll to highlighted post when highlightId changes
  useEffect(() => {
    if (highlightId && posts && posts.length > 0) {
      const timer = setTimeout(() => {
        const element = document.getElementById(`post-${highlightId}`);
        if (element) {
          element.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
          // Add a temporary highlight effect
          element.style.border = '3px solid #ef4444';
          element.style.borderRadius = '8px';
          setTimeout(() => {
            element.style.border = '';
          }, 5000);
        }
      }, 1000); // Wait for posts to load
      
      return () => clearTimeout(timer);
    }
  }, [highlightId, posts]);

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
      // Force refetch discussions to get updated counts
      refetch();
      
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
      refetch();
    },
  });

  const handleReaction = (post: EnhancedPost, reactionType: string) => {
    const reaction = REACTION_TYPES.find(r => r.type === reactionType);
    if (!reaction) return;

    const existingReaction = post.reactions?.find(r => r.type === reactionType);
    
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

  // Delete post mutation
  const deletePostMutation = useMutation({
    mutationFn: async (postId: number) => {
      return await apiRequest('DELETE', `/api/discussions/${postId}`);
    },
    onSuccess: () => {
      refetch();
      setDeleteDialogOpen(false);
      setPostToDelete(null);
      toast({
        title: "Success",
        description: "Discussion deleted successfully!",
      });
    },
    onError: (error: any) => {
      setDeleteDialogOpen(false);
      setPostToDelete(null);
      toast({
        title: "Error",
        description: `Failed to delete discussion: ${error.message || 'Please try again.'}`,
        variant: "destructive",
      });
    }
  });

  const handleDeletePost = (postId: number) => {
    setPostToDelete(postId);
    setDeleteDialogOpen(true);
  };

  const confirmDeletePost = () => {
    if (postToDelete) {
      deletePostMutation.mutate(postToDelete);
    }
  };

  const handleComment = (postId: number) => {
    console.log('Opening comment dialog for post ID:', postId);
    setCommentDialogOpen(postId);
  };

  // Debug reaction data for the first post
  useEffect(() => {
    if (posts.length > 0) {
      console.log('First post reactions data:', posts[0].reactions);
      console.log('Full post data sample:', posts[0]);
    }
  }, [posts]);

  const handleShare = (post: EnhancedPost) => {
    setSharePost(post);
    setShareDialogOpen(true);
  };

  const updateFilter = (key: keyof FilterOptions, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Ensure posts is always an array for rendering
  const renderPosts = Array.isArray(posts) ? posts : [];

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
    <TooltipProvider>
      <div className="space-y-6">
      {/* Enhanced Actions Bar */}
      <Card className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-purple-100 p-6">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-400" />
              <Input
                placeholder="Search discussions, authors, or topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 border-purple-200 focus:border-purple-400 focus:ring-purple-400/20 bg-white/80"
              />
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-md">
                  <Plus className="h-4 w-4 mr-2" />
                  Start Discussion
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    Start a New Discussion
                  </DialogTitle>
                  <DialogDescription>
                    Share your thoughts, questions, or spiritual insights with the community.
                  </DialogDescription>
                </DialogHeader>
                <CreateDiscussionForm onSuccess={() => setShowCreateDialog(false)} />
              </DialogContent>
            </Dialog>
            
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
                    <DialogDescription>
                      Filter posts by type, mood, or author to find the content you're looking for.
                    </DialogDescription>
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
      </Card>

      {/* Posts Feed */}
      <div className="space-y-4">
        <AnimatePresence>
          {renderPosts.map((post) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card 
                id={`post-${post.id}`}
                className={`hover:shadow-md transition-shadow dark:bg-gray-800 dark:border-gray-700 ${
                  highlightId && post.id.toString() === highlightId 
                    ? 'ring-2 ring-red-500 bg-red-50 dark:bg-red-900/10' 
                    : ''
                }`}
              >
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Post Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage 
                            src={post.author?.profileImageUrl || ""} 
                            alt={`${post.author?.firstName || ''} ${post.author?.lastName || ''}`}
                            className="object-cover"
                          />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                            {post.author?.firstName?.charAt(0) || 'A'}{post.author?.lastName?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-gray-900 dark:text-white dark:font-bold">
                              {post.author?.firstName && post.author?.lastName 
                                ? `${post.author.firstName} ${post.author.lastName}`
                                : 'Anonymous User'
                              }
                            </span>
                            <span className="text-xl">💬</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300 dark:font-medium">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                            <span>•</span>
                            <span className="capitalize">{post.audience || 'public'}</span>
                            <span>•</span>
                            <span className="capitalize">{post.category || 'general'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Post Content */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-base sm:text-lg text-gray-900 dark:text-white dark:font-bold break-words hyphens-auto leading-tight">{post.title}</h3>
                      
                      {/* Check if this is a video share */}
                      {(() => {
                        const hasVideoContent = post.content?.includes('📺') && post.content?.includes('🎬 Watch:');
                        
                        
                        
                        if (hasVideoContent) {
                          
                          try {
                            return <VideoSharePreview post={post} />;
                          } catch (error) {
                            // VideoSharePreview error handled
                            return <div className="text-red-500">Error loading video preview</div>;
                          }
                        } else {
                          // Add a test button for YouTube videos even when not detected as video content
                          const hasYouTubeLink = post.content?.includes('youtube.com') || post.content?.includes('youtu.be');
                          if (hasYouTubeLink) {
                            const urlMatch = post.content?.match(/(https:\/\/[^\s]+youtube[^\s]*)/);
                            const youtubeUrl = urlMatch ? urlMatch[1] : '';
                            
                            
                            return (
                              <div>
                                <FormattedContent 
                                  content={post.content} 
                                  attachedMedia={post.attachedMedia} 
                                  className="text-gray-800 dark:text-gray-100 dark:font-semibold whitespace-pre-wrap break-words text-sm sm:text-base overflow-wrap-anywhere hyphens-auto leading-relaxed"
                                />
                                {youtubeUrl && (
                                  <Button 
                                    onClick={() => {
                                      
                                      window.open(youtubeUrl, '_blank', 'noopener,noreferrer');
                                    }}
                                    size="sm" 
                                    className="mt-2 bg-red-600 hover:bg-red-700 text-white"
                                  >
                                    <Play className="w-3 h-3 mr-1" />
                                    Watch on YouTube
                                  </Button>
                                )}
                              </div>
                            );
                          }
                          
                          return (
                            <FormattedContent 
                              content={post.content} 
                              attachedMedia={post.attachedMedia} 
                              className="text-gray-800 dark:text-gray-100 dark:font-semibold whitespace-pre-wrap break-words text-sm sm:text-base overflow-wrap-anywhere hyphens-auto leading-relaxed"
                            />
                          );
                        }
                      })()}
                      
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
                      {post.reactions && post.reactions.length > 0 && (
                        <div className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
                          <div className="flex -space-x-1">
                            {(post.reactions || []).slice(0, 3).map((reaction, index) => (
                              <span 
                                key={index}
                                className="text-lg z-10 bg-white rounded-full border px-1"
                                style={{ zIndex: 3 - index }}
                              >
                                {reaction.emoji}
                              </span>
                            ))}
                          </div>
                          <span>
                            {post.reactions?.reduce((sum, r) => sum + Number(r.count || 0), 0) || 0} reactions
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
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                        <div className="flex items-center flex-wrap gap-1">
                          {REACTION_TYPES.slice(0, 4).map((reactionType) => {
                            const postReaction = post.reactions?.find(r => r.type === reactionType.type);
                            const isActive = postReaction?.userReacted;
                            const count = postReaction?.count || 0;
                            
                            return (
                              <Tooltip key={reactionType.type}>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant={isActive ? "default" : "ghost"}
                                    size="sm"
                                    onClick={() => handleReaction(post, reactionType.type)}
                                    className={`text-xs sm:text-sm px-2 sm:px-3 ${isActive ? 'bg-blue-100 text-blue-600' : ''}`}
                                  >
                                    <span className="mr-1">{reactionType.emoji}</span>
                                    <span className="text-xs">{count}</span>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{reactionType.tooltip}</p>
                                </TooltipContent>
                              </Tooltip>
                            );
                          })}
                        </div>

                        <div className="flex items-center space-x-1 sm:space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-xs sm:text-sm px-2 sm:px-3"
                            onClick={() => handleComment(post.id)}
                          >
                            <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            <span>{post.commentCount || 0}</span>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-xs sm:text-sm px-2 sm:px-3"
                            onClick={() => handleShare(post)}
                          >
                            <Share2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            <span>{post.shareCount || 0}</span>
                          </Button>

                          {/* Flag Button - Only show for other users' posts */}
                          {user && post.author && (String(user.id) !== String(post.authorId) && user.email !== post.author.email) && (
                            <FlagContentDialog
                              contentType="discussion"
                              contentId={post.id}
                              trigger={
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 text-xs sm:text-sm px-2 sm:px-3"
                                  title="Report this content"
                                >
                                  <Flag className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                  <span className="hidden sm:inline">Report</span>
                                </Button>
                              }
                            />
                          )}

                          {/* Edit Button - Only show for flagged content when user is author */}
                          {user && post.author && (String(user.id) === String(post.authorId) || user.email === post.author.email) && 
                           highlightId && post.id.toString() === highlightId && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-orange-500 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 text-xs sm:text-sm px-2 sm:px-3"
                                  title="Edit flagged content"
                                >
                                  <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                                  <span className="hidden sm:inline ml-1">Edit Now</span>
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Edit Flagged Discussion</DialogTitle>
                                  <DialogDescription>
                                    This content has been flagged for moderation. Please edit it to comply with community guidelines.
                                  </DialogDescription>
                                </DialogHeader>
                                <EditDiscussionForm post={post} onSuccess={() => {
                                  refetch();
                                  window.location.href = '/community';
                                }} />
                              </DialogContent>
                            </Dialog>
                          )}

                          {/* Delete Button - Only show for post author (when not flagged content) */}
                          {user && post.author && (String(user.id) === String(post.authorId) || user.email === post.author.email) && 
                           !(highlightId && post.id.toString() === highlightId) && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleDeletePost(post.id)}
                              className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 text-xs sm:text-sm px-2 sm:px-3"
                              title="Delete discussion"
                            >
                              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                              <span className="hidden sm:inline ml-1">Delete</span>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {renderPosts.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="border-0 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 shadow-xl">
              <CardContent className="p-12 text-center">
                <div className="space-y-6">
                  {/* Gradient Icon Background */}
                  <div className="mx-auto w-24 h-24 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center shadow-lg">
                    <MessageCircle className="w-12 h-12 text-purple-600" />
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                      {searchQuery || Object.values(filters).some(f => f !== 'all' && f !== false)
                        ? "No discussions match your criteria"
                        : "Start the Conversation"}
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 text-lg max-w-md mx-auto leading-relaxed">
                      {searchQuery || Object.values(filters).some(f => f !== 'all' && f !== false)
                        ? "Try adjusting your filters or search terms to find more discussions"
                        : "Share your thoughts, ask questions, or start a meaningful conversation with fellow believers"}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                    <Button 
                      onClick={() => setShowCreateDialog(true)}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg px-8 py-3 text-base"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      Start First Discussion
                    </Button>
                    
                    {(searchQuery || Object.values(filters).some(f => f !== 'all' && f !== false)) && (
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setSearchQuery('');
                          setFilters({
                            type: 'all',
                            category: 'all',
                            timeRange: 'all',
                            visibility: 'all',
                            hasReactions: false,
                            sortBy: 'recent'
                          });
                        }}
                        className="border-purple-200 text-purple-600 hover:bg-purple-50 px-6 py-3"
                      >
                        Clear Filters
                      </Button>
                    )}
                  </div>

                  {/* Inspiring Quote */}
                  {!searchQuery && !Object.values(filters).some(f => f !== 'all' && f !== false) && (
                    <div className="pt-6 border-t border-purple-100">
                      <p className="text-sm text-gray-500 italic">
                        "As iron sharpens iron, so one person sharpens another." - Proverbs 27:17
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Discussion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this discussion? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 mt-4">
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deletePostMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDeletePost}
              disabled={deletePostMutation.isPending}
            >
              {deletePostMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      {sharePost && (
        <ShareDialog
          isOpen={shareDialogOpen}
          onClose={() => {
            setShareDialogOpen(false);
            setSharePost(null);
          }}
          title={`Share "${sharePost.title}"`}
          content={sharePost.content}
          url={`${window.location.origin}/discussions?highlight=${sharePost.id}`}
        />
      )}

      {/* Comment Dialog */}
      {commentDialogOpen && (
        <CommentDialog
          isOpen={true}
          onClose={() => {
            setCommentDialogOpen(null);
            // Force refetch to ensure comment counts are updated
            setTimeout(() => {
              refetch();
            }, 100);
          }}
          postId={commentDialogOpen}
          postType="discussion"
        />
      )}
      </div>
    </TooltipProvider>
  );
}

// Create Discussion Form Component
function CreateDiscussionForm({ onSuccess }: { onSuccess: () => void }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general',
    isPublic: true,
    tags: ''
  });

  const createDiscussionMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('POST', '/api/discussions', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/discussions'] });
      toast({
        title: "Discussion created",
        description: "Your discussion has been shared with the community",
      });
      onSuccess();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create discussion. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide both a title and content for your discussion",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const tagsArray = formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [];
      
      await createDiscussionMutation.mutateAsync({
        title: formData.title.trim(),
        content: formData.content.trim(),
        type: 'discussion',
        audience: formData.isPublic ? 'public' : 'church',
        tags: tagsArray
      });
      
      // Reset form
      setFormData({
        title: '',
        content: '',
        category: 'general',
        isPublic: true,
        tags: ''
      });
    } catch (error) {
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-300 dark:text-gray-300">Discussion Title</label>
        <Input
          placeholder="What would you like to discuss?"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          className="border-purple-200 focus:border-purple-400 focus:ring-purple-400/20"
          disabled={isSubmitting}
        />
      </div>

      {/* Content */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-300 dark:text-gray-300">Your Message</label>
        <SmartScriptureTextarea
          placeholder="Share your thoughts, ask questions, or start a meaningful conversation..."
          value={formData.content}
          onChange={(value) => setFormData(prev => ({ ...prev, content: value }))}
          className="min-h-32 border-purple-200 focus:border-purple-400 focus:ring-purple-400/20"
          disabled={isSubmitting}
        />
        <p className="text-xs text-gray-500">
          Tip: Type Bible references (like "John 3:16") and they'll be automatically highlighted
        </p>
      </div>

      {/* Category & Settings */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300 dark:text-gray-300">Category</label>
          <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
            <SelectTrigger className="border-purple-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="general">General Discussion</SelectItem>
              <SelectItem value="prayer">Prayer Request</SelectItem>
              <SelectItem value="bible_study">Bible Study</SelectItem>
              <SelectItem value="testimony">Testimony</SelectItem>
              <SelectItem value="question">Question</SelectItem>
              <SelectItem value="sermon_discussion">Sermon Discussion</SelectItem>
              <SelectItem value="youth_ministry">Youth Ministry</SelectItem>
              <SelectItem value="family_faith">Family & Faith</SelectItem>
              <SelectItem value="missions">Missions & Outreach</SelectItem>
              <SelectItem value="worship">Worship & Music</SelectItem>
              <SelectItem value="life_challenges">Life Challenges</SelectItem>
              <SelectItem value="spiritual_growth">Spiritual Growth</SelectItem>
              <SelectItem value="church_events">Church Events</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300 dark:text-gray-300">Visibility</label>
          <Select value={formData.isPublic ? "public" : "private"} onValueChange={(value) => setFormData(prev => ({ ...prev, isPublic: value === "public" }))}>
            <SelectTrigger className="border-purple-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public">Public - Everyone can see</SelectItem>
              <SelectItem value="private">Private - Only your church</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-300 dark:text-gray-300">Tags (optional)</label>
        <Input
          placeholder="Add tags separated by commas (e.g., faith, prayer, hope)"
          value={formData.tags}
          onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
          className="border-purple-200 focus:border-purple-400 focus:ring-purple-400/20"
          disabled={isSubmitting}
        />
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onSuccess} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button 
          type="submit" 
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Posting...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Share Discussion
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

// Edit Discussion Form Component for Flagged Content
function EditDiscussionForm({ post, onSuccess }: { post: EnhancedPost; onSuccess: () => void }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: post.title || '',
    content: post.content || '',
    category: post.category || 'general',
    isPublic: post.isPublic,
  });

  const updateDiscussionMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('PUT', `/api/discussions/${post.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/discussions'] });
      toast({
        title: "Discussion updated",
        description: "Your discussion has been updated and will be reviewed",
      });
      onSuccess();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update discussion. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide both a title and content for your discussion",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      await updateDiscussionMutation.mutateAsync({
        title: formData.title.trim(),
        content: formData.content.trim(),
        category: formData.category,
        isPublic: true, // Make public again after editing
      });
    } catch (error) {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Discussion Title</label>
        <Input
          placeholder="Enter discussion title..."
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Category</label>
        <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="general">General Discussion</SelectItem>
            <SelectItem value="prayer">Prayer Request</SelectItem>
            <SelectItem value="bible_study">Bible Study</SelectItem>
            <SelectItem value="testimony">Testimony</SelectItem>
            <SelectItem value="question">Question</SelectItem>
            <SelectItem value="announcement">Announcement</SelectItem>
            <SelectItem value="sermon_discussion">Sermon Discussion</SelectItem>
            <SelectItem value="youth_ministry">Youth Ministry</SelectItem>
            <SelectItem value="family_faith">Family & Faith</SelectItem>
            <SelectItem value="missions_outreach">Missions & Outreach</SelectItem>
            <SelectItem value="worship_music">Worship & Music</SelectItem>
            <SelectItem value="life_challenges">Life Challenges</SelectItem>
            <SelectItem value="spiritual_growth">Spiritual Growth</SelectItem>
            <SelectItem value="church_events">Church Events</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Content</label>
        <SmartScriptureTextarea
          placeholder="Share your thoughts, ask questions, or start a meaningful conversation..."
          value={formData.content}
          onChange={(value) => setFormData({ ...formData, content: value })}
          className="min-h-[100px]"
        />
      </div>
      
      <div className="flex justify-end space-x-2 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => window.location.href = '/community'}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        >
          {isSubmitting ? "Updating..." : "Update Discussion"}
        </Button>
      </div>
    </form>
  );
}