CREATE TABLE public.setup_reminder_sends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  recipient_email TEXT NOT NULL,
  stage TEXT NOT NULL CHECK (stage IN ('day1','day3')),
  variant SMALLINT NOT NULL CHECK (variant >= 0 AND variant <= 9),
  message_id TEXT,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, stage)
);

CREATE INDEX idx_setup_reminder_sends_email ON public.setup_reminder_sends (recipient_email);
CREATE INDEX idx_setup_reminder_sends_stage ON public.setup_reminder_sends (stage, variant);

GRANT ALL ON public.setup_reminder_sends TO service_role;

ALTER TABLE public.setup_reminder_sends ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service role full access"
  ON public.setup_reminder_sends
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);