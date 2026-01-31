-- ============================================
-- MOTOR DE PREDICCIONES PLANETARIO - ESQUEMA
-- ============================================

-- 1. Blueprints causales por tipo de negocio
CREATE TABLE public.causal_blueprints (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_type TEXT NOT NULL UNIQUE,
  sector TEXT NOT NULL,
  display_name TEXT NOT NULL,
  -- Grafo causal: nodos y aristas
  causal_graph JSONB NOT NULL DEFAULT '{"nodes": [], "edges": []}',
  -- Métricas nativas del tipo
  native_metrics JSONB NOT NULL DEFAULT '[]',
  -- Señales tempranas típicas
  leading_indicators JSONB NOT NULL DEFAULT '[]',
  -- Palancas controlables
  controllable_levers JSONB NOT NULL DEFAULT '[]',
  -- Riesgos estructurales del rubro
  structural_risks JSONB NOT NULL DEFAULT '[]',
  -- Estacionalidad típica
  seasonality_pattern JSONB NOT NULL DEFAULT '{}',
  -- Predicciones "signature" del tipo
  signature_predictions JSONB NOT NULL DEFAULT '[]',
  -- Shocks típicos por país
  typical_shocks JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Predicciones generadas
CREATE TABLE public.predictions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  brain_id UUID REFERENCES public.business_brains(id),
  -- Identificación
  domain TEXT NOT NULL, -- cashflow, demand, operations, customer, etc.
  horizon_ring TEXT NOT NULL, -- H0, H1, H2, ..., H7
  -- Contenido
  title TEXT NOT NULL,
  summary TEXT,
  -- Clasificación
  publication_level TEXT NOT NULL DEFAULT 'C', -- A, B, C
  probability NUMERIC(4,3) NOT NULL DEFAULT 0.5, -- 0.000-1.000
  confidence NUMERIC(4,3) NOT NULL DEFAULT 0.5,
  -- Banda de incertidumbre
  uncertainty_band JSONB NOT NULL DEFAULT '{"metric": "other", "unit": "PERCENT", "low": 0, "base": 0, "high": 0}',
  -- Ventana temporal
  time_window JSONB NOT NULL DEFAULT '{}',
  -- Impacto estimado
  estimated_impact JSONB NOT NULL DEFAULT '{}',
  -- Evidencia
  evidence JSONB NOT NULL DEFAULT '{"evidence_strength": "low", "signals_internal_top": [], "signals_external_top": [], "assumptions": [], "data_gaps": []}',
  -- Cadena causal
  causal_chain JSONB NOT NULL DEFAULT '{"nodes": [], "edges": []}',
  -- Breakpoint
  is_breakpoint BOOLEAN DEFAULT false,
  breakpoint_thresholds JSONB,
  -- Acciones recomendadas
  recommended_actions JSONB NOT NULL DEFAULT '[]',
  -- Acciones posibles (convertir a misión, monitorear, simular)
  available_actions JSONB NOT NULL DEFAULT '{}',
  -- Payload visual
  visual_payload JSONB NOT NULL DEFAULT '{}',
  -- Estado
  status TEXT NOT NULL DEFAULT 'active', -- active, dismissed, converted, expired, verified
  converted_to_mission_id UUID,
  dismissed_at TIMESTAMP WITH TIME ZONE,
  verified_at TIMESTAMP WITH TIME ZONE,
  verification_result TEXT, -- occurred, partially_occurred, not_occurred
  verification_notes TEXT,
  -- Metadatos
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. Eventos de calibración (micro-preguntas)
CREATE TABLE public.prediction_calibrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  prediction_id UUID REFERENCES public.predictions(id) ON DELETE SET NULL,
  -- Definición
  priority INTEGER DEFAULT 3, -- 1-5
  reason TEXT NOT NULL,
  improves JSONB NOT NULL DEFAULT '[]', -- qué predicciones mejora
  -- Input
  input_type TEXT NOT NULL DEFAULT 'select', -- tap, slider, minmax, quick_number, select
  question TEXT NOT NULL,
  unit TEXT,
  options JSONB, -- para select/tap
  min_value NUMERIC,
  max_value NUMERIC,
  default_value NUMERIC,
  -- Respuesta
  answer JSONB,
  answered_at TIMESTAMP WITH TIME ZONE,
  -- Impacto real
  delta_confidence NUMERIC(4,3),
  delta_uncertainty_reduction NUMERIC(4,3),
  -- Estado
  status TEXT NOT NULL DEFAULT 'pending', -- pending, answered, skipped, expired
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. Historial de verificación (ledger)
CREATE TABLE public.prediction_ledger (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  prediction_id UUID NOT NULL REFERENCES public.predictions(id) ON DELETE CASCADE,
  -- Snapshot de la predicción al momento de emisión
  prediction_snapshot JSONB NOT NULL,
  -- Resultado real
  actual_outcome JSONB,
  outcome_recorded_at TIMESTAMP WITH TIME ZONE,
  -- Métricas de calidad
  accuracy_score NUMERIC(4,3), -- 0-1
  error_margin NUMERIC,
  -- Aprendizaje
  learning_notes TEXT,
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 5. Configuración del gemelo digital por negocio
CREATE TABLE public.digital_twin_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL UNIQUE REFERENCES public.businesses(id) ON DELETE CASCADE,
  -- Perfil de riesgo inferido
  risk_personality TEXT NOT NULL DEFAULT 'balanced', -- conservative, balanced, aggressive
  -- Pesos personalizados del grafo causal
  custom_driver_weights JSONB NOT NULL DEFAULT '{}',
  -- Métricas baseline (lo "normal" del negocio)
  baseline_metrics JSONB NOT NULL DEFAULT '{}',
  -- Restricciones conocidas
  known_constraints JSONB NOT NULL DEFAULT '[]',
  -- Supuestos activos
  active_assumptions JSONB NOT NULL DEFAULT '[]',
  -- Calibración histórica
  calibration_accuracy JSONB NOT NULL DEFAULT '{}', -- accuracy por horizonte
  -- Drift detection
  drift_status TEXT DEFAULT 'stable', -- stable, drifting, regime_change
  last_drift_check TIMESTAMP WITH TIME ZONE,
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_predictions_business_id ON public.predictions(business_id);
CREATE INDEX idx_predictions_status ON public.predictions(status);
CREATE INDEX idx_predictions_horizon ON public.predictions(horizon_ring);
CREATE INDEX idx_predictions_domain ON public.predictions(domain);
CREATE INDEX idx_prediction_calibrations_business ON public.prediction_calibrations(business_id);
CREATE INDEX idx_prediction_calibrations_status ON public.prediction_calibrations(status);
CREATE INDEX idx_prediction_ledger_business ON public.prediction_ledger(business_id);

-- RLS Policies
ALTER TABLE public.causal_blueprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prediction_calibrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prediction_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.digital_twin_config ENABLE ROW LEVEL SECURITY;

-- Blueprints son públicos para lectura
CREATE POLICY "Anyone can read causal blueprints"
  ON public.causal_blueprints FOR SELECT
  USING (true);

-- Solo admins pueden modificar blueprints (via service role)

-- Predicciones: usuarios ven las de sus negocios
CREATE POLICY "Users can manage predictions of own businesses"
  ON public.predictions FOR ALL
  USING (EXISTS (
    SELECT 1 FROM businesses
    WHERE businesses.id = predictions.business_id
    AND businesses.owner_id = auth.uid()
  ));

-- Calibraciones
CREATE POLICY "Users can manage calibrations of own businesses"
  ON public.prediction_calibrations FOR ALL
  USING (EXISTS (
    SELECT 1 FROM businesses
    WHERE businesses.id = prediction_calibrations.business_id
    AND businesses.owner_id = auth.uid()
  ));

-- Ledger
CREATE POLICY "Users can manage ledger of own businesses"
  ON public.prediction_ledger FOR ALL
  USING (EXISTS (
    SELECT 1 FROM businesses
    WHERE businesses.id = prediction_ledger.business_id
    AND businesses.owner_id = auth.uid()
  ));

-- Digital Twin Config
CREATE POLICY "Users can manage twin config of own businesses"
  ON public.digital_twin_config FOR ALL
  USING (EXISTS (
    SELECT 1 FROM businesses
    WHERE businesses.id = digital_twin_config.business_id
    AND businesses.owner_id = auth.uid()
  ));

-- Trigger para updated_at
CREATE TRIGGER update_predictions_updated_at
  BEFORE UPDATE ON public.predictions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_calibrations_updated_at
  BEFORE UPDATE ON public.prediction_calibrations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_twin_config_updated_at
  BEFORE UPDATE ON public.digital_twin_config
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_causal_blueprints_updated_at
  BEFORE UPDATE ON public.causal_blueprints
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();