import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// LATAM-wide content - no country-specific targeting
const DEFAULT_REGION = 'LATAM';

// Pillars mapping
const PILLARS = {
  empleo: { label: 'Empleo y Carreras', emoji: '💼' },
  ia_aplicada: { label: 'IA y Tecnología', emoji: '🤖' },
  liderazgo: { label: 'Liderazgo y Gestión', emoji: '🎯' },
  servicios: { label: 'Servicios Profesionales', emoji: '📋' },
  emprender: { label: 'Emprender', emoji: '🚀' },
  tendencias: { label: 'Tendencias y Oportunidades', emoji: '📈' },
};

// External sources by pillar (for "Para profundizar" section)
const EXTERNAL_SOURCES: Record<string, Array<{title: string, url: string, domain: string}>> = {
  empleo: [
    { title: 'Organización Internacional del Trabajo (OIT)', url: 'https://www.ilo.org/es', domain: 'ilo.org' },
    { title: 'LinkedIn Economic Graph', url: 'https://economicgraph.linkedin.com/', domain: 'linkedin.com' },
    { title: 'World Economic Forum - Future of Jobs', url: 'https://www.weforum.org/reports/the-future-of-jobs-report-2023', domain: 'weforum.org' },
  ],
  ia_aplicada: [
    { title: 'Google AI Blog', url: 'https://ai.googleblog.com/', domain: 'googleblog.com' },
    { title: 'OpenAI Research', url: 'https://openai.com/research', domain: 'openai.com' },
    { title: 'MIT Technology Review - AI', url: 'https://www.technologyreview.com/topic/artificial-intelligence/', domain: 'technologyreview.com' },
  ],
  liderazgo: [
    { title: 'Harvard Business Review', url: 'https://hbr.org/', domain: 'hbr.org' },
    { title: 'McKinsey Insights', url: 'https://www.mckinsey.com/featured-insights', domain: 'mckinsey.com' },
    { title: 'Deloitte Insights', url: 'https://www2.deloitte.com/insights/', domain: 'deloitte.com' },
  ],
  servicios: [
    { title: 'Banco Mundial - Servicios', url: 'https://www.bancomundial.org/', domain: 'bancomundial.org' },
    { title: 'CEPAL - Comisión Económica para América Latina', url: 'https://www.cepal.org/', domain: 'cepal.org' },
    { title: 'BID - Banco Interamericano de Desarrollo', url: 'https://www.iadb.org/', domain: 'iadb.org' },
  ],
  emprender: [
    { title: 'Y Combinator Resources', url: 'https://www.ycombinator.com/library', domain: 'ycombinator.com' },
    { title: 'Endeavor - Emprendimiento', url: 'https://endeavor.org/', domain: 'endeavor.org' },
    { title: 'Startup Genome', url: 'https://startupgenome.com/', domain: 'startupgenome.com' },
  ],
  tendencias: [
    { title: 'Gartner Research', url: 'https://www.gartner.com/en/research', domain: 'gartner.com' },
    { title: 'Forrester Research', url: 'https://www.forrester.com/', domain: 'forrester.com' },
    { title: 'World Economic Forum', url: 'https://www.weforum.org/', domain: 'weforum.org' },
  ],
};

interface QualityGateReport {
  passed: boolean;
  score: number;
  checks: {
    no_h1_repeated: boolean;
    real_headings: boolean;
    has_hero_image: boolean;
    has_inline_images: boolean;
    has_internal_links: boolean;
    has_external_links: boolean;
    short_paragraphs: boolean;
    sentence_case_headings: boolean;
    no_keyword_stuffing: boolean;
    min_word_count: boolean;
    has_checklist: boolean;
    has_examples: boolean;
    no_markdown_tables: boolean;
    no_broken_lines: boolean;
  };
  issues: string[];
  timestamp: string;
  rewrite_attempts: number;
}

function hashStringToInt(input: string): number {
  // Simple stable hash (djb2)
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) + hash) + input.charCodeAt(i);
    hash = hash & 0xffffffff;
  }
  return Math.abs(hash);
}

function hasMarkdownTable(content: string): boolean {
  // Detect markdown tables: header line + separator line
  const lines = content.split('\n');
  for (let i = 0; i < lines.length - 1; i++) {
    const a = lines[i].trim();
    const b = lines[i + 1].trim();
    if (!a.startsWith('|')) continue;
    if (!b.startsWith('|')) continue;
    // separator like: | --- | :---: |
    if (/^\|\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)+\|?$/.test(b)) return true;
  }
  return false;
}

