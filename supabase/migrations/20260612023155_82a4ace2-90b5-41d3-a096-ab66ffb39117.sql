CREATE TABLE public.blog_autoheal_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  incident_id uuid REFERENCES public.ops_incidents(id) ON DELETE SET NULL,
  slug text NOT NULL,
  issues text[] NOT NULL DEFAULT '{}',
  fields_changed text[] NOT NULL DEFAULT '{}',
  before_snapshot jsonb NOT NULL DEFAULT '{}',
  after_snapshot jsonb NOT NULL DEFAULT '{}',
  ai_model text,
  ai_calls integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'applied' CHECK (status IN ('applied','skipped','failed','manual_required')),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.blog_autoheal_runs TO authenticated;
GRANT ALL ON public.blog_autoheal_runs TO service_role;

ALTER TABLE public.blog_autoheal_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view autoheal runs"
ON public.blog_autoheal_runs FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_blog_autoheal_runs_post ON public.blog_autoheal_runs(post_id, created_at DESC);
CREATE INDEX idx_blog_autoheal_runs_incident ON public.blog_autoheal_runs(incident_id);