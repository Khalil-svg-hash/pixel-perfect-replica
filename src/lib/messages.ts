import { supabase } from "@/integrations/supabase/client";

export interface Conversation {
  id: string;
  participant_1: string;
  participant_2: string;
  last_message_at: string;
  created_at: string;
  other_user?: {
    user_id: string;
    display_name: string | null;
    handle: string | null;
    avatar_url: string | null;
  };
  last_message?: {
    content: string;
    sender_id: string;
    created_at: string;
  };
  unread_count?: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export async function fetchConversations(userId: string): Promise<Conversation[]> {
  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .or(`participant_1.eq.${userId},participant_2.eq.${userId}`)
    .order("last_message_at", { ascending: false });

  if (error) throw error;
  if (!data || data.length === 0) return [];

  // Get other user profiles
  const otherUserIds = data.map((c: any) =>
    c.participant_1 === userId ? c.participant_2 : c.participant_1
  );

  const { data: profiles } = await supabase
    .from("profiles")
    .select("user_id, display_name, handle, avatar_url")
    .in("user_id", otherUserIds);

  const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p]));

  // Get last message for each conversation
  const convIds = data.map((c: any) => c.id);
  const lastMessages = await Promise.all(
    convIds.map(async (convId: string) => {
      const { data: msgs } = await supabase
        .from("messages")
        .select("content, sender_id, created_at")
        .eq("conversation_id", convId)
        .order("created_at", { ascending: false })
        .limit(1);
      return { convId, message: msgs?.[0] || null };
    })
  );
  const msgMap = new Map(lastMessages.map((m) => [m.convId, m.message]));

  // Get unread counts
  const unreadCounts = await Promise.all(
    convIds.map(async (convId: string) => {
      const { count } = await supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .eq("conversation_id", convId)
        .eq("is_read", false)
        .neq("sender_id", userId);
      return { convId, count: count || 0 };
    })
  );
  const unreadMap = new Map(unreadCounts.map((u) => [u.convId, u.count]));

  return data.map((c: any) => {
    const otherId = c.participant_1 === userId ? c.participant_2 : c.participant_1;
    return {
      ...c,
      other_user: profileMap.get(otherId) || null,
      last_message: msgMap.get(c.id) || null,
      unread_count: unreadMap.get(c.id) || 0,
    };
  });
}

export async function fetchMessages(conversationId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function sendMessage(conversationId: string, senderId: string, content: string): Promise<Message> {
  // Insert message
  const { data, error } = await supabase
    .from("messages")
    .insert({ conversation_id: conversationId, sender_id: senderId, content })
    .select()
    .single();

  if (error) throw error;

  // Update conversation timestamp
  await supabase
    .from("conversations")
    .update({ last_message_at: new Date().toISOString() })
    .eq("id", conversationId);

  return data;
}

export async function findOrCreateConversation(user1: string, user2: string): Promise<string> {
  const { data, error } = await supabase.rpc("find_or_create_conversation", {
    _user1: user1,
    _user2: user2,
  });

  if (error) throw error;
  return data as string;
}

export async function markMessagesAsRead(conversationId: string, userId: string) {
  await supabase
    .from("messages")
    .update({ is_read: true })
    .eq("conversation_id", conversationId)
    .eq("is_read", false)
    .neq("sender_id", userId);
}
