import { cn } from "@/lib/utils";

interface ProfileVerificationRingProps {
  emailVerified?: boolean | null;
  phoneVerified?: boolean | null;
  isLeadership?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
  children: React.ReactNode; // The avatar/profile image
}

export function ProfileVerificationRing({
  emailVerified = false,
  phoneVerified = false,
  isLeadership = false,
  size = "md",
  className,
  children
}: ProfileVerificationRingProps) {
  const emailVerifiedBool = emailVerified === true;
  const phoneVerifiedBool = phoneVerified === true;
  
  // Debug to see what's happening
  console.log('🔍 ProfileVerificationRing:', {
    emailVerified,
    phoneVerified,
    isLeadership,
    emailVerifiedBool,
    phoneVerifiedBool
  });
  
  // Determine ring style based on verification level
  const getRingStyle = () => {
    if (isLeadership && (emailVerifiedBool || phoneVerifiedBool)) {
      return {
        ringClass: "ring-4 ring-purple-600 shadow-lg shadow-purple-300 border-2 border-yellow-400",
        title: "Leadership Verified"
      };
    }
    
    if (emailVerifiedBool && phoneVerifiedBool) {
      return {
        ringClass: "ring-4 ring-green-500 shadow-lg shadow-green-300 border-2 border-purple-400",
        title: "Fully Verified"
      };
    }
    
    if (emailVerifiedBool || phoneVerifiedBool) {
      return {
        ringClass: "ring-3 ring-blue-500 shadow-lg shadow-blue-300",
        title: emailVerifiedBool ? "Email Verified" : "Phone Verified"
      };
    }
    
    return null;
  };

  const ringConfig = getRingStyle();
  
  if (!ringConfig) {
    return <div className={className}>{children}</div>;
  }

  const { ringClass, title } = ringConfig;

  // Size configurations for different use cases
  const sizeConfig = {
    xs: "p-0.5",
    sm: "p-1", 
    md: "p-1.5",
    lg: "p-2"
  };

  return (
    <div 
      className={cn(
        "relative rounded-full",
        ringClass,
        sizeConfig[size],
        className
      )}
      title={title}
    >
      <div className="rounded-full overflow-hidden">
        {children}
      </div>
    </div>
  );
}

export default ProfileVerificationRing;