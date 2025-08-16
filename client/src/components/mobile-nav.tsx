import { useLocation, Link } from "wouter";
import { cn } from "../lib/utils";
import { mobileBottomNavItems } from "../../../shared/navigation";

export default function MobileNav() {
  const [location] = useLocation();

  const navItems = mobileBottomNavItems.map(item => ({
    icon: item.icon,
    label: item.label,
    path: item.href,
    isActive: location === item.href,
  }));

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-4 py-2 z-40">
      <div className="flex justify-around items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.path} href={item.path}>
              <button
                className={cn(
                  "flex flex-col items-center space-y-1 py-2 px-3 transition-colors rounded-lg",
                  item.isActive
                    ? "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30"
                    : "text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gray-50 dark:hover:bg-gray-800"
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
