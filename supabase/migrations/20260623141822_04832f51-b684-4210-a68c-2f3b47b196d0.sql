DELETE FROM ai_plan_jobs WHERE status = 'failed' AND error ILIKE '%crédit%';
UPDATE ai_plan_jobs SET status = 'failed', error = 'Job expirado por inactividad — vuelve a generarlo', updated_at = now()
 WHERE status IN ('pending','processing') AND created_at < now() - interval '15 minutes';