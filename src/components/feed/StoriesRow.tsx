import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface StoryUser {
  user_id: string;
  display_name: string | null;
  handle: string | null;
  avatar_url: string | null;
}

const GRADIENT_COLORS = [
  "from-accent to-accent-glow",
  "from-info to-accent",
  "from-success to-info",
  "from-warning to-accent",
  "from-accent-glow to-accent",
  "from-info to-success",
];

async function fetchStoryUsers(currentUserId: string): Promise<StoryUser[]> {
  // Fetch users the current user follows
  const { data: following, error: followError } = await supabase
    .from("follows")
    .select("profiles!follows_following_id_fkey(user_id, display_name, handle, avatar_url)")
    .eq("follower_id", currentUserId)
    .eq("status", "accepted")
    .limit(20);

  if (followError) throw followError;

  const followedUsers = (following || [])
    .map((f: any) => f.profiles)
    .filter(Boolean) as StoryUser[];

  // If not enough followed users, also fetch some recent active users
  if (followedUsers.length < 6) {
    const existingIds = [currentUserId, ...followedUsers.map(u => u.user_id)];
    const { data: recentProfiles } = await supabase
      .from("profiles")
      .select("user_id, display_name, handle, avatar_url")
      .not("user_id", "in", `(${existingIds.join(",")})`)
      .limit(10 - followedUsers.length);

    if (recentProfiles) {
      followedUsers.push(...(recentProfiles as StoryUser[]));
    }
  }

  return followedUsers.slice(0, 10);
}

export function StoriesRow() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const { data: storyUsers = [] } = useQuery({
    queryKey: ["story-users", user?.id],
    queryFn: () => fetchStoryUsers(user!.id),
    enabled: !!user?.id,
  });

  return (
    <div className="border-b border-border/40 py-4 px-4 overflow-x-auto scrollbar-none">
      <div className="flex gap-4">
        {/* Current user - "Add" story */}
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="flex flex-col items-center gap-1.5 shrink-0"
          onClick={() => navigate("/compose")}
        >
          <div className="w-14 h-14 rounded-full border-2 border-dashed border-border relative">
            <div className="w-full h-full rounded-full overflow-hidden">
              <UserAvatar
                src={profile?.avatar_url}
                name={profile?.display_name || "You"}
                size="lg"
                className="w-full h-full"
              />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full gradient-accent flex items-center justify-center border-2 border-card">
              <Plus className="h-3 w-3 text-accent-foreground" />
            </div>
          </div>
          <span className="text-[11px] text-muted-foreground truncate w-14 text-center">
            You
          </span>
        </motion.button>

        {/* Followed / suggested users */}
        {storyUsers.map((storyUser, i) => (
          <motion.button
            key={storyUser.user_id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: (i + 1) * 0.05, type: "spring", stiffness: 300 }}
            className="flex flex-col items-center gap-1.5 shrink-0"
            onClick={() => navigate(`/profile/${storyUser.handle}`)}
          >
            <div
              className={cn(
                "w-14 h-14 rounded-full p-[2.5px] bg-gradient-to-br",
                GRADIENT_COLORS[i % GRADIENT_COLORS.length]
              )}
            >
              <div className="w-full h-full rounded-full bg-card overflow-hidden">
                <UserAvatar
                  src={storyUser.avatar_url}
                  name={storyUser.display_name || "User"}
                  size="lg"
                  className="w-full h-full"
                />
              </div>
            </div>
            <span className="text-[11px] text-muted-foreground truncate w-14 text-center">
              {storyUser.display_name || storyUser.handle || "User"}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
