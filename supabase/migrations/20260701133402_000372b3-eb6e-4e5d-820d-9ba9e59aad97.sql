
ALTER TABLE public.user_conversion_profiles
  ADD COLUMN IF NOT EXISTS velocity_7d numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS velocity_30d numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS recency_weighted_engagement numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS micro_segment text,
  ADD COLUMN IF NOT EXISTS top_signal text,
  ADD COLUMN IF NOT EXISTS reasoning_summary text,
  ADD COLUMN IF NOT EXISTS last_agent_run_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_user_conversion_profiles_micro_segment
  ON public.user_conversion_profiles(micro_segment);

CREATE INDEX IF NOT EXISTS idx_user_conversion_profiles_pro_readiness
  ON public.user_conversion_profiles(pro_readiness_score DESC);

CREATE INDEX IF NOT EXISTS idx_conversion_agent_decisions_user_created
  ON public.conversion_agent_decisions(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_conversion_events_user_created
  ON public.conversion_events(user_id, created_at DESC);
