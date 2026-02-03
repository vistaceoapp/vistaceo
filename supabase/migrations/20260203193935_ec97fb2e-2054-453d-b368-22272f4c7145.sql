-- Create public bucket for SSG static HTML pages
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'blog-ssg-pages', 
  'blog-ssg-pages', 
  true,
  5242880, -- 5MB max per file
  ARRAY['text/html', 'application/json']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['text/html', 'application/json'];

-- Allow public read access to SSG pages
CREATE POLICY "Public can read SSG pages"
ON storage.objects FOR SELECT
USING (bucket_id = 'blog-ssg-pages');

-- Allow service role to manage SSG pages
CREATE POLICY "Service role can manage SSG pages"
ON storage.objects FOR ALL
USING (bucket_id = 'blog-ssg-pages' AND auth.role() = 'service_role');

-- Create audit log table for SSG generation
CREATE TABLE IF NOT EXISTS public.blog_ssg_audits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL,
  action text NOT NULL, -- 'generate', 'delete', 'error'
  success boolean NOT NULL DEFAULT true,
  error_message text,
  html_size_bytes integer,
  generation_time_ms integer,
  triggered_by text DEFAULT 'manual', -- 'manual', 'publish', 'batch', 'cron'
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index for quick lookups
CREATE INDEX IF NOT EXISTS idx_blog_ssg_audits_slug ON public.blog_ssg_audits(slug);
CREATE INDEX IF NOT EXISTS idx_blog_ssg_audits_created ON public.blog_ssg_audits(created_at DESC);

-- RLS for audit table (service role only for writes, authenticated can read)
ALTER TABLE public.blog_ssg_audits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage SSG audits"
ON public.blog_ssg_audits FOR ALL
USING (auth.role() = 'service_role');

CREATE POLICY "Authenticated can read SSG audits"
ON public.blog_ssg_audits FOR SELECT
USING (auth.role() = 'authenticated');