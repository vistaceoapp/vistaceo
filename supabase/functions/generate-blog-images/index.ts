import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Pillar-specific image contexts
const PILLAR_CONTEXTS: Record<string, { scene: string; mood: string }> = {
  empleo: {
    scene: 'professional office setting, career development, job interview preparation, resume on desk',
    mood: 'ambitious, hopeful, professional growth'
  },
  ia_aplicada: {
    scene: 'modern tech workspace, laptop with data visualization, subtle AI elements, smart devices',
    mood: 'innovative, cutting-edge, human-tech harmony'
  },
  liderazgo: {
    scene: 'team meeting, strategic planning, leadership moment, mentoring session',
    mood: 'confident, inspiring, decisive'
  },
  servicios: {
    scene: 'client consultation, professional service delivery, business discussion',
    mood: 'trustworthy, expert, solution-focused'
  },
  emprender: {
    scene: 'startup environment, entrepreneur at work, business planning, growth metrics',
    mood: 'energetic, determined, visionary'
  },
  tendencias: {
    scene: 'market analysis, trend charts, business forecasting, strategic overview',
    mood: 'forward-thinking, analytical, opportunity-focused'
  }
};

// NEGATIVE PROMPT - absolutely forbidden elements
const NEGATIVE_PROMPT = "text, watermark, logo, letters, numbers, subtitles, captions, UI, screenshot, low quality, blurry, overexposed, deformed hands, extra fingers, uncanny face, cartoon, illustration, 3d render, CGI, stock photo watermark, shutterstock, adobe stock, istock, getty images";

interface ImageGenerationResult {
  hero_url: string | null;
  hero_alt: string;
  inline_url: string | null;
  inline_alt: string;
  status: 'success' | 'partial' | 'fallback_used' | 'failed';
  attempts: number;
  errors: string[];
}

/**
 * Checks if a base64 image is blank/white/corrupt by analyzing byte content.
 * Returns true if the image appears to be blank.
 */
function isImageBlank(base64Data: string): boolean {
  try {
    const matches = base64Data.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches) return true; // Can't parse = reject
    
    const base64Content = matches[2];
    const binaryString = atob(base64Content);
    const sizeKB = binaryString.length / 1024;
    
    // Too small for a real photo
    if (sizeKB < 8) {
      console.log(`[generate-blog-images] Image too small: ${sizeKB.toFixed(1)}KB`);
      return true;
    }
    
    // PNG that's suspiciously small
    if (matches[1].includes('png') && sizeKB < 30) {
      console.log(`[generate-blog-images] PNG too small: ${sizeKB.toFixed(1)}KB`);
      return true;
    }
    
    // Sample bytes for uniform white color
    const sampleSize = Math.min(binaryString.length, 10000);
    const startOffset = Math.min(200, binaryString.length - sampleSize);
    let nearWhiteCount = 0;
    
    for (let i = startOffset; i < startOffset + sampleSize && i < binaryString.length; i++) {
      if (binaryString.charCodeAt(i) >= 0xF8) nearWhiteCount++;
    }
    
    const nearWhiteRatio = nearWhiteCount / sampleSize;
    if (nearWhiteRatio > 0.85) {
      console.log(`[generate-blog-images] Image is ${(nearWhiteRatio * 100).toFixed(1)}% near-white - BLANK`);
      return true;
    }
    
    return false;
  } catch {
    return true; // Fail closed
  }
}

