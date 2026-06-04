
-- Parte 1: Brain único + red interna de relaciones

-- 1. Extend business_brains with structured profiles & fact-state ledger
ALTER TABLE public.business_brains
  ADD COLUMN IF NOT EXISTS offer_profile jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS customer_profile jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS fact_states jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS learning_log jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS isolation_fingerprint text;

-- 2. Internal relations network (per-business graph)
CREATE TABLE IF NOT EXISTS public.brain_relations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  brain_id uuid REFERENCES public.business_brains(id) ON DELETE CASCADE,
  origin_type text NOT NULL,
  origin_key text NOT NULL,
  destination_type text NOT NULL,
  destination_key text NOT NULL,
  relation_type text NOT NULL,
  strength numeric NOT NULL DEFAULT 0.5,
  confidence numeric NOT NULL DEFAULT 0.5,
  evidence jsonb NOT NULL DEFAULT '{}'::jsonb,
  state text NOT NULL DEFAULT 'inferred',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_brain_relations_business ON public.brain_relations(business_id);
CREATE INDEX IF NOT EXISTS idx_brain_relations_origin ON public.brain_relations(business_id, origin_type, origin_key);
CREATE INDEX IF NOT EXISTS idx_brain_relations_dest ON public.brain_relations(business_id, destination_type, destination_key);
CREATE UNIQUE INDEX IF NOT EXISTS uq_brain_relations_edge
  ON public.brain_relations(business_id, origin_type, origin_key, destination_type, destination_key, relation_type);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.brain_relations TO authenticated;
GRANT ALL ON public.brain_relations TO service_role;

ALTER TABLE public.brain_relations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own brain relations"
  ON public.brain_relations FOR ALL
  USING (EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = brain_relations.business_id AND b.owner_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = brain_relations.business_id AND b.owner_id = auth.uid()));

CREATE TRIGGER update_brain_relations_updated_at
  BEFORE UPDATE ON public.brain_relations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
