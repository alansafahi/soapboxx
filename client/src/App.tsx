import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import AppHeader from "@/components/AppHeader";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import AdminPortal from "@/pages/admin";
import Profile from "@/pages/profile";
import Chat from "@/pages/chat";
import Community from "@/pages/community";
import Churches from "@/pages/churches";
import Events from "@/pages/events";
import Prayer from "@/pages/prayer";
import Messages from "@/pages/messages";
import Leaderboard from "@/pages/leaderboard";
import WelcomeWizard from "@/components/welcome-wizard";
import { useState } from "react";

function Router() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [showWelcomeWizard, setShowWelcomeWizard] = useState(false);
  const [location] = useLocation();

  // Check if user needs onboarding
  const needsOnboarding = isAuthenticated && user && !(user as any).hasCompletedOnboarding && !showWelcomeWizard;

  return (
    <>
      {isAuthenticated && <AppHeader />}
      <main className="min-h-screen bg-gray-50">
        <Switch>
          {isLoading || !isAuthenticated ? (
            <Route path="*" component={Landing} />
          ) : (
            <>
              <Route path="/" component={Home} />
              <Route path="/community" component={Community} />
              <Route path="/churches" component={Churches} />
              <Route path="/events" component={Events} />
              <Route path="/prayer" component={Prayer} />
              <Route path="/prayers" component={Prayer} />
              <Route path="/discussions" component={Community} />
              <Route path="/devotionals" component={Community} />
              <Route path="/members" component={Community} />
              <Route path="/gamification" component={Leaderboard} />
              <Route path="/messages" component={Messages} />
              <Route path="/chat" component={Chat} />
              <Route path="/leaderboard" component={Leaderboard} />
              <Route path="/admin" component={AdminPortal} />
              <Route path="/member-management" component={AdminPortal} />
              <Route path="/profile" component={Profile} />
              <Route component={NotFound} />
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
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
