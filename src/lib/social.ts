import { supabase } from "@/integrations/supabase/client";

export type FollowStatus = "none" | "pending" | "accepted";

export interface FollowCounts {
  followers_count: number;
  following_count: number;
}

export interface FollowUser {
  user_id: string;
  display_name: string | null;
  handle: string | null;
  avatar_url: string | null;
  bio: string | null;
}

export async function getFollowStatus(currentUserId: string, targetUserId: string): Promise<FollowStatus> {
  const { data } = await supabase
    .from("follows")
    .select("status")
    .eq("follower_id", currentUserId)
    .eq("following_id", targetUserId)
    .maybeSingle();

  return (data?.status as FollowStatus) || "none";
}

export async function getFollowCounts(userId: string): Promise<FollowCounts> {
  const { data, error } = await supabase.rpc("get_follow_counts", { _user_id: userId });
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  return {
    followers_count: Number(row?.followers_count ?? 0),
    following_count: Number(row?.following_count ?? 0),
  };
}

export async function followUser(currentUserId: string, targetUserId: string, isTargetPrivate: boolean) {
  const status = isTargetPrivate ? "pending" : "accepted";
  const { error } = await supabase
    .from("follows")
    .insert({ follower_id: currentUserId, following_id: targetUserId, status });
  if (error) throw error;
  return status as FollowStatus;
}

export async function unfollowUser(currentUserId: string, targetUserId: string) {
  const { error } = await supabase
    .from("follows")
    .delete()
    .eq("follower_id", currentUserId)
    .eq("following_id", targetUserId);
  if (error) throw error;
}

export async function acceptFollowRequest(followId: string) {
  const { error } = await supabase
    .from("follows")
    .update({ status: "accepted" })
    .eq("id", followId);
  if (error) throw error;
}

export async function rejectFollowRequest(followId: string) {
  const { error } = await supabase.from("follows").delete().eq("id", followId);
  if (error) throw error;
}

export async function getPendingRequests(userId: string) {
  const { data, error } = await supabase
    .from("follows")
    .select(`
      id, created_at,
      profiles!follows_follower_id_profiles_fkey(user_id, display_name, handle, avatar_url, bio)
    `)
    .eq("following_id", userId)
    .eq("status", "pending")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getFollowers(userId: string, page = 0, pageSize = 20): Promise<FollowUser[]> {
  const from = page * pageSize;
  const { data, error } = await supabase
    .from("follows")
    .select(`profiles!follows_follower_id_fkey(user_id, display_name, handle, avatar_url, bio)`)
    .eq("following_id", userId)
    .eq("status", "accepted")
    .range(from, from + pageSize - 1);
  if (error) throw error;
  return (data || []).map((d: any) => d.profiles).filter(Boolean);
}

export async function getFollowing(userId: string, page = 0, pageSize = 20): Promise<FollowUser[]> {
  const from = page * pageSize;
  const { data, error } = await supabase
    .from("follows")
    .select(`profiles!follows_following_id_fkey(user_id, display_name, handle, avatar_url, bio)`)
    .eq("follower_id", userId)
    .eq("status", "accepted")
    .range(from, from + pageSize - 1);
  if (error) throw error;
  return (data || []).map((d: any) => d.profiles).filter(Boolean);
}

export async function blockUser(currentUserId: string, targetUserId: string) {
  // Remove any follow relationship first
  await supabase.from("follows").delete().eq("follower_id", currentUserId).eq("following_id", targetUserId);
  await supabase.from("follows").delete().eq("follower_id", targetUserId).eq("following_id", currentUserId);
  const { error } = await supabase.from("blocks").insert({ blocker_id: currentUserId, blocked_id: targetUserId });
  if (error) throw error;
}

export async function unblockUser(currentUserId: string, targetUserId: string) {
  const { error } = await supabase
    .from("blocks")
    .delete()
    .eq("blocker_id", currentUserId)
    .eq("blocked_id", targetUserId);
  if (error) throw error;
}

export async function isBlocked(currentUserId: string, targetUserId: string): Promise<boolean> {
  const { data } = await supabase
    .from("blocks")
    .select("id")
    .or(`and(blocker_id.eq.${currentUserId},blocked_id.eq.${targetUserId}),and(blocker_id.eq.${targetUserId},blocked_id.eq.${currentUserId})`)
    .maybeSingle();
  return !!data;
}

export async function fetchProfileByHandle(handle: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("handle", handle)
    .single();
  if (error) throw error;
  return data;
}
