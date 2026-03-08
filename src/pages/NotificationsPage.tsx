import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Bell } from "lucide-react";

const NotificationsPage = () => {
  return (
    <AppShell>
      <PageHeader title="Notifications" />
      <div className="max-w-2xl mx-auto">
        <EmptyState
          icon={Bell}
          title="No notifications yet"
          description="When someone likes, comments, or follows you, it'll show up here."
        />
      </div>
    </AppShell>
  );
};

export default NotificationsPage;
