import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const DAILY_POST_TARGET = 2;

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
      // Check if any published today are missing images → backfill
      const { data: missingImages } = await supabase
        .from('blog_posts')
        .select('id, slug')
        .gte('publish_at', `${today}T00:00:00`)
        .eq('status', 'published')
        .is('hero_image_url', null)
        .limit(2);
      
      if (missingImages && missingImages.length > 0) {
        console.log(`[blog-daily-publish] Found ${missingImages.length} posts missing images, backfilling...`);
        for (const post of missingImages) {
          try {
            const { data: imgResult } = await supabase.functions.invoke('generate-blog-images', {
              body: { slug: post.slug, mode: 'single' }
            });
            if (imgResult?.result?.hero_url) {
              console.log(`[blog-daily-publish] Backfilled image for: ${post.slug}`);
              // Trigger deploy after backfill
              if (githubToken) await triggerGitHubBuild(githubToken);
            } else {
              console.error(`[blog-daily-publish] Backfill failed for: ${post.slug}`);
              await sendFailureEmail(supabase, `Image backfill failed for: ${post.slug}`, imgResult);
            }
          } catch (err) {
            console.error(`[blog-daily-publish] Backfill error for ${post.slug}:`, err);
          }
        }
      }
      
      await supabase.from('blog_runs').insert({
        result: 'skipped',
        skip_reason: 'already_published_today',
        notes: `Published today: ${alreadyPublished}. Backfilled images: ${missingImages?.length || 0}`,
        quality_gate_report: { pacing: 'daily_limit_reached' }
      });
      
      return new Response(JSON.stringify({ 
        success: true, 
        message: `Daily limit reached (${alreadyPublished}/${DAILY_POST_TARGET})`,
        published: 0,
        backfilled_images: missingImages?.length || 0
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Get planned posts
    const { data: plannedPosts, error: planError } = await supabase
      .from('blog_plan')
      .select(`id, topic_id, pillar, planned_date, status, publish_attempts,
        blog_topics (id, title_base, slug, pillar, intent, primary_keyword, secondary_keywords, required_subtopics, unique_angle_options)`)
      .lte('planned_date', today)
      .eq('status', 'planned')
      .lt('publish_attempts', 3)
      .order('planned_date', { ascending: true })
      .limit(remaining);

    if (planError) throw planError;

    let postsToGenerate = plannedPosts || [];
    
    if (postsToGenerate.length === 0) {
      const { data: pendingTopics } = await supabase
        .from('blog_topics')
        .select('*')
        .is('last_used_at', null)
        .order('priority_score', { ascending: false })
        .limit(remaining);

      if (!pendingTopics || pendingTopics.length === 0) {
        return new Response(JSON.stringify({ success: true, message: 'No posts to publish', published: 0 }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      const results = [];
      for (const topic of pendingTopics.slice(0, remaining)) {
        const result = await generateAndPublishPost(supabase, null, topic.id, githubToken);
        results.push(result);
        if (!result.success) {
          await sendFailureEmail(supabase, `Blog post generation failed for topic ${topic.title_base}`, { error: result.error, topic_id: topic.id });
        }
      }

      const successCount = results.filter(r => r.success).length;
      if (successCount > 0 && githubToken) await triggerGitHubBuild(githubToken);
      if (successCount > 0) await pingSitemaps();
      
      return new Response(JSON.stringify({ 
        success: true, published: successCount, total_today: alreadyPublished + successCount, results
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const results = [];
    for (const plan of postsToGenerate) {
      await supabase.from('blog_plan').update({ 
        publish_attempts: (plan.publish_attempts || 0) + 1,
        last_attempt_at: new Date().toISOString()
      }).eq('id', plan.id);

      const result = await generateAndPublishPost(supabase, plan.id, plan.topic_id, githubToken);
      results.push({ plan_id: plan.id, ...result });
      
      if (result.success) {
        await supabase.from('blog_plan').update({ status: 'published' }).eq('id', plan.id);
      } else {
        await sendFailureEmail(supabase, `Blog publish failed for plan ${plan.id}`, { error: result.error, plan_id: plan.id, attempts: (plan.publish_attempts || 0) + 1 });
        if ((plan.publish_attempts || 0) >= 2) {
          await supabase.from('blog_plan').update({ status: 'failed', skip_reason: `Failed after ${plan.publish_attempts + 1} attempts` }).eq('id', plan.id);
        }
      }
    }

    const successCount = results.filter(r => r.success).length;
    if (successCount > 0 && githubToken) await triggerGitHubBuild(githubToken);
    if (successCount > 0) await pingSitemaps();

    return new Response(JSON.stringify({ 
      success: true, published: successCount, total_today: alreadyPublished + successCount, results
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[blog-daily-publish] Fatal error:', message);
    
    // Send email for fatal errors too
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);
      await sendFailureEmail(supabase, `Blog daily publish FATAL error: ${message}`, { stack: String(error) });
    } catch (_) { /* best effort */ }
    
    return new Response(JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
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
    
    const { data: generateResult, error: generateError } = await supabase.functions.invoke(
      'generate-blog-post',
      { body: { mode: 'auto', plan_id: planId, topic_id: topicId } }
    );

    if (generateError) {
      console.error('[blog-daily-publish] Generate error:', generateError);
      return { success: false, error: generateError.message };
    }

    console.log('[blog-daily-publish] Post generated:', generateResult?.post?.slug);

    // ========== IMAGE GENERATION (streamlined - max 2 attempts) ==========
    if (generateResult?.post?.slug) {
      const postSlug = generateResult.post.slug;
      let imageGenSuccess = false;
      
      // Single call to generate-blog-images (it handles its own retries internally)
      console.log('[blog-daily-publish] Generating image for:', postSlug);
      try {
        const { data: imgResult, error: imgError } = await supabase.functions.invoke('generate-blog-images', {
          body: { slug: postSlug, mode: 'single' }
        });
        
        if (!imgError && imgResult?.result?.hero_url?.startsWith('https://')) {
          console.log('[blog-daily-publish] Image generated:', imgResult.result.hero_url);
          imageGenSuccess = true;
        } else {
          console.error('[blog-daily-publish] Image generation failed:', imgError || imgResult?.result?.errors);
        }
      } catch (err) {
        console.error('[blog-daily-publish] Image generation exception:', err);
      }
      
      // Wait for DB sync
      await new Promise(r => setTimeout(r, 2000));

      // Final verification
      const { data: savedPost } = await supabase
        .from('blog_posts')
        .select('id, slug, hero_image_url, content_md, title')
        .eq('slug', postSlug)
        .maybeSingle();

      const heroUrl = savedPost?.hero_image_url || '';
      const hasValidHero = heroUrl.startsWith('https://') && heroUrl.includes('supabase.co');
      
      if (!hasValidHero) {
        console.error('[blog-daily-publish] No valid hero image - publishing anyway but flagging');
        // DON'T block publish - still publish but notify
        await sendFailureEmail(supabase, `Post published WITHOUT hero image: ${postSlug}`, {
          slug: postSlug, title: savedPost?.title, hero_url: heroUrl
        });
      } else {
        // Validate image content
        const isValid = await validateImageNotBlank(heroUrl);
        if (!isValid) {
          console.error('[blog-daily-publish] Hero image is blank/corrupt');
          const fileName = heroUrl.split('/blog-images/').pop();
          if (fileName) {
            const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
            const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
            await fetch(`${supabaseUrl}/storage/v1/object/blog-images/${fileName}`, {
              method: 'DELETE', headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` },
            }).catch(() => {});
            await supabase.from('blog_posts').update({ hero_image_url: null }).eq('slug', postSlug);
            await sendFailureEmail(supabase, `Post published with BLANK hero image (removed): ${postSlug}`, { slug: postSlug });
          }
        }
      }

      // Quality audit on content
      const qualityIssues = auditPostMarkdown(savedPost?.content_md || '');
      const brokenLinks = await validateExternalLinks(savedPost?.content_md || '');
      if (brokenLinks.length > 0) qualityIssues.push(...brokenLinks.map(l => `broken_link:${l}`));
      
      if (qualityIssues.length > 0) {
        console.error('[blog-daily-publish] Quality issues:', qualityIssues);
        
        // Auto-repair broken links
        let repairedContent = savedPost?.content_md || '';
        let repaired = false;
        for (const issue of qualityIssues) {
          if (issue.startsWith('broken_link:')) {
            const brokenUrl = issue.replace('broken_link:', '');
            const linkRegex = new RegExp(`\\[([^\\]]+)\\]\\(${brokenUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\)`, 'g');
            repairedContent = repairedContent.replace(linkRegex, '$1');
            repaired = true;
          }
        }
        
        const nonLinkIssues = qualityIssues.filter(i => !i.startsWith('broken_link:'));
        if (nonLinkIssues.length === 0 && repaired) {
          await supabase.from('blog_posts').update({ content_md: repairedContent, quality_gate_report: { auto_repaired: true, repaired_links: brokenLinks } }).eq('slug', postSlug);
        } else if (nonLinkIssues.length > 0) {
          // Serious issues - still publish but notify
          await sendFailureEmail(supabase, `Post published with quality issues: ${postSlug}`, { issues: nonLinkIssues });
          if (repaired) {
            await supabase.from('blog_posts').update({ content_md: repairedContent }).eq('slug', postSlug);
          }
        }
      }

      // Submit to IndexNow
      await submitToIndexNow(supabase, [postSlug]);
    }

    // Log success
    await supabase.from('blog_runs').insert({
      result: 'success',
      chosen_plan_id: planId,
      chosen_topic_id: topicId,
      post_id: generateResult?.post?.id,
      notes: `Published & indexed`
    });

    return { success: true, post: generateResult?.post };

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[blog-daily-publish] Post generation failed:', message);
    return { success: false, error: message };
  }
}

/**
 * Send failure notification email via Resend
 */
async function sendFailureEmail(
  supabase: ReturnType<typeof createClient>,
  subject: string,
  details: Record<string, unknown>
) {
  try {
    const resendKey = Deno.env.get('RESEND_API_KEY');
    if (!resendKey) {
      console.error('[blog-daily-publish] No RESEND_API_KEY - cannot send failure email');
      return;
    }
    
    const timestamp = new Date().toISOString();
    const detailsHtml = Object.entries(details)
      .map(([k, v]) => `<tr><td style="padding:4px 8px;font-weight:bold;color:#666;">${k}</td><td style="padding:4px 8px;">${typeof v === 'object' ? JSON.stringify(v, null, 2) : String(v)}</td></tr>`)
      .join('');
    
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'VistaCEO Blog <info@vistaceo.com>',
        to: ['info@vistaceo.com'],
        subject: `🚨 Blog Alert: ${subject}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
            <div style="background:#1a1a2e;color:white;padding:16px 20px;border-radius:8px 8px 0 0;">
              <h2 style="margin:0;font-size:18px;">🚨 VistaCEO Blog Alert</h2>
              <p style="margin:4px 0 0;font-size:12px;opacity:0.7;">${timestamp}</p>
            </div>
            <div style="border:1px solid #e0e0e0;border-top:none;padding:20px;border-radius:0 0 8px 8px;">
              <h3 style="color:#e53e3e;margin-top:0;">${subject}</h3>
              <table style="width:100%;border-collapse:collapse;font-size:13px;">
                ${detailsHtml}
              </table>
              <hr style="margin:16px 0;border:none;border-top:1px solid #eee;">
              <p style="font-size:11px;color:#999;">
                Este es un email automático del sistema de blog de VistaCEO.
                <br>Revisar logs en Lovable Cloud para más detalles.
              </p>
            </div>
          </div>
        `,
      }),
    });
    
    if (response.ok) {
      console.log('[blog-daily-publish] Failure email sent successfully');
    } else {
      const errText = await response.text();
      console.error('[blog-daily-publish] Failed to send email:', errText);
    }
  } catch (err) {
    console.error('[blog-daily-publish] Email send error:', err);
  }
}

async function validateImageNotBlank(imageUrl: string): Promise<boolean> {
  try {
    const response = await fetch(imageUrl, { method: 'GET' });
    if (!response.ok) return false;
    
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.startsWith('image/')) return false;
    
    const blob = await response.arrayBuffer();
    const sizeKB = blob.byteLength / 1024;
    
    if (sizeKB < 8) return false;
    if (contentType.includes('png') && sizeKB < 30) return false;
    
    const bytes = new Uint8Array(blob);
    const sampleSize = Math.min(bytes.length, 10000);
    const startOffset = Math.min(200, bytes.length - sampleSize);
    let nearWhiteByteCount = 0;
    
    for (let i = startOffset; i < startOffset + sampleSize && i < bytes.length; i++) {
      if (bytes[i] >= 0xF8) nearWhiteByteCount++;
    }
    
    if (nearWhiteByteCount / sampleSize > 0.85) return false;
    return true;
  } catch {
    return false;
  }
}

async function triggerGitHubBuild(token: string) {
  try {
    const response = await fetch('https://api.github.com/repos/vistaceoapp/vistaceo/dispatches', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'VistaCEO-Blog-Publisher'
      },
      body: JSON.stringify({
        event_type: 'blog-post-published',
        client_payload: { timestamp: new Date().toISOString(), source: 'blog-daily-publish' }
      })
    });

    if (!response.ok) {
      console.error('[blog-daily-publish] GitHub dispatch failed:', response.status);
    } else {
      console.log('[blog-daily-publish] GitHub Actions triggered');
    }
  } catch (error) {
    console.error('[blog-daily-publish] GitHub trigger error:', error);
  }
}

async function submitToIndexNow(supabase: ReturnType<typeof createClient>, slugs: string[]) {
  try {
    await supabase.functions.invoke('indexnow-submit', { body: { urls: slugs } });
  } catch (error) {
    console.error('[blog-daily-publish] IndexNow failed:', error);
  }
}

async function pingSitemaps() {
  const sitemapUrl = 'https://blog.vistaceo.com/sitemap.xml';
  try {
    await Promise.allSettled([
      fetch(`https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`),
      fetch(`https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`),
    ]);
  } catch (_) {}
}

function auditPostMarkdown(contentMd: string): string[] {
  const issues: string[] = [];
  const md = contentMd || '';

  if (/<img\s+[^>]*(?:src|class|loading|alt)\s*=\s*"/i.test(md)) issues.push('raw_img_tag');
  if (/<a\s+[^>]*href\s*=\s*"/i.test(md)) issues.push('raw_anchor_tag');
  if (/<(?:div|span|section|article|header|footer|nav|table|tr|td|th|iframe|script|style|link|meta)\s/i.test(md)) issues.push('raw_html_tags');
  if (/(?:loading\s*=\s*"lazy"|decoding\s*=\s*"async"|class\s*=\s*"content-image")/i.test(md)) issues.push('raw_html_attributes');
  if (/%3c\s*a/i.test(md) || md.includes('%3Ca%20href=')) issues.push('encoded_html');
  if (/supabase\.co\/st\.\.\./i.test(md)) issues.push('truncated_url');
  
  const rawSupabaseUrls = md.match(/(?<!\(|!)nlewrgmcawzcdazhfiyy\.supabase\.co\S+/g);
  if (rawSupabaseUrls && rawSupabaseUrls.length > 0) issues.push('raw_supabase_url');
  
  const fenceCount = (md.match(/```/g) || []).length;
  if (fenceCount % 2 !== 0) issues.push('unbalanced_code_fences');
  if (/!\[([^\]]*)\]\(\s*\)/.test(md)) issues.push('empty_image_url');
  if (/\[([^\]]+)\]\(\s*\)/.test(md)) issues.push('empty_link_url');
  if (/\*\*Nota del editor\*\*/i.test(md) || /\[insertar\s/i.test(md) || /\[PLACEHOLDER/i.test(md)) issues.push('ai_placeholder');

  const stripped = md.replace(/#{1,6}\s+.*\n/g, '').replace(/!\[.*?\]\(.*?\)/g, '').replace(/\[.*?\]\(.*?\)/g, '').trim();
  if (stripped.length < 500) issues.push('article_too_short');

  return issues;
}

async function validateExternalLinks(contentMd: string): Promise<string[]> {
  const brokenLinks: string[] = [];
  const md = contentMd || '';
  
  const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g;
  const links: string[] = [];
  let match;
  while ((match = linkRegex.exec(md)) !== null) {
    const url = match[2];
    if (url.includes('blog.vistaceo.com') || url.includes('vistaceo.com')) continue;
    if (url.startsWith('#')) continue;
    links.push(url);
  }
  
  if (links.length === 0) return brokenLinks;
  const uniqueLinks = [...new Set(links)];
  
  for (let i = 0; i < uniqueLinks.length; i += 5) {
    const batch = uniqueLinks.slice(i, i + 5);
    const results = await Promise.all(batch.map(async (url) => {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 6000);
        const response = await fetch(url, { method: 'HEAD', headers: { 'User-Agent': 'VistaCEO-QG/1.0' }, signal: controller.signal, redirect: 'follow' });
        clearTimeout(timeout);
        if (response.status === 405 || response.status === 403) {
          const getResp = await fetch(url, { method: 'GET', headers: { 'User-Agent': 'VistaCEO-QG/1.0' }, signal: AbortSignal.timeout(6000), redirect: 'follow' });
          return getResp.status < 400 ? null : url;
        }
        return response.status < 400 ? null : url;
      } catch { return null; }
    }));
    brokenLinks.push(...results.filter(Boolean) as string[]);
  }
  
  return brokenLinks;
}
