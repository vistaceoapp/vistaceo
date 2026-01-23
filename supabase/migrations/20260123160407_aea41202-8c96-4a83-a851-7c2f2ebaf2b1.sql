-- Fix overly permissive RLS policies

-- Drop the permissive policies
DROP POLICY IF EXISTS "System can insert notifications" ON public.insight_notifications;
DROP POLICY IF EXISTS "System can manage metrics" ON public.insight_metrics;

-- For insight_notifications INSERT - use service role only (edge functions)
-- No user-facing insert policy needed since only system inserts
-- The service_role key bypasses RLS anyway

-- For insight_metrics - same approach, only system manages
-- No policies needed for INSERT/UPDATE/DELETE since service_role bypasses RLS

-- Add a more restrictive policy for edge functions that need to check business existence
CREATE POLICY "Edge functions can insert notifications via service role" 
ON public.insight_notifications 
FOR INSERT 
WITH CHECK (
  business_id IN (SELECT id FROM public.businesses)
);

CREATE POLICY "Edge functions can manage metrics via service role" 
ON public.insight_metrics 
FOR INSERT 
WITH CHECK (
  business_id IN (SELECT id FROM public.businesses)
);

CREATE POLICY "Edge functions can update metrics" 
ON public.insight_metrics 
FOR UPDATE 
USING (
  business_id IN (SELECT id FROM public.businesses)
);