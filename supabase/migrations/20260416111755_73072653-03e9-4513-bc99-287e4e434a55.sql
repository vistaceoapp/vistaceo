UPDATE blog_posts 
SET meta_title = TRIM(REGEXP_REPLACE(meta_title, '\s*\|\s*VistaCEO\s*$', '', 'i')),
    updated_at = now()
WHERE meta_title ILIKE '%| VistaCEO%';