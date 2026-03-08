import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchFeedPosts, toggleLike, deletePost } from "@/lib/posts";
import { getFollowCounts, getFollowStatus, fetchProfileByHandle, FollowStatus } from "@/lib/social";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { PostCard } from "@/components/shared/PostCard";
import { FeedSkeleton } from "@/components/shared/Skeletons";
import { FollowButton } from "@/components/social/FollowButton";
import { FollowRequestsList } from "@/components/social/FollowRequestsList";
import { Button } from "@/components/ui/button";
import { Settings, MapPin, Calendar, Link as LinkIcon, Lock, Loader2 } from "lucide-react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useRef, useCallback } from "react";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { handle } = useParams();
  const { profile: ownProfile, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const observerRef = useRef<IntersectionObserver | null>(null);

  const isOwnProfile = !handle || handle === ownProfile?.handle;

  // Fetch other user's profile if viewing someone else
  const { data: otherProfile, isLoading: loadingProfile } = useQuery({
    queryKey: ["profile", handle],
    queryFn: () => fetchProfileByHandle(handle!),
    enabled: !!handle && !isOwnProfile,
  });

  const displayProfile = isOwnProfile ? ownProfile : otherProfile;
  const profileUserId = displayProfile?.user_id;

  // Follow counts
  const { data: followCounts } = useQuery({
    queryKey: ["follow-counts", profileUserId],
    queryFn: () => getFollowCounts(profileUserId!),
    enabled: !!profileUserId,
  });

  // Follow status (for other users)
  const { data: followStatus = "none" as FollowStatus } = useQuery({
    queryKey: ["follow-status", user?.id, profileUserId],
    queryFn: () => getFollowStatus(user!.id, profileUserId!),
    enabled: !!user && !!profileUserId && !isOwnProfile,
  });

  // Posts
  const {
    data,
    isLoading: loadingPosts,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["profile-posts", profileUserId],
    queryFn: ({ pageParam = 0 }) => fetchFeedPosts(pageParam, profileUserId),
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === 10 ? allPages.length : undefined,
    initialPageParam: 0,
    enabled: !!profileUserId,
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

  if (!isOwnProfile && loadingProfile) {
    return (
      <AppShell>
        <PageHeader title="Profile" />
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader
        title="Profile"
        action={
          isOwnProfile ? (
            <Button variant="ghost" size="icon" onClick={() => navigate("/settings")}>
              <Settings className="h-5 w-5" />
            </Button>
          ) : undefined
        }
      />
      <div className="max-w-2xl mx-auto">
        {/* Follow requests (own profile only) */}
        {isOwnProfile && <FollowRequestsList />}

        {/* Cover */}
        <div className="h-36 bg-gradient-to-br from-accent/30 to-accent/10 overflow-hidden">
          {displayProfile?.cover_url && (
            <img src={displayProfile.cover_url} alt="" className="w-full h-full object-cover" />
          )}
        </div>

        <div className="px-4 -mt-10">
          <div className="flex items-end justify-between mb-3">
            <UserAvatar
              name={displayProfile?.display_name || "User"}
              src={displayProfile?.avatar_url}
              size="xl"
              className="border-4 border-background"
            />
            {isOwnProfile ? (
              <Button variant="outline" size="sm" className="mb-1" onClick={() => navigate("/edit-profile")}>
                Edit Profile
              </Button>
            ) : (
              <FollowButton
                targetUserId={profileUserId!}
                targetIsPrivate={displayProfile?.is_private ?? false}
                initialStatus={followStatus}
                onStatusChange={() => {
                  queryClient.invalidateQueries({ queryKey: ["follow-counts", profileUserId] });
                  queryClient.invalidateQueries({ queryKey: ["follow-status"] });
                }}
                className="mb-1"
              />
            )}
          </div>

          <div className="flex items-center gap-2">
            <h2 className="font-display text-display-md">{displayProfile?.display_name || "User"}</h2>
            {displayProfile?.is_private && <Lock className="h-4 w-4 text-muted-foreground" />}
          </div>
          <p className="text-body-sm text-muted-foreground">@{displayProfile?.handle || "username"}</p>

          {displayProfile?.bio && <p className="text-body-sm mt-3">{displayProfile.bio}</p>}
          {!displayProfile?.bio && isOwnProfile && (
            <p className="text-body-sm mt-3 text-muted-foreground italic">Add a bio to tell people about yourself</p>
          )}

          <div className="flex flex-wrap gap-4 mt-3 text-body-xs text-muted-foreground">
            {displayProfile?.location && (
              <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {displayProfile.location}</span>
            )}
            {displayProfile?.website && (
              <a
                href={displayProfile.website.startsWith("http") ? displayProfile.website : `https://${displayProfile.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-accent hover:underline"
              >
                <LinkIcon className="h-3.5 w-3.5" /> {displayProfile.website.replace(/^https?:\/\//, "")}
              </a>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" /> Joined{" "}
              {displayProfile?.created_at ? format(new Date(displayProfile.created_at), "MMMM yyyy") : "recently"}
            </span>
          </div>

          <div className="flex gap-4 mt-4 text-body-sm">
            <Link to={`/followers/${profileUserId}`} className="hover:underline">
              <strong className="font-semibold">{followCounts?.following_count ?? 0}</strong>{" "}
              <span className="text-muted-foreground">Following</span>
            </Link>
            <Link to={`/followers/${profileUserId}`} className="hover:underline">
              <strong className="font-semibold">{followCounts?.followers_count ?? 0}</strong>{" "}
              <span className="text-muted-foreground">Followers</span>
            </Link>
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

          {loadingPosts ? (
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
