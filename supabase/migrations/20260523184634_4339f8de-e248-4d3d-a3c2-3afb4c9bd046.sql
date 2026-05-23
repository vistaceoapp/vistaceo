-- Reactivar publicación automática del blog (~1 nota cada 5 días en promedio)
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Limpiar jobs previos si existen
DO $$
BEGIN
  PERFORM cron.unschedule('blog-daily-publish');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
  PERFORM cron.unschedule('blog-auto-index');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Diario 14:00 UTC (11:00 ARG): tira el dado de publicación (80% nada / 20% una nota)
SELECT cron.schedule(
  'blog-daily-publish',
  '0 14 * * *',
  $$
  SELECT net.http_post(
    url := 'https://nlewrgmcawzcdazhfiyy.supabase.co/functions/v1/blog-daily-publish',
    headers := '{"Content-Type":"application/json","apikey":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5sZXdyZ21jYXd6Y2RhemhmaXl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1MDg0NjksImV4cCI6MjA4MjA4NDQ2OX0.fWTySDGOsNNvddTJSj39qVq5gAWwXOVXf-dBzfDDJl0"}'::jsonb,
    body := jsonb_build_object('trigger','cron','time',now())
  );
  $$
);

-- Auto-index 2 horas después: ping a Google/Bing/Yandex via IndexNow
SELECT cron.schedule(
  'blog-auto-index',
  '0 16 * * *',
  $$
  SELECT net.http_post(
    url := 'https://nlewrgmcawzcdazhfiyy.supabase.co/functions/v1/auto-index-posts',
    headers := '{"Content-Type":"application/json","apikey":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5sZXdyZ21jYXd6Y2RhemhmaXl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1MDg0NjksImV4cCI6MjA4MjA4NDQ2OX0.fWTySDGOsNNvddTJSj39qVq5gAWwXOVXf-dBzfDDJl0"}'::jsonb,
    body := jsonb_build_object('trigger','cron','time',now())
  );
  $$
);