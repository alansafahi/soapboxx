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
  Share2, 
  Clock, 
  MapPin, 
  Users,
  Church,
  BookOpen,
  PlusCircle,
  Bookmark,
  BookmarkCheck,
  Send,
  X
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface FeedPost {
  id: number;
  type: 'discussion' | 'prayer' | 'event' | 'inspiration' | 'announcement';
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
  createdAt: Date;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  isLiked: boolean;
  isBookmarked?: boolean;
  tags?: string[];
  eventDate?: Date;
  location?: string;
}

export default function SocialFeed() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  console.log('SocialFeed component loaded with comment and share handlers');
  const [newPost, setNewPost] = useState("");
  const [postType, setPostType] = useState<'discussion' | 'prayer' | 'announcement'>('discussion');
  
  // Comment modal state
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [activePost, setActivePost] = useState<FeedPost | null>(null);
  const [commentText, setCommentText] = useState("");

  // Fetch social feed data
  const { data: feedPosts = [], isLoading } = useQuery({
    queryKey: ['/api/feed'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Create new post mutation
  const createPostMutation = useMutation({
    mutationFn: async (postData: any) => {
      return await apiRequest('/api/feed/posts', {
        method: 'POST',
        body: postData
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/feed'] });
      setNewPost("");
      toast({
        title: "Post Created",
        description: "Your post has been shared with the community!",
      });
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
      console.log('Making like request to:', url);
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
      console.log('Making prayer like request to:', `/api/prayers/${prayerId}/like`);
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
      type: postType,
      content: newPost,
      title: postType === 'announcement' ? 'Community Announcement' : undefined,
    };
    
    createPostMutation.mutate(postData);
  };

  const handleLikePost = (post: FeedPost) => {
    console.log('handleLikePost called with:', { postId: post.id, postType: post.type });
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
    console.log('handleCommentPost called with:', { postId: post.id, postType: post.type });
    setActivePost(post);
    setCommentText("");
    setCommentModalOpen(true);
  };

  const submitComment = () => {
    if (!activePost || !commentText.trim()) return;
    
    console.log('Making comment request:', { postId: activePost.id, content: commentText.trim() });
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
    console.log('handleSharePost called with:', { postId: post.id, postType: post.type });
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
          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              <Button
                variant={postType === 'discussion' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPostType('discussion')}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Discussion
              </Button>
              <Button
                variant={postType === 'prayer' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPostType('prayer')}
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Prayer
              </Button>
              <Button
                variant={postType === 'announcement' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPostType('announcement')}
              >
                <Users className="w-4 h-4 mr-2" />
                Announcement
              </Button>
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
                    <Share2 className="w-4 h-4 mr-2" />
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