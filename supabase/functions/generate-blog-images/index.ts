import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

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

function isImageBlank(base64Data: string): boolean {
  try {
    const matches = base64Data.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches) return true;
    
    const base64Content = matches[2];
    const binaryString = atob(base64Content);
    const sizeKB = binaryString.length / 1024;
    
    if (sizeKB < 8) return true;
    if (matches[1].includes('png') && sizeKB < 30) return true;
    
    const sampleSize = Math.min(binaryString.length, 10000);
    const startOffset = Math.min(200, binaryString.length - sampleSize);
    let nearWhiteCount = 0;
    
    for (let i = startOffset; i < startOffset + sampleSize && i < binaryString.length; i++) {
      if (binaryString.charCodeAt(i) >= 0xF8) nearWhiteCount++;
    }
    
    const nearWhiteRatio = nearWhiteCount / sampleSize;
    if (nearWhiteRatio > 0.85) return true;
    
    return false;
  } catch {
    return true;
  }
}

async function generatePremiumImage(
  prompt: string,
  lovableApiKey: string,
  maxAttempts: number = 2
): Promise<{ base64: string | null; error?: string }> {
  
  const fullPrompt = `
${prompt}

STYLE: Ultra photorealistic, professional editorial photography, cinematic natural lighting, shallow depth of field, 8K resolution, Hasselblad quality.
MOOD: Premium business editorial, authentic, human warmth, LATAM professional context.
SETTING: Modern office or workspace, clean and minimal, subtle blue/violet accent tones, natural daylight through windows.
AVOID TEXT OR LOGOS: No visible text, no logos, no watermarks, no UI elements, no screenshots.
PEOPLE: If people appear, show them from behind, silhouettes, hands only, or tastefully blurred. Never show identifiable faces directly.
Aspect ratio: 16:9. Ultra high resolution.
`.trim();

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`[generate-blog-images] Attempt ${attempt}/${maxAttempts}`);
      
      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${lovableApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-3-pro-image-preview',
          messages: [{ role: 'user', content: fullPrompt }],
          modalities: ['image', 'text'],
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error(`[generate-blog-images] API error ${response.status}:`, errText);
        if (response.status === 429 && attempt < maxAttempts) {
          await new Promise(r => setTimeout(r, 3000));
          continue;
        }
        throw new Error(`API error: ${response.status} - ${errText.slice(0, 200)}`);
      }

      const result = await response.json();
      const imageUrl = result.choices?.[0]?.message?.images?.[0]?.image_url?.url;
      
      if (!imageUrl) {
        console.log('[generate-blog-images] No image in response, content:', JSON.stringify(result.choices?.[0]?.message).slice(0, 300));
        if (attempt < maxAttempts) {
          await new Promise(r => setTimeout(r, 2000));
          continue;
        }
        return { base64: null, error: 'No image returned by model' };
      }

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
      
      if (isImageBlank(base64Data)) {
        console.log(`[generate-blog-images] Attempt ${attempt}: Image is BLANK - rejecting`);
        if (attempt < maxAttempts) {
          await new Promise(r => setTimeout(r, 2000));
          continue;
        }
        return { base64: null, error: 'Generated image is blank/white' };
      }
      
      return { base64: base64Data };
      
    } catch (error) {
      console.error(`[generate-blog-images] Attempt ${attempt} error:`, error);
      if (attempt === maxAttempts) {
        return { base64: null, error: String(error) };
      }
      await new Promise(r => setTimeout(r, 2000));
    }
  }
  
  return { base64: null, error: 'Max attempts reached' };
}

