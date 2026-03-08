import { useState, useRef, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchComments, createComment, deleteComment, searchUsers, Comment } from "@/lib/comments";
import { useAuth } from "@/contexts/AuthContext";
import { UserAvatar } from "./UserAvatar";
import { RichText } from "./RichText";
import { Button } from "@/components/ui/button";
import { Trash2, Send, Loader2, AtSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface MentionSuggestion {
  user_id: string;
  display_name: string | null;
  handle: string | null;
  avatar_url: string | null;
}

function MentionDropdown({
  suggestions,
  onSelect,
  visible,
}: {
  suggestions: MentionSuggestion[];
  onSelect: (handle: string) => void;
  visible: boolean;
}) {
  if (!visible || suggestions.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
      className="absolute bottom-full mb-1 start-0 w-64 bg-popover border border-border rounded-lg shadow-lg overflow-hidden z-50"
    >
      {suggestions.map((s) => (
        <button
          key={s.user_id}
          className="flex items-center gap-2 w-full px-3 py-2 text-start hover:bg-muted transition-colors"
          onMouseDown={(e) => {
            e.preventDefault();
            onSelect(s.handle || "user");
          }}
        >
          <UserAvatar name={s.display_name || "User"} src={s.avatar_url} size="sm" />
          <div className="min-w-0">
            <div className="text-body-xs font-medium truncate">{s.display_name}</div>
            <div className="text-body-xs text-muted-foreground truncate">@{s.handle}</div>
          </div>
        </button>
      ))}
    </motion.div>
  );
}

function formatCommentTime(dateStr: string) {
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

function CommentItem({ comment, currentUserId, onDelete }: {
  comment: Comment;
  currentUserId?: string;
  onDelete: (id: string) => void;
}) {
  const isOwner = currentUserId === comment.user_id;

  // Render content with @mentions highlighted
  // renderContent replaced by RichText component

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-2 py-2 group"
    >
      <UserAvatar name={comment.profiles?.display_name || "User"} src={comment.profiles?.avatar_url} size="sm" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="font-display font-semibold text-body-xs">{comment.profiles?.display_name}</span>
          <span className="text-muted-foreground text-body-xs">@{comment.profiles?.handle}</span>
          <span className="text-muted-foreground text-body-xs">· {formatCommentTime(comment.created_at)}</span>
          {isOwner && (
            <button
              onClick={() => onDelete(comment.id)}
              className="ms-auto opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          )}
        </div>
        <p className="text-body-xs mt-0.5 whitespace-pre-wrap break-words">{renderContent(comment.content)}</p>
      </div>
    </motion.div>
  );
}

export function CommentSection({ postId }: { postId: string }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [input, setInput] = useState("");
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<MentionSuggestion[]>([]);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ["comments", postId],
    queryFn: () => fetchComments(postId),
  });

  const addMutation = useMutation({
    mutationFn: () => createComment(postId, user!.id, input.trim()),
    onSuccess: () => {
      setInput("");
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      // Update comment count in feed
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["user-posts"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["user-posts"] });
    },
  });

  // @mention detection
  const handleInputChange = (value: string) => {
    setInput(value);
    const cursor = inputRef.current?.selectionStart || value.length;
    const textBeforeCursor = value.slice(0, cursor);
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);
    if (mentionMatch) {
      setMentionQuery(mentionMatch[1]);
    } else {
      setMentionQuery(null);
      setSuggestions([]);
    }
  };

  // Fetch mention suggestions
  useEffect(() => {
    if (mentionQuery === null || mentionQuery.length < 1) {
      setSuggestions([]);
      return;
    }
    const timeout = setTimeout(async () => {
      const results = await searchUsers(mentionQuery);
      setSuggestions(results);
    }, 200);
    return () => clearTimeout(timeout);
  }, [mentionQuery]);

  const handleMentionSelect = (handle: string) => {
    const cursor = inputRef.current?.selectionStart || input.length;
    const textBeforeCursor = input.slice(0, cursor);
    const textAfterCursor = input.slice(cursor);
    const newBefore = textBeforeCursor.replace(/@\w*$/, `@${handle} `);
    setInput(newBefore + textAfterCursor);
    setMentionQuery(null);
    setSuggestions([]);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && user) addMutation.mutate();
  };

  return (
    <div className="px-4 pb-3 pt-1 border-t border-border">
      {/* Comment list */}
      {isLoading ? (
        <div className="py-3 flex justify-center">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      ) : comments.length > 0 ? (
        <div className="max-h-60 overflow-y-auto py-1">
          <AnimatePresence>
            {comments.map((c) => (
              <CommentItem
                key={c.id}
                comment={c}
                currentUserId={user?.id}
                onDelete={(id) => deleteMutation.mutate(id)}
              />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <p className="text-body-xs text-muted-foreground py-3 text-center">No comments yet</p>
      )}

      {/* Composer */}
      {user && (
        <form onSubmit={handleSubmit} className="relative flex items-end gap-2 pt-2 border-t border-border">
          <AnimatePresence>
            <MentionDropdown
              suggestions={suggestions}
              onSelect={handleMentionSelect}
              visible={mentionQuery !== null && suggestions.length > 0}
            />
          </AnimatePresence>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="Add a comment..."
            rows={1}
            className="flex-1 resize-none bg-transparent text-body-xs placeholder:text-muted-foreground focus:outline-none py-2 min-h-[36px] max-h-20"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <Button
            type="submit"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-accent shrink-0"
            disabled={!input.trim() || addMutation.isPending}
          >
            {addMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      )}
    </div>
  );
}
