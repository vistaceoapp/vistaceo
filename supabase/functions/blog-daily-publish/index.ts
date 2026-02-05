import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * BLOG DAILY PUBLISH - Automated daily blog post generation
 * 
 * This edge function:
 * 1. Checks for planned posts for today that aren't published yet
 * 2. Generates blog content using AI
 * 3. Publishes to the database
 * 4. Triggers GitHub Actions to rebuild the static blog
 */

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const githubToken = Deno.env.get('GH_PAT');
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('[blog-daily-publish] Starting daily publish check...');
    
    // Get today's date
    const today = new Date().toISOString().split('T')[0];
    
    // Check for planned posts that need to be published
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
      .eq('planned_date', today)
      .eq('status', 'planned')
      .lt('publish_attempts', 3)
      .limit(1);

    if (planError) {
      console.error('[blog-daily-publish] Error fetching planned posts:', planError);
      throw planError;
    }

    if (!plannedPosts || plannedPosts.length === 0) {
      console.log('[blog-daily-publish] No planned posts for today');
      
      // Try to get any pending topic instead
      const { data: pendingTopics } = await supabase
        .from('blog_topics')
        .select('*')
        .is('last_used_at', null)
        .order('priority_score', { ascending: false })
        .limit(1);

      if (!pendingTopics || pendingTopics.length === 0) {
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'No posts to publish today',
            published: 0 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Use the pending topic
      const topic = pendingTopics[0];
      console.log('[blog-daily-publish] Using pending topic:', topic.title_base);
      
      // Call generate-blog-post with this topic
      const { data: generateResult, error: generateError } = await supabase.functions.invoke(
        'generate-blog-post',
        {
          body: {
            mode: 'auto',
            topic_id: topic.id
          }
        }
      );

      if (generateError) {
        console.error('[blog-daily-publish] Generate error:', generateError);
        throw generateError;
      }

      console.log('[blog-daily-publish] Post generated:', generateResult);

      // Generate images for the new post
      if (generateResult?.post?.slug) {
        console.log('[blog-daily-publish] Generating images for:', generateResult.post.slug);
        try {
          const { data: imageResult, error: imageError } = await supabase.functions.invoke(
            'generate-blog-images',
            {
              body: {
                slug: generateResult.post.slug,
                mode: 'single'
              }
            }
          );
          if (imageError) {
            console.error('[blog-daily-publish] Image generation error:', imageError);
          } else {
            console.log('[blog-daily-publish] Images generated:', imageResult);
          }
        } catch (imgErr) {
          console.error('[blog-daily-publish] Image generation failed:', imgErr);
        }
      }

      // Trigger GitHub Actions rebuild if token is available
      if (githubToken) {
        await triggerGitHubBuild(githubToken);
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Post generated from pending topic',
          published: 1,
          post: generateResult 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const plan = plannedPosts[0];
    const topicData = plan.blog_topics as unknown as { title_base: string } | null;
    
    console.log('[blog-daily-publish] Found planned post:', plan.id, topicData?.title_base);

    // Update attempt count
    await supabase
      .from('blog_plan')
      .update({ 
        publish_attempts: (plan.publish_attempts || 0) + 1,
        last_attempt_at: new Date().toISOString()
      })
      .eq('id', plan.id);

    // Call generate-blog-post
    const { data: generateResult, error: generateError } = await supabase.functions.invoke(
      'generate-blog-post',
      {
        body: {
          mode: 'auto',
          plan_id: plan.id,
          topic_id: plan.topic_id
        }
      }
    );

    if (generateError) {
      console.error('[blog-daily-publish] Generate error:', generateError);
      
      // Mark plan as failed if max attempts reached
      if ((plan.publish_attempts || 0) >= 2) {
        await supabase
          .from('blog_plan')
          .update({ 
            status: 'failed',
            skip_reason: `Generation failed after ${plan.publish_attempts + 1} attempts: ${generateError.message}`
          })
          .eq('id', plan.id);
      }
      
      throw generateError;
    }

    // Mark plan as published
    await supabase
      .from('blog_plan')
      .update({ status: 'published' })
      .eq('id', plan.id);

    console.log('[blog-daily-publish] Post published successfully:', generateResult);

    // Generate images for the new post
    if (generateResult?.post?.slug) {
      console.log('[blog-daily-publish] Generating images for:', generateResult.post.slug);
      try {
        const { data: imageResult, error: imageError } = await supabase.functions.invoke(
          'generate-blog-images',
          {
            body: {
              slug: generateResult.post.slug,
              mode: 'single'
            }
          }
        );
        if (imageError) {
          console.error('[blog-daily-publish] Image generation error:', imageError);
        } else {
          console.log('[blog-daily-publish] Images generated:', imageResult);
        }
      } catch (imgErr) {
        console.error('[blog-daily-publish] Image generation failed:', imgErr);
      }
    }

    // Trigger GitHub Actions rebuild
    if (githubToken) {
      await triggerGitHubBuild(githubToken);
    }

    // Log the run
    await supabase.from('blog_runs').insert({
      result: 'success',
      chosen_plan_id: plan.id,
      chosen_topic_id: plan.topic_id,
      post_id: generateResult?.post?.id,
      notes: `Auto-published on ${today}`
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Post published successfully',
        published: 1,
        post: generateResult 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[blog-daily-publish] Error:', message);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function triggerGitHubBuild(token: string) {
  try {
    // Correct owner and repo for vistaceoapp organization
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

// Submit new URLs to IndexNow for instant indexing
async function submitToIndexNow(supabase: ReturnType<typeof createClient>, slugs: string[]) {
  try {
    console.log('[blog-daily-publish] Submitting to IndexNow:', slugs);
    
    const { data, error } = await supabase.functions.invoke('indexnow-submit', {
      body: { urls: slugs },
    });
    
    if (error) {
      console.error('[blog-daily-publish] IndexNow error:', error);
    } else {
      console.log('[blog-daily-publish] IndexNow submitted:', data);
    }
  } catch (error) {
    console.error('[blog-daily-publish] IndexNow submit failed:', error);
  }
}
