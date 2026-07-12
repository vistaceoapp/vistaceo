
-- email_engagement_events: explicit restrictive policies to block client writes
ALTER TABLE public.email_engagement_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Block client inserts on email engagement" ON public.email_engagement_events;
CREATE POLICY "Block client inserts on email engagement"
  ON public.email_engagement_events
  AS RESTRICTIVE
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (false);

DROP POLICY IF EXISTS "Block client updates on email engagement" ON public.email_engagement_events;
CREATE POLICY "Block client updates on email engagement"
  ON public.email_engagement_events
  AS RESTRICTIVE
  FOR UPDATE
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

DROP POLICY IF EXISTS "Block client deletes on email engagement" ON public.email_engagement_events;
CREATE POLICY "Block client deletes on email engagement"
  ON public.email_engagement_events
  AS RESTRICTIVE
  FOR DELETE
  TO anon, authenticated
  USING (false);

-- ops_incidents: sanitize fields on user-driven inserts
CREATE OR REPLACE FUNCTION public.sanitize_user_incident_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.role() IS DISTINCT FROM 'service_role' THEN
    NEW.source := 'app';
    NEW.severity := 'low';
    NEW.category := COALESCE(
      CASE WHEN NEW.category IN ('error','ux','perf','seo','content','structural','network')
           THEN NEW.category END,
      'ux'
    );
    NEW.detected_by := 'user_report';
    NEW.context := '{}'::jsonb;
    NEW.status := COALESCE(NEW.status, 'open');
    NEW.user_id := auth.uid();
    IF NEW.title IS NOT NULL THEN
      NEW.title := left(NEW.title, 280);
    END IF;
    IF NEW.where_path IS NOT NULL THEN
      NEW.where_path := left(NEW.where_path, 500);
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sanitize_user_incident_insert ON public.ops_incidents;
CREATE TRIGGER trg_sanitize_user_incident_insert
  BEFORE INSERT ON public.ops_incidents
  FOR EACH ROW EXECUTE FUNCTION public.sanitize_user_incident_insert();
