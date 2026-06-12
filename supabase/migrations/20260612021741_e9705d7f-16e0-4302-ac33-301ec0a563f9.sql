CREATE TABLE public.ops_incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text NOT NULL CHECK (source IN ('app','blog','edge_fn','db','seo')),
  category text NOT NULL CHECK (category IN ('error','ux','perf','seo','content','structural','network')),
  severity text NOT NULL DEFAULT 'medium' CHECK (severity IN ('critical','high','medium','low')),
  title text NOT NULL,
  where_path text,
  detected_by text NOT NULL,
  context jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','auto_fixing','fixed','ignored','manual_required')),
  fix_strategy text,
  fix_result jsonb,
  fix_attempts int NOT NULL DEFAULT 0,
  fingerprint text,
  occurrences int NOT NULL DEFAULT 1,
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  fixed_at timestamptz,
  user_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_ops_incidents_status ON public.ops_incidents(status, severity, created_at DESC);
CREATE INDEX idx_ops_incidents_source ON public.ops_incidents(source, category);
CREATE INDEX idx_ops_incidents_fingerprint ON public.ops_incidents(fingerprint) WHERE fingerprint IS NOT NULL;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.ops_incidents TO authenticated;
GRANT ALL ON public.ops_incidents TO service_role;

ALTER TABLE public.ops_incidents ENABLE ROW LEVEL SECURITY;

-- Admins can view everything
CREATE POLICY "Admins can view all incidents"
  ON public.ops_incidents FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Any authenticated user can insert an incident (the edge function gates this further)
CREATE POLICY "Authenticated can report incidents"
  ON public.ops_incidents FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Admins can update / delete
CREATE POLICY "Admins can update incidents"
  ON public.ops_incidents FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete incidents"
  ON public.ops_incidents FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_ops_incidents_updated_at
  BEFORE UPDATE ON public.ops_incidents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();