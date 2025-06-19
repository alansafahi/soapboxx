import { Switch, Route, useLocation, Router as WouterRouter } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useDirectAuth } from "@/lib/directAuth";

import Sidebar from "@/components/Sidebar";
import TopHeader from "@/components/TopHeader";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import LoginPage from "@/pages/login";
import Home from "@/pages/home";
import BiblePage from "@/pages/bible";
import Community from "@/pages/community";
import Churches from "@/pages/churches";
import Events from "@/pages/events";
import Prayer from "@/pages/prayer";
import SoapPage from "@/pages/soap";
import Messages from "@/pages/messages";
import Chat from "@/pages/chat";
import Leaderboard from "@/pages/leaderboard";
// import EnhancedAdminPortal from "@/pages/admin";
import Profile from "@/pages/profile";
import SettingsPage from "@/pages/settings";
import ChurchClaiming from "@/pages/church-claiming";

import { useState, useEffect } from "react";

function AppRouter() {
  // Use direct authentication bypassing React Query issues
  const { user: currentUser, isAuthenticated: currentIsAuthenticated, isLoading: currentIsLoading } = useDirectAuth();
  const [location] = useLocation();
  
  // Minimal state for stable operation
  const [referralCode, setReferralCode] = useState<string | null>(null);

  // Global error handler
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.log('Promise rejection handled:', event.reason);
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
      localStorage.setItem('pendingReferralCode', refCode);
    } else {
      const storedRefCode = localStorage.getItem('pendingReferralCode');
      if (storedRefCode) {
        setReferralCode(storedRefCode);
      }
    }
  }, [location]);

  // Debug authentication state
  console.log('🔥 AUTH STATE:', { currentIsAuthenticated, currentIsLoading, currentUser: currentUser?.email });

  // Show loading spinner during initial auth check
  if (currentIsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {currentIsAuthenticated && <Sidebar />}
      <div className={currentIsAuthenticated ? "flex-1 flex flex-col min-w-0 overflow-hidden" : "flex-1"}>
        {currentIsAuthenticated && <TopHeader />}
        <main className={currentIsAuthenticated ? "flex-1 overflow-y-auto px-1 sm:px-2 md:px-4 lg:px-6 py-1 sm:py-2 md:py-4" : "flex-1"}>
        <Switch>
          {!currentIsAuthenticated && !currentUser ? (
            <>
              <Route path="/login" component={LoginPage} />
              <Route path="*" component={Landing} />
            </>
          ) : (
            <>
              <Route path="/" component={() => <Home referralCode={referralCode} />} />
              <Route path="/bible" component={BiblePage} />
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
              {/* <Route path="/admin" component={EnhancedAdminPortal} /> */}
              <Route path="/profile" component={Profile} />
              <Route path="/settings" component={SettingsPage} />
              <Route path="*" component={NotFound} />
            </>
          )}
        </Switch>
        </main>
      </div>
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