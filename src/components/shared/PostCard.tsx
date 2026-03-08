import { Heart, MessageCircle, Share2, MoreHorizontal, Bookmark, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { UserAvatar } from "./UserAvatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FeedPost } from "@/lib/posts";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface PostCardProps {
  post: FeedPost;
  currentUserId?: string;
  onLike?: (postId: string, isLiked: boolean) => void;
  onDelete?: (postId: string) => void;
  className?: string;
}

function formatTime(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(dateStr).toLocaleDateString();
}

function MediaGrid({ media }: { media: FeedPost["post_media"] }) {
  if (!media || media.length === 0) return null;

  const gridClass = {
    1: "grid-cols-1",
    2: "grid-cols-2",
    3: "grid-cols-2",
    4: "grid-cols-2",
  }[Math.min(media.length, 4)];

  return (
    <div className={cn("grid gap-1 rounded-xl overflow-hidden mt-3", gridClass)}>
      {media.slice(0, 4).map((m, i) => (
        <div
          key={m.id}
          className={cn(
            "relative bg-muted",
            media.length === 3 && i === 0 && "row-span-2",
            media.length === 1 ? "aspect-video" : "aspect-square"
          )}
        >
          {m.media_type === "video" ? (
            <video src={m.url} className="w-full h-full object-cover" controls />
          ) : (
            <img src={m.url} alt="" className="w-full h-full object-cover" loading="lazy" />
          )}
        </div>
      ))}
    </div>
  );
}

export function PostCard({ post, currentUserId, onLike, onDelete, className }: PostCardProps) {
  const isLiked = post.likes?.some((l) => l.user_id === currentUserId) ?? false;
  const [optimisticLiked, setOptimisticLiked] = useState(isLiked);
  const [optimisticCount, setOptimisticCount] = useState(post.like_count);
  const isOwner = currentUserId === post.user_id;

  const handleLike = () => {
    setOptimisticLiked(!optimisticLiked);
    setOptimisticCount((c) => (optimisticLiked ? c - 1 : c + 1));
    onLike?.(post.id, optimisticLiked);
  };

  // Sync with prop changes
  if (isLiked !== (post.likes?.some((l) => l.user_id === currentUserId) ?? false)) {
    // Already handled by optimistic state
  }

  const authorName = post.profiles?.display_name || "Unknown";
  const authorHandle = post.profiles?.handle || "user";
  const authorAvatar = post.profiles?.avatar_url;

  return (
    <article className={cn("p-4 border-b border-border hover:bg-muted/30 transition-colors animate-fade-in", className)}>
      <div className="flex gap-3">
        <UserAvatar src={authorAvatar} name={authorName} size="md" />
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-display font-semibold text-body-sm truncate">{authorName}</span>
            <span className="text-body-xs text-muted-foreground truncate">@{authorHandle}</span>
            <span className="text-body-xs text-muted-foreground">· {formatTime(post.created_at)}</span>
            {post.is_edited && (
              <span className="text-body-xs text-muted-foreground italic">(edited)</span>
            )}

            {isOwner && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="ms-auto h-8 w-8 text-muted-foreground">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => onDelete?.(post.id)}
                  >
                    <Trash2 className="h-4 w-4 me-2" />
                    Delete post
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Content */}
          <p className="text-body-sm mt-1 whitespace-pre-wrap break-words">{post.content}</p>

          {/* Media */}
          <MediaGrid media={post.post_media} />

          {/* Actions */}
          <div className="flex items-center gap-1 mt-3 -ms-2">
            <Button
              variant="ghost"
              size="sm"
              className={cn("gap-1.5 text-muted-foreground hover:text-accent", optimisticLiked && "text-accent")}
              onClick={handleLike}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={optimisticLiked ? "liked" : "unliked"}
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                >
                  <Heart className={cn("h-4 w-4", optimisticLiked && "fill-current")} />
                </motion.div>
              </AnimatePresence>
              {optimisticCount > 0 && <span className="text-body-xs">{optimisticCount}</span>}
            </Button>
            <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-info">
              <MessageCircle className="h-4 w-4" />
              {post.comment_count > 0 && <span className="text-body-xs">{post.comment_count}</span>}
            </Button>
            <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-success">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
