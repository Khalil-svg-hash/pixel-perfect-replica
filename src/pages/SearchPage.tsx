import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { PostCard } from "@/components/shared/PostCard";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { EmptyState } from "@/components/shared/EmptyState";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { toggleLike, deletePost, FeedPost } from "@/lib/posts";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { Search, Users, FileText, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserResult {
  user_id: string;
  display_name: string | null;
  handle: string | null;
  avatar_url: string | null;
  bio: string | null;
}

async function searchUsers(query: string): Promise<UserResult[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("user_id, display_name, handle, avatar_url, bio")
    .or(`handle.ilike.%${query}%,display_name.ilike.%${query}%`)
    .limit(20);
  if (error) throw error;
  return data || [];
}

async function searchPosts(query: string): Promise<FeedPost[]> {
  const { data, error } = await supabase
    .from("posts")
    .select(`
      id, user_id, content, visibility, is_edited, created_at,
      profiles!inner(display_name, handle, avatar_url),
      post_media(id, url, media_type, position),
      likes(user_id),
      comments(id)
    `)
    .ilike("content", `%${query}%`)
    .order("created_at", { ascending: false })
    .limit(20);
  if (error) throw error;
  return (data || []).map((post: any) => ({
    ...post,
    post_media: (post.post_media || []).sort((a: any, b: any) => a.position - b.position),
    like_count: (post.likes || []).length,
    comment_count: (post.comments || []).length,
  }));
}

function useDebounce(value: string, delay: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const initialTab = (searchParams.get("tab") as "users" | "posts") || "users";
  const [query, setQuery] = useState(initialQuery);
  const [tab, setTab] = useState<"users" | "posts">(initialTab);

  // Sync from URL params (e.g. hashtag clicks)
  useEffect(() => {
    const q = searchParams.get("q");
    const t = searchParams.get("tab") as "users" | "posts" | null;
    if (q !== null) setQuery(q);
    if (t) setTab(t);
  }, [searchParams]);

  const debouncedQuery = useDebounce(query.trim(), 300);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: users = [], isLoading: loadingUsers } = useQuery({
    queryKey: ["search-users", debouncedQuery],
    queryFn: () => searchUsers(debouncedQuery),
    enabled: debouncedQuery.length >= 1,
  });

  const { data: posts = [], isLoading: loadingPosts } = useQuery({
    queryKey: ["search-posts", debouncedQuery],
    queryFn: () => searchPosts(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
  });

  const likeMutation = useMutation({
    mutationFn: ({ postId, isLiked }: { postId: string; isLiked: boolean }) =>
      toggleLike(postId, user!.id, isLiked),
    onError: () => queryClient.invalidateQueries({ queryKey: ["search-posts"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: deletePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["search-posts"] });
      toast({ title: "Post deleted" });
    },
  });

  const isLoading = tab === "users" ? loadingUsers : loadingPosts;
  const hasQuery = debouncedQuery.length >= 1;

  return (
    <AppShell>
      <PageHeader title="Search" />
      <div className="max-w-2xl mx-auto">
        <div className="px-4 py-4">
          <div className="relative">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search people and posts..."
              className="ps-10 bg-muted border-0 focus-visible:ring-accent"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
          </div>
        </div>

        {/* Tabs */}
        {hasQuery && (
          <div className="flex border-b border-border">
            <button
              onClick={() => setTab("users")}
              className={cn(
                "flex-1 py-3 text-body-sm font-semibold text-center transition-colors flex items-center justify-center gap-2",
                tab === "users"
                  ? "border-b-2 border-accent text-accent"
                  : "text-muted-foreground hover:bg-muted/50"
              )}
            >
              <Users className="h-4 w-4" />
              People {users.length > 0 && `(${users.length})`}
            </button>
            <button
              onClick={() => setTab("posts")}
              className={cn(
                "flex-1 py-3 text-body-sm font-semibold text-center transition-colors flex items-center justify-center gap-2",
                tab === "posts"
                  ? "border-b-2 border-accent text-accent"
                  : "text-muted-foreground hover:bg-muted/50"
              )}
            >
              <FileText className="h-4 w-4" />
              Posts {posts.length > 0 && `(${posts.length})`}
            </button>
          </div>
        )}

        {/* Results */}
        {!hasQuery ? (
          <EmptyState
            icon={Search}
            title="Discover"
            description="Search for people and posts."
            className="mt-8"
          />
        ) : isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : tab === "users" ? (
          users.length === 0 ? (
            <div className="py-12 text-center text-body-sm text-muted-foreground">No people found</div>
          ) : (
            <div className="divide-y divide-border">
              {users.map((u) => (
                <Link
                  key={u.user_id}
                  to={`/profile/${u.handle}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors animate-fade-in"
                >
                  <UserAvatar name={u.display_name || "User"} src={u.avatar_url} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="font-display font-semibold text-body-sm truncate">{u.display_name}</div>
                    <div className="text-body-xs text-muted-foreground truncate">@{u.handle}</div>
                    {u.bio && (
                      <p className="text-body-xs text-muted-foreground mt-0.5 line-clamp-1">{u.bio}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )
        ) : posts.length === 0 ? (
          <div className="py-12 text-center text-body-sm text-muted-foreground">No posts found</div>
        ) : (
          <div>
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUserId={user?.id}
                onLike={(postId, isLiked) => likeMutation.mutate({ postId, isLiked })}
                onDelete={(postId) => deleteMutation.mutate(postId)}
              />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default SearchPage;
