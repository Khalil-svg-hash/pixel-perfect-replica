import { supabase } from "@/integrations/supabase/client";

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles: {
    display_name: string | null;
    handle: string | null;
    avatar_url: string | null;
  };
}

export async function fetchComments(postId: string): Promise<Comment[]> {
  const { data, error } = await supabase
    .from("comments")
    .select(`id, post_id, user_id, content, created_at, profiles!inner(display_name, handle, avatar_url)`)
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data || []) as unknown as Comment[];
}

export async function createComment(postId: string, userId: string, content: string): Promise<Comment> {
  const { data, error } = await supabase
    .from("comments")
    .insert({ post_id: postId, user_id: userId, content })
    .select(`id, post_id, user_id, content, created_at, profiles!inner(display_name, handle, avatar_url)`)
    .single();

  if (error) throw error;
  return data as unknown as Comment;
}

export async function deleteComment(commentId: string) {
  const { error } = await supabase.from("comments").delete().eq("id", commentId);
  if (error) throw error;
}

export async function fetchCommentCount(postId: string): Promise<number> {
  const { count, error } = await supabase
    .from("comments")
    .select("id", { count: "exact", head: true })
    .eq("post_id", postId);

  if (error) throw error;
  return count || 0;
}

export async function searchUsers(query: string) {
  if (!query || query.length < 1) return [];
  const { data, error } = await supabase
    .from("profiles")
    .select("user_id, display_name, handle, avatar_url")
    .or(`handle.ilike.%${query}%,display_name.ilike.%${query}%`)
    .limit(5);

  if (error) throw error;
  return data || [];
}
