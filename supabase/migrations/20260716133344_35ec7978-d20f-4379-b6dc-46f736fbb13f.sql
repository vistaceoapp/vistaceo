-- Automated recovery: prevent users from getting stuck in setup without follow-up.

-- Remove previous versions if they exist
SELECT cron.unschedule(jobname) FROM cron.job
 WHERE jobname IN ('recover-credit-stuck-daily', 'dispatch-incomplete-setup-daily');

-- Daily recovery for users whose businesses show credit/setup abandonment (idempotent per user)
SELECT cron.schedule(
  'recover-credit-stuck-daily',
  '0 15 * * *',
  $cmd$
  SELECT net.http_post(
    url := 'https://nlewrgmcawzcdazhfiyy.supabase.co/functions/v1/recover-credit-stuck-users',
    headers := '{"Content-Type":"application/json","Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5sZXdyZ21jYXd6Y2RhemhmaXl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1MDg0NjksImV4cCI6MjA4MjA4NDQ2OX0.fWTySDGOsNNvddTJSj39qVq5gAWwXOVXf-dBzfDDJl0"}'::jsonb,
    body := '{"dryRun": false}'::jsonb
  );
  $cmd$
);

-- Daily escalated reminders for users with incomplete setup
SELECT cron.schedule(
  'dispatch-incomplete-setup-daily',
  '30 15 * * *',
  $cmd$
  SELECT net.http_post(
    url := 'https://nlewrgmcawzcdazhfiyy.supabase.co/functions/v1/dispatch-incomplete-setup-reminders',
    headers := '{"Content-Type":"application/json","Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5sZXdyZ21jYXd6Y2RhemhmaXl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1MDg0NjksImV4cCI6MjA4MjA4NDQ2OX0.fWTySDGOsNNvddTJSj39qVq5gAWwXOVXf-dBzfDDJl0"}'::jsonb,
    body := '{}'::jsonb
  );
  $cmd$
);