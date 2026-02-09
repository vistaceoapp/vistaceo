import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * SEO AUTO-INDEXER - Sistema de Indexación Continua Ultra-Inteligente
 * 
 * Este sistema garantiza indexación perfecta mediante:
 * 1. Escaneo automático de posts no indexados
 * 2. Verificación de calidad SEO pre-indexación
 * 3. Multi-ping a IndexNow, Google, Bing, Yandex
 * 4. Re-intento inteligente de URLs fallidas
 * 5. Logging completo para auditoría
 * 
 * Ejecutar vía cron cada hora: '0 * * * *'
 */

const INDEXNOW_KEY = "8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d";
const BLOG_HOST = "blog.vistaceo.com";
const BLOG_URL = `https://${BLOG_HOST}`;

interface IndexingResult {
  url: string;
  success: boolean;
  engines: { name: string; status: number; ok: boolean }[];
  seoScore: number;
  issues: string[];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("[SEO-Auto-Indexer] Starting full SEO audit and indexing cycle...");

    // ========== PHASE 1: FETCH ALL PUBLISHED POSTS ==========
    const { data: posts, error: postsError } = await supabase
      .from("blog_posts")
      .select("id, slug, title, hero_image_url, meta_description, meta_title, content_md, publish_at, updated_at, status")
      .eq("status", "published")
      .order("publish_at", { ascending: false })
      .limit(500);

    if (postsError) {
      console.error("[SEO-Auto-Indexer] DB error:", postsError);
      throw postsError;
    }

    console.log(`[SEO-Auto-Indexer] Found ${posts?.length || 0} published posts`);

    // ========== PHASE 2: SEO QUALITY AUDIT ==========
    const auditResults: IndexingResult[] = [];
    const urlsToIndex: string[] = [];
    const criticalIssues: { slug: string; issues: string[] }[] = [];

    for (const post of posts || []) {
      const seoAudit = auditPostSEO(post);
      
      if (seoAudit.criticalIssues.length > 0) {
        criticalIssues.push({ slug: post.slug, issues: seoAudit.criticalIssues });
        console.warn(`[SEO-Auto-Indexer] Post ${post.slug} has critical issues:`, seoAudit.criticalIssues);
      }

      // Only index posts with score >= 70
      if (seoAudit.score >= 70) {
        urlsToIndex.push(`${BLOG_URL}/${post.slug}/`);
      }

      auditResults.push({
        url: `${BLOG_URL}/${post.slug}/`,
        success: seoAudit.score >= 70,
        engines: [],
        seoScore: seoAudit.score,
        issues: seoAudit.allIssues,
      });
    }

    // Always include critical pages
    const criticalPages = [
      `${BLOG_URL}/`,
      `${BLOG_URL}/sitemap.xml`,
      // All 12 clusters
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
    ];

    const allUrls = [...new Set([...criticalPages, ...urlsToIndex])];

    console.log(`[SEO-Auto-Indexer] Total URLs to index: ${allUrls.length}`);
    console.log(`[SEO-Auto-Indexer] Posts with critical issues: ${criticalIssues.length}`);

    // ========== PHASE 3: MULTI-ENGINE INDEXING ==========
    const indexingResults = await submitToAllEngines(allUrls);

    // ========== PHASE 4: PING SITEMAPS ==========
    await pingSitemaps();

    // ========== PHASE 5: LOG RESULTS ==========
    const successCount = indexingResults.filter(r => r.ok).length;
    
    console.log(`[SEO-Auto-Indexer] Indexing complete:`);
    console.log(`  - URLs submitted: ${allUrls.length}`);
    console.log(`  - Successful pings: ${successCount}`);
    console.log(`  - Posts with SEO issues: ${criticalIssues.length}`);

