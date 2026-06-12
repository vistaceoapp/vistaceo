CREATE TABLE public.ai_plan_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL,
  job_type text NOT NULL DEFAULT 'mission_plan',
  status text NOT NULL DEFAULT 'processing', -- processing | completed | failed
  request jsonb,
  result jsonb,
  error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.ai_plan_jobs TO authenticated;
GRANT ALL ON public.ai_plan_jobs TO service_role;

ALTER TABLE public.ai_plan_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view jobs of own businesses"
ON public.ai_plan_jobs
FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM businesses
  WHERE businesses.id = ai_plan_jobs.business_id
    AND businesses.owner_id = auth.uid()
));

CREATE INDEX idx_ai_plan_jobs_business_created ON public.ai_plan_jobs (business_id, created_at DESC);