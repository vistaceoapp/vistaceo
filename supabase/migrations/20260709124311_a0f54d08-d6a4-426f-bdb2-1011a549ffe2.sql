
-- 1) Purgar oportunidades genéricas hardcoded (setup_seed) que se sembraron a negocios que NO son locales/retail.
--    Estas oportunidades ("Perfil de Google", "oferta estrella en Instagram") no aplican a B2B/consultoría/SaaS/real estate.
DELETE FROM public.opportunities
WHERE evidence->>'origin' = 'setup_seed'
  AND (
    title = 'Activá tu Perfil de Google con fotos y horarios'
    OR title = 'Definí tu oferta estrella y comunicala en redes'
  );

-- 2) Acelerar cadencia del blog: de cada 6 días a cada 3 días (per memoria del proyecto).
SELECT cron.unschedule('blog-publish-every-6-days')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'blog-publish-every-6-days');

SELECT cron.schedule(
  'blog-publish-every-3-days',
  '0 14 */3 * *',
  $$
  SELECT net.http_post(
    url := 'https://nlewrgmcawzcdazhfiyy.supabase.co/functions/v1/blog-daily-publish',
    headers := jsonb_build_object('Content-Type','application/json','Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)),
    body := jsonb_build_object('trigger','cron_3d')
  ) AS request_id;
  $$
);
