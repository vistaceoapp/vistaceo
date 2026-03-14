-- Tighten blog RLS policies to admin-only writes (and admin full access)
-- while preserving public read where intended.

-- blog_posts
DROP POLICY IF EXISTS "Authenticated can manage posts" ON public.blog_posts;

CREATE POLICY "Admins can manage posts"
ON public.blog_posts
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- blog_topics
DROP POLICY IF EXISTS "Authenticated can manage topics" ON public.blog_topics;

CREATE POLICY "Admins can manage topics"
ON public.blog_topics
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- blog_plan
DROP POLICY IF EXISTS "Authenticated can manage plan" ON public.blog_plan;

CREATE POLICY "Admins can manage plan"
ON public.blog_plan
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- blog_config
DROP POLICY IF EXISTS "Authenticated can manage config" ON public.blog_config;

CREATE POLICY "Admins can manage config"
ON public.blog_config
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- blog_runs
DROP POLICY IF EXISTS "Authenticated can manage runs" ON public.blog_runs;

CREATE POLICY "Admins can manage runs"
ON public.blog_runs
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));