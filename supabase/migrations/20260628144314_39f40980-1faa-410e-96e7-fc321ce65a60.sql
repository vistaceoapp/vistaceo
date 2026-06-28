
CREATE TABLE public.user_chat_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  tone TEXT,
  length_pref TEXT,
  detail_level TEXT,
  formality TEXT,
  language TEXT DEFAULT 'es',
  focus_areas TEXT[] DEFAULT ARRAY[]::TEXT[],
  avoid_topics TEXT[] DEFAULT ARRAY[]::TEXT[],
  style_notes TEXT,
  inferred JSONB NOT NULL DEFAULT '{}'::jsonb,
  confirmed JSONB NOT NULL DEFAULT '{}'::jsonb,
  interaction_count INT NOT NULL DEFAULT 0,
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_chat_preferences TO authenticated;
GRANT ALL ON public.user_chat_preferences TO service_role;
ALTER TABLE public.user_chat_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own chat preferences"
  ON public.user_chat_preferences FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Users can upsert own chat preferences"
  ON public.user_chat_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own chat preferences"
  ON public.user_chat_preferences FOR UPDATE
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_user_chat_preferences_updated_at
  BEFORE UPDATE ON public.user_chat_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
