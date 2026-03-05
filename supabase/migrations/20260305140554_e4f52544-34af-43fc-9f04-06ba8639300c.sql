
-- Obsessive Editor 24/7: Loop tracking table
CREATE TABLE public.obsessive_editor_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_id text NOT NULL,
  phase text NOT NULL DEFAULT 'scan',
  priority text NOT NULL DEFAULT 'P2',
  status text NOT NULL DEFAULT 'pending',
  target_post_id uuid REFERENCES public.blog_posts(id) ON DELETE SET NULL,
  target_slug text,
  action_type text NOT NULL,
  action_details jsonb DEFAULT '{}'::jsonb,
  result jsonb DEFAULT '{}'::jsonb,
  error_message text,
  rollback_snapshot jsonb,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index for querying by status and priority
CREATE INDEX idx_obsessive_runs_status ON public.obsessive_editor_runs(status, priority);
CREATE INDEX idx_obsessive_runs_cycle ON public.obsessive_editor_runs(cycle_id);

-- RLS
ALTER TABLE public.obsessive_editor_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages obsessive runs"
  ON public.obsessive_editor_runs FOR ALL
  USING (auth.role() = 'service_role'::text);

CREATE POLICY "Admins read obsessive runs"
  ON public.obsessive_editor_runs FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Content blocks library table
CREATE TABLE public.blog_content_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  block_type text NOT NULL,
  block_name text NOT NULL,
  template_md text NOT NULL,
  intent_match text[] DEFAULT '{}'::text[],
  category_match text[] DEFAULT '{}'::text[],
  usage_count integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.blog_content_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages blocks"
  ON public.blog_content_blocks FOR ALL
  USING (auth.role() = 'service_role'::text);

CREATE POLICY "Admins manage blocks"
  ON public.blog_content_blocks FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Public read blocks"
  ON public.blog_content_blocks FOR SELECT
  USING (true);

-- Enable realtime for obsessive runs (live monitoring)
ALTER PUBLICATION supabase_realtime ADD TABLE public.obsessive_editor_runs;
