import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

/**
 * BLOG DAILY PUBLISH - Automated daily blog post generation
 * 
 * Publishes 2-3 posts per day:
 * - Checks posts published today
 * - If < 3, generates more until limit reached
 * - Each post includes image generation & indexing
 */

const DAILY_POST_TARGET = 2; // Maximum posts per day (1-2 high quality posts)

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const githubToken = Deno.env.get('GH_PAT');
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('[blog-daily-publish] Starting daily publish check...');
    
    const today = new Date().toISOString().split('T')[0];
    
    // Check how many posts were published today
    const { count: publishedToday } = await supabase
      .from('blog_posts')
      .select('*', { count: 'exact', head: true })
      .gte('publish_at', `${today}T00:00:00`)
      .lt('publish_at', `${today}T23:59:59`)
      .eq('status', 'published');
    
    const alreadyPublished = publishedToday || 0;
    const remaining = DAILY_POST_TARGET - alreadyPublished;
    
    console.log(`[blog-daily-publish] Published today: ${alreadyPublished}, remaining: ${remaining}`);
    
    if (remaining <= 0) {
      // Log the skip
      await supabase.from('blog_runs').insert({
        result: 'skipped',
        skip_reason: 'already_published_today',
        notes: `Published today: ${alreadyPublished}`,
        quality_gate_report: { pacing: 'daily_limit_reached' }
      });
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Daily limit reached (${alreadyPublished}/${DAILY_POST_TARGET} posts)`,
          published: 0,
          total_today: alreadyPublished
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get planned posts for today or earlier (catch up on missed days)
    const { data: plannedPosts, error: planError } = await supabase
      .from('blog_plan')
      .select(`
        id,
        topic_id,
        pillar,
        planned_date,
        status,
        publish_attempts,
        blog_topics (
          id,
          title_base,
          slug,
          pillar,
          intent,
          primary_keyword,
          secondary_keywords,
          required_subtopics,
          unique_angle_options
        )
      `)
      .lte('planned_date', today)
      .eq('status', 'planned')
      .lt('publish_attempts', 3)
      .order('planned_date', { ascending: true })
      .limit(remaining);

    if (planError) {
      console.error('[blog-daily-publish] Error fetching planned posts:', planError);
      throw planError;
    }

    let postsToGenerate = plannedPosts || [];
    
    // If no planned posts, get pending topics
    if (postsToGenerate.length === 0) {
      console.log('[blog-daily-publish] No planned posts, checking pending topics...');
      
      const { data: pendingTopics } = await supabase
        .from('blog_topics')
        .select('*')
        .is('last_used_at', null)
        .order('priority_score', { ascending: false })
        .limit(remaining);

      if (!pendingTopics || pendingTopics.length === 0) {
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'No posts to publish',
            published: 0,
            total_today: alreadyPublished
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Generate posts from pending topics
      const results = [];
      for (const topic of pendingTopics.slice(0, remaining)) {
        const result = await generateAndPublishPost(supabase, null, topic.id, githubToken);
        results.push(result);
        
        // Small delay between posts
        await new Promise(r => setTimeout(r, 2000));
      }

      const successCount = results.filter(r => r.success).length;
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Published ${successCount} posts from pending topics`,
          published: successCount,
          total_today: alreadyPublished + successCount,
          results
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate posts from planned items
    const results = [];
    for (const plan of postsToGenerate) {
      console.log(`[blog-daily-publish] Processing plan ${plan.id}...`);
      
      // Increment attempt counter
      await supabase
        .from('blog_plan')
        .update({ 
          publish_attempts: (plan.publish_attempts || 0) + 1,
          last_attempt_at: new Date().toISOString()
        })
        .eq('id', plan.id);

      const result = await generateAndPublishPost(supabase, plan.id, plan.topic_id, githubToken);
      results.push({ plan_id: plan.id, ...result });
      
      if (result.success) {
        await supabase
          .from('blog_plan')
          .update({ status: 'published' })
          .eq('id', plan.id);
      } else if ((plan.publish_attempts || 0) >= 2) {
        await supabase
          .from('blog_plan')
          .update({ 
            status: 'failed',
            skip_reason: `Failed after ${plan.publish_attempts + 1} attempts`
          })
          .eq('id', plan.id);
      }
      
      // Small delay between posts
      await new Promise(r => setTimeout(r, 2000));
    }

    const successCount = results.filter(r => r.success).length;
    
    // Trigger GitHub rebuild once at the end
    if (successCount > 0 && githubToken) {
      await triggerGitHubBuild(githubToken);
    }

    // Ping sitemaps once
    if (successCount > 0) {
      await pingSitemaps();
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Published ${successCount}/${postsToGenerate.length} posts`,
        published: successCount,
        total_today: alreadyPublished + successCount,
        results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[blog-daily-publish] Error:', message);
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function generateAndPublishPost(
  supabase: ReturnType<typeof createClient>,
  planId: string | null,
  topicId: string | null,
  githubToken: string | null
): Promise<{ success: boolean; post?: unknown; error?: string }> {
  try {
    console.log(`[blog-daily-publish] Generating post for topic ${topicId}...`);
    
    // Call generate-blog-post
    const { data: generateResult, error: generateError } = await supabase.functions.invoke(
      'generate-blog-post',
      {
        body: {
          mode: 'auto',
          plan_id: planId,
          topic_id: topicId
        }
      }
    );

    if (generateError) {
      console.error('[blog-daily-publish] Generate error:', generateError);
      return { success: false, error: generateError.message };
    }

    console.log('[blog-daily-publish] Post generated:', generateResult?.post?.slug);

    // ========== AGGRESSIVE IMAGE GENERATION ==========
    // Strategy: Try everything possible before giving up
    if (generateResult?.post?.slug) {
      console.log('[blog-daily-publish] Starting AGGRESSIVE image generation for:', generateResult.post.slug);
      
      const postSlug = generateResult.post.slug;
      const postId = generateResult?.post?.id;
      let imageGenSuccess = false;
      
      // PHASE 1: Standard generation with 5 attempts
      console.log('[blog-daily-publish] PHASE 1: Standard generation (5 attempts)');
      for (let attempt = 1; attempt <= 5; attempt++) {
        try {
          console.log(`[blog-daily-publish] Standard attempt ${attempt}/5`);
          const { data: imgResult, error: imgError } = await supabase.functions.invoke('generate-blog-images', {
            body: { slug: postSlug, mode: 'single' }
          });
          
          if (!imgError && imgResult?.result?.hero_url?.startsWith('https://')) {
            console.log(`[blog-daily-publish] SUCCESS on standard attempt ${attempt}:`, imgResult.result.hero_url);
            imageGenSuccess = true;
            break;
          }
          
          console.log(`[blog-daily-publish] Standard attempt ${attempt} failed:`, imgError || 'No valid URL');
          
          // Progressive backoff: 5s, 10s, 15s, 20s
          if (attempt < 5) {
            await new Promise(r => setTimeout(r, 5000 * attempt));
          }
        } catch (err) {
          console.error(`[blog-daily-publish] Standard attempt ${attempt} exception:`, err);
          if (attempt < 5) {
            await new Promise(r => setTimeout(r, 5000 * attempt));
          }
        }
      }
      
      // PHASE 2: If Phase 1 failed, try with post_id instead of slug
      if (!imageGenSuccess && postId) {
        console.log('[blog-daily-publish] PHASE 2: Trying with post_id (3 attempts)');
        for (let attempt = 1; attempt <= 3; attempt++) {
          try {
            console.log(`[blog-daily-publish] post_id attempt ${attempt}/3`);
            const { data: imgResult, error: imgError } = await supabase.functions.invoke('generate-blog-images', {
              body: { post_id: postId, mode: 'single' }
            });
            
            if (!imgError && imgResult?.result?.hero_url?.startsWith('https://')) {
              console.log(`[blog-daily-publish] SUCCESS on post_id attempt ${attempt}:`, imgResult.result.hero_url);
              imageGenSuccess = true;
              break;
            }
            
            if (attempt < 3) {
              await new Promise(r => setTimeout(r, 8000));
            }
          } catch (err) {
            console.error(`[blog-daily-publish] post_id attempt ${attempt} exception:`, err);
            if (attempt < 3) {
              await new Promise(r => setTimeout(r, 8000));
            }
          }
        }
      }
      
      // PHASE 3: Direct call to Lovable AI with PERSONALIZED prompt based on post content
      if (!imageGenSuccess) {
        console.log('[blog-daily-publish] PHASE 3: Direct PERSONALIZED image generation (3 attempts)');
        const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        
        if (lovableApiKey) {
          // Get post details for personalized prompt
          const { data: postDetails } = await supabase
            .from('blog_posts')
            .select('title, pillar, excerpt, primary_keyword')
            .eq('slug', postSlug)
            .maybeSingle();
          
          const postTitle = postDetails?.title || generateResult.post.title || postSlug;
          const postPillar = postDetails?.pillar || 'tendencias';
          const postExcerpt = postDetails?.excerpt || '';
          const postKeyword = postDetails?.primary_keyword || '';
          
          // Pillar-specific visual contexts
          const pillarVisuals: Record<string, string> = {
            empleo: 'professional job interview setting, resume documents, career growth symbols, confident professional atmosphere',
            ia_aplicada: 'modern tech workspace, AI visualization on screen, smart devices, futuristic but human-centered environment',
            liderazgo: 'executive meeting room, strategic planning, team leadership moment, mentoring scene',
            servicios: 'client consultation, professional service delivery, business handshake, trust-building moment',
            emprender: 'startup workspace, entrepreneur brainstorming, business planning boards, growth charts',
            tendencias: 'market analysis dashboard, trend visualization, strategic business overview, innovation symbols'
          };
          
          const visualContext = pillarVisuals[postPillar] || pillarVisuals.tendencias;
          
          // Build personalized prompt based on post content
          const personalizedPrompt = `
Professional editorial photograph for a business article titled: "${postTitle}"

SCENE: ${visualContext}

TOPIC FOCUS: ${postKeyword || postExcerpt.slice(0, 100) || postTitle}

STYLE: Ultra photorealistic, professional editorial photography, cinematic natural lighting, shallow depth of field, 8K resolution, Hasselblad quality.

MOOD: Premium business editorial, authentic, professional warmth, Latin American business context (modern offices in Argentina, Mexico, Colombia style).

COMPOSITION: Hero banner format (16:9 aspect ratio). Clean composition suitable for blog header.

CRITICAL RULES:
- NO text, NO logos, NO watermarks, NO UI elements
- If people appear: show from behind, silhouettes, hands only, or tastefully blurred. Never show identifiable faces.
- Focus on the business/professional concept, not generic stock imagery

Ultra high resolution.
          `.trim();
          
          console.log('[blog-daily-publish] Using personalized prompt for:', postTitle);
          
          for (let attempt = 1; attempt <= 3; attempt++) {
            try {
              console.log(`[blog-daily-publish] Direct API attempt ${attempt}/3 with personalized prompt`);
              
              const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${lovableApiKey}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  model: 'google/gemini-2.5-flash-image',
                  messages: [{ role: 'user', content: personalizedPrompt }],
                  modalities: ['image', 'text'],
                }),
              });
              
              if (response.ok) {
                const result = await response.json();
                const imageUrl = result.choices?.[0]?.message?.images?.[0]?.image_url?.url;
                
                if (imageUrl) {
                  console.log('[blog-daily-publish] Got image from direct API, uploading...');
                  
                  // Upload to storage
                  let base64Data = imageUrl;
                  if (imageUrl.startsWith('https://')) {
                    const imgResp = await fetch(imageUrl);
                    const blob = await imgResp.arrayBuffer();
                    const base64 = btoa(String.fromCharCode(...new Uint8Array(blob)));
                    base64Data = `data:image/jpeg;base64,${base64}`;
                  }
                  
                  if (base64Data.startsWith('data:')) {
                    const matches = base64Data.match(/^data:([^;]+);base64,(.+)$/);
                    if (matches) {
                      const mimeType = matches[1];
                      const base64Content = matches[2];
                      const binaryString = atob(base64Content);
                      const bytes = new Uint8Array(binaryString.length);
                      for (let i = 0; i < binaryString.length; i++) {
                        bytes[i] = binaryString.charCodeAt(i);
                      }
                      
                      const fileName = `${postSlug}-hero-emergency-${Date.now()}.jpg`;
                      
                      const uploadResp = await fetch(`${supabaseUrl}/storage/v1/object/blog-images/${fileName}`, {
                        method: 'POST',
                        headers: {
                          'apikey': supabaseKey,
                          'Authorization': `Bearer ${supabaseKey}`,
                          'Content-Type': mimeType,
                          'x-upsert': 'true',
                        },
                        body: bytes,
                      });
                      
                      if (uploadResp.ok) {
                        const publicUrl = `${supabaseUrl}/storage/v1/object/public/blog-images/${fileName}`;
                        
                        // Update post with emergency image
                        await supabase
                          .from('blog_posts')
                          .update({ 
                            hero_image_url: publicUrl,
                            image_alt_text: `Imagen ilustrativa: ${generateResult.post.title || postSlug}`
                          })
                          .eq('slug', postSlug);
                        
                        console.log(`[blog-daily-publish] EMERGENCY IMAGE SUCCESS:`, publicUrl);
                        imageGenSuccess = true;
                        break;
                      }
                    }
                  }
                }
              }
              
              if (attempt < 3) {
                await new Promise(r => setTimeout(r, 10000));
              }
            } catch (err) {
              console.error(`[blog-daily-publish] Direct API attempt ${attempt} failed:`, err);
              if (attempt < 3) {
                await new Promise(r => setTimeout(r, 10000));
              }
            }
          }
        }
      }
      
      // Wait for DB sync
      await new Promise(r => setTimeout(r, 3000));

      // FINAL VERIFICATION - URL check + CONTENT validation (detect blank/white images)
      const { data: savedPost } = await supabase
        .from('blog_posts')
        .select('id, slug, hero_image_url, content_md, title')
        .eq('slug', postSlug)
        .maybeSingle();

      const heroUrl = savedPost?.hero_image_url || '';
      const hasValidHeroUrl = heroUrl.startsWith('https://') && heroUrl.includes('supabase.co');
      
      console.log(`[blog-daily-publish] Final hero_image_url check: "${heroUrl.substring(0, 100)}..."`);
      console.log(`[blog-daily-publish] Valid hero URL: ${hasValidHeroUrl}`);
      
      // NEW GATE: Validate image is NOT blank/white/corrupt
      let hasValidHeroImage = hasValidHeroUrl;
      if (hasValidHeroUrl) {
        const isValid = await validateImageNotBlank(heroUrl);
        if (!isValid) {
          console.error('[blog-daily-publish] IMAGE CONTENT GATE FAILED: Image is blank/white/corrupt!');
          hasValidHeroImage = false;
          
          // Delete the bad image from storage
          const fileName = heroUrl.split('/blog-images/').pop();
          if (fileName) {
            const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
            const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
            await fetch(`${supabaseUrl}/storage/v1/object/blog-images/${fileName}`, {
              method: 'DELETE',
              headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
              },
            }).catch(() => {});
          }
        }
      }
      
      if (!hasValidHeroImage) {
        console.error('[blog-daily-publish] QUALITY GATE FAILED after ALL attempts - reverting to draft');
        
        await supabase
          .from('blog_posts')
          .update({ 
            status: 'draft',
            hero_image_url: null,
            quality_gate_report: { 
              blocked: true, 
              reason: hasValidHeroUrl ? 'blank_white_hero_image_detected' : 'missing_hero_image_after_all_phases',
              phases_attempted: ['standard_5x', 'post_id_3x', 'direct_api_3x'],
              hero_value: heroUrl 
            }
          })
          .eq('slug', postSlug);
        
        await supabase.from('blog_runs').insert({
          result: 'failed',
          chosen_plan_id: planId,
          chosen_topic_id: topicId,
          notes: `Blocked: ${hasValidHeroUrl ? 'hero image is blank/white/corrupt' : 'missing hero image'} after 11 total attempts`,
          quality_gate_report: { blocked: true, reason: hasValidHeroUrl ? 'blank_image_content' : 'missing_hero_image_exhausted' }
        });
        
        return { success: false, error: hasValidHeroUrl ? 'Hero image is blank/white (content validation failed)' : 'Hero image missing after exhaustive retries' };
      }

      // ===== QUALITY AUDIT (BLOCK PUBLISH IF BROKEN) =====
      const qualityIssues = auditPostMarkdown(savedPost.content_md);
      
      // Validate all external links in content (broken links = inaceptable)
      const brokenLinks = await validateExternalLinks(savedPost.content_md);
      if (brokenLinks.length > 0) {
        qualityIssues.push(...brokenLinks.map(l => `broken_link:${l}`));
      }
      
      if (qualityIssues.length > 0) {
        console.error('[blog-daily-publish] Quality issues found:', qualityIssues);
        
        // Auto-repair: strip broken links from content, keep the anchor text
        let repairedContent = savedPost.content_md;
        let repaired = false;
        for (const issue of qualityIssues) {
          if (issue.startsWith('broken_link:')) {
            const brokenUrl = issue.replace('broken_link:', '');
            // Replace [text](broken_url) with just text
            const linkRegex = new RegExp(`\\[([^\\]]+)\\]\\(${brokenUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\)`, 'g');
            repairedContent = repairedContent.replace(linkRegex, '$1');
            repaired = true;
          }
        }
        
        // If we only had broken links and could repair them, fix and continue
        const nonLinkIssues = qualityIssues.filter(i => !i.startsWith('broken_link:'));
        if (nonLinkIssues.length === 0 && repaired) {
          console.log('[blog-daily-publish] Auto-repaired broken links, continuing publish');
          await supabase
            .from('blog_posts')
            .update({ content_md: repairedContent, quality_gate_report: { auto_repaired: true, repaired_links: brokenLinks } })
            .eq('slug', postSlug);
        } else {
          // Non-repairable issues: block publish
          await supabase
            .from('blog_posts')
            .update({ 
              status: 'draft', 
              content_md: repaired ? repairedContent : savedPost.content_md,
              quality_gate_report: { blocked: true, issues: qualityIssues } 
            })
            .eq('slug', postSlug);
          return { success: false, error: `Quality audit failed: ${qualityIssues.join(' | ')}` };
        }
      }
      
      console.log('[blog-daily-publish] QUALITY GATE PASSED: Post has valid hero image and content');

      // Submit to IndexNow
      await submitToIndexNow(supabase, [postSlug]);
    }

    // Log success
    await supabase.from('blog_runs').insert({
      result: 'success',
      chosen_plan_id: planId,
      chosen_topic_id: topicId,
      post_id: generateResult?.post?.id,
      notes: `Auto-published - IndexNow submitted`
    });

    // MANDATORY: Trigger deploy immediately for EVERY successfully published post
    // This ensures the blog is always up-to-date online
    if (githubToken) {
      console.log('[blog-daily-publish] Triggering IMMEDIATE deploy for post:', generateResult?.post?.slug);
      await triggerGitHubBuild(githubToken);
    } else {
      console.warn('[blog-daily-publish] WARNING: No GH_PAT - cannot auto-deploy! Post will not be visible online.');
    }

    return { success: true, post: generateResult?.post };

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[blog-daily-publish] Post generation failed:', message);
    return { success: false, error: message };
  }
}

/**
 * Validates that an image URL points to a real image (not blank/white/corrupt).
 * Fetches the image, checks file size and basic pixel sampling.
 * A blank/white PNG is typically very small (<5KB for a 1920x1080 image).
 */
async function validateImageNotBlank(imageUrl: string): Promise<boolean> {
  try {
    console.log('[blog-daily-publish] Validating image content:', imageUrl.substring(0, 80));
    
    const response = await fetch(imageUrl, { method: 'GET' });
    if (!response.ok) {
      console.error('[blog-daily-publish] Image fetch failed:', response.status);
      return false;
    }
    
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.startsWith('image/')) {
      console.error('[blog-daily-publish] Not an image:', contentType);
      return false;
    }
    
    const blob = await response.arrayBuffer();
    const sizeKB = blob.byteLength / 1024;
    
    console.log(`[blog-daily-publish] Image size: ${sizeKB.toFixed(1)}KB, type: ${contentType}`);
    
    // Gate 1: Too small = likely blank/corrupt (real photos are >10KB minimum)
    if (sizeKB < 8) {
      console.error(`[blog-daily-publish] Image too small (${sizeKB.toFixed(1)}KB) - likely blank/corrupt`);
      return false;
    }
    
    // Gate 2: For PNG images, check if the file is suspiciously small for its expected dimensions
    // A 1920x1080 blank white PNG compresses to ~5-15KB, while a real photo is 200KB+
    if (contentType.includes('png') && sizeKB < 30) {
      console.error(`[blog-daily-publish] PNG too small (${sizeKB.toFixed(1)}KB) - likely blank/white`);
      return false;
    }
    
    // Gate 3: Sample bytes for uniform color (all white = 0xFF bytes dominate)
    const bytes = new Uint8Array(blob);
    const sampleSize = Math.min(bytes.length, 10000);
    const startOffset = Math.min(200, bytes.length - sampleSize); // Skip headers
    let whiteByteCount = 0;
    let nearWhiteByteCount = 0;
    
    for (let i = startOffset; i < startOffset + sampleSize && i < bytes.length; i++) {
      if (bytes[i] === 0xFF) whiteByteCount++;
      if (bytes[i] >= 0xF8) nearWhiteByteCount++;
    }
    
    const whiteRatio = whiteByteCount / sampleSize;
    const nearWhiteRatio = nearWhiteByteCount / sampleSize;
    
    console.log(`[blog-daily-publish] Byte analysis: white=${(whiteRatio * 100).toFixed(1)}%, near-white=${(nearWhiteRatio * 100).toFixed(1)}%`);
    
    if (nearWhiteRatio > 0.85) {
      console.error(`[blog-daily-publish] Image appears blank/white (${(nearWhiteRatio * 100).toFixed(1)}% near-white bytes)`);
      return false;
    }
    
    console.log('[blog-daily-publish] Image content validation PASSED');
    return true;
    
  } catch (error) {
    console.error('[blog-daily-publish] Image validation error:', error);
    return false; // Fail closed - if we can't validate, reject
  }
}

async function triggerGitHubBuild(token: string) {
  try {
    const owner = 'vistaceoapp';
    const repo = 'vistaceo';
    
    console.log(`[blog-daily-publish] Triggering GitHub Actions for ${owner}/${repo}...`);
    
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/dispatches`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          'User-Agent': 'VistaCEO-Blog-Publisher'
        },
        body: JSON.stringify({
          event_type: 'blog-post-published',
          client_payload: {
            timestamp: new Date().toISOString(),
            source: 'blog-daily-publish'
          }
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[blog-daily-publish] GitHub dispatch failed:', response.status, errorText);
    } else {
      console.log('[blog-daily-publish] GitHub Actions triggered successfully');
    }
  } catch (error) {
    console.error('[blog-daily-publish] GitHub trigger error:', error);
  }
}

