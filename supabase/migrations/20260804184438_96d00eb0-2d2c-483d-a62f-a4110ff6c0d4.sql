-- 1) ai_artifacts_cache: read-only for owners, writes only via service_role
REVOKE INSERT, UPDATE, DELETE ON public.ai_artifacts_cache FROM authenticated, anon;
REVOKE ALL ON public.ai_artifacts_cache FROM anon;
GRANT SELECT ON public.ai_artifacts_cache TO authenticated;
GRANT ALL ON public.ai_artifacts_cache TO service_role;

DROP POLICY IF EXISTS "No client writes on ai artifacts cache" ON public.ai_artifacts_cache;
CREATE POLICY "No client writes on ai artifacts cache"
  ON public.ai_artifacts_cache
  AS RESTRICTIVE
  FOR ALL
  TO authenticated, anon
  USING (true)
  WITH CHECK (false);

-- 2) linkedin_integration: service_role only, no client grants at all
REVOKE ALL ON public.linkedin_integration FROM authenticated, anon, PUBLIC;
GRANT ALL ON public.linkedin_integration TO service_role;

DROP POLICY IF EXISTS "Service role only" ON public.linkedin_integration;
CREATE POLICY "Service role only"
  ON public.linkedin_integration
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Block all client access to linkedin integration" ON public.linkedin_integration;
CREATE POLICY "Block all client access to linkedin integration"
  ON public.linkedin_integration
  AS RESTRICTIVE
  FOR ALL
  TO authenticated, anon
  USING (false)
  WITH CHECK (false);

-- 3) ops_incidents: user inserts strictly own rows; context sanitized by trigger
DROP POLICY IF EXISTS "Users can report own incidents" ON public.ops_incidents;
CREATE POLICY "Users can report own incidents"
  ON public.ops_incidents
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND source = 'app'
    AND context = '{}'::jsonb
  );

REVOKE UPDATE, DELETE ON public.ops_incidents FROM anon;
REVOKE ALL ON public.ops_incidents FROM anon;