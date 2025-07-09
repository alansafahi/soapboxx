import { useEffect, useRef } from "react";
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
import FloatingPostButton from "../components/FloatingPostButton";
import RecentCheckInsStrip from "../components/RecentCheckInsStrip";
import { ReferralWelcome } from "../components/ReferralWelcome";
import { useQuery } from "@tanstack/react-query";

interface HomeProps {
  referralCode?: string | null;
}

export default function Home({ referralCode }: HomeProps = {}) {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const composerRef = useRef<HTMLDivElement>(null);

  // Get user stats
  const { data: userStats } = useQuery({
    queryKey: ["/api/users/stats"],
    enabled: !!user,
  });

  const scrollToComposer = () => {
    if (composerRef.current) {
      composerRef.current.scrollIntoView({ behavior: 'smooth' });
      // Focus the textarea after scrolling
      setTimeout(() => {
        const textarea = composerRef.current?.querySelector('textarea');
        if (textarea) {
          textarea.focus();
        }
      }, 300);
    }
  };

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
        
        {/* Spiritual Rhythm Section - Always visible on top */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Daily Spiritual Rhythm</h2>
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

        {/* Recent Check-Ins Horizontal Strip */}
        <RecentCheckInsStrip />

        {/* Main Feed Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Primary Feed Column */}
          <div className="lg:col-span-3 min-w-0 space-y-6">
            {/* Post Composer - Moved above the feed */}
            <div ref={composerRef}>
              <CompactPostComposer />
            </div>

            {/* Latest Posts */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">📬 Latest Posts</h2>
              <LimitedSocialFeed initialLimit={4} />
            </div>
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
      
      {/* Floating Post Button for Mobile */}
      <FloatingPostButton onClick={scrollToComposer} />
      
      <MobileNav />
    </div>
  );
}