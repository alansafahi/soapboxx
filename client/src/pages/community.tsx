import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/use-toast";
import { useLocation } from "wouter";
import { useLanguage } from "../contexts/LanguageContext";
import CommunityFeed from "../components/community-feed";
import EnhancedCommunityFeed from "../components/enhanced-community-feed";
import MobileNav from "../components/mobile-nav";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Button } from "../components/ui/button";
import { Sparkles, Users, MessageCircle } from "lucide-react";

export default function CommunityPage() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [location] = useLocation();
  const { t } = useLanguage();

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
  const pageTitle = isDiscussionsPage ? t('pages.discussions') : 'Community';
  const pageDescription = isDiscussionsPage 
    ? 'Join meaningful conversations with fellow believers' 
    : 'Connect with fellow believers and share your faith journey';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 dark:from-gray-900 dark:via-purple-900 dark:to-violet-900 pb-20 md:pb-0">
      {/* Enhanced Header */}
      <div className="bg-gray-900/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-lg border-b border-purple-800 dark:border-purple-800">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                {pageTitle}
              </h1>
              <p className="text-gray-300 dark:text-gray-300 mt-2 text-lg">
                {pageDescription}
              </p>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <Button variant="outline" size="sm" className="border-purple-600 hover:bg-purple-800 text-purple-300 hover:text-white">
                <Users className="h-4 w-4 mr-2 text-purple-400" />
                Groups
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
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
            <EnhancedCommunityFeed />
          </TabsContent>
          
          <TabsContent value="classic">
            <CommunityFeed />
          </TabsContent>
        </Tabs>
      </div>

      <MobileNav />
    </div>
  );
}