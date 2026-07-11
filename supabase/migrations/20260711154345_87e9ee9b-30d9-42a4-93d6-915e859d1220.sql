
UPDATE businesses
SET settings = COALESCE(settings, '{}'::jsonb) - 'seeding_completed_at' - 'seeding_started_at'
WHERE id = 'a7d096e7-0e45-4ab2-81e5-a5aae551018f';
