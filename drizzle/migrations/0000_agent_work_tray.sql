CREATE TABLE public.agent_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  name text NOT NULL,
  email text,
  phone text,
  company text,
  context text,
  source text NOT NULL DEFAULT 'manual',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.agent_leads TO authenticated;
GRANT ALL ON public.agent_leads TO service_role;
ALTER TABLE public.agent_leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners manage their leads" ON public.agent_leads FOR ALL TO authenticated
USING (user_id = auth.uid() AND EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = business_id AND b.owner_id = auth.uid()))
WITH CHECK (user_id = auth.uid() AND EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = business_id AND b.owner_id = auth.uid()));

CREATE TABLE public.agent_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  lead_id uuid REFERENCES public.agent_leads(id) ON DELETE SET NULL,
  kind text NOT NULL DEFAULT 'email_followup',
  origin text NOT NULL DEFAULT 'owner_order',
  title text NOT NULL,
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft','approved','opened_in_client','sent_confirmed','replied','closed','cancelled')),
  requires_approval boolean NOT NULL DEFAULT true,
  recipient text,
  subject text,
  body text,
  provenance jsonb NOT NULL DEFAULT '{}'::jsonb,
  execution_channel text,
  external_message_id text,
  executed_at timestamptz,
  follow_up_at timestamptz,
  result_notes text,
  approved_at timestamptz,
  events jsonb NOT NULL DEFAULT '[]'::jsonb,
  idempotency_key text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.agent_tasks TO authenticated;
GRANT ALL ON public.agent_tasks TO service_role;
ALTER TABLE public.agent_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners manage their agent tasks" ON public.agent_tasks FOR ALL TO authenticated
USING (user_id = auth.uid() AND EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = business_id AND b.owner_id = auth.uid()))
WITH CHECK (user_id = auth.uid() AND EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = business_id AND b.owner_id = auth.uid()));

-- Estados verificados solo desde el servidor (conector real): el cliente no puede autoconfirmar envío.
CREATE OR REPLACE FUNCTION public.guard_agent_task_status()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF auth.role() = 'authenticated' AND NEW.status IN ('sent_confirmed','replied')
     AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM NEW.status) THEN
    RAISE EXCEPTION 'Estado verificado solo por conector autenticado';
  END IF;
  IF auth.role() = 'authenticated' AND TG_OP = 'UPDATE' AND NEW.external_message_id IS DISTINCT FROM OLD.external_message_id THEN
    RAISE EXCEPTION 'ID externo solo por conector autenticado';
  END IF;
  IF auth.role() = 'authenticated' AND TG_OP = 'INSERT' AND NEW.external_message_id IS NOT NULL THEN
    RAISE EXCEPTION 'ID externo solo por conector autenticado';
  END IF;
  NEW.updated_at = now();
  RETURN NEW;
END $$;
CREATE TRIGGER agent_tasks_guard BEFORE INSERT OR UPDATE ON public.agent_tasks
FOR EACH ROW EXECUTE FUNCTION public.guard_agent_task_status();
CREATE INDEX agent_tasks_business_idx ON public.agent_tasks(business_id, created_at DESC);
CREATE INDEX agent_leads_business_idx ON public.agent_leads(business_id);