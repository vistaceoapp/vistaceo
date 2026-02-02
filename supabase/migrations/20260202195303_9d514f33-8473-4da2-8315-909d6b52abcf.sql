-- Add access_token column to linkedin_integration table
ALTER TABLE public.linkedin_integration 
ADD COLUMN IF NOT EXISTS access_token TEXT,
ADD COLUMN IF NOT EXISTS refresh_token TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.linkedin_integration.access_token IS 'LinkedIn OAuth access token - stored securely';
COMMENT ON COLUMN public.linkedin_integration.refresh_token IS 'LinkedIn OAuth refresh token if available';