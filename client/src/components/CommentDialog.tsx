import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Heart, MoreVertical, Reply } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface CommentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  postId: number;
  postType: 'discussion' | 'soap' | 'community';
}

interface Comment {
  id: number;
  content: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
  };
  createdAt: string;
  likeCount: number;
  isLiked: boolean;
}

export function CommentDialog({ isOpen, onClose, postId, postType }: CommentDialogProps) {
  const [commentText, setCommentText] = useState("");
  const [sortBy, setSortBy] = useState<'newest' | 'most_liked'>('newest');
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch comments
  const { data: comments = [], isLoading } = useQuery<Comment[]>({
    queryKey: ['/api/discussions', postId, 'comments'],
    queryFn: () => apiRequest('GET', `/api/discussions/${postId}/comments`),
    enabled: isOpen,
  });

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      return apiRequest('POST', `/api/discussions/${postId}/comments`, { content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/discussions', postId, 'comments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/feed'] });
      queryClient.invalidateQueries({ queryKey: ['/api/discussions'] });
      setCommentText("");
      toast({
        title: "Comment added!",
        description: "Your comment has been posted successfully",
      });
      // Close dialog after successful comment submission
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive"
      });
    }
  });

  // Like comment mutation
  const likeCommentMutation = useMutation({
    mutationFn: async (commentId: number) => {
      return apiRequest('POST', `/api/comments/${commentId}/like`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/discussions', postId, 'comments'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to like comment",
        variant: "destructive"
      });
    }
  });

  const handleSubmitComment = () => {
    if (commentText.trim()) {
      addCommentMutation.mutate(commentText.trim());
    }
  };

  // Sort comments
  const sortedComments = [...comments].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else {
      return b.likeCount - a.likeCount;
    }
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Comments</DialogTitle>
          <DialogDescription>
            Share your thoughts and engage with the community
          </DialogDescription>
        </DialogHeader>

        {/* Sort Options */}
        <div className="flex items-center justify-between pb-4 border-b">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Sort by:</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSortBy('newest')}
              className={`text-xs ${sortBy === 'newest' ? 'text-blue-600 font-medium bg-blue-50' : 'text-gray-500'}`}
            >
              Newest
            </Button>
            <span className="text-gray-300">|</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSortBy('most_liked')}
              className={`text-xs ${sortBy === 'most_liked' ? 'text-blue-600 font-medium bg-blue-50' : 'text-gray-500'}`}
            >
              Most liked
            </Button>
          </div>
          <span className="text-sm text-gray-500">{comments.length} comments</span>
        </div>

        {/* Comments List */}
        <ScrollArea className="flex-1 pr-4 min-h-[300px] max-h-[400px]">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">Loading comments...</p>
            </div>
          ) : sortedComments.length > 0 ? (
            <div className="space-y-4">
              {sortedComments.map((comment) => (
                <div key={comment.id} className="flex space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
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
                    
                    {/* Comment Actions */}
                    <div className="flex items-center space-x-4 mt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => likeCommentMutation.mutate(comment.id)}
                        className={`text-xs ${comment.isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
                      >
                        <Heart className={`w-3 h-3 mr-1 ${comment.isLiked ? 'fill-current' : ''}`} />
                        {comment.likeCount > 0 && comment.likeCount}
                      </Button>
                      <Button variant="ghost" size="sm" className="text-xs text-gray-400 hover:text-blue-500">
                        <Reply className="w-3 h-3 mr-1" />
                        Reply
                      </Button>
                    </div>
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

        {/* Add Comment Form */}
        <div className="border-t pt-4 mt-4">
          <div className="flex items-start space-x-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src={user?.profileImageUrl || ""} />
              <AvatarFallback className="bg-purple-600 text-white text-sm">
                {user?.firstName?.[0] || 'U'}{user?.lastName?.[0] || ''}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a thoughtful comment..."
                className="min-h-[80px] text-sm resize-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    handleSubmitComment();
                  }
                }}
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-gray-400">Press Cmd+Enter to post</span>
                <Button
                  onClick={handleSubmitComment}
                  disabled={addCommentMutation.isPending || !commentText.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {addCommentMutation.isPending ? "Posting..." : "Comment"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}