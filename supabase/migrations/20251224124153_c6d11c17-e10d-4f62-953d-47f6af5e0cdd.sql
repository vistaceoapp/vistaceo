-- ===========================================
-- FEATURE 1 & 2: Snapshots para diagnóstico y evolución
-- ===========================================

-- Tabla de snapshots (Snapshot 0 = Baseline)
CREATE TABLE public.snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  source TEXT NOT NULL DEFAULT 'checkin', -- 'baseline', 'checkin_weekly', 'checkin_monthly', 'auto'
  total_score INTEGER DEFAULT 0, -- Score 0-100
  dimensions_json JSONB DEFAULT '{}', -- Sub-scores por dimensión
  explanation_json JSONB DEFAULT '{}', -- Explicación del score
  strengths JSONB DEFAULT '[]', -- Fortalezas detectadas
  weaknesses JSONB DEFAULT '[]', -- Debilidades detectadas
  top_actions JSONB DEFAULT '[]', -- Top 3 acciones sugeridas
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.snapshots ENABLE ROW LEVEL SECURITY;

-- RLS Policy
CREATE POLICY "Users can manage snapshots of own businesses" 
ON public.snapshots 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM businesses 
  WHERE businesses.id = snapshots.business_id 
  AND businesses.owner_id = auth.uid()
));

-- ===========================================
-- FEATURE 2: Check-ins semanales/mensuales
-- ===========================================

CREATE TABLE public.business_checkins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  checkin_type TEXT NOT NULL DEFAULT 'weekly', -- 'weekly', 'monthly'
  answers_json JSONB DEFAULT '{}', -- Respuestas del checkin
  snapshot_id UUID REFERENCES public.snapshots(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.business_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage checkins of own businesses" 
ON public.business_checkins 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM businesses 
  WHERE businesses.id = business_checkins.business_id 
  AND businesses.owner_id = auth.uid()
));

-- ===========================================
-- FEATURE 3: Feedback loop de recomendaciones
-- ===========================================

CREATE TABLE public.recommendations_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  action_id UUID REFERENCES public.daily_actions(id) ON DELETE SET NULL,
  mission_id UUID REFERENCES public.missions(id) ON DELETE SET NULL,
  opportunity_id UUID REFERENCES public.opportunities(id) ON DELETE SET NULL,
  applied_status TEXT NOT NULL DEFAULT 'pending', -- 'applied', 'tried', 'not_applied', 'pending'
  notes TEXT,
  blocker TEXT, -- Qué te trabó
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.recommendations_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage feedback of own businesses" 
ON public.recommendations_feedback 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM businesses 
  WHERE businesses.id = recommendations_feedback.business_id 
  AND businesses.owner_id = auth.uid()
));

-- ===========================================
-- FEATURE 5: Alertas (positivas, negativas, riesgo)
-- ===========================================

CREATE TABLE public.alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL DEFAULT 'negative', -- 'positive', 'negative', 'risk'
  category TEXT NOT NULL DEFAULT 'other', -- 'cliente', 'operacion', 'equipo', 'finanzas', 'reputacion', 'other'
  text_content TEXT,
  audio_url TEXT,
  ai_summary_json JSONB DEFAULT '{}', -- Resumen, plan de respuesta, lección
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage alerts of own businesses" 
ON public.alerts 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM businesses 
  WHERE businesses.id = alerts.business_id 
  AND businesses.owner_id = auth.uid()
));

-- ===========================================
-- FEATURE 5: Audio onboarding - perfil extraído
-- ===========================================

CREATE TABLE public.business_profile_extracted (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  source TEXT NOT NULL DEFAULT 'form', -- 'audio', 'form'
  data_json JSONB DEFAULT '{}', -- Datos extraídos (rubro, UVP, cliente ideal, etc.)
  transcript TEXT, -- Transcripción del audio
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.business_profile_extracted ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage extracted profiles of own businesses" 
ON public.business_profile_extracted 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM businesses 
  WHERE businesses.id = business_profile_extracted.business_id 
  AND businesses.owner_id = auth.uid()
));

-- ===========================================
-- FEATURE 4: Learning/Tendencias
-- ===========================================

CREATE TABLE public.learning_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL DEFAULT 'trend', -- 'trend', 'opportunity', 'tip'
  title TEXT NOT NULL,
  content TEXT,
  action_steps JSONB DEFAULT '[]', -- Pasos de acción si es oportunidad
  source TEXT, -- De dónde viene la información
  is_read BOOLEAN DEFAULT false,
  is_saved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.learning_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage learning items of own businesses" 
ON public.learning_items 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM businesses 
  WHERE businesses.id = learning_items.business_id 
  AND businesses.owner_id = auth.uid()
));

-- ===========================================
-- Agregar campo baseline_snapshot_id a businesses
-- ===========================================

ALTER TABLE public.businesses 
ADD COLUMN IF NOT EXISTS baseline_snapshot_id UUID REFERENCES public.snapshots(id) ON DELETE SET NULL;

ALTER TABLE public.businesses 
ADD COLUMN IF NOT EXISTS baseline_date TIMESTAMP WITH TIME ZONE;

-- ===========================================
-- Índices para performance
-- ===========================================

CREATE INDEX idx_snapshots_business_id ON public.snapshots(business_id);
CREATE INDEX idx_snapshots_created_at ON public.snapshots(created_at DESC);
CREATE INDEX idx_business_checkins_business_id ON public.business_checkins(business_id);
CREATE INDEX idx_recommendations_feedback_business_id ON public.recommendations_feedback(business_id);
CREATE INDEX idx_alerts_business_id ON public.alerts(business_id);
CREATE INDEX idx_learning_items_business_id ON public.learning_items(business_id);