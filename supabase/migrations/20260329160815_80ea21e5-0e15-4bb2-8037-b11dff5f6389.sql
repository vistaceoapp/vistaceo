
-- Restrict blog-images storage policies: only admins and service_role can write
-- Drop overly permissive policies
DROP POLICY IF EXISTS "Auth users can upload blog images" ON storage.objects;
DROP POLICY IF EXISTS "Auth users can delete blog images" ON storage.objects;
DROP POLICY IF EXISTS "Auth users can update blog images" ON storage.objects;

-- Allow only admins to upload blog images
CREATE POLICY "Admins can upload blog images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'blog-images' AND (
    auth.role() = 'service_role' OR
    public.has_role(auth.uid(), 'admin')
  )
);

-- Allow only admins to update blog images
CREATE POLICY "Admins can update blog images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'blog-images' AND (
    auth.role() = 'service_role' OR
    public.has_role(auth.uid(), 'admin')
  )
);

-- Allow only admins to delete blog images
CREATE POLICY "Admins can delete blog images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'blog-images' AND (
    auth.role() = 'service_role' OR
    public.has_role(auth.uid(), 'admin')
  )
);
