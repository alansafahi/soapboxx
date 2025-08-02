import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { MessageCircle, Heart, Share2, ChevronDown, Loader2, Trash2, Flag } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import SoapPostCard from "./SoapPostCard";
import FormattedContent from "../utils/FormattedContent";
import ProfileVerificationRing from "./ProfileVerificationRing";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Textarea } from "./ui/textarea";
import ShareDialog from "./ShareDialog";
import { FlagContentDialog } from './content-moderation/FlagContentDialog';
import { CommentDialog } from './CommentDialog';
import { ContentModerationStatus, HiddenContentPlaceholder } from './content-moderation/ContentModerationStatus';






interface Post {
  id: number;
  content: string;
  authorId: string;
  createdAt: string;
  mood?: string;
  type?: 'soap_reflection' | 'general';
  soapData?: {
    scripture: string;
    scriptureReference: string;
    observation: string;
    application: string;
    prayer: string;
  };
  author: {
    id: string;
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
    emailVerified?: boolean;
    phoneVerified?: boolean;
    role?: string;
  };
  likeCount: number;
  commentCount: number;
  isLiked?: boolean;
  attachedMedia?: Array<{
    type: string;
    url: string;
    filename: string;
    size?: number;
  }>;
}

interface LimitedSocialFeedProps {
  initialLimit?: number;
  className?: string;
}

