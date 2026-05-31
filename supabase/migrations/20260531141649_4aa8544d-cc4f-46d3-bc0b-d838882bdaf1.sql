
CREATE TABLE IF NOT EXISTS public.email_engagement_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tracking_id TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  template_name TEXT,
  event_type TEXT NOT NULL CHECK (event_type IN ('open','click')),
  url TEXT,
  user_agent TEXT,
  ip TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_eee_tracking ON public.email_engagement_events(tracking_id);
CREATE INDEX IF NOT EXISTS idx_eee_recipient ON public.email_engagement_events(recipient_email);
CREATE INDEX IF NOT EXISTS idx_eee_created ON public.email_engagement_events(created_at DESC);

GRANT SELECT ON public.email_engagement_events TO authenticated;
GRANT ALL ON public.email_engagement_events TO service_role;

ALTER TABLE public.email_engagement_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read email engagement"
ON public.email_engagement_events FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));
