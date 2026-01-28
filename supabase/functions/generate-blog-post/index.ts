import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Countries rotation
const COUNTRIES = ['AR', 'CL', 'UY', 'CO', 'EC', 'CR', 'MX', 'PA'];

// Pillars mapping
const PILLARS = {
  empleo: { label: 'Empleo y Carreras', emoji: '💼' },
  ia_aplicada: { label: 'IA Aplicada', emoji: '🤖' },
  liderazgo: { label: 'Liderazgo y Gestión', emoji: '🎯' },
  servicios: { label: 'Servicios Profesionales', emoji: '📋' },
  emprender: { label: 'Emprender', emoji: '🚀' },
  sistema_inteligente: { label: 'Sistema Inteligente', emoji: '🧠' },
};

interface QualityGateReport {
  passed: boolean;
  score: number;
  checks: {
    anti_cannibalization: boolean;
    unique_value: boolean;
    intent_coherence: boolean;
    editorial_review: boolean;
  };
  issues: string[];
  timestamp: string;
}

interface BlogTopic {
  id: string;
  title_base: string;
  slug: string;
  pillar: string;
  intent: string;
  country_codes: string[];
  priority_score: number;
}

interface BlogPlan {
  id: string;
  topic_id: string;
  planned_date: string;
  country_code: string;
  pillar: string;
  status: string;
  publish_attempts: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse request body for manual run options
    let forceRun = false;
    let specificTopicId: string | null = null;
    
    try {
      const body = await req.json();
      forceRun = body.force || false;
      specificTopicId = body.topic_id || null;
    } catch {
      // No body, use defaults
    }

    console.log('[generate-blog-post] Starting generation...', { forceRun, specificTopicId });

    // 1. Check pacing - should we publish today?
    const { data: configData } = await supabase
      .from('blog_config')
      .select('*');
    
    const config: Record<string, any> = {};
    (configData || []).forEach(row => {
      config[row.key] = row.value;
    });

    const goLiveDate = config.go_live_date?.date || new Date().toISOString().split('T')[0];
    const annualTarget = config.annual_target_posts?.count || 200;
    const horizonDays = config.horizon_days?.days || 365;

    // Calculate pacing
    const now = new Date();
    const goLive = new Date(goLiveDate);
    const daysElapsed = Math.floor((now.getTime() - goLive.getTime()) / (1000 * 60 * 60 * 24));
    const expectedPublishes = Math.floor((daysElapsed / horizonDays) * annualTarget);

    // Get actual publishes count
    const { count: actualPublishes } = await supabase
      .from('blog_posts')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published')
      .gte('publish_at', goLiveDate);

    console.log('[generate-blog-post] Pacing check:', { 
      daysElapsed, 
      expectedPublishes, 
      actualPublishes,
      forceRun 
    });

