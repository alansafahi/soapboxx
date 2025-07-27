import { Bell, Moon, Sun, User, Check, X, Calendar, MessageSquare, Heart, Menu, Home, Users, BookOpen, Play, Mic, Video, BarChart3, Settings, UserPlus, DollarSign, Megaphone, Share2, TrendingUp, Shield, PenTool, Image, Sparkles, Building2 } from "lucide-react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useTheme } from "../hooks/useTheme";
import { useImmediateAuth } from "../lib/immediateAuth";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "../hooks/use-toast";
import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Badge } from "./ui/badge";

interface User {
  id?: string;
  name?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
}

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
}

export default function TopHeader() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useImmediateAuth();
  const { toast } = useToast();
  
  // Fetch complete user profile data with profile image
  const { data: profileUser } = useQuery({
    queryKey: ["/api/auth/user"],
    enabled: !!user,
  });
  
  // Use profile data if available, fallback to session user data
  const typedUser = (profileUser || user) as any;
  
  // Get user initials for fallback
  const getUserInitials = () => {
    const firstName = typedUser?.firstName || '';
    const lastName = typedUser?.lastName || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'U';
  };

  // Get user role data for permission checking
  const { data: userRole } = useQuery({
    queryKey: ["/api/auth/user-role"],
    enabled: !!user,
  });

  // Local state for immediate UI feedback with notifications
  const [localNotifications, setLocalNotifications] = useState<Notification[]>([]);

  // Fetch notifications from server and staff invitations
  const { data: serverNotifications = [] } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
    enabled: !!user,
  });

  // Fetch pending staff invitations for current user
  const { data: staffInvitations = [] } = useQuery({
    queryKey: ["/api/auth/pending-staff-invitations"],
    enabled: !!user,
  });

  // Update local state when server data changes
  useEffect(() => {
    if (Array.isArray(serverNotifications) && serverNotifications.length > 0) {
      setLocalNotifications(serverNotifications);
    }
  }, [serverNotifications]);

  // Convert staff invitations to notifications format
  const staffNotifications = (staffInvitations || []).map((invitation: any) => ({
    id: `staff-${invitation.communityId}-${invitation.role}`,
    type: 'staff_invitation',
    title: `Staff Invitation: ${invitation.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}`,
    message: `You've been invited to join ${invitation.communityName} as a ${invitation.role.replace('_', ' ')}. Click to accept your position.`,
    isRead: false,
    createdAt: new Date().toISOString(),
    actionUrl: `/signup?invite=staff&community=${invitation.communityId}&role=${invitation.role}`
  }));

  // Combine regular notifications with staff invitations
  const allNotifications = [
    ...staffNotifications,
    ...(Array.isArray(localNotifications) && localNotifications.length > 0 
      ? localNotifications 
      : Array.isArray(serverNotifications) ? serverNotifications : [])
  ];

  // Use combined notifications for display
  const notifications = allNotifications;

  // Mark notification as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: number) => 
      apiRequest("POST", `/api/notifications/${notificationId}/read`),
    onMutate: (notificationId) => {
      // Immediate local state update for instant UI feedback
      setLocalNotifications(prev => {
        const updated = (prev || []).map(notification => 
          notification.id === notificationId 
            ? { ...notification, isRead: true }
            : notification
        );
        return updated;
      });
    },
    onError: () => {
      // Rollback local state on error - restore from server data
      setLocalNotifications(serverNotifications);
    },
    onSuccess: () => {
      // Refresh server data in background
      queryClient.refetchQueries({ queryKey: ["/api/notifications"] });
      toast({
        title: "Notification marked as read",
      });
    },
  });

  // Mark all notifications as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: () => 
      apiRequest("POST", "/api/notifications/mark-all-read"),
    onMutate: () => {
      // Immediate local state update for instant UI feedback
      setLocalNotifications(prev => {
        const updated = (prev || []).map(notification => ({ ...notification, isRead: true }));
        return updated;
      });
    },
    onError: () => {
      // Rollback local state on error
      setLocalNotifications(serverNotifications);
    },
    onSuccess: () => {
      // Refresh server data in background
      queryClient.refetchQueries({ queryKey: ["/api/notifications"] });
      toast({
        title: "All notifications marked as read",
      });
    },
  });

  // Calculate unread count from current notifications with null safety
  const unreadCount = (notifications || []).filter(n => !n.isRead).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'prayer':
        return <Heart className="h-4 w-4 text-red-500" />;
      case 'event':
        return <Calendar className="h-4 w-4 text-blue-500" />;
      case 'message':
        return <MessageSquare className="h-4 w-4 text-green-500" />;
      case 'staff_invitation':
        return <UserPlus className="h-4 w-4 text-purple-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };



  return (
    <header className="flex items-center justify-between gap-2 p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      {/* Mobile Navigation Menu */}
      <div className="md:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64 max-h-96 overflow-y-auto">
            {/* Community Section */}
            <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Community
            </div>
            <Link href="/">
              <DropdownMenuItem className="cursor-pointer">
                <Home className="w-4 h-4 mr-2" />
                Home
              </DropdownMenuItem>
            </Link>
            <Link href="/messages">
              <DropdownMenuItem className="cursor-pointer">
                <MessageSquare className="w-4 h-4 mr-2" />
                Messages
              </DropdownMenuItem>
            </Link>
            <Link href="/contacts">
              <DropdownMenuItem className="cursor-pointer">
                <UserPlus className="w-4 h-4 mr-2" />
                Contacts
              </DropdownMenuItem>
            </Link>
            <Link href="/churches">
              <DropdownMenuItem className="cursor-pointer">
                <Users className="w-4 h-4 mr-2" />
                Churches
              </DropdownMenuItem>
            </Link>
            <Link href="/events">
              <DropdownMenuItem className="cursor-pointer">
                <Calendar className="w-4 h-4 mr-2" />
                Events
              </DropdownMenuItem>
            </Link>
            <Link href="/discussions">
              <DropdownMenuItem className="cursor-pointer">
                <MessageSquare className="w-4 h-4 mr-2" />
                Discussions
              </DropdownMenuItem>
            </Link>
            <Link href="/sms-giving">
              <DropdownMenuItem className="cursor-pointer">
                <DollarSign className="w-4 h-4 mr-2" />
                Donation
              </DropdownMenuItem>
            </Link>
            
            <DropdownMenuSeparator />
            
            {/* Spiritual Tools Section */}
            <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Spiritual Tools
            </div>
            <Link href="/bible">
              <DropdownMenuItem className="cursor-pointer">
                <BookOpen className="w-4 h-4 mr-2" />
                Today's Reading
              </DropdownMenuItem>
            </Link>
            <Link href="/prayer-wall">
              <DropdownMenuItem className="cursor-pointer">
                <Heart className="w-4 h-4 mr-2" />
                Prayer Wall
              </DropdownMenuItem>
            </Link>
            <Link href="/soap">
              <DropdownMenuItem className="cursor-pointer">
                <PenTool className="w-4 h-4 mr-2" />
                S.O.A.P. Journal
              </DropdownMenuItem>
            </Link>
            <Link href="/divine">
              <DropdownMenuItem className="cursor-pointer">
                <Sparkles className="w-4 h-4 mr-2" />
                D.I.V.I.N.E.
              </DropdownMenuItem>
            </Link>
            <Link href="/audio-bible">
              <DropdownMenuItem className="cursor-pointer">
                <Play className="w-4 h-4 mr-2" />
                Audio Bible
              </DropdownMenuItem>
            </Link>
            <Link href="/audio-routines">
              <DropdownMenuItem className="cursor-pointer">
                <Mic className="w-4 h-4 mr-2" />
                Audio Routines
              </DropdownMenuItem>
            </Link>
            
            <DropdownMenuSeparator />
            
            {/* Media Contents Section */}
            <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Media Contents
            </div>
            <Link href="/video-library">
              <DropdownMenuItem className="cursor-pointer">
                <Video className="w-4 h-4 mr-2" />
                Video Library
              </DropdownMenuItem>
            </Link>
            <Link href="/image-gallery">
              <DropdownMenuItem className="cursor-pointer">
                <Image className="w-4 h-4 mr-2" />
                Image Gallery
              </DropdownMenuItem>
            </Link>
            
            {/* Admin Portal Section - Only show for admin users */}
            {user && ['admin', 'church-admin', 'system-admin', 'super-admin', 'pastor', 'lead-pastor', 'soapbox_owner', 'soapbox-support', 'platform-admin', 'regional-admin'].includes((user as any)?.role) && (
              <>
                <DropdownMenuSeparator />
                <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Admin Portal
                </div>
                <Link href="/admin">
                  <DropdownMenuItem className="cursor-pointer">
                    <Building2 className="w-4 h-4 mr-2" />
                    Church Administration
                  </DropdownMenuItem>
                </Link>
                <Link href="/donation-analytics">
                  <DropdownMenuItem className="cursor-pointer">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Donation Analytics
                  </DropdownMenuItem>
                </Link>
                <Link href="/communication">
                  <DropdownMenuItem className="cursor-pointer">
                    <Megaphone className="w-4 h-4 mr-2" />
                    Communication Hub
                  </DropdownMenuItem>
                </Link>
                <Link href="/sermon-studio">
                  <DropdownMenuItem className="cursor-pointer">
                    <PenTool className="w-4 h-4 mr-2" />
                    Sermon Studio
                  </DropdownMenuItem>
                </Link>
                <Link href="/engagement-analytics">
                  <DropdownMenuItem className="cursor-pointer">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Engagement Analytics
                  </DropdownMenuItem>
                </Link>

              </>
            )}
            
            {/* SoapBox Portal Section - Only show for soapbox_owner */}
            {user && (user as any)?.role === 'soapbox_owner' && (
              <>
                <DropdownMenuSeparator />
                <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  SoapBox Portal
                </div>
                <Link href="/admin">
                  <DropdownMenuItem className="cursor-pointer">
                    <Settings className="w-4 h-4 mr-2" />
                    Church Management
                  </DropdownMenuItem>
                </Link>
              </>
            )}
            
            <DropdownMenuSeparator />
            
            {/* Account Section */}
            <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Account
            </div>
            <Link href="/profile">
              <DropdownMenuItem className="cursor-pointer">
                <User className="w-4 h-4 mr-2" />
                Profile
              </DropdownMenuItem>
            </Link>
            <Link href="/settings">
              <DropdownMenuItem className="cursor-pointer">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
            </Link>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Right side navigation */}
      <div className="flex items-center gap-2">
        {/* Alert/Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between p-3 border-b">
              <h3 className="font-semibold">Notifications</h3>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => markAllAsReadMutation.mutate()}
                  disabled={markAllAsReadMutation.isPending}
                >
                  Mark all read
                </Button>
              )}
            </div>
            
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                No notifications yet
              </div>
            ) : (
              <div className="max-h-64 overflow-y-auto">
                {notifications.slice(0, 10).map((notification) => (
                  <DropdownMenuItem
                    key={notification.id}
                    className={`p-3 cursor-pointer ${!notification.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                    onClick={() => {
                      if (!notification.isRead) {
                        markAsReadMutation.mutate(notification.id);
                      }
                      
                      if (notification.actionUrl) {
                        window.location.href = notification.actionUrl;
                      } else {
                        // Fallback navigation for content edit requests
                        if (notification.type === 'content_edit_request') {
                          window.location.href = '/community';
                        }
                      }
                    }}
                  >
                    <div className="flex items-start gap-3">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{notification.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          {new Date(notification.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                      )}
                    </div>
                  </DropdownMenuItem>
                ))}
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="transition-colors"
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-12 w-12 rounded-full p-0">
              <div className="h-10 w-10 rounded-full bg-purple-600 flex items-center justify-center text-white text-sm font-semibold relative overflow-hidden">
                {typedUser?.profileImageUrl ? (
                  <img 
                    src={typedUser.profileImageUrl} 
                    alt="Profile"
                    className="absolute inset-0 h-full w-full object-cover"
                    style={{ zIndex: 10 }}
                    onLoad={() => {}}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : null}
                <span style={{ zIndex: 5 }}>{getUserInitials()}</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5 text-sm font-medium">
              {typedUser?.firstName && typedUser?.lastName ? `${typedUser.firstName} ${typedUser.lastName}` : "User"}
            </div>
            <div className="px-2 py-1.5 text-xs text-gray-500 dark:text-gray-400">
              {typedUser?.email}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile">
                <User className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings">
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}