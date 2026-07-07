DROP POLICY IF EXISTS brain_events_select_own ON public.brain_events;
DROP POLICY IF EXISTS brain_events_insert_own ON public.brain_events;

CREATE POLICY brain_events_select_own ON public.brain_events
FOR SELECT USING (
  business_id IN (SELECT id FROM public.businesses WHERE owner_id = auth.uid())
  OR public.has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY brain_events_insert_own ON public.brain_events
FOR INSERT WITH CHECK (
  business_id IN (SELECT id FROM public.businesses WHERE owner_id = auth.uid())
  OR public.has_role(auth.uid(), 'admin'::app_role)
);