import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { cn } from "@/lib/utils";
import { Image } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const MAX_CHARS = 500;

const ComposePage = () => {
  const [content, setContent] = useState("");
  const navigate = useNavigate();
  const remaining = MAX_CHARS - content.length;

  return (
    <AppShell>
      <PageHeader
        title="New Post"
        action={
          <Button
            size="sm"
            className="bg-accent text-accent-foreground hover:bg-accent/90"
            disabled={content.trim().length === 0 || remaining < 0}
          >
            Post
          </Button>
        }
      />
      <div className="max-w-2xl mx-auto px-4 py-4">
        <div className="flex gap-3">
          <UserAvatar name="You" size="md" />
          <div className="flex-1">
            <Textarea
              placeholder="What's happening?"
              className="min-h-[120px] resize-none border-0 bg-transparent text-body-md focus-visible:ring-0 p-0"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={MAX_CHARS + 50}
            />
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-9 w-9 text-accent">
                  <Image className="h-5 w-5" />
                </Button>
              </div>
              <span className={cn("text-body-xs font-medium", remaining < 0 ? "text-destructive" : remaining < 50 ? "text-warning" : "text-muted-foreground")}>
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
