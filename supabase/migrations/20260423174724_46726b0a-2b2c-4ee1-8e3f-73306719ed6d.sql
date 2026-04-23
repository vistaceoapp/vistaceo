
-- Helper: determinar si un negocio es Pro
CREATE OR REPLACE FUNCTION public.is_business_pro(_business_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $func$
  SELECT EXISTS (
    SELECT 1
    FROM public.subscriptions
    WHERE business_id = _business_id
      AND status = 'active'
      AND expires_at > now()
  );
$func$;

-- Helper genérico de enforcement
CREATE OR REPLACE FUNCTION public.enforce_free_limit(
  _business_id uuid,
  _table_name text,
  _limit int,
  _extra_filter text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $func$
DECLARE
  _count int;
  _start_of_month timestamptz := date_trunc('month', now());
  _sql text;
BEGIN
  IF public.is_business_pro(_business_id) THEN
    RETURN;
  END IF;

  _sql := format(
    'SELECT count(*) FROM public.%I WHERE business_id = $1 AND created_at >= $2 %s',
    _table_name,
    COALESCE('AND ' || _extra_filter, '')
  );

  EXECUTE _sql INTO _count USING _business_id, _start_of_month;

  IF _count >= _limit THEN
    RAISE EXCEPTION 'Free plan limit reached for %: % / % this month. Upgrade to Pro for unlimited access.',
      _table_name, _count, _limit
      USING ERRCODE = 'P0001';
  END IF;
END;
$func$;

-- Trigger: missions (3/mes)
CREATE OR REPLACE FUNCTION public.trg_enforce_missions_free_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $func$
BEGIN
  PERFORM public.enforce_free_limit(NEW.business_id, 'missions', 3);
  RETURN NEW;
END;
$func$;

DROP TRIGGER IF EXISTS enforce_free_limit_missions ON public.missions;
CREATE TRIGGER enforce_free_limit_missions
  BEFORE INSERT ON public.missions
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_enforce_missions_free_limit();

-- Trigger: chat_messages (3/mes solo para role='user')
CREATE OR REPLACE FUNCTION public.trg_enforce_chat_free_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $func$
BEGIN
  IF NEW.role = 'user' THEN
    PERFORM public.enforce_free_limit(NEW.business_id, 'chat_messages', 3, 'role = ''user''');
  END IF;
  RETURN NEW;
END;
$func$;

DROP TRIGGER IF EXISTS enforce_free_limit_chat_messages ON public.chat_messages;
CREATE TRIGGER enforce_free_limit_chat_messages
  BEFORE INSERT ON public.chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_enforce_chat_free_limit();

-- Trigger: opportunities (3/mes)
CREATE OR REPLACE FUNCTION public.trg_enforce_opportunities_free_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $func$
BEGIN
  PERFORM public.enforce_free_limit(NEW.business_id, 'opportunities', 3);
  RETURN NEW;
END;
$func$;

DROP TRIGGER IF EXISTS enforce_free_limit_opportunities ON public.opportunities;
CREATE TRIGGER enforce_free_limit_opportunities
  BEFORE INSERT ON public.opportunities
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_enforce_opportunities_free_limit();

-- Trigger: learning_items (3/mes)
CREATE OR REPLACE FUNCTION public.trg_enforce_learning_items_free_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $func$
BEGIN
  PERFORM public.enforce_free_limit(NEW.business_id, 'learning_items', 3);
  RETURN NEW;
END;
$func$;

DROP TRIGGER IF EXISTS enforce_free_limit_learning_items ON public.learning_items;
CREATE TRIGGER enforce_free_limit_learning_items
  BEFORE INSERT ON public.learning_items
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_enforce_learning_items_free_limit();

-- Índices para performance del conteo mensual
CREATE INDEX IF NOT EXISTS idx_missions_business_created
  ON public.missions (business_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_chat_messages_business_created_role
  ON public.chat_messages (business_id, created_at DESC, role);

CREATE INDEX IF NOT EXISTS idx_opportunities_business_created
  ON public.opportunities (business_id, created_at DESC);
