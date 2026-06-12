DO $$
BEGIN
  PERFORM cron.unschedule('ops-watchdog');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

SELECT cron.schedule(
  'ops-watchdog',
  '*/30 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://nlewrgmcawzcdazhfiyy.supabase.co/functions/v1/ops-watchdog',
    headers := '{"Content-Type":"application/json","apikey":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5sZXdyZ21jYXd6Y2RhemhmaXl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1MDg0NjksImV4cCI6MjA4MjA4NDQ2OX0.fWTySDGOsNNvddTJSj39qVq5gAWwXOVXf-dBzfDDJl0"}'::jsonb,
    body := jsonb_build_object('trigger','cron','time',now())
  );
  $$
);