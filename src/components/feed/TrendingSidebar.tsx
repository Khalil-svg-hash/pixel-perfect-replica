import { GlowCard } from "@/components/ui/glow-card";
import { AnimatedBadge } from "@/components/ui/animated-badge";
import { TrendingUp, Users, Flame, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { Button } from "@/components/ui/button";

const TRENDING_TOPICS = [
  { tag: "#buildinpublic", posts: 1247, category: "Tech" },
  { tag: "#devlife", posts: 892, category: "Lifestyle" },
  { tag: "#opensource", posts: 634, category: "Tech" },
  { tag: "#designsystems", posts: 421, category: "Design" },
  { tag: "#startup", posts: 318, category: "Business" },
];

const SUGGESTED_USERS = [
  { name: "Elena Rivera", handle: "elena_dev", bio: "Building cool stuff 🚀" },
  { name: "Marcus Chen", handle: "marcusc", bio: "Open source enthusiast" },
  { name: "Aria Johnson", handle: "ariaj", bio: "Designer × Developer" },
];

export function TrendingSidebar() {
  return (
    <div className="space-y-5">
      {/* Trending Topics */}
      <GlowCard>
        <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Flame className="h-4 w-4 text-accent" />
            <h3 className="font-display text-display-sm">Trending</h3>
          </div>
          <div className="space-y-3.5">
            {TRENDING_TOPICS.map((topic, i) => (
              <motion.button
                key={topic.tag}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="w-full text-start group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-body-xs text-muted-foreground/60">
                      {topic.category} · Trending
                    </p>
                    <p className="font-semibold text-body-sm group-hover:text-accent transition-colors">
                      {topic.tag}
                    </p>
                    <p className="text-body-xs text-muted-foreground/50 mt-0.5">
                      {topic.posts.toLocaleString()} posts
                    </p>
                  </div>
                  <TrendingUp className="h-3.5 w-3.5 text-success mt-1 opacity-60" />
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </GlowCard>

      {/* Suggested Users */}
      <GlowCard>
        <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-4 w-4 text-info" />
            <h3 className="font-display text-display-sm">Who to follow</h3>
          </div>
          <div className="space-y-4">
            {SUGGESTED_USERS.map((user, i) => (
              <motion.div
                key={user.handle}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.08 }}
                className="flex items-center gap-3"
              >
                <UserAvatar name={user.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-body-sm font-semibold truncate">{user.name}</p>
                  <p className="text-body-xs text-muted-foreground/60 truncate">
                    @{user.handle}
                  </p>
                </div>
                <Button
                  size="sm"
                  className="h-7 px-3.5 text-xs rounded-full gradient-accent text-accent-foreground hover:opacity-90 shadow-sm"
                >
                  Follow
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </GlowCard>

      {/* Quick Stats */}
      <GlowCard>
        <div className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-warning" />
            <h3 className="font-display text-display-sm">Today</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "New posts", value: "2.4k", color: "text-accent" },
              { label: "Active users", value: "891", color: "text-info" },
              { label: "Comments", value: "5.1k", color: "text-success" },
              { label: "Reactions", value: "12k", color: "text-warning" },
            ].map((stat) => (
              <div key={stat.label} className="text-center p-2 rounded-xl bg-muted/30">
                <p className={`font-display font-bold text-lg ${stat.color}`}>
                  {stat.value}
                </p>
                <p className="text-body-xs text-muted-foreground/50">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </GlowCard>

      {/* Footer */}
      <div className="px-2 text-body-xs text-muted-foreground/30 space-x-2">
        <span>Terms</span>
        <span>·</span>
        <span>Privacy</span>
        <span>·</span>
        <span>About</span>
        <span>·</span>
        <span>© 2026 Cluster</span>
      </div>
    </div>
  );
}
