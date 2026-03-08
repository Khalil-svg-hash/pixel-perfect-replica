
-- Conversations table (1-to-1 DMs)
CREATE TABLE public.conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_1 UUID NOT NULL,
  participant_2 UUID NOT NULL,
  last_message_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (participant_1, participant_2)
);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Security definer function to check conversation membership
CREATE OR REPLACE FUNCTION public.is_conversation_participant(_user_id UUID, _conversation_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.conversations
    WHERE id = _conversation_id
      AND (_user_id = participant_1 OR _user_id = participant_2)
  )
$$;

CREATE POLICY "Users can see their own conversations"
  ON public.conversations FOR SELECT
  USING (auth.uid() = participant_1 OR auth.uid() = participant_2);

CREATE POLICY "Users can create conversations"
  ON public.conversations FOR INSERT
  WITH CHECK (auth.uid() = participant_1 OR auth.uid() = participant_2);

CREATE POLICY "Users can update their own conversations"
  ON public.conversations FOR UPDATE
  USING (auth.uid() = participant_1 OR auth.uid() = participant_2);

CREATE INDEX idx_conversations_p1 ON public.conversations(participant_1);
CREATE INDEX idx_conversations_p2 ON public.conversations(participant_2);
CREATE INDEX idx_conversations_last_msg ON public.conversations(last_message_at DESC);

-- Messages table
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see messages in their conversations"
  ON public.messages FOR SELECT
  USING (public.is_conversation_participant(auth.uid(), conversation_id));

CREATE POLICY "Users can send messages in their conversations"
  ON public.messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id AND public.is_conversation_participant(auth.uid(), conversation_id));

CREATE POLICY "Users can update messages in their conversations"
  ON public.messages FOR UPDATE
  USING (public.is_conversation_participant(auth.uid(), conversation_id));

CREATE INDEX idx_messages_conversation ON public.messages(conversation_id, created_at);

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Function to find or create a conversation between two users
CREATE OR REPLACE FUNCTION public.find_or_create_conversation(_user1 UUID, _user2 UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  _p1 UUID;
  _p2 UUID;
  _conv_id UUID;
BEGIN
  -- Normalize order to prevent duplicates
  IF _user1 < _user2 THEN
    _p1 := _user1; _p2 := _user2;
  ELSE
    _p1 := _user2; _p2 := _user1;
  END IF;

  SELECT id INTO _conv_id FROM public.conversations
    WHERE participant_1 = _p1 AND participant_2 = _p2;

  IF _conv_id IS NULL THEN
    INSERT INTO public.conversations (participant_1, participant_2)
    VALUES (_p1, _p2)
    RETURNING id INTO _conv_id;
  END IF;

  RETURN _conv_id;
END;
$$;
