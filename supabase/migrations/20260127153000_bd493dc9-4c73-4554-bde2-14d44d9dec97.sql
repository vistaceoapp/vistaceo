-- =====================================================================
-- COGNITIVE OS V5 - DATABASE UPGRADE
-- Add concept_hash, ai_plan_json columns and support for intelligent deduplication
-- =====================================================================

-- 1. Add concept_hash to opportunities table for intelligent deduplication
ALTER TABLE public.opportunities 
ADD COLUMN IF NOT EXISTS concept_hash TEXT,
ADD COLUMN IF NOT EXISTS intent_signature TEXT,
ADD COLUMN IF NOT EXISTS root_problem_signature TEXT,
ADD COLUMN IF NOT EXISTS ai_plan_json JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS quality_gate_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS quality_gate_details JSONB DEFAULT '{}'::jsonb;

-- Create index for fast concept_hash lookups
CREATE INDEX IF NOT EXISTS idx_opportunities_concept_hash ON public.opportunities(business_id, concept_hash);
CREATE INDEX IF NOT EXISTS idx_opportunities_intent_signature ON public.opportunities(business_id, intent_signature);

-- 2. Add concept_hash to learning_items table for I+D deduplication
ALTER TABLE public.learning_items 
ADD COLUMN IF NOT EXISTS concept_hash TEXT,
ADD COLUMN IF NOT EXISTS intent_signature TEXT,
ADD COLUMN IF NOT EXISTS quality_gate_score INTEGER DEFAULT 0;

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_learning_items_concept_hash ON public.learning_items(business_id, concept_hash);

-- 3. Add concept_hash to missions table for tracking converted concepts
ALTER TABLE public.missions 
ADD COLUMN IF NOT EXISTS concept_hash TEXT,
ADD COLUMN IF NOT EXISTS source_opportunity_id UUID REFERENCES public.opportunities(id);

CREATE INDEX IF NOT EXISTS idx_missions_concept_hash ON public.missions(business_id, concept_hash);

-- 4. Create table for rejected concepts (blocked permanently or temporarily)
CREATE TABLE IF NOT EXISTS public.rejected_concepts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  concept_hash TEXT NOT NULL,
  intent_signature TEXT,
  root_problem_signature TEXT,
  source_type TEXT NOT NULL DEFAULT 'opportunity', -- opportunity, mission, learning_item
  source_id UUID,
  reason TEXT NOT NULL DEFAULT 'dismissed', -- dismissed, not_relevant, too_hard, already_done, duplicate
  user_feedback TEXT,
  blocked_until TIMESTAMP WITH TIME ZONE, -- NULL means permanent
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(business_id, concept_hash)
);

-- Enable RLS
ALTER TABLE public.rejected_concepts ENABLE ROW LEVEL SECURITY;

-- RLS policies for rejected_concepts
CREATE POLICY "Users can manage rejected concepts of own businesses" 
ON public.rejected_concepts 
FOR ALL 
USING (EXISTS ( SELECT 1 FROM businesses WHERE businesses.id = rejected_concepts.business_id AND businesses.owner_id = auth.uid()));

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_rejected_concepts_lookup ON public.rejected_concepts(business_id, concept_hash);
CREATE INDEX IF NOT EXISTS idx_rejected_concepts_blocked ON public.rejected_concepts(business_id, blocked_until);

-- 5. Add locale tracking to business_brains for voseo/tuteo
ALTER TABLE public.business_brains
ADD COLUMN IF NOT EXISTS locale_profile JSONB DEFAULT '{"voice": "voseo", "formality": "pro"}'::jsonb,
ADD COLUMN IF NOT EXISTS user_style_model JSONB DEFAULT '{"prefers_short_steps": true, "execution_speed": "mid", "likes_detail_level": "mid"}'::jsonb;

-- 6. Add success patterns tracking to businesses
ALTER TABLE public.business_brains
ADD COLUMN IF NOT EXISTS success_patterns JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS concept_graph JSONB DEFAULT '{"nodes": [], "edges": []}'::jsonb;