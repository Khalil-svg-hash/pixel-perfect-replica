import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { createPost } from "@/lib/posts";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Image, X, Loader2, Globe, Users } from "lucide-react";

const MAX_CHARS = 500;
const MAX_MEDIA = 4;

const ComposePage = () => {
  const [content, setContent] = useState("");
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
  const [visibility, setVisibility] = useState<"public" | "followers">("public");
  const [isPosting, setIsPosting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const remaining = MAX_CHARS - content.length;

  const handleAddMedia = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const available = MAX_MEDIA - mediaFiles.length;
    const toAdd = files.slice(0, available);

    if (files.length > available) {
      toast({ title: `Max ${MAX_MEDIA} images`, variant: "destructive" });
    }

    for (const file of toAdd) {
      if (file.size > 10 * 1024 * 1024) {
        toast({ title: "File too large", description: "Max 10MB per file.", variant: "destructive" });
        continue;
      }
      setMediaFiles((prev) => [...prev, file]);
      setMediaPreviews((prev) => [...prev, URL.createObjectURL(file)]);
    }

    // Reset input so same file can be selected again
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveMedia = (index: number) => {
    URL.revokeObjectURL(mediaPreviews[index]);
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
    setMediaPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePost = async () => {
    if (!user || content.trim().length === 0) return;
    setIsPosting(true);

    try {
      await createPost(user.id, content.trim(), mediaFiles, visibility);
      toast({ title: "Posted!" });
      navigate("/");
    } catch (err: any) {
      toast({ title: "Failed to post", description: err.message, variant: "destructive" });
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <AppShell>
      <PageHeader
        title="New Post"
        action={
          <Button
            size="sm"
            className="bg-accent text-accent-foreground hover:bg-accent/90"
            onClick={handlePost}
            disabled={isPosting || content.trim().length === 0 || remaining < 0}
          >
            {isPosting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Post"}
          </Button>
        }
      />
      <div className="max-w-2xl mx-auto px-4 py-4">
        <div className="flex gap-3">
          <UserAvatar name={profile?.display_name || "You"} src={profile?.avatar_url} size="md" />
          <div className="flex-1">
            <Textarea
              placeholder="What's happening?"
              className="min-h-[120px] resize-none border-0 bg-transparent text-body-md focus-visible:ring-0 p-0"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />

            {/* Media preview grid */}
            {mediaPreviews.length > 0 && (
              <div className={cn(
                "grid gap-1 rounded-xl overflow-hidden mt-3",
                mediaPreviews.length === 1 ? "grid-cols-1" : "grid-cols-2"
              )}>
                {mediaPreviews.map((src, i) => (
                  <div
                    key={i}
                    className={cn(
                      "relative bg-muted",
                      mediaPreviews.length === 1 ? "aspect-video" : "aspect-square",
                      mediaPreviews.length === 3 && i === 0 && "row-span-2"
                    )}
                  >
                    <img src={src} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => handleRemoveMedia(i)}
                      className="absolute top-2 end-2 h-7 w-7 rounded-full bg-foreground/70 flex items-center justify-center hover:bg-foreground/90 transition-colors"
                    >
                      <X className="h-4 w-4 text-background" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Toolbar */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
              <div className="flex gap-1 items-center">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-accent"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={mediaFiles.length >= MAX_MEDIA}
                >
                  <Image className="h-5 w-5" />
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  className="hidden"
                  onChange={handleAddMedia}
                />

                {/* Visibility toggle */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-muted-foreground text-body-xs"
                  onClick={() => setVisibility(visibility === "public" ? "followers" : "public")}
                >
                  {visibility === "public" ? (
                    <><Globe className="h-4 w-4" /> Public</>
                  ) : (
                    <><Users className="h-4 w-4" /> Followers</>
                  )}
                </Button>
              </div>

              <span
                className={cn(
                  "text-body-xs font-medium",
                  remaining < 0 ? "text-destructive" : remaining < 50 ? "text-warning" : "text-muted-foreground"
                )}
              >
                {remaining}
              </span>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default ComposePage;
