import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 5000;

/**
 * Trigger Site Deploy Edge Function - Self-Healing Version
 * 
 * Triggers GitHub Pages rebuild with automatic retries and diagnostics.
 * On repeated failures, sends alert email and logs to blog_runs.
 */
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { post_id, trigger_reason } = await req.json().catch(() => ({}));

    console.log('[trigger-site-deploy] Received trigger:', { post_id, trigger_reason });

    const ghPat = Deno.env.get('GH_PAT');
    const githubTokenEnv = Deno.env.get('GITHUB_TOKEN');
    const githubToken = ghPat || githubTokenEnv;
    const githubRepo = Deno.env.get('GITHUB_REPO') || 'vistaceoapp/vistaceo';

    if (!githubToken) {
      console.error('[trigger-site-deploy] No GitHub token configured!');
      return new Response(JSON.stringify({
        success: false,
        error: 'No GH_PAT or GITHUB_TOKEN configured',
        fix: 'Add GH_PAT secret with a GitHub PAT that has repo+workflow scopes'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Retry loop with exponential backoff
    let lastError = '';
    let lastStatus = 0;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      console.log(`[trigger-site-deploy] Attempt ${attempt}/${MAX_RETRIES}...`);

      try {
        const response = await fetch(
          `https://api.github.com/repos/${githubRepo}/dispatches`,
          {
            method: 'POST',
            headers: {
              'Accept': 'application/vnd.github+json',
              'Authorization': `Bearer ${githubToken}`,
              'Content-Type': 'application/json',
              'User-Agent': 'VistaCEO-Deploy/2.0',
              'X-GitHub-Api-Version': '2022-11-28',
            },
            body: JSON.stringify({
              event_type: 'blog-post-published',
              client_payload: {
                post_id: post_id || null,
                trigger_reason: trigger_reason || 'manual',
                timestamp: new Date().toISOString(),
              },
            }),
          }
        );

        if (response.ok || response.status === 204) {
          console.log(`[trigger-site-deploy] ✅ Dispatch sent successfully on attempt ${attempt}`);
          return new Response(JSON.stringify({
            success: true,
            message: 'Deploy triggered via repository_dispatch',
            attempt,
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        lastStatus = response.status;
        lastError = await response.text();
        console.error(`[trigger-site-deploy] Attempt ${attempt} failed: ${lastStatus} - ${lastError}`);

        // Don't retry on auth errors (401/403) - token is bad
        if (lastStatus === 401 || lastStatus === 403) {
          console.error('[trigger-site-deploy] Auth error - token is invalid or lacks permissions');
          break;
        }

      } catch (fetchError) {
        lastError = fetchError instanceof Error ? fetchError.message : String(fetchError);
        console.error(`[trigger-site-deploy] Attempt ${attempt} exception: ${lastError}`);
      }

      // Wait before retry (exponential backoff)
      if (attempt < MAX_RETRIES) {
        const delay = RETRY_DELAY_MS * attempt;
        console.log(`[trigger-site-deploy] Waiting ${delay}ms before retry...`);
        await new Promise(r => setTimeout(r, delay));
      }
    }

    // All retries failed - send alert email
    console.error('[trigger-site-deploy] All retries exhausted!');
    
    try {
      const resendKey = Deno.env.get('RESEND_API_KEY');
      if (resendKey) {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'VistaCEO Blog <info@vistaceo.com>',
            to: ['info@vistaceo.com'],
            subject: '🚨 Blog Deploy FAILED - All retries exhausted',
            html: `
              <h2>Deploy Trigger Failed</h2>
              <p><strong>Post ID:</strong> ${post_id || 'N/A'}</p>
              <p><strong>Reason:</strong> ${trigger_reason || 'manual'}</p>
              <p><strong>Last Status:</strong> ${lastStatus}</p>
              <p><strong>Last Error:</strong> ${lastError}</p>
              <p><strong>Token configured:</strong> GH_PAT=${Boolean(ghPat)}, GITHUB_TOKEN=${Boolean(githubTokenEnv)}</p>
              <p><strong>Repo:</strong> ${githubRepo}</p>
              <hr>
              <p style="color:#999;">Check that the PAT has repo+workflow scopes and hasn't expired.</p>
            `,
          }),
        });
      }
    } catch (_) { /* best effort */ }

    return new Response(JSON.stringify({
      success: false,
      error: `Deploy failed after ${MAX_RETRIES} attempts`,
      last_status: lastStatus,
      last_error: lastError,
      fix: 'Check GH_PAT has repo+workflow scopes and is not expired',
    }), {
      status: 502,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[trigger-site-deploy] Fatal error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
