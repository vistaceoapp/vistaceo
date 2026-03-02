
-- =============================================
-- VISTACEO BLOG OS - Phase 1: Registry + Quality + Auditor
-- =============================================

-- S1: Content Registry - registro único de cada nota
CREATE TABLE public.blog_content_registry (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  url text NOT NULL,
  pipeline_state text NOT NULL DEFAULT 'draft',
  category text,
  template_used text,
  primary_keyword text,
  keyword_variants text[] DEFAULT '{}',
  cluster_assigned text,
  published_at timestamptz,
  last_improved_at timestamptz,
  score_global numeric DEFAULT 0,
  score_coherence numeric DEFAULT 0,
  score_promises numeric DEFAULT 0,
  score_technical numeric DEFAULT 0,
  score_seo numeric DEFAULT 0,
  score_interlinking numeric DEFAULT 0,
  score_ux numeric DEFAULT 0,
  score_conversion numeric DEFAULT 0,
  internal_links_out jsonb DEFAULT '[]',
  internal_links_in jsonb DEFAULT '[]',
  assets_referenced jsonb DEFAULT '[]',
  fault_radar jsonb DEFAULT '[]',
  fix_history jsonb DEFAULT '[]',
  title_meta_history jsonb DEFAULT '[]',
  experiment_history jsonb DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(post_id)
);

-- S1: Content Versions - versionado obligatorio
CREATE TABLE public.blog_content_versions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  registry_id uuid NOT NULL REFERENCES public.blog_content_registry(id) ON DELETE CASCADE,
  version_number integer NOT NULL DEFAULT 1,
  diff_summary text NOT NULL,
  change_trigger text NOT NULL,
  expected_result text,
  snapshot_data jsonb NOT NULL DEFAULT '{}',
  scores_at_version jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_blog_versions_registry ON public.blog_content_versions(registry_id);

-- S2: Quality Gate Results - resultados por gate
CREATE TABLE public.blog_quality_results (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  registry_id uuid NOT NULL REFERENCES public.blog_content_registry(id) ON DELETE CASCADE,
  gate_name text NOT NULL,
  passed boolean NOT NULL DEFAULT false,
  score numeric DEFAULT 0,
  details jsonb DEFAULT '{}',
  issues_found jsonb DEFAULT '[]',
  auto_fixable boolean DEFAULT false,
  fixed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_blog_quality_registry ON public.blog_quality_results(registry_id);

-- S4: Audit Issues - issues técnicos encontrados
CREATE TABLE public.blog_audit_issues (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  registry_id uuid NOT NULL REFERENCES public.blog_content_registry(id) ON DELETE CASCADE,
  post_id uuid NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  issue_type text NOT NULL,
  severity text NOT NULL DEFAULT 'medium',
  description text NOT NULL,
  location text,
  auto_fixable boolean DEFAULT false,
  fix_applied boolean DEFAULT false,
  fix_details text,
  fixed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_blog_audit_post ON public.blog_audit_issues(post_id);
CREATE INDEX idx_blog_audit_severity ON public.blog_audit_issues(severity);

-- S3: Task Queue - colas Q1-Q5
CREATE TABLE public.blog_task_queue (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  registry_id uuid REFERENCES public.blog_content_registry(id) ON DELETE CASCADE,
  post_id uuid REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  queue text NOT NULL DEFAULT 'Q4',
  priority integer NOT NULL DEFAULT 5,
  task_type text NOT NULL,
  description text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  payload jsonb DEFAULT '{}',
  result jsonb,
  attempts integer DEFAULT 0,
  max_attempts integer DEFAULT 3,
  scheduled_for timestamptz DEFAULT now(),
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_blog_tasks_status ON public.blog_task_queue(status, queue, priority);
CREATE INDEX idx_blog_tasks_scheduled ON public.blog_task_queue(scheduled_for) WHERE status = 'pending';

-- Enable RLS on all tables
ALTER TABLE public.blog_content_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_content_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_quality_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_audit_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_task_queue ENABLE ROW LEVEL SECURITY;

-- RLS: service_role + authenticated for admin access
CREATE POLICY "Service role full access" ON public.blog_content_registry FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Admins can manage registry" ON public.blog_content_registry FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Public can read registry" ON public.blog_content_registry FOR SELECT USING (true);

CREATE POLICY "Service role full access" ON public.blog_content_versions FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Admins can manage versions" ON public.blog_content_versions FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Public can read versions" ON public.blog_content_versions FOR SELECT USING (true);

CREATE POLICY "Service role full access" ON public.blog_quality_results FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Admins can manage quality" ON public.blog_quality_results FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Public can read quality" ON public.blog_quality_results FOR SELECT USING (true);

CREATE POLICY "Service role full access" ON public.blog_audit_issues FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Admins can manage audit" ON public.blog_audit_issues FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Public can read audit" ON public.blog_audit_issues FOR SELECT USING (true);

CREATE POLICY "Service role full access" ON public.blog_task_queue FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Admins can manage tasks" ON public.blog_task_queue FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_blog_content_registry_updated_at
  BEFORE UPDATE ON public.blog_content_registry
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_blog_task_queue_updated_at
  BEFORE UPDATE ON public.blog_task_queue
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
