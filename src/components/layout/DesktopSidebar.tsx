import { Link, useLocation } from "react-router-dom";
import { Home, Search, PlusSquare, Bell, MessageSquare, User, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUnreadCount } from "@/hooks/use-notifications";
import { useAuth } from "@/contexts/AuthContext";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { motion } from "framer-motion";

const mainNav = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/search", icon: Search, label: "Search" },
  { to: "/compose", icon: PlusSquare, label: "Create" },
  { to: "/messages", icon: MessageSquare, label: "Messages" },
  { to: "/notifications", icon: Bell, label: "Notifications" },
  { to: "/profile", icon: User, label: "Profile" },
];

const bottomNav = [
  { to: "/settings", icon: Settings, label: "Settings" },
];

export function DesktopSidebar() {
  const { pathname } = useLocation();
  const { data: unreadCount = 0 } = useUnreadCount();
  const { profile, signOut } = useAuth();

  return (
    <aside className="hidden md:flex flex-col fixed inset-y-0 start-0 z-40 w-[272px] bg-sidebar border-e border-sidebar-border/50">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-6 h-[72px]">
        <motion.div
          className="h-9 w-9 rounded-xl gradient-accent flex items-center justify-center shadow-glow"
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
        >
          <span className="text-white font-display font-bold text-sm">C</span>
        </motion.div>
        <span className="font-display font-bold text-display-sm text-sidebar-foreground">Cluster</span>
      </div>

      {/* Main nav */}
      <nav className="flex-1 px-3 py-2 space-y-0.5">
        {mainNav.map(({ to, icon: Icon, label }) => {
          const active = pathname === to || (to !== "/" && pathname.startsWith(to));
          const showBadge = to === "/notifications" && unreadCount > 0;
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-body-sm font-medium transition-all duration-200",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
              )}
            >
              {/* Active indicator pill */}
              {active && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-xl bg-sidebar-accent"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <div className="relative z-10 flex items-center gap-3">
                <div className="relative">
                  <Icon
                    className={cn("h-[18px] w-[18px] transition-all duration-200", active && "text-accent")}
                    strokeWidth={active ? 2.5 : 1.8}
                  />
                  {showBadge && (
                    <span className="absolute -top-1.5 -end-1.5 h-4 min-w-4 px-1 rounded-full gradient-accent text-white text-[10px] font-bold flex items-center justify-center shadow-glow animate-pulse-soft">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </div>
                <span className="relative z-10">{label}</span>
              </div>
              {active && (
                <div className="ms-auto h-1.5 w-1.5 rounded-full bg-accent relative z-10" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="px-3 py-4 border-t border-sidebar-border/50 space-y-1">
        {bottomNav.map(({ to, icon: Icon, label }) => (
          <Link
            key={to}
            to={to}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-body-sm font-medium text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-all duration-200"
          >
            <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
            {label}
          </Link>
        ))}

        {/* User profile card */}
        {profile && (
          <motion.div
            className="flex items-center gap-3 px-3 py-2.5 mt-2 rounded-xl bg-sidebar-accent/30 hover:bg-sidebar-accent/50 transition-colors duration-200 cursor-default"
            whileHover={{ scale: 1.01 }}
          >
            <UserAvatar name={profile.display_name || "You"} src={profile.avatar_url} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-body-xs font-semibold text-sidebar-foreground truncate">{profile.display_name}</p>
              <p className="text-[11px] text-sidebar-foreground/50 truncate">@{profile.handle}</p>
            </div>
            <button
              onClick={() => signOut()}
              className="text-sidebar-foreground/40 hover:text-accent transition-colors"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </div>
    </aside>
  );
}
