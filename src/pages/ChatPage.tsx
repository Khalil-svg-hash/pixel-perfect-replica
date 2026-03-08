import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { fetchMessages, sendMessage, markMessagesAsRead, Message } from "@/lib/messages";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { Button } from "@/components/ui/button";
import { Send, Loader2, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

function formatMsgTime(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function MessageBubble({ message, isOwn }: { message: Message; isOwn: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex mb-2", isOwn ? "justify-end" : "justify-start")}
    >
      <div
        className={cn(
          "max-w-[75%] px-3.5 py-2 rounded-2xl text-body-sm",
          isOwn
            ? "bg-accent text-accent-foreground rounded-br-md"
            : "bg-muted text-foreground rounded-bl-md"
        )}
      >
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
        <p className={cn(
          "text-[10px] mt-1",
          isOwn ? "text-accent-foreground/60" : "text-muted-foreground"
        )}>
          {formatMsgTime(message.created_at)}
        </p>
      </div>
    </motion.div>
  );
}

const ChatPage = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: () => fetchMessages(conversationId!),
    enabled: !!conversationId,
    refetchInterval: false,
  });

  // Fetch other user's profile from conversation
  const { data: otherProfile } = useQuery({
    queryKey: ["chat-partner", conversationId],
    queryFn: async () => {
      const { data: conv } = await supabase
        .from("conversations")
        .select("participant_1, participant_2")
        .eq("id", conversationId!)
        .single();
      if (!conv) return null;
      const otherId = conv.participant_1 === user?.id ? conv.participant_2 : conv.participant_1;
      const { data: profile } = await supabase
        .from("profiles")
        .select("user_id, display_name, handle, avatar_url")
        .eq("user_id", otherId)
        .single();
      return profile;
    },
    enabled: !!conversationId && !!user,
  });

  // Mark messages as read
  useEffect(() => {
    if (conversationId && user && messages.length > 0) {
      markMessagesAsRead(conversationId, user.id);
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({ queryKey: ["unread-messages"] });
    }
  }, [conversationId, user?.id, messages.length]);

  // Realtime subscription
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`chat-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          queryClient.setQueryData(
            ["messages", conversationId],
            (old: Message[] | undefined) => [...(old || []), payload.new as Message]
          );
          // Mark as read if from other user
          if (user && (payload.new as Message).sender_id !== user.id) {
            markMessagesAsRead(conversationId, user.id);
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [conversationId, user?.id, queryClient]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSend = async () => {
    if (!input.trim() || !user || !conversationId || sending) return;
    const content = input.trim();
    setInput("");
    setSending(true);
    try {
      await sendMessage(conversationId, user.id, content);
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  return (
    <AppShell>
      <PageHeader
        title={
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8 md:hidden" onClick={() => navigate("/messages")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            {otherProfile && (
              <>
                <UserAvatar name={otherProfile.display_name || "User"} src={otherProfile.avatar_url} size="sm" />
                <div>
                  <span className="font-display font-semibold text-body-sm">{otherProfile.display_name}</span>
                  <span className="text-body-xs text-muted-foreground ms-1.5">@{otherProfile.handle}</span>
                </div>
              </>
            )}
          </div>
        }
      />

      <div className="flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-4rem)] max-w-2xl mx-auto">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              {otherProfile && (
                <>
                  <UserAvatar name={otherProfile.display_name || "User"} src={otherProfile.avatar_url} size="xl" />
                  <h3 className="font-display text-display-sm mt-3">{otherProfile.display_name}</h3>
                  <p className="text-body-xs text-muted-foreground mt-1">@{otherProfile.handle}</p>
                  <p className="text-body-sm text-muted-foreground mt-3">Send a message to start the conversation</p>
                </>
              )}
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} isOwn={msg.sender_id === user?.id} />
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-border px-4 py-3">
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              rows={1}
              className="flex-1 resize-none bg-muted rounded-xl px-4 py-2.5 text-body-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent min-h-[40px] max-h-28"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <Button
              size="icon"
              className="h-10 w-10 rounded-xl bg-accent text-accent-foreground hover:bg-accent/90 shrink-0"
              onClick={handleSend}
              disabled={!input.trim() || sending}
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default ChatPage;
