import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";
import { decode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('[fix-blog-images] Starting image migration...');

    // Get all posts with base64 images
    const { data: posts, error } = await supabase
      .from('blog_posts')
      .select('id, slug, hero_image_url, meta_title')
      .eq('status', 'published');

    if (error) throw error;

    let fixedCount = 0;
    let errorCount = 0;
    const results: Array<{ slug: string; status: string; newUrl?: string }> = [];

    for (const post of posts || []) {
      try {
        const updates: { hero_image_url?: string; meta_title?: string } = {};

        // Fix base64 images
        if (post.hero_image_url?.startsWith('data:')) {
          console.log(`[fix-blog-images] Converting base64 for: ${post.slug}`);

          // Extract mime type and base64 data
          const matches = post.hero_image_url.match(/^data:([^;]+);base64,(.+)$/);
          if (matches) {
            const mimeType = matches[1];
            const base64Data = matches[2];
            
            // Determine extension
            const extMap: Record<string, string> = {
              'image/png': 'png',
              'image/jpeg': 'jpg',
              'image/jpg': 'jpg',
              'image/webp': 'webp',
              'image/gif': 'gif',
            };
            const ext = extMap[mimeType] || 'png';
            const fileName = `${post.slug}.${ext}`;

            // Decode and upload
            const binaryData = decode(base64Data);
            
            const { error: uploadError } = await supabase.storage
              .from('blog-images')
              .upload(fileName, binaryData, {
                contentType: mimeType,
                upsert: true,
              });

            if (uploadError) {
              console.error(`[fix-blog-images] Upload error for ${post.slug}:`, uploadError);
              errorCount++;
              results.push({ slug: post.slug, status: 'upload_error' });
              continue;
            }

            // Get public URL
            const { data: publicUrlData } = supabase.storage
              .from('blog-images')
              .getPublicUrl(fileName);

            updates.hero_image_url = publicUrlData.publicUrl;
            console.log(`[fix-blog-images] Uploaded: ${fileName} -> ${updates.hero_image_url}`);
          }
        }

        // Fix meta_title with trailing pipe
        if (post.meta_title && post.meta_title.trim().endsWith('|')) {
          updates.meta_title = post.meta_title.trim().replace(/\s*\|\s*$/, '');
          console.log(`[fix-blog-images] Fixed meta_title for ${post.slug}`);
        }

        // Apply updates
        if (Object.keys(updates).length > 0) {
          const { error: updateError } = await supabase
            .from('blog_posts')
            .update(updates)
            .eq('id', post.id);

          if (updateError) {
            console.error(`[fix-blog-images] Update error for ${post.slug}:`, updateError);
            errorCount++;
            results.push({ slug: post.slug, status: 'update_error' });
          } else {
            fixedCount++;
            results.push({ 
              slug: post.slug, 
              status: 'fixed',
              newUrl: updates.hero_image_url,
            });
          }
        } else {
          results.push({ slug: post.slug, status: 'already_ok' });
        }

      } catch (err) {
        console.error(`[fix-blog-images] Error processing ${post.slug}:`, err);
        errorCount++;
        results.push({ slug: post.slug, status: 'error' });
      }
    }

    console.log(`[fix-blog-images] Done: ${fixedCount} fixed, ${errorCount} errors`);

    // After fixing images, regenerate OG pages
    if (fixedCount > 0) {
      console.log('[fix-blog-images] Regenerating OG pages...');
      
      const ogResponse = await fetch(`${supabaseUrl}/functions/v1/generate-blog-og`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ regenerate_all: true }),
      });
      
      const ogResult = await ogResponse.json();
      console.log('[fix-blog-images] OG regeneration result:', ogResult);
    }

    return new Response(JSON.stringify({
      success: true,
      fixedCount,
      errorCount,
      results,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('[fix-blog-images] Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
