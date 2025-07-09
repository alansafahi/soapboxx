import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { MessageCircle, Heart, Share2, ChevronDown } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import SoapPostCard from "./SoapPostCard";
import FormattedContent from "../utils/FormattedContent";

// Utility function to strip HTML tags and limit text to specified lines
const stripHtmlAndLimitLines = (html: string, maxLines: number = 3): { text: string; isTruncated: boolean } => {
  // Remove HTML tags
  const strippedText = html.replace(/<[^>]*>/g, '').trim();
  
  // Split by lines and count
  const lines = strippedText.split('\n');
  const isTruncated = lines.length > maxLines;
  
  // Join back to maxLines
  const limitedText = lines.slice(0, maxLines).join('\n');
  
  return { text: limitedText, isTruncated };
};



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
      {displayedPosts.map((post: Post, index: number) => (
        <div key={post.id}>
          {/* Render SOAP posts with specialized component */}
          {post.type === 'soap_reflection' ? (
            <SoapPostCard post={post as any} />
          ) : (
            <Card className="bg-white dark:bg-gray-800 hover:shadow-md transition-all duration-200 border-0 shadow-sm">
              <CardContent className="p-6">
              <div className="flex space-x-3">
                <Avatar className="w-10 h-10 ring-2 ring-purple-100 dark:ring-purple-900">
                  <AvatarImage src={post.author?.profileImageUrl || undefined} />
                  <AvatarFallback className="bg-purple-100 text-purple-600 font-medium">
                    {post.author?.firstName?.[0]}{post.author?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                
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
                      {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  
                  <div className="mb-4">
                    <FormattedContent content={post.content} />
                  </div>
                  
                  {/* Reaction Bar with enhanced styling */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center space-x-6">
                      <button className="flex items-center space-x-2 group hover:bg-red-50 dark:hover:bg-red-900/20 px-2 py-1 rounded-md transition-colors">
                        <Heart className="w-4 h-4 text-gray-500 group-hover:text-red-500 transition-colors" />
                        <span className="text-sm font-medium text-gray-500 group-hover:text-red-500">
                          {post._count?.likes || 0}
                        </span>
                      </button>
                      
                      <button className="flex items-center space-x-2 group hover:bg-blue-50 dark:hover:bg-blue-900/20 px-2 py-1 rounded-md transition-colors">
                        <span className="text-sm">🙏</span>
                        <span className="text-sm font-medium text-gray-500 group-hover:text-blue-500">
                          Pray
                        </span>
                      </button>
                      
                      <button className="flex items-center space-x-2 group hover:bg-purple-50 dark:hover:bg-purple-900/20 px-2 py-1 rounded-md transition-colors">
                        <MessageCircle className="w-4 h-4 text-gray-500 group-hover:text-purple-500 transition-colors" />
                        <span className="text-sm font-medium text-gray-500 group-hover:text-purple-500">
                          {post._count?.comments || 0}
                        </span>
                      </button>
                    </div>
                    
                    <button className="flex items-center space-x-1 group hover:bg-gray-50 dark:hover:bg-gray-700 px-2 py-1 rounded-md transition-colors">
                      <Share2 className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
                    </button>
                  </div>
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