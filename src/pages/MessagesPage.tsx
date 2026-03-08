import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { fetchConversations, findOrCreateConversation, Conversation } from "@/lib/messages";
import { searchUsers } from "@/lib/comments";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { EmptyState } from "@/components/shared/EmptyState";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MessageSquare, PenSquare, Search, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

function formatConvTime(dateStr: string) {
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

function NewConversationDialog({ onSelect }: { onSelect: (userId: string) => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleSearch = async (q: string) => {
    setQuery(q);
    if (q.length < 1) { setResults([]); return; }
    setLoading(true);
    try {
      const users = await searchUsers(q);
      setResults(users.filter((u: any) => u.user_id !== user?.id));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <PenSquare className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New message</DialogTitle>
        </DialogHeader>
        <div className="relative mt-2">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search people..."
            className="ps-10"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            autoFocus
          />
        </div>
        <div className="max-h-64 overflow-y-auto mt-2">
          {loading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : results.length > 0 ? (
            results.map((u: any) => (
              <button
                key={u.user_id}
                onClick={() => onSelect(u.user_id)}
                className="flex items-center gap-3 w-full px-3 py-2.5 hover:bg-muted rounded-lg transition-colors text-start"
              >
                <UserAvatar name={u.display_name || "User"} src={u.avatar_url} size="md" />
                <div className="min-w-0">
                  <div className="font-display font-semibold text-body-sm truncate">{u.display_name}</div>
                  <div className="text-body-xs text-muted-foreground">@{u.handle}</div>
                </div>
              </button>
            ))
          ) : query.length >= 1 ? (
            <p className="text-center text-body-sm text-muted-foreground py-6">No users found</p>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}

const MessagesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ["conversations", user?.id],
    queryFn: () => fetchConversations(user!.id),
    enabled: !!user,
    refetchInterval: 10000,
  });

  const handleNewConversation = async (targetUserId: string) => {
    if (!user) return;
    const convId = await findOrCreateConversation(user.id, targetUserId);
    navigate(`/messages/${convId}`);
  };

  return (
    <AppShell>
      <PageHeader
        title="Messages"
        action={<NewConversationDialog onSelect={handleNewConversation} />}
      />
      <div className="max-w-2xl mx-auto">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : conversations.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="No messages yet"
            description="Start a conversation by tapping the compose button."
            className="mt-8"
          />
        ) : (
          <div className="divide-y divide-border">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => navigate(`/messages/${conv.id}`)}
                className={cn(
                  "flex items-center gap-3 w-full px-4 py-3 text-start hover:bg-muted/50 transition-colors",
                  (conv.unread_count ?? 0) > 0 && "bg-accent/5"
                )}
              >
                <UserAvatar
                  name={conv.other_user?.display_name || "User"}
                  src={conv.other_user?.avatar_url}
                  size="md"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-display font-semibold text-body-sm truncate">
                      {conv.other_user?.display_name || "User"}
                    </span>
                    <span className="text-body-xs text-muted-foreground shrink-0">
                      {conv.last_message ? formatConvTime(conv.last_message.created_at) : ""}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-body-xs text-muted-foreground truncate">
                      {conv.last_message
                        ? `${conv.last_message.sender_id === user?.id ? "You: " : ""}${conv.last_message.content}`
                        : "No messages yet"}
                    </p>
                    {(conv.unread_count ?? 0) > 0 && (
                      <span className="h-5 min-w-5 px-1.5 rounded-full bg-accent text-accent-foreground text-[11px] font-bold flex items-center justify-center shrink-0">
                        {conv.unread_count}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default MessagesPage;
