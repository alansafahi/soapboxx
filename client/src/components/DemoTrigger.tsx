import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HelpCircle, Play, Target, BookOpen } from "lucide-react";
import { InteractiveDemo } from "./InteractiveDemo";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";

interface DemoTriggerProps {
  variant?: "floating" | "header" | "inline";
  className?: string;
}

export function DemoTrigger({ variant = "floating", className = "" }: DemoTriggerProps) {
  const [showDemo, setShowDemo] = useState(false);
  const { user } = useAuth();

  const { data: userRole } = useQuery({
    queryKey: ['/api/auth/user-role'],
    enabled: !!user
  });

  const { data: tourStatus } = useQuery({
    queryKey: ['/api/tour/status'],
    enabled: !!user
  });

  const shouldShowTour = tourStatus?.shouldShowTour;
  const detectedRole = tourStatus?.userRole || userRole?.role;

  if (variant === "floating") {
    return (
      <>
        <div className={`fixed bottom-6 right-6 z-40 ${className}`}>
          <Button
            onClick={() => setShowDemo(true)}
            className="rounded-full h-12 w-12 shadow-lg hover:shadow-xl transition-all"
            size="sm"
          >
            <Target className="h-5 w-5" />
          </Button>
          {shouldShowTour && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 animate-pulse"
            >
              New
            </Badge>
          )}
        </div>
        
        <InteractiveDemo
          isOpen={showDemo}
          onClose={() => setShowDemo(false)}
          userRole={detectedRole}
        />
      </>
    );
  }

  if (variant === "header") {
    return (
      <>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowDemo(true)}
          className={`flex items-center gap-2 ${className}`}
        >
          <Play className="h-4 w-4" />
          Demo
          {shouldShowTour && (
            <Badge variant="destructive" className="ml-1 px-1 text-xs">
              New
            </Badge>
          )}
        </Button>
        
        <InteractiveDemo
          isOpen={showDemo}
          onClose={() => setShowDemo(false)}
          userRole={detectedRole}
        />
      </>
    );
  }

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setShowDemo(true)}
        className={`flex items-center gap-2 ${className}`}
      >
        <BookOpen className="h-4 w-4" />
        Interactive Demo
      </Button>
      
      <InteractiveDemo
        isOpen={showDemo}
        onClose={() => setShowDemo(false)}
        userRole={detectedRole}
      />
    </>
  );
}