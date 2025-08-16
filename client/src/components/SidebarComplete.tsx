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
  Flag,
  Building2,
  Building,
  HandHeart,
  UserCog,
  Users2,
  HelpCircle,
  MessageCircle,
  NotebookPen
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

export default function SidebarComplete() {
  const { user } = useAuth();
  const [location] = useLocation();

  // Get user's community admin roles for ADMIN PORTAL visibility
  const { data: userAdminCommunities } = useQuery<{
    hasAdminAccess: boolean;
    adminCommunities: Array<{
      communityId: number;
      role: string;
      communityName: string;
    }>;
    globalAdminRole: string | null;
  }>({
    queryKey: ["/api/auth/admin-communities"],
    enabled: !!user,
  });

  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['COMMUNITY', 'SPIRITUAL TOOLS', 'MEDIA CONTENTS', 'ADMIN PORTAL', 'ACCOUNT']));
  const [forceUpdate, setForceUpdate] = useState(Date.now());

  // Force immediate re-render to clear cache  
  useEffect(() => {
    setForceUpdate(Date.now());
    // Force component refresh to clear navigation cache
    const timer = setTimeout(() => setForceUpdate(Date.now() + 1), 100);
    return () => clearTimeout(timer);
  }, []);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const isFeatureEnabled = useIsFeatureEnabled();

  // Get user's churches to check for admin roles
  const { data: userCommunities = [], isLoading: communitiesLoading, error: communitiesError } = useQuery({
    queryKey: ["/api/users/communities"],
    enabled: !!user,
  });

  // Remove problematic useEffect that causes infinite loops
  // Feature filtering now happens directly at render time
  


  // Check if user has admin role in any community
  const hasCommunityAdminRole = useMemo(() => {
    if (!userCommunities || !Array.isArray(userCommunities) || userCommunities.length === 0) {
      return false;
    }
    
    const adminRoles = ['church_admin', 'church-admin', 'admin', 'pastor', 'lead-pastor', 'elder'];
    return userCommunities.some((uc: any) => adminRoles.includes(uc.role));
  }, [userCommunities]);

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

  // Get unread message count for notification badge - temporarily disabled to fix dialog issues
  const { data: unreadCount = 0 } = useQuery<number>({
    queryKey: ["/api/messages/unread-count"],
    enabled: false, // Disabled to prevent 500 errors
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // COMPLETE navigation structure with ALL features
  const allNavigationGroups: NavigationGroup[] = [
    {
      label: "COMMUNITY",
      items: [
        { label: "Home", href: "/", icon: Home },
        { label: "Messages", href: "/messages", icon: Mail },
        { label: "Contacts", href: "/contacts", icon: UserPlus },
        { label: "Topics", href: "/topics", icon: MessageSquare },
        { label: "Communities", href: "/communities", icon: Building },
        { label: "Events", href: "/events", icon: Calendar },
        { label: "Donation", href: "/donation", icon: DollarSign },
      ]
    },
    {
      label: "SPIRITUAL TOOLS",  
      items: [
        { label: "Today's Reading", href: "/bible", icon: BookOpen },

        { label: "D.I.V.I.N.E.", href: "/divine", icon: Sparkles }, // Divine Volunteer System - RESTORED
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
        { label: "Community Administration", href: "/community-administration", icon: Building2, roles: ['admin', 'church-admin', 'system-admin', 'super-admin', 'pastor', 'lead-pastor', 'soapbox_owner', 'soapbox-support', 'platform-admin', 'regional-admin'] },
        { label: "Content Creation", href: "/sermon-studio", icon: PenTool, roles: ['admin', 'church-admin', 'system-admin', 'super-admin', 'pastor', 'lead-pastor', 'soapbox_owner', 'soapbox-support', 'platform-admin', 'regional-admin'] },
        { label: "Content Moderation", href: "/moderation-dashboard", icon: Flag, roles: ['admin', 'church-admin', 'system-admin', 'super-admin', 'pastor', 'lead-pastor', 'soapbox_owner', 'soapbox-support', 'platform-admin', 'regional-admin'] },
        { label: "Staff Management", href: "/staff-management", icon: UserCog, roles: ['admin', 'church-admin', 'system-admin', 'super-admin', 'pastor', 'lead-pastor', 'soapbox_owner', 'soapbox-support', 'platform-admin', 'regional-admin'] },
        { label: "Member Management", href: "/member-management", icon: Users2, roles: ['admin', 'church-admin', 'system-admin', 'super-admin', 'pastor', 'lead-pastor', 'soapbox_owner', 'soapbox-support', 'platform-admin', 'regional-admin'] },
        { label: "Volunteer Management", href: "/volunteer-management", icon: HandHeart, roles: ['admin', 'church-admin', 'system-admin', 'super-admin', 'pastor', 'lead-pastor', 'soapbox_owner', 'soapbox-support', 'platform-admin', 'regional-admin'] },
        { label: "Background Check Management", href: "/background-check-management", icon: Shield, roles: ['admin', 'church-admin', 'system-admin', 'super-admin', 'pastor', 'lead-pastor', 'soapbox_owner', 'soapbox-support', 'platform-admin', 'regional-admin'] },
        { label: "Communication Hub", href: "/communication", icon: Megaphone, roles: ['admin', 'church-admin', 'system-admin', 'super-admin', 'pastor', 'lead-pastor', 'soapbox_owner', 'soapbox-support', 'platform-admin', 'regional-admin'] },
        { label: "Analytics Dashboard", href: "/analytics-dashboard", icon: BarChart3, roles: ['admin', 'church-admin', 'system-admin', 'super-admin', 'pastor', 'lead-pastor', 'soapbox_owner', 'soapbox-support', 'platform-admin', 'regional-admin'] },
        { label: "Engagement Analytics", href: "/engagement-analytics", icon: TrendingUp, roles: ['admin', 'church-admin', 'system-admin', 'super-admin', 'pastor', 'lead-pastor', 'soapbox_owner', 'soapbox-support', 'platform-admin', 'regional-admin'] },
        { label: "Donation Analytics", href: "/donation-analytics", icon: BarChart3, roles: ['admin', 'church-admin', 'system-admin', 'super-admin', 'pastor', 'lead-pastor', 'soapbox_owner', 'soapbox-support', 'platform-admin', 'regional-admin'] },
        { label: "QR Code Management", href: "/qr-management", icon: QrCode, roles: ['admin', 'church-admin', 'system-admin', 'super-admin', 'pastor', 'lead-pastor', 'soapbox_owner', 'soapbox-support', 'platform-admin', 'regional-admin'] },
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

  // Mobile navigation filtering - same logic as regular Sidebar
  const mobileNavigationItems = [
    "Messages", "Contacts", "Communities", "Events", "Topics", "Donation"
  ];

  // Filter for mobile: only show specific items from COMMUNITY group + Admin Tools
  const navigationGroups = isMobile ? [
    {
      label: "COMMUNITY",
      items: allNavigationGroups.find(g => g.label === "COMMUNITY")?.items.filter(item => 
        mobileNavigationItems.includes(item.label)
      ) || []
    },
    {
      label: "ADMIN PORTAL", 
      items: allNavigationGroups.find(g => g.label === "ADMIN PORTAL")?.items || []
    }
  ].filter(group => group.items.length > 0) : allNavigationGroups;

  // Filter groups based on user permissions and admin access
  const visibleGroups = navigationGroups.filter(group => {
    if (group.label === 'ADMIN PORTAL') {
      // Show admin portal for users with actual admin access to communities OR soapbox_owner
      return user && (userAdminCommunities?.hasAdminAccess || user?.role === 'soapbox_owner' || hasCommunityAdminRole);
    }
    
    return true;
  });

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

  const logout = async () => {
    try {
      // Call the logout API endpoint to clear server session
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      // Clear local storage and session storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Redirect to login page
      window.location.href = '/login';
    } catch (error) {
      // Even if API call fails, clear local data and redirect
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/login';
    }
  };

  return (
    <div 
      key={`sidebar-complete-${forceUpdate}`} 
      className={`${isCollapsed ? 'w-12 sm:w-16' : 'w-48 sm:w-64'} bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 h-screen flex flex-col transition-all duration-300 ${isMobile ? 'fixed z-50' : 'relative'} overflow-hidden`}
    >
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

            // Ensure admin groups are always expanded for users with admin access
            // FORCE SPIRITUAL TOOLS TO BE EXPANDED TO SHOW D.I.V.I.N.E.
            const isExpanded = expandedGroups.has(group.label) || 
              group.label === 'SPIRITUAL TOOLS' ||
              (user?.role === 'soapbox_owner' && group.label === 'ADMIN PORTAL') ||
              (userAdminCommunities?.hasAdminAccess && group.label === 'ADMIN PORTAL');
            
            return (
              <div key={group.label} className="space-y-2">
                {/* Group Header */}
                <button
                  onClick={() => toggleGroup(group.label)}
                  className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                >
                  <span>{group.label}</span>
                  <ChevronDown className={`w-4 h-4 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </button>

                {/* Group Items */}
                {isExpanded && (
                  <div className="space-y-1">
                    {group.items.map((item) => {
                      const isActive = location === item.href;
                      const hasPermission = !item.roles || item.roles.includes(user?.role || '');
                      
                      if (!hasPermission) return null;

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`flex items-center px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                            isActive
                              ? 'bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 text-purple-700 dark:text-purple-300 border-l-4 border-purple-500'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-purple-600 dark:hover:text-purple-400'
                          }`}
                        >
                          <item.icon className={`w-5 h-5 mr-3 flex-shrink-0 ${isActive ? 'text-purple-600 dark:text-purple-400' : ''}`} />
                          <span className="truncate">{item.label}</span>
                          {item.href === '/messages' && unreadCount > 0 && (
                            <Badge variant="secondary" className="ml-auto bg-red-500 text-white text-xs">
                              {unreadCount}
                            </Badge>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          // Collapsed Navigation - Icons Only
          <div className="space-y-2">
            {navigationGroups.flatMap(group => 
              group.items.filter(item => !item.roles || item.roles.includes(user?.role || ''))
            ).map((item) => {
              const isActive = location === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-center w-12 h-12 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 text-purple-700 dark:text-purple-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-purple-600 dark:hover:text-purple-400'
                  }`}
                  title={item.label}
                >
                  <item.icon className="w-6 h-6" />
                  {item.href === '/messages' && unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {unreadCount}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </nav>

      {/* User Profile Section */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
        {!isCollapsed ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start p-2 h-auto">
                <Avatar className="w-8 h-8 mr-3">
                  <AvatarImage src={user?.profileImageUrl} alt={user?.firstName} />
                  <AvatarFallback>
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start text-left min-w-0 flex-1">
                  <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {user?.firstName} {user?.lastName}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {user?.email}
                  </span>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs leading-none text-gray-500 dark:text-gray-400">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile" className="flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings" className="flex items-center">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/help" className="flex items-center">
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Help & Support
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={toggleTheme}>
                {theme === 'light' ? <Moon className="w-4 h-4 mr-2" /> : <Sun className="w-4 h-4 mr-2" />}
                {theme === 'light' ? 'Dark mode' : 'Light mode'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-red-600 dark:text-red-400">
                <LogOut className="w-4 h-4 mr-2" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex flex-col space-y-2">
            <Avatar className="w-8 h-8 mx-auto">
              <AvatarImage src={user?.profileImageUrl} alt={user?.firstName} />
              <AvatarFallback>
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <Button variant="ghost" size="icon" onClick={toggleTheme} title={theme === 'light' ? 'Dark mode' : 'Light mode'}>
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={logout} title="Sign out" className="text-red-600 dark:text-red-400">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}