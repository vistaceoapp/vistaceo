CREATE TABLE public.ai_artifacts_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  artifact_type text NOT NULL,
  artifact_key text NOT NULL,
  brain_signature text NOT NULL,
  payload jsonb NOT NULL,
  model_used text,
  generated_at timestamptz NOT NULL DEFAULT now(),
  legacy boolean NOT NULL DEFAULT false,
  CONSTRAINT ai_artifacts_cache_unique UNIQUE (business_id, artifact_type, artifact_key)
);

CREATE INDEX ai_artifacts_cache_sig_idx ON public.ai_artifacts_cache (business_id, artifact_type, brain_signature);

GRANT SELECT ON public.ai_artifacts_cache TO authenticated;
GRANT ALL ON public.ai_artifacts_cache TO service_role;

ALTER TABLE public.ai_artifacts_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Business owners read their cache"
ON public.ai_artifacts_cache
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.businesses b
    WHERE b.id = ai_artifacts_cache.business_id
      AND b.owner_id = auth.uid()
  )
);