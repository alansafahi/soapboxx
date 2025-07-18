import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Link } from "wouter";
import { useIsFeatureEnabled } from "../hooks/useChurchFeatures";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { useTheme } from "../hooks/useTheme";
import soapboxLogo from "../assets/soapbox-logo.jpeg";
import {
  Home, 
  Users, 
  Calendar, 
  MessageSquare, 
  Heart, 
  Settings,
  ChevronDown,
  BookOpen,
  Play,
  Mic,
  Video,
  ImageIcon,
  DollarSign,
  BarChart3,
  Megaphone,
  PenTool,
  Share2,
  TrendingUp,
  User,
  LogOut,
  Bell,
  Sun,
  Shield,
  Moon,
  Mail,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  Sparkles,
  Trophy,
  QrCode,
  Bookmark,
  Flag
} from "lucide-react";

interface NavigationItem {
  label: string;
  href: string;
  icon: any;
  roles?: string[];
}

interface NavigationGroup {
  label: string;
  items: NavigationItem[];
}

export default function SidebarFixed() {
  const { user } = useAuth();
  const [location] = useLocation();

  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['COMMUNITY', 'SPIRITUAL TOOLS', 'MEDIA CONTENTS', 'ADMIN PORTAL', 'SOAPBOX PORTAL', 'ACCOUNT']));
  const [forceUpdate, setForceUpdate] = useState(0);


  
  // Force re-render every 2 seconds to overcome React caching issues
  useEffect(() => {
    const interval = setInterval(() => {
      setForceUpdate(prev => prev + 1);
    }, 2000);
    return () => clearInterval(interval);
  }, []);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const isFeatureEnabled = useIsFeatureEnabled();

  // Get user's churches to check for admin roles
  const { data: userChurches = [], isLoading: churchesLoading, error: churchesError } = useQuery({
    queryKey: ["/api/users/churches"],
    enabled: !!user,
  });

  // Remove problematic useEffect that causes infinite loops
  // Feature filtering now happens directly at render time
  


  // Check if user has admin role in any church
  const hasChurchAdminRole = useMemo(() => {
    if (!userChurches || !userChurches.length) {
      return false;
    }
    
    const adminRoles = ['church_admin', 'church-admin', 'admin', 'pastor', 'lead-pastor', 'elder'];
    return userChurches.some((uc: any) => adminRoles.includes(uc.role));
  }, [userChurches]);

  // Responsive sidebar behavior
  useEffect(() => {
    const handleResize = () => {
      const isMobileScreen = window.innerWidth < 768; // md breakpoint
      const isLargeScreen = window.innerWidth >= 1024; // lg breakpoint
      
      setIsMobile(isMobileScreen);
      
      // Auto-collapse on small screens, expand on large screens
      // But don't auto-collapse if user is soapbox_owner to ensure admin access
      if (isMobileScreen && user?.role !== 'soapbox_owner') {
        setIsCollapsed(true);
      } else if (isLargeScreen) {
        setIsCollapsed(false);
      }
    };

    // Set initial state
    handleResize();
    
    // Listen for window resize
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Get unread message count for notification badge
  const { data: unreadCount = 0 } = useQuery<number>({
    queryKey: ["/api/messages/unread-count"],
    enabled: !!user,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // EXACT navigation structure as specified by user
  const navigationGroups: NavigationGroup[] = [
    {
      label: "COMMUNITY",
      items: [
        { label: "Home", href: "/", icon: Home },
        { label: "Messages", href: "/messages", icon: Mail },
        { label: "Contacts", href: "/contacts", icon: UserPlus },
        { label: "Churches", href: "/churches", icon: Users },
        { label: "Events", href: "/events", icon: Calendar },
        { label: "Discussions", href: "/discussions", icon: MessageSquare },
        { label: "Donation", href: "/donation", icon: DollarSign },
      ]
    },
    {
      label: "SPIRITUAL TOOLS",
      items: [
        { label: "Today's Reading", href: "/bible", icon: BookOpen },
        { label: "Prayer Wall", href: "/prayer-wall", icon: Heart },
        { label: "S.O.A.P. Journal", href: "/soap", icon: PenTool },
        { label: "Saved Reflections", href: "/saved-reflections", icon: Bookmark },
        { label: "Bookmarked Prayers", href: "/bookmarked-prayers", icon: Heart },
        { label: "Audio Bible", href: "/audio-bible", icon: Play },
        { label: "Audio Routines", href: "/audio-routines", icon: Mic },
        { label: "Engagement Board", href: "/leaderboard", icon: Trophy },
      ]
    },
    {
      label: "MEDIA CONTENTS",
      items: [
        { label: "Video Library", href: "/video-library", icon: Video },
        { label: "Image Gallery", href: "/image-gallery", icon: ImageIcon },
      ]
    },
    {
      label: "ADMIN PORTAL",
      items: [
        { label: "Member Directory", href: "/members", icon: Users, roles: ['admin', 'church-admin', 'system-admin', 'super-admin', 'pastor', 'lead-pastor', 'soapbox_owner', 'soapbox-support', 'platform-admin', 'regional-admin'] },
        { label: "QR Code Management", href: "/qr-management", icon: QrCode, roles: ['admin', 'church-admin', 'system-admin', 'super-admin', 'pastor', 'lead-pastor', 'soapbox_owner', 'soapbox-support', 'platform-admin', 'regional-admin'] },
        { label: "Donation Analytics", href: "/donation-analytics", icon: BarChart3, roles: ['admin', 'church-admin', 'system-admin', 'super-admin', 'pastor', 'lead-pastor', 'soapbox_owner', 'soapbox-support', 'platform-admin', 'regional-admin'] },
        { label: "Communication Hub", href: "/communication", icon: Megaphone, roles: ['admin', 'church-admin', 'system-admin', 'super-admin', 'pastor', 'lead-pastor', 'soapbox_owner', 'soapbox-support', 'platform-admin', 'regional-admin'] },
        { label: "Sermon Studio", href: "/sermon-studio", icon: PenTool, roles: ['admin', 'church-admin', 'system-admin', 'super-admin', 'pastor', 'lead-pastor', 'soapbox_owner', 'soapbox-support', 'platform-admin', 'regional-admin'] },
        { label: "Engagement Analytics", href: "/engagement-analytics", icon: TrendingUp, roles: ['admin', 'church-admin', 'system-admin', 'super-admin', 'pastor', 'lead-pastor', 'soapbox_owner', 'soapbox-support', 'platform-admin', 'regional-admin'] },
        { label: "Content Moderation", href: "/moderation-dashboard", icon: Flag, roles: ['admin', 'church-admin', 'system-admin', 'super-admin', 'pastor', 'lead-pastor', 'soapbox_owner', 'soapbox-support', 'platform-admin', 'regional-admin'] },
      ]
    },
    {
      label: "SOAPBOX PORTAL",
      items: [
        { label: "Church Management", href: "/admin", icon: Shield, roles: ['soapbox_owner'] },
      ]
    },
    {
      label: "ACCOUNT",
      items: [
        { label: "Profile", href: "/profile", icon: User },
        { label: "Settings", href: "/settings", icon: Settings },
      ]
    }
  ];

  // Use navigation groups directly - filtering happens at render time
  const visibleGroups = navigationGroups;

  const toggleGroup = (groupLabel: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupLabel)) {
        newSet.delete(groupLabel);
      } else {
        newSet.add(groupLabel);
      }
      return newSet;
    });
  };

  const logout = () => {
    window.location.href = '/login';
  };

  return (
    <div className={`${isCollapsed ? 'w-12 sm:w-16' : 'w-48 sm:w-64'} bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 h-screen flex flex-col transition-all duration-300 ${isMobile ? 'fixed z-50' : 'relative'} overflow-hidden`}>
      {/* Header with Logo and Actions */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        {/* Logo and Toggle */}
        <div className={`flex items-center mb-4 ${isCollapsed ? 'flex-col space-y-2' : 'justify-between'}`}>
          {!isCollapsed ? (
            <>
              <Link href="/" className="flex items-center space-x-3">
                <div className="w-12 h-12 flex items-center justify-center flex-shrink-0">
                  <img 
                    src={soapboxLogo} 
                    alt="SoapBox Logo" 
                    className="w-12 h-12 object-contain rounded-lg"
                  />
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="text-lg font-bold text-gray-900 dark:text-white leading-tight">SoapBox</div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white leading-tight">Super App</div>
                </div>
              </Link>
              
              {/* Collapse Toggle Button - Expanded Mode */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="w-8 h-8" 
                onClick={() => setIsCollapsed(!isCollapsed)}
              >
                <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              </Button>
            </>
          ) : (
            <>
              {/* Logo - Collapsed Mode */}
              <Link href="/" className="flex items-center justify-center">
                <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                  <img 
                    src={soapboxLogo} 
                    alt="SoapBox Logo" 
                    className="w-8 h-8 object-contain rounded-lg"
                  />
                </div>
              </Link>
              
              {/* Expand Toggle Button - Collapsed Mode - More Prominent */}
              <Button 
                variant="outline" 
                size="icon" 
                className="w-8 h-8 border-purple-300 hover:bg-purple-50 dark:border-purple-600 dark:hover:bg-purple-900/20" 
                onClick={() => setIsCollapsed(!isCollapsed)}
                title="Expand sidebar"
              >
                <ChevronRight className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-6">
        {!isCollapsed ? (
          // Expanded Navigation - Filtered Groups  
          visibleGroups.map((group, idx) => {

            // Ensure admin groups are always expanded for soapbox_owner users OR users with church admin roles
            const isExpanded = expandedGroups.has(group.label) || 
              (user?.role === 'soapbox_owner' && (group.label === 'ADMIN PORTAL' || group.label === 'SOAPBOX PORTAL')) ||
              (hasChurchAdminRole && group.label === 'ADMIN PORTAL');
            
            return (
              <div key={`${group.label}-${group.items.length}-${idx}`}>
                <button
                  onClick={() => toggleGroup(group.label)}
                  className="flex items-center justify-between w-full text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3 hover:text-purple-600 dark:hover:text-purple-400"
                >
                  <span>{group.label}</span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </button>
                
                {isExpanded && (
                  <div className="space-y-1">
                    {group.items.filter((item) => {
                      // Apply role-based filtering first  
                      if (item.roles) {
                        if (!user) return false;
                        const hasGlobalRole = item.roles.includes(user.role || '');
                        const hasChurchRole = hasChurchAdminRole && (item.roles.includes('church-admin') || item.roles.includes('church_admin'));
                        if (!hasGlobalRole && !hasChurchRole) return false;
                      }
                      
                      // Apply direct church feature filtering to bypass React caching
                      const featureEnabled = isFeatureEnabled(item.href);
                      // Always show moderation dashboard for authorized users
                      if (!featureEnabled && item.href !== '/moderation-dashboard') {
                        return false;
                      }
                      
                      return true;
                    }).map((item, itemIdx) => {
                      const Icon = item.icon;
                      const isActive = location === item.href;
                      

                      




                      return (
                        <Link key={`expanded-${item.href}-${itemIdx}-${forceUpdate}-${Date.now()}`} href={item.href}>
                          <Button
                            variant={isActive ? "default" : "ghost"}
                            className={`w-full justify-start h-auto py-2 px-3 ${
                              isActive 
                                ? "bg-purple-600 text-white hover:bg-purple-700" 
                                : "text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                            }`}
                          >
                            <Icon className="h-4 w-4 mr-3" />
                            <span className="text-sm">{item.label}</span>
                            {item.label === "Messages" && unreadCount > 0 && (
                              <Badge className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full min-w-[1.25rem] h-5">
                                {unreadCount > 99 ? '99+' : unreadCount}
                              </Badge>
                            )}
                          </Button>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          // Collapsed Navigation - Icons Only with Feature Filtering
          <div className="space-y-2">
            {visibleGroups.flatMap(group => group.items).map((item) => {
              // Apply same filtering logic as expanded view
              if (item.roles) {
                if (!user) return null;
                const hasGlobalRole = item.roles.includes(user.role || '');
                const hasChurchRole = hasChurchAdminRole && (item.roles.includes('church-admin') || item.roles.includes('church_admin'));
                if (!hasGlobalRole && !hasChurchRole) return null;
              }
              
              // Apply church feature filtering with debug  
              const featureEnabled = isFeatureEnabled(item.href);
              // Always show moderation dashboard for authorized users
              if (!featureEnabled && item.href !== '/moderation-dashboard') {
                return null;
              }
              
              const Icon = item.icon;
              const isActive = location === item.href;
              


              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    size="icon"
                    className={`relative w-8 h-8 sm:w-10 sm:h-10 text-xs sm:text-sm ${
                      isActive 
                        ? 'bg-purple-600 text-white hover:bg-purple-700' 
                        : 'text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400'
                    }`}
                    title={item.label}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label === "Messages" && unreadCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1 py-0 rounded-full min-w-[1rem] h-4 flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </Badge>
                    )}
                  </Button>
                </Link>
              );
            }).filter(item => item !== null)}
          </div>
        )}
      </nav>
    </div>
  );
}