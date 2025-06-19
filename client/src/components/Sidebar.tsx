import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTheme } from "@/hooks/useTheme";
import soapboxLogo from "@/assets/soapbox-logo.jpeg";
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
  Moon,
  Mail,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

interface NavigationItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: string[];
}

interface NavigationGroup {
  label: string;
  items: NavigationItem[];
}

export default function Sidebar() {
  const { user } = useAuth();
  const [location] = useLocation();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['COMMUNITY', 'SPIRITUAL TOOLS']));
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { theme, toggleTheme } = useTheme();

  // Responsive sidebar behavior
  useEffect(() => {
    const handleResize = () => {
      const isMobileScreen = window.innerWidth < 768; // md breakpoint
      const isLargeScreen = window.innerWidth >= 1024; // lg breakpoint
      
      setIsMobile(isMobileScreen);
      
      // Auto-collapse on small screens, expand on large screens
      if (isMobileScreen) {
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

  // Get user role data
  const { data: userRole } = useQuery({
    queryKey: ["/api/auth/user-role"],
    enabled: !!user,
  });

  // Get unread message count for notification badge
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ["/api/messages/unread-count"],
    enabled: !!user,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const navigationGroups: NavigationGroup[] = [
    {
      label: "COMMUNITY",
      items: [
        { label: "Home", href: "/", icon: Home },
        { label: "Churches", href: "/churches", icon: Users },
        { label: "Events", href: "/events", icon: Calendar },
        { label: "Discussions", href: "/discussions", icon: MessageSquare },
        { label: "Messages", href: "/messages", icon: Mail },
        { label: "Prayer Wall", href: "/prayer-wall", icon: Heart },
      ]
    },
    {
      label: "SPIRITUAL TOOLS",
      items: [
        { label: "Today's Reading", href: "/bible", icon: BookOpen },
        { label: "Audio Bible", href: "/audio-bible", icon: Play },
        { label: "Audio Routines", href: "/audio-routines", icon: Mic },
        { label: "S.O.A.P. Journal", href: "/soap", icon: PenTool },
      ]
    },
    {
      label: "MEDIA CONTENTS",
      items: [
        { label: "Video Library", href: "/video-library", icon: Video },
      ]
    },
    {
      label: "ADMIN PORTAL",
      items: [
        { label: "Member Directory", href: "/members", icon: Users, roles: ['admin', 'church-admin', 'system-admin', 'super-admin', 'pastor', 'lead-pastor'] },
        { label: "SMS Giving", href: "/sms-giving", icon: DollarSign, roles: ['admin', 'church-admin', 'system-admin', 'super-admin', 'pastor', 'lead-pastor'] },
        { label: "Donation Analytics", href: "/donation-analytics", icon: BarChart3, roles: ['admin', 'church-admin', 'system-admin', 'super-admin', 'pastor', 'lead-pastor'] },
        { label: "Communication Hub", href: "/communication", icon: Megaphone, roles: ['admin', 'church-admin', 'system-admin', 'super-admin', 'pastor', 'lead-pastor'] },
        { label: "Sermon Studio", href: "/sermon-studio", icon: PenTool, roles: ['admin', 'church-admin', 'system-admin', 'super-admin', 'pastor', 'lead-pastor'] },
        { label: "Content Distribution", href: "/content-distribution", icon: Share2, roles: ['admin', 'church-admin', 'system-admin', 'super-admin', 'pastor', 'lead-pastor'] },
        { label: "Engagement Analytics", href: "/engagement-analytics", icon: TrendingUp, roles: ['admin', 'church-admin', 'system-admin', 'super-admin', 'pastor', 'lead-pastor'] },
        { label: "AI Content Showcase", href: "/ai-content-demo", icon: Mic, roles: ['admin', 'church-admin', 'system-admin', 'super-admin', 'pastor', 'lead-pastor'] },
      ]
    }
  ];

  // Filter groups based on user role
  const visibleGroups = navigationGroups.map(group => ({
    ...group,
    items: group.items.filter(item => 
      !item.roles || item.roles.some(role => 
        (userRole as any)?.roles?.includes(role) || (userRole as any)?.roles?.includes('super-admin')
      )
    )
  })).filter(group => group.items.length > 0);

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

  if (!user) {
    return null;
  }

  return (
    <div className={`${isCollapsed ? 'w-12 sm:w-16' : 'w-48 sm:w-64'} bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 h-screen overflow-y-auto flex flex-col transition-all duration-300 ${isMobile ? 'fixed z-50' : 'relative'}`}>
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

      {/* Navigation Groups */}
      <nav className={`flex-1 overflow-y-auto ${isCollapsed ? 'p-2' : 'p-4 space-y-6'}`}>
        {isCollapsed ? (
          // Collapsed Navigation - Icon Only
          <div className="space-y-2">
            {navigationGroups.flatMap(group => 
              group.items.filter(item => 
                !item.roles || item.roles.some(role => 
                  (userRole as any)?.roles?.includes(role) || (userRole as any)?.roles?.includes('super-admin')
                )
              )
            ).map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    size="icon"
                    className={`w-8 h-8 sm:w-10 sm:h-10 text-xs sm:text-sm ${
                      isActive 
                        ? 'bg-purple-600 text-white hover:bg-purple-700' 
                        : 'text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400'
                    }`}
                    title={item.label}
                  >
                    <Icon className="w-5 h-5" />
                  </Button>
                </Link>
              );
            })}
          </div>
        ) : (
          // Expanded Navigation - Full Groups
          visibleGroups.map((group) => {
            const isExpanded = expandedGroups.has(group.label);
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
                          </Button>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </nav>
    </div>
  );
}