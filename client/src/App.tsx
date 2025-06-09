import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
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

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
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
          <Route path="/messages" component={Messages} />
          <Route path="/chat" component={Chat} />
          <Route path="/admin" component={AdminPortal} />
          <Route path="/profile" component={Profile} />
        </>
      )}
    </Switch>
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
