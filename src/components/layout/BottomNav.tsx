import { Link, useLocation } from "react-router-dom";
import { Home, Search, PlusSquare, Bell, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUnreadCount } from "@/hooks/use-notifications";
import { motion } from "framer-motion";

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
    <nav className="fixed bottom-0 inset-x-0 z-50 glass border-t border-border/40 md:hidden safe-area-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {navItems.map(({ to, icon: Icon, label }) => {
          const active = pathname === to;
          const showBadge = to === "/notifications" && unreadCount > 0;
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "relative flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all duration-200",
                active ? "text-accent" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="relative">
                <Icon className={cn("h-5 w-5 transition-transform duration-200", active && "scale-110")} strokeWidth={active ? 2.5 : 1.8} />
                {showBadge && (
                  <span className="absolute -top-1 -end-1.5 h-3.5 min-w-3.5 px-0.5 rounded-full gradient-accent text-white text-[9px] font-bold flex items-center justify-center animate-pulse-soft">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </div>
              <span className={cn("text-[10px] font-medium transition-colors", active && "font-semibold")}>{label}</span>
              {active && (
                <motion.div
                  layoutId="bottom-nav-active"
                  className="absolute -bottom-0.5 h-0.5 w-5 rounded-full gradient-accent"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
