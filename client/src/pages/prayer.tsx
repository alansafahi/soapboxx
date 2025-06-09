import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import PrayerRequests from "@/components/prayer-requests";
import MobileNav from "@/components/mobile-nav";

export default function PrayerPage() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

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
          <p className="mt-4 text-gray-600">Loading prayer requests...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Prayer Requests</h1>
          <p className="text-gray-600 mt-1">Share your prayer needs and pray for others</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <PrayerRequests />
      </div>

      <MobileNav />
    </div>
  );
}