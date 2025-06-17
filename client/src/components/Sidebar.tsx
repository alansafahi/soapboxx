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
  Monitor
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
      label: "COMMUNITY",
      items: [
        { label: "Home", href: "/", icon: Home },
        { label: "Churches", href: "/churches", icon: Users },
        { label: "Events", href: "/events", icon: Calendar },
        { label: "Messages", href: "/messages", icon: MessageSquare },
        { label: "Prayer Wall", href: "/prayer", icon: Heart },
      ],
    },
    {
      label: "SPIRITUAL TOOLS",
      items: [
        { label: "Today's Reading", href: "/bible", icon: BookOpen },
        { label: "S.O.A.P. Journal", href: "/soap", icon: PenTool },
        { label: "Audio Bible", href: "/audio-bible", icon: Play },
        { label: "Audio Routines", href: "/audio-routines", icon: Mic },
      ],
    },
    {
      label: "MEDIA CONTENTS",
      items: [
        { label: "Video Library", href: "/video-library", icon: Video },
      ],
    },
    {
      label: "GIVING & DONATIONS",
      items: [
        { label: "Give Now", href: "/donation-demo", icon: DollarSign },
      ],
    },
    {
      label: "ADMIN PORTAL",
      items: [
        { label: "Admin Dashboard", href: "/admin", icon: BarChart3, roles: ["admin", "church_admin", "system_admin", "super_admin", "pastor", "lead_pastor"] },
        { label: "Bulk Communication", href: "/communications", icon: Megaphone, roles: ["admin", "church_admin", "system_admin", "super_admin", "pastor", "lead_pastor"] },
        { label: "Sermon Studio", href: "/sermon-studio", icon: PenTool, roles: ["admin", "church_admin", "system_admin", "super_admin", "pastor", "lead_pastor"] },
        { label: "Content Distribution Hub", href: "/content-distribution", icon: Share2, roles: ["admin", "church_admin", "system_admin", "super_admin", "pastor", "lead_pastor"] },
        { label: "Engagement Analytics", href: "/engagement-analytics", icon: TrendingUp, roles: ["admin", "church_admin", "system_admin", "super_admin", "pastor", "lead_pastor"] },
        { label: "AI Content Showcase", href: "/pastoral-demo", icon: BarChart3, roles: ["admin", "church_admin", "system_admin", "super_admin", "pastor", "lead_pastor"] },
      ],
    },
    {
      label: "ACCOUNT",
      items: [
        { label: "Profile", href: "/profile", icon: User },
        { label: "Settings", href: "/settings", icon: Settings },
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

  if (!user) {
    return null;
  }

  return (
    <div className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 h-screen overflow-y-auto flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
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
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
        {visibleGroups.map((group) => {
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
        })}
      </nav>

      {/* User Profile Section */}
      <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm font-medium">
              {(user as any)?.firstName?.[0] || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {(user as any)?.firstName || 'User'}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {(userRole as any)?.role || 'Member'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}