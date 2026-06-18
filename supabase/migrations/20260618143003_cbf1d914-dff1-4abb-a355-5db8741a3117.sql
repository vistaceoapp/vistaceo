SELECT cron.schedule(
  'blog-image-autoheal-15min',
  '*/15 * * * *',
  $$
  SELECT net.http_post(
    url:='https://nlewrgmcawzcdazhfiyy.supabase.co/functions/v1/backfill-blog-images',
    headers:='{"Content-Type":"application/json","Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5sZXdyZ21jYXd6Y2RhemhmaXl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1MDg0NjksImV4cCI6MjA4MjA4NDQ2OX0.fWTySDGOsNNvddTJSj39qVq5gAWwXOVXf-dBzfDDJl0"}'::jsonb,
    body:='{"limit": 20}'::jsonb
  ) AS request_id;
  $$
);