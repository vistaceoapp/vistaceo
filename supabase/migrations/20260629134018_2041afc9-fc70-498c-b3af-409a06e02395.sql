
-- =========================================================
-- VISTACEO Conversion Intelligence OS — base data layer
-- =========================================================

-- 1) user_conversion_profiles --------------------------------
CREATE TABLE public.user_conversion_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_status text NOT NULL DEFAULT 'free',
  subscription_status text,
  days_since_signup int NOT NULL DEFAULT 0,
  sessions_count int NOT NULL DEFAULT 0,
  total_active_time int NOT NULL DEFAULT 0,
  last_active_at timestamptz,
  activation_score int NOT NULL DEFAULT 0,
  engagement_score int NOT NULL DEFAULT 0,
  value_realization_score int NOT NULL DEFAULT 0,
  purchase_intent_score int NOT NULL DEFAULT 0,
  premium_interest_score int NOT NULL DEFAULT 0,
  friction_score int NOT NULL DEFAULT 0,
  churn_risk_score int NOT NULL DEFAULT 0,
  trust_score int NOT NULL DEFAULT 0,
  email_engagement_score int NOT NULL DEFAULT 0,
  pro_readiness_score int NOT NULL DEFAULT 0,
  conversion_probability numeric(5,2) NOT NULL DEFAULT 0,
  current_conversion_segment text,
  current_conversion_strategy text,
  main_conversion_interest text,
  detected_conversion_objection text,
  next_best_action text,
  next_best_offer text,
  next_best_channel text,
  next_best_timing text,
  last_prompt_shown_at timestamptz,
  last_email_sent_at timestamptz,
  prompt_count_7d int NOT NULL DEFAULT 0,
  email_count_7d int NOT NULL DEFAULT 0,
  modal_close_count_7d int NOT NULL DEFAULT 0,
  do_not_disturb_until timestamptz,
  email_suppressed_until timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.user_conversion_profiles TO authenticated;
GRANT ALL ON public.user_conversion_profiles TO service_role;
ALTER TABLE public.user_conversion_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can read own conversion profile"
  ON public.user_conversion_profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all conversion profiles"
  ON public.user_conversion_profiles
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_user_conversion_profiles_updated
  BEFORE UPDATE ON public.user_conversion_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2) conversion_agent_memory ---------------------------------
CREATE TABLE public.conversion_agent_memory (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  main_interest text,
  probable_objection text,
  value_received jsonb NOT NULL DEFAULT '[]'::jsonb,
  hypotheses jsonb NOT NULL DEFAULT '[]'::jsonb,
  modules_used jsonb NOT NULL DEFAULT '{}'::jsonb,
  premium_attempts jsonb NOT NULL DEFAULT '[]'::jsonb,
  last_signals jsonb NOT NULL DEFAULT '[]'::jsonb,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.conversion_agent_memory TO authenticated;
GRANT ALL ON public.conversion_agent_memory TO service_role;
ALTER TABLE public.conversion_agent_memory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can read own agent memory"
  ON public.conversion_agent_memory
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all agent memory"
  ON public.conversion_agent_memory
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_conversion_agent_memory_updated
  BEFORE UPDATE ON public.conversion_agent_memory
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3) conversion_agent_decisions ------------------------------
CREATE TABLE public.conversion_agent_decisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  strategy text NOT NULL,
  channel text NOT NULL,
  placement text,
  timing text,
  intent text,
  reason text,
  passed_quality_gate boolean NOT NULL DEFAULT true,
  blocked_by_guard text,
  scores_snapshot jsonb,
  context_snapshot jsonb,
  message_seed text,
  cta text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_conv_decisions_user ON public.conversion_agent_decisions(user_id, created_at DESC);

GRANT ALL ON public.conversion_agent_decisions TO service_role;
ALTER TABLE public.conversion_agent_decisions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read all agent decisions"
  ON public.conversion_agent_decisions
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 4) conversion_events ---------------------------------------
CREATE TABLE public.conversion_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id uuid,
  event_name text NOT NULL,
  category text,
  source text,
  session_id text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_conv_events_user_time ON public.conversion_events(user_id, created_at DESC);
CREATE INDEX idx_conv_events_name_time ON public.conversion_events(event_name, created_at DESC);

GRANT SELECT, INSERT ON public.conversion_events TO authenticated;
GRANT ALL ON public.conversion_events TO service_role;
ALTER TABLE public.conversion_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can insert own conversion events"
  ON public.conversion_events
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owner can read own conversion events"
  ON public.conversion_events
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all conversion events"
  ON public.conversion_events
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 5) conversion_impressions ----------------------------------
CREATE TABLE public.conversion_impressions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  decision_id uuid REFERENCES public.conversion_agent_decisions(id) ON DELETE SET NULL,
  placement text NOT NULL,
  message_key text,
  channel text,
  event_type text NOT NULL CHECK (event_type IN ('impression','click','close','convert','dismiss')),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_conv_impressions_user ON public.conversion_impressions(user_id, created_at DESC);
CREATE INDEX idx_conv_impressions_placement ON public.conversion_impressions(placement, event_type);

GRANT SELECT, INSERT ON public.conversion_impressions TO authenticated;
GRANT ALL ON public.conversion_impressions TO service_role;
ALTER TABLE public.conversion_impressions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can insert own impressions"
  ON public.conversion_impressions
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owner can read own impressions"
  ON public.conversion_impressions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all impressions"
  ON public.conversion_impressions
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
