
-- Remover programaciones previas si existen
SELECT cron.unschedule(jobname) FROM cron.job
 WHERE jobname IN (
   'blog-content-autoheal-daily',
   'blog-health-scan-every-2-days',
   'blog-content-autoheal-15d',
   'blog-health-scan-15d'
 );

-- Reprogramar cada 15 días
SELECT cron.schedule(
  'blog-content-autoheal-15d',
  '0 5 */15 * *',
  $cmd$
  SELECT net.http_post(
    url := 'https://nlewrgmcawzcdazhfiyy.supabase.co/functions/v1/blog-content-autoheal',
    headers := '{"Content-Type":"application/json","Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5sZXdyZ21jYXd6Y2RhemhmaXl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1MDg0NjksImV4cCI6MjA4MjA4NDQ2OX0.fWTySDGOsNNvddTJSj39qVq5gAWwXOVXf-dBzfDDJl0"}'::jsonb,
    body := '{}'::jsonb
  );
  $cmd$
);

SELECT cron.schedule(
  'blog-health-scan-15d',
  '30 4 */15 * *',
  $cmd$
  SELECT net.http_post(
    url := 'https://nlewrgmcawzcdazhfiyy.supabase.co/functions/v1/blog-health-scan',
    headers := '{"Content-Type":"application/json","apikey":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5sZXdyZ21jYXd6Y2RhemhmaXl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1MDg0NjksImV4cCI6MjA4MjA4NDQ2OX0.fWTySDGOsNNvddTJSj39qVq5gAWwXOVXf-dBzfDDJl0"}'::jsonb,
    body := '{"trigger":"cron"}'::jsonb
  );
  $cmd$
);