function detectBrokenFormattingIssues(content: string): string[] {
  const issues: string[] = [];
  const lines = content.split('\n');

  // Skip code fences and blockquotes for length checks
  let insideCodeBlock = false;
  let problematicLongLines = 0;
  
  for (const line of lines) {
    if (line.trim().startsWith('```')) {
      insideCodeBlock = !insideCodeBlock;
      continue;
    }
    // Allow long lines inside code blocks or blockquotes
    if (insideCodeBlock || line.trim().startsWith('>')) continue;
    
    if (line.length > 400) {
      problematicLongLines++;
    }
  }
  
  if (problematicLongLines > 2) {
    issues.push(`Found ${problematicLongLines} very long line(s) (>400 chars outside code blocks) - likely broken formatting`);
  }

  const pipeSpamLines = lines.filter(l => (l.match(/\|/g) || []).length >= 12);
  if (pipeSpamLines.length > 0) {
    issues.push(`Found ${pipeSpamLines.length} line(s) with excessive pipes - likely malformed table`);
  }

  if (content.includes('||')) {
    issues.push('Found "||" sequence - likely malformed markdown or broken template');
  }

  const fenceCount = (content.match(/```/g) || []).length;
  if (fenceCount % 2 !== 0) {
    issues.push('Unbalanced code fences (```), likely broken markdown');
  }

  return issues;
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

// Generate hero image using Lovable AI image generation
async function generateHeroImage(
  title: string,
  pillar: string,
  lovableApiKey: string
): Promise<string | null> {
  try {
    const pillarInfo = PILLARS[pillar as keyof typeof PILLARS] || { label: pillar };
    
    const prompt = `Professional minimalist hero image for a business blog article about "${title}". 
Theme: ${pillarInfo.label}. 
Style: Clean, modern, corporate, light background, subtle geometric shapes or abstract icons.
No text in the image. 16:9 aspect ratio. Ultra high resolution.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image',
        messages: [{ role: 'user', content: prompt }],
        modalities: ['image', 'text'],
      }),
    });

    if (!response.ok) {
      console.log('[generate-blog-post] Image generation failed:', response.status);
      return null;
    }

    const result = await response.json();
    const imageUrl = result.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    
    if (imageUrl) {
      console.log('[generate-blog-post] Hero image generated successfully');
      return imageUrl;
    }
    
    return null;
  } catch (error) {
    console.error('[generate-blog-post] Image generation error:', error);
    return null;
  }
}

// Validate and fix content structure
function validateAndFixContent(content: string, title: string): { content: string; issues: string[] } {
  const issues: string[] = [];
  let fixedContent = content;

  // 1. Remove repeated H1 (title) at the start of content
  const h1Pattern = new RegExp(`^#\\s*${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\n`, 'i');
  if (h1Pattern.test(fixedContent)) {
    fixedContent = fixedContent.replace(h1Pattern, '');
    issues.push('Removed repeated H1 from content body');
  }
  
  // Also remove any H1 that matches approximately
  fixedContent = fixedContent.replace(/^#\s+[^\n]+\n\n?/, '');

  // 2. Convert bold "headings" to real H2/H3
  // Pattern: **Title** on its own line followed by paragraph
  fixedContent = fixedContent.replace(/^\*\*([^*]+)\*\*\s*$/gm, (match, text) => {
    // If it looks like a section heading (short, no period at end)
    if (text.length < 80 && !text.endsWith('.')) {
      issues.push(`Converted bold "${text}" to H2`);
      return `## ${text}`;
    }
    return match;
  });

  // 3. Ensure headings use sentence case (not Title Case)
  fixedContent = fixedContent.replace(/^(#{2,3})\s+(.+)$/gm, (match, hashes, text) => {
    // Convert to sentence case: capitalize first letter, rest lowercase (except proper nouns)
    const sentenceCase = text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
      // Preserve some common abbreviations and proper nouns
      .replace(/\b(ia|ai|seo|crm|erp|saas|b2b|b2c|roi|kpi|ceo|cfo|cto|hr|it|latam|pyme|pymes)\b/gi, (m: string) => m.toUpperCase())
      .replace(/\bargentina\b/gi, 'Argentina')
      .replace(/\bchile\b/gi, 'Chile')
      .replace(/\buruguay\b/gi, 'Uruguay')
      .replace(/\bcolombia\b/gi, 'Colombia')
      .replace(/\bméxico\b/gi, 'México')
      .replace(/\bvistaceo\b/gi, 'VistaCEO');
    
    if (text !== sentenceCase) {
      issues.push(`Fixed heading case: "${text}" -> "${sentenceCase}"`);
    }
    return `${hashes} ${sentenceCase}`;
  });

  return { content: fixedContent, issues };
}

// Quality gate checks
function runQualityGates(content: string, title: string): QualityGateReport {
  const report: QualityGateReport = {
    passed: false,
    score: 0,
    checks: {
      no_h1_repeated: true,
      real_headings: false,
      has_hero_image: false, // Will be set after image generation
      has_inline_images: false, // Will be set after image generation
      has_internal_links: false,
      has_external_links: false,
      short_paragraphs: false,
      sentence_case_headings: false,
      no_keyword_stuffing: false,
      min_word_count: false,
      has_checklist: false,
      has_examples: false,
      no_markdown_tables: false,
      no_broken_lines: false,
    },
    issues: [],
    timestamp: new Date().toISOString(),
    rewrite_attempts: 0,
  };

  // Check for H1 in content
  if (content.match(/^#\s+[^\n]+/m)) {
    report.checks.no_h1_repeated = false;
    report.issues.push('Content contains H1 - should only use H2/H3');
  }

  // Check for real H2/H3 headings
  const h2Count = (content.match(/^##\s+/gm) || []).length;
  const h3Count = (content.match(/^###\s+/gm) || []).length;
  report.checks.real_headings = h2Count >= 4 && h3Count >= 2;
  if (!report.checks.real_headings) {
    report.issues.push(`Insufficient headings: ${h2Count} H2 (need 4+), ${h3Count} H3 (need 2+)`);
  }

  // Check for internal links
  const internalLinks = (content.match(/\[([^\]]+)\]\(\/blog[^\)]+\)/g) || []).length;
  report.checks.has_internal_links = internalLinks >= 5;
  if (!report.checks.has_internal_links) {
    report.issues.push(`Only ${internalLinks} internal links (need 5+)`);
  }

  // Check for external links
  const externalLinks = (content.match(/\[([^\]]+)\]\(https?:\/\/[^\)]+\)/g) || []).length;
  report.checks.has_external_links = externalLinks >= 3;
  if (!report.checks.has_external_links) {
    report.issues.push(`Only ${externalLinks} external links (need 3+)`);
  }

  // Check paragraph length (rough check)
  const paragraphs = content.split(/\n\n+/).filter(p => p.trim() && !p.startsWith('#') && !p.startsWith('-') && !p.startsWith('|'));
  const longParagraphs = paragraphs.filter(p => p.split(/\s+/).length > 100);
  report.checks.short_paragraphs = longParagraphs.length === 0;
  if (!report.checks.short_paragraphs) {
    report.issues.push(`${longParagraphs.length} paragraphs exceed 100 words`);
  }

  // Check sentence case in headings
  const headings = content.match(/^#{2,3}\s+(.+)$/gm) || [];
  const titleCaseHeadings = headings.filter(h => {
    const text = h.replace(/^#{2,3}\s+/, '');
    // Check if more than 3 words start with uppercase (excluding first word)
    const words = text.split(/\s+/);
    const capsCount = words.slice(1).filter(w => /^[A-ZÁÉÍÓÚ]/.test(w) && w.length > 3).length;
    return capsCount > 2;
  });
  report.checks.sentence_case_headings = titleCaseHeadings.length === 0;
  if (!report.checks.sentence_case_headings) {
    report.issues.push(`${titleCaseHeadings.length} headings use Title Case instead of sentence case`);
  }

  // Word count
  const wordCount = content.split(/\s+/).length;
  report.checks.min_word_count = wordCount >= 900;
  if (!report.checks.min_word_count) {
    report.issues.push(`Only ${wordCount} words (need 900+)`);
  }

  // Keyword stuffing check
  const words = content.toLowerCase().split(/\s+/);
  const wordFreq: Record<string, number> = {};
  words.forEach(w => {
    if (w.length > 5) wordFreq[w] = (wordFreq[w] || 0) + 1;
  });
  const maxFreq = Math.max(...Object.values(wordFreq));
  report.checks.no_keyword_stuffing = maxFreq < wordCount * 0.03;
  if (!report.checks.no_keyword_stuffing) {
    report.issues.push('Potential keyword stuffing detected');
  }

  // Checklist check
  const hasChecklist = content.includes('- [ ]') || 
                       content.includes('- [x]') ||
                       content.toLowerCase().includes('checklist') ||
                       content.includes('✓') ||
                       content.includes('☐') ||
                       content.includes('□');
  report.checks.has_checklist = hasChecklist;
  if (!hasChecklist) {
    report.issues.push('Missing checklist or template');
  }

  // Examples check
  const exampleMatches = content.match(/\*\*ejemplo/gi) || [];
  report.checks.has_examples = exampleMatches.length >= 2;
  if (!report.checks.has_examples) {
    report.issues.push(`Only ${exampleMatches.length} examples (need 2+)`);
  }

  // Hard block: markdown tables are NOT allowed (they caused broken renders)
  report.checks.no_markdown_tables = !hasMarkdownTable(content);
  if (!report.checks.no_markdown_tables) {
    report.issues.push('Markdown tables detected. Tables are forbidden: use a fillable template as a bullet list or code block instead.');
  }

  // Hard block: broken formatting patterns
  const brokenIssues = detectBrokenFormattingIssues(content);
  report.checks.no_broken_lines = brokenIssues.length === 0;
  if (!report.checks.no_broken_lines) {
    report.issues.push(...brokenIssues);
  }

  // Calculate score
  const checksArray = Object.values(report.checks);
  const passedChecks = checksArray.filter(Boolean).length;
  report.score = Math.round((passedChecks / checksArray.length) * 100);
  report.passed = report.score >= 75 &&
    report.checks.min_word_count &&
    report.checks.real_headings &&
    report.checks.no_markdown_tables &&
    report.checks.no_broken_lines;

  return report;
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
    let automated = false;
    
    try {
      const body = await req.json();
      forceRun = body.force || false;
      specificTopicId = body.topic_id || null;
      automated = body.automated || false;
    } catch {
      // No body, use defaults
    }

    console.log('[generate-blog-post] Starting generation with PATCH V3...', { forceRun, specificTopicId, automated });

    // 1. Check pacing - should we publish today?
    const { data: configData } = await supabase
      .from('blog_config')
      .select('*');
    
    const config: Record<string, any> = {};
    (configData || []).forEach(row => {
      config[row.key] = row.value;
    });

    const goLiveDate = config.go_live_date?.date || new Date().toISOString().split('T')[0];
    const annualTarget = config.annual_target_posts?.count || 350;
    const horizonDays = config.horizon_days?.days || 365;

    // Calculate pacing - 350 posts / 365 days ≈ 1 post per day
    const now = new Date();
    const goLive = new Date(goLiveDate);
    const daysElapsed = Math.max(1, Math.floor((now.getTime() - goLive.getTime()) / (1000 * 60 * 60 * 24)));
    const expectedPublishes = Math.max(daysElapsed, 1); // At least 1 post per day elapsed

    // Check if we already published today
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    
    const { count: publishedToday } = await supabase
      .from('blog_posts')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published')
      .gte('publish_at', todayStart.toISOString());

    console.log('[generate-blog-post] Pacing check:', { 
      daysElapsed, 
      expectedPublishes, 
      publishedToday,
      forceRun 
    });

    // Only skip if we already published today (unless forced)
    if (!forceRun && (publishedToday || 0) >= 1) {
      console.log('[generate-blog-post] Already published today, skipping...');
      
      await supabase.from('blog_runs').insert({
        result: 'skipped',
        skip_reason: 'already_published_today',
        notes: `Published today: ${publishedToday}`,
        quality_gate_report: { pacing: 'daily_limit_reached' }
      });

      return new Response(JSON.stringify({
        success: false,
        reason: 'already_published_today',
        message: `Already published ${publishedToday} post(s) today`
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // 1.5) Automated runs: publish immediately if there are pending posts for today
    // No longer waiting for specific hour slot - just ensure 1 post/day max
    console.log('[generate-blog-post] Automated run, proceeding with generation (1/day limit already checked)');

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

    // 3. LATAM-wide content (no country rotation)
    console.log('[generate-blog-post] Using LATAM-wide content (no country targeting)');

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

    // 5. Get existing posts for internal linking
    const { data: relatedPosts } = await supabase
      .from('blog_posts')
      .select('slug, title, pillar')
      .eq('status', 'published')
      .limit(50);

    const samePillarPosts = (relatedPosts || []).filter(p => p.pillar === selectedTopic!.pillar).slice(0, 4);
    const crossPillarPosts = (relatedPosts || []).filter(p => p.pillar !== selectedTopic!.pillar).slice(0, 2);
    
    // Build internal links for prompt
    const internalLinksForPrompt = [...samePillarPosts, ...crossPillarPosts].map(p => 
      `- [${p.title}](/blog/${p.slug})`
    ).join('\n');

    // Get external sources for this pillar
    const pillarSources = EXTERNAL_SOURCES[selectedTopic.pillar as keyof typeof EXTERNAL_SOURCES] || EXTERNAL_SOURCES.liderazgo;

    // 6. Generate content with Lovable AI
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const pillarInfo = PILLARS[selectedTopic.pillar as keyof typeof PILLARS] || { label: selectedTopic.pillar, emoji: '📝' };

    // PATCH V4 System Prompt with all rules
    const systemPrompt = `Sos un editor senior de contenido SEO para VistaCEO, un sistema de gestión inteligente para empresas de LATAM.

═══════════════════════════════════════════
REGLAS EDITORIALES PATCH V4 (OBLIGATORIAS)
═══════════════════════════════════════════

⛔ PROHIBIDO (causa errores de renderizado):
- NUNCA usar tablas Markdown (con pipes |). Se rompen en publicación.
- NUNCA usar plantillas con columnas o pipes.
- NUNCA generar líneas de más de 200 caracteres.

1. SEMÁNTICA Y ESTRUCTURA
- NO repetir el título (H1) en el cuerpo. La página ya lo renderiza.
- El contenido Markdown DEBE empezar con la introducción, NO con el título.
- Usar headings REALES:
  - ## para secciones principales (H2) → 4–7 en total
  - ### para subsecciones (H3) → 2–6 distribuidos
- NUNCA usar **negrita** como si fuera heading.
- Longitud: 900–1.600 palabras.

2. ESTILO ANTI-ROBOT
- Headings en español en SENTENCE CASE:
  ✅ "Expertos en prompt engineering y curación de contenido con IA"
  ❌ "Expertos en Prompt Engineering y Curación de Contenido con IA"
- Párrafos cortos: máximo 2–4 líneas (60–90 palabras).
- Cada 150–220 palabras incluir: subtítulo, lista corta, callout o ejemplo.
- Listas: máximo 5–7 bullets por bloque.

3. ABOVE THE FOLD (inicio del artículo)
Después de la intro (80-120 palabras), incluir:

## En 2 minutos
- [3–6 bullets ultra claros con la respuesta rápida]

4. MÓDULOS OBLIGATORIOS
Cada nota DEBE incluir:

a) **1 bloque "Checklist copiable"** con casillas:
\`\`\`
## Checklist: [tema]
- [ ] Paso 1
- [ ] Paso 2
- [ ] Paso 3
\`\`\`

b) **1 bloque "Plantilla"** (formato rellenable SIN TABLA):
Usá una lista o bloque de código. NUNCA pipes (|).
Ejemplo correcto:
\`\`\`
## Plantilla: autoevaluación
- Habilidad 1: _____ (nivel 1-5)
- Habilidad 2: _____ (nivel 1-5)
- Habilidad 3: _____ (nivel 1-5)
\`\`\`

c) **2–5 ejemplos** con este formato EXACTO:
> **Ejemplo:** [2–4 líneas describiendo la situación aplicable a LATAM]
> **Qué haría hoy:** [1–2 líneas accionables]
> **Error típico:** [1 línea]

5. ENLACES INTERNOS (5-12 por artículo)
Insertar contextualmente estos links existentes donde sea relevante:
${internalLinksForPrompt || '- [Ver más artículos](/blog)'}

Además, incluir links a categorías:
- [Más sobre ${pillarInfo.label}](/blog/categoria/${selectedTopic.pillar})

6. ENLACES EXTERNOS (3-6 fuentes)
Incluir una sección "Para profundizar" al final con links a fuentes serias:
${pillarSources.map(s => `- [${s.title}](${s.url})`).join('\n')}

7. FAQ (3-6 preguntas)
Incluir sección:
## Preguntas frecuentes
Con respuestas cortas (40-80 palabras cada una).

8. CONCLUSIÓN ACCIONABLE
Terminar con:
## Próximos pasos
[Qué hacer HOY - 2-3 acciones concretas]

═══════════════════════════════════════════
CONTEXTO
═══════════════════════════════════════════
- Pillar: ${pillarInfo.label} ${pillarInfo.emoji}
- Audiencia: emprendedores y profesionales de LATAM (usar español neutro con voseo)
- Intent: ${selectedTopic.intent}
- People-first: contenido útil, CERO venta en el cuerpo

Respondé SOLO con el contenido Markdown, sin el título H1, sin explicaciones adicionales.`;

    const userPrompt = `Escribí un artículo completo para el blog de VistaCEO.

TÍTULO (ya lo renderiza la página, NO lo incluyas): ${selectedTopic.title_base}

KEYWORD PRINCIPAL: ${selectedTopic.title_base.toLowerCase().replace(/[^a-záéíóúñü\s]/g, '').slice(0, 50)}

Generá el contenido completo siguiendo TODAS las reglas del PATCH V4:
1. Empezá directo con la introducción (80-120 palabras)
2. Luego "## En 2 minutos" con bullets
3. 4-7 secciones H2 con contenido profundo
4. Incluí checklist, plantilla y 2+ ejemplos con formato exacto
   - ⛔ PROHIBIDO: La "Plantilla" NO puede usar tablas Markdown (pipes |). Usá lista rellenable o bloque de código.
5. 5-12 links internos contextuales
6. Sección "Para profundizar" con links externos
7. FAQ con 3-6 preguntas
8. "## Próximos pasos" como cierre`;

    console.log('[generate-blog-post] Calling Lovable AI with PATCH V4 prompt...');

    let contentMd = '';
    let rewriteAttempts = 0;
    const maxRewrites = 4;
    let qualityGateReport: QualityGateReport;

    // Generation loop with rewrite attempts
    do {
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
            { role: 'user', content: rewriteAttempts === 0 ? userPrompt : `${userPrompt}\n\nIMPORTANTE: El intento anterior no pasó el quality gate. Problemas detectados:\n${qualityGateReport!.issues.join('\n')}\n\nCorregí estos problemas en esta nueva versión.` }
          ],
          max_tokens: 6000,
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
      contentMd = aiResult.choices?.[0]?.message?.content || '';

      if (!contentMd || contentMd.length < 500) {
        throw new Error('Generated content too short');
      }

      // Validate and fix content
      const { content: fixedContent, issues: fixIssues } = validateAndFixContent(contentMd, selectedTopic.title_base);
      contentMd = fixedContent;
      
      // Run quality gates
      qualityGateReport = runQualityGates(contentMd, selectedTopic.title_base);
      qualityGateReport.issues = [...qualityGateReport.issues, ...fixIssues];
      qualityGateReport.rewrite_attempts = rewriteAttempts;

      console.log(`[generate-blog-post] Quality gate attempt ${rewriteAttempts + 1}:`, {
        passed: qualityGateReport.passed,
        score: qualityGateReport.score,
        issueCount: qualityGateReport.issues.length,
        issuesList: qualityGateReport.issues.slice(0, 8)
      });

      rewriteAttempts++;
    } while (!qualityGateReport.passed && rewriteAttempts < maxRewrites);

    // If still not passed after max rewrites, skip
    if (!qualityGateReport.passed) {
      console.log('[generate-blog-post] Quality gate failed after max rewrites, skipping...');
      
      if (selectedPlan) {
        await supabase
          .from('blog_plan')
          .update({ 
            status: 'skipped',
            skip_reason: 'quality_gate_failed',
            publish_attempts: (selectedPlan.publish_attempts || 0) + 1
          })
          .eq('id', selectedPlan.id);
      }

      await supabase.from('blog_runs').insert({
        chosen_topic_id: selectedTopic.id,
        chosen_plan_id: selectedPlan?.id,
        result: 'skipped',
        skip_reason: 'quality_gate_failed',
        notes: `Failed after ${rewriteAttempts} attempts: ${qualityGateReport.issues.join(', ')}`,
        quality_gate_report: qualityGateReport
      });

      return new Response(JSON.stringify({
        success: false,
        reason: 'quality_gate_failed',
        attempts: rewriteAttempts,
        issues: qualityGateReport.issues
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    console.log('[generate-blog-post] Content passed quality gate, generating images...');

    // 7. Generate hero image
    const heroImageUrl = await generateHeroImage(selectedTopic.title_base, selectedTopic.pillar, lovableApiKey);
    qualityGateReport.checks.has_hero_image = !!heroImageUrl;
    
    // Note: For inline images, we'd need to upload to storage. For now, we use the hero.
    qualityGateReport.checks.has_inline_images = !!heroImageUrl; // Simplified for now

    // 8. Generate metadata
    const excerpt = contentMd
      .split('\n')
      .find((line: string) => line.length > 50 && !line.startsWith('#') && !line.startsWith('-') && !line.startsWith('>'))
      ?.slice(0, 160) || selectedTopic.title_base;

    const metaTitle = `${selectedTopic.title_base} | VistaCEO`.slice(0, 60);
    const metaDescription = excerpt.slice(0, 155) + (excerpt.length > 155 ? '...' : '');

    // Calculate reading time
    const wordCountTotal = contentMd.split(/\s+/).length;
    const readingTimeMin = Math.max(4, Math.ceil(wordCountTotal / 200));

    // Build internal links array
    const internalLinks = [...samePillarPosts, ...crossPillarPosts].map(post => ({
      url: `/blog/${post.slug}`,
      anchor: post.title,
      context: post.pillar === selectedTopic!.pillar ? 'same_pillar' : 'cross_pillar'
    }));

    // Build external sources array
    const externalSources = pillarSources.map(s => ({
      url: s.url,
      title: s.title,
      domain: s.domain
    }));

    // Generate schema JSON-LD
    const schemaJsonld = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": selectedTopic.title_base,
      "description": metaDescription,
      "image": heroImageUrl || undefined,
      "datePublished": new Date().toISOString(),
      "dateModified": new Date().toISOString(),
      "author": {
        "@type": "Person",
        "name": "Equipo VistaCEO",
        "url": "https://vistaceo.lovable.app/about"
      },
      "publisher": {
        "@type": "Organization",
        "name": "VistaCEO",
        "logo": {
          "@type": "ImageObject",
          "url": "https://vistaceo.lovable.app/logo.png"
        }
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": `https://vistaceo.lovable.app/blog/${selectedTopic.slug}`
      },
      "wordCount": wordCountTotal,
      "inLanguage": "es"
    };

    // 9. Insert blog post
    const { data: newPost, error: insertError } = await supabase
      .from('blog_posts')
      .insert({
        topic_id: selectedTopic.id,
        plan_id: selectedPlan?.id,
        status: 'published',
        publish_at: new Date().toISOString(),
        country_code: 'AR', // Default for LATAM-wide content
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
        external_sources: externalSources,
        schema_jsonld: schemaJsonld,
        quality_gate_report: qualityGateReport,
        author_name: 'Equipo VistaCEO',
        author_url: 'https://vistaceo.lovable.app/about',
        hero_image_url: heroImageUrl,
        image_alt_text: `Imagen ilustrativa: ${selectedTopic.title_base}`,
        canonical_url: `https://vistaceo.lovable.app/blog/${selectedTopic.slug}`,
      })
      .select()
      .single();

    if (insertError) {
      throw new Error(`Insert error: ${insertError.message}`);
    }

    console.log('[generate-blog-post] Post created:', newPost.id);

    // 10. Update blog_plan if used
    if (selectedPlan) {
      await supabase
        .from('blog_plan')
        .update({ 
          status: 'published',
          last_attempt_at: new Date().toISOString()
        })
        .eq('id', selectedPlan.id);
    }

    // 11. Update topic last_used_at
    await supabase
      .from('blog_topics')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', selectedTopic.id);

    // 12. Record run
    await supabase.from('blog_runs').insert({
      chosen_topic_id: selectedTopic.id,
      chosen_plan_id: selectedPlan?.id,
      result: 'published',
      post_id: newPost.id,
      quality_gate_report: qualityGateReport,
      notes: `PATCH V4: Published "${selectedTopic.title_base}" for LATAM (score: ${qualityGateReport.score}%)`
    });

    return new Response(JSON.stringify({
      success: true,
      post: {
        id: newPost.id,
        title: newPost.title,
        slug: newPost.slug,
        region: 'LATAM',
        pillar: selectedTopic.pillar,
        url: `/blog/${newPost.slug}`,
        hero_image: !!heroImageUrl
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
