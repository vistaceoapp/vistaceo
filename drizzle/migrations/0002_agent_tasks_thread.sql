ALTER TABLE public.agent_tasks ADD COLUMN IF NOT EXISTS external_thread_id text, ADD COLUMN IF NOT EXISTS last_checked_at timestamptz;
CREATE OR REPLACE FUNCTION public.guard_agent_task_status()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF auth.role() = 'authenticated' AND NEW.status IN ('sent_confirmed','replied')
     AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM NEW.status) THEN
    RAISE EXCEPTION 'Estado verificado solo por conector autenticado';
  END IF;
  IF auth.role() = 'authenticated' AND TG_OP = 'UPDATE' AND (NEW.external_message_id IS DISTINCT FROM OLD.external_message_id OR NEW.external_thread_id IS DISTINCT FROM OLD.external_thread_id) THEN
    RAISE EXCEPTION 'ID externo solo por conector autenticado';
  END IF;
  IF auth.role() = 'authenticated' AND TG_OP = 'INSERT' AND (NEW.external_message_id IS NOT NULL OR NEW.external_thread_id IS NOT NULL) THEN
    RAISE EXCEPTION 'ID externo solo por conector autenticado';
  END IF;
  NEW.updated_at = now();
  RETURN NEW;
END $$;