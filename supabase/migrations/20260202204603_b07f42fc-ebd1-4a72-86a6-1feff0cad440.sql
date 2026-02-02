-- Create storage bucket for OG/SEO static pages
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'blog-seo-pages',
  'blog-seo-pages',
  true,
  1048576, -- 1MB limit
  ARRAY['text/html']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to blog-seo-pages bucket
CREATE POLICY "Public can read blog SEO pages"
ON storage.objects FOR SELECT
USING (bucket_id = 'blog-seo-pages');

-- Allow service role to manage blog SEO pages
CREATE POLICY "Service can manage blog SEO pages"
ON storage.objects FOR ALL
USING (bucket_id = 'blog-seo-pages')
WITH CHECK (bucket_id = 'blog-seo-pages');