import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchFeedPosts, toggleLike, deletePost } from "@/lib/posts";
import { useAuth } from "@/contexts/AuthContext";
import { AppShell } from "@/components/layout/AppShell";
import { FeedLayout } from "@/components/layout/FeedLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { PostCard } from "@/components/shared/PostCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { FeedSkeleton } from "@/components/shared/Skeletons";
import { ComposePrompt } from "@/components/feed/ComposePrompt";
import { StoriesRow } from "@/components/feed/StoriesRow";
import { TrendingSidebar } from "@/components/feed/TrendingSidebar";
import { Newspaper, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useRef, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { AnimatedBadge } from "@/components/ui/animated-badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

const FeedPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [feedTab, setFeedTab] = useState("foryou");

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["feed"],
    queryFn: ({ pageParam = 0 }) => fetchFeedPosts(pageParam),
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === 10 ? allPages.length : undefined;
    },
    initialPageParam: 0,
  });

  const likeMutation = useMutation({
    mutationFn: ({ postId, isLiked }: { postId: string; isLiked: boolean }) =>
      toggleLike(postId, user!.id, isLiked),
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deletePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      toast({ title: "Post deleted" });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const lastPostRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isFetchingNextPage) return;
      if (observerRef.current) observerRef.current.disconnect();
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      });
      if (node) observerRef.current.observe(node);
    },
    [isFetchingNextPage, hasNextPage, fetchNextPage]
  );

  const posts = data?.pages.flatMap((page) => page) || [];

  return (
    <AppShell>
      <PageHeader
        title="Home"
        action={
          <AnimatedBadge variant="glow" className="text-[10px]">
            ✨ New
          </AnimatedBadge>
        }
      />

      {/* Feed tabs */}
      <div className="border-b border-border/40">
        <Tabs value={feedTab} onValueChange={setFeedTab} className="w-full">
          <TabsList className="w-full h-11 bg-transparent rounded-none border-0 p-0">
            <TabsTrigger
              value="foryou"
              className="flex-1 rounded-none h-11 border-b-2 data-[state=active]:border-accent data-[state=active]:text-accent data-[state=inactive]:border-transparent font-display font-semibold text-body-sm bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              For You
            </TabsTrigger>
            <TabsTrigger
              value="following"
              className="flex-1 rounded-none h-11 border-b-2 data-[state=active]:border-accent data-[state=active]:text-accent data-[state=inactive]:border-transparent font-display font-semibold text-body-sm bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              Following
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <FeedLayout sidebar={<TrendingSidebar />}>
        {/* Stories row */}
        <StoriesRow />

        {/* Compose prompt */}
        <ComposePrompt />

        {/* Feed content */}
        {isLoading ? (
          <FeedSkeleton />
        ) : posts.length === 0 ? (
          <EmptyState
            icon={Newspaper}
            title="Your feed is empty"
            description="Create your first post or follow people to see their posts here."
            action={{ label: "Create Post", onClick: () => navigate("/compose") }}
          />
        ) : (
          <div>
            {posts.map((post, index) => (
              <div
                key={post.id}
                ref={index === posts.length - 1 ? lastPostRef : undefined}
              >
                <PostCard
                  post={post}
                  currentUserId={user?.id}
                  onLike={(postId, isLiked) => likeMutation.mutate({ postId, isLiked })}
                  onDelete={(postId) => deleteMutation.mutate(postId)}
                />
              </div>
            ))}
            {isFetchingNextPage && (
              <div className="flex justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>
        )}
      </FeedLayout>
    </AppShell>
  );
};

export default FeedPage;
