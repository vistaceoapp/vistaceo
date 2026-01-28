-- Blog Factory: Complete Schema for VistaCEO Blog System

-- 1) Blog Configuration (key-value store)
CREATE TABLE public.blog_config (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2) Blog Topics (editorial backlog with 200 seed titles)
CREATE TABLE public.blog_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_base TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  pillar TEXT NOT NULL, -- 'empleo', 'ia_aplicada', 'liderazgo', 'servicios', 'emprender', 'sistema_inteligente'
  category TEXT,
  country_codes TEXT[] DEFAULT ARRAY['AR', 'CL', 'UY', 'CO', 'EC', 'CR', 'MX', 'PA'],
  sector TEXT,
  intent TEXT DEFAULT 'informational', -- informational, comparative, soft-transactional, navigational
  primary_keyword TEXT,
  secondary_keywords TEXT[] DEFAULT '{}',
  required_subtopics TEXT[] DEFAULT '{}',
  unique_angle_options TEXT[] DEFAULT '{}',
  seasonality TEXT,
  priority_score INTEGER DEFAULT 50,
  generated_filler BOOLEAN DEFAULT false,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3) Blog Plan (annual calendar with 200 slots)
CREATE TABLE public.blog_plan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID REFERENCES public.blog_topics(id) ON DELETE SET NULL,
  planned_date DATE NOT NULL,
  country_code TEXT NOT NULL DEFAULT 'AR',
  pillar TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'planned', -- planned, published, skipped, replaced
  publish_attempts INTEGER DEFAULT 0,
  last_attempt_at TIMESTAMPTZ,
  skip_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4) Blog Posts (published content)
CREATE TABLE public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID REFERENCES public.blog_topics(id) ON DELETE SET NULL,
  plan_id UUID REFERENCES public.blog_plan(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'draft', -- draft, published, archived
  publish_at TIMESTAMPTZ,
  country_code TEXT NOT NULL DEFAULT 'AR',
  sector TEXT,
  category TEXT,
  pillar TEXT,
  tags TEXT[] DEFAULT '{}',
  
  -- Content
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content_md TEXT NOT NULL,
  
  -- SEO
  meta_title TEXT,
  meta_description TEXT,
  canonical_url TEXT,
  primary_keyword TEXT,
  secondary_keywords TEXT[] DEFAULT '{}',
  intent TEXT DEFAULT 'informational',
  required_subtopics TEXT[] DEFAULT '{}',
  unique_angle TEXT,
  
  -- Images
  hero_image_url TEXT,
  image_alt_text TEXT,
  
  -- Links & Sources
  internal_links JSONB DEFAULT '[]',
  external_sources JSONB DEFAULT '[]',
  
  -- Structured Data
  schema_jsonld JSONB DEFAULT '{}',
  
  -- Metadata
  reading_time_min INTEGER DEFAULT 5,
  author_name TEXT DEFAULT 'Equipo VistaCEO',
  author_bio TEXT,
  author_url TEXT,
  
  -- Quality
  quality_gate_report JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5) Blog Runs (audit log for generation attempts)
CREATE TABLE public.blog_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  chosen_topic_id UUID REFERENCES public.blog_topics(id) ON DELETE SET NULL,
  chosen_plan_id UUID REFERENCES public.blog_plan(id) ON DELETE SET NULL,
  result TEXT NOT NULL, -- published, skipped, failed
  skip_reason TEXT,
  notes TEXT,
  quality_gate_report JSONB DEFAULT '{}',
  post_id UUID REFERENCES public.blog_posts(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_blog_posts_status ON public.blog_posts(status);
CREATE INDEX idx_blog_posts_publish_at ON public.blog_posts(publish_at);
CREATE INDEX idx_blog_posts_country_code ON public.blog_posts(country_code);
CREATE INDEX idx_blog_posts_pillar ON public.blog_posts(pillar);
CREATE INDEX idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX idx_blog_plan_status ON public.blog_plan(status);
CREATE INDEX idx_blog_plan_planned_date ON public.blog_plan(planned_date);
CREATE INDEX idx_blog_topics_pillar ON public.blog_topics(pillar);
CREATE INDEX idx_blog_runs_run_at ON public.blog_runs(run_at);

-- Enable RLS
ALTER TABLE public.blog_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_plan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_runs ENABLE ROW LEVEL SECURITY;

-- Public read access for blog_posts (published only)
CREATE POLICY "Public can read published posts"
ON public.blog_posts FOR SELECT
USING (status = 'published');

-- Public read access for blog_topics
CREATE POLICY "Public can read topics"
ON public.blog_topics FOR SELECT
USING (true);

-- Public read for config (needed for sitemap, etc.)
CREATE POLICY "Public can read config"
ON public.blog_config FOR SELECT
USING (true);

-- Authenticated users can manage all blog tables (admin)
CREATE POLICY "Authenticated can manage posts"
ON public.blog_posts FOR ALL
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated can manage topics"
ON public.blog_topics FOR ALL
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated can manage plan"
ON public.blog_plan FOR ALL
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated can manage config"
ON public.blog_config FOR ALL
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated can manage runs"
ON public.blog_runs FOR ALL
USING (auth.role() = 'authenticated');

-- Triggers for updated_at
CREATE TRIGGER update_blog_config_updated_at
BEFORE UPDATE ON public.blog_config
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_blog_topics_updated_at
BEFORE UPDATE ON public.blog_topics
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_blog_plan_updated_at
BEFORE UPDATE ON public.blog_plan
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at
BEFORE UPDATE ON public.blog_posts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial config
INSERT INTO public.blog_config (key, value) VALUES
('settings', '{"go_live_date": null, "annual_target_posts": 200, "horizon_days": 365, "autopost_enabled": false, "random_seed": 42}'),
('per_country_targets', '{"AR": 25, "CL": 25, "UY": 25, "CO": 25, "EC": 25, "CR": 25, "MX": 25, "PA": 25}'),
('pillars', '["empleo", "ia_aplicada", "liderazgo", "servicios", "emprender", "sistema_inteligente"]');