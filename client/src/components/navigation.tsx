import { Bell, Heart, Menu, MessageCircle, Check, Moon, Sun } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/hooks/useTheme";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export default function Navigation() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Initialize notifications from localStorage or use defaults
  const getInitialNotifications = () => {
    try {
      const stored = localStorage.getItem('soapbox-notifications');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load notifications from localStorage:', error);
    }
    
    // Default notifications
    return [
      {
        id: 1,
        title: "New Prayer Request",
        message: "Sarah requested prayers for her family",
        time: "2 minutes ago",
        unread: true,
        type: "prayer",
        targetId: "2"
      },
      {
        id: 2,
        title: "Event Reminder",
        message: "Sunday service starts in 1 hour",
        time: "45 minutes ago",
        unread: true,
        type: "event",
        targetId: "1"
      },
      {
        id: 3,
        title: "New Message",
        message: "Pastor John sent you a message",
        time: "1 hour ago",
        unread: true,
        type: "message",
        targetId: "chat"
      }
    ];
  };

  const [notifications, setNotifications] = useState(getInitialNotifications);

  // Persist notifications to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('soapbox-notifications', JSON.stringify(notifications));
    } catch (error) {
      console.error('Failed to save notifications to localStorage:', error);
    }
  }, [notifications]);

  const handleNotificationClick = (notification: any) => {
    console.log('Notification clicked:', notification);
    
    // Close dropdown immediately
    setDropdownOpen(false);
    
    // Mark notification as read
    setNotifications(prev => 
      prev.map(n => n.id === notification.id ? {...n, unread: false} : n)
    );

    // Navigate based on notification type
    switch (notification.type) {
      case "prayer":
        // Scroll to prayer requests section
        setTimeout(() => {
          const prayerSection = document.getElementById('prayer-requests');
          if (prayerSection) {
            prayerSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 300);
        break;
      case "event":
        // Scroll to events section
        setTimeout(() => {
          const eventsSection = document.getElementById('events-list');
          if (eventsSection) {
            eventsSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 300);
        break;
      case "message":
        // Navigate to messages page
        window.location.href = '/chat';
        break;
      default:
        break;
    }

    toast({
      title: `📢 ${notification.title}`,
      description: "Navigating to content...",
      duration: 3000,
    });
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({...n, unread: false}))
    );
    toast({
      title: "Notifications",
      description: "All notifications marked as read",
    });
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-100 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
            <img 
              src="/src/assets/SoapBx logo_1749447146620.jpeg" 
              alt="SoapBox Super App" 
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl object-cover flex-shrink-0"
            />
            <span className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white whitespace-nowrap no-text-shadow">SoapBox Super App</span>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => {
                document.getElementById('community-feed')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-gray-700 hover:text-faith-blue transition-colors font-medium"
            >
              Community
            </button>
            <button 
              onClick={() => {
                document.getElementById('church-discovery')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-gray-700 hover:text-faith-blue transition-colors font-medium"
            >
              Churches
            </button>
            <button 
              onClick={() => {
                document.getElementById('events-list')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-gray-700 hover:text-faith-blue transition-colors font-medium"
            >
              Events
            </button>
            <button 
              onClick={() => {
                document.getElementById('prayer-requests')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-gray-700 hover:text-faith-blue transition-colors font-medium"
            >
              Prayer
            </button>
            <button 
              onClick={() => window.location.href = '/chat'}
              className="text-gray-700 hover:text-faith-blue transition-colors font-medium"
            >
              Messages
            </button>
            <button 
              onClick={() => window.location.href = '/admin'}
              className="text-gray-700 hover:text-faith-blue transition-colors font-medium"
            >
              Admin Portal
            </button>
          </nav>
          
          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {/* Notifications Dropdown */}
            <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="w-5 h-5" />
                  {notifications.filter(n => n.unread).length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {notifications.filter(n => n.unread).length}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <div className="flex items-center justify-between p-3 border-b">
                  <h3 className="font-semibold text-sm">Notifications</h3>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={markAllAsRead}
                    className="text-xs h-6 px-2"
                  >
                    <Check className="w-3 h-3 mr-1" />
                    Mark all read
                  </Button>
                </div>
                {notifications.filter(n => n.unread).length === 0 ? (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    No new notifications
                  </div>
                ) : (
                  notifications.filter(n => n.unread).map((notification) => (
                    <div
                      key={notification.id}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleNotificationClick(notification);
                      }}
                      className="p-3 flex flex-col items-start space-y-1 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-100 dark:border-gray-700"
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-medium text-sm">{notification.title}</span>
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-300 text-left">{notification.message}</span>
                      <span className="text-xs text-gray-400">{notification.time}</span>
                    </div>
                  ))
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => window.location.href = '/messages'}
                  className="p-3 text-center text-sm text-blue-600 hover:text-blue-700"
                >
                  View all messages
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="w-8 h-8"
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4" />
              ) : (
                <Sun className="w-4 h-4" />
              )}
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user?.profileImageUrl || ""} />
                  <AvatarFallback>
                    {user?.firstName?.[0] || user?.email?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => window.location.href = '/profile'}>
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.location.href = '/api/logout'}>
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
