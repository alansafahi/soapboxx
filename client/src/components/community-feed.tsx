import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/use-toast";
import { isUnauthorizedError } from "../lib/authUtils";
import { apiRequest, queryClient } from "../lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Heart, MessageCircle, Share, Plus, Upload, Send, Flag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Discussion } from "../../../shared/schema";
import SmartScriptureTextarea from "./SmartScriptureTextarea";
import { FlagContentDialog } from "./content-moderation/FlagContentDialog";
import FormattedContent from "../utils/FormattedContent";

const discussionSchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title too long"),
  content: z.string().min(1, "Content is required"),
  category: z.string().optional(),
  churchId: z.number().optional(),
  isPublic: z.boolean().default(true),
  attachedMedia: z.array(z.object({
    type: z.enum(['image', 'video', 'audio']),
    url: z.string(),
    filename: z.string(),
    size: z.number().optional(),
  })).optional(),
});

type DiscussionFormData = z.infer<typeof discussionSchema>;

interface CommunityFeedProps {
  highlightId?: string | null;
}

export default function CommunityFeed({ highlightId }: CommunityFeedProps = {}) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [likedDiscussions, setLikedDiscussions] = useState<Set<number>>(new Set());
  const [animatingButtons, setAnimatingButtons] = useState<Set<number>>(new Set());
  const [commentDialogOpen, setCommentDialogOpen] = useState<number | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [viewCommentsDialogOpen, setViewCommentsDialogOpen] = useState<number | null>(null);

  const form = useForm<DiscussionFormData>({
    resolver: zodResolver(discussionSchema),
    defaultValues: {
      title: "",
      content: "",
      category: "general",
      churchId: undefined,
      isPublic: true,
      attachedMedia: [],
    },
  });

  // Fetch discussions
  const { data: discussions = [], isLoading } = useQuery<Discussion[]>({
    queryKey: ["/api/discussions", highlightId],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (highlightId) {
        queryParams.append('highlight', highlightId);
      }
      
      const url = `/api/discussions${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch discussions');
      return response.json();
    },
  });

  // Auto-scroll to highlighted discussion when highlightId changes
  useEffect(() => {
    if (highlightId && discussions && discussions.length > 0) {
      const timer = setTimeout(() => {
        const element = document.getElementById(`post-${highlightId}`);
        if (element) {
          element.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [highlightId, discussions]);

  // Fetch comments for viewing dialog
  const { data: commentsData } = useQuery({
    queryKey: [`/api/discussions/${viewCommentsDialogOpen}/comments`],
    enabled: !!viewCommentsDialogOpen,
  });
  
  const comments = Array.isArray(commentsData) ? commentsData : [];

  // Create discussion mutation
  const createDiscussionMutation = useMutation({
    mutationFn: async (data: DiscussionFormData) => {
      let attachedMedia: any[] = [];
      
      // Upload images if any are selected
      if (selectedImages.length > 0) {
        setUploadingImages(true);
        
        try {
          const uploadPromises = selectedImages.map(async (image) => {
            const formData = new FormData();
            formData.append('file', image);
            
            const response = await fetch('/api/upload/image', {
              method: 'POST',
              body: formData,
              credentials: 'include'
            });
            
            if (!response.ok) {
              throw new Error(`Failed to upload ${image.name}`);
            }
            
            return response.json();
          });
          
          attachedMedia = await Promise.all(uploadPromises);
        } finally {
          setUploadingImages(false);
        }
      }
      
      return await apiRequest('POST', '/api/discussions', {
        ...data,
        attachedMedia
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/discussions"] });
      setIsCreateDialogOpen(false);
      form.reset();
      setSelectedImages([]);
      toast({
        title: "Discussion created",
        description: "Your discussion has been posted",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create discussion",
        variant: "destructive",
      });
    },
  });

  // Like discussion mutation
  const likeDiscussionMutation = useMutation({
    mutationFn: async (discussionId: number) => {
      const response = await fetch(`/api/discussions/${discussionId}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
          "Referer": window.location.href,
        },
        credentials: "include"
      });
      
      if (!response.ok) {
        throw new Error(`Failed to like discussion: ${response.status}`);
      }
      
      return await response.json();
    },
    onSuccess: () => {
      // Don't invalidate immediately to preserve optimistic updates
      // The frontend state already reflects the correct like status
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to like discussion",
        variant: "destructive",
      });
    },
  });

  // Create comment mutation
  const createCommentMutation = useMutation({
    mutationFn: async ({ discussionId, content }: { discussionId: number; content: string }) => {
      const response = await fetch(`/api/discussions/${discussionId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
          "Referer": window.location.href,
        },
        credentials: "include",
        body: JSON.stringify({ content })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to add comment: ${response.status}`);
      }
      
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/discussions"] });
      queryClient.invalidateQueries({ queryKey: [`/api/discussions/${viewCommentsDialogOpen}/comments`] });
      setCommentText("");
      setCommentDialogOpen(null);
      setViewCommentsDialogOpen(null);
      toast({
        title: "Comment added",
        description: "Your comment has been posted",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      });
    },
  });

  const handleCreateDiscussion = async (data: DiscussionFormData) => {
    let uploadedMedia: any[] = [];
    
    if (selectedImages.length > 0) {
      setUploadingImages(true);
      try {
        for (const file of selectedImages) {
          const formData = new FormData();
          formData.append('file', file);
          
          const response = await fetch('/api/upload/image', {
            method: 'POST',
            body: formData,
            credentials: 'include'
          });
          
          if (response.ok) {
            const result = await response.json();
            uploadedMedia.push({
              type: 'image',
              url: result.url,
              filename: file.name,
              size: file.size
            });
          }
        }
      } catch (error) {
        toast({
          title: "Upload failed",
          description: "Failed to upload images. Please try again.",
          variant: "destructive",
        });
        setUploadingImages(false);
        return;
      }
      setUploadingImages(false);
    }
    
    createDiscussionMutation.mutate({
      ...data,
      attachedMedia: uploadedMedia
    });
  };

  const handleLikeDiscussion = (discussionId: number) => {
    // Add animation state
    setAnimatingButtons(prev => new Set([...Array.from(prev), discussionId]));
    
    // Toggle like state optimistically
    const isCurrentlyLiked = likedDiscussions.has(discussionId);
    setLikedDiscussions(prev => {
      const newSet = new Set(prev);
      if (isCurrentlyLiked) {
        newSet.delete(discussionId);
      } else {
        newSet.add(discussionId);
      }
      return newSet;
    });

    // Remove animation state after animation completes
    setTimeout(() => {
      setAnimatingButtons(prev => {
        const newSet = new Set(prev);
        newSet.delete(discussionId);
        return newSet;
      });
    }, 300);

    likeDiscussionMutation.mutate(discussionId);
  };

  const handleCommentClick = (discussionId: number) => {
    console.log('Comment clicked for discussion:', discussionId);
    setCommentDialogOpen(discussionId);
  };

  const handleShareDiscussion = (discussionId: number) => {
    console.log('Share clicked for discussion:', discussionId);
    const discussion = discussions.find(d => d.id === discussionId);
    if (!discussion) {
      console.log('Discussion not found');
      return;
    }

    // Try to share via API first (creates shared post)
    shareDiscussionMutation.mutate(discussionId);
  };

  // Share discussion mutation
  const shareDiscussionMutation = useMutation({
    mutationFn: async (discussionId: number) => {

      const response = await fetch(`/api/discussions/${discussionId}/share`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
          "Referer": window.location.href,
        },
        credentials: "include"
      });
      
      if (!response.ok) {
        throw new Error(`Failed to share discussion: ${response.status}`);
      }
      
      return await response.json();
    },
    onSuccess: (data) => {

      queryClient.invalidateQueries({ queryKey: ["/api/discussions"] });
      toast({
        title: "Discussion shared",
        description: "Shared to community feed",
      });
    },
    onError: (error) => {
      // Share API error handled
      // Fallback to clipboard sharing
      const discussion = discussions.find(d => d.id === discussionId);
      if (discussion) {
        const shareUrl = `${window.location.origin}/discussions/${discussionId}`;
        const shareText = `Check out this discussion: "${discussion.title}"`;
        
        if (navigator.clipboard) {
          navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
          toast({
            title: "Link copied",
            description: "Discussion link copied to clipboard",
          });
        } else {
          toast({
            title: "Share failed",
            description: "Unable to share discussion",
            variant: "destructive",
          });
        }
      }
    },
  });

  const handleReaction = async (discussionId: number, emoji: string) => {

    
    try {
      const response = await fetch('/api/community/reactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'Referer': window.location.href,
        },
        credentials: 'include',
        body: JSON.stringify({
          targetType: 'discussion',
          targetId: discussionId,
          reactionType: emoji,
          emoji: emoji,
          intensity: 1
        })
      });


      
      if (response.ok) {
        const result = await response.json();

        
        // Refresh discussions to show new reaction
        queryClient.invalidateQueries({ queryKey: ['/api/discussions'] });
        
        toast({
          title: "Reaction added!",
          description: "Your reaction was shared",
        });
      } else {
        const errorText = await response.text();
        // Reaction failed - error handled
        throw new Error(`Failed to add reaction: ${response.status}`);
      }
    } catch (error) {
      // Reaction error handled
      toast({
        title: "Error",
        description: "Failed to add reaction. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diffInHours = Math.floor((now.getTime() - past.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-16 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="dark:bg-gray-800 dark:border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="dark:text-white dark:font-bold">Community Discussions</CardTitle>
          <Button variant="ghost" size="sm">
            View All
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {discussions.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white dark:font-bold mb-2">No discussions yet</h3>
            <p className="text-gray-600 dark:text-gray-300 dark:font-medium mb-4">Be the first to start a conversation in your community!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {discussions.map((discussion) => (
              <div 
                key={discussion.id} 
                id={`post-${discussion.id}`}
                className={`py-6 first:pt-0 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer rounded-lg px-4 -mx-4 ${
                  highlightId && discussion.id.toString() === highlightId 
                    ? 'ring-2 ring-red-500 bg-red-50 dark:bg-red-900/10' 
                    : ''
                }`}
              >
                <div className="flex items-start space-x-4">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback>
                      {discussion.authorId[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-gray-900 dark:text-white dark:font-bold">Community Member</span>
                      <span className="text-gray-400 dark:text-gray-300 dark:font-medium text-sm">
                        {formatTimeAgo(discussion.createdAt?.toString() || new Date().toISOString())}
                      </span>
                    </div>
                    <h3 className="font-medium text-gray-900 dark:text-white dark:font-bold mb-2">{discussion.title}</h3>
                    <div className="text-gray-600 dark:text-gray-100 dark:font-semibold text-sm mb-3">
                      <FormattedContent 
                        content={discussion.content} 
                        attachedMedia={discussion.attachedMedia}
                      />
                    </div>
                    <div className="flex items-center space-x-4">
                      {/* Reaction Emojis */}
                      <div className="flex items-center space-x-1">
                        {['🙏', '✝️', '🕊️', '❤️'].map((emoji) => (
                          <Button
                            key={emoji}
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();

                              handleReaction(discussion.id, emoji);
                            }}
                            className="p-1 h-auto text-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                          >
                            {emoji}
                          </Button>
                        ))}
                      </div>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLikeDiscussion(discussion.id)}
                          className={`transition-all duration-300 ${
                            likedDiscussions.has(discussion.id)
                              ? 'text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100'
                              : 'text-gray-500 hover:text-red-500 hover:bg-red-50'
                          }`}
                        >
                          <motion.div
                            animate={animatingButtons.has(discussion.id) ? {
                              scale: [1, 1.3, 1],
                              rotate: [0, 15, -15, 0]
                            } : {}}
                            transition={{ duration: 0.3 }}
                          >
                            <Heart 
                              className={`w-4 h-4 mr-1 transition-all duration-200 ${
                                likedDiscussions.has(discussion.id) ? 'fill-current' : ''
                              }`} 
                            />
                          </motion.div>
                          <motion.span
                            animate={animatingButtons.has(discussion.id) ? {
                              scale: [1, 1.1, 1]
                            } : {}}
                            transition={{ duration: 0.3 }}
                          >
                            {Number(discussion.likeCount || 0) + (likedDiscussions.has(discussion.id) ? 1 : 0)}
                          </motion.span>
                        </Button>
                      </motion.div>
                      
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      >
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();

                            handleCommentClick(discussion.id);
                          }}
                          className="text-gray-500 hover:text-blue-500 hover:bg-blue-50 transition-all duration-300"
                        >
                          <motion.div
                            whileHover={{ rotate: [0, -10, 10, 0] }}
                            transition={{ duration: 0.5 }}
                          >
                            <MessageCircle className="w-4 h-4 mr-1" />
                          </motion.div>
                          {discussion.commentCount || 0}
                        </Button>
                      </motion.div>
                      
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      >
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();

                            handleShareDiscussion(discussion.id);
                          }}
                          className="text-gray-500 hover:text-green-500 hover:bg-green-50 transition-all duration-300"
                        >
                          <motion.div
                            whileHover={{ 
                              rotate: [0, 15, -15, 0],
                              scale: [1, 1.1, 1]
                            }}
                            transition={{ duration: 0.4 }}
                          >
                            <Share className="w-4 h-4" />
                          </motion.div>
                        </Button>
                      </motion.div>
                      
                      {/* Flag Button - Only show for other users' posts */}
                      {user && (String(user.id) !== String(discussion.authorId) && user.email !== discussion.authorId) && (
                        <FlagContentDialog
                          contentType="discussion"
                          contentId={discussion.id}
                          trigger={
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-gray-400 hover:text-red-500 hover:bg-red-50"
                              title="Report this discussion"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                              }}
                            >
                              <Flag className="w-4 h-4" />
                            </Button>
                          }
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Comment Dialog */}
        <Dialog open={commentDialogOpen !== null} onOpenChange={() => setCommentDialogOpen(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Add Comment</DialogTitle>
              <DialogDescription>
                Share your thoughts on this discussion
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <SmartScriptureTextarea
                value={commentText}
                onChange={setCommentText}
                placeholder="Share your thoughts... (Type 'Matthew 5:16' for auto-population)"
                minHeight="min-h-[100px]"
                label="Discussion Comment"
                helpText="Include scripture references to automatically populate verse text"
              />
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setCommentText("");
                    setCommentDialogOpen(null);
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    if (commentDialogOpen && commentText.trim()) {
                      createCommentMutation.mutate({
                        discussionId: commentDialogOpen,
                        content: commentText.trim()
                      });
                    }
                  }}
                  disabled={!commentText.trim() || createCommentMutation.isPending}
                  className="bg-faith-blue hover:bg-blue-600"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {createCommentMutation.isPending ? "Posting..." : "Post Comment"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* View Comments Dialog */}
        <Dialog open={viewCommentsDialogOpen !== null} onOpenChange={() => setViewCommentsDialogOpen(null)}>
          <DialogContent className="sm:max-w-2xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>Discussion Comments</DialogTitle>
              <DialogDescription>
                Read what others have shared about this topic
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 max-h-[50vh] overflow-y-auto">
              {comments.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No comments yet. Be the first to share your thoughts!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {comments.map((comment: any) => (
                    <div key={comment.id} className="flex space-x-3 p-3 rounded-lg bg-gray-50">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          {comment.authorId[0]?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-sm">Community Member</span>
                          <span className="text-xs text-gray-500">
                            {formatTimeAgo(comment.createdAt?.toString() || new Date().toISOString())}
                          </span>
                        </div>
                        <p className="text-gray-700 text-sm">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Add Comment Form */}
            <div className="border-t pt-4">
              <div className="space-y-3">
                <Textarea 
                  placeholder="Add your comment..."
                  className="min-h-[80px]"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                />
                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setCommentText("");
                      setViewCommentsDialogOpen(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => {
                      if (viewCommentsDialogOpen && commentText.trim()) {
                        createCommentMutation.mutate({
                          discussionId: viewCommentsDialogOpen,
                          content: commentText.trim()
                        });
                      }
                    }}
                    disabled={!commentText.trim() || createCommentMutation.isPending}
                    className="bg-faith-blue hover:bg-blue-600"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {createCommentMutation.isPending ? "Posting..." : "Post Comment"}
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Upload Dialog */}
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Share Content</DialogTitle>
              <DialogDescription>
                Upload an image or start a discussion with the community
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 mb-2">Share photos, videos, or documents</p>
                <Button variant="outline">
                  Choose Files
                </Button>
              </div>
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setUploadDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    toast({
                      title: "Content Shared",
                      description: "Your content has been shared with the community.",
                    });
                    setUploadDialogOpen(false);
                  }}
                  className="bg-faith-blue hover:bg-blue-600"
                >
                  <Share className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        
        <div className="border-t border-gray-100 pt-6">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full bg-faith-blue hover:bg-blue-600 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Start a Discussion
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Discussion</DialogTitle>
                <DialogDescription>
                  Start a conversation with your community
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleCreateDiscussion)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="What would you like to discuss?" {...field} />
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
                        <FormLabel>Content</FormLabel>
                        <FormControl>
                          <SmartScriptureTextarea
                            value={field.value || ''}
                            onChange={field.onChange}
                            placeholder="Share your thoughts... (Type 'Romans 12:2' for auto-population)"
                            minHeight="min-h-[100px]"
                            label="Discussion Content"
                            helpText="Include scripture references to automatically populate verse text"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Image Upload Section */}
                  <div className="space-y-2">
                    <FormLabel>Attach Images</FormLabel>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          setSelectedImages(files);
                        }}
                        className="hidden"
                        id="image-upload"
                      />
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600 mb-2">
                          Click to attach images or drag and drop
                        </p>
                        <p className="text-xs text-gray-400">
                          PNG, JPG, GIF up to 10MB each
                        </p>
                      </label>
                    </div>
                    
                    {/* Preview selected images */}
                    {selectedImages.length > 0 && (
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {selectedImages.map((file, index) => (
                          <div key={index} className="relative">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-20 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedImages(files => files.filter((_, i) => i !== index));
                              }}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsCreateDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createDiscussionMutation.isPending || uploadingImages}
                      className="bg-faith-blue hover:bg-blue-600"
                    >
                      {uploadingImages ? "Uploading Images..." : createDiscussionMutation.isPending ? "Posting..." : "Post Discussion"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}
