import { supabase } from "@/integrations/supabase/client";

export interface FeedPost {
  id: string;
  user_id: string;
  content: string;
  visibility: string;
  is_edited: boolean;
  created_at: string;
  profiles: {
    display_name: string | null;
    handle: string | null;
    avatar_url: string | null;
  };
  post_media: {
    id: string;
    url: string;
    media_type: string;
    position: number;
  }[];
  likes: { user_id: string }[];
  like_count: number;
  comment_count: number;
}

const PAGE_SIZE = 10;

export async function fetchFeedPosts(page: number, userId?: string): Promise<FeedPost[]> {
  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from("posts")
    .select(`
      id, user_id, content, visibility, is_edited, created_at,
      profiles!inner(display_name, handle, avatar_url),
      post_media(id, url, media_type, position),
      likes(user_id)
    `)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (userId) {
    query = query.eq("user_id", userId);
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data || []).map((post: any) => ({
    ...post,
    post_media: (post.post_media || []).sort((a: any, b: any) => a.position - b.position),
    like_count: (post.likes || []).length,
    comment_count: 0, // Will be implemented in Phase 6
  }));
}

export async function createPost(
  userId: string,
  content: string,
  mediaFiles: File[],
  visibility: string = "public"
): Promise<string> {
  // 1. Insert post
  const { data: post, error: postError } = await supabase
    .from("posts")
    .insert({ user_id: userId, content, visibility })
    .select("id")
    .single();

  if (postError) throw postError;

  // 2. Upload media files
  if (mediaFiles.length > 0) {
    const mediaRecords = await Promise.all(
      mediaFiles.map(async (file, index) => {
        const ext = file.name.split(".").pop();
        const filePath = `${userId}/${post.id}/${index}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("post-media")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from("post-media").getPublicUrl(filePath);

        return {
          post_id: post.id,
          url: data.publicUrl,
          media_type: file.type.startsWith("video") ? "video" : "image",
          position: index,
        };
      })
    );

    const { error: mediaError } = await supabase.from("post_media").insert(mediaRecords);
    if (mediaError) throw mediaError;
  }

  return post.id;
}

export async function toggleLike(postId: string, userId: string, isLiked: boolean) {
  if (isLiked) {
    await supabase.from("likes").delete().eq("post_id", postId).eq("user_id", userId);
  } else {
    await supabase.from("likes").insert({ post_id: postId, user_id: userId });
  }
}

export async function deletePost(postId: string) {
  const { error } = await supabase.from("posts").delete().eq("id", postId);
  if (error) throw error;
}
