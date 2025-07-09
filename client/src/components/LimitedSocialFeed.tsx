import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { MessageCircle, Heart, Share2, ChevronDown, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import SoapPostCard from "./SoapPostCard";
import FormattedContent from "../utils/FormattedContent";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

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

export default function LimitedSocialFeed({ initialLimit = 5, className = "" }: LimitedSocialFeedProps) {
  const [page, setPage] = useState(1);
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showMoreClicks, setShowMoreClicks] = useState(0);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const { toast } = useToast();

  // Like mutation
  const likeMutation = useMutation({
    mutationFn: async (postId: number) => {
      return apiRequest('POST', '/api/discussions/like', { discussionId: postId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/discussions"] });
      toast({
        title: "Liked!",
        description: "Your reaction has been added",
      });
    },
    onError: () => {
      toast({
        title: "Failed to like post",
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

  // Fetch posts with pagination
  const { data: posts = [], isLoading, error } = useQuery({
    queryKey: ["/api/discussions", page],
    queryFn: async () => {
      const response = await fetch(`/api/discussions?page=${page}&limit=10`, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }
      return response.json();
    },
  });

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
      console.log(`Loaded page ${nextPage}:`, newPosts.length, 'posts');
      
      if (newPosts.length === 0) {
        setHasMore(false);
        console.log('No more posts available - reached end');
      } else {
        setAllPosts(prev => {
          const updated = [...prev, ...newPosts];
          console.log(`Total posts after page ${nextPage}:`, updated.length);
          return updated;
        });
        setPage(nextPage);
        setHasMore(newPosts.length === 10); // Only continue if we got a full page
      }
    } catch (error) {
      console.error("Error loading more posts:", error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [page, isLoadingMore, hasMore]);

  // Initialize posts on first load
  useEffect(() => {
    if (posts.length > 0 && page === 1) {
      setHasMore(posts.length === 10); // Assume more if we got a full page
    }
  }, [posts, page]);

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
        <p className="text-gray-500 dark:text-gray-400">Unable to load posts</p>
      </div>
    );
  }

  const displayedPosts = allPosts.length > 0 ? allPosts : posts.slice(0, initialLimit);
  const showInitialLoadMore = allPosts.length === 0 && posts.length > initialLimit && showMoreClicks < 2;
  


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
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          likeMutation.mutate(post.id);
                        }}
                        disabled={likeMutation.isPending}
                        className="flex items-center space-x-2 group hover:bg-red-50 dark:hover:bg-red-900/20 px-2 py-1 rounded-md transition-colors"
                      >
                        <Heart className="w-4 h-4 text-gray-500 group-hover:text-red-500 transition-colors" />
                        <span className="text-sm font-medium text-gray-500 group-hover:text-red-500">
                          {Number(post._count?.likes) || 0}
                        </span>
                      </button>
                      
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          prayMutation.mutate(post.id);
                        }}
                        disabled={prayMutation.isPending}
                        className="flex items-center space-x-2 group hover:bg-blue-50 dark:hover:bg-blue-900/20 px-2 py-1 rounded-md transition-colors"
                      >
                        <span className="text-sm">🙏</span>
                        <span className="text-sm font-medium text-gray-500 group-hover:text-blue-500">
                          Pray
                        </span>
                      </button>
                      
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toast({
                            title: "Comments",
                            description: "Comment functionality coming soon! We're building a beautiful commenting system.",
                          });
                        }}
                        className="flex items-center space-x-2 group hover:bg-purple-50 dark:hover:bg-purple-900/20 px-2 py-1 rounded-md transition-colors"
                      >
                        <MessageCircle className="w-4 h-4 text-gray-500 group-hover:text-purple-500 transition-colors" />
                        <span className="text-sm font-medium text-gray-500 group-hover:text-purple-500">
                          {Number(post._count?.comments) || 0}
                        </span>
                      </button>
                    </div>
                    
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toast({
                          title: "Share",
                          description: "Share functionality coming soon!",
                        });
                      }}
                      className="flex items-center space-x-1 group hover:bg-gray-50 dark:hover:bg-gray-700 px-2 py-1 rounded-md transition-colors"
                    >
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
        );
      })}
      
      {/* Show More Button - Shows until infinite scroll is enabled */}
      {allPosts.length === 0 && posts.length > initialLimit && showMoreClicks === 0 && (
        <div className="text-center pt-4 bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <Button
            variant="outline"
            onClick={() => {
              const newClickCount = showMoreClicks + 1;
              setShowMoreClicks(newClickCount);
              setAllPosts(posts);
              setHasMore(posts.length === 10); // Only continue if we got a full first page
              setPage(1); // Reset to page 1 since we're showing the first page posts
              console.log('Expanded to show all initial posts:', posts.length, 'hasMore:', posts.length === 10);
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
      {allPosts.length > 0 && allPosts.length < 82 && (
        <div className="text-center pt-4">
          <Button
            variant="outline"
            onClick={async () => {
              setIsLoadingMore(true);
              try {
                // Load all remaining posts at once
                const response = await fetch(`/api/discussions?page=1&limit=100`, {
                  credentials: "include",
                });
                if (!response.ok) throw new Error("Failed to fetch all posts");
                
                const allDbPosts = await response.json();
                setAllPosts(allDbPosts);
                setHasMore(false);
                console.log('Loaded all posts:', allDbPosts.length);
              } catch (error) {
                console.error("Error loading all posts:", error);
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
                <span>Show All Posts ({82 - allPosts.length} more)</span>
                <ChevronDown className="w-4 h-4" />
              </>
            )}
          </Button>
          <p className="text-xs text-gray-500 mt-2">
            Currently showing {allPosts.length} of 82 posts
          </p>
        </div>
      )}

      {/* End of feed indicator */}
      {allPosts.length >= 82 && (
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