// Generate a single premium image
async function generatePremiumImage(
  prompt: string,
  aspectRatio: '21:9' | '16:9' | '4:3' | '3:2',
  lovableApiKey: string,
  maxAttempts: number = 3
): Promise<{ base64: string | null; error?: string }> {
  
  // Dimension mapping based on aspect ratio
  const dimensions: Record<string, { width: number; height: number }> = {
    '21:9': { width: 1920, height: 822 },
    '16:9': { width: 1920, height: 1080 },
    '4:3': { width: 1440, height: 1080 },
    '3:2': { width: 1620, height: 1080 }
  };
  
  const { width, height } = dimensions[aspectRatio] || dimensions['16:9'];
  
  // Build ultra-realistic prompt
  const fullPrompt = `
${prompt}

STYLE: Ultra photorealistic, professional editorial photography, cinematic natural lighting, shallow depth of field, 8K resolution, Hasselblad quality.

MOOD: Premium business editorial, authentic, human warmth, LATAM professional context.

SETTING: Modern office or workspace, clean and minimal, subtle blue/violet accent tones, natural daylight through windows.

AVOID TEXT OR LOGOS: No visible text, no logos, no watermarks, no UI elements, no screenshots.

PEOPLE: If people appear, show them from behind, silhouettes, hands only, or tastefully blurred. Never show identifiable faces directly.

Aspect ratio: ${aspectRatio}. Ultra high resolution.
`.trim();

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`[generate-blog-images] Attempt ${attempt}/${maxAttempts} for image generation`);
      
      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${lovableApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash-image',
          messages: [{ role: 'user', content: fullPrompt }],
          modalities: ['image', 'text'],
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          console.log('[generate-blog-images] Rate limited, waiting before retry...');
          await new Promise(resolve => setTimeout(resolve, 5000 * attempt));
          continue;
        }
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();
      const imageUrl = result.choices?.[0]?.message?.images?.[0]?.image_url?.url;
      
      if (!imageUrl) {
        console.log('[generate-blog-images] No image in response');
        continue;
      }

      // Validate image is not blank/white before accepting
      let base64Data: string;
      if (imageUrl.startsWith('data:image')) {
        base64Data = imageUrl;
      } else if (imageUrl.startsWith('https://')) {
        const imgResponse = await fetch(imageUrl);
        const blob = await imgResponse.arrayBuffer();
        const base64 = btoa(String.fromCharCode(...new Uint8Array(blob)));
        const mimeType = imgResponse.headers.get('content-type') || 'image/jpeg';
        base64Data = `data:${mimeType};base64,${base64}`;
      } else {
        continue;
      }
      
      // CHECK: Is the image blank/white?
      if (isImageBlank(base64Data)) {
        console.log(`[generate-blog-images] Attempt ${attempt}: Image is BLANK/WHITE - rejecting`);
        continue; // Try again
      }
      
      return { base64: base64Data };
      
    } catch (error) {
      console.error(`[generate-blog-images] Attempt ${attempt} error:`, error);
      if (attempt === maxAttempts) {
        return { base64: null, error: String(error) };
      }
      await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
    }
  }
  
  return { base64: null, error: 'Max attempts reached' };
}

// Upload base64 image to Supabase Storage using Supabase client with service role
async function uploadToStorage(
  base64Data: string,
  slug: string,
  imageType: 'hero' | 'inline',
  supabaseUrl: string,
  supabaseServiceKey: string
): Promise<string | null> {
  try {
    const matches = base64Data.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches) {
      console.log('[generate-blog-images] Invalid base64 format');
      return null;
    }
    
    const mimeType = matches[1];
    const base64Content = matches[2];
    const extension = mimeType.includes('png') ? 'png' : 'jpg';
    const fileName = `${slug}-${imageType}-${Date.now()}.${extension}`;
    
    // Decode base64 to binary
    const binaryString = atob(base64Content);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // Use Supabase Storage REST API with proper headers
    const uploadUrl = `${supabaseUrl}/storage/v1/object/blog-images/${fileName}`;
    
    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': mimeType,
        'x-upsert': 'true',
      },
      body: bytes,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[generate-blog-images] Storage upload failed:', response.status, errorText);
      
      // If 403, try alternative upload method via Supabase client
      if (response.status === 403 || response.status === 400) {
        console.log('[generate-blog-images] Trying alternative upload with Supabase client...');
        const supabase = createClient(supabaseUrl, supabaseServiceKey, {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          }
        });
        
        const { data, error } = await supabase.storage
          .from('blog-images')
          .upload(fileName, bytes, {
            contentType: mimeType,
            upsert: true,
          });
        
        if (error) {
          console.error('[generate-blog-images] Supabase client upload also failed:', error);
          return null;
        }
        
        const { data: publicUrlData } = supabase.storage
          .from('blog-images')
          .getPublicUrl(fileName);
        
        console.log(`[generate-blog-images] ${imageType} uploaded via client:`, publicUrlData.publicUrl);
        return publicUrlData.publicUrl;
      }
      
      return null;
    }
    
    // Return public URL
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/blog-images/${fileName}`;
    console.log(`[generate-blog-images] ${imageType} uploaded:`, publicUrl);
    return publicUrl;
    
  } catch (error) {
    console.error('[generate-blog-images] Storage error:', error);
    return null;
  }
}

// Main image generation function
async function generateImagesForPost(
  post: { slug: string; title: string; pillar: string; excerpt?: string },
  lovableApiKey: string,
  supabaseUrl: string,
  supabaseKey: string
): Promise<ImageGenerationResult> {
  
  const result: ImageGenerationResult = {
    hero_url: null,
    hero_alt: `Imagen ilustrativa: ${post.title}`,
    inline_url: null,
    inline_alt: `${post.title} - concepto visual`,
    status: 'failed',
    attempts: 0,
    errors: []
  };
  
  const pillarContext = PILLAR_CONTEXTS[post.pillar] || PILLAR_CONTEXTS.tendencias;
  
  // Generate HERO image (21:9 for header)
  console.log(`[generate-blog-images] Generating HERO for: ${post.slug}`);
  
  const heroPrompt = `
