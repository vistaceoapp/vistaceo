// Blog Health Scan — corre cada 2 días. AI mínima: solo regex/HTTP checks.
// Reporta incidentes a ops_incidents vía report-incident.
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BLOG_BASE = "https://blog.vistaceo.com";

async function reportIncident(supabase: any, payload: Record<string, unknown>) {
  try {
    await supabase.functions.invoke("report-incident", { body: payload });
  } catch (e) {
    console.error("[blog-health-scan] report failed", e);
  }
}

function checkSeoBasics(html: string, slug: string): { issues: string[] } {
  const issues: string[] = [];
  const h1Count = (html.match(/<h1[\s>]/gi) || []).length;
  if (h1Count === 0) issues.push("missing_h1");
  if (h1Count > 1) issues.push("duplicate_h1");

  const metaDesc = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i);
  if (!metaDesc) issues.push("missing_meta_description");
  else {
    const len = metaDesc[1].length;
    if (len < 60 || len > 165) issues.push(`meta_description_length_${len}`);
  }

  if (!/rel=["']canonical["']/i.test(html)) issues.push("missing_canonical");
  if (!/application\/ld\+json/i.test(html)) issues.push("missing_jsonld");
  if (!/<nav[\s>]/i.test(html)) issues.push("missing_nav");
  if (!/og:image/i.test(html)) issues.push("missing_og_image");

  // alt en imágenes del contenido
  const imgs = html.match(/<img[^>]+>/gi) || [];
  const missingAlt = imgs.filter(t => !/\salt=["'][^"']+["']/i.test(t)).length;
  if (missingAlt > 0) issues.push(`images_missing_alt_${missingAlt}`);

  // placeholders / Lorem
  if (/\{\{[^}]+\}\}/.test(html)) issues.push("template_placeholder_leak");
  if (/Lorem ipsum/i.test(html)) issues.push("lorem_ipsum_leak");

  return { issues };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data: posts, error } = await supabase
    .from("blog_posts")
    .select("id, slug, title, hero_image_url, meta_description, content_md")
    .eq("status", "published")
    .order("publish_at", { ascending: false })
    .limit(50);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let scanned = 0;
  let withIssues = 0;
  const summary: Array<{ slug: string; issues: string[] }> = [];

  for (const p of posts || []) {
    scanned++;
    const url = `${BLOG_BASE}/${p.slug}/`;
    const allIssues: string[] = [];

    // 1) DB-level cheap checks
    if (!p.hero_image_url) allIssues.push("no_hero_image_url");
    if (!p.meta_description || p.meta_description.length < 60) allIssues.push("db_meta_thin");
    if (!p.content_md || p.content_md.length < 1500) allIssues.push("db_content_thin");

    // 2) HTML fetch + SEO checks
    try {
      const res = await fetch(url, { redirect: "follow" });
      if (!res.ok) {
        allIssues.push(`http_${res.status}`);
      } else {
        const html = await res.text();
        const { issues } = checkSeoBasics(html, p.slug);
        allIssues.push(...issues);
      }
    } catch (e) {
      allIssues.push("fetch_failed");
    }

    // 3) Hero image reachable
    if (p.hero_image_url) {
      try {
        const r = await fetch(p.hero_image_url, { method: "HEAD" });
        if (!r.ok) allIssues.push("hero_image_unreachable");
      } catch { allIssues.push("hero_image_unreachable"); }
    }

    if (allIssues.length > 0) {
      withIssues++;
      summary.push({ slug: p.slug, issues: allIssues });

      const critical = allIssues.some(i =>
        i.startsWith("http_5") || i === "db_content_thin" || i === "missing_h1" ||
        i === "template_placeholder_leak" || i === "lorem_ipsum_leak"
      );

      await reportIncident(supabase, {
        source: "blog",
        category: critical ? "structural" : "seo",
        severity: critical ? "high" : "medium",
        title: `Blog issues: ${p.slug} (${allIssues.length})`,
        where_path: `/${p.slug}/`,
        detected_by: "blog-health-scan",
        context: { post_id: p.id, slug: p.slug, issues: allIssues, url },
        fingerprint: `blog:${p.slug}:${allIssues.sort().join(",")}`,
      });

      // Auto-heal solo para alta severidad y problemas que sabemos arreglar quirúrgicamente
      const autohealable = allIssues.some(i =>
        i === "missing_meta_description" || i === "db_meta_thin" ||
        i.startsWith("meta_description_length_") ||
        i === "missing_h1" || i === "template_placeholder_leak"
      );
      if (critical && autohealable) {
        try {
          await supabase.functions.invoke("blog-autoheal", {
            body: { post_id: p.id, issues: allIssues },
          });
        } catch (e) {
          console.error("[blog-health-scan] autoheal invoke failed", e);
        }
      }
    }
  }



  return new Response(JSON.stringify({ scanned, withIssues, summary }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
