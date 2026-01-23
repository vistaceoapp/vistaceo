-- Create pulse_checkins table for economic/sales check-ins
-- This stores personalized pulse data per business type

CREATE TABLE public.pulse_checkins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  
  -- Date and time context
  applies_to_date DATE NOT NULL DEFAULT CURRENT_DATE,
  granularity TEXT NOT NULL DEFAULT 'daily' CHECK (granularity IN ('daily', 'weekly', 'monthly', 'shift')),
  shift_tag TEXT, -- e.g., 'morning', 'lunch', 'dinner', 'night'
  
  -- Source of data
  source TEXT NOT NULL DEFAULT 'manual_qualitative' CHECK (source IN ('mercado_pago', 'manual_numeric', 'manual_qualitative', 'mixed')),
  
  -- Numeric data (optional)
  revenue_local NUMERIC,
  currency_local TEXT DEFAULT 'ARS',
  revenue_usd NUMERIC, -- Normalized
  
  -- Qualitative pulse (always captured)
  pulse_score_1_5 INTEGER CHECK (pulse_score_1_5 BETWEEN 1 AND 5),
  pulse_label TEXT, -- The label shown to user (e.g., "muy flojo", "normal", "excelente")
  
  -- Proxy metrics (based on business type)
  volume_proxy_type TEXT, -- e.g., 'tickets', 'covers', 'orders', 'appointments', 'reservations'
  volume_proxy_value NUMERIC,
  
  -- Events (muy bueno / muy malo)
  notes_good TEXT,
  notes_bad TEXT,
  
  -- AI processing
  tags JSONB DEFAULT '[]'::jsonb,
  confidence_score INTEGER DEFAULT 50 CHECK (confidence_score BETWEEN 0 AND 100),
  processed_at TIMESTAMPTZ,
  brain_updated BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create unique index to prevent duplicate entries for same date+shift
CREATE UNIQUE INDEX pulse_checkins_unique_entry 
  ON public.pulse_checkins (business_id, applies_to_date, shift_tag) 
  WHERE shift_tag IS NOT NULL;

CREATE UNIQUE INDEX pulse_checkins_unique_daily 
  ON public.pulse_checkins (business_id, applies_to_date) 
  WHERE shift_tag IS NULL AND granularity = 'daily';

-- Indexes for querying
CREATE INDEX pulse_checkins_business_date ON public.pulse_checkins (business_id, applies_to_date DESC);
CREATE INDEX pulse_checkins_granularity ON public.pulse_checkins (business_id, granularity);

-- Enable RLS
ALTER TABLE public.pulse_checkins ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can manage pulse checkins of their own businesses
CREATE POLICY "Users can manage pulse checkins of own businesses"
  ON public.pulse_checkins
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE businesses.id = pulse_checkins.business_id
        AND businesses.owner_id = auth.uid()
    )
  );

-- Create pulse_blueprints table to store business-type-specific check-in configurations
CREATE TABLE public.pulse_blueprints (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_type TEXT NOT NULL,
  sector TEXT NOT NULL,
  
  -- Blueprint configuration
  selling_model_base TEXT NOT NULL,
  pregunta_principal_base TEXT NOT NULL,
  proxy_base TEXT,
  numeric_prompt_base TEXT,
  shift_mode_base TEXT DEFAULT 'optional' CHECK (shift_mode_base IN ('none', 'optional', 'required')),
  
  -- Labels for 1-5 scale
  labels_1_5 JSONB NOT NULL DEFAULT '{"1": "muy flojo", "2": "flojo", "3": "normal", "4": "bien", "5": "excelente"}'::jsonb,
  
  -- Event suggestions
  eventos_good_base TEXT[],
  eventos_bad_base TEXT[],
  
  -- Brain adaptation rules
  adaptacion_por_brain TEXT,
  
  -- Frequency recommendation
  recommended_frequency TEXT DEFAULT 'daily',
  
  -- Active status
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(business_type)
);

-- Enable RLS (read-only for all users)
ALTER TABLE public.pulse_blueprints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read pulse blueprints"
  ON public.pulse_blueprints
  FOR SELECT
  USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_pulse_checkins_updated_at
  BEFORE UPDATE ON public.pulse_checkins
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pulse_blueprints_updated_at
  BEFORE UPDATE ON public.pulse_blueprints
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();