Professional editorial photograph for a business blog article titled "${post.title}".
Context: ${pillarContext.scene}
Mood: ${pillarContext.mood}
Main subject: ${post.excerpt?.slice(0, 100) || post.title}
Latin American business context (Argentina, Mexico, Colombia style offices).
No text, no logos, no watermarks.
`;

  const heroResult = await generatePremiumImage(heroPrompt, '16:9', lovableApiKey);
  result.attempts++;
  
  if (heroResult.base64) {
    const heroUrl = await uploadToStorage(heroResult.base64, post.slug, 'hero', supabaseUrl, supabaseKey);
    if (heroUrl) {
      result.hero_url = heroUrl;
    } else {
      result.errors.push('Hero upload failed');
    }
  } else {
    result.errors.push(heroResult.error || 'Hero generation failed');
  }
  
  // Generate INLINE image (3:2 for content)
  console.log(`[generate-blog-images] Generating INLINE for: ${post.slug}`);
  
  const inlinePrompt = `
Detailed photograph showing a practical concept related to "${post.title}".
Scene: ${pillarContext.scene}, focus on hands, documents, screen (without readable text), or workspace details.
Mood: ${pillarContext.mood}, human and authentic.
Close-up or medium shot. Shallow depth of field.
No text, no logos, no watermarks, no faces.
`;

  const inlineResult = await generatePremiumImage(inlinePrompt, '3:2', lovableApiKey);
  result.attempts++;
  
  if (inlineResult.base64) {
    const inlineUrl = await uploadToStorage(inlineResult.base64, post.slug, 'inline', supabaseUrl, supabaseKey);
    if (inlineUrl) {
      result.inline_url = inlineUrl;
    } else {
      result.errors.push('Inline upload failed');
    }
  } else {
    result.errors.push(inlineResult.error || 'Inline generation failed');
  }
  
  // Determine status
  if (result.hero_url && result.inline_url) {
    result.status = 'success';
  } else if (result.hero_url || result.inline_url) {
    result.status = 'partial';
  } else {
    // Try fallback prompt (simpler)
    console.log(`[generate-blog-images] Trying fallback for: ${post.slug}`);
    
    const fallbackPrompt = `
