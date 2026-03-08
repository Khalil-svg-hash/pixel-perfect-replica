import { Link, useLocation } from "react-router-dom";
import { Home, Search, PlusSquare, Bell, User, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUnreadCount } from "@/hooks/use-notifications";

const mainNav = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/search", icon: Search, label: "Search" },
  { to: "/compose", icon: PlusSquare, label: "Create" },
  { to: "/notifications", icon: Bell, label: "Notifications" },
  { to: "/profile", icon: User, label: "Profile" },
];

const bottomNav = [
  { to: "/settings", icon: Settings, label: "Settings" },
];

export function DesktopSidebar() {
  const { pathname } = useLocation();
  const { data: unreadCount = 0 } = useUnreadCount();

  return (
    <aside className="hidden md:flex flex-col fixed inset-y-0 start-0 z-40 w-64 border-e border-border bg-sidebar">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 h-16">
        <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center">
          <span className="text-accent-foreground font-display font-bold text-sm">S</span>
        </div>
        <span className="font-display font-bold text-display-sm text-sidebar-foreground">Social</span>
      </div>

      {/* Main nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {mainNav.map(({ to, icon: Icon, label }) => {
          const active = pathname === to;
          const showBadge = to === "/notifications" && unreadCount > 0;
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-body-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <div className="relative">
                <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
                {showBadge && (
                  <span className="absolute -top-1.5 -end-1.5 h-4 min-w-4 px-1 rounded-full bg-accent text-accent-foreground text-[10px] font-bold flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </div>
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom nav */}
      <div className="px-3 py-4 border-t border-sidebar-border space-y-1">
        {bottomNav.map(({ to, icon: Icon, label }) => (
          <Link
            key={to}
            to={to}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-body-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors"
          >
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        ))}
      </div>
    </aside>
  );
}
