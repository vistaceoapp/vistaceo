CREATE INDEX IF NOT EXISTS idx_blog_posts_published_recent
  ON public.blog_posts (publish_at DESC)
  WHERE status = 'published';

CREATE INDEX IF NOT EXISTS idx_blog_posts_status_publish_at
  ON public.blog_posts (status, publish_at DESC);

CREATE INDEX IF NOT EXISTS idx_ops_incidents_fingerprint_status
  ON public.ops_incidents (fingerprint, status, created_at DESC)
  WHERE fingerprint IS NOT NULL;

ANALYZE public.blog_posts;
ANALYZE public.ops_incidents;
ANALYZE public.user_activity_logs;