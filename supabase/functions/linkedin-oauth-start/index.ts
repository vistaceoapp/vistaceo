import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const clientId = Deno.env.get('LINKEDIN_CLIENT_ID');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    // Redirect to the edge function callback
    const redirectUri = `${supabaseUrl}/functions/v1/linkedin-oauth-callback`;
    
    if (!clientId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'LinkedIn Client ID not configured'
      }), { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // Generate state for CSRF protection
    const state = crypto.randomUUID();

    // LinkedIn OAuth scopes for personal posting
    // w_member_social - allows posting as the authenticated member
    // Note: w_organization_social requires "Community Management API" product approval
    const scopes = [
      'w_member_social',  // Post as member (works without special approval)
      'r_liteprofile',     // Basic profile info
      'openid',
      'profile',
      'email'
    ].join(' ');

    // Build LinkedIn authorization URL
    const authUrl = new URL('https://www.linkedin.com/oauth/v2/authorization');
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('scope', scopes);

    console.log('[linkedin-oauth-start] Generated auth URL');

    return new Response(JSON.stringify({
      success: true,
      auth_url: authUrl.toString(),
      state
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('[linkedin-oauth-start] Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});