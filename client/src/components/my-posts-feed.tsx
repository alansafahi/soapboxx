import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "../hooks/use-toast";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import FormattedContent from "../utils/FormattedContent";
import SoapPostCard from "./SoapPostCard";
import { 
  MessageSquare, 
  Heart, 
  Calendar, 
  Filter, 
  TrendingUp,
  BookOpen,
  Hand,
  Users,
  ChevronDown,
  BarChart3,
  Eye,
  Trash2
} from "lucide-react";
import { format } from "date-fns";

interface UserPost {
  id: number;
  type: 'discussion' | 'soap_reflection' | 'prayer_request';
  title: string;
  content: string;
  category?: string;
  createdAt: string;
  likeCount: number;
  commentCount: number;
  prayerCount?: number;
  isPublic: boolean;
  mood?: string;
  soapData?: {
    scripture: string;
    scriptureReference: string;
    observation: string;
    application: string;
    prayer: string;
  };
  attachedMedia?: string;
}

interface PostStats {
  totalPosts: number;
  totalLikes: number;
  totalComments: number;
  totalPrayers: number;
  discussionCount: number;
  soapCount: number;
  prayerRequestCount: number;
}

export default function MyPostsFeed() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'engagement'>('recent');
  const [filterType, setFilterType] = useState<'all' | 'discussion' | 'soap_reflection' | 'prayer_request'>('all');

  // Fetch user's posts
  const { data: posts = [], isLoading } = useQuery<UserPost[]>({
    queryKey: ['/api/users/my-posts', sortBy, filterType],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (sortBy !== 'recent') params.append('sort', sortBy);
      if (filterType !== 'all') params.append('type', filterType);
      
      const response = await fetch(`/api/users/my-posts?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch posts');
      return response.json();
    },
  });

  // Fetch user's post statistics
  const { data: stats } = useQuery<PostStats>({
    queryKey: ['/api/users/post-stats'],
    queryFn: async () => {
      const response = await fetch('/api/users/post-stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    },
  });

  const getPostIcon = (type: string) => {
    switch (type) {
      case 'soap_reflection':
        return <BookOpen className="h-4 w-4 text-blue-500" />;
      case 'prayer_request':
        return <Hand className="h-4 w-4 text-purple-500" />;
      default:
        return <MessageSquare className="h-4 w-4 text-green-500" />;
    }
  };

  const getPostTypeLabel = (type: string) => {
    switch (type) {
      case 'soap_reflection':
        return 'S.O.A.P. Reflection';
      case 'prayer_request':
        return 'Prayer Request';
      default:
        return 'Discussion';
    }
  };

  const getEngagementScore = (post: UserPost) => {
    return (post.likeCount || 0) + (post.commentCount || 0) + (post.prayerCount || 0);
  };

  // Delete mutation for posts
  const deleteMutation = useMutation({
    mutationFn: async (postId: number) => {
      const response = await fetch(`/api/discussions/${postId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete post');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users/my-posts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users/post-stats'] });
      toast({
        title: "Success",
        description: "Post deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDeletePost = (postId: number, postTitle: string) => {
    if (window.confirm(`Are you sure you want to delete "${postTitle}"? This action cannot be undone.`)) {
      deleteMutation.mutate(postId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {stats.totalPosts}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total Posts
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">
                {stats.totalLikes}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total Likes
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {stats.totalComments}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Comments
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {stats.totalPrayers}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Prayers
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Sorting */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-3">
          <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
            <SelectTrigger className="w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Posts</SelectItem>
              <SelectItem value="discussion">Discussions</SelectItem>
              <SelectItem value="soap_reflection">S.O.A.P. Reflections</SelectItem>
              <SelectItem value="prayer_request">Prayer Requests</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-40">
              <TrendingUp className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="popular">Most Liked</SelectItem>
              <SelectItem value="engagement">Most Engaged</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {posts.length} posts found
        </div>
      </div>

      {/* Posts List */}
      {posts.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400 mb-4">No posts yet</p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            {filterType === 'all' 
              ? "Be the first to share something with your community!"
              : `No ${getPostTypeLabel(filterType).toLowerCase()}s found.`
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    {getPostIcon(post.type)}
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">
                        {post.title}
                      </h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {getPostTypeLabel(post.type)}
                        </Badge>
                        {post.category && (
                          <Badge variant="secondary" className="text-xs">
                            {post.category}
                          </Badge>
                        )}
                        {!post.isPublic && (
                          <Badge variant="destructive" className="text-xs">
                            Private
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {format(new Date(post.createdAt), 'MMM d, yyyy')}
                      </div>
                      <div className="text-xs text-gray-400 dark:text-gray-500">
                        {format(new Date(post.createdAt), 'h:mm a')}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeletePost(post.id, post.title)}
                      disabled={deleteMutation.isPending}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      title="Delete post"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="mb-4">
                  {post.type === 'soap_reflection' && post.soapData ? (
                    <SoapPostCard 
                      post={{
                        id: post.id,
                        content: post.content,
                        authorId: user?.id || 'unknown',
                        author: {
                          id: user?.id || 'unknown',
                          firstName: user?.firstName || 'Your',
                          lastName: user?.lastName || 'Reflection',
                          profileImageUrl: user?.profileImageUrl
                        },
                        createdAt: post.createdAt,
                        type: 'soap_reflection',
                        soapData: post.soapData,
                        likeCount: post.likeCount,
                        commentCount: post.commentCount
                      }}
                    />
                  ) : (
                    <FormattedContent 
                      content={post.content} 
                      attachedMedia={post.attachedMedia} 
                      className="text-gray-700 dark:text-gray-300 line-clamp-2"
                    />
                  )}
                </div>
                
                {/* Engagement Stats */}
                <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Heart className="h-4 w-4" />
                    <span>{post.likeCount || 0}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MessageSquare className="h-4 w-4" />
                    <span>{post.commentCount || 0}</span>
                  </div>
                  {post.prayerCount !== undefined && (
                    <div className="flex items-center space-x-1">
                      <Hand className="h-4 w-4" />
                      <span>{post.prayerCount || 0}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-1 ml-auto">
                    <BarChart3 className="h-4 w-4" />
                    <span>Engagement: {getEngagementScore(post)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}