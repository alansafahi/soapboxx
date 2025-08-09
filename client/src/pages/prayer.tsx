import { useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/use-toast";
import PrayerWall from "../components/prayer-wall";
import MobileNav from "../components/mobile-nav";

export default function PrayerPage() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  
  // Extract highlight parameter from URL
  const urlParams = new URLSearchParams(window.location.search);
  const highlightId = urlParams.get('highlight');

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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Prayer Wall...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 pb-20 md:pb-0">
      {highlightId && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mx-4 mt-4 mb-6">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-red-800 dark:text-red-300">
              🔴 Viewing Prayer Request #{highlightId}
            </span>
          </div>
          <p className="text-sm text-red-700 dark:text-red-400 mt-1">
            This prayer request has been highlighted for your attention.
          </p>
        </div>
      )}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <PrayerWall highlightId={highlightId} />
      </div>

      <MobileNav />
    </div>
  );
}