import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchFeedPosts, toggleLike, deletePost } from "@/lib/posts";
import { useAuth } from "@/contexts/AuthContext";
import { AppShell } from "@/components/layout/AppShell";
import { FeedLayout } from "@/components/layout/FeedLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { PostCard } from "@/components/shared/PostCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { FeedSkeleton } from "@/components/shared/Skeletons";
import { Button } from "@/components/ui/button";
import { Newspaper, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

const FeedPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

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

  // Infinite scroll observer
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
          </div>
        }
      >
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
