-- Harden service-role-only write policies for insights tables

-- insight_metrics: INSERT should be service_role only
DROP POLICY IF EXISTS "Edge functions can manage metrics via service role" ON public.insight_metrics;
CREATE POLICY "Edge functions can manage metrics via service role"
ON public.insight_metrics
FOR INSERT
TO public
WITH CHECK (auth.role() = 'service_role');

-- insight_metrics: UPDATE should be service_role only
DROP POLICY IF EXISTS "Edge functions can update metrics" ON public.insight_metrics;
CREATE POLICY "Edge functions can update metrics"
ON public.insight_metrics
FOR UPDATE
TO public
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- insight_notifications: INSERT should be service_role only
DROP POLICY IF EXISTS "Edge functions can insert notifications via service role" ON public.insight_notifications;
CREATE POLICY "Edge functions can insert notifications via service role"
ON public.insight_notifications
FOR INSERT
TO public
WITH CHECK (auth.role() = 'service_role');