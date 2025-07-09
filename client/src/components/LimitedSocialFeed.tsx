import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { MessageCircle, Heart, Share2, ChevronDown } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Post {
  id: number;
  content: string;
  authorId: string;
  createdAt: string;
  mood?: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
  };
  _count?: {
    comments: number;
    likes: number;
  };
}

interface LimitedSocialFeedProps {
  initialLimit?: number;
  className?: string;
}

export default function LimitedSocialFeed({ initialLimit = 4, className = "" }: LimitedSocialFeedProps) {
  const [showAll, setShowAll] = useState(false);

  const { data: posts = [], isLoading, error } = useQuery({
    queryKey: ["/api/discussions"],
    queryFn: async () => {
      const response = await fetch("/api/discussions", {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }
      return response.json();
    },
  });

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
        <p className="text-gray-500 dark:text-gray-400">Unable to load posts</p>
      </div>
    );
  }

  const displayedPosts = showAll ? posts : posts.slice(0, initialLimit);
  const hasMorePosts = posts.length > initialLimit;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Posts List */}
      {displayedPosts.map((post: Post) => (
        <Card key={post.id} className="bg-white dark:bg-gray-800 hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex space-x-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={post.author?.profileImageUrl || undefined} />
                <AvatarFallback className="bg-purple-100 text-purple-600">
                  {post.author?.firstName?.[0]}{post.author?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                    {post.author?.firstName} {post.author?.lastName}
                  </h3>
                  <span className="text-gray-500 dark:text-gray-400 text-sm">
                    {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                  </span>
                </div>
                
                <div className="text-gray-900 dark:text-gray-100 mb-3 whitespace-pre-wrap">
                  {post.content}
                </div>
                
                {post.mood && (
                  <div className="mb-3">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300">
                      Feeling: {post.mood}
                    </span>
                  </div>
                )}
                
                <div className="flex items-center space-x-4 text-gray-500 dark:text-gray-400">
                  <button className="flex items-center space-x-1 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                    <Heart className="w-4 h-4" />
                    <span className="text-sm">{post._count?.likes || 0}</span>
                  </button>
                  <button className="flex items-center space-x-1 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-sm">{post._count?.comments || 0}</span>
                  </button>
                  <button className="flex items-center space-x-1 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                    <Share2 className="w-4 h-4" />
                    <span className="text-sm">Share</span>
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      {/* Show More Button */}
      {hasMorePosts && !showAll && (
        <div className="text-center pt-4">
          <Button
            variant="outline"
            onClick={() => setShowAll(true)}
            className="flex items-center space-x-2"
          >
            <span>Show More Posts</span>
            <ChevronDown className="w-4 h-4" />
          </Button>
        </div>
      )}
      
      {/* Empty State */}
      {posts.length === 0 && (
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