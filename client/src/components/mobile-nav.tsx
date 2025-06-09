import { useLocation } from "wouter";
import { Home, Users, Calendar, Hand, User } from "lucide-react";
import { cn } from "@/lib/utils";

export default function MobileNav() {
  const [location] = useLocation();

  const navItems = [
    {
      icon: Home,
      label: "Home",
      path: "/",
      isActive: location === "/",
    },
    {
      icon: Users,
      label: "Community",
      path: "/community",
      isActive: location === "/community",
    },
    {
      icon: Calendar,
      label: "Events",
      path: "/events",
      isActive: location === "/events",
    },
    {
      icon: Hand,
      label: "Prayer",
      path: "/prayer",
      isActive: location === "/prayer",
    },
    {
      icon: User,
      label: "Profile",
      path: "/profile",
      isActive: location === "/profile",
    },
  ];

  const handleNavigation = (path: string) => {
    // For now, we'll just handle the home page since other routes aren't implemented yet
    if (path === "/") {
      window.location.href = "/";
    } else {
      // Show a toast or modal indicating the feature is coming soon
      // For demo purposes, we'll just log it
      console.log(`Navigation to ${path} - feature coming soon`);
    }
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-40">
      <div className="flex justify-around items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              className={cn(
                "flex flex-col items-center space-y-1 py-2 px-3 transition-colors rounded-lg",
                item.isActive
                  ? "text-faith-blue bg-light-blue"
                  : "text-gray-500 hover:text-faith-blue hover:bg-gray-50"
              )}
            >
              <Icon className="w-5 h-5" />
              <span 
                className={cn(
                  "text-xs transition-colors",
                  item.isActive ? "font-medium" : "font-normal"
                )}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
