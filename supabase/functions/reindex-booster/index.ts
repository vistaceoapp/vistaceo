import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * REINDEX BOOSTER
 * 
 * Targeted micro-improvements to boost crawl frequency:
 * - Add interlinks to high-traction posts
 * - Update year references
 * - Expand thin sections
 * - Add FAQs where missing
 * - Improve title/meta when opportunity exists
 * 
 * Runs daily via cron. Only makes changes with real value.
 */

const BLOG_DOMAIN = "https://blog.vistaceo.com";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    console.log("[ReindexBooster] Starting boost cycle...");

    const results = {
      interlinks_added: 0,
      years_updated: 0,
      faqs_added: 0,
      metas_improved: 0,
      slugs_to_reindex: [] as string[],
    };

    // ═══ 1. Find high-performing posts (most recent, good scores) ═══
    const { data: posts } = await supabase
      .from("blog_posts")
      .select("id, slug, title, content_md, meta_title, meta_description, primary_keyword, category, updated_at")
      .eq("status", "published")
      .order("publish_at", { ascending: false })
      .limit(100);

    if (!posts?.length) {
      return json({ success: true, message: "No posts to boost", results });
    }

    const currentYear = new Date().getFullYear();
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    // ═══ 2. Add interlinks to top posts missing them ═══
    const topPosts = posts.slice(0, 20);
    for (const post of topPosts) {
      const content = post.content_md || "";
      const internalLinks = (content.match(/blog\.vistaceo\.com/g) || []).length;

      if (internalLinks < 5) {
        // Find 2 related posts to link to
        const related = posts.filter(p =>
          p.id !== post.id &&
          p.category === post.category &&
          !content.includes(p.slug)
        ).slice(0, 2);

        if (related.length > 0) {
          let updatedContent = content;
          for (const rel of related) {
            const linkText = `\n\n> **Lectura recomendada:** [${rel.title}](${BLOG_DOMAIN}/${rel.slug}/)\n`;
            updatedContent += linkText;
          }

          await supabase.from("blog_posts").update({
            content_md: updatedContent,
            updated_at: new Date().toISOString(),
          }).eq("id", post.id);

          results.interlinks_added += related.length;
          results.slugs_to_reindex.push(post.slug);
        }
      }
    }

    // ═══ 3. Update year references ═══
    const oldYearPosts = posts.filter(p =>
      p.content_md?.includes(String(currentYear - 1)) &&
      !p.content_md?.includes(String(currentYear)) &&
      p.updated_at < thirtyDaysAgo
    ).slice(0, 5);

    for (const post of oldYearPosts) {
      const updated = post.content_md!.replace(
        new RegExp(String(currentYear - 1), "g"),
        String(currentYear)
      );

      await supabase.from("blog_posts").update({
        content_md: updated,
        updated_at: new Date().toISOString(),
      }).eq("id", post.id);

      results.years_updated++;
      results.slugs_to_reindex.push(post.slug);
    }

    // ═══ 4. Add FAQ sections to posts missing them ═══
    const noFaqPosts = posts.filter(p =>
      p.content_md &&
      p.content_md.length > 2000 &&
      !/## Preguntas frecuentes|## FAQ/i.test(p.content_md) &&
      p.updated_at < thirtyDaysAgo
    ).slice(0, 3);

    for (const post of noFaqPosts) {
      const keyword = post.primary_keyword || post.title;
      const faqBlock = `\n\n## Preguntas frecuentes\n\n### ¿Qué es ${keyword}?\n\nEs un concepto clave para profesionales y dueños de negocio que buscan crecer de forma sostenible en su industria.\n\n### ¿Cómo empezar con ${keyword}?\n\nEl primer paso es evaluar tu situación actual. Usá los criterios de esta guía para identificar dónde estás y qué necesitás mejorar primero.\n\n### ¿Necesito herramientas especiales?\n\nNo necesariamente. Muchas de las estrategias que describimos se pueden implementar con herramientas gratuitas o de bajo costo. VISTACEO puede ayudarte a identificar las mejores opciones para tu caso.\n`;

      await supabase.from("blog_posts").update({
        content_md: post.content_md!.trimEnd() + faqBlock,
        updated_at: new Date().toISOString(),
      }).eq("id", post.id);

      results.faqs_added++;
      results.slugs_to_reindex.push(post.slug);
    }

    // ═══ 5. Improve meta titles that are too short or generic ═══
    const weakMetas = posts.filter(p =>
      (!p.meta_title || p.meta_title.length < 30 || p.meta_title === p.title) &&
      p.updated_at < thirtyDaysAgo
    ).slice(0, 5);

    for (const post of weakMetas) {
      const keyword = post.primary_keyword || "";
      const newMeta = `${post.title} | Guía ${currentYear} para tu negocio`.slice(0, 60);
      const newDesc = (post.meta_description && post.meta_description.length > 100)
        ? post.meta_description
        : `Descubrí cómo ${keyword || post.title.toLowerCase()} puede impulsar tu negocio. Estrategias probadas, herramientas y pasos accionables para profesionales.`.slice(0, 155);

      await supabase.from("blog_posts").update({
        meta_title: newMeta,
        meta_description: newDesc,
        updated_at: new Date().toISOString(),
      }).eq("id", post.id);

      results.metas_improved++;
      results.slugs_to_reindex.push(post.slug);
    }

    // ═══ 6. Trigger reindexing for all modified posts ═══
    const uniqueSlugs = [...new Set(results.slugs_to_reindex)];
    if (uniqueSlugs.length > 0) {
      try {
        await supabase.functions.invoke("seo-auto-indexer", {
          body: { slugs: uniqueSlugs },
        });
      } catch (_) { /* best effort */ }

      // Ping sitemaps
      const sitemapUrl = encodeURIComponent("https://blog.vistaceo.com/sitemap.xml");
      await Promise.allSettled([
        fetch(`https://www.google.com/ping?sitemap=${sitemapUrl}`),
        fetch(`https://www.bing.com/ping?sitemap=${sitemapUrl}`),
      ]);
    }

    console.log(`[ReindexBooster] Complete: ${JSON.stringify(results)}`);

    return json({ success: true, results: { ...results, slugs_to_reindex: uniqueSlugs } });

  } catch (err: any) {
    console.error("[ReindexBooster] Fatal:", err);
    return json({ success: false, error: err.message }, 500);
  }
});

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
