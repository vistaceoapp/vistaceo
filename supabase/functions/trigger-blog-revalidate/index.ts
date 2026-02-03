import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BLOG_REVALIDATE_URL = "https://blog.vistaceo.com/api/revalidate";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { slug, cluster, type = "single" } = await req.json();
    
    const revalidateSecret = Deno.env.get("REVALIDATE_SECRET");
    
    if (!revalidateSecret) {
      console.error("[trigger-blog-revalidate] Missing REVALIDATE_SECRET");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[trigger-blog-revalidate] Triggering revalidation for slug: ${slug}, cluster: ${cluster}`);

    // Call the Next.js revalidate endpoint
    const response = await fetch(BLOG_REVALIDATE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-revalidate-secret": revalidateSecret,
      },
      body: JSON.stringify({ slug, cluster, type }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[trigger-blog-revalidate] Revalidation failed: ${response.status} - ${errorText}`);
      return new Response(
        JSON.stringify({ error: "Revalidation failed", status: response.status, details: errorText }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = await response.json();
    console.log(`[trigger-blog-revalidate] Revalidation successful:`, result);

    return new Response(
      JSON.stringify({ success: true, result }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[trigger-blog-revalidate] Error:", error);
    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
