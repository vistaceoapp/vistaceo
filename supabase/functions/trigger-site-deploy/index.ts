import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Trigger Site Deploy Edge Function
 * 
 * Triggers a rebuild and deploy of the static site when:
 * - A blog post is published (draft -> published)
 * - A published post is updated (title, content, meta, image changes)
 * 
 * This ensures SSG OG pages are regenerated for all posts.
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { post_id, trigger_reason } = await req.json().catch(() => ({}));

    console.log('[trigger-site-deploy] Received trigger:', { post_id, trigger_reason });

    // Log the deploy trigger for debugging
    const deployLog = {
      triggered_at: new Date().toISOString(),
      post_id: post_id || null,
      reason: trigger_reason || 'manual',
      status: 'pending'
    };

    // For now, we log the trigger. In production, this would:
    // 1. Call GitHub Actions API to trigger a workflow
    // 2. Or use a webhook to trigger the CI/CD pipeline
    // 3. Or use Lovable's auto-deploy (which happens on git push)

    console.log('[trigger-site-deploy] Deploy log:', deployLog);

    // Trigger the GitHub Pages build for the Astro blog
    // Prefer GH_PAT (per project convention) and fall back to GITHUB_TOKEN if present.
    const ghPat = Deno.env.get('GH_PAT');
    const githubTokenEnv = Deno.env.get('GITHUB_TOKEN');
    const githubToken = ghPat || githubTokenEnv;
    const githubRepo = Deno.env.get('GITHUB_REPO') || 'vistaceoapp/vistaceo'; // owner/repo

    const diagnostics = {
      has_gh_pat: Boolean(ghPat && ghPat.length > 0),
      has_github_token: Boolean(githubTokenEnv && githubTokenEnv.length > 0),
      github_repo: githubRepo,
    };

    console.log('[trigger-site-deploy] Diagnostics:', diagnostics);

    if (githubToken && githubRepo) {
      console.log('[trigger-site-deploy] Triggering GitHub repository_dispatch...');

      // This repo workflow listens to: repository_dispatch: types: [blog-post-published]
      const workflowResponse = await fetch(
        `https://api.github.com/repos/${githubRepo}/dispatches`,
        {
          method: 'POST',
          headers: {
            'Accept': 'application/vnd.github+json',
            'Authorization': `token ${githubToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            event_type: 'blog-post-published',
            client_payload: {
              post_id: post_id || null,
              trigger_reason: trigger_reason || 'manual',
            },
          }),
        }
      );

      if (workflowResponse.ok || workflowResponse.status === 204) {
        console.log('[trigger-site-deploy] repository_dispatch sent successfully');
        return new Response(JSON.stringify({
          success: true,
          message: 'Deploy triggered via repository_dispatch',
          deploy_log: deployLog,
          diagnostics,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const errorText = await workflowResponse.text();
      console.error('[trigger-site-deploy] GitHub API error:', workflowResponse.status, errorText);

      return new Response(JSON.stringify({
        success: false,
        message: 'GitHub API call failed',
        deploy_log: deployLog,
        diagnostics,
        github_status: workflowResponse.status,
        github_error: errorText,
      }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Fallback: Just log that deploy was requested
    console.log('[trigger-site-deploy] No GitHub token configured - relying on auto-deploy');

    return new Response(JSON.stringify({
      success: true,
      message: 'Deploy trigger logged. SSG will run on next deploy.',
      deploy_log: deployLog,
      diagnostics,
      note: 'Configure GH_PAT or GITHUB_TOKEN (and optionally GITHUB_REPO) to enable automatic GitHub Actions triggers'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[trigger-site-deploy] Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
