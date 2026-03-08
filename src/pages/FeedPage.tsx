import { AppShell } from "@/components/layout/AppShell";
import { FeedLayout } from "@/components/layout/FeedLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { PostCard, PostData } from "@/components/shared/PostCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { FeedSkeleton } from "@/components/shared/Skeletons";
import { Newspaper } from "lucide-react";
import { useState } from "react";

const mockPosts: PostData[] = [
  {
    id: "1",
    author: { name: "Sarah Chen", handle: "sarahc", avatarUrl: undefined },
    content: "Just shipped a new feature that I've been working on for weeks. The feeling of seeing it live is unmatched 🚀\n\n#buildinpublic #devlife",
    likes: 42,
    comments: 8,
    shares: 3,
    isLiked: true,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "2",
    author: { name: "Alex Rivera", handle: "alexr", avatarUrl: undefined },
    content: "Hot take: The best code is the code you delete. Removed 2,000 lines today and everything still works perfectly. Less is more.",
    likes: 128,
    comments: 24,
    shares: 15,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: "3",
    author: { name: "Maya Johnson", handle: "mayaj", avatarUrl: undefined },
    content: "Morning coffee + good music + clean codebase = productive Monday ☕️\n\nWhat's your ideal work setup?",
    likes: 67,
    comments: 31,
    shares: 2,
    isEdited: true,
    createdAt: new Date(Date.now() - 14400000).toISOString(),
  },
];

const FeedPage = () => {
  const [posts] = useState<PostData[]>(mockPosts);
  const isLoading = false;

  return (
    <AppShell>
      <PageHeader title="Home" />
      <FeedLayout
        sidebar={
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-card border border-border">
              <h3 className="font-display text-display-sm mb-3">Trending</h3>
              <div className="space-y-3">
                {["#buildinpublic", "#devlife", "#opensource"].map((tag) => (
                  <div key={tag} className="text-body-sm">
                    <span className="font-semibold text-accent">{tag}</span>
                    <p className="text-body-xs text-muted-foreground">{Math.floor(Math.random() * 500 + 100)} posts</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-card border border-border">
              <h3 className="font-display text-display-sm mb-3">Who to follow</h3>
              <p className="text-body-xs text-muted-foreground">Coming soon</p>
            </div>
          </div>
        }
      >
        {isLoading ? (
          <FeedSkeleton />
        ) : posts.length === 0 ? (
          <EmptyState
            icon={Newspaper}
            title="Your feed is empty"
            description="Follow people to see their posts here, or create your first post."
            action={{ label: "Create Post", onClick: () => {} }}
          />
        ) : (
          <div>
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </FeedLayout>
    </AppShell>
  );
};

export default FeedPage;
