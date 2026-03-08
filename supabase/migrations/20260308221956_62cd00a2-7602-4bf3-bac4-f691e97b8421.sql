
-- Replace permissive INSERT policy with one that prevents direct user inserts
-- Notifications are only inserted by SECURITY DEFINER trigger functions
DROP POLICY "System can insert notifications" ON public.notifications;
CREATE POLICY "Only authenticated can insert notifications" ON public.notifications FOR INSERT WITH CHECK (auth.uid() = actor_id);
