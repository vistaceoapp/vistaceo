-- Create lessons table for AI memory
CREATE TABLE public.lessons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  source TEXT DEFAULT 'chat',
  importance INTEGER DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

-- Create policy for user access
CREATE POLICY "Users can manage lessons of own businesses"
ON public.lessons
FOR ALL
USING (EXISTS (
  SELECT 1 FROM businesses
  WHERE businesses.id = lessons.business_id
  AND businesses.owner_id = auth.uid()
));

-- Create index for faster queries
CREATE INDEX idx_lessons_business_id ON public.lessons(business_id);
CREATE INDEX idx_lessons_created_at ON public.lessons(created_at DESC);