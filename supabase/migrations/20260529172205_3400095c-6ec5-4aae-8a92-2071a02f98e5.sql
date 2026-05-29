-- 1) Restrict blog_config public read (internal config)
DROP POLICY IF EXISTS "Public can read config" ON public.blog_config;

-- 2) Hide credentials column on business_integrations from clients
REVOKE SELECT (credentials) ON public.business_integrations FROM anon, authenticated;

-- 3) Restrict seo_health_log INSERT to service_role only
DROP POLICY IF EXISTS "seo_health_log_service_write" ON public.seo_health_log;
CREATE POLICY "seo_health_log_service_write" ON public.seo_health_log
  FOR INSERT TO public
  WITH CHECK (auth.role() = 'service_role');

-- 4) Enforce ownership for business-photos bucket
DROP POLICY IF EXISTS "Users can upload business photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own business photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can view business photos" ON storage.objects;

CREATE POLICY "Users can upload business photos" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'business-photos'
    AND (storage.foldername(name))[1] IN (
      SELECT id::text FROM public.businesses WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own business photos" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'business-photos'
    AND (storage.foldername(name))[1] IN (
      SELECT id::text FROM public.businesses WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can view own business photos" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'business-photos'
    AND (storage.foldername(name))[1] IN (
      SELECT id::text FROM public.businesses WHERE owner_id = auth.uid()
    )
  );

-- 5) Remove internal pipeline table from Realtime broadcast
DO $$ BEGIN
  EXECUTE 'ALTER PUBLICATION supabase_realtime DROP TABLE public.obsessive_editor_runs';
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- 6) Pin search_path on remaining SECURITY DEFINER functions
ALTER FUNCTION public.read_email_batch(text, integer, integer) SET search_path = public;
ALTER FUNCTION public.delete_email(text, bigint) SET search_path = public;
ALTER FUNCTION public.move_to_dlq(text, text, bigint, jsonb) SET search_path = public;
ALTER FUNCTION public.enqueue_email(text, jsonb) SET search_path = public;

-- 7) Revoke EXECUTE on SECURITY DEFINER functions that should not be user-callable
REVOKE EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.delete_email(text, bigint) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.enforce_free_limit(uuid, text, integer, text) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.prevent_seo_problems() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.trg_enforce_missions_free_limit() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.trg_enforce_opportunities_free_limit() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.trg_enforce_learning_items_free_limit() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.trg_enforce_chat_free_limit() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.check_subscription_status(uuid) FROM anon, PUBLIC;
-- has_role, is_business_pro remain executable by authenticated since they are used inside RLS policies