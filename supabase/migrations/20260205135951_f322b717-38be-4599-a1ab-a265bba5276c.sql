-- =============================================
-- USER ACTIVITY TRACKING SYSTEM
-- =============================================

-- Tabla para trackear eventos de usuarios (login, acciones, etc.)
CREATE TABLE public.user_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id UUID REFERENCES public.businesses(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL, -- 'login', 'logout', 'mission_start', 'mission_complete', 'chat_message', 'radar_view', 'checkin', etc.
  event_data JSONB DEFAULT '{}',
  page_path TEXT,
  session_id TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices para búsquedas rápidas
CREATE INDEX idx_user_activity_user_id ON public.user_activity_logs(user_id);
CREATE INDEX idx_user_activity_business_id ON public.user_activity_logs(business_id);
CREATE INDEX idx_user_activity_event_type ON public.user_activity_logs(event_type);
CREATE INDEX idx_user_activity_created_at ON public.user_activity_logs(created_at DESC);

-- Enable RLS
ALTER TABLE public.user_activity_logs ENABLE ROW LEVEL SECURITY;

-- Service role only (admin access via edge functions)
CREATE POLICY "Service role can manage activity logs"
  ON public.user_activity_logs
  FOR ALL
  USING (auth.role() = 'service_role');

-- =============================================
-- WEB ANALYTICS TRACKING
-- =============================================

-- Tabla para analytics de visitas web/blog
CREATE TABLE public.web_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id TEXT NOT NULL, -- anonymous visitor ID
  session_id TEXT NOT NULL,
  page_url TEXT NOT NULL,
  page_path TEXT NOT NULL,
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  device_type TEXT, -- 'desktop', 'mobile', 'tablet'
  browser TEXT,
  country TEXT,
  region TEXT,
  event_type TEXT NOT NULL DEFAULT 'pageview', -- 'pageview', 'scroll', 'click', 'form_submit'
  event_data JSONB DEFAULT '{}',
  duration_seconds INTEGER,
  scroll_depth INTEGER,
  blog_post_slug TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices para analytics rápidos
CREATE INDEX idx_web_analytics_created_at ON public.web_analytics(created_at DESC);
CREATE INDEX idx_web_analytics_page_path ON public.web_analytics(page_path);
CREATE INDEX idx_web_analytics_blog_slug ON public.web_analytics(blog_post_slug) WHERE blog_post_slug IS NOT NULL;
CREATE INDEX idx_web_analytics_visitor_id ON public.web_analytics(visitor_id);
CREATE INDEX idx_web_analytics_session_id ON public.web_analytics(session_id);

-- Enable RLS
ALTER TABLE public.web_analytics ENABLE ROW LEVEL SECURITY;

-- Service role only
CREATE POLICY "Service role can manage web analytics"
  ON public.web_analytics
  FOR ALL
  USING (auth.role() = 'service_role');

-- =============================================
-- DAILY USER METRICS (AGGREGATED)
-- =============================================

-- Tabla de métricas diarias por usuario
CREATE TABLE public.user_daily_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  metric_date DATE NOT NULL,
  logins_count INTEGER DEFAULT 0,
  missions_started INTEGER DEFAULT 0,
  missions_completed INTEGER DEFAULT 0,
  chat_messages_sent INTEGER DEFAULT 0,
  radar_views INTEGER DEFAULT 0,
  checkins_completed INTEGER DEFAULT 0,
  time_spent_seconds INTEGER DEFAULT 0,
  pages_viewed INTEGER DEFAULT 0,
  actions_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, metric_date)
);

CREATE INDEX idx_user_daily_metrics_user_date ON public.user_daily_metrics(user_id, metric_date DESC);
CREATE INDEX idx_user_daily_metrics_business ON public.user_daily_metrics(business_id);

-- Enable RLS
ALTER TABLE public.user_daily_metrics ENABLE ROW LEVEL SECURITY;

-- Service role and user can view own metrics
CREATE POLICY "Service role can manage user daily metrics"
  ON public.user_daily_metrics
  FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Users can view own metrics"
  ON public.user_daily_metrics
  FOR SELECT
  USING (auth.uid() = user_id);

-- =============================================
-- ADMIN AUDIT LOG
-- =============================================

-- Tabla para acciones de admin
CREATE TABLE public.admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL, -- 'view_user', 'view_business', 'export_data', etc.
  target_user_id UUID,
  target_business_id UUID,
  action_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_admin_audit_log_admin ON public.admin_audit_log(admin_user_id);
CREATE INDEX idx_admin_audit_log_created_at ON public.admin_audit_log(created_at DESC);

-- Enable RLS
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage admin audit log"
  ON public.admin_audit_log
  FOR ALL
  USING (auth.role() = 'service_role');

-- =============================================
-- ADD LAST LOGIN TO PROFILES
-- =============================================

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS login_count INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ;

-- =============================================
-- BLOG ANALYTICS SUMMARY
-- =============================================

CREATE TABLE public.blog_analytics_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_slug TEXT NOT NULL,
  metric_date DATE NOT NULL,
  pageviews INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  avg_time_on_page INTEGER DEFAULT 0,
  bounce_rate NUMERIC(5,2),
  scroll_depth_avg INTEGER,
  referrer_breakdown JSONB DEFAULT '{}',
  device_breakdown JSONB DEFAULT '{}',
  country_breakdown JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(post_slug, metric_date)
);

CREATE INDEX idx_blog_analytics_daily_slug ON public.blog_analytics_daily(post_slug);
CREATE INDEX idx_blog_analytics_daily_date ON public.blog_analytics_daily(metric_date DESC);

-- Enable RLS
ALTER TABLE public.blog_analytics_daily ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read blog analytics"
  ON public.blog_analytics_daily
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Service role can manage blog analytics"
  ON public.blog_analytics_daily
  FOR ALL
  USING (auth.role() = 'service_role');