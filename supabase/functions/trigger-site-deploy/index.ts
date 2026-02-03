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

    // Check if we have GitHub token configured
    const githubToken = Deno.env.get('GITHUB_TOKEN');
    const githubRepo = Deno.env.get('GITHUB_REPO'); // format: owner/repo
    
    if (githubToken && githubRepo) {
      // Trigger GitHub Actions workflow dispatch
      console.log('[trigger-site-deploy] Triggering GitHub Actions workflow...');
      
      const workflowResponse = await fetch(
        `https://api.github.com/repos/${githubRepo}/actions/workflows/deploy.yml/dispatches`,
        {
          method: 'POST',
          headers: {
            'Accept': 'application/vnd.github.v3+json',
            'Authorization': `token ${githubToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ref: 'main',
            inputs: {
              post_id: post_id || '',
              trigger_reason: trigger_reason || 'blog_update'
            }
          })
        }
      );

      if (workflowResponse.ok || workflowResponse.status === 204) {
        console.log('[trigger-site-deploy] GitHub workflow triggered successfully');
        return new Response(JSON.stringify({
          success: true,
          message: 'Deploy triggered via GitHub Actions',
          deploy_log: deployLog
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } else {
        const errorText = await workflowResponse.text();
        console.error('[trigger-site-deploy] GitHub API error:', workflowResponse.status, errorText);
      }
    }

    // Fallback: Just log that deploy was requested
    // In Lovable, deploys happen automatically when code is pushed
    // So the SSG script running in postbuild will handle everything
    console.log('[trigger-site-deploy] No GitHub token configured - relying on auto-deploy');
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Deploy trigger logged. SSG will run on next deploy.',
      deploy_log: deployLog,
      note: 'Configure GITHUB_TOKEN and GITHUB_REPO secrets to enable automatic GitHub Actions triggers'
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
