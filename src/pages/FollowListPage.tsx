import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getFollowers, getFollowing, FollowUser } from "@/lib/social";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { EmptyState } from "@/components/shared/EmptyState";
import { Users } from "lucide-react";
import { cn } from "@/lib/utils";

const FollowListPage = () => {
  const { userId } = useParams<{ userId: string }>();
  const [tab, setTab] = useState<"followers" | "following">(
    window.location.pathname.includes("following") ? "following" : "followers"
  );
  const { user } = useAuth();
  const targetId = userId || user?.id;

  const { data: followers = [], isLoading: loadingFollowers } = useQuery({
    queryKey: ["followers", targetId],
    queryFn: () => getFollowers(targetId!),
    enabled: !!targetId && tab === "followers",
  });

  const { data: following = [], isLoading: loadingFollowing } = useQuery({
    queryKey: ["following", targetId],
    queryFn: () => getFollowing(targetId!),
    enabled: !!targetId && tab === "following",
  });

  const list = tab === "followers" ? followers : following;
  const isLoading = tab === "followers" ? loadingFollowers : loadingFollowing;

  return (
    <AppShell>
      <PageHeader title={tab === "followers" ? "Followers" : "Following"} />
      <div className="max-w-2xl mx-auto">
        {/* Tabs */}
        <div className="flex border-b border-border">
          <button
            className={cn(
              "flex-1 py-3 text-body-sm font-semibold text-center transition-colors",
              tab === "followers" ? "border-b-2 border-accent text-accent" : "text-muted-foreground"
            )}
            onClick={() => setTab("followers")}
          >
            Followers
          </button>
          <button
            className={cn(
              "flex-1 py-3 text-body-sm font-semibold text-center transition-colors",
              tab === "following" ? "border-b-2 border-accent text-accent" : "text-muted-foreground"
            )}
            onClick={() => setTab("following")}
          >
            Following
          </button>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-body-sm text-muted-foreground">Loading…</div>
        ) : list.length === 0 ? (
          <EmptyState
            icon={Users}
            title={tab === "followers" ? "No followers yet" : "Not following anyone"}
            description={
              tab === "followers"
                ? "When people follow this account, they'll show up here."
                : "When this account follows people, they'll show up here."
            }
          />
        ) : (
          <div>
            {list.map((u: FollowUser) => (
              <Link
                key={u.user_id}
                to={`/profile/${u.handle}`}
                className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors"
              >
                <UserAvatar name={u.display_name || "User"} src={u.avatar_url} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="text-body-sm font-semibold truncate">{u.display_name}</p>
                  <p className="text-body-xs text-muted-foreground truncate">@{u.handle}</p>
                  {u.bio && <p className="text-body-xs text-muted-foreground mt-0.5 line-clamp-1">{u.bio}</p>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default FollowListPage;
