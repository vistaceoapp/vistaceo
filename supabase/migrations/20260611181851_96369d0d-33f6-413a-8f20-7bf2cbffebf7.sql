
-- =====================================================================
-- BUG 1: signals → business_brains counter sync
-- =====================================================================

CREATE OR REPLACE FUNCTION public.compute_brain_confidence(_signal_count int)
RETURNS numeric
LANGUAGE sql IMMUTABLE
AS $$
  SELECT CASE
    WHEN _signal_count <= 0  THEN 0
    WHEN _signal_count <= 3  THEN 0.20
    WHEN _signal_count <= 10 THEN 0.45
    WHEN _signal_count <= 30 THEN 0.65
    WHEN _signal_count <= 80 THEN 0.80
    ELSE 0.90
  END::numeric;
$$;

CREATE OR REPLACE FUNCTION public.recalculate_brain_signal_counters(_business_id uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _count int;
  _conf  numeric;
BEGIN
  IF _business_id IS NULL THEN RETURN; END IF;

  SELECT count(*) INTO _count FROM public.signals WHERE business_id = _business_id;
  _conf := public.compute_brain_confidence(_count);

  UPDATE public.business_brains
     SET total_signals    = _count,
         confidence_score = _conf,
         updated_at       = now()
   WHERE business_id = _business_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.trg_signals_sync_brain()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    PERFORM public.recalculate_brain_signal_counters(NEW.business_id);
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    PERFORM public.recalculate_brain_signal_counters(OLD.business_id);
    RETURN OLD;
  ELSIF (TG_OP = 'UPDATE') THEN
    IF NEW.business_id IS DISTINCT FROM OLD.business_id THEN
      PERFORM public.recalculate_brain_signal_counters(OLD.business_id);
      PERFORM public.recalculate_brain_signal_counters(NEW.business_id);
    END IF;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS signals_sync_brain_ins ON public.signals;
DROP TRIGGER IF EXISTS signals_sync_brain_del ON public.signals;
DROP TRIGGER IF EXISTS signals_sync_brain_upd ON public.signals;

CREATE TRIGGER signals_sync_brain_ins
AFTER INSERT ON public.signals
FOR EACH ROW EXECUTE FUNCTION public.trg_signals_sync_brain();

CREATE TRIGGER signals_sync_brain_del
AFTER DELETE ON public.signals
FOR EACH ROW EXECUTE FUNCTION public.trg_signals_sync_brain();

CREATE TRIGGER signals_sync_brain_upd
AFTER UPDATE ON public.signals
FOR EACH ROW EXECUTE FUNCTION public.trg_signals_sync_brain();

CREATE OR REPLACE FUNCTION public.backfill_brain_signal_counters(_dry_run boolean DEFAULT true)
RETURNS TABLE(
  business_id uuid,
  total_signals_before int,
  total_signals_actual int,
  confidence_before numeric,
  confidence_after numeric,
  changed boolean
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH agg AS (
    SELECT bb.business_id,
           bb.total_signals::int                          AS ts_before,
           bb.confidence_score::numeric                   AS conf_before,
           COALESCE((SELECT count(*) FROM public.signals s WHERE s.business_id = bb.business_id), 0)::int AS ts_actual
    FROM public.business_brains bb
  ),
  computed AS (
    SELECT a.*, public.compute_brain_confidence(a.ts_actual) AS conf_after FROM agg a
  )
  SELECT c.business_id, c.ts_before, c.ts_actual, c.conf_before, c.conf_after,
         (c.ts_before <> c.ts_actual OR c.conf_before IS DISTINCT FROM c.conf_after) AS changed
  FROM computed c
  WHERE (c.ts_before <> c.ts_actual OR c.conf_before IS DISTINCT FROM c.conf_after);

  IF NOT _dry_run THEN
    UPDATE public.business_brains bb
       SET total_signals    = sub.ts_actual,
           confidence_score = sub.conf_after,
           updated_at       = now()
      FROM (
        SELECT bb2.business_id,
               COALESCE((SELECT count(*) FROM public.signals s WHERE s.business_id = bb2.business_id), 0)::int AS ts_actual,
               public.compute_brain_confidence(
                 COALESCE((SELECT count(*) FROM public.signals s WHERE s.business_id = bb2.business_id), 0)::int
               ) AS conf_after
        FROM public.business_brains bb2
      ) sub
     WHERE bb.business_id = sub.business_id
       AND (bb.total_signals <> sub.ts_actual OR bb.confidence_score IS DISTINCT FROM sub.conf_after);
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.backfill_brain_signal_counters(boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.backfill_brain_signal_counters(boolean) TO service_role;
GRANT EXECUTE ON FUNCTION public.recalculate_brain_signal_counters(uuid) TO service_role, authenticated;

-- =====================================================================
-- BUG 3: brain_events canonical ledger
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.brain_events (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id              uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id                  uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type               text NOT NULL,
  source_module            text NOT NULL,
  raw_input                jsonb,
  normalized_input         jsonb,
  brain_fields_updated     text[] DEFAULT '{}',
  confidence_delta         numeric DEFAULT 0,
  modules_to_recalculate   text[] DEFAULT '{}',
  quality                  jsonb,
  metadata                 jsonb,
  created_at               timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_brain_events_business ON public.brain_events(business_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_brain_events_user     ON public.brain_events(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_brain_events_type     ON public.brain_events(event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_brain_events_module   ON public.brain_events(source_module, created_at DESC);

GRANT SELECT, INSERT ON public.brain_events TO authenticated;
GRANT ALL ON public.brain_events TO service_role;

ALTER TABLE public.brain_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "brain_events_select_own" ON public.brain_events;
CREATE POLICY "brain_events_select_own" ON public.brain_events
  FOR SELECT TO authenticated
  USING (
    business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  );

DROP POLICY IF EXISTS "brain_events_insert_own" ON public.brain_events;
CREATE POLICY "brain_events_insert_own" ON public.brain_events
  FOR INSERT TO authenticated
  WITH CHECK (
    business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid())
  );

-- =====================================================================
-- BUG 2: classification metadata on business_brains
-- =====================================================================

ALTER TABLE public.business_brains
  ADD COLUMN IF NOT EXISTS classification_status         text,
  ADD COLUMN IF NOT EXISTS classification_confidence     numeric,
  ADD COLUMN IF NOT EXISTS classification_source         text,
  ADD COLUMN IF NOT EXISTS classification_fallback_reason text,
  ADD COLUMN IF NOT EXISTS legacy_status                 text,
  ADD COLUMN IF NOT EXISTS migration_version             text;

-- =====================================================================
-- Legacy/migration metadata on content tables
-- =====================================================================

ALTER TABLE public.missions
  ADD COLUMN IF NOT EXISTS legacy_status      text,
  ADD COLUMN IF NOT EXISTS repair_status      text,
  ADD COLUMN IF NOT EXISTS replaced_by_id     uuid,
  ADD COLUMN IF NOT EXISTS archived_reason    text,
  ADD COLUMN IF NOT EXISTS migration_version  text;

ALTER TABLE public.opportunities
  ADD COLUMN IF NOT EXISTS legacy_status      text,
  ADD COLUMN IF NOT EXISTS repair_status      text,
  ADD COLUMN IF NOT EXISTS replaced_by_id     uuid,
  ADD COLUMN IF NOT EXISTS archived_reason    text,
  ADD COLUMN IF NOT EXISTS migration_version  text;

ALTER TABLE public.predictions
  ADD COLUMN IF NOT EXISTS legacy_status      text,
  ADD COLUMN IF NOT EXISTS repair_status      text,
  ADD COLUMN IF NOT EXISTS replaced_by_id     uuid,
  ADD COLUMN IF NOT EXISTS archived_reason    text,
  ADD COLUMN IF NOT EXISTS migration_version  text;

ALTER TABLE public.business_insights
  ADD COLUMN IF NOT EXISTS legacy_status      text,
  ADD COLUMN IF NOT EXISTS repair_status      text,
  ADD COLUMN IF NOT EXISTS replaced_by_id     uuid,
  ADD COLUMN IF NOT EXISTS archived_reason    text,
  ADD COLUMN IF NOT EXISTS migration_version  text;
