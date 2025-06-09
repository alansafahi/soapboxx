import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/navigation";
import SocialFeed from "@/components/social-feed";
import EventsList from "@/components/events-list";
import PrayerRequests from "@/components/prayer-requests";
import ChurchDiscovery from "@/components/church-discovery";
import DailyInspiration from "@/components/daily-inspiration";
import MobileNav from "@/components/mobile-nav";
import { useQuery } from "@tanstack/react-query";

export default function Home() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();

  // Get user stats
  const { data: userStats } = useQuery({
    queryKey: ["/api/users/stats"],
    enabled: !!user,
  });

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
      <div className="min-h-screen flex items-center justify-center bg-warm-white">
        <div className="text-center">
          <div className="w-16 h-16 bg-faith-blue rounded-full flex items-center justify-center mb-4 mx-auto animate-pulse">
            <div className="w-8 h-8 bg-white rounded-full"></div>
          </div>
          <p className="text-gray-600">Loading your faith community...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-white dark:bg-gray-900">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Social Feed Layout - Twitter/Facebook Style */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Primary Feed Column */}
          <div className="lg:col-span-2">
            <div id="social-feed">
              <SocialFeed />
            </div>
            <div id="events-list">
              <EventsList />
            </div>
          </div>
          
          {/* Right Sidebar */}
          <div className="space-y-6">
            <div id="daily-inspiration">
              <DailyInspiration />
            </div>
            {/* Temporarily disabled to prevent event conflicts with social feed
            <div id="prayer-requests">
              <PrayerRequests />
            </div>
            */}
            <div id="church-discovery">
              <ChurchDiscovery />
            </div>
          </div>
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
