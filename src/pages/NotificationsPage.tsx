import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications, useUnreadCount, markAllAsRead, markAsRead, Notification } from "@/hooks/use-notifications";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { Button } from "@/components/ui/button";
import { Bell, Heart, MessageCircle, UserPlus, UserCheck, CheckCheck, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

function formatNotifTime(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

const typeConfig: Record<string, { icon: typeof Heart; label: string; color: string }> = {
  like: { icon: Heart, label: "liked your post", color: "text-accent" },
  comment: { icon: MessageCircle, label: "commented on your post", color: "text-info" },
  follow: { icon: UserPlus, label: "started following you", color: "text-success" },
  follow_request: { icon: UserCheck, label: "requested to follow you", color: "text-warning" },
};

function NotificationItem({ notification, onClick }: { notification: Notification; onClick: () => void }) {
  const config = typeConfig[notification.type] || typeConfig.follow;
  const Icon = config.icon;
  const actorName = notification.actor_profile?.display_name || "Someone";

  return (
    <motion.button
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className={cn(
        "flex items-start gap-3 w-full text-start px-4 py-3 transition-colors hover:bg-muted/50",
        !notification.is_read && "bg-accent/5"
      )}
    >
      <div className="relative">
        <UserAvatar
          name={actorName}
          src={notification.actor_profile?.avatar_url}
          size="md"
        />
        <div className={cn("absolute -bottom-1 -end-1 h-5 w-5 rounded-full bg-background flex items-center justify-center", config.color)}>
          <Icon className="h-3 w-3" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-body-sm">
          <span className="font-semibold">{actorName}</span>{" "}
          <span className="text-muted-foreground">{config.label}</span>
        </p>
        <p className="text-body-xs text-muted-foreground mt-0.5">{formatNotifTime(notification.created_at)}</p>
      </div>
      {!notification.is_read && (
        <div className="mt-2 h-2 w-2 rounded-full bg-accent shrink-0" />
      )}
    </motion.button>
  );
}

const NotificationsPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: notifications = [], isLoading } = useNotifications();
  const { data: unreadCount = 0 } = useUnreadCount();

  const markAllMutation = useMutation({
    mutationFn: () => markAllAsRead(user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unread-count"] });
    },
  });

  const markOneMutation = useMutation({
    mutationFn: markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unread-count"] });
    },
  });

  return (
    <AppShell>
      <PageHeader
        title="Notifications"
        action={
          unreadCount > 0 ? (
            <Button
              variant="ghost"
              size="sm"
              className="text-accent gap-1.5"
              onClick={() => markAllMutation.mutate()}
              disabled={markAllMutation.isPending}
            >
              <CheckCheck className="h-4 w-4" />
              Mark all read
            </Button>
          ) : undefined
        }
      />
      <div className="max-w-2xl mx-auto">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : notifications.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="No notifications yet"
            description="When someone likes, comments, or follows you, it'll show up here."
          />
        ) : (
          <div className="divide-y divide-border">
            <AnimatePresence>
              {notifications.map((n) => (
                <NotificationItem
                  key={n.id}
                  notification={n}
                  onClick={() => {
                    if (!n.is_read) markOneMutation.mutate(n.id);
                  }}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default NotificationsPage;
