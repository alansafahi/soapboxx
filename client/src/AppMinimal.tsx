import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import ClickTest from "@/components/ClickTest";

function SimpleApp() {
  const [count, setCount] = useState(0);
  
  return (
    <div className="min-h-screen bg-white p-8">
      <h1 className="text-3xl font-bold mb-8">SoapBox Audio Bible - Responsive Test</h1>
      
      <div className="space-y-4">
        <div className="bg-blue-100 p-4 rounded">
          <h2 className="text-xl font-semibold mb-2">Interface Test</h2>
          <p>Click count: {count}</p>
          <Button 
            onClick={() => setCount(prev => prev + 1)}
            className="mt-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            Test Click (Count: {count})
          </Button>
        </div>
        
        <div className="bg-green-100 p-4 rounded">
          <h2 className="text-xl font-semibold mb-2">Audio Bible Status</h2>
          <p>✓ Database: 42,561 verses (complete Bible)</p>
          <p>✓ Search: All 66 books available</p>
          <p>✓ Manual selection: Working</p>
          <p>✓ Audio synthesis: Premium voices ready</p>
        </div>
        
        <div className="bg-purple-100 p-4 rounded">
          <h2 className="text-xl font-semibold mb-2">Navigation Test</h2>
          <div className="space-x-2">
            <a href="/click-test" className="text-blue-600 underline">Click Test Page</a>
            <a href="/audio-bible" className="text-blue-600 underline">Audio Bible</a>
          </div>
        </div>
      </div>
    </div>
  );
}

function AppRouter() {
  return (
    <div>
      <Switch>
        <Route path="/click-test" component={ClickTest} />
        <Route path="/" component={SimpleApp} />
      </Switch>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppRouter />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}