async function uploadToStorage(
  base64Data: string,
  slug: string,
  imageType: 'hero' | 'inline',
  supabaseUrl: string,
  supabaseServiceKey: string
): Promise<string | null> {
  try {
    const matches = base64Data.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches) return null;
    
    const mimeType = matches[1];
    const base64Content = matches[2];
    const extension = mimeType.includes('png') ? 'png' : 'jpg';
    const fileName = `${slug}-${imageType}-${Date.now()}.${extension}`;
    
    const binaryString = atob(base64Content);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
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
      console.error('[generate-blog-images] Upload failed:', response.status);
      // Try via Supabase client
      const supabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: { autoRefreshToken: false, persistSession: false }
      });
      const { error } = await supabase.storage.from('blog-images').upload(fileName, bytes, {
        contentType: mimeType, upsert: true,
      });
      if (error) {
        console.error('[generate-blog-images] Client upload also failed:', error);
        return null;
      }
      const { data: pubUrl } = supabase.storage.from('blog-images').getPublicUrl(fileName);
      return pubUrl.publicUrl;
    }
    
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/blog-images/${fileName}`;
    console.log(`[generate-blog-images] ${imageType} uploaded:`, publicUrl);
    return publicUrl;
    
  } catch (error) {
    console.error('[generate-blog-images] Storage error:', error);
    return null;
  }
}

Deno.serve(async (req) => {
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
    
    if (mode === 'single' && (post_id || slug)) {
      let post;
      
      if (post_id) {
        const { data, error } = await supabase.from('blog_posts')
          .select('id, slug, title, pillar, excerpt, hero_image_url').eq('id', post_id).single();
        if (error) throw error;
        post = data;
      } else {
        const { data, error } = await supabase.from('blog_posts')
          .select('id, slug, title, pillar, excerpt, hero_image_url').eq('slug', slug).single();
        if (error) throw error;
        post = data;
      }
      
      if (!post) throw new Error('Post not found');
      
      console.log(`[generate-blog-images] Processing: ${post.slug}`);
      
      const pillarContext = PILLAR_CONTEXTS[post.pillar] || PILLAR_CONTEXTS.tendencias;
      
      const heroPrompt = `Professional editorial photograph for a business blog article titled "${post.title}".
Context: ${pillarContext.scene}
Mood: ${pillarContext.mood}
Main subject: ${post.excerpt?.slice(0, 100) || post.title}
Latin American business context. No text, no logos, no watermarks.`;

      const heroResult = await generatePremiumImage(heroPrompt, lovableApiKey);
      
      let hero_url: string | null = null;
      if (heroResult.base64) {
        hero_url = await uploadToStorage(heroResult.base64, post.slug, 'hero', supabaseUrl, supabaseKey);
      }
      
      if (hero_url) {
        await supabase.from('blog_posts').update({
          hero_image_url: hero_url,
          image_alt_text: `Imagen ilustrativa: ${post.title}`
        }).eq('id', post.id);
      }
      
      return new Response(JSON.stringify({
        success: !!hero_url,
        post_id: post.id,
        slug: post.slug,
        result: { hero_url, status: hero_url ? 'success' : 'failed', errors: heroResult.error ? [heroResult.error] : [] }
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    
    // MODE: backfill
    if (mode === 'backfill') {
      const { data: posts } = await supabase.from('blog_posts')
        .select('id, slug, title, pillar, excerpt')
        .eq('status', 'published')
        .is('hero_image_url', null)
        .order('publish_at', { ascending: false })
        .limit(3);
      
      if (!posts || posts.length === 0) {
        return new Response(JSON.stringify({ success: true, message: 'No posts need images', processed: 0 }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      
      const results = [];
      for (const post of posts) {
        const pillarContext = PILLAR_CONTEXTS[post.pillar] || PILLAR_CONTEXTS.tendencias;
        const heroPrompt = `Professional editorial photograph for "${post.title}". Context: ${pillarContext.scene}. No text, no logos.`;
        const heroResult = await generatePremiumImage(heroPrompt, lovableApiKey, 1);
        
        let hero_url: string | null = null;
        if (heroResult.base64) {
          hero_url = await uploadToStorage(heroResult.base64, post.slug, 'hero', supabaseUrl, supabaseKey);
          if (hero_url) {
            await supabase.from('blog_posts').update({
              hero_image_url: hero_url,
              image_alt_text: `Imagen ilustrativa: ${post.title}`
            }).eq('id', post.id);
          }
        }
        results.push({ slug: post.slug, hero_url, error: heroResult.error });
      }
      
      return new Response(JSON.stringify({ success: true, processed: results.length, results }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    
    throw new Error('Invalid mode or missing parameters');
    
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[generate-blog-images] Error:', message);
    return new Response(JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
