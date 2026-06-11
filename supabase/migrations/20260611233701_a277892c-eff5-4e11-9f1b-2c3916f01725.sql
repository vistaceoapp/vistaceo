
CREATE TABLE IF NOT EXISTS public.free_tier_state (
  business_id uuid PRIMARY KEY REFERENCES public.businesses(id) ON DELETE CASCADE,
  bonus_opportunities int NOT NULL DEFAULT 0,
  bonus_research int NOT NULL DEFAULT 0,
  last_refill_at timestamptz,
  refills_count int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.free_tier_state TO authenticated;
GRANT ALL ON public.free_tier_state TO service_role;

ALTER TABLE public.free_tier_state ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners read free tier state" ON public.free_tier_state;
CREATE POLICY "Owners read free tier state"
  ON public.free_tier_state FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = business_id AND b.owner_id = auth.uid()));

DROP POLICY IF EXISTS "Owners upsert free tier state" ON public.free_tier_state;
CREATE POLICY "Owners upsert free tier state"
  ON public.free_tier_state FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = business_id AND b.owner_id = auth.uid()));

CREATE OR REPLACE FUNCTION public.enforce_free_limit_lifetime(
  _business_id uuid,
  _table_name text,
  _base_limit int,
  _bonus_column text DEFAULT NULL,
  _extra_filter text DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _count int;
  _bonus int := 0;
  _effective_limit int;
  _sql text;
BEGIN
  IF public.is_business_pro(_business_id) THEN RETURN; END IF;

  IF _bonus_column IS NOT NULL THEN
    EXECUTE format('SELECT COALESCE(%I, 0) FROM public.free_tier_state WHERE business_id = $1', _bonus_column)
      INTO _bonus USING _business_id;
    _bonus := COALESCE(_bonus, 0);
  END IF;

  _effective_limit := _base_limit + _bonus;

  _sql := format('SELECT count(*) FROM public.%I WHERE business_id = $1 %s',
    _table_name, COALESCE('AND ' || _extra_filter, ''));
  EXECUTE _sql INTO _count USING _business_id;

  IF _count >= _effective_limit THEN
    RAISE EXCEPTION 'Free plan lifetime limit reached for %: % / % total. Upgrade to Pro for unlimited access.',
      _table_name, _count, _effective_limit USING ERRCODE = 'P0001';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.trg_enforce_missions_free_limit()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.enforce_free_limit_lifetime(NEW.business_id, 'missions', 1, NULL, NULL);
  RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION public.trg_enforce_opportunities_free_limit()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.enforce_free_limit_lifetime(NEW.business_id, 'opportunities', 2, 'bonus_opportunities', NULL);
  RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION public.trg_enforce_learning_items_free_limit()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.enforce_free_limit_lifetime(NEW.business_id, 'learning_items', 2, 'bonus_research', NULL);
  RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION public.trg_enforce_chat_free_limit()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.role = 'user' THEN
    PERFORM public.enforce_free_limit_lifetime(NEW.business_id, 'chat_messages', 3, NULL, 'role = ''user''');
  END IF;
  RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION public.request_free_tier_refill(_business_id uuid)
RETURNS TABLE(success boolean, message text, next_refill_at timestamptz, bonus_opportunities int, bonus_research int)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _is_owner boolean;
  _state public.free_tier_state%ROWTYPE;
  _next timestamptz;
BEGIN
  SELECT EXISTS(SELECT 1 FROM public.businesses b WHERE b.id = _business_id AND b.owner_id = auth.uid())
    INTO _is_owner;
  IF NOT _is_owner THEN
    RETURN QUERY SELECT false, 'No autorizado'::text, NULL::timestamptz, 0, 0; RETURN;
  END IF;

  IF public.is_business_pro(_business_id) THEN
    RETURN QUERY SELECT false, 'Ya tenés Pro — alta capacidad activa'::text, NULL::timestamptz, 0, 0; RETURN;
  END IF;

  SELECT * INTO _state FROM public.free_tier_state WHERE business_id = _business_id;
  IF NOT FOUND THEN
    INSERT INTO public.free_tier_state(business_id, bonus_opportunities, bonus_research, last_refill_at, refills_count)
    VALUES (_business_id, 1, 1, now(), 1) RETURNING * INTO _state;
    RETURN QUERY SELECT true, 'Recarga aplicada: +1 oportunidad, +1 I+D'::text,
      (_state.last_refill_at + interval '30 days'), _state.bonus_opportunities, _state.bonus_research;
    RETURN;
  END IF;

  IF _state.last_refill_at IS NOT NULL AND _state.last_refill_at > now() - interval '30 days' THEN
    _next := _state.last_refill_at + interval '30 days';
    RETURN QUERY SELECT false,
      'Tu próxima recarga está disponible el ' || to_char(_next, 'DD/MM/YYYY'),
      _next, _state.bonus_opportunities, _state.bonus_research;
    RETURN;
  END IF;

  UPDATE public.free_tier_state
     SET bonus_opportunities = bonus_opportunities + 1,
         bonus_research = bonus_research + 1,
         last_refill_at = now(),
         refills_count = refills_count + 1,
         updated_at = now()
   WHERE business_id = _business_id RETURNING * INTO _state;

  RETURN QUERY SELECT true, 'Recarga aplicada: +1 oportunidad, +1 I+D'::text,
    (_state.last_refill_at + interval '30 days'), _state.bonus_opportunities, _state.bonus_research;
END;
$$;

GRANT EXECUTE ON FUNCTION public.request_free_tier_refill(uuid) TO authenticated;
