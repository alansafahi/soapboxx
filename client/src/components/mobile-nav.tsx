import { useLocation, Link } from "wouter";
import { Home, Users, Hand, BookOpen } from "lucide-react";
import { cn } from "../lib/utils";

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
      label: "Chat",
      path: "/community",
      isActive: location === "/community",
    },
    {
      icon: Hand,
      label: "Prayer",
      path: "/prayer",
      isActive: location === "/prayer",
    },
    {
      icon: BookOpen,
      label: "S.O.A.P.",
      path: "/soap",
      isActive: location === "/soap",
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-40">
      <div className="flex justify-around items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.path} href={item.path}>
              <button
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
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
