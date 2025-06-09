import { Bell, Heart, Menu } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navigation() {
  const { user } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-faith-blue rounded-xl flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">Soapbox</span>
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
              onClick={() => window.location.href = '/admin'}
              className="text-gray-700 hover:text-faith-blue transition-colors font-medium"
            >
              Admin Portal
            </button>
          </nav>
          
          {/* User Actions */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                3
              </span>
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
