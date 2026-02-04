-- =====================================================
-- SUBSCRIPTION TRACKING SYSTEM
-- =====================================================

-- Table to track all subscription payments and renewals
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  plan_id TEXT NOT NULL CHECK (plan_id IN ('pro_monthly', 'pro_yearly')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled', 'pending')),
  payment_provider TEXT NOT NULL CHECK (payment_provider IN ('mercadopago', 'paypal')),
  payment_id TEXT,
  payment_amount NUMERIC NOT NULL,
  payment_currency TEXT NOT NULL,
  local_amount NUMERIC,
  local_currency TEXT,
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  auto_renew BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can view their own subscriptions
CREATE POLICY "Users can view subscriptions of own businesses"
ON public.subscriptions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM businesses 
    WHERE businesses.id = subscriptions.business_id 
    AND businesses.owner_id = auth.uid()
  )
);

-- Only service role can insert/update (via webhooks)
CREATE POLICY "Service role can manage subscriptions"
ON public.subscriptions FOR ALL
USING (auth.role() = 'service_role');

-- Index for fast lookups
CREATE INDEX idx_subscriptions_business_id ON public.subscriptions(business_id);
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX idx_subscriptions_expires_at ON public.subscriptions(expires_at);

-- Trigger to update updated_at
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to check if a business has active Pro subscription
CREATE OR REPLACE FUNCTION public.check_subscription_status(p_business_id UUID)
RETURNS TABLE(is_pro BOOLEAN, plan_id TEXT, expires_at TIMESTAMPTZ) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (s.status = 'active' AND s.expires_at > now()) AS is_pro,
    s.plan_id,
    s.expires_at
  FROM subscriptions s
  WHERE s.business_id = p_business_id
    AND s.status = 'active'
    AND s.expires_at > now()
  ORDER BY s.expires_at DESC
  LIMIT 1;
  
  -- If no active subscription found, return defaults
  IF NOT FOUND THEN
    RETURN QUERY SELECT false AS is_pro, NULL::TEXT AS plan_id, NULL::TIMESTAMPTZ AS expires_at;
  END IF;
END;
$$;