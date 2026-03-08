import { Link, useLocation } from "react-router-dom";
import { Home, Search, PlusSquare, Bell, MessageSquare, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUnreadCount } from "@/hooks/use-notifications";

const navItems = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/search", icon: Search, label: "Search" },
  { to: "/compose", icon: PlusSquare, label: "Post" },
  { to: "/messages", icon: MessageSquare, label: "DMs" },
  { to: "/notifications", icon: Bell, label: "Alerts" },
];

export function BottomNav() {
  const { pathname } = useLocation();
  const { data: unreadCount = 0 } = useUnreadCount();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 border-t border-border bg-background/80 backdrop-blur-lg md:hidden">
      <div className="flex items-center justify-around h-14">
        {navItems.map(({ to, icon: Icon, label }) => {
          const active = pathname === to;
          const showBadge = to === "/notifications" && unreadCount > 0;
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1.5 transition-colors relative",
                active ? "text-accent" : "text-muted-foreground hover:text-foreground"
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
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
