-- Create storage bucket for blog images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('blog-images', 'blog-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access
CREATE POLICY "Public can view blog images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'blog-images');

-- Allow authenticated users to upload
CREATE POLICY "Auth users can upload blog images" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'blog-images');

-- Allow authenticated users to update
CREATE POLICY "Auth users can update blog images" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'blog-images');

-- Allow authenticated users to delete
CREATE POLICY "Auth users can delete blog images" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'blog-images');