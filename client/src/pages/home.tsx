import { useState, useEffect, useRef } from "react";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/use-toast";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

import SocialFeed from "../components/social-feed";
import EventsList from "../components/events-list";


import LeaderboardWidget from "../components/leaderboard-widget";
import LeaderboardPreview from "../components/LeaderboardPreview";
import UpcomingEventsPreview from "../components/UpcomingEventsPreview";
import CompactPostComposer from "../components/CompactPostComposer";
import LimitedSocialFeed from "../components/LimitedSocialFeed";
import { EnhancedSocialFeed } from "../components/enhanced-social-feed";
import MyPostsFeed from "../components/my-posts-feed";
import MobileNav from "../components/mobile-nav";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Users, User } from "lucide-react";
import CheckInSystem from "../components/CheckInSystem";
import FloatingPostButton from "../components/FloatingPostButton";
import RecentCheckInsStrip from "../components/RecentCheckInsStrip";
import { ReferralWelcome } from "../components/ReferralWelcome";
import EditRequestBanner from "../components/EditRequestBanner";
import EditRequestToast from "../components/EditRequestToast";
import EmailVerificationBanner from "../components/EmailVerificationBanner";
import EmailVerificationReminder from "../components/EmailVerificationReminder";
import { useQuery } from "@tanstack/react-query";

interface HomeProps {
  referralCode?: string | null;
}

// Mobile Accordion Component
interface MobileAccordionSectionProps {
  title: string;
  icon: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  isFirst?: boolean;
}

function MobileAccordionSection({ title, icon, children, defaultOpen = false, isFirst = false }: MobileAccordionSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Card className={`w-full transition-all duration-200 ${isFirst ? 'border-blue-200 dark:border-blue-700' : ''}`}>
      <CardHeader 
        className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 pb-3"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-lg">{icon}</span>
            <CardTitle className="text-base font-semibold">{title}</CardTitle>
          </div>
          {isOpen ? (
            <ChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </div>
      </CardHeader>
      {isOpen && (
        <CardContent className="pt-0">
          {children}
        </CardContent>
      )}
    </Card>
  );
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
      {/* Email Verification Banner - shown at top of dashboard for unverified users */}
      <EmailVerificationBanner />
      {/* Periodic Email Verification Reminders - shown as modal dialogs */}
      <EmailVerificationReminder />
      {/* Edit Request Toast System */}
      <EditRequestToast />
      
      <main className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-4 md:py-6 lg:py-8">
        {/* Edit Request Banner - High Priority */}
        <EditRequestBanner />
        
        {/* Referral Welcome Banner */}
        {referralCode && (
          <div className="mb-4 sm:mb-6">
            <ReferralWelcome referralCode={referralCode} />
          </div>
        )}
        
        {/* Spiritual Rhythm Section - Mobile accordion, Desktop grid */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Daily Spiritual Rhythm</h2>
          
          {/* Desktop: Grid Layout */}
          <div className="hidden md:grid grid-cols-3 gap-6">
            <div className="w-full">
              <CheckInSystem />
            </div>
            <div className="w-full">
              <UpcomingEventsPreview />
            </div>
            <div className="w-full">
              <LeaderboardPreview />
            </div>
          </div>
          
          {/* Mobile: Stacked Layout with standardized card width and spacing */}
          <div className="md:hidden space-y-4">
            <div className="w-full">
              <CheckInSystem />
            </div>
            <div className="w-full">
              <UpcomingEventsPreview />
            </div>
            <div className="w-full">
              <LeaderboardPreview />
            </div>
          </div>
        </div>

        {/* Post Composer - Moved below Daily Tools */}
        <div className="mb-6" ref={composerRef}>
          <CompactPostComposer />
        </div>

        {/* Recent Check-Ins Horizontal Strip */}
        <RecentCheckInsStrip />

        {/* Main Feed Layout - Full Width */}
        <div className="w-full">
          {/* Social Feed with Tabs */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">📬 Social Feed</h2>
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="all" className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>Latest Posts</span>
                </TabsTrigger>
                <TabsTrigger value="myposts" className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>My Posts</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="all">
                {/* Phase 3: Enhanced Limited Social Feed with field mapping */}
                <LimitedSocialFeed initialLimit={5} />
              </TabsContent>
              
              <TabsContent value="myposts">
                <MyPostsFeed />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      
      {/* Floating Post Button for Mobile */}
      <FloatingPostButton onClick={scrollToComposer} />
      
      <MobileNav />
    </div>
  );
}