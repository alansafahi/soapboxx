import { Brain, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface AIIndicatorProps {
  variant?: "badge" | "icon" | "full";
  isPersonalized?: boolean;
  className?: string;
}

export function AIIndicator({ variant = "badge", isPersonalized = false, className = "" }: AIIndicatorProps) {
  const content = {
    badge: (
      <Badge 
        variant="secondary" 
        className={`bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs ${className}`}
      >
        <Sparkles className="h-3 w-3 mr-1" />
        AI Enhanced
      </Badge>
    ),
    icon: (
      <div className={`flex items-center gap-1 ${className}`}>
        <Brain className="h-4 w-4 text-blue-600" />
        <Sparkles className="h-3 w-3 text-purple-600" />
      </div>
    ),
    full: (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="flex items-center gap-1">
          <Brain className="h-4 w-4 text-blue-600" />
          <Sparkles className="h-3 w-3 text-purple-600" />
        </div>
        <span className="text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {isPersonalized ? "Personalized for You" : "AI Enhanced"}
        </span>
      </div>
    )
  };

  const tooltipText = isPersonalized 
    ? "This content has been personalized based on your spiritual journey and current needs"
    : "This reading plan features AI-enhanced content for Torchbearer subscribers";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="cursor-help">
            {content[variant]}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="max-w-48 text-center text-xs">{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}