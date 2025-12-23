-- Create table for business integrations/connections
CREATE TABLE public.business_integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  integration_type TEXT NOT NULL, -- 'google_reviews', 'instagram', 'facebook', 'mercadopago', 'rappi', 'pedidosya', etc.
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'connected', 'error', 'disconnected'
  credentials JSONB DEFAULT '{}'::jsonb, -- Encrypted credentials/tokens
  metadata JSONB DEFAULT '{}'::jsonb, -- Last sync time, stats, etc.
  last_sync_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(business_id, integration_type)
);

-- Enable RLS
ALTER TABLE public.business_integrations ENABLE ROW LEVEL SECURITY;

-- Create policy for users to manage their own business integrations
CREATE POLICY "Users can manage integrations of own businesses" 
ON public.business_integrations 
FOR ALL 
USING (EXISTS ( 
  SELECT 1 FROM businesses 
  WHERE businesses.id = business_integrations.business_id 
  AND businesses.owner_id = auth.uid()
));

-- Create table for synced external data (reviews, posts, transactions, etc.)
CREATE TABLE public.external_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  integration_id UUID NOT NULL REFERENCES public.business_integrations(id) ON DELETE CASCADE,
  data_type TEXT NOT NULL, -- 'review', 'post', 'transaction', 'mention', 'metric'
  external_id TEXT, -- ID from external system
  content JSONB NOT NULL DEFAULT '{}'::jsonb, -- The actual data
  sentiment_score NUMERIC, -- AI-analyzed sentiment (-1 to 1)
  importance INTEGER DEFAULT 5, -- 1-10 importance
  processed_at TIMESTAMP WITH TIME ZONE, -- When AI processed this
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  synced_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.external_data ENABLE ROW LEVEL SECURITY;

-- Create policy for users to manage their own external data
CREATE POLICY "Users can manage external data of own businesses" 
ON public.external_data 
FOR ALL 
USING (EXISTS ( 
  SELECT 1 FROM businesses 
  WHERE businesses.id = external_data.business_id 
  AND businesses.owner_id = auth.uid()
));

-- Add trigger for updated_at on business_integrations
CREATE TRIGGER update_business_integrations_updated_at
BEFORE UPDATE ON public.business_integrations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();