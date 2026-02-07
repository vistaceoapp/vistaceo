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

const DAILY_POST_TARGET = 3; // Maximum posts per day

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
      
      // PHASE 3: Direct call to Lovable AI with ultra-simple prompt
      if (!imageGenSuccess) {
        console.log('[blog-daily-publish] PHASE 3: Direct ultra-simple image generation (3 attempts)');
        const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        
        if (lovableApiKey) {
          const ultraSimplePrompt = `
Professional business blog photograph. 
Modern minimalist office desk with laptop, coffee cup, and notebook.
Soft natural window lighting, shallow depth of field.
No people, no text, no logos, no watermarks.
Ultra high resolution, editorial quality.
Aspect ratio: 16:9
          `.trim();
          
          for (let attempt = 1; attempt <= 3; attempt++) {
            try {
              console.log(`[blog-daily-publish] Direct API attempt ${attempt}/3`);
              
              const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${lovableApiKey}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  model: 'google/gemini-2.5-flash-image',
                  messages: [{ role: 'user', content: ultraSimplePrompt }],
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

      // FINAL VERIFICATION
      const { data: savedPost } = await supabase
        .from('blog_posts')
        .select('id, slug, hero_image_url, content_md, title')
        .eq('slug', postSlug)
        .maybeSingle();

      const heroUrl = savedPost?.hero_image_url || '';
      const hasValidHeroImage = heroUrl.startsWith('https://') && heroUrl.includes('supabase.co');
      
      console.log(`[blog-daily-publish] Final hero_image_url check: "${heroUrl.substring(0, 100)}..."`);
      console.log(`[blog-daily-publish] Valid hero image: ${hasValidHeroImage}`);
      
      if (!hasValidHeroImage) {
        console.error('[blog-daily-publish] QUALITY GATE FAILED after ALL attempts - reverting to draft');
        
        await supabase
          .from('blog_posts')
          .update({ 
            status: 'draft',
            quality_gate_report: { 
              blocked: true, 
              reason: 'missing_hero_image_after_all_phases',
              phases_attempted: ['standard_5x', 'post_id_3x', 'direct_api_3x'],
              hero_value: heroUrl 
            }
          })
          .eq('slug', postSlug);
        
        await supabase.from('blog_runs').insert({
          result: 'failed',
          chosen_plan_id: planId,
          chosen_topic_id: topicId,
          notes: `Blocked: missing hero image after 11 total attempts (5 standard + 3 post_id + 3 direct)`,
          quality_gate_report: { blocked: true, reason: 'missing_hero_image_exhausted' }
        });
        
        return { success: false, error: 'Hero image missing after exhaustive retries' };
      }

      // ===== QUALITY AUDIT (BLOCK PUBLISH IF BROKEN) =====
      const qualityIssues = auditPostMarkdown(savedPost.content_md);
      if (qualityIssues.length > 0) {
        console.error('[blog-daily-publish] Quality issues found:', qualityIssues);
        await supabase
          .from('blog_posts')
          .update({ status: 'draft', quality_gate_report: { blocked: true, issues: qualityIssues } })
          .eq('slug', postSlug);
        return { success: false, error: `Quality audit failed: ${qualityIssues.join(' | ')}` };
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

    return { success: true, post: generateResult?.post };

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[blog-daily-publish] Post generation failed:', message);
    return { success: false, error: message };
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

  // 1) Encoded/inline HTML pollution that breaks images into visible garbage
  if (/%3c\s*a/i.test(md) || md.includes('%3Ca%20href=')) {
    issues.push('encoded_html_in_markdown');
  }
  if (/nlewrgmcawzcdazhfiyy\.supabase\.co\/st\.\.\./i.test(md)) {
    issues.push('truncated_storage_url');
  }
  if (/loading\s*=\s*"lazy"\s+class\s*=\s*"content-image"/i.test(md)) {
    issues.push('raw_img_attributes_leaked');
  }
  if (/<img\s+[^>]*class\s*=\s*"content-image"/i.test(md)) {
    issues.push('raw_img_tag_in_markdown');
  }

  // 2) Unbalanced markdown fences often cause rendering cascade failures
  const fenceCount = (md.match(/```/g) || []).length;
  if (fenceCount % 2 !== 0) {
    issues.push('unbalanced_code_fences');
  }

  // 3) Basic checklist presence when the template expects it (soft check)
  const hasChecklist = /\n-\s*\[\s*[xX]?\s*\]\s+/m.test(md) || /\n(□|☐|☑|✓)\s+/m.test(md);
  if (!hasChecklist) {
    issues.push('missing_checklist_syntax');
  }

  return issues;
}
