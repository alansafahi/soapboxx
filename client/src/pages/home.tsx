import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/navigation";
import CommunityFeed from "@/components/community-feed";
import EventsList from "@/components/events-list";
import PrayerRequests from "@/components/prayer-requests";
import ProgressTracker from "@/components/progress-tracker";
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
        {/* Welcome Section */}
        <section className="mb-8">
          <div className="bg-gradient-to-r from-faith-blue to-blue-600 rounded-2xl p-8 text-white relative overflow-hidden">
            <div className="relative z-10">
              <h1 className="text-3xl mb-2 text-[#9d00ff] text-left font-extrabold">
                Welcome to SoapBox Super App, {user?.firstName || 'Friend'}!
              </h1>
              <p className="text-lg mb-6 text-[#ff00f1]">
                Your complete faith community platform - connect, grow, and thrive together
              </p>
              
              {/* Quick Stats with Gamification */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Daily Inspirations Read */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 3l1.09 3.26L16 6.11l-3.26 1.09L12 10l-1.09-3.26L8 6.11l3.26-1.09L12 3zm2.54 5L13 10.54l3.26 1.09L17 15l1.09-3.26L21.5 11l-3.26-1.09L17 7l-1.09 3.26L14.5 11l1.09-3.26z"/>
                      </svg>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-white">{userStats?.inspirationsRead || 0}</div>
                      <div className="text-xs text-blue-100 font-bold">Daily Inspirations Read</div>
                    </div>
                  </div>
                </div>

                {/* Prayers Offered */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 8c.55 0 1-.45 1-1V3c0-.55-.45-1-1-1s-1 .45-1 1v4c0 .55.45 1 1 1zm4.24-2.93l1.41-1.41c.39-.39.39-1.02 0-1.41-.39-.39-1.02-.39-1.41 0l-1.41 1.41c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0zM21 11h-4c-.55 0-1 .45-1 1s.45 1 1 1h4c.55 0 1-.45 1-1s-.45-1-1-1zM7.76 5.07L6.35 3.66c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41l1.41 1.41c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41zM8 13H4c-.55 0-1 .45-1 1s.45 1 1 1h4c.55 0 1-.45 1-1s-.45-1-1-1zm4.3 7.3l-1.41-1.41c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41l1.41 1.41c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41z"/>
                      </svg>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-white">{userStats?.prayersOffered || 0}</div>
                      <div className="text-xs text-blue-100 font-bold">Prayers Offered</div>
                    </div>
                  </div>
                </div>

                {/* Discussion Posts */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
                      </svg>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-white">{userStats?.discussionCount || 0}</div>
                      <div className="text-xs text-blue-100 font-bold">Discussion Posts</div>
                    </div>
                  </div>
                </div>

                {/* Achievement Level */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-white">Level {userStats?.level || 1}</div>
                      <div className="text-xs text-blue-100 font-bold">Achievement Level</div>
                    </div>
                  </div>
                </div>

                {/* Points Earned */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-white">{userStats?.totalPoints || 0}</div>
                      <div className="text-xs text-blue-100 font-bold">Points Earned</div>
                    </div>
                  </div>
                </div>

                {/* Events Attended */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-white">{userStats?.attendanceCount || 0}</div>
                      <div className="text-xs text-blue-100 font-bold">Events Attended</div>
                    </div>
                  </div>
                </div>

                {/* Prayer Requests */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 8V4l8 8-8 8v-4H4v-8h8z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-white">{userStats?.prayerCount || 0}</div>
                      <div className="text-xs text-blue-100 font-bold">Prayer Requests</div>
                    </div>
                  </div>
                </div>

                {/* Connections */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className="w-12 h-12 bg-teal-500 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-white">{userStats?.connectionCount || 0}</div>
                      <div className="text-xs text-blue-100 font-bold">Connections</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Background decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
          </div>
        </section>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Community Feed */}
          <div className="lg:col-span-2 space-y-6">
            <div id="community-feed">
              <CommunityFeed />
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
            <div id="prayer-requests">
              <PrayerRequests />
            </div>
            <ProgressTracker />
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
