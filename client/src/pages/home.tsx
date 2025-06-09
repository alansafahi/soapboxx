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
              
              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                <button 
                  onClick={() => {
                    document.getElementById('daily-inspiration')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-center border border-white/30 hover:bg-white/30 transition-all duration-200 group"
                >
                  <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">📖</div>
                  <div className="text-sm font-medium text-white">Daily Inspiration</div>
                </button>
                <button 
                  onClick={() => {
                    document.getElementById('community-feed')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-center border border-white/30 hover:bg-white/30 transition-all duration-200 group"
                >
                  <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">💬</div>
                  <div className="text-sm font-medium text-white">Community</div>
                </button>
                <button 
                  onClick={() => {
                    document.getElementById('prayer-requests')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-center border border-white/30 hover:bg-white/30 transition-all duration-200 group"
                >
                  <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">🙏</div>
                  <div className="text-sm font-medium text-white">Prayer</div>
                </button>
                <button 
                  onClick={() => {
                    document.getElementById('church-discovery')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-center border border-white/30 hover:bg-white/30 transition-all duration-200 group"
                >
                  <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">⛪</div>
                  <div className="text-sm font-medium text-white">Churches</div>
                </button>
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
            <div id="prayer-requests">
              <PrayerRequests />
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
