import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const COUNTRIES = ['AR', 'CL', 'UY', 'CO', 'EC', 'CR', 'MX', 'PA'];
const ANNUAL_TARGET = 350;
const HORIZON_DAYS = 365;

// Seeded random number generator for reproducibility
function seededRandom(seed: number): () => number {
  return function() {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse options
    let goLiveDate: string | null = null;
    let randomSeed: number = Date.now();
    
    try {
      const body = await req.json();
      goLiveDate = body.go_live_date;
      randomSeed = body.seed || randomSeed;
    } catch {
      // Use defaults
    }

    const startDate = goLiveDate ? new Date(goLiveDate) : new Date();
    console.log('[build-annual-calendar] Starting...', { startDate: startDate.toISOString(), randomSeed });

    // 1. Get all topics from blog_topics
    const { data: topics, error: topicsError } = await supabase
      .from('blog_topics')
      .select('*')
      .order('priority_score', { ascending: false });

    if (topicsError) throw new Error(`Topics fetch error: ${topicsError.message}`);

    if (!topics || topics.length === 0) {
      return new Response(JSON.stringify({
        success: false,
        error: 'No topics found. Please seed blog_topics first.'
      }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    console.log(`[build-annual-calendar] Found ${topics.length} topics`);

    // 2. Ensure we have exactly 200 topics (or fill with generated)
    const targetTopics = [...topics];
    const needsFillers = ANNUAL_TARGET - targetTopics.length;

    if (needsFillers > 0) {
      console.log(`[build-annual-calendar] Need ${needsFillers} filler topics`);
      // We won't generate fillers here - just use what we have
    }

    // Take only the first 200
    const selectedTopics = targetTopics.slice(0, ANNUAL_TARGET);

    // 3. Generate publication slots (200 dates over 365 days)
    const random = seededRandom(randomSeed);
    const slots: Date[] = [];
    
    // Average gap: 365/200 ≈ 1.825 days
    // We'll use gaps of 1-2 days with some randomization
    let currentDate = new Date(startDate);
    
    for (let i = 0; i < ANNUAL_TARGET; i++) {
      slots.push(new Date(currentDate));
      
      // Gap between 1-2 days, occasionally 3 for variety
      const gap = random() < 0.7 ? (random() < 0.5 ? 1 : 2) : (random() < 0.8 ? 2 : 3);
      currentDate.setDate(currentDate.getDate() + gap);
    }

    console.log(`[build-annual-calendar] Generated ${slots.length} publication slots`);

    // 4. Shuffle topics for variety while maintaining constraints
    // Group topics by pillar
    const topicsByPillar: Record<string, typeof topics> = {};
    selectedTopics.forEach(topic => {
      if (!topicsByPillar[topic.pillar]) {
        topicsByPillar[topic.pillar] = [];
      }
      topicsByPillar[topic.pillar].push(topic);
    });

    const pillars = Object.keys(topicsByPillar);
    
    // Interleave topics to avoid same pillar twice in a row
    const orderedTopics: typeof topics = [];
    let lastPillar = '';
    let pillarIndex = 0;
    
    while (orderedTopics.length < selectedTopics.length) {
      // Find next pillar that's different from last
      let attempts = 0;
      while (attempts < pillars.length * 2) {
        const pillar = pillars[pillarIndex % pillars.length];
        if (pillar !== lastPillar && topicsByPillar[pillar].length > 0) {
          const topic = topicsByPillar[pillar].shift()!;
          orderedTopics.push(topic);
          lastPillar = pillar;
          break;
        }
        pillarIndex++;
        attempts++;
      }
      
      // If stuck (only one pillar left), just take whatever remains
      if (attempts >= pillars.length * 2) {
        for (const pillar of pillars) {
          while (topicsByPillar[pillar].length > 0) {
            orderedTopics.push(topicsByPillar[pillar].shift()!);
          }
        }
        break;
      }
      
      pillarIndex++;
    }

    // 5. Assign countries (balanced distribution: 25 per country)
    const countryAssignments: string[] = [];
    const postsPerCountry = Math.floor(ANNUAL_TARGET / COUNTRIES.length); // 25
    
    for (let i = 0; i < COUNTRIES.length; i++) {
      for (let j = 0; j < postsPerCountry; j++) {
        countryAssignments.push(COUNTRIES[i]);
      }
    }
    
    // Shuffle country assignments
    for (let i = countryAssignments.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [countryAssignments[i], countryAssignments[j]] = [countryAssignments[j], countryAssignments[i]];
    }

    // 6. Clear existing blog_plan (if rebuilding)
    const { error: deleteError } = await supabase
      .from('blog_plan')
      .delete()
      .neq('status', 'published'); // Keep published entries

    if (deleteError) {
      console.warn('[build-annual-calendar] Delete warning:', deleteError.message);
    }

    // 7. Insert blog_plan entries
    const planEntries = orderedTopics.map((topic, index) => ({
      topic_id: topic.id,
      planned_date: slots[index % slots.length].toISOString().split('T')[0],
      country_code: countryAssignments[index % countryAssignments.length],
      pillar: topic.pillar,
      status: 'planned',
      publish_attempts: 0,
    }));

    const { error: insertError } = await supabase
      .from('blog_plan')
      .insert(planEntries);

    if (insertError) throw new Error(`Insert error: ${insertError.message}`);

    // 8. Update/set config
    await supabase
      .from('blog_config')
      .upsert([
        { key: 'go_live_date', value: { date: startDate.toISOString().split('T')[0] } },
        { key: 'annual_target_posts', value: { count: ANNUAL_TARGET } },
        { key: 'horizon_days', value: { days: HORIZON_DAYS } },
        { key: 'random_seed', value: { seed: randomSeed } },
        { key: 'calendar_built_at', value: { timestamp: new Date().toISOString() } },
      ], { onConflict: 'key' });

    console.log('[build-annual-calendar] Calendar built successfully');

    // Generate summary
    const summary = {
      total_planned: planEntries.length,
      date_range: {
        start: slots[0].toISOString().split('T')[0],
        end: slots[slots.length - 1].toISOString().split('T')[0],
      },
      by_pillar: {} as Record<string, number>,
      by_country: {} as Record<string, number>,
    };

    planEntries.forEach(entry => {
      summary.by_pillar[entry.pillar] = (summary.by_pillar[entry.pillar] || 0) + 1;
      summary.by_country[entry.country_code] = (summary.by_country[entry.country_code] || 0) + 1;
    });

    return new Response(JSON.stringify({
      success: true,
      summary,
      message: `Annual calendar built with ${planEntries.length} posts from ${summary.date_range.start} to ${summary.date_range.end}`
    }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });

  } catch (error) {
    console.error('[build-annual-calendar] Error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});