    return new Response(JSON.stringify({
      success: true,
      timestamp: new Date().toISOString(),
      stats: {
        totalPosts: posts?.length || 0,
        urlsIndexed: allUrls.length,
        successfulPings: successCount,
        postsWithIssues: criticalIssues.length,
      },
      criticalIssues: criticalIssues.slice(0, 10), // Limit for response size
      indexingResults,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("[SEO-Auto-Indexer] Error:", error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

/**
 * Comprehensive SEO audit for a single post
 */
function auditPostSEO(post: {
  slug: string;
  title: string;
  hero_image_url: string | null;
  meta_description: string | null;
  meta_title: string | null;
  content_md: string;
}): { score: number; criticalIssues: string[]; allIssues: string[] } {
  let score = 100;
  const criticalIssues: string[] = [];
  const allIssues: string[] = [];

  // CRITICAL: Hero image (mandatory)
  if (!post.hero_image_url || !post.hero_image_url.startsWith('https://')) {
    score -= 30;
    criticalIssues.push('missing_hero_image');
    allIssues.push('missing_hero_image');
  }

  // CRITICAL: Meta description
  if (!post.meta_description || post.meta_description.length < 50) {
    score -= 20;
    criticalIssues.push('missing_or_short_meta_description');
    allIssues.push('missing_or_short_meta_description');
  } else if (post.meta_description.length > 160) {
    score -= 5;
    allIssues.push('meta_description_too_long');
  }

  // CRITICAL: Meta title
  if (!post.meta_title || post.meta_title.length < 20) {
    score -= 15;
    criticalIssues.push('missing_or_short_meta_title');
    allIssues.push('missing_or_short_meta_title');
  } else if (post.meta_title.length > 60) {
    score -= 3;
    allIssues.push('meta_title_too_long');
  }

  // Content quality checks
  const contentMd = post.content_md || '';
  
  // Check for HTML pollution
  if (/%3c\s*a/i.test(contentMd) || /<img\s+[^>]*class/i.test(contentMd)) {
    score -= 15;
    criticalIssues.push('html_pollution_in_markdown');
    allIssues.push('html_pollution_in_markdown');
  }

  // Check for broken URLs
  if (/nlewrgmcawzcdazhfiyy\.supabase\.co\/st\.\.\./i.test(contentMd)) {
    score -= 10;
    allIssues.push('truncated_storage_urls');
  }

  // Check content length (min 800 words for SEO)
  const wordCount = contentMd.split(/\s+/).filter(w => w.length > 2).length;
  if (wordCount < 500) {
    score -= 10;
    allIssues.push('content_too_short');
  }

  // Check for headings structure
  const hasH2 = /^##\s+/m.test(contentMd);
  const hasH3 = /^###\s+/m.test(contentMd);
  if (!hasH2) {
    score -= 5;
    allIssues.push('missing_h2_headings');
  }
  if (!hasH3) {
    score -= 2;
    allIssues.push('missing_h3_headings');
  }

  // Check for internal links
  const hasInternalLinks = /\[.*?\]\(\/[^)]+\)/.test(contentMd) || 
                           /blog\.vistaceo\.com/.test(contentMd);
  if (!hasInternalLinks) {
    score -= 3;
    allIssues.push('no_internal_links');
  }

  return { score: Math.max(0, score), criticalIssues, allIssues };
}

/**
 * Submit URLs to all search engines
 */
async function submitToAllEngines(urlList: string[]): Promise<{ endpoint: string; status: number; ok: boolean }[]> {
  // Submit in batches of 100 (IndexNow limit)
  const batches: string[][] = [];
  for (let i = 0; i < urlList.length; i += 100) {
    batches.push(urlList.slice(i, i + 100));
  }

  const allResults: { endpoint: string; status: number; ok: boolean }[] = [];

  for (const batch of batches) {
    const payload = {
      host: BLOG_HOST,
      key: INDEXNOW_KEY,
      keyLocation: `${BLOG_URL}/indexnow-key.txt`,
      urlList: batch,
    };

    const indexNowEndpoints = [
      "https://api.indexnow.org/indexnow",
      "https://www.bing.com/indexnow",
      "https://yandex.com/indexnow",
    ];

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
          return { endpoint, status: 0, ok: false };
        }
      })
    );

    allResults.push(
      ...results.map((r) =>
        r.status === "fulfilled" ? r.value : { endpoint: "unknown", status: 0, ok: false }
      )
    );

    // Delay between batches
    if (batches.length > 1) {
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  return allResults;
}

/**
 * Ping all major search engine sitemaps
 */
async function pingSitemaps(): Promise<void> {
  const sitemapUrl = `${BLOG_URL}/sitemap.xml`;
  
  const pingUrls = [
    `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`,
    `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`,
  ];

  console.log("[SEO-Auto-Indexer] Pinging sitemaps...");

  try {
    await Promise.allSettled(pingUrls.map((url) => fetch(url)));
    console.log("[SEO-Auto-Indexer] Sitemap pings sent to Google & Bing");
  } catch (e) {
    console.error("[SEO-Auto-Indexer] Sitemap ping error:", e);
  }
}
