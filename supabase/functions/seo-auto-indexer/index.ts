import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * SEO ULTRA-INDEXER - Sistema de Indexación Multi-Motor para IA y Buscadores
 *
 * Motores cubiertos:
 * - Google (sitemap ping + Search Console hint)
 * - Bing (IndexNow + sitemap ping)
 * - Yandex (IndexNow)
 * - IndexNow.org (distribuye a toda la red: Naver, Seznam, Yandex, Bing, etc.)
 * - DuckDuckGo (indexa via Bing; envía sitemap a Bing)
 * - Brave Search (indexa via IndexNow.org)
 * - Perplexity AI (rastrea desde Google/Bing; indexar = tener buen SEO)
 * - ChatGPT/Bing AI (indexa via Bing IndexNow)
 * - Gemini / Google AI (indexa via Google sitemap)
 * - Common Crawl / CC-Bot (indexa automáticamente por links + robots.txt)
 * 
 * Cron: cada hora '0 * * * *'
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

    console.log("[SEO-Ultra-Indexer] Starting full indexing cycle for ALL engines...");

    // ========== PHASE 1: FETCH RECENT/CHANGED POSTS (not all 500 every hour) ==========
    // Only index posts published or updated in the last 48 hours for efficiency
    // Full re-index happens weekly via the full scan
  // Index ALL published posts — not just recent ones — to maximize impressions
    const { data: recentPosts, error: recentError } = await supabase
      .from("blog_posts")
      .select("id, slug, title, hero_image_url, meta_description, meta_title, content_md, publish_at, updated_at, status, canonical_url")
      .eq("status", "published")
      .order("publish_at", { ascending: false })
      .limit(500);

    // Also get ALL posts for canonical URL fixes (lightweight query)
    const { data: allPosts, error: allPostsError } = await supabase
      .from("blog_posts")
      .select("id, slug, title, hero_image_url, meta_description, meta_title, content_md, publish_at, updated_at, status, canonical_url")
      .eq("status", "published")
      .order("publish_at", { ascending: false })
      .limit(500);

    if (recentError) {
      console.error("[SEO-Ultra-Indexer] DB error:", recentError);
      throw recentError;
    }

    const posts = recentPosts || [];
    console.log(`[SEO-Ultra-Indexer] Found ${posts.length} recent posts to index (${(allPosts || []).length} total published)`);

    // ========== PHASE 2: AUTO-REPAIR BROKEN CONTENT ==========
    let repairedCount = 0;
    for (const post of posts || []) {
      const repaired = autoRepairPostContent(post.content_md || '');
      if (repaired !== post.content_md) {
        await supabase
          .from("blog_posts")
          .update({ content_md: repaired, updated_at: new Date().toISOString() })
          .eq("id", post.id);
        repairedCount++;
        console.log(`[SEO-Ultra-Indexer] Auto-repaired content in: ${post.slug}`);
      }
    }
    if (repairedCount > 0) {
      console.log(`[SEO-Ultra-Indexer] Auto-repaired ${repairedCount} posts`);
    }

    // ========== PHASE 3: SEO QUALITY AUDIT ==========
    const auditResults: IndexingResult[] = [];
    const urlsToIndex: string[] = [];
    const criticalIssues: { slug: string; issues: string[] }[] = [];

    for (const post of posts || []) {
      const seoAudit = auditPostSEO(post);

      if (seoAudit.criticalIssues.length > 0) {
        criticalIssues.push({ slug: post.slug, issues: seoAudit.criticalIssues });
      }

      // Index all posts (even with minor issues) - don't block on non-critical
      urlsToIndex.push(`${BLOG_URL}/${post.slug}/`);

      auditResults.push({
        url: `${BLOG_URL}/${post.slug}/`,
        success: seoAudit.score >= 60,
        engines: [],
        seoScore: seoAudit.score,
        issues: seoAudit.allIssues,
      });
    }

    // Critical pages: home + sitemap + all 12 clusters
    const criticalPages = [
      `${BLOG_URL}/`,
      `${BLOG_URL}/sitemap.xml`,
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

    // All unique URLs (normalize with trailing slash)
    const allUrls = [...new Set([...criticalPages, ...urlsToIndex])].map(u =>
      u.endsWith('/') ? u : u + '/'
    );

    console.log(`[SEO-Ultra-Indexer] Total URLs to index: ${allUrls.length}`);

    // ========== PHASE 4: SUBMIT TO ALL ENGINES ==========
    const [indexNowResults, sitemapResults] = await Promise.allSettled([
      submitToIndexNowNetwork(allUrls),
      pingSitemapsAllEngines(),
    ]);

    // ========== PHASE 5: PING AI CRAWLERS ==========
    // These don't have direct APIs but benefit from fresh sitemap pings
    await pingAICrawlers();

    // ========== PHASE 6: FIX CANONICAL URLS IN DB (use blog.vistaceo.com, not www) ==========
    const CORRECT_BLOG_DOMAIN = "https://blog.vistaceo.com";
    
    const postsNeedingCanonicalFix = (allPosts || []).filter(p => {
      const correct = `${CORRECT_BLOG_DOMAIN}/${p.slug}/`;
      return p.canonical_url !== correct;
    });

    if (postsNeedingCanonicalFix.length > 0) {
      for (const p of postsNeedingCanonicalFix) {
        const correctCanonical = `${CORRECT_BLOG_DOMAIN}/${p.slug}/`;
        await supabase
          .from("blog_posts")
          .update({ canonical_url: correctCanonical })
          .eq("id", p.id);
      }
      console.log(`[SEO-Ultra-Indexer] Fixed ${postsNeedingCanonicalFix.length} canonical URLs to blog.vistaceo.com`);
    }

    const successCount = indexNowResults.status === 'fulfilled'
      ? indexNowResults.value.filter(r => r.ok).length
      : 0;

    console.log(`[SEO-Ultra-Indexer] Complete:`);
    console.log(`  - URLs indexed: ${allUrls.length}`);
    console.log(`  - Successful IndexNow pings: ${successCount}`);
    console.log(`  - Posts auto-repaired: ${repairedCount}`);
    console.log(`  - Posts with critical issues: ${criticalIssues.length}`);

    return new Response(JSON.stringify({
      success: true,
      timestamp: new Date().toISOString(),
      stats: {
        totalPosts: posts?.length || 0,
        urlsIndexed: allUrls.length,
        successfulPings: successCount,
        postsAutoRepaired: repairedCount,
        postsWithCriticalIssues: criticalIssues.length,
      },
      enginesTargeted: [
        "Google (sitemap ping)",
        "Bing (IndexNow + sitemap)",
        "Yandex (IndexNow)",
        "IndexNow.org (Naver, Seznam, Brave, etc.)",
        "DuckDuckGo (via Bing/IndexNow)",
        "Perplexity AI (via Google/Bing crawl)",
        "ChatGPT/Bing AI (via Bing IndexNow)",
        "Gemini AI (via Google sitemap)",
        "Common Crawl (via robots.txt + links)",
      ],
      criticalIssues: criticalIssues.slice(0, 10),
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("[SEO-Ultra-Indexer] Error:", error);
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
 * Auto-repair broken content in markdown before indexing
 */
function autoRepairPostContent(content: string): string {
  let clean = content;

  // Remove images with empty/invalid URLs
  clean = clean.replace(/!\[[^\]]*\]\(https?:\/\/\s*\)/g, '');
  clean = clean.replace(/!\[[^\]]*\]\(\s*\)/g, '');

  // Remove raw HTML img tags → convert to clean markdown
  clean = clean.replace(/<img\s+[^>]*src="([^"]+)"[^>]*alt="([^"]*)"[^>]*\/?>/gi, '![$2]($1)');
  clean = clean.replace(/<img\s+[^>]*alt="([^"]*)"[^>]*src="([^"]+)"[^>]*\/?>/gi, '![$1]($2)');
  clean = clean.replace(/<img\s+[^>]*src="([^"]+)"[^>]*\/?>/gi, '![]($1)');

  // Remove raw HTML anchor tags → convert to markdown
  clean = clean.replace(/<a\s+[^>]*href="([^"]+)"[^>]*>([^<]*)<\/a>/gi, '[$2]($1)');

  // Remove raw HTML img attributes leaking as text (loading="lazy", class="content-image", etc.)
  clean = clean.replace(/\s*(?:loading|decoding|class|style|width|height|srcset|sizes)\s*=\s*"[^"]*"/gi, '');

  // Remove truncated storage URL text (renders as visible code)
  clean = clean.replace(/nlewrgmcawzcdazhfiyy\.supabase\.co\/st\.\.\."[^>]*>/g, '');
  
  // Remove full Supabase storage URLs that appear as PLAIN TEXT (not inside markdown image/link syntax)
  // This catches when URLs leak outside of ![alt](url) or [text](url) syntax
  clean = clean.replace(/(?<![(\[])(https?:\/\/nlewrgmcawzcdazhfiyy\.supabase\.co\/storage\/v1\/object\/public\/blog-images\/[^\s"')>\]]+)/g, '');

  // Remove broken encoded URLs
  clean = clean.replace(/%3C[a-z]+[^%]*%3E/gi, '');
  
  // Remove raw HTML block/inline tags (keep inner text)
  clean = clean.replace(/<(?:div|span|section|article|header|footer|nav|p|br)\s*[^>]*>/gi, '');
  clean = clean.replace(/<\/(?:div|span|section|article|header|footer|nav|p|br)>/gi, '');

  // Clean up stray > from closing tags rendered as text
  clean = clean.replace(/^\s*>\s*$/gm, '');

  // Remove lines that are just HTML attribute text
  clean = clean.replace(/^\s*(?:src|alt|loading|class|width|height|decoding)\s*=\s*"[^"]*".*$/gm, '');

  return clean;
}

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

  if (!post.hero_image_url || !post.hero_image_url.startsWith('https://')) {
    score -= 30;
    criticalIssues.push('missing_hero_image');
    allIssues.push('missing_hero_image');
  }

  if (!post.meta_description || post.meta_description.length < 50) {
    score -= 20;
    criticalIssues.push('missing_or_short_meta_description');
    allIssues.push('missing_or_short_meta_description');
  } else if (post.meta_description.length > 160) {
    score -= 5;
    allIssues.push('meta_description_too_long');
  }

  if (!post.meta_title || post.meta_title.length < 20) {
    score -= 15;
    criticalIssues.push('missing_or_short_meta_title');
    allIssues.push('missing_or_short_meta_title');
  } else if (post.meta_title.length > 60) {
    score -= 3;
    allIssues.push('meta_title_too_long');
  }

  const contentMd = post.content_md || '';

  // Check for HTML pollution (visible code artifacts)
  if (/%3c\s*a/i.test(contentMd) || /<img\s+[^>]*class/i.test(contentMd)) {
    score -= 15;
    criticalIssues.push('html_pollution_in_markdown');
    allIssues.push('html_pollution_in_markdown');
  }

  // Check for empty image URLs
  if (/!\[[^\]]*\]\(https?:\/\/\s*\)/.test(contentMd)) {
    score -= 10;
    allIssues.push('empty_image_urls');
  }

  const wordCount = contentMd.split(/\s+/).filter(w => w.length > 2).length;
  if (wordCount < 500) {
    score -= 10;
    allIssues.push('content_too_short');
  }

  const hasH2 = /^##\s+/m.test(contentMd);
  if (!hasH2) {
    score -= 5;
    allIssues.push('missing_h2_headings');
  }

  const hasInternalLinks = /\[.*?\]\(https?:\/\/blog\.vistaceo\.com\/[^)]+\)/.test(contentMd) ||
    /\[.*?\]\(\/[^)]+\)/.test(contentMd) ||
    /blog\.vistaceo\.com/.test(contentMd);
  if (!hasInternalLinks) {
    score -= 3;
    allIssues.push('no_internal_links');
  }

  return { score: Math.max(0, score), criticalIssues, allIssues };
}

/**
 * Submit to IndexNow network (covers Bing, Yandex, Naver, Seznam, Brave, etc.)
 */
async function submitToIndexNowNetwork(urlList: string[]): Promise<{ endpoint: string; status: number; ok: boolean }[]> {
  const batches: string[][] = [];
  for (let i = 0; i < urlList.length; i += 100) {
    batches.push(urlList.slice(i, i + 100));
  }

  const allResults: { endpoint: string; status: number; ok: boolean }[] = [];

  // IndexNow endpoints - covers Bing, Yandex, Naver, Seznam, Brave, DuckDuckGo
  const indexNowEndpoints = [
    "https://api.indexnow.org/indexnow",  // Master - distributes to ALL IndexNow partners
    "https://www.bing.com/indexnow",       // Bing + ChatGPT/Copilot
    "https://yandex.com/indexnow",        // Yandex
    "https://search.seznam.cz/indexnow",  // Seznam (Czech Republic, but indexes globally)
    "https://searchadvisor.naver.com/indexnow", // Naver (Korea, but expands reach)
  ];

  for (const batch of batches) {
    const payload = {
      host: BLOG_HOST,
      key: INDEXNOW_KEY,
      keyLocation: `${BLOG_URL}/indexnow-key.txt`,
      urlList: batch,
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
          return { endpoint, status: 0, ok: false };
        }
      })
    );

    allResults.push(
      ...results.map((r) =>
        r.status === "fulfilled" ? r.value : { endpoint: "unknown", status: 0, ok: false }
      )
    );

    if (batches.length > 1) {
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  return allResults;
}

/**
 * Ping sitemaps to ALL major search engines and AI crawlers
 */
async function pingSitemapsAllEngines(): Promise<void> {
  const sitemapUrl = `${BLOG_URL}/sitemap.xml`;
  const encoded = encodeURIComponent(sitemapUrl);

  const pingUrls = [
    // Traditional search engines
    `https://www.google.com/ping?sitemap=${encoded}`,
    `https://www.bing.com/ping?sitemap=${encoded}`,
    // RSS feed pings for additional discovery
    `https://www.google.com/ping?sitemap=${encodeURIComponent(`${BLOG_URL}/rss.xml`)}`,
    `https://www.bing.com/ping?sitemap=${encodeURIComponent(`${BLOG_URL}/rss.xml`)}`,
    // Webmaster ping endpoints
    `https://rpc.pingomatic.com/`,
  ];

  console.log("[SEO-Ultra-Indexer] Pinging sitemaps to Google + Bing...");

  try {
    const results = await Promise.allSettled(pingUrls.map((url) => fetch(url)));
    const successCount = results.filter(r => r.status === 'fulfilled').length;
    console.log(`[SEO-Ultra-Indexer] Sitemap pings: ${successCount}/${pingUrls.length} successful`);
  } catch (e) {
    console.error("[SEO-Ultra-Indexer] Sitemap ping error:", e);
  }
}

/**
 * Ping AI-specific crawlers and discovery endpoints
 * These crawlers index content for Perplexity, ChatGPT browsing, etc.
 */
async function pingAICrawlers(): Promise<void> {
  console.log("[SEO-Ultra-Indexer] Pinging AI crawler endpoints...");

  const crawlerPings = [
    // Google RSS + Atom feed discovery
    `https://www.google.com/ping?sitemap=${encodeURIComponent(`${BLOG_URL}/rss.xml`)}`,
    // PubSubHubbub / WebSub for instant feed notification
    `https://pubsubhubbub.appspot.com/publish`,
    // Pingomatic covers: Google Blog Search, Weblogs, Moreover, Syndic8, NewsGator, BlogDigger, etc.
    `https://rpc.pingomatic.com/`,
  ];

  // Also try WebSub notification for RSS
  try {
    await fetch("https://pubsubhubbub.appspot.com/publish", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `hub.mode=publish&hub.url=${encodeURIComponent(`${BLOG_URL}/rss.xml`)}`,
    });
    console.log("[SEO-Ultra-Indexer] WebSub notification sent for RSS feed");
  } catch (_) { /* best effort */ }

  try {
    await Promise.allSettled(crawlerPings.map(url => fetch(url)));
    console.log("[SEO-Ultra-Indexer] AI crawler pings complete");
  } catch (e) {
    console.warn("[SEO-Ultra-Indexer] AI crawler ping partial failure (non-critical)");
  }
}
