import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Link } from "wouter";
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
  Sparkles
} from "lucide-react";
import { getFilteredNavigation, type NavigationGroup } from "../../../shared/navigation";

export default function Sidebar() {
  const { user } = useAuth();
  const [location] = useLocation();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['COMMUNITY', 'SPIRITUAL TOOLS', 'MEDIA CONTENTS', 'ADMIN PORTAL', 'ACCOUNT']));
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
      // But don't auto-collapse if user is soapbox_owner to ensure admin access
      if (isMobileScreen && user?.role !== 'soapbox_owner') {
        setIsCollapsed(true);
      } else if (isLargeScreen) {
        setIsCollapsed(false);
      }
      
      // Auto-expand admin sections only on initial load, not on every resize
      if (user?.role === 'soapbox_owner' && !expandedGroups.has('ADMIN PORTAL')) {
        setExpandedGroups(prev => {
          const newSet = new Set(prev);
          newSet.add('ADMIN PORTAL');
          newSet.add('SOAPBOX PORTAL');
          return newSet;
        });
      }
      

    };

    // Set initial state
    handleResize();
    
    // Listen for window resize
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, [user]);

  // Get user's church-specific role data
  const { data: adminData, isLoading: roleLoading, error: roleError } = useQuery<any>({
    queryKey: ["/api/auth/admin-communities"],
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 1
  });

  // Extract admin role from admin communities data
  const userRole = adminData?.hasAdminAccess ? 'church_admin' : null;

  // Auto-expand Admin Portal for church admins after role data loads
  useEffect(() => {
    if (adminData?.hasAdminAccess && !expandedGroups.has('ADMIN PORTAL')) {
      setExpandedGroups(prev => {
        const newSet = new Set(prev);
        newSet.add('ADMIN PORTAL');
        return newSet;
      });
    }
  }, [adminData, expandedGroups]);
  


  // Get unread message count for notification badge - temporarily disabled to fix dialog issues
  const { data: unreadCount = 0 } = useQuery<number>({
    queryKey: ["/api/messages/unread-count"],
    enabled: false, // Disabled to prevent 500 errors
    refetchInterval: 30000, // Refresh every 30 seconds
  });


  // Get filtered navigation from centralized config
  const visibleGroups = getFilteredNavigation(
    user?.role,
    userRole,
    isMobile, // Use actual mobile state
    user
  );

  // Debug logging for mobile navigation issues
  console.log('Sidebar Debug - isMobile:', isMobile, 'visibleGroups:', visibleGroups.map(g => g.label));

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

  // Don't hide sidebar during loading - let the filtering logic handle user permissions
  // The visibleGroups already handles the null user case properly

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

      {/* Navigation Groups */}
      <nav className={`flex-1 overflow-y-auto overflow-x-hidden ${isCollapsed ? 'p-2' : 'p-4 space-y-6'} min-h-0`}>
        {isCollapsed ? (
          // Collapsed Navigation - Icon Only with Admin Section Grouping
          <div className="space-y-4">
            {/* Regular Navigation Items */}
            <div className="space-y-2">
              {visibleGroups.filter(group => !['ADMIN PORTAL', 'SOAPBOX PORTAL'].includes(group.label)).flatMap(group => group.items).map((item) => {
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
            
            {/* Admin Section - Visually Separated for soapbox_owner */}
            {user?.role === 'soapbox_owner' && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
                {visibleGroups.filter(group => ['ADMIN PORTAL', 'SOAPBOX PORTAL'].includes(group.label)).flatMap(group => group.items).map((item) => {
                  const Icon = item.icon;
                  const isActive = location === item.href;
                  return (
                    <Link key={item.href} href={item.href}>
                      <Button
                        variant={isActive ? "default" : "ghost"}
                        size="icon"
                        className={`relative w-8 h-8 sm:w-10 sm:h-10 text-xs sm:text-sm border-2 ${
                          isActive 
                            ? 'bg-purple-600 text-white hover:bg-purple-700 border-purple-600' 
                            : 'text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 border-purple-300 dark:border-purple-600 hover:border-purple-500 dark:hover:border-purple-400'
                        }`}
                        title={`Admin: ${item.label}`}
                      >
                        <Icon className="w-5 h-5" />
                      </Button>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          // Expanded Navigation - Full Groups
          visibleGroups.map((group) => {
            // Check if group is expanded
            const isExpanded = expandedGroups.has(group.label);
            
            return (
              <div key={group.label}>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    // Button clicked for group - debug logging removed
                    if (group.label === 'SPIRITUAL TOOLS') {
                      // SPIRITUAL TOOLS button clicked - debug logging removed
                    }
                    toggleGroup(group.label);
                  }}
                  onMouseDown={() => {}}
                  onMouseUp={() => {}}
                  className="flex items-center justify-between w-full text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3 hover:text-purple-600 dark:hover:text-purple-400 cursor-pointer z-10 relative"
                  style={{ pointerEvents: 'all' }}
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
        )}
      </nav>
    </div>
  );
}