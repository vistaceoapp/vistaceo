
-- Blog Experiments (A/B tests with guardrails)
CREATE TABLE public.blog_experiments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registry_id uuid REFERENCES public.blog_content_registry(id) ON DELETE CASCADE,
  post_id uuid REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  experiment_type text NOT NULL,
  hypothesis text NOT NULL,
  variant_a jsonb NOT NULL DEFAULT '{}',
  variant_b jsonb NOT NULL DEFAULT '{}',
  active_variant text DEFAULT 'A',
  status text DEFAULT 'running',
  measurement_window_hours int DEFAULT 168,
  started_at timestamptz DEFAULT now(),
  ended_at timestamptz,
  results jsonb DEFAULT '{}',
  decision text,
  guardrail_triggered boolean DEFAULT false,
  guardrail_reason text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- CTA Block Library
CREATE TABLE public.blog_cta_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  block_type text NOT NULL,
  name text NOT NULL,
  content_md text NOT NULL,
  intent_match text[] DEFAULT '{}',
  country_match text[] DEFAULT '{}',
  sector_match text[] DEFAULT '{}',
  conversion_stage text DEFAULT 'discovery',
  priority int DEFAULT 50,
  is_active boolean DEFAULT true,
  usage_count int DEFAULT 0,
  conversion_rate numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Cluster Graph Edges
CREATE TABLE public.blog_cluster_edges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_registry_id uuid REFERENCES public.blog_content_registry(id) ON DELETE CASCADE,
  target_registry_id uuid REFERENCES public.blog_content_registry(id) ON DELETE CASCADE,
  edge_type text NOT NULL,
  weight numeric DEFAULT 0.5,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  UNIQUE(source_registry_id, target_registry_id, edge_type)
);

-- RLS for experiments
ALTER TABLE public.blog_experiments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage experiments" ON public.blog_experiments FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Service role experiments" ON public.blog_experiments FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Public read experiments" ON public.blog_experiments FOR SELECT USING (true);

-- RLS for CTA blocks
ALTER TABLE public.blog_cta_blocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage cta blocks" ON public.blog_cta_blocks FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Service role cta blocks" ON public.blog_cta_blocks FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Public read cta blocks" ON public.blog_cta_blocks FOR SELECT USING (true);

-- RLS for cluster edges
ALTER TABLE public.blog_cluster_edges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage cluster edges" ON public.blog_cluster_edges FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Service role cluster edges" ON public.blog_cluster_edges FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Public read cluster edges" ON public.blog_cluster_edges FOR SELECT USING (true);

-- Triggers
CREATE TRIGGER update_blog_experiments_updated_at BEFORE UPDATE ON public.blog_experiments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_blog_cta_blocks_updated_at BEFORE UPDATE ON public.blog_cta_blocks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes
CREATE INDEX idx_blog_experiments_status ON public.blog_experiments(status);
CREATE INDEX idx_blog_experiments_post_id ON public.blog_experiments(post_id);
CREATE INDEX idx_blog_cta_blocks_type ON public.blog_cta_blocks(block_type);
CREATE INDEX idx_blog_cta_blocks_active ON public.blog_cta_blocks(is_active);
CREATE INDEX idx_blog_cluster_edges_source ON public.blog_cluster_edges(source_registry_id);
CREATE INDEX idx_blog_cluster_edges_target ON public.blog_cluster_edges(target_registry_id);
