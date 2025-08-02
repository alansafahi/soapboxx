import { Badge } from "./ui/badge";
import { CheckCircle, Shield, Star, Award } from "lucide-react";
import { cn } from "../lib/utils";

interface VerificationBadgeProps {
  emailVerified?: boolean | null;
  phoneVerified?: boolean | null;
  isLeadership?: boolean;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

export function VerificationBadge({ 
  emailVerified, 
  phoneVerified, 
  isLeadership = false,
  size = "md",
  showText = true,
  className 
}: VerificationBadgeProps) {
  // Determine verification level
  const getVerificationLevel = () => {
    const emailVerifiedBool = emailVerified === true;
    const phoneVerifiedBool = phoneVerified === true;
    
    if (isLeadership && (emailVerifiedBool || phoneVerifiedBool)) return "leadership";
    if (emailVerifiedBool && phoneVerifiedBool) return "full";
    if (emailVerifiedBool || phoneVerifiedBool) return "partial";
    return "none";
  };

  const level = getVerificationLevel();

  // Get badge configuration based on verification level
  const getBadgeConfig = () => {
    switch (level) {
      case "leadership":
        return {
          icon: Award,
          text: "Leadership Verified",
          bgColor: "bg-gradient-to-r from-purple-600 to-indigo-600",
          textColor: "text-white",
          borderColor: "border-purple-300",
          iconColor: "text-white"
        };
      case "full":
        return {
          icon: Shield,
          text: "Fully Verified",
          bgColor: "bg-gradient-to-r from-green-500 to-emerald-500",
          textColor: "text-white",
          borderColor: "border-green-300",
          iconColor: "text-white"
        };
      case "partial":
        return {
          icon: CheckCircle,
          text: phoneVerified === true ? "Phone Verified" : "Email Verified",
          bgColor: "bg-gradient-to-r from-blue-500 to-cyan-500",
          textColor: "text-white",
          borderColor: "border-blue-300",
          iconColor: "text-white"
        };
      default:
        return null;
    }
  };

  const config = getBadgeConfig();
  
  if (!config || level === "none") return null;

  const { icon: Icon, text, bgColor, textColor, borderColor, iconColor } = config;

  // Size configurations
  const sizeConfig = {
    sm: {
      iconSize: "w-3 h-3",
      textSize: "text-xs",
      padding: "px-2 py-1",
      gap: "gap-1"
    },
    md: {
      iconSize: "w-4 h-4",
      textSize: "text-sm",
      padding: "px-3 py-1.5",
      gap: "gap-1.5"
    },
    lg: {
      iconSize: "w-5 h-5",
      textSize: "text-base",
      padding: "px-4 py-2",
      gap: "gap-2"
    }
  };

  const { iconSize, textSize, padding, gap } = sizeConfig[size];

  return (
    <div 
      className={cn(
        "inline-flex items-center rounded-full border shadow-sm",
        bgColor,
        textColor,
        borderColor,
        padding,
        gap,
        className
      )}
    >
      <Icon className={cn(iconSize, iconColor)} />
      {showText && (
        <span className={cn("font-medium", textSize)}>
          {text}
        </span>
      )}
    </div>
  );
}

// Individual verification indicators for detailed views
export function DetailedVerificationStatus({ 
  emailVerified, 
  phoneVerified, 
  isLeadership = false 
}: {
  emailVerified?: boolean | null;
  phoneVerified?: boolean | null;
  isLeadership?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      {/* Email Verification */}
      <div className="flex items-center gap-2">
        <div className={cn(
          "w-4 h-4 rounded-full flex items-center justify-center",
          emailVerified 
            ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400" 
            : "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500"
        )}>
          <CheckCircle className="w-3 h-3" />
        </div>
        <span className={cn(
          "text-sm",
          emailVerified 
            ? "text-green-700 dark:text-green-300" 
            : "text-gray-500 dark:text-gray-400"
        )}>
          Email {emailVerified ? "Verified" : "Unverified"}
        </span>
      </div>

      {/* Phone Verification */}
      <div className="flex items-center gap-2">
        <div className={cn(
          "w-4 h-4 rounded-full flex items-center justify-center",
          phoneVerified 
            ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400" 
            : "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500"
        )}>
          <CheckCircle className="w-3 h-3" />
        </div>
        <span className={cn(
          "text-sm",
          phoneVerified 
            ? "text-blue-700 dark:text-blue-300" 
            : "text-gray-500 dark:text-gray-400"
        )}>
          Phone {phoneVerified ? "Verified" : "Unverified"}
        </span>
      </div>

      {/* Leadership Verification */}
      {isLeadership && (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full flex items-center justify-center bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400">
            <Award className="w-3 h-3" />
          </div>
          <span className="text-sm text-purple-700 dark:text-purple-300">
            Leadership Verified
          </span>
        </div>
      )}
    </div>
  );
}