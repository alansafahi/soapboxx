import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import CommunityFeed from "@/components/community-feed";
import EnhancedCommunityFeed from "@/components/enhanced-community-feed";
import MobileNav from "@/components/mobile-nav";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Sparkles, Users, MessageCircle } from "lucide-react";

export default function CommunityPage() {
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-faith-blue mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading community...</p>
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
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
              <p className="text-gray-600 mt-1">{pageDescription}</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Users className="h-4 w-4 mr-2" />
                Groups
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
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