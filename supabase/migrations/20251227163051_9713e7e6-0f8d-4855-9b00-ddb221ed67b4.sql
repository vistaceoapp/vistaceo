-- Setup Progress table - stores intelligent setup wizard data
CREATE TABLE IF NOT EXISTS public.business_setup_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  current_step TEXT NOT NULL DEFAULT 'S00',
  setup_data JSONB NOT NULL DEFAULT '{}',
  pmo_status JSONB NOT NULL DEFAULT '{"identity": false, "model": false, "sales": false, "menu": false, "costs": false, "competition": false}',
  precision_score INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(business_id)
);

-- Enable RLS
ALTER TABLE public.business_setup_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own setup progress"
ON public.business_setup_progress FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.businesses
    WHERE businesses.id = business_setup_progress.business_id
    AND businesses.owner_id = auth.uid()
  )
);

CREATE POLICY "Users can create their own setup progress"
ON public.business_setup_progress FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.businesses
    WHERE businesses.id = business_setup_progress.business_id
    AND businesses.owner_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own setup progress"
ON public.business_setup_progress FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.businesses
    WHERE businesses.id = business_setup_progress.business_id
    AND businesses.owner_id = auth.uid()
  )
);

-- Menu Items table for imported/entered menu data
CREATE TABLE IF NOT EXISTS public.business_menu_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT,
  price NUMERIC(12, 2) NOT NULL,
  size TEXT, -- S, M, L, custom
  is_star_item BOOLEAN DEFAULT false,
  channel_prices JSONB, -- { "dineIn": 100, "delivery": 110, "takeaway": 100 }
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for menu items
ALTER TABLE public.business_menu_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own menu items"
ON public.business_menu_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.businesses
    WHERE businesses.id = business_menu_items.business_id
    AND businesses.owner_id = auth.uid()
  )
);

CREATE POLICY "Users can insert their own menu items"
ON public.business_menu_items FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.businesses
    WHERE businesses.id = business_menu_items.business_id
    AND businesses.owner_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own menu items"
ON public.business_menu_items FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.businesses
    WHERE businesses.id = business_menu_items.business_id
    AND businesses.owner_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own menu items"
ON public.business_menu_items FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.businesses
    WHERE businesses.id = business_menu_items.business_id
    AND businesses.owner_id = auth.uid()
  )
);

-- Competitors table
CREATE TABLE IF NOT EXISTS public.business_competitors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  google_place_id TEXT,
  address TEXT,
  rating NUMERIC(2, 1),
  review_count INTEGER,
  price_level INTEGER, -- 1-4
  has_verified_prices BOOLEAN DEFAULT false,
  distance_km NUMERIC(5, 2),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for competitors
ALTER TABLE public.business_competitors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own competitors"
ON public.business_competitors FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.businesses
    WHERE businesses.id = business_competitors.business_id
    AND businesses.owner_id = auth.uid()
  )
);

CREATE POLICY "Users can insert their own competitors"
ON public.business_competitors FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.businesses
    WHERE businesses.id = business_competitors.business_id
    AND businesses.owner_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own competitors"
ON public.business_competitors FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.businesses
    WHERE businesses.id = business_competitors.business_id
    AND businesses.owner_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own competitors"
ON public.business_competitors FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.businesses
    WHERE businesses.id = business_competitors.business_id
    AND businesses.owner_id = auth.uid()
  )
);

-- Add new columns to businesses table for enhanced data
ALTER TABLE public.businesses 
ADD COLUMN IF NOT EXISTS service_model TEXT,
ADD COLUMN IF NOT EXISTS channel_mix JSONB,
ADD COLUMN IF NOT EXISTS monthly_revenue_range JSONB,
ADD COLUMN IF NOT EXISTS avg_ticket_range JSONB,
ADD COLUMN IF NOT EXISTS daily_transactions_range JSONB,
ADD COLUMN IF NOT EXISTS food_cost_range JSONB,
ADD COLUMN IF NOT EXISTS fixed_costs_range JSONB,
ADD COLUMN IF NOT EXISTS active_dayparts TEXT[],
ADD COLUMN IF NOT EXISTS delivery_platforms TEXT[],
ADD COLUMN IF NOT EXISTS reservation_platforms TEXT[],
ADD COLUMN IF NOT EXISTS competitive_radius_km NUMERIC(5, 2),
ADD COLUMN IF NOT EXISTS sales_tax_percent NUMERIC(5, 2),
ADD COLUMN IF NOT EXISTS tip_percent NUMERIC(5, 2),
ADD COLUMN IF NOT EXISTS service_fee_percent NUMERIC(5, 2),
ADD COLUMN IF NOT EXISTS setup_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS precision_score INTEGER DEFAULT 0;

-- Trigger for updated_at
CREATE TRIGGER update_business_setup_progress_updated_at
  BEFORE UPDATE ON public.business_setup_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_business_menu_items_updated_at
  BEFORE UPDATE ON public.business_menu_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_business_competitors_updated_at
  BEFORE UPDATE ON public.business_competitors
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();