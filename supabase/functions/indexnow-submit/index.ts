import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// IndexNow key - must match the key file at blog.vistaceo.com/indexnow-key.txt
const INDEXNOW_KEY = "8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d";
const BLOG_HOST = "blog.vistaceo.com";
const BLOG_URL = `https://${BLOG_HOST}`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { urls, action } = body;

    // If action is "reindex-all", fetch all published posts from DB
    if (action === "reindex-all") {
      console.log("[IndexNow] Reindexing ALL published blog posts...");
      
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      const { data: posts, error: dbError } = await supabase
        .from("blog_posts")
        .select("slug")
        .eq("status", "published")
        .order("publish_at", { ascending: false })
        .limit(500);
      
      if (dbError) {
        console.error("[IndexNow] DB error:", dbError);
        return new Response(JSON.stringify({ error: "Failed to fetch posts" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      // Build URL list: home + clusters + all posts
      const allUrls = [
        `${BLOG_URL}/`,
        `${BLOG_URL}/sitemap.xml`,
        // 12 clusters
        `${BLOG_URL}/tema/empleo-habilidades/`,
        `${BLOG_URL}/tema/ia-para-pymes/`,
        `${BLOG_URL}/tema/servicios-profesionales-rentabilidad/`,
        `${BLOG_URL}/tema/marketing-crecimiento/`,
        `${BLOG_URL}/tema/finanzas-cashflow/`,
        `${BLOG_URL}/tema/operaciones-procesos/`,
        `${BLOG_URL}/tema/ventas-negociacion/`,
        `${BLOG_URL}/tema/liderazgo-management/`,
        `${BLOG_URL}/tema/estrategia-latam/`,
        `${BLOG_URL}/tema/herramientas-productividad/`,
        `${BLOG_URL}/tema/data-analytics/`,
        `${BLOG_URL}/tema/tendencias-ia-tech/`,
        // All post URLs
        ...(posts || []).map(p => `${BLOG_URL}/${p.slug}/`)
      ];
      
      console.log(`[IndexNow] Submitting ${allUrls.length} URLs...`);
      
      // Submit in batches of 100 (IndexNow limit)
      const batches = [];
      for (let i = 0; i < allUrls.length; i += 100) {
        batches.push(allUrls.slice(i, i + 100));
      }
      
      const allResults = [];
      
      for (const batch of batches) {
        const results = await submitToIndexNow(batch);
        allResults.push(...results);
        
        // Small delay between batches
        if (batches.length > 1) {
          await new Promise(r => setTimeout(r, 500));
        }
      }
      
      // Also ping Google sitemap
      try {
        await fetch(`https://www.google.com/ping?sitemap=${encodeURIComponent(BLOG_URL + '/sitemap.xml')}`);
        console.log("[IndexNow] Pinged Google sitemap");
      } catch (e) {
        console.log("[IndexNow] Google ping failed (non-critical)");
      }
      
      return new Response(JSON.stringify({
        success: true,
        action: "reindex-all",
        totalUrls: allUrls.length,
        batches: batches.length,
        results: allResults,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Original behavior: submit specific URLs
    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return new Response(JSON.stringify({ error: "URLs array required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Format URLs for IndexNow
    const formattedUrls = urls.map((url: string) => {
      if (url.startsWith("http")) return url;
      return `${BLOG_URL}/${url.replace(/^\//, "")}`;
    });

    console.log("[IndexNow] Submitting URLs:", formattedUrls);

    const results = await submitToIndexNow(formattedUrls);
    const successCount = results.filter(r => r.ok).length;

    // Also ping Google
    try {
      await fetch(`https://www.google.com/ping?sitemap=${encodeURIComponent(BLOG_URL + '/sitemap.xml')}`);
    } catch (_) {}

    return new Response(JSON.stringify({
      success: true,
      submitted: formattedUrls.length,
      engines: results,
      successCount,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[IndexNow] Error:", error);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function submitToIndexNow(urlList: string[]) {
  const indexNowEndpoints = [
    "https://api.indexnow.org/indexnow",
    "https://www.bing.com/indexnow",
    "https://yandex.com/indexnow",
  ];

  const payload = {
    host: BLOG_HOST,
    key: INDEXNOW_KEY,
    keyLocation: `${BLOG_URL}/indexnow-key.txt`,
    urlList,
  };

  const results = await Promise.allSettled(
    indexNowEndpoints.map(async (endpoint) => {
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        return {
          endpoint,
          status: response.status,
          ok: response.ok || response.status === 200 || response.status === 202,
        };
      } catch (e) {
        return {
          endpoint,
          status: 0,
          ok: false,
          error: String(e),
        };
      }
    })
  );

  return results.map((r) =>
    r.status === "fulfilled" ? r.value : { endpoint: "unknown", status: 0, ok: false, error: String(r.reason) }
  );
}
