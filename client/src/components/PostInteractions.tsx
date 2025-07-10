import React, { useState } from 'react';
import { Heart, MessageCircle, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { CommentDialog } from './CommentDialog';
import { ShareDialog } from './ShareDialog';

interface PostInteractionsProps {
  postId: number;
  postType: 'discussion' | 'soap' | 'community';
  isLiked: boolean;
  likeCount: number;
  isPraying: boolean;
  prayCount: number;
  commentCount: number;
  shareCount?: number;
  post?: any; // Full post object for sharing
}

export function PostInteractions({
  postId,
  postType,
  isLiked,
  likeCount,
  isPraying,
  prayCount,
  commentCount,
  shareCount = 0,
  post
}: PostInteractionsProps) {
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Like/Love mutation
  const likeMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', `/api/discussions/${postId}/like`);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/feed'] });
      queryClient.invalidateQueries({ queryKey: ['/api/discussions'] });
      
      toast({
        title: data.liked ? "❤️ Loved!" : "Love removed",
        description: data.liked ? "You loved this post" : "You removed your love",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update like status",
        variant: "destructive"
      });
    }
  });

  // Prayer mutation
  const prayMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/discussions/reaction', { 
        discussionId: postId,
        emoji: '🙏',
        type: 'pray'
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/feed'] });
      queryClient.invalidateQueries({ queryKey: ['/api/discussions'] });
      
      const isPrayingNow = data?.data?.isPraying ?? !isPraying;
      toast({
        title: isPrayingNow ? "🙏 Praying!" : "Prayer removed",
        description: isPrayingNow ? "Added to your prayer list" : "Removed from prayer list",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update prayer status",
        variant: "destructive"
      });
    }
  });

  return (
    <>
      <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          {/* Love Button */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => likeMutation.mutate()}
            className={`group transition-all duration-200 ${
              isLiked 
                ? 'text-red-500 bg-red-50 dark:bg-red-900/20' 
                : 'text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
            }`}
            disabled={likeMutation.isPending}
            title={isLiked ? "You loved this" : "Love this post"}
          >
            <Heart className={`w-4 h-4 mr-1 transition-all duration-200 ${
              isLiked ? 'fill-current scale-110' : 'group-hover:scale-110'
            }`} />
            <span className="font-medium">{likeCount}</span>
          </Button>

          {/* Prayer Button */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => prayMutation.mutate()}
            className={`group transition-all duration-200 ${
              isPraying 
                ? 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                : 'text-gray-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20'
            }`}
            disabled={prayMutation.isPending}
            title={isPraying ? "You are praying" : "Pray for this"}
          >
            <span className={`text-sm mr-1 transition-all duration-200 ${
              isPraying ? 'scale-110' : 'group-hover:scale-110'
            }`}>🙏</span>
            <span className="font-medium">{prayCount}</span>
          </Button>

          {/* Comments Button */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setCommentDialogOpen(true)}
            className="text-gray-500 hover:text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 group transition-all duration-200"
            title="View and add comments"
          >
            <MessageCircle className="w-4 h-4 mr-1 group-hover:scale-110 transition-all duration-200" />
            <span className="font-medium">{commentCount}</span>
          </Button>

          {/* Share Button */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShareDialogOpen(true)}
            className="text-gray-500 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 group transition-all duration-200"
            title="Share this post"
          >
            <Share2 className="w-4 h-4 mr-1 group-hover:scale-110 transition-all duration-200" />
            {shareCount > 0 && <span className="font-medium">{shareCount}</span>}
          </Button>
        </div>
      </div>

      {/* Comment Dialog */}
      <CommentDialog 
        isOpen={commentDialogOpen}
        onClose={() => setCommentDialogOpen(false)}
        postId={postId}
        postType={postType}
      />

      {/* Share Dialog */}
      <ShareDialog 
        isOpen={shareDialogOpen}
        onClose={() => setShareDialogOpen(false)}
        post={post}
        postId={postId}
      />
    </>
  );
}