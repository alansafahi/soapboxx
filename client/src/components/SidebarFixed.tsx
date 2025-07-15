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
import { useLanguage } from "../contexts/LanguageContext";
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
  Languages,
  Trophy,
  QrCode
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
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();
  const isFeatureEnabled = useIsFeatureEnabled();

  // Get user's churches to check for admin roles
  const { data: userChurches = [], isLoading: churchesLoading, error: churchesError } = useQuery({
    queryKey: ["/api/users/churches"],
    enabled: !!user,
  });
  


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

  // EXACT navigation structure as specified by user - now with translations
  const navigationGroups: NavigationGroup[] = [
    {
      label: t('sections.community'),
      items: [
        { label: t('nav.home'), href: "/", icon: Home },
        { label: t('nav.messages'), href: "/messages", icon: Mail },
        { label: t('nav.contacts'), href: "/contacts", icon: UserPlus },
        { label: t('nav.churches'), href: "/churches", icon: Users },
        { label: t('nav.events'), href: "/events", icon: Calendar },
        { label: t('nav.donation'), href: "/donation-demo", icon: DollarSign },
        { label: t('nav.discussions'), href: "/discussions", icon: MessageSquare },
      ]
    },
    {
      label: t('sections.spiritualTools'),
      items: [
        { label: t('nav.todaysReading'), href: "/bible", icon: BookOpen },
        { label: t('nav.prayerWall'), href: "/prayer-wall", icon: Heart },
        { label: t('nav.engagementBoard'), href: "/leaderboard", icon: Trophy },
        { label: t('nav.soapJournal'), href: "/soap", icon: PenTool },
        { label: t('nav.audioBible'), href: "/audio-bible", icon: Play },
        { label: t('nav.audioRoutines'), href: "/audio-routines", icon: Mic },
      ]
    },
    {
      label: t('sections.mediaContents'),
      items: [
        { label: t('nav.videoLibrary'), href: "/video-library", icon: Video },
        { label: t('nav.imageGallery'), href: "/image-gallery", icon: ImageIcon },
      ]
    },
    {
      label: t('sections.adminPortal'),
      items: [
        { label: t('nav.memberDirectory'), href: "/members", icon: Users, roles: ['admin', 'church-admin', 'system-admin', 'super-admin', 'pastor', 'lead-pastor', 'soapbox_owner', 'soapbox-support', 'platform-admin', 'regional-admin'] },
        { label: t('nav.qrCodeManagement'), href: "/qr-management", icon: QrCode, roles: ['admin', 'church-admin', 'system-admin', 'super-admin', 'pastor', 'lead-pastor', 'soapbox_owner', 'soapbox-support', 'platform-admin', 'regional-admin'] },
        { label: t('nav.donationAnalytics'), href: "/donation-analytics", icon: BarChart3, roles: ['admin', 'church-admin', 'system-admin', 'super-admin', 'pastor', 'lead-pastor', 'soapbox_owner', 'soapbox-support', 'platform-admin', 'regional-admin'] },
        { label: t('nav.communicationHub'), href: "/communication", icon: Megaphone, roles: ['admin', 'church-admin', 'system-admin', 'super-admin', 'pastor', 'lead-pastor', 'soapbox_owner', 'soapbox-support', 'platform-admin', 'regional-admin'] },
        { label: t('nav.sermonStudio'), href: "/sermon-studio", icon: PenTool, roles: ['admin', 'church-admin', 'system-admin', 'super-admin', 'pastor', 'lead-pastor', 'soapbox_owner', 'soapbox-support', 'platform-admin', 'regional-admin'] },
        { label: t('nav.engagementAnalytics'), href: "/engagement-analytics", icon: TrendingUp, roles: ['admin', 'church-admin', 'system-admin', 'super-admin', 'pastor', 'lead-pastor', 'soapbox_owner', 'soapbox-support', 'platform-admin', 'regional-admin'] },
      ]
    },
    {
      label: t('sections.soapboxPortal'),
      items: [
        { label: t('nav.churchManagement'), href: "/admin", icon: Shield, roles: ['soapbox_owner'] },
        { label: t('nav.aiTranslationAdmin'), href: "/ai-translation-admin", icon: Languages, roles: ['soapbox_owner', 'system_admin'] },
      ]
    },
    {
      label: t('sections.account'),
      items: [
        { label: t('nav.profile'), href: "/profile", icon: User },
        { label: t('nav.settings'), href: "/settings", icon: Settings },
      ]
    }
  ];

  // Filter groups based on user role and church features
  const visibleGroups = navigationGroups.map(group => {
    const filteredItems = group.items.filter(item => {
      // First check role-based access
      if (item.roles) {
        // If user data is still loading, show all items to prevent flickering
        if (!user) return true;
        
        // Check if user has required global role OR church admin role
        const hasGlobalRole = item.roles.includes(user.role || '');
        const hasChurchRole = hasChurchAdminRole && (item.roles.includes('church-admin') || item.roles.includes('church_admin'));
        

        
        if (!hasGlobalRole && !hasChurchRole) return false;
      }
      
      // Then check church feature settings - use proper feature key mapping
      const featureKey = item.href.replace('/', '').replace('-demo', '');
      return isFeatureEnabled(featureKey);
    });
    
    const finalGroup = {
      ...group,
      items: filteredItems
    };
    
    return finalGroup;
  }).filter(group => {
    // Only show groups that have items after filtering
    return group.items.length > 0;
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
          // Expanded Navigation - Full Groups
          visibleGroups.map((group) => {
            // Ensure admin groups are always expanded for soapbox_owner users OR users with church admin roles
            const isExpanded = expandedGroups.has(group.label) || 
              (user?.role === 'soapbox_owner' && (group.label === 'ADMIN PORTAL' || group.label === 'SOAPBOX PORTAL')) ||
              (hasChurchAdminRole && group.label === 'ADMIN PORTAL');
            
            return (
              <div key={group.label}>
                <button
                  onClick={() => toggleGroup(group.label)}
                  className="flex items-center justify-between w-full text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3 hover:text-purple-600 dark:hover:text-purple-400"
                >
                  <span>{group.label}</span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </button>
                
                {isExpanded && (
                  <div className="space-y-1">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = location === item.href;
                      return (
                        <Link key={item.href} href={item.href}>
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
          // Collapsed Navigation - Icons Only
          <div className="space-y-2">
            {visibleGroups.flatMap(group => group.items).map((item) => {
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
            })}
          </div>
        )}
      </nav>
    </div>
  );
}