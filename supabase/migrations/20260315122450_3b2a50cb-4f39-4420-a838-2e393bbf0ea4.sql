-- Tighten RLS on internal blog analytics & management tables

-- 1) blog_analytics_daily: only admins (plus existing service_role policy)
DROP POLICY IF EXISTS "Authenticated can read blog analytics" ON public.blog_analytics_daily;
CREATE POLICY "Admins can read blog analytics"
ON public.blog_analytics_daily
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- 2) blog_ssg_audits: only admins (plus existing service_role policy)
DROP POLICY IF EXISTS "Authenticated can read SSG audits" ON public.blog_ssg_audits;
CREATE POLICY "Admins can read SSG audits"
ON public.blog_ssg_audits
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- 3) blog_audit_issues: remove public SELECT, keep admin+service_role
DROP POLICY IF EXISTS "Public can read audit" ON public.blog_audit_issues;
CREATE POLICY "Admins can read audit"
ON public.blog_audit_issues
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- 4) blog_cluster_edges
DROP POLICY IF EXISTS "Public read cluster edges" ON public.blog_cluster_edges;
CREATE POLICY "Admins read cluster edges"
ON public.blog_cluster_edges
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- 5) blog_content_blocks
DROP POLICY IF EXISTS "Public read blocks" ON public.blog_content_blocks;
CREATE POLICY "Admins read blocks"
ON public.blog_content_blocks
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- 6) blog_content_registry
DROP POLICY IF EXISTS "Public can read registry" ON public.blog_content_registry;
CREATE POLICY "Admins can read registry"
ON public.blog_content_registry
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- 7) blog_content_versions
DROP POLICY IF EXISTS "Public can read versions" ON public.blog_content_versions;
CREATE POLICY "Admins can read versions"
ON public.blog_content_versions
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- 8) blog_cta_blocks
DROP POLICY IF EXISTS "Public read cta blocks" ON public.blog_cta_blocks;
CREATE POLICY "Admins read cta blocks"
ON public.blog_cta_blocks
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- 9) blog_experiments
DROP POLICY IF EXISTS "Public read experiments" ON public.blog_experiments;
CREATE POLICY "Admins read experiments"
ON public.blog_experiments
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- 10) blog_quality_results
DROP POLICY IF EXISTS "Public can read quality" ON public.blog_quality_results;
CREATE POLICY "Admins can read quality"
ON public.blog_quality_results
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));