Clean, minimal professional photograph.
Modern office desk with laptop, coffee cup, notebook.
Warm natural lighting, shallow depth of field.
No people, no text, no logos.
Ultra high resolution, editorial quality.
`;
    
    const fallbackResult = await generatePremiumImage(fallbackPrompt, '16:9', lovableApiKey);
    result.attempts++;
    
    if (fallbackResult.base64) {
      const fallbackUrl = await uploadToStorage(fallbackResult.base64, post.slug, 'hero', supabaseUrl, supabaseKey);
      if (fallbackUrl) {
        result.hero_url = fallbackUrl;
        result.status = 'fallback_used';
      }
    }
  }
  
  return result;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { post_id, slug, mode = 'single' } = await req.json();
    
    // MODE: single - generate for a specific post
    if (mode === 'single' && (post_id || slug)) {
      let post;
      
      if (post_id) {
        const { data, error } = await supabase
          .from('blog_posts')
          .select('id, slug, title, pillar, excerpt, hero_image_url')
          .eq('id', post_id)
          .single();
        if (error) throw error;
        post = data;
      } else {
        const { data, error } = await supabase
          .from('blog_posts')
          .select('id, slug, title, pillar, excerpt, hero_image_url')
          .eq('slug', slug)
          .single();
        if (error) throw error;
        post = data;
      }
      
      if (!post) {
        throw new Error('Post not found');
      }
      
      console.log(`[generate-blog-images] Processing single post: ${post.slug}`);
      
      const result = await generateImagesForPost(post, lovableApiKey, supabaseUrl, supabaseKey);
      
      // Update post with new images
      const updates: Record<string, any> = {};
      if (result.hero_url) {
        updates.hero_image_url = result.hero_url;
        updates.image_alt_text = result.hero_alt;
      }
      
      // Insert inline image into content if generated
      if (result.inline_url) {
        const { data: currentPost } = await supabase
          .from('blog_posts')
          .select('content_md')
          .eq('id', post.id)
          .single();
        
        if (currentPost?.content_md) {
          // Find position after "En 2 minutos" or first H2
          let content = currentPost.content_md;
          const insertPoints = [
            /^## En 2 minutos.*?\n\n/m,
            /^## .*?\n\n/m
          ];
          
          let inserted = false;
          for (const pattern of insertPoints) {
            const match = content.match(pattern);
            if (match && match.index !== undefined) {
              const insertPos = match.index + match[0].length;
              const imageMarkdown = `\n![${result.inline_alt}](${result.inline_url})\n\n`;
              content = content.slice(0, insertPos) + imageMarkdown + content.slice(insertPos);
              inserted = true;
              break;
            }
          }
          
          if (inserted) {
            updates.content_md = content;
          }
        }
      }
      
      if (Object.keys(updates).length > 0) {
        const { error: updateError } = await supabase
          .from('blog_posts')
          .update(updates)
          .eq('id', post.id);
        
        if (updateError) {
          console.error('[generate-blog-images] Update error:', updateError);
        }
      }
      
      return new Response(JSON.stringify({
        success: true,
        post_id: post.id,
        slug: post.slug,
        result
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    
    // MODE: backfill - process all posts missing images
    if (mode === 'backfill') {
      const { limit = 10 } = await req.json().catch(() => ({}));
      
      // Get posts missing hero image
      const { data: posts, error } = await supabase
        .from('blog_posts')
        .select('id, slug, title, pillar, excerpt, hero_image_url')
        .eq('status', 'published')
        .or('hero_image_url.is.null,hero_image_url.like.data:%')
        .order('publish_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      
      console.log(`[generate-blog-images] Backfill: ${posts?.length || 0} posts to process`);
      
      const results: Array<{ slug: string; status: string; hero_url?: string }> = [];
      
      for (const post of posts || []) {
        console.log(`[generate-blog-images] Backfill: ${post.slug}`);
        
        try {
          const result = await generateImagesForPost(post, lovableApiKey, supabaseUrl, supabaseKey);
          
          if (result.hero_url) {
            const { error: updateError } = await supabase
              .from('blog_posts')
              .update({
                hero_image_url: result.hero_url,
                image_alt_text: result.hero_alt
              })
              .eq('id', post.id);
            
            if (updateError) {
              console.error(`[generate-blog-images] Update error for ${post.slug}:`, updateError);
              results.push({ slug: post.slug, status: 'update_error' });
            } else {
              results.push({ slug: post.slug, status: result.status, hero_url: result.hero_url });
            }
          } else {
            results.push({ slug: post.slug, status: 'failed' });
          }
          
          // Rate limit between posts
          await new Promise(resolve => setTimeout(resolve, 3000));
          
        } catch (err) {
          console.error(`[generate-blog-images] Error for ${post.slug}:`, err);
          results.push({ slug: post.slug, status: 'error' });
        }
      }
      
      return new Response(JSON.stringify({
        success: true,
        mode: 'backfill',
        processed: results.length,
        results
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    
    throw new Error('Invalid mode or missing parameters');
    
  } catch (error) {
    console.error('[generate-blog-images] Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
