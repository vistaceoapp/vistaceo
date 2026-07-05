-- 1. Setup question effectiveness tracking
CREATE TABLE IF NOT EXISTS public.setup_question_effectiveness (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  question_id text NOT NULL,
  field_name text NOT NULL,
  question_text text,
  category text,
  source text,
  priority int,
  answer_length int,
  answered_at timestamptz NOT NULL DEFAULT now(),
  signals_before int,
  signals_after int,
  confidence_before numeric,
  confidence_after numeric,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sqe_business ON public.setup_question_effectiveness(business_id);
CREATE INDEX IF NOT EXISTS idx_sqe_field ON public.setup_question_effectiveness(field_name);

GRANT SELECT, INSERT ON public.setup_question_effectiveness TO authenticated;
GRANT ALL ON public.setup_question_effectiveness TO service_role;
ALTER TABLE public.setup_question_effectiveness ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can insert their effectiveness"
  ON public.setup_question_effectiveness FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = business_id AND b.owner_id = auth.uid()));

CREATE POLICY "Owners and admins can read effectiveness"
  ON public.setup_question_effectiveness FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = business_id AND b.owner_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin'::app_role)
  );

-- 2. Silent reactivation sends (idempotency)
CREATE TABLE IF NOT EXISTS public.silent_reactivation_sends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_email text NOT NULL,
  stage text NOT NULL DEFAULT 'silent7',
  variant int DEFAULT 0,
  sent_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, stage)
);

CREATE INDEX IF NOT EXISTS idx_srs_user ON public.silent_reactivation_sends(user_id);
GRANT SELECT ON public.silent_reactivation_sends TO authenticated;
GRANT ALL ON public.silent_reactivation_sends TO service_role;
ALTER TABLE public.silent_reactivation_sends ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read reactivation sends"
  ON public.silent_reactivation_sends FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 3. Clean up orphan multi-business drafts (only when the user has any completed business
--    OR has multiple auto-generated "Mi negocio" drafts and no completed one).
DELETE FROM public.businesses b
WHERE b.setup_completed = false
  AND b.name IN ('Mi negocio', 'Lewin Owens')
  AND b.id NOT IN (
    SELECT DISTINCT ON (owner_id) id
    FROM public.businesses
    WHERE setup_completed = false
    ORDER BY owner_id, created_at DESC
  )
  AND EXISTS (
    SELECT 1 FROM public.businesses b2
    WHERE b2.owner_id = b.owner_id
      AND (b2.setup_completed = true OR b2.id <> b.id)
  );