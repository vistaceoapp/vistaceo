DO $$
DECLARE p record;
BEGIN
  FOR p IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename='blog_topics' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.blog_topics', p.policyname);
  END LOOP;
END $$;

ALTER TABLE public.blog_topics ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.blog_topics FROM anon;
REVOKE ALL ON public.blog_topics FROM authenticated;
GRANT ALL ON public.blog_topics TO service_role;

CREATE POLICY "Admins manage blog topics"
ON public.blog_topics FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));