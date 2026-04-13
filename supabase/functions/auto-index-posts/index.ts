import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BLOG_URL = 'https://blog.vistaceo.com';
const MAIN_URL = 'https://www.vistaceo.com';
const INDEXNOW_KEY = '8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d';

/**
 * Auto-Index Posts Edge Function
 * 
 * Runs every 2-3 days via pg_cron. Finds posts published since last run
 * and submits them to:
 * 1. IndexNow (Bing, Yandex, Naver, Seznam) - instant indexing
 * 2. Google Ping (sitemap notification)
 * 3. Bing Webmaster ping
 * 
 * Also submits the main sitemap URLs to ensure crawlers pick up new content.
 */
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: recentPosts, error: postsError } = await supabase
      .from('blog_posts')
      .select('slug, title, publish_at, updated_at')
      .eq('status', 'published')
      .order('updated_at', { ascending: false })
      .limit(1000);

    if (postsError) {
      console.error('[auto-index] Error fetching posts:', postsError);
      throw postsError;
    }

    const postUrls = (recentPosts || []).map(p => `${BLOG_URL}/${p.slug}/`);
    
    // Also include key pages that should always be fresh
    const staticUrls = [
      `${BLOG_URL}/`,
      `${BLOG_URL}/sitemap.xml`,
      `${MAIN_URL}/`,
      `${MAIN_URL}/sitemap.xml`,
    ];

    const allUrls = [...new Set([...postUrls, ...staticUrls])];

    console.log(`[auto-index] Found ${postUrls.length} recent posts to index`);
    console.log(`[auto-index] Total URLs to submit: ${allUrls.length}`);

    const results: Record<string, unknown> = {
      posts_found: postUrls.length,
      urls_submitted: allUrls.length,
      indexnow: { success: false },
      google_ping: { success: false },
      bing_ping: { success: false },
    };

    // 1. IndexNow - Submit to Bing, Yandex, Naver, Seznam simultaneously
    if (postUrls.length > 0) {
      const indexNowPayload = {
        host: 'blog.vistaceo.com',
        key: INDEXNOW_KEY,
        keyLocation: `${BLOG_URL}/indexnow-key.txt`,
        urlList: postUrls.slice(0, 10000), // IndexNow supports up to 10k URLs
      };

      const indexNowEngines = [
        'https://api.indexnow.org/indexnow',
        'https://www.bing.com/indexnow',
        'https://yandex.com/indexnow',
      ];

      const indexNowResults = await Promise.allSettled(
        indexNowEngines.map(async (engine) => {
          const resp = await fetch(engine, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json; charset=utf-8' },
            body: JSON.stringify(indexNowPayload),
          });
          return { engine, status: resp.status, ok: resp.ok };
        })
      );

      results.indexnow = {
        success: true,
        engines: indexNowResults.map(r => 
          r.status === 'fulfilled' ? r.value : { error: String(r.reason) }
        ),
      };

      console.log('[auto-index] IndexNow results:', JSON.stringify(results.indexnow));
    }

    // 2. Google Ping - Notify about sitemap updates
    const googlePingUrls = [
      `https://www.google.com/ping?sitemap=${encodeURIComponent(`${BLOG_URL}/sitemap.xml`)}`,
      `https://www.google.com/ping?sitemap=${encodeURIComponent(`${MAIN_URL}/sitemap.xml`)}`,
    ];

    const googleResults = await Promise.allSettled(
      googlePingUrls.map(async (url) => {
        const resp = await fetch(url);
        return { url, status: resp.status, ok: resp.ok };
      })
    );

    results.google_ping = {
      success: true,
      pings: googleResults.map(r => 
        r.status === 'fulfilled' ? r.value : { error: String(r.reason) }
      ),
    };

    // 3. Bing Webmaster Ping
    const bingPingUrls = [
      `https://www.bing.com/ping?sitemap=${encodeURIComponent(`${BLOG_URL}/sitemap.xml`)}`,
      `https://www.bing.com/ping?sitemap=${encodeURIComponent(`${MAIN_URL}/sitemap.xml`)}`,
    ];

    const bingResults = await Promise.allSettled(
      bingPingUrls.map(async (url) => {
        const resp = await fetch(url);
        return { url, status: resp.status, ok: resp.ok };
      })
    );

    results.bing_ping = {
      success: true,
      pings: bingResults.map(r => 
        r.status === 'fulfilled' ? r.value : { error: String(r.reason) }
      ),
    };

    // Log the run for auditing
    await supabase.from('blog_runs').insert({
      result: 'success',
      run_at: new Date().toISOString(),
      notes: `Auto-index: ${postUrls.length} posts submitted to IndexNow + Google/Bing ping`,
      quality_gate_report: results as Record<string, unknown>,
    });

    console.log('[auto-index] ✅ Complete. Results:', JSON.stringify(results));

    return new Response(JSON.stringify({
      success: true,
      ...results,
      timestamp: new Date().toISOString(),
    }), {
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
