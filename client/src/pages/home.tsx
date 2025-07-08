import { useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/use-toast";

import SocialFeed from "../components/social-feed";
import EventsList from "../components/events-list";
import PrayerWall from "../components/prayer-wall";
import ChurchDiscovery from "../components/church-discovery";
import LeaderboardWidget from "../components/leaderboard-widget";
import LeaderboardPreview from "../components/LeaderboardPreview";
import UpcomingEventsPreview from "../components/UpcomingEventsPreview";
import CompactPostComposer from "../components/CompactPostComposer";
import LimitedSocialFeed from "../components/LimitedSocialFeed";
import MobileNav from "../components/mobile-nav";
import CheckInSystem from "../components/CheckInSystem";
import { ReferralWelcome } from "../components/ReferralWelcome";
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
        
        {/* Spiritual Highlights Carousel/Grid */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Spiritual Highlights</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <div className="order-1">
              <CheckInSystem />
            </div>
            <div className="order-2">
              <UpcomingEventsPreview />
            </div>
            <div className="order-3">
              <LeaderboardPreview />
            </div>
          </div>
        </div>

        {/* Main Feed Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Primary Feed Column */}
          <div className="lg:col-span-3 min-w-0 space-y-6">
            {/* Post Composer */}
            <CompactPostComposer />

            {/* Latest Posts */}
            <LimitedSocialFeed initialLimit={5} />
          </div>
          
          {/* Right Sidebar - Hidden on smaller screens */}
          <div className="hidden lg:block space-y-6">
            <div id="prayer-wall">
              <PrayerWall />
            </div>
            <div id="church-discovery">
              <ChurchDiscovery />
            </div>
            <div id="events-list">
              <EventsList />
            </div>
          </div>
        </div>
      </main>
      
      {/* Floating Post Button - Mobile Only */}
      <div className="lg:hidden fixed bottom-20 right-4 z-40">
        <button 
          className="w-14 h-14 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg flex items-center justify-center transition-colors"
          onClick={() => {
            const composer = document.querySelector('[data-testid="compact-composer"] textarea') as HTMLTextAreaElement;
            if (composer) {
              composer.focus();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
      
      <MobileNav />
    </div>
  );
}
