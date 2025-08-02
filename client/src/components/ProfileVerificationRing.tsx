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
  
  // Verification processing complete
  
  // Simplified verification logic: Gold circle only for fully verified users
  const getRingStyle = () => {
    // Only show verification circle if user has BOTH email and phone verified
    if (emailVerifiedBool && phoneVerifiedBool) {
      return {
        ringClass: "ring-4 ring-yellow-500 shadow-lg shadow-yellow-400/50 border-2 border-yellow-600",
        title: "Fully Verified"
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
        "relative rounded-full flex-shrink-0",
        ringClass,
        sizeConfig[size],
        className
      )}
      title={title}
      style={{ aspectRatio: '1 / 1' }}
    >
      <div className="rounded-full overflow-hidden w-full h-full flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}

export default ProfileVerificationRing;