import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/use-toast";
import { useLocation } from "wouter";
import CommunityFeed from "../components/community-feed";
import EnhancedCommunityFeed from "../components/enhanced-community-feed";
import MobileNav from "../components/mobile-nav";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Button } from "../components/ui/button";
import { Sparkles, Users, MessageCircle, AlertTriangle } from "lucide-react";

export default function CommunityPage() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [location] = useLocation();
  
  // Extract highlight parameter from URL
  const urlParams = new URLSearchParams(window.location.search);
  const highlightId = urlParams.get('highlight');

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
      <div className="min-h-screen bg-gray-50 dark:bg-gradient-to-br dark:from-gray-900 dark:via-purple-900 dark:to-violet-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto"></div>
          <p className="mt-4 text-gray-300">Loading community...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Determine page title based on route
  const isDiscussionsPage = location === '/discussions';
  const pageTitle = isDiscussionsPage ? 'Discussions' : 'Community';
  const pageDescription = isDiscussionsPage 
    ? 'Join meaningful conversations with fellow believers' 
    : 'Connect with fellow believers and share your faith journey';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gradient-to-br dark:from-gray-900 dark:via-purple-900 dark:to-violet-900 pb-20 md:pb-0">
      {/* Enhanced Header */}
      <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-lg border-b border-gray-200 dark:border-purple-800">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:bg-gradient-to-r dark:from-purple-400 dark:to-blue-400 dark:bg-clip-text dark:text-transparent">
                {pageTitle}
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2 text-lg">
                {pageDescription}
              </p>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <Button variant="outline" size="sm" className="border-gray-300 hover:bg-gray-100 text-gray-700 hover:text-gray-900 dark:border-purple-600 dark:hover:bg-purple-800 dark:text-purple-300 dark:hover:text-white">
                <Users className="h-4 w-4 mr-2 text-purple-400" />
                Groups
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {highlightId && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span className="font-semibold text-red-800 dark:text-red-300">
                🔴 Viewing Flagged Content for Edit
              </span>
            </div>
            <p className="text-sm text-red-700 dark:text-red-400 mt-1">
              This post has been flagged for moderation. Please review and edit as requested.
            </p>
          </div>
        )}
        
        <Tabs defaultValue="enhanced" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="enhanced" className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4" />
              <span>Enhanced Feed</span>
            </TabsTrigger>
            <TabsTrigger value="classic" className="flex items-center space-x-2">
              <MessageCircle className="h-4 w-4" />
              <span>Classic View</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="enhanced">
            <EnhancedCommunityFeed highlightId={highlightId} />
          </TabsContent>
          
          <TabsContent value="classic">
            <CommunityFeed highlightId={highlightId} />
          </TabsContent>
        </Tabs>
      </div>

      <MobileNav />
    </div>
  );
}