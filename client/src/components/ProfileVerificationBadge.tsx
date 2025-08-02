import { Shield, CheckCircle, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfileVerificationBadgeProps {
  emailVerified?: boolean | null;
  phoneVerified?: boolean | null;
  isLeadership?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function ProfileVerificationBadge({
  emailVerified = false,
  phoneVerified = false,
  isLeadership = false,
  size = "md",
  className
}: ProfileVerificationBadgeProps) {
  const emailVerifiedBool = emailVerified === true;
  const phoneVerifiedBool = phoneVerified === true;
  
  // Determine verification level and badge style
  const getBadgeConfig = () => {
    if (isLeadership && (emailVerifiedBool || phoneVerifiedBool)) {
      return {
        icon: Crown,
        bgColor: "bg-purple-500",
        borderColor: "border-purple-400",
        title: "Leadership Verified"
      };
    }
    
    if (emailVerifiedBool && phoneVerifiedBool) {
      return {
        icon: Shield,
        bgColor: "bg-green-500",
        borderColor: "border-green-400",
        title: "Fully Verified"
      };
    }
    
    if (emailVerifiedBool || phoneVerifiedBool) {
      return {
        icon: CheckCircle,
        bgColor: "bg-blue-500",
        borderColor: "border-blue-400",
        title: phoneVerifiedBool ? "Phone Verified" : "Email Verified"
      };
    }
    
    return null;
  };

  const config = getBadgeConfig();
  

  
  if (!config) return null;

  const { icon: Icon, bgColor, borderColor, title } = config;

  // Size configurations for small badge next to profile
  const sizeConfig = {
    sm: "w-4 h-4",
    md: "w-5 h-5", 
    lg: "w-6 h-6"
  };

  const iconSizeConfig = {
    sm: "w-2.5 h-2.5",
    md: "w-3 h-3",
    lg: "w-3.5 h-3.5"
  };

  return (
    <div 
      className={cn(
        "absolute -bottom-1 -right-1 rounded-full border-2 border-white dark:border-gray-900 flex items-center justify-center shadow-lg z-30",
        bgColor,
        borderColor,
        sizeConfig[size],
        className
      )}
      title={title}
    >
      <Icon className={cn("text-white", iconSizeConfig[size])} />
    </div>
  );
}