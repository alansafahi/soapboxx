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
import { getFilteredNavigation, type NavigationGroup } from "../../../shared/navigation";
import soapboxLogo from "../assets/soapbox-logo.jpeg";
import {
  LogOut,
  ChevronDown,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function SidebarComplete() {
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
    };

    // Set initial state
    handleResize();
    
    // Listen for window resize
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, [user]);

  // Get user's church-specific role data
  const { data: userAdminCommunities, isLoading: roleLoading, error: roleError } = useQuery<any>({
    queryKey: ["/api/users/admin-communities"],
    enabled: !!user,
  });

  // Check if user has any church admin role
  const hasCommunityAdminRole = useMemo(() => {
    if (!user || !userAdminCommunities) return false;
    
    const adminRoles = ['admin', 'pastor', 'lead_pastor', 'church_admin', 'administrator', 'associate_pastor'];
    const globalAdminRoles = ['soapbox_owner', 'soapbox-support', 'platform-admin', 'regional-admin', 'system-admin', 'super-admin'];
    
    // Check if user has global admin role
    if (globalAdminRoles.includes(user.role)) return true;
    
    // Check if user has admin access to any communities
    return userAdminCommunities?.hasAdminAccess || false;
  }, [user, userAdminCommunities]);

  // Use centralized navigation from shared/navigation.ts
  const allNavigationGroups = getFilteredNavigation(user?.role || 'member', isMobile);

  // Use the navigation groups directly from centralized system - NO hardcoded filtering
  const navigationGroups = allNavigationGroups;

  // Filter groups based on user permissions and admin access
  const visibleGroups = navigationGroups.filter(group => {
    if (group.label === 'ADMIN TOOLS' || group.label === 'ADMIN PORTAL') {
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
      className={`${isCollapsed ? 'w-12 sm:w-16' : 'w-48 sm:w-64'} bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 h-screen flex flex-col transition-all duration-300 ${isMobile ? 'fixed z-50' : 'relative'} overflow-hidden`}
    >
      {/* Header with Logo and Actions */}
      <div className="flex items-center justify-between p-2 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <img 
              src={soapboxLogo} 
              alt="SoapBox" 
              className="w-8 h-8 rounded-full object-cover border-2 border-blue-200 dark:border-blue-600" 
            />
            <span className="font-bold text-sm bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              SoapBox
            </span>
          </div>
        )}
        
        <div className="flex items-center space-x-1">
          {!isCollapsed && (
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="p-1 h-7 w-7 hover:bg-blue-100 dark:hover:bg-gray-700"
            >
              {theme === 'dark' ? <Sun className="h-3 w-3" /> : <Moon className="h-3 w-3" />}
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 h-7 w-7 hover:bg-blue-100 dark:hover:bg-gray-700"
          >
            {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
        <nav className="p-2 space-y-1">
          {visibleGroups.map((group) => (
            <div key={group.label} className="mb-3">
              {!isCollapsed && (
                <button
                  onClick={() => toggleGroup(group.label)}
                  className="flex items-center justify-between w-full px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                >
                  <span>{group.label}</span>
                  <ChevronDown 
                    className={`h-3 w-3 transition-transform ${
                      expandedGroups.has(group.label) ? 'transform rotate-180' : ''
                    }`} 
                  />
                </button>
              )}
              
              {(isCollapsed || expandedGroups.has(group.label)) && (
                <div className={`${isCollapsed ? 'space-y-1' : 'mt-1 space-y-1'}`}>
                  {group.items
                    .filter(item => {
                      // Filter items based on roles if specified
                      if (item.roles && item.roles.length > 0) {
                        return item.roles.includes(user?.role || '');
                      }
                      return true;
                    })
                    .map((item) => {
                      const Icon = item.icon;
                      const isActive = location === item.href || 
                        (item.href !== '/' && location.startsWith(item.href));
                      
                      return (
                        <Link key={item.label} href={item.href}>
                          <a
                            className={`flex items-center px-2 py-2 text-sm rounded-md transition-colors group ${
                              isActive
                                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-sm'
                                : 'text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                            }`}
                          >
                            <Icon className={`h-4 w-4 ${isCollapsed ? 'mx-auto' : 'mr-3'} ${
                              isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'
                            }`} />
                            {!isCollapsed && (
                              <span className="text-xs font-medium">{item.label}</span>
                            )}
                          </a>
                        </Link>
                      );
                    })}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* User Profile Section */}
      {user && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className={`w-full ${isCollapsed ? 'p-1 h-10' : 'justify-start p-2 h-auto'} hover:bg-gray-100 dark:hover:bg-gray-800`}
              >
                <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-2'}`}>
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={user.profileImageUrl || undefined} />
                    <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                      {user.firstName?.[0]?.toUpperCase() || user.email[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {!isCollapsed && (
                    <>
                      <div className="flex-1 text-left">
                        <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                          {user.firstName || user.email}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                          {user.role?.replace('_', ' ') || 'Member'}
                        </p>
                      </div>
                      <ChevronDown className="h-3 w-3 text-gray-400" />
                    </>
                  )}
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.firstName} {user.lastName}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile">
                  <a className="flex items-center w-full">
                    Profile
                  </a>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings">
                  <a className="flex items-center w-full">
                    Settings
                  </a>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-red-600 dark:text-red-400">
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
}