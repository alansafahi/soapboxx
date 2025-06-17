import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Home, 
  Users, 
  Calendar, 
  MessageSquare, 
  Heart, 
  Mail, 
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
  Sun,
  Moon,
  Monitor
} from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

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

export default function AppHeader() {
  const { user } = useAuth();
  const [location] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Get user role data
  const { data: userRole } = useQuery({
    queryKey: ["/api/auth/user-role"],
    enabled: !!user,
  });

  // Get available roles for role switching
  const { data: roleData } = useQuery({
    queryKey: ["/api/auth/available-roles"],
    enabled: !!user,
  });

  const navigationGroups: NavigationGroup[] = [
    {
      label: "Community",
      items: [
        { label: "Home", href: "/", icon: Home },
        { label: "Churches", href: "/churches", icon: Users },
        { label: "Events", href: "/events", icon: Calendar },
        { label: "Messages", href: "/messages", icon: MessageSquare },
        { label: "Prayer Wall", href: "/prayer", icon: Heart },
      ],
    },
    {
      label: "Spiritual Tools",
      items: [
        { label: "Today's Reading", href: "/bible", icon: BookOpen },
        { label: "S.O.A.P. Journal", href: "/soap", icon: PenTool },
        { label: "Audio Bible", href: "/audio-bible", icon: Play },
        { label: "Audio Routines", href: "/audio-routines", icon: Mic },
      ],
    },
    {
      label: "Media Contents",
      items: [
        { label: "Video Library", href: "/video-library", icon: Video },
      ],
    },
    {
      label: "Giving & Donations",
      items: [
        { label: "Give Now", href: "/donation-demo", icon: DollarSign },
      ],
    },
    {
      label: "Admin Portal",
      items: [
        { label: "Admin Dashboard", href: "/admin", icon: BarChart3, roles: ["admin", "church_admin", "system_admin", "super_admin", "pastor", "lead_pastor"] },
        { label: "Bulk Communication", href: "/communications", icon: Megaphone, roles: ["admin", "church_admin", "system_admin", "super_admin", "pastor", "lead_pastor"] },
        { label: "Sermon Studio", href: "/sermon-studio", icon: PenTool, roles: ["admin", "church_admin", "system_admin", "super_admin", "pastor", "lead_pastor"] },
        { label: "Content Distribution Hub", href: "/content-distribution", icon: Share2, roles: ["admin", "church_admin", "system_admin", "super_admin", "pastor", "lead_pastor"] },
        { label: "Engagement Analytics", href: "/engagement-analytics", icon: TrendingUp, roles: ["admin", "church_admin", "system_admin", "super_admin", "pastor", "lead_pastor"] },
        { label: "AI Content Showcase", href: "/pastoral-demo", icon: BarChart3, roles: ["admin", "church_admin", "system_admin", "super_admin", "pastor", "lead_pastor"] },
      ],
    },
  ];

  // Filter navigation items based on current active role
  const getVisibleGroups = () => {
    const currentRole = (roleData as any)?.currentRole || (userRole as any)?.role || '';
    
    return navigationGroups.map(group => ({
      ...group,
      items: group.items.filter(item => {
        if (!item.roles) return true;
        return item.roles.includes(currentRole);
      })
    })).filter(group => group.items.length > 0);
  };

  const visibleGroups = getVisibleGroups();

  const getUserInitials = () => {
    const firstName = (user as any)?.firstName || '';
    const lastName = (user as any)?.lastName || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'U';
  };

  const getUserEmail = () => {
    return (user as any)?.email || 'user@example.com';
  };

  if (!user) {
    return null;
  }

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                SoapBox Super App
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {visibleGroups.map((group) =>
              group.items.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.href;
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      size="sm"
                      className={`flex items-center space-x-2 ${
                        isActive 
                          ? "bg-purple-600 text-white hover:bg-purple-700" 
                          : "text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Button>
                  </Link>
                );
              })
            )}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={toggleTheme}>
                  <Sun className="mr-2 h-4 w-4" />
                  <span>Light</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={toggleTheme}>
                  <Moon className="mr-2 h-4 w-4" />
                  <span>Dark</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={toggleTheme}>
                  <Monitor className="mr-2 h-4 w-4" />
                  <span>System</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={(user as any)?.profileImageUrl || ""} />
                    <AvatarFallback className="bg-purple-600 text-white">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-3 py-2">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {getUserInitials()}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {getUserEmail()}
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center w-full">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex items-center w-full">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => window.location.href = '/login'}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}