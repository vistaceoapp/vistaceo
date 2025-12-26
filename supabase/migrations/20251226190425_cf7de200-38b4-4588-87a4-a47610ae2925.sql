-- =====================================================
-- FASE 3: Playbooks System + Focus Engine
-- =====================================================

-- Añadir campos de playbook a business_type_configs
ALTER TABLE public.business_type_configs 
ADD COLUMN IF NOT EXISTS playbook JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS mission_templates JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS signal_weights JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS priority_rules JSONB DEFAULT '[]'::jsonb;

-- Tabla de misiones plantilla por tipo (más granular)
CREATE TABLE IF NOT EXISTS public.mission_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_type TEXT NOT NULL,
  focus_area TEXT NOT NULL, -- 'ventas', 'reputacion', 'eficiencia', 'marketing'
  template_key TEXT NOT NULL, -- 'increase_ticket', 'improve_reviews', etc
  title_template TEXT NOT NULL, -- "Aumentar ticket promedio de {{current}} a {{target}}"
  description_template TEXT NOT NULL,
  required_variables JSONB NOT NULL DEFAULT '[]'::jsonb, -- variables MVC necesarias
  required_signals JSONB DEFAULT '[]'::jsonb, -- señales que deben existir
  steps_template JSONB NOT NULL DEFAULT '[]'::jsonb,
  impact_formula TEXT, -- cómo calcular impacto estimado
  effort_score INTEGER DEFAULT 5,
  priority_base INTEGER DEFAULT 5, -- prioridad base, ajustada por focus
  tags JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(business_type, template_key)
);

CREATE INDEX idx_mission_templates_type ON public.mission_templates(business_type);
CREATE INDEX idx_mission_templates_focus ON public.mission_templates(focus_area);

-- Tabla de configuración de focus por empresa
CREATE TABLE IF NOT EXISTS public.business_focus_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  current_focus TEXT NOT NULL DEFAULT 'ventas', -- 'ventas', 'reputacion', 'eficiencia', 'marketing'
  secondary_focus TEXT,
  focus_weights JSONB NOT NULL DEFAULT '{"ventas": 1, "reputacion": 0.8, "eficiencia": 0.6, "marketing": 0.5}'::jsonb,
  weekly_action_limit INTEGER DEFAULT 3,
  daily_checkin_enabled BOOLEAN DEFAULT true,
  proactive_suggestions BOOLEAN DEFAULT true,
  auto_adjust_focus BOOLEAN DEFAULT false, -- si el sistema puede cambiar foco basado en señales
  focus_history JSONB DEFAULT '[]'::jsonb, -- historial de cambios de foco
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(business_id)
);

CREATE INDEX idx_business_focus_business ON public.business_focus_config(business_id);

-- RLS
ALTER TABLE public.mission_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_focus_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read mission templates" ON public.mission_templates
  FOR SELECT USING (true);

CREATE POLICY "Users can manage focus config of own businesses" ON public.business_focus_config
  FOR ALL USING (EXISTS (
    SELECT 1 FROM businesses WHERE businesses.id = business_focus_config.business_id AND businesses.owner_id = auth.uid()
  ));

-- Trigger
CREATE TRIGGER update_mission_templates_updated_at
  BEFORE UPDATE ON public.mission_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_business_focus_config_updated_at
  BEFORE UPDATE ON public.business_focus_config
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();