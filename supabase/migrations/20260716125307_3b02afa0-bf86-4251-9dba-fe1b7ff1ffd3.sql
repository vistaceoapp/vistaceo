DROP POLICY IF EXISTS "Service role can manage blog images" ON storage.objects;
DROP POLICY IF EXISTS "Service role can upload blog images" ON storage.objects;

CREATE POLICY "Service role can manage blog images"
ON storage.objects
FOR ALL
TO public
USING (bucket_id = 'blog-images' AND auth.role() = 'service_role'::text)
WITH CHECK (bucket_id = 'blog-images' AND auth.role() = 'service_role'::text);
