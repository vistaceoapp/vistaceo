-- =============================================
-- FASE 1: BusinessBrain Core Architecture
-- =============================================

-- 1. Business Brains - El cerebro único por empresa
CREATE TABLE public.business_brains (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL UNIQUE REFERENCES public.businesses(id) ON DELETE CASCADE,
  
  -- Tipo de negocio con pesos
  primary_business_type TEXT NOT NULL DEFAULT 'restaurant',
  secondary_business_type TEXT,
  secondary_type_weight NUMERIC DEFAULT 0,
  
  -- Foco actual
  current_focus TEXT NOT NULL DEFAULT 'ventas',
  focus_priority INTEGER DEFAULT 1,
  
  -- Memorias core
  factual_memory JSONB NOT NULL DEFAULT '{}'::jsonb,
  preferences_memory JSONB NOT NULL DEFAULT '{"language": "es", "currency": "ARS", "autopilot_mode": "standard"}'::jsonb,
  decisions_memory JSONB NOT NULL DEFAULT '{"missions_created": 0, "missions_completed": 0, "feedback_given": 0}'::jsonb,
  dynamic_memory JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- MVC Status
  mvc_completion_pct INTEGER DEFAULT 0,
  mvc_gaps JSONB DEFAULT '[]'::jsonb,
  
  -- Quality metrics
  total_signals INTEGER DEFAULT 0,
  confidence_score NUMERIC DEFAULT 0,
  last_learning_at TIMESTAMP WITH TIME ZONE,
  
  -- Versioning
  version INTEGER DEFAULT 1,
  version_history JSONB DEFAULT '[]'::jsonb,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Signals - Registro de todo evento relevante
CREATE TABLE public.signals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  brain_id UUID REFERENCES public.business_brains(id) ON DELETE CASCADE,
  
  -- Signal classification
  signal_type TEXT NOT NULL, -- 'user_input', 'integration_data', 'feedback', 'action_outcome', 'checkin', 'alert', 'chat'
  source TEXT NOT NULL, -- 'manual', 'google_reviews', 'instagram', 'chat', 'mission_feedback', etc.
  
  -- Content
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  raw_text TEXT,
  
  -- Entities extracted
  entities JSONB DEFAULT '[]'::jsonb, -- [{type: 'product', value: 'café con leche', confidence: 0.9}]
  
  -- Confidence & importance
  confidence TEXT DEFAULT 'medium', -- 'high', 'medium', 'low'
  importance INTEGER DEFAULT 5, -- 1-10
  
  -- Processing status
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. Data Gaps - Qué falta para ser preciso
CREATE TABLE public.data_gaps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  brain_id UUID REFERENCES public.business_brains(id) ON DELETE CASCADE,
  
  -- Gap identification
  gap_type TEXT NOT NULL, -- 'mvc_required', 'context_needed', 'metric_missing', 'preference_unclear'
  category TEXT NOT NULL, -- 'operations', 'products', 'customers', 'financials', 'marketing'
  field_name TEXT NOT NULL,
  
  -- Why we need it
  reason TEXT NOT NULL,
  unlocks TEXT NOT NULL, -- What this data unlocks
  
  -- Micro questions
  questions JSONB NOT NULL DEFAULT '[]'::jsonb, -- [{question: "¿Cuál es tu horario pico?", type: "chips", options: ["mañana", "mediodía", "tarde", "noche"]}]
  
  -- Priority & status
  priority INTEGER DEFAULT 5, -- 1-10
  status TEXT DEFAULT 'pending', -- 'pending', 'asked', 'answered', 'skipped'
  
  -- Resolution
  answered_at TIMESTAMP WITH TIME ZONE,
  answer JSONB,
  answered_via TEXT, -- 'chat', 'onboarding', 'checkin', 'direct_question'
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. Recommendation Traces - Trazabilidad de cada output
CREATE TABLE public.recommendation_traces (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  brain_id UUID REFERENCES public.business_brains(id) ON DELETE CASCADE,
  
  -- What was generated
  output_type TEXT NOT NULL, -- 'mission', 'opportunity', 'action', 'chat_response', 'insight'
  output_id UUID, -- Reference to the actual mission/opportunity/action
  output_content JSONB NOT NULL,
  
  -- Traceability core
  based_on JSONB NOT NULL DEFAULT '[]'::jsonb, -- [{type: 'signal', id: 'xxx', summary: 'Review negativa sobre demoras'}]
  confidence TEXT NOT NULL, -- 'high', 'medium', 'low'
  why_summary TEXT NOT NULL, -- 1-2 lines internal explanation
  
  -- Quality gate results
  passed_quality_gate BOOLEAN DEFAULT false,
  quality_gate_score NUMERIC,
  quality_gate_details JSONB DEFAULT '{}'::jsonb,
  
  -- Generic detection
  generic_phrases_detected JSONB DEFAULT '[]'::jsonb,
  is_blocked BOOLEAN DEFAULT false,
  block_reason TEXT,
  
  -- Variables used
  variables_used JSONB DEFAULT '{}'::jsonb, -- {ticket_promedio: 5000, horario_pico: 'mediodía'}
  
  -- Outcome tracking
  user_feedback TEXT, -- 'accepted', 'rejected', 'modified', 'ignored'
  feedback_at TIMESTAMP WITH TIME ZONE,
  feedback_notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 5. Business Type Configs - MVC definitions por tipo
CREATE TABLE public.business_type_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Type identification
  business_type TEXT NOT NULL UNIQUE, -- 'cafeteria', 'restaurant', 'bar', 'fast_casual', 'heladeria', 'panaderia', 'dark_kitchen'
  display_name TEXT NOT NULL,
  
  -- MVC Definition
  mvc_fields JSONB NOT NULL, -- [{field: 'peak_hours', required: true, category: 'operations', question: '¿Cuáles son tus horarios pico?'}]
  
  -- Playbook (for Phase 3, but structure now)
  key_variables JSONB DEFAULT '[]'::jsonb, -- Variables importantes para este tipo
  key_metrics JSONB DEFAULT '[]'::jsonb, -- Métricas core
  common_issues JSONB DEFAULT '[]'::jsonb, -- Issues típicos
  
  -- Generic phrases to block for this type
  blocked_phrases JSONB DEFAULT '[]'::jsonb,
  
  -- Focus weights by type
  focus_weights JSONB DEFAULT '{}'::jsonb, -- {ventas: 1.0, reputacion: 0.8, eficiencia: 0.6}
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.business_brains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_gaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendation_traces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_type_configs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for business_brains
CREATE POLICY "Users can manage brain of own businesses" 
ON public.business_brains FOR ALL 
USING (EXISTS (
  SELECT 1 FROM businesses WHERE businesses.id = business_brains.business_id AND businesses.owner_id = auth.uid()
));

-- RLS Policies for signals
CREATE POLICY "Users can manage signals of own businesses" 
ON public.signals FOR ALL 
USING (EXISTS (
  SELECT 1 FROM businesses WHERE businesses.id = signals.business_id AND businesses.owner_id = auth.uid()
));

-- RLS Policies for data_gaps
CREATE POLICY "Users can manage data gaps of own businesses" 
ON public.data_gaps FOR ALL 
USING (EXISTS (
  SELECT 1 FROM businesses WHERE businesses.id = data_gaps.business_id AND businesses.owner_id = auth.uid()
));

-- RLS Policies for recommendation_traces
CREATE POLICY "Users can manage traces of own businesses" 
ON public.recommendation_traces FOR ALL 
USING (EXISTS (
  SELECT 1 FROM businesses WHERE businesses.id = recommendation_traces.business_id AND businesses.owner_id = auth.uid()
));

-- RLS Policies for business_type_configs (public read)
CREATE POLICY "Anyone can read business type configs" 
ON public.business_type_configs FOR SELECT 
USING (true);

-- Indexes for performance
CREATE INDEX idx_signals_business_id ON public.signals(business_id);
CREATE INDEX idx_signals_type ON public.signals(signal_type);
CREATE INDEX idx_signals_created_at ON public.signals(created_at DESC);
CREATE INDEX idx_data_gaps_business_status ON public.data_gaps(business_id, status);
CREATE INDEX idx_recommendation_traces_business ON public.recommendation_traces(business_id);
CREATE INDEX idx_recommendation_traces_output ON public.recommendation_traces(output_type, output_id);

-- Trigger for updated_at on business_brains
CREATE TRIGGER update_business_brains_updated_at
  BEFORE UPDATE ON public.business_brains
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for updated_at on data_gaps
CREATE TRIGGER update_data_gaps_updated_at
  BEFORE UPDATE ON public.data_gaps
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();