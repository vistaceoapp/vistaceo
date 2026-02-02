import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');
    const errorDescription = url.searchParams.get('error_description');

    if (error) {
      console.error('[linkedin-oauth-callback] OAuth error:', error, errorDescription);
      // Redirect to admin with error
      return new Response(null, {
        status: 302,
        headers: {
          'Location': `https://www.vistaceo.com/admin/integrations/linkedin?error=${encodeURIComponent(error)}`
        }
      });
    }

    if (!code) {
      return new Response(null, {
        status: 302,
        headers: {
          'Location': 'https://www.vistaceo.com/admin/integrations/linkedin?error=no_code'
        }
      });
    }

    const clientId = Deno.env.get('LINKEDIN_CLIENT_ID')!;
    const clientSecret = Deno.env.get('LINKEDIN_CLIENT_SECRET')!;
    const redirectUri = Deno.env.get('LINKEDIN_REDIRECT_URI') || 'https://www.vistaceo.com/admin/integrations/linkedin/callback';
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Exchange code for access token
    console.log('[linkedin-oauth-callback] Exchanging code for token...');

    const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      const errorBody = await tokenResponse.text();
      console.error('[linkedin-oauth-callback] Token exchange failed:', errorBody);
      return new Response(null, {
        status: 302,
        headers: {
          'Location': `https://www.vistaceo.com/admin/integrations/linkedin?error=token_exchange_failed`
        }
      });
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    const expiresIn = tokenData.expires_in; // Usually 5184000 (60 days)

    console.log('[linkedin-oauth-callback] Token obtained, expires in:', expiresIn, 'seconds');

    // Get organization info (need to fetch which orgs the user manages)
    // First, get user's profile to find organization admin access
    const profileResponse = await fetch('https://api.linkedin.com/v2/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    let organizationUrn = '';
    let organizationName = 'VistaCEO';

    // Get organizations the user administers
    const orgsResponse = await fetch(
      'https://api.linkedin.com/v2/organizationalEntityAcls?q=roleAssignee&role=ADMINISTRATOR&projection=(elements*(organizationalTarget))',
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-Restli-Protocol-Version': '2.0.0',
        },
      }
    );

    if (orgsResponse.ok) {
      const orgsData = await orgsResponse.json();
      console.log('[linkedin-oauth-callback] Organizations:', JSON.stringify(orgsData));
      
      if (orgsData.elements && orgsData.elements.length > 0) {
        organizationUrn = orgsData.elements[0].organizationalTarget;
        
        // Get organization details
        const orgId = organizationUrn.split(':').pop();
        const orgDetailsResponse = await fetch(
          `https://api.linkedin.com/v2/organizations/${orgId}`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'X-Restli-Protocol-Version': '2.0.0',
            },
          }
        );
        
        if (orgDetailsResponse.ok) {
          const orgDetails = await orgDetailsResponse.json();
          organizationName = orgDetails.localizedName || 'VistaCEO';
        }
      }
    } else {
      console.log('[linkedin-oauth-callback] Could not fetch organizations, will need manual setup');
    }

    // Calculate token expiry
    const expiresAt = new Date(Date.now() + (expiresIn * 1000));

    // Store in database
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Upsert integration record WITH access token
    const { error: upsertError } = await supabase.from('linkedin_integration').upsert({
      id: '00000000-0000-0000-0000-000000000001', // Singleton
      organization_urn: organizationUrn,
      organization_name: organizationName,
      status: organizationUrn ? 'connected' : 'pending',
      access_token_expires_at: expiresAt.toISOString(),
      access_token: accessToken, // Store token directly in DB
      refresh_token: tokenData.refresh_token || null,
    });

    if (upsertError) {
      console.error('[linkedin-oauth-callback] Error storing integration:', upsertError);
      throw upsertError;
    }

    console.log('[linkedin-oauth-callback] ✅ Access token stored in database successfully');

    // Redirect to success page
    const successUrl = new URL('https://www.vistaceo.com/admin/integrations/linkedin');
    successUrl.searchParams.set('success', 'true');
    successUrl.searchParams.set('org', organizationName);

    return new Response(null, {
      status: 302,
      headers: {
        'Location': successUrl.toString()
      }
    });

  } catch (error) {
    console.error('[linkedin-oauth-callback] Error:', error);
    return new Response(null, {
      status: 302,
      headers: {
        'Location': `https://www.vistaceo.com/admin/integrations/linkedin?error=unknown`
      }
    });
  }
});