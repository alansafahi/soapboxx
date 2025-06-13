import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Bell, User, MessageSquare, Search, Home, Church, Calendar, BookOpen, Heart, Mail, DollarSign, Settings, Users, Menu, X, Smartphone, Headphones, Volume2, PlayCircle, Sparkles, ChevronDown, ChevronRight, Shield, UserCog, Star, Share2, BarChart3 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";
import soapboxLogo from "@assets/SoapBox logo_1749686315479.jpeg";
import RoleSwitcher from "@/components/RoleSwitcher";

export default function AppHeader() {
  const { user } = useAuth();
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    community: true,
    spiritual: true,
    admin: false,
    account: false
  });

  // Get user role for conditional navigation
  const { data: userRole } = useQuery({
    queryKey: ["/api/auth/user-role"],
    retry: false,
  });

  // Get current active role from role switcher system
  const { data: roleData } = useQuery({
    queryKey: ["/api/auth/available-roles"],
    retry: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Grouped navigation structure with role-based visibility
  type NavigationItem = {
    href: string;
    label: string;
    icon: any;
    roles?: string[];
  };

  type NavigationGroup = {
    id: string;
    label: string;
    items: NavigationItem[];
  };

  const navigationGroups: NavigationGroup[] = [
    {
      id: "main",
      label: "Main",
      items: [
        { href: "/", label: "Home", icon: Home }
      ]
    },
    {
      id: "community",
      label: "Community",
      items: [
        { href: "/churches", label: "Churches", icon: Church },
        { href: "/events", label: "Events", icon: Calendar },
        { href: "/messages", label: "Messages", icon: MessageSquare },
        { href: "/prayer", label: "Prayer Wall", icon: Heart }
      ]
    },
    {
      id: "spiritual",
      label: "Spiritual Tools",
      items: [
        { href: "/bible", label: "Today's Reading", icon: BookOpen },
        { href: "/audio-bible", label: "Audio Bible", icon: Volume2 },
        { href: "/audio-routines", label: "Devotional Routines", icon: Headphones },
        { href: "/video-library", label: "Video Library", icon: PlayCircle },
        { href: "/sermon-studio", label: "Sermon Studio", icon: Sparkles, roles: ["pastor", "lead_pastor", "church_admin"] },
        { href: "/content-distribution", label: "Content Distribution", icon: Share2, roles: ["pastor", "lead_pastor", "church_admin"] },
        { href: "/engagement-analytics", label: "Engagement Analytics", icon: Settings, roles: ["pastor", "lead_pastor", "church_admin"] },
        { href: "/pastoral-demo", label: "AI Content Demo", icon: Star }
      ]
    },
    {
      id: "admin",
      label: "Admin",
      items: [
        { href: "/admin", label: "Admin Portal", icon: Settings, roles: ["admin", "church_admin", "system_admin", "super_admin", "pastor", "lead_pastor", "soapbox_owner"] },
        { href: "/role-management", label: "Role Management", icon: UserCog, roles: ["system_admin", "super_admin"] }
      ]
    },
    {
      id: "account",
      label: "Account",
      items: [
        { href: "/donation-demo", label: "Donations", icon: DollarSign },
        { href: "/profile", label: "Profile", icon: User },
        { href: "/features", label: "Feature Catalog", icon: Sparkles },
        { href: "/role-features", label: "Role Enhancement Plan", icon: UserCog }
      ]
    }
  ];

  // Filter navigation items based on current active role
  const getVisibleGroups = () => {
    // Use current active role from role switcher, fallback to base user role
    const currentRole = roleData?.currentRole || userRole?.role || '';
    
    console.log('Navigation Debug:', {
      currentRole,
      roleData: roleData?.currentRole,
      userRole: userRole?.role,
      navigationGroups
    });
    
    const filteredGroups = navigationGroups.map(group => ({
      ...group,
      items: group.items.filter(item => {
        if (!item.roles) return true;
        const hasAccess = item.roles.includes(currentRole);
        console.log(`Item: ${item.label}, Roles: ${item.roles}, Current: ${currentRole}, Access: ${hasAccess}`);
        return hasAccess;
      })
    })).filter(group => group.items.length > 0);
    
    console.log('Filtered Groups:', filteredGroups);
    return filteredGroups;
  };

  const isActiveRoute = (href: string) => {
    if (href === "/") return location === "/";
    return location.startsWith(href);
  };

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <>
      {/* Mobile Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 lg:hidden">
        <div className="px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </Button>
            
            <div className="flex items-center space-x-3">
              <img 
                src={soapboxLogo} 
                alt="SoapBox Logo" 
                className="h-8 w-8 rounded-full object-cover"
              />
              <span className="font-bold text-lg text-gray-900">SoapBox Super App</span>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.profileImageUrl || ""} />
                    <AvatarFallback>
                      {user?.firstName?.[0] || 'U'}{user?.lastName?.[0] || ''}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Link href="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Desktop Sidebar - Always Visible */}
      <div className={`hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:flex lg:flex-col bg-white border-r border-gray-200 shadow-lg transition-all duration-300 ${sidebarCollapsed ? 'lg:w-16' : 'lg:w-64'}`}>
        {/* Sidebar Header */}
        <div className="flex items-center h-16 px-6 border-b border-gray-200" style={{background: 'linear-gradient(to right, #5A2671, #7A3691)'}}>
          <img 
            src={soapboxLogo} 
            alt="SoapBox Logo" 
            className="h-8 w-8 rounded-full object-cover"
          />
          {!sidebarCollapsed && (
            <span className="ml-3 font-bold text-lg text-white">SoapBox Super App</span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="ml-auto text-white hover:bg-white/20"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 mt-6 px-4 space-y-3 overflow-y-auto">
          {getVisibleGroups().map((group) => {
            if (group.id === "main") {
              // Render main items without grouping
              return (
                <div key={group.id} className="space-y-1">
                  {group.items.map((item) => {
                    const IconComponent = item.icon;
                    return (
                      <Link key={item.href} href={item.href}>
                        <div
                          className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            isActiveRoute(item.href)
                              ? "text-white"
                              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                          }`}
                          style={isActiveRoute(item.href) ? {backgroundColor: '#5A2671'} : {}}
                          title={sidebarCollapsed ? item.label : undefined}
                        >
                          <IconComponent className="h-5 w-5 flex-shrink-0" />
                          {!sidebarCollapsed && <span>{item.label}</span>}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              );
            }

            // Render grouped sections
            return (
              <div key={group.id} className="space-y-1">
                {!sidebarCollapsed && (
                  <Collapsible
                    open={expandedSections[group.id]}
                    onOpenChange={() => toggleSection(group.id)}
                    className="space-y-1"
                  >
                    <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700 cursor-pointer">
                      <span>{group.label}</span>
                      {expandedSections[group.id] ? (
                        <ChevronDown className="h-3 w-3" />
                      ) : (
                        <ChevronRight className="h-3 w-3" />
                      )}
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent className="space-y-1 pl-3">
                      {group.items.map((item) => {
                        const IconComponent = item.icon;
                        return (
                          <Link key={item.href} href={item.href}>
                            <div
                              className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                isActiveRoute(item.href)
                                  ? "text-white"
                                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                              }`}
                              style={isActiveRoute(item.href) ? {backgroundColor: '#5A2671'} : {}}
                            >
                              <IconComponent className="h-5 w-5 flex-shrink-0" />
                              <span>{item.label}</span>
                            </div>
                          </Link>
                        );
                      })}
                    </CollapsibleContent>
                  </Collapsible>
                )}
                
                {sidebarCollapsed && (
                  <div className="space-y-1">
                    {group.items.map((item) => {
                      const IconComponent = item.icon;
                      return (
                        <Link key={item.href} href={item.href}>
                          <div
                            className={`flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              isActiveRoute(item.href)
                                ? "text-white"
                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            }`}
                            style={isActiveRoute(item.href) ? {backgroundColor: '#5A2671'} : {}}
                            title={item.label}
                          >
                            <IconComponent className="h-5 w-5" />
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* User Profile Section */}
        <div className="absolute bottom-0 w-full border-t border-gray-200 p-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start p-2">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.profileImageUrl || ""} />
                    <AvatarFallback>
                      {user?.firstName?.[0] || 'U'}{user?.lastName?.[0] || ''}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuItem>
                <Link href="/profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/settings">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <img 
              src={soapboxLogo} 
              alt="SoapBox Logo" 
              className="h-8 w-8 rounded-full object-cover"
            />
            <span className="font-bold text-lg text-gray-900">SoapBox</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-4 space-y-3 overflow-y-auto">
          {getVisibleGroups().map((group) => {
            if (group.id === "main") {
              // Render main items without grouping
              return (
                <div key={group.id} className="space-y-1">
                  {group.items.map((item) => {
                    const IconComponent = item.icon;
                    return (
                      <Link key={item.href} href={item.href}>
                        <div
                          className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            isActiveRoute(item.href)
                              ? "text-white"
                              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                          }`}
                          style={isActiveRoute(item.href) ? {backgroundColor: '#5A2671'} : {}}
                          onClick={() => setSidebarOpen(false)}
                        >
                          <IconComponent className="h-5 w-5 flex-shrink-0" />
                          <span>{item.label}</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              );
            }

            // Render grouped sections for mobile
            return (
              <div key={group.id} className="space-y-1">
                <Collapsible
                  open={expandedSections[group.id]}
                  onOpenChange={() => toggleSection(group.id)}
                  className="space-y-1"
                >
                  <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700 cursor-pointer">
                    <span>{group.label}</span>
                    {expandedSections[group.id] ? (
                      <ChevronDown className="h-3 w-3" />
                    ) : (
                      <ChevronRight className="h-3 w-3" />
                    )}
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent className="space-y-1 pl-3">
                    {group.items.map((item) => {
                      const IconComponent = item.icon;
                      return (
                        <Link key={item.href} href={item.href}>
                          <div
                            className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              isActiveRoute(item.href)
                                ? "text-white"
                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            }`}
                            style={isActiveRoute(item.href) ? {backgroundColor: '#5A2671'} : {}}
                            onClick={() => setSidebarOpen(false)}
                          >
                            <IconComponent className="h-5 w-5 flex-shrink-0" />
                            <span>{item.label}</span>
                          </div>
                        </Link>
                      );
                    })}
                  </CollapsibleContent>
                </Collapsible>
              </div>
            );
          })}
        </nav>

        {/* User Profile Section */}
        <div className="absolute bottom-0 w-full border-t border-gray-200 p-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start p-2">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.profileImageUrl || ""} />
                    <AvatarFallback>
                      {user?.firstName?.[0] || 'U'}{user?.lastName?.[0] || ''}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuItem>
                <Link href="/profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/settings">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Desktop Top Bar */}
      <header className="hidden lg:block bg-white border-b border-gray-200 ml-64">
        <div className="px-6">
          <div className="flex justify-between items-center h-16">
            {/* Search and Notifications */}
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Search className="h-4 w-4" />
              </Button>
              
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  1
                </span>
              </Button>
            </div>

            {/* Role Switcher and User Profile */}
            <div className="flex items-center space-x-4">
              <RoleSwitcher />
            </div>

            {/* User Profile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.profileImageUrl || ""} />
                    <AvatarFallback>
                      {user?.firstName?.[0] || 'U'}{user?.lastName?.[0] || ''}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="w-[200px] truncate text-sm text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <User className="mr-2 h-4 w-4" />
                    My Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
    </>
  );
}