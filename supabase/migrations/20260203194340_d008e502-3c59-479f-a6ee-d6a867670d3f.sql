-- Update bucket to allow text/html with charset
UPDATE storage.buckets 
SET allowed_mime_types = ARRAY['text/html', 'text/html; charset=utf-8', 'application/json']
WHERE id = 'blog-ssg-pages';