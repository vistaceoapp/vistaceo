-- Create table to store business insights from micro-questions
CREATE TABLE public.business_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.business_insights ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Users can manage insights of own businesses" 
ON public.business_insights 
FOR ALL 
USING (EXISTS ( SELECT 1 FROM businesses WHERE businesses.id = business_insights.business_id AND businesses.owner_id = auth.uid()));

-- Create index for faster lookups
CREATE INDEX idx_business_insights_business_id ON public.business_insights(business_id);
CREATE INDEX idx_business_insights_category ON public.business_insights(category);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.business_insights;