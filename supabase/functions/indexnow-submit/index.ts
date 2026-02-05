const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// IndexNow key - must match the key file at blog.vistaceo.com/indexnow-key.txt
const INDEXNOW_KEY = "8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d";
const BLOG_HOST = "blog.vistaceo.com";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { urls } = body;

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return new Response(JSON.stringify({ error: "URLs array required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Format URLs for IndexNow
    const formattedUrls = urls.map((url: string) => {
      if (url.startsWith("http")) return url;
      return `https://${BLOG_HOST}/${url.replace(/^\//, "")}`;
    });

    console.log("Submitting URLs to IndexNow:", formattedUrls);

    // Submit to multiple search engines via IndexNow
    const indexNowEndpoints = [
      "https://api.indexnow.org/indexnow",
      "https://www.bing.com/indexnow",
      "https://yandex.com/indexnow",
    ];

    const payload = {
      host: BLOG_HOST,
      key: INDEXNOW_KEY,
      keyLocation: `https://${BLOG_HOST}/indexnow-key.txt`,
      urlList: formattedUrls,
    };

    const results = await Promise.allSettled(
      indexNowEndpoints.map(async (endpoint) => {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        return {
          endpoint,
          status: response.status,
          ok: response.ok,
        };
      })
    );

    const successCount = results.filter(
      (r) => r.status === "fulfilled" && r.value.ok
    ).length;

    console.log("IndexNow results:", results);

    return new Response(JSON.stringify({
      success: true,
      submitted: formattedUrls.length,
      engines: results.map((r) => 
        r.status === "fulfilled" ? r.value : { error: (r as PromiseRejectedResult).reason }
      ),
      successCount,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("IndexNow submit error:", error);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
