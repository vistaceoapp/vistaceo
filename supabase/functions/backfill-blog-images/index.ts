import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Backfill Blog Images Job
 * 
 * Processes all published blog posts and generates missing images:
 * - Hero images (required for all posts)
 * - Inline images (optional enhancement)
 * 
 * Handles:
 * - Posts with no hero_image_url
 * - Posts with base64 images (migrates to storage)
 * - Posts with broken/invalid image URLs
 */

interface BackfillResult {
  slug: string;
  status: 'skipped' | 'generated' | 'migrated' | 'failed';
  hero_url?: string;
  error?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { 
      batch_size = 5,
      dry_run = false,
      force_regenerate = false 
    } = await req.json().catch(() => ({}));

    console.log(`[backfill-blog-images] Starting backfill (batch: ${batch_size}, dry_run: ${dry_run})`);

    // Get all published posts that need image processing
    let query = supabase
      .from('blog_posts')
      .select('id, slug, title, pillar, excerpt, hero_image_url, image_alt_text')
      .eq('status', 'published')
      .order('publish_at', { ascending: false });

    if (!force_regenerate) {
      // Only get posts missing images or with base64
      query = query.or('hero_image_url.is.null,hero_image_url.like.data:%');
    }

    const { data: posts, error } = await query.limit(batch_size);

    if (error) throw error;

    console.log(`[backfill-blog-images] Found ${posts?.length || 0} posts to process`);

    if (!posts || posts.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: 'No posts need image processing',
        processed: 0,
        results: []
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const results: BackfillResult[] = [];

    for (const post of posts) {
      console.log(`[backfill-blog-images] Processing: ${post.slug}`);
      
      try {
        // Determine what needs to be done
        const needsGeneration = !post.hero_image_url || post.hero_image_url === '';
        const needsMigration = post.hero_image_url?.startsWith('data:');
        const hasValidImage = post.hero_image_url?.startsWith('https://');

        if (hasValidImage && !force_regenerate) {
          console.log(`[backfill-blog-images] ${post.slug}: Already has valid image, skipping`);
          results.push({ slug: post.slug, status: 'skipped' });
          continue;
        }

        if (dry_run) {
          console.log(`[backfill-blog-images] ${post.slug}: Would ${needsMigration ? 'migrate' : 'generate'} image (dry run)`);
          results.push({ 
            slug: post.slug, 
            status: needsMigration ? 'migrated' : 'generated',
            hero_url: '[DRY RUN]'
          });
          continue;
        }

        // Call the image generation function
        const response = await fetch(`${supabaseUrl}/functions/v1/generate-blog-images`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            post_id: post.id,
            mode: 'single'
          }),
        });

        const result = await response.json();

        if (result.success && result.result?.hero_url) {
          results.push({ 
            slug: post.slug, 
            status: needsMigration ? 'migrated' : 'generated',
            hero_url: result.result.hero_url
          });
          console.log(`[backfill-blog-images] ${post.slug}: Success`);
        } else {
          results.push({ 
            slug: post.slug, 
            status: 'failed',
            error: result.error || 'Generation returned no image'
          });
          console.log(`[backfill-blog-images] ${post.slug}: Failed`);
        }

        // Rate limiting between posts
        await new Promise(resolve => setTimeout(resolve, 4000));

      } catch (err) {
        console.error(`[backfill-blog-images] Error for ${post.slug}:`, err);
        results.push({ 
          slug: post.slug, 
          status: 'failed',
          error: String(err)
        });
      }
    }

    // Summary
    const summary = {
      total: results.length,
      generated: results.filter(r => r.status === 'generated').length,
      migrated: results.filter(r => r.status === 'migrated').length,
      skipped: results.filter(r => r.status === 'skipped').length,
      failed: results.filter(r => r.status === 'failed').length,
    };

    console.log(`[backfill-blog-images] Complete:`, summary);

    return new Response(JSON.stringify({
      success: true,
      summary,
      results
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('[backfill-blog-images] Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
