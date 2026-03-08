
ALTER TABLE public.follows ADD CONSTRAINT follows_follower_id_profiles_fkey 
  FOREIGN KEY (follower_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

ALTER TABLE public.follows ADD CONSTRAINT follows_following_id_profiles_fkey 
  FOREIGN KEY (following_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;
