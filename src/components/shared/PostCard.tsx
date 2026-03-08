import { Heart, MessageCircle, Share2, MoreHorizontal, Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";
import { UserAvatar } from "./UserAvatar";
import { Button } from "@/components/ui/button";

export interface PostData {
  id: string;
  author: {
    name: string;
    handle: string;
    avatarUrl?: string;
  };
  content: string;
  media?: { url: string; type: "image" | "video" }[];
  likes: number;
  comments: number;
  shares: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
  isEdited?: boolean;
  createdAt: string;
}

interface PostCardProps {
  post: PostData;
  onLike?: (id: string) => void;
  onComment?: (id: string) => void;
  onShare?: (id: string) => void;
  onBookmark?: (id: string) => void;
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

function MediaGrid({ media }: { media: PostData["media"] }) {
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
          key={i}
          className={cn(
            "relative bg-muted",
            media.length === 3 && i === 0 && "row-span-2",
            media.length === 1 ? "aspect-video" : "aspect-square"
          )}
        >
          <img src={m.url} alt="" className="w-full h-full object-cover" loading="lazy" />
        </div>
      ))}
    </div>
  );
}

export function PostCard({ post, onLike, onComment, onShare, onBookmark, className }: PostCardProps) {
  return (
    <article className={cn("p-4 border-b border-border hover:bg-muted/30 transition-colors animate-fade-in", className)}>
      <div className="flex gap-3">
        <UserAvatar src={post.author.avatarUrl} name={post.author.name} size="md" />
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-display font-semibold text-body-sm truncate">{post.author.name}</span>
            <span className="text-body-xs text-muted-foreground truncate">@{post.author.handle}</span>
            <span className="text-body-xs text-muted-foreground">· {formatTime(post.createdAt)}</span>
            {post.isEdited && (
              <span className="text-body-xs text-muted-foreground italic">(edited)</span>
            )}
            <Button variant="ghost" size="icon" className="ms-auto h-8 w-8 text-muted-foreground">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <p className="text-body-sm mt-1 whitespace-pre-wrap break-words">{post.content}</p>

          {/* Media */}
          <MediaGrid media={post.media} />

          {/* Actions */}
          <div className="flex items-center gap-1 mt-3 -ms-2">
            <Button
              variant="ghost"
              size="sm"
              className={cn("gap-1.5 text-muted-foreground hover:text-accent", post.isLiked && "text-accent")}
              onClick={() => onLike?.(post.id)}
            >
              <Heart className={cn("h-4 w-4", post.isLiked && "fill-current")} />
              {post.likes > 0 && <span className="text-body-xs">{post.likes}</span>}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-muted-foreground hover:text-info"
              onClick={() => onComment?.(post.id)}
            >
              <MessageCircle className="h-4 w-4" />
              {post.comments > 0 && <span className="text-body-xs">{post.comments}</span>}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-muted-foreground hover:text-success"
              onClick={() => onShare?.(post.id)}
            >
              <Share2 className="h-4 w-4" />
              {post.shares > 0 && <span className="text-body-xs">{post.shares}</span>}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn("ms-auto h-8 w-8 text-muted-foreground hover:text-warning", post.isBookmarked && "text-warning")}
              onClick={() => onBookmark?.(post.id)}
            >
              <Bookmark className={cn("h-4 w-4", post.isBookmarked && "fill-current")} />
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
