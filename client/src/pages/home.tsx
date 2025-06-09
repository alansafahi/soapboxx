import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/navigation";
import CommunityFeed from "@/components/community-feed";
import EventsList from "@/components/events-list";
import PrayerRequests from "@/components/prayer-requests";
import AchievementTracker from "@/components/achievement-tracker";
import ChurchDiscovery from "@/components/church-discovery";
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
    <div className="min-h-screen bg-warm-white">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <section className="mb-8">
          <div className="bg-gradient-to-r from-faith-blue to-blue-600 rounded-2xl p-8 text-white relative overflow-hidden">
            <div className="relative z-10">
              <h1 className="text-3xl font-bold mb-2">
                Welcome back, {user?.firstName || 'Friend'}!
              </h1>
              <p className="text-lg mb-6 text-[#ff00f1]">
                Continue your spiritual journey with your faith community
              </p>
              
              {/* Quick Stats with Gamification */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-faith-gold rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{userStats?.attendanceCount || 0}</div>
                      <div className="text-blue-100 text-sm">Events Attended</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 8V4l8 8-8 8v-4H4v-8h8z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{userStats?.prayerCount || 0}</div>
                      <div className="text-blue-100 text-sm">Prayer Requests</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{userStats?.connectionCount || 0}</div>
                      <div className="text-blue-100 text-sm">Connections</div>
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
            <div id="prayer-requests">
              <PrayerRequests />
            </div>
            <AchievementTracker />
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
