/**
 * Enhanced Social Feed Component with Standardized Field Mapping
 * 
 * This component demonstrates Phase 2 of the naming convention fix,
 * using the new field mapping utilities for consistent data handling.
 */

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Textarea } from "./ui/textarea";
import { useToast } from "../hooks/use-toast";
import { useAuth } from "../hooks/useAuth";
import { 
  Heart, 
  MessageCircle, 
  Clock, 
  Users,
  Send,
  Loader2,
  Share2,
  Trash2
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import FormattedContent from '../utils/FormattedContent';
import { CommentDialog } from './CommentDialog';
import { VerificationBadge } from './VerificationBadge';
import { ProfileVerificationBadge } from './ProfileVerificationBadge';
import { 
  apiRequestEnhanced, 
  mapDiscussion, 
  mapUser, 
  mapComment,
  validateMappedData 
} from "../lib/field-mapping-client";

interface EnhancedFeedPost {
  id: number;
  type: 'discussion' | 'soap' | 'prayer';
  title?: string;
  content: string;
  author: {
    id: string;
    name: string;
    firstName?: string;
    lastName?: string;
    profileImage?: string;
    emailVerified?: boolean;
    phoneVerified?: boolean;
    role?: string;
  };
  authorId: string;
  isPublic: boolean;
  likeCount: number;
  commentCount: number;
  attachedMedia?: string;
  tags?: string[];
  category?: string;
  createdAt: string;
  updatedAt?: string;
}

interface EnhancedSocialFeedProps {
  limit?: number;
  showCreatePost?: boolean;
}

export function EnhancedSocialFeed({ limit = 20, showCreatePost = true }: EnhancedSocialFeedProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostTitle, setNewPostTitle] = useState("");
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);

  // Enhanced feed query using new endpoint
  const { 
    data: feedPosts = [], 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['/api/discussions', limit],
    queryFn: async () => {
      const response = await apiRequestEnhanced('GET', `/api/discussions?limit=${limit}`);
      
      // Validate and map the response data
      const mappedPosts = response.map((post: any) => {
        const mapped = mapDiscussion(post);
        
        // Validate required fields
        if (!validateMappedData(mapped, ['id', 'content', 'author'])) {
          
          return null;
        }
        
        return mapped;
      }).filter(Boolean);
      
      return mappedPosts;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Enhanced post creation mutation
  const createPostMutation = useMutation({
    mutationFn: async (postData: { title?: string; content: string; isPublic?: boolean }) => {
      return await apiRequestEnhanced('POST', '/api/discussions', {
        title: postData.title || undefined,
        content: postData.content,
        isPublic: postData.isPublic ?? true,
        authorId: user?.email,
      });
    },
    onSuccess: (newPost) => {
      // Validate new post data
      const mappedPost = mapDiscussion(newPost);
      if (validateMappedData(mappedPost, ['id', 'content', 'author'])) {
        queryClient.invalidateQueries({ queryKey: ['/api/discussions'] });
        queryClient.invalidateQueries({ queryKey: ['/api/feed'] });
        
        toast({
          title: "Post created!",
          description: "Your post has been shared with the community",
        });
        
        // Reset form
        setNewPostContent("");
        setNewPostTitle("");
        setIsCreatePostOpen(false);
      } else {
        throw new Error('Invalid post data returned from server');
      }
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create post",
        description: error.message || "Please try again in a moment",
        variant: "destructive"
      });
    }
  });

  // Enhanced like mutation with field mapping
  const likeMutation = useMutation({
    mutationFn: async (postId: number) => {
      // Use enhanced endpoint if available, fall back to original
      try {
        return await apiRequestEnhanced('POST', `/api/discussions/${postId}/like`);
      } catch (error) {
        // Fallback to original endpoint
        return await fetch(`/api/discussions/${postId}/like`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          }
        }).then(res => res.json());
      }
    },
    onSuccess: () => {
      // Invalidate both enhanced and original queries
      queryClient.invalidateQueries({ queryKey: ['/api/discussions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/feed'] });
    }
  });

  // Enhanced delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (postId: number) => {
      try {
        return await apiRequestEnhanced('DELETE', `/api/discussions/${postId}`);
      } catch (error) {
        // Fallback to original endpoint
        return await fetch(`/api/discussions/${postId}`, {
          method: 'DELETE',
          credentials: 'include',
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
          }
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/discussions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/feed'] });
      toast({
        title: "Post deleted",
        description: "Your post has been removed",
      });
    }
  });

  const handleCreatePost = () => {
    if (!newPostContent.trim()) {
      toast({
        title: "Content required",
        description: "Please enter some content for your post",
        variant: "destructive"
      });
      return;
    }

    createPostMutation.mutate({
      title: newPostTitle.trim() || undefined,
      content: newPostContent.trim(),
      isPublic: true,
    });
  };

  const handleLike = (postId: number) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to like posts",
        variant: "destructive"
      });
      return;
    }
    
    likeMutation.mutate(postId);
  };

  const handleDelete = (postId: number) => {
    if (confirm('Are you sure you want to delete this post?')) {
      deleteMutation.mutate(postId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-red-600 dark:text-red-400">Error loading feed: {error.message}</p>
        <Button onClick={() => refetch()} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Create Post Section */}
      {showCreatePost && user && (
        <Card>
          <CardContent className="p-6">
            {!isCreatePostOpen ? (
              <Button 
                onClick={() => setIsCreatePostOpen(true)}
                variant="outline" 
                className="w-full justify-start text-muted-foreground"
              >
                <Send className="w-4 h-4 mr-2" />
                Share your thoughts with the community...
              </Button>
            ) : (
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Post title (optional)"
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                  className="w-full p-3 border rounded-lg bg-background"
                />
                <Textarea
                  placeholder="What's on your heart today?"
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  className="min-h-[100px] resize-none"
                />
                <div className="flex justify-between items-center">
                  <Badge variant="secondary" className="text-xs">
                    Enhanced Feed v2.0
                  </Badge>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setIsCreatePostOpen(false);
                        setNewPostContent("");
                        setNewPostTitle("");
                      }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleCreatePost}
                      disabled={createPostMutation.isPending || !newPostContent.trim()}
                    >
                      {createPostMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Send className="w-4 h-4 mr-2" />
                      )}
                      Share
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Feed Posts */}
      {feedPosts.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
            <p className="text-muted-foreground">
              Be the first to share something with your community!
            </p>
          </CardContent>
        </Card>
      ) : (
        feedPosts.map((post: EnhancedFeedPost) => (
          <Card key={post.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage 
                        src={post.author.profileImage} 
                        alt={post.author.name}
                      />
                      <AvatarFallback className="bg-primary/10">
                        {post.author.name?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <ProfileVerificationBadge 
                      emailVerified={post.author.emailVerified === true}
                      phoneVerified={post.author.phoneVerified === true}
                      isLeadership={post.author.role === 'pastor' || post.author.role === 'admin' || post.author.role === 'owner'}
                      size="sm"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                        {post.author.name}
                      </h4>
                      <VerificationBadge 
                        emailVerified={post.author.emailVerified === true}
                        phoneVerified={post.author.phoneVerified === true}
                        isLeadership={post.author.role === 'pastor' || post.author.role === 'admin' || post.author.role === 'owner'}
                        size="sm"
                      />
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                      {post.type === 'soap' && (
                        <Badge variant="secondary" className="text-xs">
                          S.O.A.P.
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Post Actions */}
                <div className="flex items-center gap-2">
                  {user?.email === post.authorId && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(post.id)}
                      disabled={deleteMutation.isPending}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              {/* Post Title */}
              {post.title && (
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  {post.title}
                </h3>
              )}
              
              {/* Post Content */}
              <div className="text-gray-700 dark:text-gray-300 mb-4">
                <FormattedContent content={post.content} />
              </div>
              
              {/* Attached Media */}
              {post.attachedMedia && (
                <div className="mb-4">
                  <img 
                    src={post.attachedMedia} 
                    alt="Post attachment"
                    className="rounded-lg max-w-full h-auto max-h-96 object-cover"
                  />
                </div>
              )}
              
              {/* Post Engagement */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLike(post.id)}
                    disabled={likeMutation.isPending}
                    className="flex items-center gap-2 text-muted-foreground hover:text-red-600"
                  >
                    <Heart className="h-4 w-4" />
                    <span>{post.likeCount || 0}</span>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedPostId(post.id)}
                    className="flex items-center gap-2 text-muted-foreground hover:text-blue-600"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>{post.commentCount || 0}</span>
                  </Button>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-green-600"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}

      {/* Comment Dialog */}
      {selectedPostId && (
        <CommentDialog
          isOpen={!!selectedPostId}
          onClose={() => setSelectedPostId(null)}
          postId={selectedPostId}
          postType="discussion"
        />
      )}
    </div>
  );
}

export default EnhancedSocialFeed;