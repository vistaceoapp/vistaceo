-- Table for tracking social media publications (LinkedIn, future: Twitter, etc.)
CREATE TABLE public.social_publications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  channel TEXT NOT NULL DEFAULT 'linkedin',
  blog_post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'posted', 'failed', 'needs_reauth')),
  linkedin_post_urn TEXT,
  generated_text TEXT,
  canonical_url TEXT,
  error_message TEXT,
  attempts INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Unique constraint to prevent duplicate posts
  CONSTRAINT unique_channel_post UNIQUE (channel, blog_post_id)
);

-- Index for querying pending publications
CREATE INDEX idx_social_publications_status ON public.social_publications(status);
CREATE INDEX idx_social_publications_channel ON public.social_publications(channel);

-- Enable RLS
ALTER TABLE public.social_publications ENABLE ROW LEVEL SECURITY;

-- Only service role can access (backend only)
CREATE POLICY "Service role only" ON public.social_publications
  FOR ALL USING (auth.role() = 'service_role');

-- Trigger for updated_at
CREATE TRIGGER update_social_publications_updated_at
  BEFORE UPDATE ON public.social_publications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Table for storing LinkedIn OAuth credentials (encrypted via Supabase secrets, this is metadata only)
CREATE TABLE public.linkedin_integration (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_urn TEXT, -- urn:li:organization:{id}
  organization_name TEXT,
  status TEXT NOT NULL DEFAULT 'disconnected' CHECK (status IN ('connected', 'disconnected', 'needs_reauth', 'pending')),
  access_token_expires_at TIMESTAMP WITH TIME ZONE,
  last_post_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.linkedin_integration ENABLE ROW LEVEL SECURITY;

-- Only service role can access
CREATE POLICY "Service role only" ON public.linkedin_integration
  FOR ALL USING (auth.role() = 'service_role');

-- Trigger for updated_at
CREATE TRIGGER update_linkedin_integration_updated_at
  BEFORE UPDATE ON public.linkedin_integration
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();