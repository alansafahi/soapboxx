import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Heart, MoreVertical, Reply, Flag } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { FlagContentDialog } from './content-moderation/FlagContentDialog';

interface CommentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  postId: number;
  postType: 'discussion' | 'soap' | 'community' | 'prayer';
}

interface Comment {
  id: number;
  content: string;
  parentId?: number | null;
  author: {
    id: string;
    email?: string;
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
  };
  createdAt: string;
  likeCount: number;
  isLiked: boolean;
  replies?: Comment[];
}

export function CommentDialog({ isOpen, onClose, postId, postType }: CommentDialogProps) {
  const [commentText, setCommentText] = useState("");
  const [sortBy, setSortBy] = useState<'newest' | 'most_liked'>('newest');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get the correct API endpoint based on post type
  const getApiEndpoint = (type: string) => {
    switch (type) {
      case 'soap':
        return `/api/soap/${postId}/comments`;
      case 'prayer':
        return `/api/prayers/${postId}/comments`;
      case 'discussion':
        return `/api/discussions/${postId}/comments`;
      case 'community':
        return `/api/discussions/${postId}/comments`;
      default:
        return `/api/discussions/${postId}/comments`;
    }
  };

  const apiEndpoint = getApiEndpoint(postType);

  // Fetch comments
  const { data: comments = [], isLoading } = useQuery<Comment[]>({
    queryKey: [apiEndpoint],
    queryFn: async () => {
      try {
        const response = await fetch(apiEndpoint, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          },
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${await response.text()}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error('Error fetching comments:', error);
        throw error;
      }
    },
    enabled: isOpen,
  });

  // State to track liked comments locally
  const [likedComments, setLikedComments] = useState<Set<number>>(new Set());

  // Initialize liked comments state from fetched data
  useEffect(() => {
    if (comments && comments.length > 0 && isOpen) {
      const initialLikedComments = new Set<number>();
      comments.forEach((comment: any) => {
        if (comment.isLiked) {
          initialLikedComments.add(comment.id);
        }
      });
      setLikedComments(initialLikedComments);
    }
  }, [comments, isOpen]);

  // Add comment mutation (supports both regular comments and replies)
  const addCommentMutation = useMutation({
    mutationFn: async ({ content, parentId }: { content: string; parentId?: number }) => {
      try {
        const requestBody = parentId ? { content, parentId } : { content };
        const response = await fetch(apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'Referer': window.location.href,
          },
          credentials: 'include',
          body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorData}`);
        }

        return await response.json();
      } catch (error) {
        console.error('Comment submission error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [apiEndpoint] });
      queryClient.invalidateQueries({ queryKey: ['/api/feed'] });
      queryClient.invalidateQueries({ queryKey: ['/api/discussions'] });
      setCommentText("");
      setReplyText("");
      setReplyingTo(null);
      toast({
        title: "Comment added!",
        description: "Your comment has been posted successfully",
      });
    },
    onError: (error: any) => {
      console.error('Failed to add comment:', error);
      toast({
        title: "Unable to post comment",
        description: error.message || "Please try again in a moment",
        variant: "destructive"
      });
    }
  });

  // Like comment mutation - dynamic endpoint based on post type
  const likeCommentMutation = useMutation({
    mutationFn: async (commentId: number) => {
      let likeEndpoint: string;
      switch (postType) {
        case 'prayer':
          likeEndpoint = `/api/prayers/responses/${commentId}/like`;
          break;
        case 'soap':
          likeEndpoint = `/api/soap/comments/${commentId}/like`;
          break;
        case 'discussion':
        case 'community':
        default:
          likeEndpoint = `/api/comments/${commentId}/like`;
          break;
      }

      
      const response = await fetch(likeEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      return await response.json();
    },
    onSuccess: (result, commentId) => {
      // Update local state immediately for better UX
      setLikedComments(prev => {
        const newSet = new Set(prev);
        if (result.liked) {
          newSet.add(commentId);
        } else {
          newSet.delete(commentId);
        }
        return newSet;
      });
      
      // Immediately refresh to get updated counts
      queryClient.invalidateQueries({ queryKey: [apiEndpoint] });
      
      // Show different messages based on post type and points earned
      const pointsEarned = postType === 'prayer' ? 5 : 3;
      const activityType = postType === 'prayer' ? 'prayer comment' : 
                          postType === 'soap' ? 'SOAP comment' : 'discussion comment';
      
      toast({
        title: result.liked ? "Comment liked!" : "Comment unliked!",
        description: result.liked ? 
          `You liked this ${activityType} and earned ${pointsEarned} SoapBox Points!` : 
          `You unliked this ${activityType} and lost ${pointsEarned} SoapBox Points`,
      });
    },
    onError: (error: any) => {
      console.error('Like comment error:', error);
      toast({
        title: "Error",
        description: "Failed to like comment",
        variant: "destructive"
      });
    }
  });

  const handleSubmitComment = () => {
    if (!commentText.trim()) {
      toast({
        title: "Please enter a comment",
        description: "Comment cannot be empty",
        variant: "destructive"
      });
      return;
    }
    addCommentMutation.mutate({ content: commentText.trim() });
  };

  const handleSubmitReply = (parentId: number) => {
    if (!replyText.trim()) {
      toast({
        title: "Please enter a reply",
        description: "Reply cannot be empty",
        variant: "destructive"
      });
      return;
    }
    addCommentMutation.mutate({ content: replyText.trim(), parentId });
  };

  // Build threaded comments structure
  const buildThreadedComments = (comments: Comment[]): Comment[] => {
    const commentMap = new Map<number, Comment>();
    const rootComments: Comment[] = [];

    // First pass: create a map of all comments
    comments.forEach(comment => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });

    // Second pass: organize into threaded structure
    comments.forEach(comment => {
      const commentWithReplies = commentMap.get(comment.id)!;
      
      if (comment.parentId && commentMap.has(comment.parentId)) {
        // This is a reply, add it to its parent's replies
        const parentComment = commentMap.get(comment.parentId)!;
        parentComment.replies!.push(commentWithReplies);
      } else {
        // This is a top-level comment
        rootComments.push(commentWithReplies);
      }
    });

    return rootComments;
  };

  // Sort and thread comments
  const threadedComments = buildThreadedComments(comments || []).sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else {
      return (b.likeCount || 0) - (a.likeCount || 0);
    }
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-w-[95vw] max-h-[90vh] h-[90vh] flex flex-col p-4 m-2">
        <DialogHeader>
          <DialogTitle>Comments</DialogTitle>
          <DialogDescription>
            Share your thoughts and engage with the community
          </DialogDescription>
        </DialogHeader>

        {/* Sort Options - Mobile Responsive */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b space-y-2 sm:space-y-0">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Sort by:</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSortBy('newest')}
              className={`text-xs px-2 py-1 ${sortBy === 'newest' ? 'text-blue-600 font-medium bg-blue-50' : 'text-gray-500'}`}
            >
              Newest
            </Button>
            <span className="text-gray-300">|</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSortBy('most_liked')}
              className={`text-xs px-2 py-1 ${sortBy === 'most_liked' ? 'text-blue-600 font-medium bg-blue-50' : 'text-gray-500'}`}
            >
              Most liked
            </Button>
          </div>
          <span className="text-sm text-gray-500">{(comments || []).length} comments</span>
        </div>

        {/* Comments List */}
        <ScrollArea className="flex-1 pr-2 min-h-0">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">Loading comments...</p>
            </div>
          ) : (comments && comments.length > 0) ? (
            <div className="space-y-4">
              {threadedComments.map((comment) => (
                <div key={comment.id} className="flex space-x-2 sm:space-x-3 p-2 sm:p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={comment.author?.profileImageUrl || ""} />
                    <AvatarFallback className="bg-purple-600 text-white text-sm">
                      {comment.author?.firstName?.[0]}{comment.author?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium text-sm text-gray-900 dark:text-white">
                          {comment.author?.firstName || 'Unknown'} {comment.author?.lastName || ''}
                        </span>
                        <span className="text-xs text-gray-500 ml-2">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <MoreVertical className="w-3 h-3" />
                      </Button>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{comment.content}</p>
                    
                    {/* Comment Actions - Mobile Optimized */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center space-x-2 sm:space-x-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => likeCommentMutation.mutate(comment.id)}
                          className={`text-xs p-1 ${(comment.isLiked || likedComments.has(comment.id)) ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
                          disabled={likeCommentMutation.isPending}
                        >
                          <Heart className={`w-3 h-3 mr-1 ${(comment.isLiked || likedComments.has(comment.id)) ? 'fill-current' : ''}`} />
                          <span className="text-xs">{comment.likeCount || 0}</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-xs text-gray-400 hover:text-blue-500 p-1"
                          onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                        >
                          <Reply className="w-3 h-3 mr-1" />
                          <span className="hidden sm:inline">Reply</span>
                        </Button>
                      </div>
                      
                      {/* Flag Button - Only show for other users' comments */}
                      {user && comment.author && (String(user.id) !== String(comment.author.id) && user.email !== comment.author.email) && (
                        <FlagContentDialog
                          contentType="comment"
                          contentId={comment.id}
                          trigger={
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-xs text-gray-400 hover:text-red-500"
                              title="Report this comment"
                            >
                              <Flag className="w-3 h-3" />
                            </Button>
                          }
                        />
                      )}
                    </div>

                    {/* Reply Form */}
                    {replyingTo === comment.id && (
                      <div className="mt-3 pl-4 border-l-2 border-blue-200 dark:border-blue-700">
                        <div className="flex items-start space-x-2">
                          <Avatar className="w-6 h-6 flex-shrink-0">
                            <AvatarImage src={user?.profileImageUrl || ""} />
                            <AvatarFallback className="bg-purple-600 text-white text-xs">
                              {user?.firstName?.[0] || 'U'}{user?.lastName?.[0] || ''}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <Textarea
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder={`Reply to ${comment.author?.firstName || 'this comment'}...`}
                              className="min-h-[60px] text-sm resize-none"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                                  handleSubmitReply(comment.id);
                                }
                              }}
                            />
                            <div className="flex justify-between items-center mt-2">
                              <span className="text-xs text-gray-400">Press Cmd+Enter to reply</span>
                              <div className="flex space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setReplyingTo(null);
                                    setReplyText("");
                                  }}
                                  className="text-xs h-7"
                                >
                                  Cancel
                                </Button>
                                <Button
                                  onClick={() => handleSubmitReply(comment.id)}
                                  disabled={addCommentMutation.isPending || !replyText.trim()}
                                  size="sm"
                                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-7"
                                >
                                  {addCommentMutation.isPending ? "Replying..." : "Reply"}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Nested Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="mt-3 ml-8 space-y-3 border-l-2 border-gray-200 dark:border-gray-700 pl-4">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="flex space-x-2 p-2 rounded-lg bg-gray-25 dark:bg-gray-850">
                            <Avatar className="w-6 h-6">
                              <AvatarImage src={reply.author?.profileImageUrl || ""} />
                              <AvatarFallback className="bg-purple-600 text-white text-xs">
                                {reply.author?.firstName?.[0]}{reply.author?.lastName?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <div>
                                  <span className="font-medium text-xs text-gray-900 dark:text-white">
                                    {reply.author?.firstName || 'Unknown'} {reply.author?.lastName || ''}
                                  </span>
                                  <span className="text-xs text-gray-500 ml-2">
                                    {new Date(reply.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                              <p className="text-xs text-gray-700 dark:text-gray-300 mt-1">{reply.content}</p>
                              
                              {/* Reply Actions */}
                              <div className="flex items-center space-x-2 mt-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => likeCommentMutation.mutate(reply.id)}
                                  className={`text-xs p-1 ${(reply.isLiked || likedComments.has(reply.id)) ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
                                  disabled={likeCommentMutation.isPending}
                                >
                                  <Heart className={`w-3 h-3 mr-1 ${(reply.isLiked || likedComments.has(reply.id)) ? 'fill-current' : ''}`} />
                                  <span className="text-xs">{reply.likeCount || 0}</span>
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">No comments yet.</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">Be the first to share your thoughts!</p>
            </div>
          )}
        </ScrollArea>

        {/* Add Comment Form - Mobile Optimized */}
        <div className="border-t pt-4 mt-4 flex-shrink-0">
          <div className="flex items-start space-x-2 sm:space-x-3">
            <Avatar className="w-8 h-8 flex-shrink-0">
              <AvatarImage src={user?.profileImageUrl || ""} />
              <AvatarFallback className="bg-purple-600 text-white text-sm">
                {user?.firstName?.[0] || 'U'}{user?.lastName?.[0] || ''}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <Textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a thoughtful comment..."
                className="min-h-[60px] sm:min-h-[80px] text-sm resize-none w-full"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    handleSubmitComment();
                  }
                }}
              />
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-3 space-y-2 sm:space-y-0">
                <span className="text-xs text-gray-400 order-2 sm:order-1">Press Cmd+Enter to post</span>
                <div className="flex space-x-2 order-1 sm:order-2">
                  <Button
                    variant="outline"
                    onClick={onClose}
                    disabled={addCommentMutation.isPending}
                    className="flex-1 sm:flex-none h-9"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmitComment}
                    disabled={addCommentMutation.isPending || !commentText.trim()}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium flex-1 sm:flex-none h-9"
                  >
                    {addCommentMutation.isPending ? "Posting..." : "Post"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}