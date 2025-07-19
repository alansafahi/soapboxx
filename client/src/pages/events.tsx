import { useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/use-toast";
import EventsList from "../components/events-list";
import MobileNav from "../components/mobile-nav";

export default function EventsPage() {
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
      <div className="min-h-screen bg-gray-50 dark:bg-gradient-to-br dark:from-gray-900 dark:via-purple-900 dark:to-violet-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto"></div>
          <p className="mt-4 text-gray-300">Loading events...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gradient-to-br dark:from-gray-900 dark:via-purple-900 dark:to-violet-900 pb-20 md:pb-0">
      {highlightId && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mx-4 mt-4 mb-6">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-red-800 dark:text-red-300">
              🔴 Viewing Event #{highlightId}
            </span>
          </div>
          <p className="text-sm text-red-700 dark:text-red-400 mt-1">
            This event has been highlighted for your attention.
          </p>
        </div>
      )}
      {/* Enhanced Header */}
      <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-lg border-b border-gray-200 dark:border-purple-800">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:bg-gradient-to-r dark:from-purple-400 dark:to-blue-400 dark:bg-clip-text dark:text-transparent">
                Community Events
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2 text-lg">
                Discover upcoming events and connect with your faith community
              </p>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500 dark:text-gray-400">Today</p>
                <p className="font-semibold text-gray-800 dark:text-gray-200">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <EventsList highlightId={highlightId} />
      </div>

      <MobileNav />
    </div>
  );
}