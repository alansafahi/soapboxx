import { Switch, Route, useLocation, Router as WouterRouter, Link } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Sidebar from "@/components/Sidebar";
import { Home as HomeIcon, Church, Calendar, BookOpen, Heart, Mail, Settings } from "lucide-react";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import LoginPage from "@/pages/login";
import Landing from "@/pages/landing";
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
import SettingsPage from "@/pages/settings";

import RoleManagement from "@/pages/RoleManagement";
import DonationDemo from "@/pages/DonationDemo";
import DonationAnalytics from "@/pages/DonationAnalytics";
import SMSGiving from "@/pages/SMSGiving";
import PhoneVerification from "@/pages/PhoneVerification";
import EmailVerification from "@/pages/EmailVerification";
import WelcomeWizard from "@/components/welcome-wizard";
import TwoFactorOnboarding from "@/components/TwoFactorOnboarding";
import PersonalizedTour from "@/components/PersonalizedTour";
import { DemoTrigger } from "@/components/DemoTrigger";
import AdminAnalytics from "@/pages/AdminAnalytics";
import AudioRoutines from "@/pages/AudioRoutines";
import FreshAudioBible from "@/pages/FreshAudioBible";
import VideoLibrary from "@/pages/VideoLibrary";
import FeatureCatalogPage from "@/pages/FeatureCatalogPage";
import RoleSpecificFeaturesPage from "@/pages/RoleSpecificFeaturesPage";
import SermonStudioPage from "@/pages/SermonStudioPage";
import BulkCommunication from "@/pages/BulkCommunication";
import ContentDistributionPage from "@/pages/ContentDistributionPage";
import PastoralContentDemoPage from "@/pages/PastoralContentDemoPage";
import EngagementAnalytics from "@/pages/EngagementAnalytics";
import SoapPage from "@/pages/soap";
import ClickTest from "@/components/ClickTest";
import ChurchClaiming from "@/pages/church-claiming";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoleBasedTour } from "@/hooks/useRoleBasedTour";

function AppRouter() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [location] = useLocation();
  
  // Minimal state for stable operation
  const [forceHideOnboarding, setForceHideOnboarding] = useState(false);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [show2FAOnboarding, setShow2FAOnboarding] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [churchName, setChurchName] = useState("");

  // Global error handler
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.warn('Promise rejection handled:', event.reason);
      event.preventDefault();
    };
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    return () => window.removeEventListener('unhandledrejection', handleUnhandledRejection);
  }, []);

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

  // Check if user needs onboarding (but not for tour testing page)  
  const needsOnboarding = false; // Temporarily disabled to allow direct access to AI mood check-ins

  // Fetch user's primary role for tour personalization
  const { data: userRoleData } = useQuery({
    queryKey: ["/api/auth/user-role"],
    enabled: isAuthenticated && !!user && !needsOnboarding && !show2FAOnboarding,
    retry: false,
  });

  // Import and use the role-based tour hook
  const { 
    shouldShowTour, 
    userRole: detectedUserRole, 
    completeTour 
  } = useRoleBasedTour();

  // Calculate if tour should show based on current state
  const hasCompletedOnboarding = (user as any)?.has_completed_onboarding;
  const allOnboardingComplete = hasCompletedOnboarding && !show2FAOnboarding && !needsOnboarding;
  const shouldShowPersonalizedTour = isAuthenticated && shouldShowTour && allOnboardingComplete && !forceHideOnboarding;
  
  // Update user role when detected
  useEffect(() => {
    if (detectedUserRole) {
      setUserRole(detectedUserRole);
    }
  }, [detectedUserRole]);
  
  // Route debugging removed - routing issue fixed

  // Show loading spinner during initial auth check
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {isAuthenticated && <Sidebar />}
      <main className={isAuthenticated ? "flex-1 overflow-y-auto" : "flex-1"}>
        <Switch>
          {!isAuthenticated ? (
            <>
              <Route path="/login" component={LoginPage} />
              <Route path="*" component={Landing} />
            </>
          ) : (
            <>
              <Route path="/" component={() => <Home referralCode={referralCode} />} />
              <Route path="/bible" component={BiblePage} />
              <Route path="/bible/read" component={BibleReader} />
              <Route path="/community" component={Community} />
              <Route path="/churches" component={Churches} />
              <Route path="/church-claiming" component={ChurchClaiming} />
              <Route path="/events" component={Events} />
              <Route path="/prayer" component={Prayer} />
              <Route path="/prayer-wall" component={Prayer} />
              <Route path="/soap" component={SoapPage} />
              <Route path="/messages" component={Messages} />
              <Route path="/chat" component={Chat} />
              <Route path="/leaderboard" component={Leaderboard} />
              <Route path="/admin" component={EnhancedAdminPortal} />
              <Route path="/admin/analytics" component={AdminAnalytics} />
              <Route path="/role-management" component={RoleManagement} />
              <Route path="/profile" component={Profile} />
              <Route path="/settings" component={SettingsPage} />
              <Route path="/donation-demo" component={DonationDemo} />
              <Route path="/donation-analytics" component={DonationAnalytics} />
              <Route path="/sms-giving" component={SMSGiving} />
              <Route path="/phone-verification" component={PhoneVerification} />
              <Route path="/email-verification" component={EmailVerification} />
              <Route path="/audio-routines" component={AudioRoutines} />
              <Route path="/audio-bible" component={FreshAudioBible} />
              <Route path="/video-library" component={VideoLibrary} />
              <Route path="/features" component={FeatureCatalogPage} />
              <Route path="/role-features" component={RoleSpecificFeaturesPage} />
              <Route path="/sermon-studio" component={SermonStudioPage} />
              <Route path="/content-distribution" component={ContentDistributionPage} />
              <Route path="/pastoral-demo" component={PastoralContentDemoPage} />
              <Route path="/engagement-analytics" component={EngagementAnalytics} />
              <Route path="/communications" component={BulkCommunication} />
              <Route path="/click-test" component={ClickTest} />
              {/* Catch all unmatched routes */}
              <Route path="*" component={NotFound} />
            </>
          )}
        </Switch>
      </main>
      
      {needsOnboarding && (
        <WelcomeWizard 
          onComplete={async () => {
            // Force hide onboarding immediately
            setForceHideOnboarding(true);
            
            // Refresh user data and wait for it to complete
            await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
            await queryClient.refetchQueries({ queryKey: ["/api/auth/user"] });
            
            // Small delay to ensure UI updates
            setTimeout(() => {
              console.log("Onboarding completed, showing main app");
            }, 100);
          }} 
        />
      )}

      {/* 2FA Onboarding Modal - Simplified for stability */}

      {/* Personalized Tour - Shows after onboarding completion */}
      <PersonalizedTour
        isOpen={shouldShowPersonalizedTour}
        onComplete={async () => {
          // Mark tour as completed using the role-based tour system
          try {
            await completeTour();
            
            // Refresh user data to update hasCompletedTour flag
            await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
            await queryClient.invalidateQueries({ queryKey: ["/api/tour/status"] });
          } catch (error) {
            console.error("Error completing tour:", error);
          }
        }}
        userRole={userRole}
      />

      {/* Interactive Demo Trigger - Always available for authenticated users */}
      {isAuthenticated && <DemoTrigger variant="floating" />}
    </div>
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