export default function LimitedSocialFeed({ initialLimit = 5, className = "" }: LimitedSocialFeedProps) {
  const [page, setPage] = useState(1);
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showMoreClicks, setShowMoreClicks] = useState(0);
  const [postsViewed, setPostsViewed] = useState(0);
  const [showReflectionBreak, setShowReflectionBreak] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();



  // Comment dialog state
  const [commentDialogOpen, setCommentDialogOpen] = useState<number | null>(null);
  // Remove unused commentText state - now handled by shared CommentDialog
  const [expandedComments, setExpandedComments] = useState<Set<number>>(new Set());

  // Share dialog state
  const [shareDialogOpen, setShareDialogOpen] = useState<number | null>(null);

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<number | null>(null);
  const [postType, setPostType] = useState<string>('discussion');

  // Like mutation with dynamic endpoint based on post type
  const likeMutation = useMutation({
    mutationFn: async (postId: number) => {
      const postType = getPostType(postId);
      let endpoint: string;
      
      switch (postType) {
        case 'prayer':
          endpoint = `/api/prayers/${postId}/like`;
          break;
        case 'soap':
          endpoint = `/api/soap-entries/${postId}/like`;
          break;
        case 'discussion':
        case 'community':
        default:
          endpoint = `/api/discussions/${postId}/like`;
          break;
      }
      

      return apiRequest('POST', endpoint);
    },
    onSuccess: (data, postId) => {
      // Update the local state optimistically
      setAllPosts(prevPosts => 
        prevPosts.map(post => 
          post.id === postId 
            ? { 
                ...post, 
                isLiked: data.liked,
                likeCount: data.liked ? (post.likeCount || 0) + 1 : Math.max((post.likeCount || 0) - 1, 0)
              }
            : post
        )
      );
      
      const postType = getPostType(postId);
      const pointsEarned = postType === 'prayer' ? 10 : postType === 'soap' ? 15 : 5;
      const activityType = postType === 'prayer' ? 'prayer request' : 
                          postType === 'soap' ? 'SOAP reflection' : 'discussion';
      
      toast({
        title: data.liked ? "Post liked!" : "Like removed",
        description: data.liked ? 
          `You liked this ${activityType} and earned ${pointsEarned} SoapBox Points!` : 
          "Your like has been removed",
      });

      // Delay invalidation to preserve UI state
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["/api/discussions"] });
      }, 1000);
    },
    onError: (error: any) => {
      
      toast({
        title: "Failed to like post",
        description: `Error: ${error.message || 'Please try again'}`,
        variant: "destructive",
      });
    }
  });

  // Prayer reaction mutation
  const prayMutation = useMutation({
    mutationFn: async (postId: number) => {
      return apiRequest('POST', '/api/discussions/reaction', { 
        discussionId: postId, 
        emoji: '🙏',
        type: 'pray'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/discussions"] });
      toast({
        title: "Praying! 🙏",
        description: "Added to your prayer list",
      });
    },
    onError: () => {
      toast({
        title: "Failed to add prayer",
        variant: "destructive",
      });
    }
  });

  // Delete post mutation with improved error handling
  const deletePostMutation = useMutation({
    mutationFn: async ({ postId, postType }: { postId: number; postType: string }) => {
      try {
        let response;
        if (postType === 'soap_reflection') {
          response = await apiRequest('DELETE', `/api/soap-entries/${postId}`);
        } else {
          response = await apiRequest('DELETE', `/api/discussions/${postId}`);
        }
        return response;
      } catch (error) {
        throw error;
      }
    },
    onSuccess: () => {
      // Remove post from local state
      setAllPosts(prev => prev.filter(post => post.id !== postToDelete));
      // Invalidate queries to refresh feed
      queryClient.invalidateQueries({ queryKey: ["/api/discussions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/soap-entries"] });
      // Close dialog

      // Reset dialog state first to prevent UI issues
      setDeleteDialogOpen(false);
      setPostToDelete(null);
      setPostType('discussion');
      // Auto-refresh page after deletion
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      toast({
        title: "Success", 
        description: "Post deleted successfully! Refreshing page...",
      });
    },
    onError: (error: any) => {
      setDeleteDialogOpen(false);
      setPostToDelete(null);
      toast({
        title: "Error",
        description: `Failed to delete post: ${error.message || 'Please try again.'}`,
        variant: "destructive",
      });
    }
  });

  const handleDeletePost = (postId: number, postType: string = 'discussion') => {
    setPostToDelete(postId);
    setPostType(postType);
    setDeleteDialogOpen(true);
  };

  const confirmDeletePost = () => {
    if (postToDelete) {
      deletePostMutation.mutate({ postId: postToDelete, postType: postType });
    }
  };

  // Helper function to determine post type for CommentDialog
  const getPostType = (postId: number): 'discussion' | 'soap' | 'community' | 'prayer' => {
    // First check in posts array
    const currentPost = posts.find((post: any) => post.id === postId);
    
    if (!currentPost) {
      // If not found in current page, check allPosts
      const allPost = allPosts.find((post: any) => post.id === postId);
      if (allPost) {
        return getTypeFromPost(allPost);
      }
      
      // Default to discussion for posts not in current feed
      return 'discussion';
    }
    
    return getTypeFromPost(currentPost);
  };

  // Helper to determine type from post object
  const getTypeFromPost = (post: any): 'discussion' | 'soap' | 'community' | 'prayer' => {
    // Check for prayer request (enhanced detection)
    if (post?.type === 'prayer_request' || 
        post?.isPrayerRequest || 
        post?.isAnonymous !== undefined ||
        post?.isUrgent !== undefined ||
        (post?.category && post?.content && !post?.title)) {
      return 'prayer';
    }
    
    // Check for SOAP entry
    const isSOAPEntry = post?.type === 'soap' || 
                       post?.type === 'soap_reflection' || 
                       post?.postType === 'soap' ||
                       post?.soapEntry;
    if (isSOAPEntry) {
      return 'soap';
    }
    
    return 'discussion';
  };

  // Remove unused comments query - now handled by shared CommentDialog

  // Fetch posts from the discussions API endpoint
  const { data: posts = [], isLoading, error } = useQuery({
    queryKey: ["/api/discussions", page],
    queryFn: async () => {
      const response = await fetch(`/api/discussions?page=${page}&limit=10`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch posts: ${response.status}`);
      }

      return await response.json();
    },
  });

  // Comments are now only displayed in the dialog, removing bulk fetching for cleaner performance

  // Enhanced SOAP content detection for all posts (new and legacy)
  const detectSoapContent = (post: any) => {
    // Direct SOAP entries from the soapEntries table
    if (post.type === 'soap_reflection' && post.soapData) {
      return true;
    }

    // No legacy SOAP detection - we've cleaned up the old posts
    return false;
  };

  // Extract SOAP data from legacy posts with proper HTML parsing
  const extractLegacySoapData = (content: string) => {
    const soapData: any = {
      scripture: '',
      scriptureReference: '',
      observation: '',
      application: '',
      prayer: ''
    };

    // Look for scripture reference patterns - enhanced to capture more formats
    const referenceMatches = content.match(/([1-3]?\s*[A-Za-z]+\s+\d+:\d+(?:-\d+)?)/g);
    if (referenceMatches && referenceMatches.length > 0) {
      soapData.scriptureReference = referenceMatches[0];
    }

    // Parse HTML-formatted SOAP content (legacy format from database)
    const scriptureMatch = content.match(/<strong>Scripture<\/strong>:\s*([^📖🔍💡🙏]*?)(?=🔍|$)/i);
    if (scriptureMatch) {
      let scriptureText = scriptureMatch[1].trim();
      // Remove any remaining HTML tags and clean up
      scriptureText = scriptureText.replace(/<[^>]*>/g, '').trim();
      // Extract reference from first line if it exists
      const lines = scriptureText.split('\n');
      if (lines.length > 1) {
        const firstLine = lines[0].trim();
        const refMatch = firstLine.match(/([1-3]?\s*[A-Za-z]+\s+\d+:\d+(?:-\d+)?)/i);
        if (refMatch) {
          soapData.scriptureReference = refMatch[1];
          soapData.scripture = lines.slice(1).join('\n').trim();
        } else {
          soapData.scripture = scriptureText;
        }
      } else {
        soapData.scripture = scriptureText;
      }
    }

    const observationMatch = content.match(/<strong>Observation<\/strong>:\s*([^📖🔍💡🙏]*?)(?=💡|$)/i);
    if (observationMatch) {
      soapData.observation = observationMatch[1].replace(/<[^>]*>/g, '').trim();
    }

    const applicationMatch = content.match(/<strong>Application<\/strong>:\s*([^📖🔍💡🙏]*?)(?=🙏|$)/i);
    if (applicationMatch) {
      soapData.application = applicationMatch[1].replace(/<[^>]*>/g, '').trim();
    }

    const prayerMatch = content.match(/<strong>Prayer<\/strong>:\s*([^📖🔍💡🙏]*?)(?=$)/i);
    if (prayerMatch) {
      soapData.prayer = prayerMatch[1].replace(/<[^>]*>/g, '').trim();
    }

    // Fallback: if no HTML format detected, try basic colon format
    if (!scriptureMatch) {
      const sections = content.split(/(?=scripture:|observation:|application:|prayer:)/i);
      sections.forEach(section => {
        const lower = section.toLowerCase().trim();
        if (lower.startsWith('scripture:')) {
          const scriptureContent = section.substring(section.indexOf(':') + 1).trim();
          soapData.scripture = scriptureContent.replace(/<[^>]*>/g, '');
          if (!soapData.scriptureReference) {
            const refMatch = scriptureContent.match(/([1-3]?\s*[A-Za-z]+\s+\d+:\d+(?:-\d+)?)/);
            soapData.scriptureReference = refMatch ? refMatch[1] : 'Scripture Reference';
          }
        } else if (lower.startsWith('observation:')) {
          soapData.observation = section.substring(section.indexOf(':') + 1).replace(/<[^>]*>/g, '').trim();
        } else if (lower.startsWith('application:')) {
          soapData.application = section.substring(section.indexOf(':') + 1).replace(/<[^>]*>/g, '').trim();
        } else if (lower.startsWith('prayer:')) {
          soapData.prayer = section.substring(section.indexOf(':') + 1).replace(/<[^>]*>/g, '').trim();
        }
      });
    }

    // Set default reference if still empty
    if (!soapData.scriptureReference) {
      soapData.scriptureReference = 'Scripture Reflection';
    }

    return soapData;
  };



  // Load more posts function
  const loadMorePosts = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    try {
      const nextPage = page + 1;
      const response = await fetch(`/api/discussions?page=${nextPage}&limit=10`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch more posts");

      const newPosts = await response.json();


      if (newPosts.length === 0) {
        setHasMore(false);

      } else {
        setAllPosts(prev => {
          const updated = [...prev, ...newPosts];
          setPostsViewed(updated.length); // Track total posts viewed
          return updated;
        });
        setPage(nextPage);
        setHasMore(newPosts.length === 10); // Only continue if we got a full page
      }
    } catch (error) {
      // Error loading more posts
    } finally {
      setIsLoadingMore(false);
    }
  }, [page, isLoadingMore, hasMore]);

  // Initialize posts on first load
  useEffect(() => {
    if (posts.length > 0 && page === 1 && allPosts.length === 0) {
      setAllPosts(posts);
      setHasMore(posts.length === 10); // Assume more if we got a full page
    }
  }, [posts, page, allPosts.length]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    // Only set up observer when we have expanded posts
    if (allPosts.length === 0) return;

    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          loadMorePosts();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [loadMorePosts, hasMore, isLoadingMore, allPosts.length]);

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
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

  if (error) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-gray-700 dark:text-gray-400">Unable to load posts</p>
      </div>
    );
  }

  const displayedPosts = allPosts.length > 0 ? allPosts : posts;
  const showInitialLoadMore = posts.length >= 10 && hasMore;

  // Track posts viewed and show reflection break after 15 posts
  const totalPostsViewed = allPosts.length > 0 ? allPosts.length : Math.min(posts.length, initialLimit);
  const shouldShowReflectionBreak = totalPostsViewed >= 15 && !showReflectionBreak && hasMore;

  // Generate milestone messages
  const getMilestoneMessage = (count: number) => {
    if (count === 10) {
      return "You've seen 10 community reflections today 👏 Keep encouraging others!";
    } else if (count === 20) {
      return "Amazing! 20 posts of community wisdom 🌟 You're staying connected!";
    } else if (count === 30) {
      return "Incredible! 30+ community interactions 🙌 You're a true encourager!";
    }
    return null;
  };

  // Show mini reflection prompt every 10 posts (but not when showing reflection break)
  const shouldShowMiniReflection = totalPostsViewed > 0 && totalPostsViewed % 10 === 0 && totalPostsViewed >= 10 && !shouldShowReflectionBreak;



  return (
    <div className={`space-y-4 ${className}`}>
      {/* Posts List */}
      {displayedPosts.map((post: Post, index: number) => {
        // Check if this is a SOAP post (either new format or legacy)
        const isSoapPost = detectSoapContent(post);

        return (
          <div key={post.id}>
            {/* Render SOAP posts with specialized component */}
            {isSoapPost ? (
              <SoapPostCard 
                post={{
                  ...post,
                  type: 'soap_reflection',
                  soapData: post.soapData || extractLegacySoapData(post.content)
                } as any} 
              />
            ) : (
            <Card className="bg-white dark:bg-gray-800 hover:shadow-md transition-all duration-200 border-0 shadow-sm">
              <CardContent className="p-6">
              <div className="flex space-x-3">
                {/* Verification data processed */}
                <ProfileVerificationRing
                  emailVerified={post.author?.emailVerified === true}
                  phoneVerified={post.author?.phoneVerified === true}
                  isLeadership={post.author?.role === 'pastor' || post.author?.role === 'admin' || post.author?.role === 'owner' || post.author?.role === 'soapbox_owner'}
                  size="sm"
                >
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={post.author?.profileImageUrl || undefined} />
                    <AvatarFallback className="bg-purple-100 text-purple-600 font-medium">
                      {post.author?.firstName?.[0]}{post.author?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                </ProfileVerificationRing>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                        {post.author?.firstName} {post.author?.lastName}
                      </h3>
                      {post.mood && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-700">
                          {post.mood}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                      {formatDistanceToNow(new Date(post.createdAt)).replace('about ', '~').replace(' ago', '').replace(' hours', 'hrs').replace(' hour', 'hr').replace(' minutes', 'min').replace(' days', 'd').replace(' day', 'd')}
                    </span>
                  </div>

                  <div className="mb-4">
                    <FormattedContent 
                      content={post.content} 
                      attachedMedia={post.attachedMedia}
                    />
                  </div>

                  {/* Unified comment system - same as social-feed.tsx */}
                  <div className="flex items-center justify-between text-gray-700 dark:text-gray-300 pt-3 border-t">
                    <div className="flex items-center space-x-6">
                      <button 
                        onClick={() => likeMutation.mutate(post.id)}
                        className={`flex items-center space-x-2 transition-colors ${
                          post.isLiked ? 'text-red-500' : 'hover:text-red-500 text-gray-700 dark:text-gray-300'
                        }`}
                        disabled={likeMutation.isPending}
                      >
                        <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-current' : ''}`} />
                        <span className="text-sm">{post.likeCount || 0}</span>
                      </button>
                      <button 
                        onClick={() => setCommentDialogOpen(post.id)}
                        className="flex items-center space-x-2 hover:text-blue-500 transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span className="text-sm">{post.commentCount || 0}</span>
                      </button>
                      <button 
                        onClick={() => setShareDialogOpen(post.id)}
                        className="flex items-center space-x-2 hover:text-green-500 transition-colors"
                      >
                        <Share2 className="w-4 h-4" />
                        <span className="text-sm">Share</span>
                      </button>

                      {/* Flag Button - Only show for other users' posts */}
                      {user && post.author && (user.email !== post.author.email && String(user.id) !== String(post.authorId)) && (
                        <FlagContentDialog
                          contentType={post.type === 'soap_reflection' ? 'soap_entry' : 'discussion'}
                          contentId={post.id}
                          trigger={
                            <button 
                              className="flex items-center space-x-2 hover:text-red-500 transition-colors"
                              title="Report this content"
                            >
                              <Flag className="w-4 h-4" />
                              <span className="text-sm">Report</span>
                            </button>
                          }
                        />
                      )}

                      {/* Delete Button - Only show for post author */}
                      {user && post.author && (user.email === post.author.email || String(user.id) === String(post.authorId)) && (
                        <button 
                          onClick={() => handleDeletePost(post.id, post.type || 'discussion')}
                          className="flex items-center space-x-2 hover:text-red-500 transition-colors"
                          title={`Delete ${post.type === 'soap_reflection' ? 'S.O.A.P. entry' : 'post'}`}
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="text-sm">Delete</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Comments are now only shown in the dialog for cleaner UI */}
                </div>
              </div>
            </CardContent>
          </Card>
            )}

            {/* Soft divider between posts (except last) */}
            {index < displayedPosts.length - 1 && (
              <div className="flex justify-center my-4">
                <div className="w-12 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent"></div>
              </div>
            )}
          </div>
        );
      })}

      {/* Reflection Break after 15 posts */}
      {shouldShowReflectionBreak && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-blue-200 dark:border-blue-700">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-4">
              <span className="text-3xl mr-2">✝️</span>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                Time for Reflection
              </h3>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              You've spent some time in the community today. Take a moment to reflect or journal.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                onClick={() => window.location.href = '/soap'}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Go to Journal
              </Button>
              <Button 
                variant="outline"
                onClick={() => setShowReflectionBreak(true)}
                className="border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-600 dark:text-blue-300 dark:hover:bg-blue-900/20"
              >
                See More Posts Anyway
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mini Reflection Prompt every 10 posts */}
      {shouldShowMiniReflection && !shouldShowReflectionBreak && (
        <Card className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 border border-green-200 dark:border-green-700">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-3">
              <span className="text-2xl mr-2">🧘</span>
              <p className="text-gray-700 dark:text-gray-300 font-medium">
                What's one insight you'd apply from today's feed?
              </p>
            </div>
            <Button 
              onClick={() => window.location.href = '/soap'}
              variant="outline"
              size="sm"
              className="border-green-300 text-green-700 hover:bg-green-50 dark:border-green-600 dark:text-green-300 dark:hover:bg-green-900/20"
            >
              Write it in your Journal
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Milestone Messages */}
      {getMilestoneMessage(totalPostsViewed) && (
        <div className="text-center py-3">
          <p className="text-sm text-purple-600 dark:text-purple-400 font-medium bg-purple-50 dark:bg-purple-900/20 px-4 py-2 rounded-full inline-block">
            {getMilestoneMessage(totalPostsViewed)}
          </p>
        </div>
      )}

      {/* Shared Comment Dialog */}
      {commentDialogOpen !== null && (
        <CommentDialog
          isOpen={true}
          onClose={() => setCommentDialogOpen(null)}
          postId={commentDialogOpen}
          postType={getPostType(commentDialogOpen)}
        />
      )}

      {/* Share Dialog */}
      <ShareDialog 
        isOpen={shareDialogOpen !== null}
        onClose={() => setShareDialogOpen(null)}
        content={shareDialogOpen ? displayedPosts.find(p => p.id === shareDialogOpen)?.content || '' : ''}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete {postType === 'soap_reflection' ? 'S.O.A.P. Entry' : 'Post'}</DialogTitle>
          <DialogDescription>
            Delete this {postType === 'soap_reflection' ? 'S.O.A.P. entry' : 'post'}? This action cannot be undone.
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

      {/* Show More Button - Shows until infinite scroll is enabled */}
      {allPosts.length === 0 && posts.length > initialLimit && showMoreClicks === 0 && (
        <div className="text-center pt-4 bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <Button
            variant="outline"
            onClick={() => {
              const newClickCount = showMoreClicks + 1;
              setShowMoreClicks(newClickCount);
              setAllPosts(posts);
              setPostsViewed(posts.length); // Track posts viewed after "Show More"
              setHasMore(posts.length === 10); // Only continue if we got a full first page
              setPage(1); // Reset to page 1 since we're showing the first page posts

            }}
            className="flex items-center space-x-2 min-w-[160px]"
          >
            <span>Show More Posts</span>
            <ChevronDown className="w-4 h-4" />
          </Button>
          <p className="text-xs text-gray-500 mt-2">
            Showing {initialLimit} of {posts.length} posts
          </p>
        </div>
      )}

      {/* Show All Posts Button - After initial expansion */}
      {hasMore && allPosts.length > 0 && (
        <div className="text-center pt-4">
          <Button
            variant="outline"
            onClick={async () => {
              setIsLoadingMore(true);
              try {
                // Load all remaining posts at once
                const response = await fetch(`/api/discussions?page=1&limit=200`, {
                  credentials: "include",
                });
                if (!response.ok) throw new Error("Failed to fetch all posts");

                const allDbPosts = await response.json();
                setAllPosts(allDbPosts);
                setPostsViewed(allDbPosts.length); // Track all posts viewed
                setHasMore(false);

              } catch (error) {
                // Error loading all posts
              } finally {
                setIsLoadingMore(false);
              }
            }}
            disabled={isLoadingMore}
            className="flex items-center space-x-2 min-w-[160px]"
          >
            {isLoadingMore ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Loading All Posts...</span>
              </>
            ) : (
              <>
                <span>Show All Posts</span>
                <ChevronDown className="w-4 h-4" />
              </>
            )}
          </Button>
          <p className="text-xs text-gray-500 mt-2">
            Currently showing {allPosts.length} posts
          </p>
        </div>
      )}

      {/* End of feed indicator */}
      {!hasMore && allPosts.length > 0 && (
        <div className="text-center pt-4 pb-8">
          <p className="text-sm text-gray-400 dark:text-gray-500">
            You've seen all {allPosts.length} posts in the feed
          </p>
        </div>
      )}

      {/* Empty State */}
      {displayedPosts.length === 0 && !isLoading && (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400 mb-4">No posts yet</p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Be the first to share something with your community!
          </p>
        </div>
      )}
    </div>
  );
}