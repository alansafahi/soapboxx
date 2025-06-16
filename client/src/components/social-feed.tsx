import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { 
  Heart, 
  MessageCircle, 
  RotateCw, 
  Clock, 
  MapPin, 
  Users,
  Church,
  BookOpen,
  PlusCircle,
  Bookmark,
  BookmarkCheck,
  Send,
  X,
  Smile,
  ChevronDown,
  Globe,
  Lock,
  Eye
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface FeedPost {
  id: number;
  type: 'discussion' | 'prayer' | 'event' | 'inspiration' | 'announcement' | 'share';
  title?: string;
  content: string;
  author: {
    id: string;
    name: string;
    profileImage?: string;
  };
  church?: {
    id: number;
    name: string;
  };
  audience?: 'public' | 'church' | 'private';
  createdAt: Date;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  isLiked: boolean;
  isBookmarked?: boolean;
  suggestedVerses?: any[];
  tags?: string[];
  eventDate?: Date;
  location?: string;
  mood?: string;
  suggestedVerses?: any[];
}

export default function SocialFeed() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const getMoodEmoji = (mood: string) => {
    const moodMap: { [key: string]: string } = {
      // Emotional Support
      lonely: "💙", overwhelmed: "🤗", shame: "💜", doubting: "🤔",
      "needing-forgiveness": "🙏", "struggling-sin": "💭", "seeking-purpose": "🎯",
      "starting-over": "🌱", "wanting-growth": "📈", grief: "💔",
      
      // Growth & Transformation  
      hopeful: "✨", excited: "⭐", anticipating: "🔮", peaceful: "🕊️",
      confident: "💪", motivated: "🚀", determined: "🎯", "seeking-wisdom": "📖",
      faithful: "✝️", learning: "📚",
      
      // Life Situations
      celebrating: "🎉", married: "💍", "new-baby": "👶", "new-job": "💼",
      traveling: "✈️", "health-challenge": "🏥", moving: "📦", graduating: "🎓",
      
      // Faith & Worship-Specific
      blessed: "🙌", grateful: "🙏", worshipful: "🎵", prayerful: "🤲",
      evangelistic: "📢", serving: "🤝", studying: "📖", fasting: "🕯️",
      "spirit-filled": "🔥", anxious: "😰"
    };
    return moodMap[mood] || "💭";
  };

  const getMoodDisplayName = (mood: string) => {
    const moodNames: { [key: string]: string } = {
      // Emotional Support
      lonely: "feeling lonely", overwhelmed: "feeling overwhelmed", shame: "dealing with shame", 
      doubting: "having doubts", "needing-forgiveness": "needing forgiveness", 
      "struggling-sin": "struggling with sin", "seeking-purpose": "seeking purpose",
      "starting-over": "starting over", "wanting-growth": "wanting to grow", grief: "grieving",
      
      // Growth & Transformation  
      hopeful: "feeling hopeful", excited: "feeling excited", anticipating: "anticipating", 
      peaceful: "feeling peaceful", confident: "feeling confident", motivated: "feeling motivated", 
      determined: "feeling determined", "seeking-wisdom": "seeking wisdom", faithful: "feeling faithful", 
      learning: "learning",
      
      // Life Situations
      celebrating: "celebrating", married: "got married", "new-baby": "welcoming a new baby", 
      "new-job": "starting a new job", traveling: "traveling", "health-challenge": "facing health challenges", 
      moving: "moving", graduating: "graduating",
      
      // Faith & Worship-Specific
      blessed: "feeling blessed", grateful: "feeling grateful", worshipful: "in worship", 
      prayerful: "in prayer", evangelistic: "sharing the gospel", serving: "serving others", 
      studying: "studying scripture", fasting: "fasting", "spirit-filled": "spirit-filled", 
      anxious: "feeling anxious", seeking: "Seeking Guidance"
    };
    return moodNames[mood] || mood;
  };
  
  // Performance optimization: removed console logging
  const [newPost, setNewPost] = useState("");
  // AI will automatically determine post type, so we don't need manual selection
  
  // Mood/feeling selection for posts
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [showMoodDropdown, setShowMoodDropdown] = useState(false);
  
  // Audience selection for posts (Facebook-style)
  const [selectedAudience, setSelectedAudience] = useState<'public' | 'church' | 'private'>('public');
  const [showAudienceDropdown, setShowAudienceDropdown] = useState(false);
  
  // Comment modal state
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [activePost, setActivePost] = useState<FeedPost | null>(null);
  const [commentText, setCommentText] = useState("");

  // Expanded verses state for AI suggestions
  const [expandedVerses, setExpandedVerses] = useState<Set<number>>(new Set());

  // Toggle verse expansion for a specific post
  const toggleVerseExpansion = (postId: number) => {
    setExpandedVerses(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  // Mood/feeling options for posts
  const moodOptions = [
    { id: "grateful", label: "Grateful", icon: "🙏", color: "bg-green-100 text-green-800" },
    { id: "blessed", label: "Blessed", icon: "✨", color: "bg-yellow-100 text-yellow-800" },
    { id: "peaceful", label: "Peaceful", icon: "🕊️", color: "bg-blue-100 text-blue-800" },
    { id: "hopeful", label: "Hopeful", icon: "🌅", color: "bg-orange-100 text-orange-800" },
    { id: "joyful", label: "Joyful", icon: "😊", color: "bg-pink-100 text-pink-800" },
    { id: "reflective", label: "Reflective", icon: "🤔", color: "bg-purple-100 text-purple-800" },
    { id: "anxious", label: "Anxious", icon: "😰", color: "bg-gray-100 text-gray-800" },
    { id: "inspired", label: "Inspired", icon: "💡", color: "bg-indigo-100 text-indigo-800" },
    { id: "seeking", label: "Seeking\nGuidance", icon: "🧭", color: "bg-teal-100 text-teal-800" },
    { id: "celebrating", label: "Celebrating", icon: "🎉", color: "bg-red-100 text-red-800" },
    { id: "praying", label: "Praying", icon: "🙏", color: "bg-violet-100 text-violet-800" },
    { id: "studying", label: "Studying Scripture", icon: "📖", color: "bg-amber-100 text-amber-800" }
  ];

  // Fetch social feed data with optimized refresh
  const { data: feedPosts = [], isLoading } = useQuery({
    queryKey: ['/api/feed'],
    refetchInterval: 60000, // Refresh every 60 seconds (reduced from 30)
    staleTime: 30000, // Consider data fresh for 30 seconds
  });

  // Create new post mutation
  const createPostMutation = useMutation({
    mutationFn: async (postData: any) => {
      return await apiRequest('/api/feed/posts', {
        method: 'POST',
        body: postData
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/feed'] });
      setNewPost("");
      setSelectedMood(null); // Clear selected mood after successful post
      
      // Show Bible verse suggestions if provided
      if (data.suggestedVerses && data.suggestedVerses.length > 0) {
        toast({
          title: "Post Created with Spiritual Guidance",
          description: `Your post has been shared! We've suggested ${data.suggestedVerses.length} Bible verses that might encourage you.`,
        });
      } else {
        toast({
          title: "Post Created",
          description: "Your post has been shared with the community!",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      });
    },
  });



  // Bookmark post mutation
  const bookmarkPostMutation = useMutation({
    mutationFn: async ({ postId, postType, isBookmarked }: { postId: number; postType: string; isBookmarked: boolean }) => {
      const endpoint = isBookmarked ? 'unbookmark' : 'bookmark';
      return await apiRequest(`/api/${postType}s/${postId}/${endpoint}`, {
        method: 'POST'
      });
    },
    onMutate: async ({ postId, isBookmarked }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['/api/feed'] });
      const previousFeed = queryClient.getQueryData(['/api/feed']);
      
      queryClient.setQueryData(['/api/feed'], (old: any) => {
        if (!old) return old;
        return old.map((post: any) => 
          post.id === postId ? { ...post, isBookmarked: !isBookmarked } : post
        );
      });
      
      return { previousFeed };
    },
    onSuccess: (data, variables) => {
      // Update the cache with the actual server response
      queryClient.setQueryData(['/api/feed'], (old: any) => {
        if (!old) return old;
        return old.map((post: any) => 
          post.id === variables.postId ? { 
            ...post, 
            isBookmarked: data.bookmarked !== undefined ? data.bookmarked : !variables.isBookmarked
          } : post
        );
      });
      
      toast({
        title: variables.isBookmarked ? "Bookmark removed" : "Bookmarked",
        description: variables.isBookmarked ? "Post removed from bookmarks" : "Post saved to bookmarks",
      });
    },
    onError: (_, __, context) => {
      if (context?.previousFeed) {
        queryClient.setQueryData(['/api/feed'], context.previousFeed);
      }
    }
  });

  // Share post mutation
  const sharePostMutation = useMutation({
    mutationFn: async ({ postId, postType }: { postId: number; postType: string }) => {
      return await apiRequest(`/api/${postType}s/${postId}/share`, {
        method: 'POST'
      });
    },
    onMutate: async ({ postId }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['/api/feed'] });
      const previousFeed = queryClient.getQueryData(['/api/feed']);
      
      queryClient.setQueryData(['/api/feed'], (old: any) => {
        if (!old) return old;
        return old.map((post: any) => 
          post.id === postId ? { 
            ...post, 
            shareCount: post.shareCount + 1
          } : post
        );
      });
      
      return { previousFeed };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/feed'] });
      toast({
        title: "Post shared",
        description: "Post has been shared to your feed",
      });
    },
    onError: (_, __, context) => {
      if (context?.previousFeed) {
        queryClient.setQueryData(['/api/feed'], context.previousFeed);
      }
    }
  });

  // Like post mutation
  const likePostMutation = useMutation({
    mutationFn: async ({ postId, postType }: { postId: number; postType: string }) => {
      const url = `/api/${postType}s/${postId}/like`;
      return await apiRequest(url, {
        method: 'POST'
      });
    },
    onMutate: async ({ postId }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['/api/feed'] });
      const previousFeed = queryClient.getQueryData(['/api/feed']);
      
      queryClient.setQueryData(['/api/feed'], (old: any) => {
        if (!old) return old;
        return old.map((post: any) => 
          post.id === postId ? { 
            ...post, 
            isLiked: !post.isLiked,
            likeCount: post.isLiked ? post.likeCount - 1 : post.likeCount + 1
          } : post
        );
      });
      
      return { previousFeed };
    },
    onSuccess: (data, variables) => {
      // Update the cache with the actual server response
      queryClient.setQueryData(['/api/feed'], (old: any) => {
        if (!old) return old;
        return old.map((post: any) => 
          post.id === variables.postId ? { 
            ...post, 
            isLiked: data.liked,
            likeCount: data.likeCount
          } : post
        );
      });
      
      toast({
        title: data.liked ? "Liked" : "Unliked",
        description: data.liked ? "Post liked successfully" : "Post unliked successfully",
      });
    },
    onError: (_, __, context) => {
      if (context?.previousFeed) {
        queryClient.setQueryData(['/api/feed'], context.previousFeed);
      }
    }
  });

  // Prayer-specific like mutation
  const prayerLikeMutation = useMutation({
    mutationFn: async (prayerId: number) => {
      // Performance optimization: removed console logging
      return await apiRequest(`/api/prayers/${prayerId}/like`, {
        method: 'POST'
      });
    },
    onMutate: async (prayerId) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['/api/feed'] });
      const previousFeed = queryClient.getQueryData(['/api/feed']);
      
      queryClient.setQueryData(['/api/feed'], (old: any) => {
        if (!old) return old;
        return old.map((post: any) => 
          post.id === prayerId ? { 
            ...post, 
            isLiked: !post.isLiked,
            likeCount: post.isLiked ? post.likeCount - 1 : post.likeCount + 1
          } : post
        );
      });
      
      return { previousFeed };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/feed'] });
      toast({
        title: data.liked ? "Liked" : "Unliked",
        description: data.liked ? "Prayer request liked" : "Prayer request unliked",
      });
    },
    onError: (_, __, context) => {
      if (context?.previousFeed) {
        queryClient.setQueryData(['/api/feed'], context.previousFeed);
      }
    }
  });

  // Comment mutation
  const commentMutation = useMutation({
    mutationFn: async ({ postId, postType, content }: { postId: number; postType: string; content: string }) => {
      if (postType !== 'discussion') {
        throw new Error('Comments are only supported for discussions');
      }
      
      return await apiRequest(`/api/discussions/${postId}/comments`, {
        method: 'POST',
        body: { content }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/feed'] });
      toast({
        title: "Comment added",
        description: "Your comment has been posted",
      });
    },
  });

  const handleCreatePost = () => {
    if (!newPost.trim()) return;
    
    const postData = {
      content: newPost,
      mood: selectedMood
      // AI will automatically determine post type and title
    };
    
    createPostMutation.mutate(postData);
  };

  const handleMoodSelect = (moodId: string) => {
    setSelectedMood(moodId);
    setShowMoodDropdown(false);
  };

  const clearMood = () => {
    setSelectedMood(null);
  };

  const getSelectedMoodData = () => {
    return moodOptions.find(m => m.id === selectedMood);
  };

  const handleLikePost = (post: FeedPost) => {
    // Performance optimization: removed console logging
    if (post.type === 'prayer') {
      // Use direct prayer like mutation for prayer posts
      prayerLikeMutation.mutate(post.id);
    } else {
      likePostMutation.mutate({ 
        postId: post.id, 
        postType: post.type 
      });
    }
  };

  const handleCommentPost = (post: FeedPost) => {
    setActivePost(post);
    setCommentText("");
    setCommentModalOpen(true);
  };

  const submitComment = () => {
    if (!activePost || !commentText.trim()) return;
    
    // Performance optimization: removed console logging
    commentMutation.mutate({
      postId: activePost.id,
      postType: activePost.type,
      content: commentText.trim()
    });
    
    setCommentModalOpen(false);
    setCommentText("");
    setActivePost(null);
  };

  const handleQuickResponse = (response: string) => {
    setCommentText(response);
  };

  const handleSharePost = (post: FeedPost) => {
    sharePostMutation.mutate({
      postId: post.id,
      postType: post.type
    });
  };

  const getPostIcon = (type: string) => {
    switch (type) {
      case 'prayer': return <BookOpen className="w-4 h-4 text-purple-600" />;
      case 'event': return <Clock className="w-4 h-4 text-blue-600" />;
      case 'inspiration': return <Heart className="w-4 h-4 text-pink-600" />;
      case 'announcement': return <Users className="w-4 h-4 text-green-600" />;
      default: return <MessageCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getPostTypeLabel = (type: string) => {
    switch (type) {
      case 'prayer': return 'Prayer Request';
      case 'event': return 'Event';
      case 'inspiration': return 'Daily Inspiration';
      case 'announcement': return 'Announcement';
      default: return 'Discussion';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center space-y-0 pb-4">
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              <div className="ml-4 space-y-2 flex-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/6"></div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Create Post Section */}
      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-4">
            <Avatar className="w-10 h-10">
              <AvatarImage src={user?.profileImageUrl} />
              <AvatarFallback className="bg-faith-blue text-white">
                {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                placeholder="Share something with your community..."
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                className="min-h-[80px] resize-none border-gray-200 dark:border-gray-600"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {/* Selected Mood Display */}
          {selectedMood && (
            <div className="mb-3 flex items-center gap-2">
              <Badge className={`${getSelectedMoodData()?.color} border-0`}>
                <span className="mr-1">{getSelectedMoodData()?.icon}</span>
                Feeling {getSelectedMoodData()?.label}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearMood}
                className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Feeling/Activity Button */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMoodDropdown(!showMoodDropdown)}
                  className="text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                >
                  <Smile className="w-4 h-4 mr-2" />
                  Feeling
                  <ChevronDown className="w-3 h-3 ml-1" />
                </Button>

                {/* Mood Dropdown */}
                {showMoodDropdown && (
                  <div className="absolute top-full left-0 mt-1 z-50 bg-white border border-gray-200 rounded-md shadow-lg min-w-64 max-h-64 overflow-y-auto">
                    <div className="p-2">
                      <div className="grid grid-cols-2 gap-1">
                        {moodOptions.map((mood) => (
                          <Button
                            key={mood.id}
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMoodSelect(mood.id)}
                            className="justify-start h-auto p-2 text-left hover:bg-gray-50"
                          >
                            <span className="mr-2">{mood.icon}</span>
                            <span className="text-sm whitespace-pre-line">{mood.label}</span>
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Button 
              onClick={handleCreatePost}
              disabled={!newPost.trim() || createPostMutation.isPending}
              className="bg-[#5A2671] hover:bg-[#4A1F5C] text-white font-medium px-6 py-2 border-0"
            >
              <Send className="w-4 h-4 mr-2 text-white" />
              {createPostMutation.isPending ? 'Posting...' : 'Share'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Feed Posts */}
      <div className="space-y-6">
        {Array.isArray(feedPosts) && feedPosts.length > 0 ? feedPosts.map((post: FeedPost) => (
          <Card key={`${post.type}-${post.id}`} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={post.author.profileImage} />
                    <AvatarFallback className="bg-faith-blue text-white">
                      {post.author.name[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {post.author.name}
                      </h4>
                      <Badge variant="secondary" className="flex items-center space-x-1">
                        {getPostIcon(post.type)}
                        <span className="text-xs">{getPostTypeLabel(post.type)}</span>
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                      <span>{formatDistanceToNow(new Date(post.createdAt))} ago</span>
                      {post.church && (
                        <>
                          <span>•</span>
                          <div className="flex items-center space-x-1">
                            <Church className="w-3 h-3" />
                            <span>{post.church.name}</span>
                          </div>
                        </>
                      )}
                      {post.location && (
                        <>
                          <span>•</span>
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-3 h-3" />
                            <span>{post.location}</span>
                          </div>
                        </>
                      )}
                    </div>
                    {post.mood && (
                      <div className="flex items-center space-x-1 mt-1">
                        <span className="text-lg">{getMoodEmoji(post.mood)}</span>
                        <span className="text-sm text-[#5A2671] font-medium">
                          {post.author.name} is {getMoodDisplayName(post.mood)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              {post.title && (
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {post.title}
                </h3>
              )}
              <p className="text-gray-700 dark:text-gray-300 mb-4 whitespace-pre-wrap">
                {post.content}
              </p>
              
              {post.eventDate && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mb-4">
                  <div className="flex items-center space-x-2 text-blue-700 dark:text-blue-300">
                    <Clock className="w-4 h-4" />
                    <span className="font-medium">
                      {new Date(post.eventDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              )}

              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                <div className="flex space-x-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleLikePost(post);
                    }}
                    className={`${post.isLiked ? 'text-red-600 hover:text-red-700' : 'text-gray-500 hover:text-red-600'} transition-colors`}
                  >
                    <Heart className={`w-4 h-4 mr-2 ${post.isLiked ? 'fill-current' : ''}`} />
                    <span>{post.likeCount}</span>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleCommentPost(post);
                    }}
                    className="text-gray-500 hover:text-blue-600 transition-colors"
                    title={post.type === 'prayer' ? "Add prayer support" : "Add a comment"}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    <span>{post.commentCount}</span>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleSharePost(post);
                    }}
                    className="text-gray-500 hover:text-green-600 transition-colors"
                  >
                    <RotateCw className="w-4 h-4 mr-2" />
                    <span>{post.shareCount}</span>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => bookmarkPostMutation.mutate({ 
                      postId: post.id, 
                      postType: post.type, 
                      isBookmarked: post.isBookmarked || false 
                    })}
                    className={`${post.isBookmarked ? 'text-yellow-600 hover:text-yellow-700' : 'text-gray-500 hover:text-yellow-600'} transition-colors`}
                    disabled={bookmarkPostMutation.isPending}
                  >
                    {post.isBookmarked ? 
                      <BookmarkCheck className="w-4 h-4" /> : 
                      <Bookmark className="w-4 h-4" />
                    }
                  </Button>
                </div>
              </div>

              {/* AI Bible Verse Suggestions */}
              {post.suggestedVerses && post.suggestedVerses.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex items-center mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-[#5A2671] dark:text-purple-400">
                        ✨ AI Spiritual Guidance
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Based on your mood
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {(expandedVerses.has(post.id) ? post.suggestedVerses : post.suggestedVerses.slice(0, 2)).map((verse: any, index: number) => (
                      <div key={index} className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-3 border border-purple-100 dark:border-purple-700">
                        <div className="flex items-start space-x-2">
                          <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                            {verse.reference}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 italic">
                          "{verse.text}"
                        </p>
                        {verse.category && (
                          <span className="inline-block mt-2 px-2 py-1 text-xs bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-300 rounded-full">
                            {verse.category}
                          </span>
                        )}
                      </div>
                    ))}
                    {post.suggestedVerses.length > 2 && (
                      <button
                        onClick={() => toggleVerseExpansion(post.id)}
                        className="w-full text-xs text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 text-center py-2 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                      >
                        {expandedVerses.has(post.id) 
                          ? `Show less verses` 
                          : `+${post.suggestedVerses.length - 2} more verses suggested`
                        }
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Comments Section */}
              {post.comments && post.comments.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <div className="space-y-3">
                    {post.comments.slice(0, 3).map((comment: any) => (
                      <div key={comment.id} className="flex space-x-3">
                        <Avatar className="h-6 w-6 flex-shrink-0">
                          <AvatarImage src={comment.author?.profileImage} />
                          <AvatarFallback className="bg-[#5A2671] text-white text-xs">
                            {comment.author?.name?.charAt(0) || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {comment.author?.name || 'Anonymous'}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {formatDistanceToNow(new Date(comment.createdAt))} ago
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              {comment.content}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {post.comments.length > 3 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleCommentPost(post);
                        }}
                        className="text-[#5A2671] hover:text-[#4A1F5C] text-sm"
                      >
                        View all {post.commentCount} comments
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )) : (
          <div className="text-center py-12">
            <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No posts yet. Be the first to share something!</p>
          </div>
        )}
      </div>

      {/* Load More Button */}
      <div className="text-center py-8">
        <Button variant="outline" className="bg-white dark:bg-gray-800">
          <PlusCircle className="w-4 h-4 mr-2" />
          Load More Posts
        </Button>
      </div>

      {/* Comment Modal */}
      <Dialog open={commentModalOpen} onOpenChange={setCommentModalOpen}>
        <DialogContent className="sm:max-w-[525px] bg-white dark:bg-gray-900">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#5A2671]">
              {activePost?.type === 'prayer' ? (
                <>
                  <MessageCircle className="w-5 h-5" />
                  Share Prayer Support
                </>
              ) : (
                <>
                  <MessageCircle className="w-5 h-5" />
                  Add Comment
                </>
              )}
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              {activePost?.type === 'prayer' 
                ? "Share words of encouragement, prayer, or support with this community member."
                : "Join the conversation and share your thoughts with the community."
              }
            </DialogDescription>
          </DialogHeader>

          {/* Post Preview */}
          {activePost && (
            <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800 mb-4">
              <div className="flex items-center gap-3 mb-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={activePost.author.profileImage} />
                  <AvatarFallback className="bg-[#5A2671] text-white text-xs">
                    {activePost.author.name?.charAt(0) || '?'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm">{activePost.author.name}</p>
                  <Badge variant={activePost.type === 'prayer' ? 'secondary' : 'default'} className="text-xs">
                    {activePost.type === 'prayer' ? 'Prayer Request' : 
                     activePost.type === 'discussion' ? 'Discussion' : 'Post'}
                  </Badge>
                </div>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                {activePost.title || activePost.content}
              </p>
            </div>
          )}

          {/* Quick Responses for Prayers */}
          {activePost?.type === 'prayer' && (
            <div className="mb-4">
              <p className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Quick responses:</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  "🙏 Praying for you",
                  "Amen!",
                  "God bless you",
                  "Lifting you up in prayer",
                  "You're in my prayers",
                  "Hallelujah!"
                ].map((response) => (
                  <Button
                    key={response}
                    variant="outline"
                    size="sm"
                    className="justify-start text-xs h-8 hover:bg-[#5A2671] hover:text-white transition-colors"
                    onClick={() => handleQuickResponse(response)}
                  >
                    {response}
                  </Button>
                ))}
              </div>
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Or write your own message below:
              </div>
            </div>
          )}

          {/* Comment Input */}
          <div className="space-y-4">
            <Textarea
              placeholder={
                activePost?.type === 'prayer' 
                  ? "Share words of encouragement or let them know you're praying..."
                  : "What are your thoughts on this?"
              }
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="min-h-[100px] resize-none border-gray-300 dark:border-gray-600 focus:border-[#5A2671] focus:ring-[#5A2671]"
            />
            
            <div className="flex justify-between items-center">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {commentText.length}/500 characters
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setCommentModalOpen(false)}
                  className="px-4"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={submitComment}
                  disabled={!commentText.trim() || commentMutation.isPending}
                  className="bg-[#5A2671] hover:bg-[#4A1E61] text-white px-6"
                >
                  {commentMutation.isPending ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Posting...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Send className="w-4 h-4" />
                      {activePost?.type === 'prayer' ? 'Send Support' : 'Post Comment'}
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}