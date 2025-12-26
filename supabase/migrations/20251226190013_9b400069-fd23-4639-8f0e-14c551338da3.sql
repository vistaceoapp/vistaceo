-- =====================================================
-- FASE 2: Entity Resolution System
-- Tablas para normalizar entidades (productos, issues, canales)
-- =====================================================

-- Tabla de entidades canónicas
CREATE TABLE public.canonical_entities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL, -- 'product', 'issue', 'channel', 'segment', 'process'
  canonical_name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  synonyms JSONB NOT NULL DEFAULT '[]'::jsonb, -- ["café con leche", "cafe con leche", "cortado grande"]
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb, -- { category, avg_price, frequency, etc }
  mention_count INTEGER DEFAULT 0,
  last_seen_at TIMESTAMP WITH TIME ZONE,
  confidence NUMERIC DEFAULT 0.5,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(business_id, entity_type, canonical_name)
);

-- Índices para búsqueda rápida
CREATE INDEX idx_canonical_entities_business ON public.canonical_entities(business_id);
CREATE INDEX idx_canonical_entities_type ON public.canonical_entities(entity_type);
CREATE INDEX idx_canonical_entities_synonyms ON public.canonical_entities USING GIN(synonyms);

-- Tabla de menciones de entidades (relación entre signals/external_data y entidades)
CREATE TABLE public.entity_mentions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  entity_id UUID NOT NULL REFERENCES public.canonical_entities(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL, -- 'signal', 'external_data', 'review', 'chat'
  source_id UUID NOT NULL,
  raw_text TEXT, -- el texto original donde se mencionó
  context TEXT, -- contexto alrededor de la mención
  sentiment NUMERIC, -- -1 a 1
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_entity_mentions_entity ON public.entity_mentions(entity_id);
CREATE INDEX idx_entity_mentions_business ON public.entity_mentions(business_id);
CREATE INDEX idx_entity_mentions_source ON public.entity_mentions(source_type, source_id);

-- Tabla de relaciones entre entidades
CREATE TABLE public.entity_relations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  entity_a_id UUID NOT NULL REFERENCES public.canonical_entities(id) ON DELETE CASCADE,
  entity_b_id UUID NOT NULL REFERENCES public.canonical_entities(id) ON DELETE CASCADE,
  relation_type TEXT NOT NULL, -- 'causes', 'correlates_with', 'part_of', 'mentioned_with'
  strength NUMERIC DEFAULT 0.5, -- 0-1 qué tan fuerte es la relación
  evidence_count INTEGER DEFAULT 1,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(business_id, entity_a_id, entity_b_id, relation_type)
);

CREATE INDEX idx_entity_relations_business ON public.entity_relations(business_id);
CREATE INDEX idx_entity_relations_entities ON public.entity_relations(entity_a_id, entity_b_id);

-- Tabla de métricas temporales (series de tiempo)
CREATE TABLE public.metrics_timeseries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  metric_name TEXT NOT NULL, -- 'rating_avg', 'review_count', 'sales_daily', etc
  metric_source TEXT NOT NULL, -- 'google_reviews', 'mercadopago', 'manual', etc
  value NUMERIC NOT NULL,
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  granularity TEXT NOT NULL DEFAULT 'daily', -- 'hourly', 'daily', 'weekly', 'monthly'
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(business_id, metric_name, metric_source, period_start, granularity)
);

CREATE INDEX idx_metrics_timeseries_business ON public.metrics_timeseries(business_id);
CREATE INDEX idx_metrics_timeseries_metric ON public.metrics_timeseries(metric_name, metric_source);
CREATE INDEX idx_metrics_timeseries_period ON public.metrics_timeseries(period_start, period_end);

-- RLS Policies
ALTER TABLE public.canonical_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entity_mentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entity_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metrics_timeseries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage entities of own businesses" ON public.canonical_entities
  FOR ALL USING (EXISTS (
    SELECT 1 FROM businesses WHERE businesses.id = canonical_entities.business_id AND businesses.owner_id = auth.uid()
  ));

CREATE POLICY "Users can manage entity mentions of own businesses" ON public.entity_mentions
  FOR ALL USING (EXISTS (
    SELECT 1 FROM businesses WHERE businesses.id = entity_mentions.business_id AND businesses.owner_id = auth.uid()
  ));

CREATE POLICY "Users can manage entity relations of own businesses" ON public.entity_relations
  FOR ALL USING (EXISTS (
    SELECT 1 FROM businesses WHERE businesses.id = entity_relations.business_id AND businesses.owner_id = auth.uid()
  ));

CREATE POLICY "Users can manage metrics of own businesses" ON public.metrics_timeseries
  FOR ALL USING (EXISTS (
    SELECT 1 FROM businesses WHERE businesses.id = metrics_timeseries.business_id AND businesses.owner_id = auth.uid()
  ));

-- Trigger para updated_at
CREATE TRIGGER update_canonical_entities_updated_at
  BEFORE UPDATE ON public.canonical_entities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_entity_relations_updated_at
  BEFORE UPDATE ON public.entity_relations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Añadir campo entities a la tabla signals para guardar entidades extraídas
ALTER TABLE public.signals ADD COLUMN IF NOT EXISTS entities JSONB DEFAULT '[]'::jsonb;