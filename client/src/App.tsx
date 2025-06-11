import { Switch, Route, useLocation, Router as WouterRouter, Link } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import AppHeader from "@/components/AppHeader";
import { Home as HomeIcon, Church, Calendar, BookOpen, Heart, Mail, Settings } from "lucide-react";
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
import RoleUpgradeDemo from "@/pages/RoleUpgradeDemo";
import PhoneVerification from "@/pages/PhoneVerification";
import EmailVerification from "@/pages/EmailVerification";
import WelcomeWizard from "@/components/welcome-wizard";
import { ReferralWelcome } from "@/components/ReferralWelcome";
import TwoFactorOnboarding from "@/components/TwoFactorOnboarding";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

function AppRouter() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [showWelcomeWizard, setShowWelcomeWizard] = useState(false);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [show2FAOnboarding, setShow2FAOnboarding] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [churchName, setChurchName] = useState("");
  const [location] = useLocation();

  // Check if user needs 2FA onboarding (only for role upgrades)
  const { data: onboardingData } = useQuery({
    queryKey: ["/api/auth/2fa/onboarding-status"],
    enabled: isAuthenticated && !!user,
    retry: false,
  });

  // Show 2FA onboarding only if user has pending role upgrade requiring 2FA
  useEffect(() => {
    if (onboardingData?.needsOnboarding) {
      setShow2FAOnboarding(true);
      setUserRole(onboardingData.userRole);
      setChurchName(onboardingData.churchName);
    }
  }, [onboardingData]);

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
      {isAuthenticated && <AppHeader />}
      <main className={isAuthenticated ? "min-h-screen bg-gray-50 lg:ml-64" : ""}>
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
              <Route path="/role-upgrade-demo" component={RoleUpgradeDemo} />
              <Route path="/phone-verification" component={PhoneVerification} />
              <Route path="/email-verification" component={EmailVerification} />
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

      {/* 2FA Onboarding Modal - Only for role upgrades */}
      <TwoFactorOnboarding
        isOpen={show2FAOnboarding}
        onComplete={() => {
          setShow2FAOnboarding(false);
          // Refresh user data and clear the pending setup flag
          queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
          queryClient.invalidateQueries({ queryKey: ["/api/auth/2fa/onboarding-status"] });
        }}
        userRole={userRole}
        churchName={churchName}
      />
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
