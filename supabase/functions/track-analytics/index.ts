import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// =====================================================================
// FILTRO SUAVE ANTI-BOTS Y TRÁFICO INDESEADO
// =====================================================================
// No bloquea el acceso al sitio. Solo evita ensuciar las métricas con
// tráfico que casi nunca corresponde a usuarios reales:
//   1) User-Agents conocidos de bots/crawlers/scrapers/headless
//   2) Países fuera del mercado objetivo (LATAM + España + EE. UU.)
//   3) Eventos sin URL/sesión (probables hits sintéticos).
// =====================================================================

const BOT_UA_PATTERNS = [
  /bot\b/i, /crawler/i, /spider/i, /slurp/i, /baidu/i, /yandex/i,
  /bingpreview/i, /facebookexternalhit/i, /scrapy/i, /headlesschrome/i,
  /phantomjs/i, /puppeteer/i, /playwright/i, /selenium/i, /python-requests/i,
  /curl\//i, /wget\//i, /go-http-client/i, /java\//i, /okhttp/i,
  /ahrefs/i, /semrush/i, /mj12/i, /dotbot/i, /petalbot/i, /bytespider/i,
  /gptbot/i, /ccbot/i, /claudebot/i, /perplexitybot/i, /chatgpt-user/i,
  /netcraft/i, /nimbostratus/i, /datanyze/i, /linkdex/i,
];

const MARKET_COUNTRIES = new Set([
  // LATAM
  "AR", "BO", "CL", "CO", "CR", "CU", "DO", "EC", "SV", "GT", "HN",
  "MX", "NI", "PA", "PY", "PE", "PR", "UY", "VE",
  // Iberia + diáspora hispanohablante
  "ES", "US",
]);

function looksLikeBot(ua: string | null): boolean {
  if (!ua || ua.length < 5) return true;
  return BOT_UA_PATTERNS.some((rx) => rx.test(ua));
}

function isUnwantedCountry(country: string | null): boolean {
  if (!country) return false; // si no podemos detectar, no descartamos
  return !MARKET_COUNTRIES.has(country.toUpperCase());
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body = await req.json();
    const {
      visitor_id,
      session_id,
      page_url,
      page_path,
      referrer,
      utm_source,
      utm_medium,
      utm_campaign,
      device_type,
      browser,
      event_type = "pageview",
      event_data = {},
      duration_seconds,
      scroll_depth,
      blog_post_slug,
    } = body;

    const country = req.headers.get("cf-ipcountry") || req.headers.get("x-vercel-ip-country") || null;
    const region = req.headers.get("cf-region") || null;
    const ua = req.headers.get("user-agent");

    // ===== Filtro suave: descartar tráfico sospechoso =====
    if (looksLikeBot(ua)) {
      return new Response(JSON.stringify({ success: true, filtered: "bot" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (isUnwantedCountry(country)) {
      return new Response(JSON.stringify({ success: true, filtered: "out_of_market" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!page_url || !session_id) {
      return new Response(JSON.stringify({ success: true, filtered: "incomplete" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { error } = await supabase.from("web_analytics").insert({
      visitor_id: visitor_id || `anon_${Date.now()}`,
      session_id: session_id || `sess_${Date.now()}`,
      page_url,
      page_path,
      referrer,
      utm_source,
      utm_medium,
      utm_campaign,
      device_type,
      browser,
      country,
      region,
      event_type,
      event_data,
      duration_seconds,
      scroll_depth,
      blog_post_slug,
    });

    if (error) {
      console.error("Error inserting analytics:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (blog_post_slug && event_type === "pageview") {
      const today = new Date().toISOString().split("T")[0];
      try {
        await supabase.rpc("upsert_blog_daily_analytics", {
          p_post_slug: blog_post_slug,
          p_date: today,
          p_device: device_type || "unknown",
          p_country: country || "unknown",
          p_referrer: referrer || "direct",
        });
      } catch (e) {
        console.log("RPC not available yet:", e);
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Track analytics error:", error);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