    // Pacing control (skip if ahead, unless forced)
    if (!forceRun && (actualPublishes || 0) > expectedPublishes) {
      console.log('[generate-blog-post] Ahead of schedule, skipping...');
      
      await supabase.from('blog_runs').insert({
        result: 'skipped',
        skip_reason: 'ahead_of_schedule',
        notes: `Actual: ${actualPublishes}, Expected: ${expectedPublishes}`,
        quality_gate_report: { pacing: 'skipped' }
      });

      return new Response(JSON.stringify({
        success: false,
        reason: 'ahead_of_schedule',
        message: `Already have ${actualPublishes} posts, expected ${expectedPublishes}`
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // 2. Select topic from blog_plan
    let selectedPlan: BlogPlan | null = null;
    let selectedTopic: BlogTopic | null = null;

    if (specificTopicId) {
      // Manual topic selection
      const { data: topic } = await supabase
        .from('blog_topics')
        .select('*')
        .eq('id', specificTopicId)
        .single();
      
      selectedTopic = topic;
    } else {
      // Get next planned topic
      const today = now.toISOString().split('T')[0];
      
      const { data: plans } = await supabase
        .from('blog_plan')
        .select('*, topic:blog_topics(*)')
        .eq('status', 'planned')
        .lte('planned_date', today)
        .order('planned_date', { ascending: true })
        .order('publish_attempts', { ascending: true })
        .limit(1);

      if (plans && plans.length > 0) {
        selectedPlan = plans[0];
        selectedTopic = plans[0].topic;
      }
    }

    // If no planned topic, get random from backlog
    if (!selectedTopic) {
      console.log('[generate-blog-post] No planned topic, selecting from backlog...');
      
      // Get last published pillar to avoid repetition
      const { data: lastPost } = await supabase
        .from('blog_posts')
        .select('pillar')
        .eq('status', 'published')
        .order('publish_at', { ascending: false })
        .limit(1)
        .single();

      const lastPillar = lastPost?.pillar;

      // Select topic with different pillar
      let query = supabase
        .from('blog_topics')
        .select('*')
        .order('priority_score', { ascending: false })
        .limit(10);

      if (lastPillar) {
        query = query.neq('pillar', lastPillar);
      }

      const { data: topics } = await query;

      if (topics && topics.length > 0) {
        // Random selection from top 10 for variety
        selectedTopic = topics[Math.floor(Math.random() * Math.min(5, topics.length))];
      }
    }

    if (!selectedTopic) {
      console.log('[generate-blog-post] No topics available');
      
      await supabase.from('blog_runs').insert({
        result: 'failed',
        skip_reason: 'no_topics_available',
        notes: 'No topics found in blog_topics or blog_plan',
        quality_gate_report: { error: 'no_topics' }
      });

      return new Response(JSON.stringify({
        success: false,
        reason: 'no_topics_available'
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    console.log('[generate-blog-post] Selected topic:', selectedTopic.title_base);

    // 3. Select country (rotate based on balance)
    const { data: countryStats } = await supabase
      .from('blog_posts')
      .select('country_code')
      .eq('status', 'published');

    const countryCounts: Record<string, number> = {};
    COUNTRIES.forEach(c => countryCounts[c] = 0);
    (countryStats || []).forEach(post => {
      if (post.country_code) {
        countryCounts[post.country_code] = (countryCounts[post.country_code] || 0) + 1;
      }
    });

    // Select least-used country
    const selectedCountry = COUNTRIES.reduce((min, c) => 
      (countryCounts[c] || 0) < (countryCounts[min] || 0) ? c : min
    , COUNTRIES[0]);

    console.log('[generate-blog-post] Selected country:', selectedCountry);

    // 4. Anti-cannibalization check
    const { data: existingPosts } = await supabase
      .from('blog_posts')
      .select('slug, primary_keyword, title')
      .eq('status', 'published')
      .limit(200);

    const slugSimilarity = (existingPosts || []).some(post => {
      const existingSlug = post.slug.toLowerCase();
      const newSlug = selectedTopic!.slug.toLowerCase();
      
      // Check for significant overlap
      const existingWords = new Set<string>(existingSlug.split('-'));
      const newWords = new Set<string>(newSlug.split('-'));
      const overlap = [...existingWords].filter((w: string) => newWords.has(w) && w.length > 3).length;
      
      return overlap >= 4; // More than 4 significant words overlap
    });

    if (slugSimilarity && !forceRun) {
      console.log('[generate-blog-post] Potential cannibalization detected');
      
      // Update plan status if exists
      if (selectedPlan) {
        await supabase
          .from('blog_plan')
          .update({ 
            status: 'skipped',
            skip_reason: 'cannibalization_risk',
            publish_attempts: (selectedPlan.publish_attempts || 0) + 1
          })
          .eq('id', selectedPlan.id);
      }

      await supabase.from('blog_runs').insert({
        chosen_topic_id: selectedTopic.id,
        chosen_plan_id: selectedPlan?.id,
        result: 'skipped',
        skip_reason: 'cannibalization_risk',
        notes: `Topic "${selectedTopic.title_base}" too similar to existing posts`,
        quality_gate_report: { 
          anti_cannibalization: false,
          passed: false 
        }
      });

      return new Response(JSON.stringify({
        success: false,
        reason: 'cannibalization_risk',
        topic: selectedTopic.title_base
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // 5. Generate content with Lovable AI
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const pillarInfo = PILLARS[selectedTopic.pillar as keyof typeof PILLARS] || { label: selectedTopic.pillar, emoji: '📝' };

    const systemPrompt = `Sos un editor senior de contenido SEO para VistaCEO, un sistema de gestión inteligente para empresas de LATAM.

REGLAS EDITORIALES ESTRICTAS:
1. People-first: contenido útil, completo, verificable y claro
2. CERO venta dentro del cuerpo del artículo - el sistema se menciona solo si el título lo contiene
3. Español neutro con matices para ${selectedCountry === 'AR' ? 'Argentina (voseo)' : selectedCountry === 'MX' ? 'México (tuteo)' : 'español neutro LATAM'}
4. Sin keyword stuffing - cobertura temática natural
5. Incluir: checklist/plantilla, mínimo 2 ejemplos, FAQ, conclusión accionable
6. Ritmo humano: mezcla de frases cortas y largas, sin repeticiones mecánicas
7. Si mencionás datos o estadísticas, indicar que son estimaciones o rangos orientativos

ESTRUCTURA REQUERIDA:
- H1: el título exacto proporcionado
- Intro: 80-120 palabras, presentar el problema y qué resuelve el artículo
- "En 2 minutos": 3-7 bullets con respuesta rápida
- 4-7 H2 con contenido profundo y ejemplos
- 1 checklist o plantilla copiable
- FAQ: 3-6 preguntas derivadas
- Conclusión: qué hacer ahora (accionable)

Pillar: ${pillarInfo.label} ${pillarInfo.emoji}
Intent: ${selectedTopic.intent}

Respondé SOLO con el contenido en Markdown, sin explicaciones adicionales.`;

    const userPrompt = `Escribí un artículo completo para el blog de VistaCEO.

TÍTULO: ${selectedTopic.title_base}

PAÍS TARGET: ${selectedCountry}

KEYWORD PRINCIPAL: ${selectedTopic.title_base.toLowerCase().replace(/[^a-záéíóúñü\s]/g, '').slice(0, 50)}

Generá el contenido completo siguiendo la estructura indicada. Incluí ejemplos reales o hipotéticos (marcados como tales), una checklist práctica, y FAQ relevantes.`;

    console.log('[generate-blog-post] Calling Lovable AI...');

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 4000,
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('[generate-blog-post] AI error:', errorText);
      
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({
          success: false,
          reason: 'rate_limited',
          message: 'AI rate limit exceeded, please try again later'
        }), { 
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
      }
      
      throw new Error(`AI generation failed: ${aiResponse.status}`);
    }

    const aiResult = await aiResponse.json();
    const contentMd = aiResult.choices?.[0]?.message?.content || '';

    if (!contentMd || contentMd.length < 500) {
      throw new Error('Generated content too short');
    }

    console.log('[generate-blog-post] Content generated, length:', contentMd.length);

    // 6. Quality Gate checks
    const qualityGateReport: QualityGateReport = {
      passed: true,
      score: 0,
      checks: {
        anti_cannibalization: !slugSimilarity,
        unique_value: false,
        intent_coherence: false,
        editorial_review: false,
      },
      issues: [],
      timestamp: new Date().toISOString(),
    };

    // Check for unique value (checklist/plantilla)
    const hasChecklist = contentMd.includes('- [ ]') || 
                        contentMd.toLowerCase().includes('checklist') ||
                        contentMd.toLowerCase().includes('plantilla') ||
                        contentMd.includes('✓') ||
                        contentMd.includes('□');
    qualityGateReport.checks.unique_value = hasChecklist;
    if (!hasChecklist) {
      qualityGateReport.issues.push('Missing checklist or template');
    }

    // Check for examples (mínimo 2)
    const exampleMatches = contentMd.match(/ejemplo|caso|situación|escenario/gi) || [];
    const hasExamples = exampleMatches.length >= 2;
    if (!hasExamples) {
      qualityGateReport.issues.push('Less than 2 examples found');
    }

    // Check intent coherence
    const hasHowTo = contentMd.includes('## ') && (contentMd.includes('Paso') || contentMd.includes('Cómo'));
    const hasComparison = contentMd.includes('vs') || contentMd.toLowerCase().includes('comparación');
    const hasFAQ = contentMd.toLowerCase().includes('preguntas frecuentes') || contentMd.includes('FAQ');
    
    qualityGateReport.checks.intent_coherence = 
      (selectedTopic.intent === 'informational' && hasHowTo) ||
      (selectedTopic.intent === 'comparative' && hasComparison) ||
      hasFAQ;

    // Editorial review (no mechanical repetitions)
    const words = contentMd.toLowerCase().split(/\s+/);
    const wordCount: Record<string, number> = {};
    words.forEach((w: string) => {
      if (w.length > 5) {
        wordCount[w] = (wordCount[w] || 0) + 1;
      }
    });
    const maxRepetition = Math.max(...Object.values(wordCount));
    qualityGateReport.checks.editorial_review = maxRepetition < words.length * 0.05; // Less than 5% repetition

    // Calculate score
    const checksArray = Object.values(qualityGateReport.checks);
    const passedChecks = checksArray.filter(Boolean).length;
    qualityGateReport.score = Math.round((passedChecks / checksArray.length) * 100);
    qualityGateReport.passed = qualityGateReport.score >= 50;

    console.log('[generate-blog-post] Quality gate:', qualityGateReport);

    // 7. Generate metadata
    const excerpt = contentMd
      .split('\n')
      .find((line: string) => line.length > 50 && !line.startsWith('#'))
      ?.slice(0, 160) || selectedTopic.title_base;

    const metaTitle = `${selectedTopic.title_base} | VistaCEO`.slice(0, 60);
    const metaDescription = excerpt.slice(0, 155) + '...';

    // Calculate reading time
    const wordCountTotal = contentMd.split(/\s+/).length;
    const readingTimeMin = Math.max(3, Math.ceil(wordCountTotal / 200));

    // Generate internal links (to existing posts in same pillar)
    const { data: relatedPosts } = await supabase
      .from('blog_posts')
      .select('slug, title')
      .eq('status', 'published')
      .eq('pillar', selectedTopic.pillar)
      .limit(5);

    const internalLinks = (relatedPosts || []).map(post => ({
      url: `/blog/${post.slug}`,
      anchor: post.title,
      context: 'related'
    }));

    // Generate schema JSON-LD
    const schemaJsonld = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": selectedTopic.title_base,
      "description": metaDescription,
      "datePublished": new Date().toISOString(),
      "dateModified": new Date().toISOString(),
      "author": {
        "@type": "Organization",
        "name": "Equipo VistaCEO",
        "url": "https://www.vistaceo.com"
      },
      "publisher": {
        "@type": "Organization",
        "name": "VistaCEO",
        "logo": {
          "@type": "ImageObject",
          "url": "https://www.vistaceo.com/logo.png"
        }
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": `https://www.vistaceo.com/blog/${selectedTopic.slug}`
      },
      "wordCount": wordCountTotal,
      "inLanguage": "es"
    };

    // 8. Insert blog post
    const { data: newPost, error: insertError } = await supabase
      .from('blog_posts')
      .insert({
        topic_id: selectedTopic.id,
        plan_id: selectedPlan?.id,
        status: 'published',
        publish_at: new Date().toISOString(),
        country_code: selectedCountry,
        pillar: selectedTopic.pillar,
        intent: selectedTopic.intent,
        title: selectedTopic.title_base,
        slug: selectedTopic.slug,
        excerpt,
        content_md: contentMd,
        meta_title: metaTitle,
        meta_description: metaDescription,
        primary_keyword: selectedTopic.title_base.toLowerCase().slice(0, 50),
        reading_time_min: readingTimeMin,
        internal_links: internalLinks,
        schema_jsonld: schemaJsonld,
        quality_gate_report: qualityGateReport,
        author_name: 'Equipo VistaCEO',
      })
      .select()
      .single();

    if (insertError) {
      throw new Error(`Insert error: ${insertError.message}`);
    }

    console.log('[generate-blog-post] Post created:', newPost.id);

    // 9. Update blog_plan if used
    if (selectedPlan) {
      await supabase
        .from('blog_plan')
        .update({ 
          status: 'published',
          last_attempt_at: new Date().toISOString()
        })
        .eq('id', selectedPlan.id);
    }

    // 10. Update topic last_used_at
    await supabase
      .from('blog_topics')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', selectedTopic.id);

    // 11. Record run
    await supabase.from('blog_runs').insert({
      chosen_topic_id: selectedTopic.id,
      chosen_plan_id: selectedPlan?.id,
      result: 'published',
      post_id: newPost.id,
      quality_gate_report: qualityGateReport,
      notes: `Published "${selectedTopic.title_base}" for ${selectedCountry}`
    });

    return new Response(JSON.stringify({
      success: true,
      post: {
        id: newPost.id,
        title: newPost.title,
        slug: newPost.slug,
        country: selectedCountry,
        pillar: selectedTopic.pillar,
        url: `/blog/${newPost.slug}`
      },
      quality_gate: qualityGateReport
    }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });

  } catch (error) {
    console.error('[generate-blog-post] Error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});
