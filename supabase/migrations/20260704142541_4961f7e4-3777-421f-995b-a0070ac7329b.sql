
-- 1. business_integrations: SELECT restricted to service_role, other ops owner-scoped
DROP POLICY IF EXISTS "Users can manage integrations of own businesses" ON public.business_integrations;

CREATE POLICY "Service role can read integrations"
  ON public.business_integrations FOR SELECT
  USING (auth.role() = 'service_role');

CREATE POLICY "Owners can insert integrations"
  ON public.business_integrations FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.businesses WHERE businesses.id = business_integrations.business_id AND businesses.owner_id = auth.uid()));

CREATE POLICY "Owners can update integrations"
  ON public.business_integrations FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.businesses WHERE businesses.id = business_integrations.business_id AND businesses.owner_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.businesses WHERE businesses.id = business_integrations.business_id AND businesses.owner_id = auth.uid()));

CREATE POLICY "Owners can delete integrations"
  ON public.business_integrations FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.businesses WHERE businesses.id = business_integrations.business_id AND businesses.owner_id = auth.uid()));

-- 2. blog-seo-pages storage: restrict writes to service_role
DROP POLICY IF EXISTS "Service can manage blog SEO pages" ON storage.objects;
CREATE POLICY "Service can manage blog SEO pages"
  ON storage.objects FOR ALL
  USING (bucket_id = 'blog-seo-pages' AND auth.role() = 'service_role')
  WITH CHECK (bucket_id = 'blog-seo-pages' AND auth.role() = 'service_role');

-- 3. ops_incidents INSERT: restrict to own user_id or service_role
DROP POLICY IF EXISTS "Authenticated can report incidents" ON public.ops_incidents;
CREATE POLICY "Users can report own incidents"
  ON public.ops_incidents FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid() OR auth.role() = 'service_role');

-- 4. business-photos bucket: add UPDATE policy scoped to owner
CREATE POLICY "Users can update own business photos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'business-photos' AND (storage.foldername(name))[1] IN (SELECT businesses.id::text FROM public.businesses WHERE businesses.owner_id = auth.uid()))
  WITH CHECK (bucket_id = 'business-photos' AND (storage.foldername(name))[1] IN (SELECT businesses.id::text FROM public.businesses WHERE businesses.owner_id = auth.uid()));

-- 5. Set search_path on remaining public functions
ALTER FUNCTION public.read_email_batch(text, integer, integer) SET search_path = public, pgmq;
ALTER FUNCTION public.delete_email(text, bigint) SET search_path = public, pgmq;
ALTER FUNCTION public.enqueue_email(text, jsonb) SET search_path = public, pgmq;
ALTER FUNCTION public.move_to_dlq(text, text, bigint, jsonb) SET search_path = public, pgmq;
ALTER FUNCTION public.compute_brain_confidence(integer) SET search_path = public;
