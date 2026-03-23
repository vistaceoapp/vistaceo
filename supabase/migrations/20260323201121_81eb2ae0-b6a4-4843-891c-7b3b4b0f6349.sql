-- Storage bucket for business photos
INSERT INTO storage.buckets (id, name, public) VALUES ('business-photos', 'business-photos', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for business-photos bucket
CREATE POLICY "Users can upload business photos" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'business-photos');

CREATE POLICY "Users can view business photos" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'business-photos');

CREATE POLICY "Users can delete own business photos" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'business-photos');

-- Table for AI daily summaries (cached)
CREATE TABLE IF NOT EXISTS public.business_daily_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  summary_date DATE NOT NULL DEFAULT CURRENT_DATE,
  summary_text TEXT NOT NULL,
  key_metrics JSONB DEFAULT '{}',
  priorities JSONB DEFAULT '[]',
  mood TEXT DEFAULT 'neutral',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, summary_date)
);

ALTER TABLE public.business_daily_summaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own summaries" ON public.business_daily_summaries
  FOR SELECT TO authenticated
  USING (business_id IN (SELECT id FROM public.businesses WHERE owner_id = auth.uid()));

CREATE POLICY "Service can insert summaries" ON public.business_daily_summaries
  FOR INSERT TO authenticated
  WITH CHECK (business_id IN (SELECT id FROM public.businesses WHERE owner_id = auth.uid()));

-- Table for business photos references
CREATE TABLE IF NOT EXISTS public.business_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  caption TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.business_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own photos" ON public.business_photos
  FOR ALL TO authenticated
  USING (business_id IN (SELECT id FROM public.businesses WHERE owner_id = auth.uid()))
  WITH CHECK (business_id IN (SELECT id FROM public.businesses WHERE owner_id = auth.uid()));