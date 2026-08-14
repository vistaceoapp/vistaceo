import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BLOG_HOST = 'blog.vistaceo.com';
const MAIN_HOST = 'www.vistaceo.com';
const BLOG_URL = `https://${BLOG_HOST}`;
const MAIN_URL = `https://${MAIN_HOST}`;
const INDEXNOW_KEY = '8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d';

const INDEXNOW_ENGINES = [
  'https://api.indexnow.org/indexnow',
  'https://www.bing.com/indexnow',
  'https://yandex.com/indexnow',
  'https://searchadvisor.naver.com/indexnow',
  'https://search.seznam.cz/indexnow',
];

const MIN_POSTS_PER_CLUSTER = 3;

async function submitBatch(host: string, keyLocation: string, urlList: string[]) {
  const payload = { host, key: INDEXNOW_KEY, keyLocation, urlList };
  const settled = await Promise.allSettled(
    INDEXNOW_ENGINES.map(async (engine) => {
      const resp = await fetch(engine, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(payload),
      });
      return { engine, status: resp.status, ok: resp.ok || resp.status === 202 };
    })
  );
  return settled.map((r) => (r.status === 'fulfilled' ? r.value : { engine: 'unknown', status: 0, ok: false, error: String(r.reason) }));
}

async function submitAll(host: string, keyLocation: string, urls: string[]) {
  const out: unknown[] = [];
  for (let i = 0; i < urls.length; i += 100) {
    out.push(...(await submitBatch(host, keyLocation, urls.slice(i, i + 100))));
    if (i + 100 < urls.length) await new Promise((r) => setTimeout(r, 400));
  }
  return out;
}

/**
 * Auto-Index Posts — submits every indexable URL (blog posts, clusters,
 * categories and main-domain pages) to IndexNow across 5 engines.
 */
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: recentPosts, error: postsError } = await supabase
      .from('blog_posts')
      .select('slug, category, updated_at')
      .eq('status', 'published')
      .order('updated_at', { ascending: false })
      .limit(2000);

    if (postsError) {
      console.error('[auto-index] Error fetching posts:', postsError);
      throw postsError;
    }

    const posts = recentPosts || [];
    const postUrls = posts.map((p) => `${BLOG_URL}/${p.slug}/`);

    // Only clusters with enough depth (thin hubs stay "crawled, not indexed")
    const counts: Record<string, number> = {};
    for (const p of posts) {
      const c = (p as { category: string | null }).category;
      if (c) counts[c] = (counts[c] || 0) + 1;
    }
    const clusterUrls = Object.entries(counts)
      .filter(([, n]) => n >= MIN_POSTS_PER_CLUSTER)
      .flatMap(([slug]) => [`${BLOG_URL}/tema/${slug}/`, `${BLOG_URL}/categoria/${slug}/`]);

    const blogUrls = [...new Set([`${BLOG_URL}/`, ...clusterUrls, ...postUrls])];

    // Main domain indexable pages
    const mainUrls = [
      `${MAIN_URL}/`,
      `${MAIN_URL}/promo`,
      `${MAIN_URL}/politicas`,
      `${MAIN_URL}/condiciones`,
    ];

    console.log(`[auto-index] blog URLs: ${blogUrls.length} | main URLs: ${mainUrls.length}`);

    const [blogResults, mainResults] = await Promise.all([
      submitAll(BLOG_HOST, `${BLOG_URL}/indexnow-key.txt`, blogUrls),
      submitAll(MAIN_HOST, `${MAIN_URL}/${INDEXNOW_KEY}.txt`, mainUrls),
    ]);

    // Warm sitemaps so CDN caches refresh before the next crawl
    const sitemapWarmup = await Promise.allSettled([
      fetch(`${BLOG_URL}/sitemap.xml`, { headers: { 'Cache-Control': 'no-cache' } }),
      fetch(`${MAIN_URL}/sitemap.xml`, { headers: { 'Cache-Control': 'no-cache' } }),
      fetch(`${MAIN_URL}/sitemap-pages.xml`, { headers: { 'Cache-Control': 'no-cache' } }),
    ]);

    const results = {
      posts_found: postUrls.length,
      clusters_submitted: clusterUrls.length,
      blog_urls_submitted: blogUrls.length,
      main_urls_submitted: mainUrls.length,
      indexnow_blog: blogResults,
      indexnow_main: mainResults,
      sitemap_warmup: sitemapWarmup.map((r) =>
        r.status === 'fulfilled' ? { status: r.value.status, ok: r.value.ok } : { error: String(r.reason) }
      ),
    };

    await supabase.from('blog_runs').insert({
      result: 'success',
      run_at: new Date().toISOString(),
      notes: `Auto-index: ${blogUrls.length} URLs blog + ${mainUrls.length} main a ${INDEXNOW_ENGINES.length} motores`,
      quality_gate_report: results as unknown as Record<string, unknown>,
    });

    console.log('[auto-index] ✅ Complete');

    return new Response(JSON.stringify({ success: true, ...results, timestamp: new Date().toISOString() }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[auto-index] Fatal error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
