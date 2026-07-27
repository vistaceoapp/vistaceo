
-- Campañas de promoción
CREATE TABLE public.promo_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  plan_id text NOT NULL DEFAULT 'pro_monthly',
  usd_amount numeric(10,2) NOT NULL DEFAULT 1.00,
  ars_amount numeric(12,2) NOT NULL DEFAULT 1200.00,
  window_hours integer NOT NULL DEFAULT 24,
  status text NOT NULL DEFAULT 'draft',
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.promo_campaigns TO authenticated;
GRANT ALL ON public.promo_campaigns TO service_role;
ALTER TABLE public.promo_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "promo_campaigns_admin_all" ON public.promo_campaigns
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_promo_campaigns_updated_at
  BEFORE UPDATE ON public.promo_campaigns
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Ofertas individuales con token único
CREATE TABLE public.promo_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.promo_campaigns(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_email text NOT NULL,
  token text NOT NULL UNIQUE,
  plan_id text NOT NULL DEFAULT 'pro_monthly',
  country text,
  currency text,
  usd_amount numeric(10,2) NOT NULL,
  local_amount numeric(12,2),
  expires_at timestamptz NOT NULL,
  sent_at timestamptz,
  redeemed_at timestamptz,
  used_at timestamptz,
  used_order_id text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (campaign_id, user_id)
);

CREATE INDEX idx_promo_offers_token ON public.promo_offers(token);
CREATE INDEX idx_promo_offers_user ON public.promo_offers(user_id);
CREATE INDEX idx_promo_offers_campaign ON public.promo_offers(campaign_id);
CREATE INDEX idx_promo_offers_expires ON public.promo_offers(expires_at);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.promo_offers TO authenticated;
GRANT ALL ON public.promo_offers TO service_role;
ALTER TABLE public.promo_offers ENABLE ROW LEVEL SECURITY;

-- Admins ven/gestionan todo
CREATE POLICY "promo_offers_admin_all" ON public.promo_offers
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Los usuarios pueden ver su propia oferta (por si mostramos en app)
CREATE POLICY "promo_offers_owner_read" ON public.promo_offers
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());
