import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "../hooks/useAuth";
import { Button } from "./ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import {
  Home,
  Calendar,
  Users,
  Heart,
  MessageSquare,
  Book,
  Settings,
  LogOut,
  Menu,
  Church,
  UserCheck,
  Gamepad2,
  Shield,
  Bell,
  Search,
} from "lucide-react";

export default function Header() {
  const { user, isAuthenticated } = useAuth();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigationItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/events", label: "Events", icon: Calendar },
    { href: "/prayers", label: "Prayers", icon: Heart },
    { href: "/topics", label: "Topics", icon: MessageSquare },
    { href: "/devotionals", label: "Devotionals", icon: Book },
    { href: "/members", label: "Members", icon: Users },
    { href: "/communities", label: "Communities", icon: Church },
    { href: "/gamification", label: "Rewards", icon: Gamepad2 },
  ];

  const adminItems = [
    { href: "/admin", label: "Admin Panel", icon: Shield },
    { href: "/member-management", label: "Member Management", icon: UserCheck },
  ];

  const isActiveRoute = (href: string) => {
    if (href === "/") {
      return location === "/";
    }
    return location.startsWith(href);
  };

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  if (!isAuthenticated) {
    return (
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Church className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-bold text-gray-900">Church Community</h1>
            </div>
            <Button onClick={() => window.location.href = "/api/login"}>
              Sign In
            </Button>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href="/">
              <div className="flex items-center cursor-pointer">
                <Church className="w-8 h-8 text-blue-600 mr-3" />
                <h1 className="text-xl font-bold text-gray-900">Church Community</h1>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActiveRoute(item.href);
              
              return (
                <Link key={item.href} href={item.href}>
                  <div
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Right side items */}
          <div className="flex items-center space-x-4">
            {/* Search Button */}
            <Button variant="ghost" size="sm" className="hidden md:flex">
              <Search className="w-4 h-4" />
            </Button>

            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                3
              </span>
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.profileImageUrl} alt={user?.firstName || "User"} />
                    <AvatarFallback>
                      {user?.firstName?.charAt(0) || user?.email?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex flex-col space-y-1 p-2">
                  <p className="text-sm font-medium leading-none">
                    {user?.firstName || "User"}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
                <DropdownMenuSeparator />
                
                {/* Admin Items (if user has admin access) */}
                {adminItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link href={item.href}>
                        <div className="flex items-center">
                          <Icon className="w-4 h-4 mr-2" />
                          {item.label}
                        </div>
                      </Link>
                    </DropdownMenuItem>
                  );
                })}
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <div className="flex items-center">
                      <Settings className="w-4 h-4 mr-2" />
                      Profile Settings
                    </div>
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu */}
            <div className="md:hidden">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80">
                  <SheetHeader>
                    <SheetTitle className="flex items-center">
                      <Church className="w-6 h-6 text-blue-600 mr-2" />
                      Church Community
                    </SheetTitle>
                    <SheetDescription>
                      Navigate to different sections of the platform
                    </SheetDescription>
                  </SheetHeader>
                  
                  <div className="mt-6">
                    <nav className="space-y-2">
                      {navigationItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = isActiveRoute(item.href);
                        
                        return (
                          <Link key={item.href} href={item.href}>
                            <div
                              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                isActive
                                  ? "bg-blue-100 text-blue-700"
                                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                              }`}
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              <Icon className="w-4 h-4 mr-3" />
                              {item.label}
                            </div>
                          </Link>
                        );
                      })}
                      
                      <div className="border-t pt-4 mt-4">
                        {adminItems.map((item) => {
                          const Icon = item.icon;
                          return (
                            <Link key={item.href} href={item.href}>
                              <div
                                className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                                onClick={() => setMobileMenuOpen(false)}
                              >
                                <Icon className="w-4 h-4 mr-3" />
                                {item.label}
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                      
                      <div className="border-t pt-4 mt-4">
                        <Link href="/profile">
                          <div
                            className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <Settings className="w-4 h-4 mr-3" />
                            Profile Settings
                          </div>
                        </Link>
                        
                        <div
                          className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors cursor-pointer"
                          onClick={() => {
                            setMobileMenuOpen(false);
                            handleLogout();
                          }}
                        >
                          <LogOut className="w-4 h-4 mr-3" />
                          Sign Out
                        </div>
                      </div>
                    </nav>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}