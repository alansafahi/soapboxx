import { useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/use-toast";
import { useLocation } from "wouter";
import SocialFeed from "../components/social-feed";

import MyPostsFeed from "../components/my-posts-feed";
import MobileNav from "../components/mobile-nav";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Users, User } from "lucide-react";

export default function SocialFeedPage() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [location] = useLocation();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
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
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto"></div>
          <p className="mt-4 text-gray-300">Loading social feed...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Social Feed</h1>
          <p className="text-gray-300">Connect with fellow believers and share your faith journey</p>
        </div>
        
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-white/10 backdrop-blur-sm">
            <TabsTrigger value="all" className="flex items-center space-x-2 text-white data-[state=active]:bg-white data-[state=active]:text-gray-900">
              <Users className="h-4 w-4" />
              <span>All Posts</span>
            </TabsTrigger>
            <TabsTrigger value="myposts" className="flex items-center space-x-2 text-white data-[state=active]:bg-white data-[state=active]:text-gray-900">
              <User className="h-4 w-4" />
              <span>My Posts</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            {/* Phase 3: Enhanced Social Feed with standardized field mapping */}
            <SocialFeed limit={50} showCreatePost={true} />
          </TabsContent>
          
          <TabsContent value="myposts">
            <MyPostsFeed />
          </TabsContent>
        </Tabs>
      </div>

      <MobileNav />
    </div>
  );
}