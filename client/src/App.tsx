import { Switch, Route, useLocation, Router as WouterRouter, Link } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import AppHeader from "@/components/AppHeader";
import { Home, Church, Calendar, BookOpen, Heart, Mail, Settings } from "lucide-react";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import DemoPage from "@/pages/demo";
import AdminPortal from "@/pages/admin";
import EnhancedAdminPortal from "@/pages/admin-enhanced";
import Profile from "@/pages/profile";
import Chat from "@/pages/chat";
import Community from "@/pages/community";
import Churches from "@/pages/churches";
import Events from "@/pages/events";
import Prayer from "@/pages/prayer";
import Messages from "@/pages/messages";
import Leaderboard from "@/pages/leaderboard";
import BiblePage from "@/pages/bible";
import BibleReader from "@/pages/BibleReader";
import FeatureTestPage from "@/pages/feature-test";
import SettingsPage from "@/pages/settings";
import PrayerWallPreview from "@/pages/PrayerWallPreview";
import ChurchManagementDemo from "@/pages/ChurchManagementDemo";
import EnhancedChurchesDemo from "@/pages/EnhancedChurchesDemo";
import ChurchesEnhanced from "@/pages/ChurchesEnhanced";
import RoleManagement from "@/pages/RoleManagement";
import DonationDemo from "@/pages/DonationDemo";
import WelcomeWizard from "@/components/welcome-wizard";
import { ReferralWelcome } from "@/components/ReferralWelcome";
import { useState, useEffect } from "react";

function AppRouter() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [showWelcomeWizard, setShowWelcomeWizard] = useState(false);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [location] = useLocation();

  // Extract referral code from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    if (refCode) {
      setReferralCode(refCode);
      // Store in localStorage for persistence across auth flow
      localStorage.setItem('pendingReferralCode', refCode);
    } else {
      // Check if we have a stored referral code from auth flow
      const storedRefCode = localStorage.getItem('pendingReferralCode');
      if (storedRefCode) {
        setReferralCode(storedRefCode);
      }
    }
  }, [location]);

  // Check if user needs onboarding
  const needsOnboarding = isAuthenticated && user && !(user as any).hasCompletedOnboarding && !showWelcomeWizard;

  // Show loading spinner during initial auth check
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      {isAuthenticated && (
        <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 shadow-lg">
          <div className="flex items-center h-16 px-6 border-b border-gray-200">
            <span className="font-bold text-lg text-gray-900">SoapBox Super App</span>
          </div>
          <nav className="mt-6 px-4 space-y-2">
            <Link href="/">
              <div className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
                <Home className="h-5 w-5" />
                <span>Home</span>
              </div>
            </Link>
            <Link href="/churches">
              <div className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
                <Church className="h-5 w-5" />
                <span>Churches</span>
              </div>
            </Link>
            <Link href="/events">
              <div className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
                <Calendar className="h-5 w-5" />
                <span>Events</span>
              </div>
            </Link>
            <Link href="/bible">
              <div className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
                <BookOpen className="h-5 w-5" />
                <span>Daily Bible</span>
              </div>
            </Link>
            <Link href="/prayer">
              <div className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
                <Heart className="h-5 w-5" />
                <span>Prayer Wall</span>
              </div>
            </Link>
            <Link href="/messages">
              <div className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
                <Mail className="h-5 w-5" />
                <span>Messages</span>
              </div>
            </Link>
            <Link href="/admin">
              <div className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
                <Settings className="h-5 w-5" />
                <span>Admin Portal</span>
              </div>
            </Link>
          </nav>
        </div>
      )}
      {isAuthenticated && <AppHeader />}
      <main className={isAuthenticated ? "min-h-screen bg-gray-50 ml-64" : ""}>
        <Switch>
          {!isAuthenticated ? (
            <>
              <Route path="/demo" component={DemoPage} />
              <Route path="*" component={DemoPage} />
            </>
          ) : (
            <>
              <Route path="/" component={() => <Home referralCode={referralCode} />} />
              <Route path="/bible/read" component={BibleReader} />
              <Route path="/bible" component={BiblePage} />
              <Route path="/community" component={Community} />
              <Route path="/churches" component={Churches} />
              <Route path="/churches-enhanced" component={ChurchesEnhanced} />
              <Route path="/enhanced-churches-demo" component={EnhancedChurchesDemo} />
              <Route path="/church-management-demo" component={ChurchManagementDemo} />
              <Route path="/events" component={Events} />
              <Route path="/prayer" component={Prayer} />
              <Route path="/prayers" component={Prayer} />
              <Route path="/prayer-wall-preview" component={PrayerWallPreview} />
              <Route path="/discussions" component={Community} />
              <Route path="/devotionals" component={Community} />
              <Route path="/members" component={Community} />
              <Route path="/gamification" component={Leaderboard} />
              <Route path="/leaderboard" component={Leaderboard} />
              <Route path="/messages" component={Messages} />
              <Route path="/chat" component={Chat} />
              <Route path="/admin" component={EnhancedAdminPortal} />
              <Route path="/member-management" component={EnhancedAdminPortal} />
              <Route path="/role-management" component={RoleManagement} />
              <Route path="/profile" component={Profile} />
              <Route path="/settings" component={SettingsPage} />
              <Route path="/test-features" component={FeatureTestPage} />
              <Route path="/donation-demo" component={DonationDemo} />
              <Route path="*" component={NotFound} />
            </>
          )}
        </Switch>
      </main>
      
      {needsOnboarding && (
        <WelcomeWizard 
          onComplete={() => {
            setShowWelcomeWizard(true);
            // Refresh user data
            queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
          }} 
        />
      )}
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter>
          <AppRouter />
          <Toaster />
        </WouterRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
