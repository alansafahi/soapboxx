import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

import SocialFeed from "@/components/social-feed";
import EventsList from "@/components/events-list";
import PrayerWall from "@/components/prayer-wall";
import ChurchDiscovery from "@/components/church-discovery";
import LeaderboardWidget from "@/components/leaderboard-widget";
import MobileNav from "@/components/mobile-nav";
import CheckInSystem from "@/components/CheckInSystem";
import { ReferralWelcome } from "@/components/ReferralWelcome";
import { useQuery } from "@tanstack/react-query";

interface HomeProps {
  referralCode?: string | null;
}

export default function Home({ referralCode }: HomeProps = {}) {
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
          <div className="w-16 h-16 bg-soapbox-purple rounded-full flex items-center justify-center mb-4 mx-auto animate-pulse">
            <div className="w-8 h-8 bg-white rounded-full"></div>
          </div>
          <p className="text-gray-600">Loading your faith community...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-white dark:bg-gray-900">
      <main className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-4 md:py-6 lg:py-8">
        {/* Referral Welcome Banner */}
        {referralCode && (
          <div className="mb-4 sm:mb-6">
            <ReferralWelcome referralCode={referralCode} />
          </div>
        )}
        
        {/* Main Social Feed Layout - Mobile-First Responsive */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          {/* Primary Feed Column */}
          <div className="lg:col-span-2 min-w-0">
            <div id="social-feed" className="mb-4 sm:mb-6">
              <SocialFeed />
            </div>
            <div id="events-list" className="mb-4 sm:mb-6 lg:mb-0">
              <EventsList />
            </div>
          </div>
          
          {/* Right Sidebar - Stack on Mobile */}
          <div className="space-y-3 sm:space-y-4 md:space-y-6">
            <div id="check-in-system">
              <CheckInSystem />
            </div>
            <div id="leaderboard-widget">
              <LeaderboardWidget />
            </div>
            <div id="prayer-wall">
              <PrayerWall />
            </div>
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
