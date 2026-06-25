
SELECT cron.unschedule('blog-daily-publish');
SELECT cron.unschedule('generate-blog-post-every-3-days');
SELECT cron.unschedule('blog-content-autoheal-daily');
SELECT cron.unschedule('blog-health-scan-every-2-days');
SELECT cron.unschedule('weekly-insight-scan');

SELECT cron.schedule(
  'blog-publish-every-6-days',
  '0 14 */6 * *',
  $cmd$
  SELECT net.http_post(
    url := 'https://nlewrgmcawzcdazhfiyy.supabase.co/functions/v1/blog-daily-publish',
    headers := '{"Content-Type":"application/json","apikey":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5sZXdyZ21jYXd6Y2RhemhmaXl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1MDg0NjksImV4cCI6MjA4MjA4NDQ2OX0.fWTySDGOsNNvddTJSj39qVq5gAWwXOVXf-dBzfDDJl0"}'::jsonb,
    body := jsonb_build_object('trigger','cron','time',now())
  );
  $cmd$
);
