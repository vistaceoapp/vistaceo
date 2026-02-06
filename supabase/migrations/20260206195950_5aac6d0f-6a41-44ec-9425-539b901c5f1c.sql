-- Email Events table for idempotency and tracking
CREATE TABLE IF NOT EXISTS public.email_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  business_id uuid REFERENCES public.businesses(id) ON DELETE CASCADE,
  template_key text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  provider_message_id text,
  sent_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb,
  error_message text,
  
  -- Prevent duplicate emails for same user + template
  CONSTRAINT email_events_user_template_unique UNIQUE (user_id, template_key)
);

-- Enable RLS
ALTER TABLE public.email_events ENABLE ROW LEVEL SECURITY;

-- Service role can manage all email events
CREATE POLICY "Service role can manage email events"
ON public.email_events
FOR ALL
USING (auth.role() = 'service_role');

-- Users can view their own email events
CREATE POLICY "Users can view own email events"
ON public.email_events
FOR SELECT
USING (auth.uid() = user_id);

-- Index for quick lookups
CREATE INDEX IF NOT EXISTS idx_email_events_user_template ON public.email_events(user_id, template_key);
CREATE INDEX IF NOT EXISTS idx_email_events_status ON public.email_events(status);
CREATE INDEX IF NOT EXISTS idx_email_events_created_at ON public.email_events(created_at DESC);

-- Comment for documentation
COMMENT ON TABLE public.email_events IS 'Tracks all transactional email sends for VistaCEO - idempotency and analytics';