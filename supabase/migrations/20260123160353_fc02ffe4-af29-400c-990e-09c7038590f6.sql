-- Enable required extensions for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA public;

-- Create insight notifications table
CREATE TABLE public.insight_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL DEFAULT 'new_insights',
  title TEXT NOT NULL,
  message TEXT,
  insights_count INTEGER DEFAULT 0,
  is_read BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.insight_notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies for insight_notifications
CREATE POLICY "Users can view their business notifications" 
ON public.insight_notifications 
FOR SELECT 
USING (
  business_id IN (
    SELECT id FROM public.businesses WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "Users can update their business notifications" 
ON public.insight_notifications 
FOR UPDATE 
USING (
  business_id IN (
    SELECT id FROM public.businesses WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "System can insert notifications" 
ON public.insight_notifications 
FOR INSERT 
WITH CHECK (true);

-- Create insight_metrics view/table for analytics
CREATE TABLE public.insight_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_insights INTEGER DEFAULT 0,
  insights_by_type JSONB DEFAULT '{}',
  insights_applied INTEGER DEFAULT 0,
  insights_dismissed INTEGER DEFAULT 0,
  top_categories JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for insight_metrics
ALTER TABLE public.insight_metrics ENABLE ROW LEVEL SECURITY;

-- RLS policies for insight_metrics
CREATE POLICY "Users can view their business metrics" 
ON public.insight_metrics 
FOR SELECT 
USING (
  business_id IN (
    SELECT id FROM public.businesses WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "System can manage metrics" 
ON public.insight_metrics 
FOR ALL
USING (true)
WITH CHECK (true);

-- Add index for faster queries
CREATE INDEX idx_insight_notifications_business ON public.insight_notifications(business_id, is_read);
CREATE INDEX idx_insight_metrics_business_period ON public.insight_metrics(business_id, period_start);
CREATE INDEX idx_learning_items_created ON public.learning_items(business_id, created_at);