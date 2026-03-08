import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchFeedPosts, toggleLike, deletePost } from "@/lib/posts";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { PostCard } from "@/components/shared/PostCard";
import { FeedSkeleton } from "@/components/shared/Skeletons";
import { Button } from "@/components/ui/button";
import { Settings, MapPin, Calendar, Link as LinkIcon, Lock, Loader2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useRef, useCallback } from "react";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { handle } = useParams();
  const { profile, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const observerRef = useRef<IntersectionObserver | null>(null);

  const isOwnProfile = !handle;

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["profile-posts", user?.id],
    queryFn: ({ pageParam = 0 }) => fetchFeedPosts(pageParam, user?.id),
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === 10 ? allPages.length : undefined,
    initialPageParam: 0,
    enabled: !!user?.id && isOwnProfile,
  });

  const likeMutation = useMutation({
    mutationFn: ({ postId, isLiked }: { postId: string; isLiked: boolean }) =>
      toggleLike(postId, user!.id, isLiked),
    onError: () => queryClient.invalidateQueries({ queryKey: ["profile-posts"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: deletePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile-posts"] });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      toast({ title: "Post deleted" });
    },
  });

  const lastPostRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isFetchingNextPage) return;
      if (observerRef.current) observerRef.current.disconnect();
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage) fetchNextPage();
      });
      if (node) observerRef.current.observe(node);
    },
    [isFetchingNextPage, hasNextPage, fetchNextPage]
  );

  const posts = data?.pages.flatMap((page) => page) || [];

  return (
    <AppShell>
      <PageHeader
        title="Profile"
        action={
          isOwnProfile && (
            <Button variant="ghost" size="icon" onClick={() => navigate("/settings")}>
              <Settings className="h-5 w-5" />
            </Button>
          )
        }
      />
      <div className="max-w-2xl mx-auto">
        {/* Cover */}
        <div className="h-36 bg-gradient-to-br from-accent/30 to-accent/10 overflow-hidden">
          {profile?.cover_url && (
            <img src={profile.cover_url} alt="" className="w-full h-full object-cover" />
          )}
        </div>

        <div className="px-4 -mt-10">
          <div className="flex items-end justify-between mb-3">
            <UserAvatar
              name={profile?.display_name || "You"}
              src={profile?.avatar_url}
              size="xl"
              className="border-4 border-background"
            />
            {isOwnProfile ? (
              <Button variant="outline" size="sm" className="mb-1" onClick={() => navigate("/edit-profile")}>
                Edit Profile
              </Button>
            ) : (
              <Button size="sm" className="mb-1 bg-accent text-accent-foreground hover:bg-accent/90">
                Follow
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <h2 className="font-display text-display-md">{profile?.display_name || "Your Name"}</h2>
            {profile?.is_private && <Lock className="h-4 w-4 text-muted-foreground" />}
          </div>
          <p className="text-body-sm text-muted-foreground">@{profile?.handle || "username"}</p>

          {profile?.bio && <p className="text-body-sm mt-3">{profile.bio}</p>}
          {!profile?.bio && isOwnProfile && (
            <p className="text-body-sm mt-3 text-muted-foreground italic">Add a bio to tell people about yourself</p>
          )}

          <div className="flex flex-wrap gap-4 mt-3 text-body-xs text-muted-foreground">
            {profile?.location && (
              <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {profile.location}</span>
            )}
            {profile?.website && (
              <a
                href={profile.website.startsWith("http") ? profile.website : `https://${profile.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-accent hover:underline"
              >
                <LinkIcon className="h-3.5 w-3.5" /> {profile.website.replace(/^https?:\/\//, "")}
              </a>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" /> Joined{" "}
              {profile?.created_at ? format(new Date(profile.created_at), "MMMM yyyy") : "recently"}
            </span>
          </div>

          <div className="flex gap-4 mt-4 text-body-sm">
            <span><strong className="font-semibold">0</strong> <span className="text-muted-foreground">Following</span></span>
            <span><strong className="font-semibold">0</strong> <span className="text-muted-foreground">Followers</span></span>
          </div>
        </div>

        {/* Posts */}
        <div className="border-t border-border mt-4">
          <div className="flex">
            <button className="flex-1 py-3 text-body-sm font-semibold text-center border-b-2 border-accent text-accent">
              Posts
            </button>
            <button className="flex-1 py-3 text-body-sm font-semibold text-center text-muted-foreground hover:bg-muted/50 transition-colors">
              Likes
            </button>
          </div>

          {isLoading ? (
            <FeedSkeleton count={2} />
          ) : posts.length === 0 ? (
            <div className="py-12 text-center text-body-sm text-muted-foreground">No posts yet</div>
          ) : (
            <div>
              {posts.map((post, index) => (
                <div key={post.id} ref={index === posts.length - 1 ? lastPostRef : undefined}>
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
        </div>
      </div>
    </AppShell>
  );
};

export default ProfilePage;
