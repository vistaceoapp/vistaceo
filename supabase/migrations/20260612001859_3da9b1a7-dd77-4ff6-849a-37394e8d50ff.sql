CREATE OR REPLACE FUNCTION public.trg_enforce_missions_free_limit()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Free: 2 misiones lifetime (1 inicial + 1 conversión de oportunidad/tendencia)
  PERFORM public.enforce_free_limit_lifetime(NEW.business_id, 'missions', 2, NULL, NULL);
  RETURN NEW;
END; $function$;