async function submitToIndexNow(supabase: ReturnType<typeof createClient>, slugs: string[]) {
  try {
    console.log('[blog-daily-publish] Submitting to IndexNow:', slugs);
    await supabase.functions.invoke('indexnow-submit', {
      body: { urls: slugs },
    });
  } catch (error) {
    console.error('[blog-daily-publish] IndexNow submit failed:', error);
  }
}

async function pingSitemaps() {
  const sitemapUrl = 'https://blog.vistaceo.com/sitemap.xml';
  const pingUrls = [
    `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`,
    `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`,
  ];
  
  try {
    await Promise.allSettled(pingUrls.map(url => fetch(url)));
    console.log('[blog-daily-publish] Sitemap ping sent to Google & Bing');
  } catch (e) {
    console.error('[blog-daily-publish] Sitemap ping failed:', e);
  }
}

function auditPostMarkdown(contentMd: string): string[] {
  const issues: string[] = [];
  const md = contentMd || '';

  // ===== 1) RAW HTML / CODE ARTIFACTS LEAKED INTO CONTENT =====
  // These are INACEPTABLE - raw HTML showing as visible text to the reader
  
  // Raw <img> tags with attributes visible as text
  if (/<img\s+[^>]*(?:src|class|loading|alt)\s*=\s*"/i.test(md)) {
    issues.push('raw_img_tag_in_content');
  }
  // Raw <a> tags visible
  if (/<a\s+[^>]*href\s*=\s*"/i.test(md)) {
    issues.push('raw_anchor_tag_in_content');
  }
  // Any raw HTML tags that shouldn't be in markdown (except allowed ones)
  if (/<(?:div|span|section|article|header|footer|nav|table|tr|td|th|iframe|script|style|link|meta)\s/i.test(md)) {
    issues.push('raw_html_tags_in_content');
  }
  // Raw HTML attributes leaked as visible text
  if (/(?:loading\s*=\s*"lazy"|decoding\s*=\s*"async"|class\s*=\s*"content-image")/i.test(md)) {
    issues.push('raw_html_attributes_leaked');
  }
  
  // ===== 2) ENCODED / TRUNCATED URLs =====
  if (/%3c\s*a/i.test(md) || md.includes('%3Ca%20href=')) {
    issues.push('encoded_html_in_markdown');
  }
  // Truncated supabase URLs showing as text
  if (/supabase\.co\/st\.\.\./i.test(md)) {
    issues.push('truncated_storage_url');
  }
  // Raw supabase URLs visible as text (not inside markdown image/link syntax)
  const rawSupabaseUrls = md.match(/(?<!\(|!)nlewrgmcawzcdazhfiyy\.supabase\.co\S+/g);
  if (rawSupabaseUrls && rawSupabaseUrls.length > 0) {
    issues.push('raw_supabase_url_as_text');
  }
  
  // ===== 3) BROKEN MARKDOWN SYNTAX =====
  // Unbalanced code fences
  const fenceCount = (md.match(/```/g) || []).length;
  if (fenceCount % 2 !== 0) {
    issues.push('unbalanced_code_fences');
  }
  // Broken image syntax (image alt showing but no image)
  if (/!\[([^\]]*)\]\(\s*\)/.test(md)) {
    issues.push('empty_image_url');
  }
  // Broken link syntax (link text but no URL)
  if (/\[([^\]]+)\]\(\s*\)/.test(md)) {
    issues.push('empty_link_url');
  }
  // Markdown image with raw attributes after URL
  if (/!\[[^\]]*\]\([^)]+\)\s*\{[^}]*\}/.test(md)) {
    issues.push('markdown_image_with_raw_attributes');
  }
  
  // ===== 4) AI GENERATION ARTIFACTS =====
  // Common AI artifacts that leak through
  if (/\*\*Nota del editor\*\*/i.test(md) || /\[insertar\s/i.test(md) || /\[PLACEHOLDER/i.test(md)) {
    issues.push('ai_placeholder_text');
  }
  if (/```(json|html|xml)\s*\n.*?\n```/s.test(md) && md.length < 3000) {
    // Code blocks in short articles are likely AI artifacts
    issues.push('suspicious_code_block_in_article');
  }

  // ===== 5) CONTENT QUALITY MINIMUMS =====
  // Article too short (less than 500 chars of actual content)
  const strippedContent = md.replace(/#{1,6}\s+.*\n/g, '').replace(/!\[.*?\]\(.*?\)/g, '').replace(/\[.*?\]\(.*?\)/g, '').trim();
  if (strippedContent.length < 500) {
    issues.push('article_too_short');
  }

  return issues;
}

/**
 * Validates all external links in the markdown content.
 * Returns array of broken URLs that return 404 or fail to load.
 * INACEPTABLE: No link should point to a dead page.
 */
async function validateExternalLinks(contentMd: string): Promise<string[]> {
  const brokenLinks: string[] = [];
  const md = contentMd || '';
  
  // Extract all markdown links [text](url)
  const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g;
  const links: string[] = [];
  let match;
  while ((match = linkRegex.exec(md)) !== null) {
    const url = match[2];
    // Skip our own blog links (they may not exist yet during generation)
    if (url.includes('blog.vistaceo.com') || url.includes('vistaceo.com')) continue;
    // Skip anchor-only links
    if (url.startsWith('#')) continue;
    links.push(url);
  }
  
  if (links.length === 0) return brokenLinks;
  
  // Deduplicate
  const uniqueLinks = [...new Set(links)];
  console.log(`[blog-daily-publish] Validating ${uniqueLinks.length} external links...`);
  
  // Check each link (with timeout and concurrency limit)
  const checkLink = async (url: string): Promise<boolean> => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      
      const response = await fetch(url, {
        method: 'HEAD',
        headers: { 'User-Agent': 'VistaCEO-Blog-QualityGate/1.0' },
        signal: controller.signal,
        redirect: 'follow',
      });
      clearTimeout(timeout);
      
      // If HEAD fails, try GET (some servers block HEAD)
      if (response.status === 405 || response.status === 403) {
        const getResp = await fetch(url, {
          method: 'GET',
          headers: { 'User-Agent': 'VistaCEO-Blog-QualityGate/1.0' },
          signal: AbortSignal.timeout(8000),
          redirect: 'follow',
        });
        return getResp.status < 400;
      }
      
      return response.status < 400;
    } catch {
      // Network error or timeout - could be temporary, don't block
      console.log(`[blog-daily-publish] Link check failed (network): ${url}`);
      return true; // Give benefit of the doubt for network issues
    }
  };
  
  // Check links in batches of 5
  for (let i = 0; i < uniqueLinks.length; i += 5) {
    const batch = uniqueLinks.slice(i, i + 5);
    const results = await Promise.all(batch.map(async (url) => {
      const ok = await checkLink(url);
      if (!ok) {
        console.error(`[blog-daily-publish] BROKEN LINK DETECTED: ${url}`);
        return url;
      }
      return null;
    }));
    brokenLinks.push(...results.filter(Boolean) as string[]);
  }
  
  if (brokenLinks.length > 0) {
    console.error(`[blog-daily-publish] Found ${brokenLinks.length} broken links:`, brokenLinks);
  } else {
    console.log('[blog-daily-publish] All external links validated OK');
  }
  
  return brokenLinks;
}
