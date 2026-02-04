-- Add RLS policies for blog-images bucket to allow service role uploads

-- Policy for service role to insert objects
CREATE POLICY "Service role can upload blog images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'blog-images');

-- Policy for public read access
CREATE POLICY "Blog images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'blog-images');

-- Policy for service role to update/delete
CREATE POLICY "Service role can manage blog images" 
ON storage.objects 
FOR ALL 
USING (bucket_id = 'blog-images');