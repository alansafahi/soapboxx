import { 
  Home, 
  Mail, 
  UserPlus, 
  Users, 
  Calendar, 
  DollarSign,
  BookOpen,
  Heart,
  PenTool,
  Video,
  ImageIcon,
  Shield,
  Megaphone,
  BarChart3,
  TrendingUp,
  User,
  Settings,
  Sparkles,
  Play,
  Mic,
  MessageSquare
} from "lucide-react";

export interface NavigationItem {
  label: string;
  href: string;
  icon: any;
  roles?: string[];
  mobileOnly?: boolean;
  desktopOnly?: boolean;
}

export interface NavigationGroup {
  label: string;
  items: NavigationItem[];
  roles?: string[];
  mobileOnly?: boolean;
  desktopOnly?: boolean;
}

export const navigationConfig: NavigationGroup[] = [
  {
    label: "COMMUNITY",
    items: [
      { label: "Home", href: "/", icon: Home },
      { label: "Messages", href: "/messages", icon: Mail },
      { label: "Contacts", href: "/contacts", icon: UserPlus },
      { label: "Communities", href: "/communities", icon: Users },
      { label: "Events", href: "/events", icon: Calendar },
      { label: "Topics", href: "/topics", icon: MessageSquare },
      { label: "Donation", href: "/donation-demo", icon: DollarSign },
    ]
  },
  {
    label: "SPIRITUAL TOOLS",
    desktopOnly: true,
    items: [
      { label: "Today's Reading", href: "/bible", icon: BookOpen },
      { label: "Reading Plans", href: "/reading-plans", icon: BookOpen },
      { label: "Prayer Wall", href: "/prayer", icon: Heart },
      { label: "S.O.A.P. Journal", href: "/soap", icon: PenTool },
      { label: "D.I.V.I.N.E.", href: "/divine", icon: Sparkles },
      { label: "Audio Bible", href: "/audio-bible", icon: Play },
      { label: "Audio Routines", href: "/audio-routines", icon: Mic },
    ]
  },
  {
    label: "MEDIA CONTENTS",
    desktopOnly: true,
    items: [
      { label: "Video Library", href: "/video-library", icon: Video },
      { label: "Image Gallery", href: "/image-gallery", icon: ImageIcon },
    ]
  },
  {
    label: "ADMIN TOOLS",
    items: [
      { 
        label: "Member Directory", 
        href: "/members", 
        icon: Users, 
        roles: ['admin', 'church-admin', 'church_admin', 'system-admin', 'super-admin', 'pastor', 'lead-pastor', 'soapbox_owner', 'soapbox-support', 'platform-admin', 'regional-admin'] 
      },
      { 
        label: "Content Creation", 
        href: "/sermon-studio", 
        icon: PenTool, 
        roles: ['admin', 'church-admin', 'church_admin', 'system-admin', 'super-admin', 'pastor', 'lead-pastor', 'soapbox_owner', 'soapbox-support', 'platform-admin', 'regional-admin'] 
      },
      { 
        label: "Communication Hub", 
        href: "/communication", 
        icon: Megaphone, 
        roles: ['admin', 'church-admin', 'church_admin', 'system-admin', 'super-admin', 'pastor', 'lead-pastor', 'soapbox_owner', 'soapbox-support', 'platform-admin', 'regional-admin'] 
      },
      { 
        label: "Donation Analytics", 
        href: "/donation-analytics", 
        icon: BarChart3, 
        roles: ['admin', 'church-admin', 'church_admin', 'system-admin', 'super-admin', 'pastor', 'lead-pastor', 'soapbox_owner', 'soapbox-support', 'platform-admin', 'regional-admin'] 
      },
      { 
        label: "Engagement Analytics", 
        href: "/engagement-analytics", 
        icon: TrendingUp, 
        roles: ['admin', 'church-admin', 'church_admin', 'system-admin', 'super-admin', 'pastor', 'lead-pastor', 'soapbox_owner', 'soapbox-support', 'platform-admin', 'regional-admin'] 
      },
    ]
  },
  {
    label: "SOAPBOX PORTAL",
    desktopOnly: true,
    items: [
      { label: "Church Management", href: "/admin", icon: Shield, roles: ['soapbox_owner'] },
    ]
  },
  {
    label: "ACCOUNT",
    desktopOnly: true,
    items: [
      { label: "Profile", href: "/profile", icon: User },
      { label: "Settings", href: "/settings", icon: Settings },
    ]
  }
];

// Helper function to filter navigation based on user role and device type
export function getFilteredNavigation(
  userRole?: string | null,
  userAdminRole?: string | null,
  isMobile: boolean = false,
  user?: any
): NavigationGroup[] {
  return navigationConfig
    .filter(group => {
      // Filter by device type
      if (isMobile && group.desktopOnly) return false;
      if (!isMobile && group.mobileOnly) return false;
      
      // Filter by role if group has role restrictions
      if (group.roles) {
        return group.roles.some(role => 
          userRole === role || 
          userAdminRole === role ||
          userRole === 'soapbox_owner'
        );
      }
      
      return true;
    })
    .map(group => ({
      ...group,
      items: group.items.filter(item => {
        // Filter by device type
        if (isMobile && item.desktopOnly) return false;
        if (!isMobile && item.mobileOnly) return false;
        
        // Filter by role if item has role restrictions
        if (item.roles) {
          // If user data is still loading, show all items to prevent flickering
          if (!user) return true;
          
          const hasAccess = item.roles.some(role => 
            // Check if user has the role directly (global role)
            userRole === role || 
            // Check church-specific role
            userAdminRole === role ||
            // Always show for soapbox_owner
            userRole === 'soapbox_owner' ||
            // Also check if user has church_admin role for admin portal access
            (userAdminRole === 'church_admin' && ['admin', 'church-admin', 'church_admin'].includes(role)) ||
            // Temporary: Allow access for all authenticated users to test Sunday School
            (group.label === 'ADMIN PORTAL' && user && item.label === 'Content Creation')
          );
          
          return hasAccess;
        }
        
        return true;
      })
    }))
    .filter(group => group.items.length > 0); // Remove empty groups
}

// Mobile bottom navigation specific items (simplified for mobile)
export const mobileBottomNavItems = [
  { label: "Home", href: "/", icon: Home },
  { label: "Topics", href: "/topics", icon: MessageSquare },
  { label: "Prayer Wall", href: "/prayer", icon: Heart },
  { label: "S.O.A.P.", href: "/soap", icon: BookOpen },
];