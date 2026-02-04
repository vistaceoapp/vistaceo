import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// LATAM-wide content - no country-specific targeting
const DEFAULT_REGION = 'LATAM';

// CRITICAL: Use the CANONICAL domain, never .lovable.app
const CANONICAL_DOMAIN = 'https://www.vistaceo.com';

// Pillars mapping
const PILLARS = {
  empleo: { label: 'Empleo y Carreras', emoji: '💼' },
  ia_aplicada: { label: 'IA y Tecnología', emoji: '🤖' },
  liderazgo: { label: 'Liderazgo y Gestión', emoji: '🎯' },
  servicios: { label: 'Servicios Profesionales', emoji: '📋' },
  emprender: { label: 'Emprender', emoji: '🚀' },
  tendencias: { label: 'Tendencias y Oportunidades', emoji: '📈' },
};

// 12-Cluster system - maps pillar to specific category
const BLOG_CLUSTERS: Record<string, { label: string; emoji: string; pillar: string }> = {
  'empleo-habilidades': { label: 'Empleo y Habilidades', emoji: '💼', pillar: 'empleo' },
  'ia-para-pymes': { label: 'IA para PyMEs', emoji: '🤖', pillar: 'ia_aplicada' },
  'servicios-profesionales-rentabilidad': { label: 'Servicios Profesionales', emoji: '📋', pillar: 'servicios' },
  'marketing-crecimiento': { label: 'Marketing y Crecimiento', emoji: '📈', pillar: 'tendencias' },
  'finanzas-cashflow': { label: 'Finanzas y Cashflow', emoji: '💰', pillar: 'servicios' },
  'operaciones-procesos': { label: 'Operaciones y Procesos', emoji: '⚙️', pillar: 'ia_aplicada' },
  'ventas-negociacion': { label: 'Ventas y Negociación', emoji: '🤝', pillar: 'servicios' },
  'liderazgo-management': { label: 'Liderazgo y Management', emoji: '🎯', pillar: 'liderazgo' },
  'estrategia-latam': { label: 'Estrategia LATAM', emoji: '🌎', pillar: 'emprender' },
  'herramientas-productividad': { label: 'Herramientas y Productividad', emoji: '🛠️', pillar: 'ia_aplicada' },
  'data-analytics': { label: 'Data y Analytics', emoji: '📊', pillar: 'ia_aplicada' },
  'tendencias-ia-tech': { label: 'Tendencias IA y Tech', emoji: '🚀', pillar: 'tendencias' },
};

// Get category clusters for a pillar
function getClustersForPillar(pillar: string): string[] {
  return Object.entries(BLOG_CLUSTERS)
    .filter(([_, info]) => info.pillar === pillar)
    .map(([key]) => key);
}

// Select next category with rotation
async function selectNextCategory(supabase: any): Promise<string> {
  // Get category counts
  const { data: posts } = await supabase
    .from('blog_posts')
    .select('category')
    .eq('status', 'published')
    .not('category', 'is', null);

  const categoryCounts: Record<string, number> = {};
  Object.keys(BLOG_CLUSTERS).forEach(key => {
    categoryCounts[key] = 0;
  });
  
  (posts || []).forEach((post: any) => {
    if (post.category && categoryCounts[post.category] !== undefined) {
      categoryCounts[post.category]++;
    }
  });

  // Get last 3 used categories to avoid repetition
  const { data: recentPosts } = await supabase
    .from('blog_posts')
    .select('category')
    .eq('status', 'published')
    .order('publish_at', { ascending: false })
    .limit(3);

  const recentCategories = new Set((recentPosts || []).map((p: any) => p.category));

  // Find category with lowest count that wasn't used recently
  let selectedCategory = 'tendencias-ia-tech'; // default
  let minCount = Infinity;

  for (const [category, count] of Object.entries(categoryCounts)) {
    if (!recentCategories.has(category) && count < minCount) {
      minCount = count;
      selectedCategory = category;
    }
  }

  // If all categories were used recently, pick the one with lowest count
  if (minCount === Infinity) {
    for (const [category, count] of Object.entries(categoryCounts)) {
      if (count < minCount) {
        minCount = count;
        selectedCategory = category;
      }
    }
  }

  console.log('[generate-blog-post] Selected category:', selectedCategory, 'count:', minCount);
  return selectedCategory;
}

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

// Upload base64 image to Supabase Storage and return public URL
async function uploadImageToStorage(
  base64Data: string,
  slug: string,
  supabaseUrl: string,
  supabaseKey: string
): Promise<string | null> {
  try {
    // Extract the base64 content and mime type
    const matches = base64Data.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches) {
      console.log('[generate-blog-post] Invalid base64 format');
      return null;
    }
    
    const mimeType = matches[1];
    const base64Content = matches[2];
    const extension = mimeType.split('/')[1] || 'jpg';
    const fileName = `hero-${slug}-${Date.now()}.${extension}`;
    
    // Decode base64 to binary
    const binaryString = atob(base64Content);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // Upload to Supabase Storage
    const response = await fetch(
      `${supabaseUrl}/storage/v1/object/blog-images/${fileName}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': mimeType,
        },
        body: bytes,
      }
    );
    
    if (!response.ok) {
      const error = await response.text();
      console.error('[generate-blog-post] Storage upload failed:', error);
      return null;
    }
    
    // Return public URL
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/blog-images/${fileName}`;
    console.log('[generate-blog-post] Image uploaded to Storage:', publicUrl);
    return publicUrl;
  } catch (error) {
    console.error('[generate-blog-post] Storage upload error:', error);
    return null;
  }
}

// Pillar-specific image contexts for ultra-realistic generation
const PILLAR_IMAGE_CONTEXTS: Record<string, { scene: string; mood: string }> = {
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

// Generate hero image using Lovable AI - ULTRA REALISTIC, NO TEXT
// Returns a PUBLIC HTTPS URL (never base64)
async function generateHeroImage(
  title: string,
  pillar: string,
  slug: string,
  lovableApiKey: string,
  supabaseUrl: string,
  supabaseKey: string
): Promise<string | null> {
  try {
    const pillarContext = PILLAR_IMAGE_CONTEXTS[pillar] || PILLAR_IMAGE_CONTEXTS.tendencias;
    
    // Ultra-realistic prompt - NO TEXT, NO LOGOS
    const prompt = `
Professional editorial photograph for a business blog article titled "${title}".

STYLE: Ultra photorealistic, professional editorial photography, cinematic natural lighting, shallow depth of field, 8K resolution, Hasselblad quality.

CONTEXT: ${pillarContext.scene}
MOOD: ${pillarContext.mood}, premium business editorial, authentic, human warmth.

SETTING: Modern Latin American office or workspace (Argentina, Mexico, Colombia style), clean and minimal, subtle blue/violet accent tones, natural daylight through windows.

CRITICAL - FORBIDDEN ELEMENTS: No text, no letters, no numbers, no logos, no watermarks, no UI elements, no screenshots, no captions, no subtitles.

PEOPLE: If people appear, show them from behind, silhouettes, hands only, or tastefully blurred. Never show identifiable faces directly.

Aspect ratio: 16:9. Ultra high resolution.
`.trim();

    console.log('[generate-blog-post] Generating ultra-realistic hero image for:', slug);

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
    
    if (!imageUrl) {
      console.log('[generate-blog-post] No image in response');
      return null;
    }
    
    // CRITICAL: If the image is base64, upload to Storage
    if (imageUrl.startsWith('data:')) {
      console.log('[generate-blog-post] Detected base64 image, uploading to Storage...');
      const storageUrl = await uploadImageToStorage(imageUrl, slug, supabaseUrl, supabaseKey);
      if (storageUrl) {
        console.log('[generate-blog-post] Hero image uploaded:', storageUrl);
        return storageUrl;
      }
      console.log('[generate-blog-post] Storage upload failed, using default image');
      return null;
    }
    
    // If it's already a valid HTTPS URL, use it
    if (imageUrl.startsWith('https://')) {
      console.log('[generate-blog-post] Hero image already HTTPS:', imageUrl);
      return imageUrl;
    }
    
    console.log('[generate-blog-post] Invalid image URL format, skipping');
    return null;
  } catch (error) {
    console.error('[generate-blog-post] Image generation error:', error);
    return null;
  }
}

// Generate inline image for content body
async function generateInlineImage(
  title: string,
  pillar: string,
  slug: string,
  lovableApiKey: string,
  supabaseUrl: string,
  supabaseKey: string
): Promise<string | null> {
  try {
    const pillarContext = PILLAR_IMAGE_CONTEXTS[pillar] || PILLAR_IMAGE_CONTEXTS.tendencias;
    
    const prompt = `
Detailed professional photograph showing a practical concept related to "${title}".

SCENE: ${pillarContext.scene}, focus on hands, documents, screen (without readable text), or workspace details.
MOOD: ${pillarContext.mood}, human and authentic.

COMPOSITION: Close-up or medium shot. Shallow depth of field. Natural lighting.

CRITICAL - ABSOLUTELY FORBIDDEN: No text, no letters, no numbers, no logos, no watermarks, no UI elements, no visible words.

Latin American office context. Premium editorial quality.

Aspect ratio: 3:2. Ultra high resolution.
`.trim();

    console.log('[generate-blog-post] Generating inline image for:', slug);

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
      return null;
    }

    const result = await response.json();
    const imageUrl = result.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    
    if (!imageUrl) return null;
    
    if (imageUrl.startsWith('data:')) {
      // Upload with inline prefix
      const matches = imageUrl.match(/^data:([^;]+);base64,(.+)$/);
      if (!matches) return null;
      
      const mimeType = matches[1];
      const base64Content = matches[2];
      const extension = mimeType.split('/')[1] || 'jpg';
      const fileName = `inline-${slug}-${Date.now()}.${extension}`;
      
      const binaryString = atob(base64Content);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const uploadResponse = await fetch(
        `${supabaseUrl}/storage/v1/object/blog-images/${fileName}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': mimeType,
          },
          body: bytes,
        }
      );
      
      if (!uploadResponse.ok) return null;
      
      return `${supabaseUrl}/storage/v1/object/public/blog-images/${fileName}`;
    }
    
    return imageUrl.startsWith('https://') ? imageUrl : null;
  } catch (error) {
    console.error('[generate-blog-post] Inline image generation error:', error);
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

    // PATCH V6 System Prompt - 10 REGLAS SEO PREMIUM
    const systemPrompt = `Sos un editor senior de contenido SEO para VistaCEO. Tu objetivo es generar artículos que:
1. Sean ULTRA LEGIBLES (mucho aire visual, párrafos cortísimos)
2. Sean ULTRA SEO (keywords naturales, estructura perfecta para rankear)
3. Sean ULTRA HUMANOS (suena a persona real, no a plantilla ni IA)

═══════════════════════════════════════════════════════════════
                    10 REGLAS SEO PREMIUM (OBLIGATORIAS)
═══════════════════════════════════════════════════════════════

⛔ PROHIBIDO:
- NUNCA tablas Markdown (pipes |). Usá listas o bloques de código.
- NUNCA líneas de más de 120 caracteres.
- NUNCA bloques de texto densos sin respiración.
- NUNCA parecer un artículo generado por IA.
- NUNCA empezar oraciones con "En el mundo actual", "En la era digital", etc.

═══════════════════════════════════════════════════════════════
REGLA 1: PAQUETE SEO COMPLETO
═══════════════════════════════════════════════════════════════

La keyphrase principal aparece EXACTAMENTE en 5 lugares:
1. En el primer párrafo (intro) - una vez, natural
2. En un H2 - una sola vez
3. En el ALT de 1 imagen (lo generamos después)
4. En la meta description (ya la generamos)
5. En el cierre (próximos pasos)

El resto del contenido usa VARIACIONES SEMÁNTICAS, nunca repetir la keyword.

Keywords secundarias a distribuir naturalmente (8-15):
- Variaciones LATAM del tema
- Términos "People Also Ask" relacionados
- Conceptos asociados (herramientas, procesos, métricas)

Entidades a mencionar (5-12):
- Herramientas reconocidas del tema
- Organizaciones o frameworks relevantes
- Conceptos que Google entiende como "tema"

═══════════════════════════════════════════════════════════════
REGLA 2: ESTRUCTURA WOW QUE RETIENE
═══════════════════════════════════════════════════════════════

**INTRO (70-110 palabras):**
- Hook con dolor real ("¿Te pasa que...?")
- Promesa clara ("en 10 min vas a...")
- Keyphrase natural (1 vez)
- 1 frase de contexto LATAM

---

## En 2 minutos

5 bullets ejecutivos:
- Bullet 1: respuesta directa al problema
- Bullet 2: dato o insight clave
- Bullet 3: acción inmediata posible
- Bullet 4: beneficio claro y medible
- Bullet 5: lo que diferencia este enfoque

---

## Para quién es (y para quién no)

**Esto es para vos si:**
- Criterio 1 específico
- Criterio 2 específico

**Quizás no es para vos si:**
- Criterio negativo 1
- Criterio negativo 2

---

## La idea clave

> Una frase memorable que resume todo el artículo. Google ama la claridad temática.

---

**CUERPO (5-8 H2 obligatorios):**

## Por qué importa ahora en LATAM
(Contexto actual, dolor específico de la región)

## Qué cambia en la práctica
(Con ejemplo real concreto)

## Cómo empezar hoy (paso a paso)
Paso 1: Acción específica
Paso 2: Acción específica
Paso 3: Acción específica

## Checklist rápida

\`\`\`
□ Acción 1 concreta y medible
□ Acción 2 concreta y medible
□ Acción 3 concreta y medible
□ Acción 4 concreta y medible
□ Acción 5 concreta y medible
\`\`\`

## Mini ejercicio de 5 minutos

Ejercicio práctico que el lector puede hacer AHORA:
1. Paso inmediato 1
2. Paso inmediato 2
3. Resultado esperado

## Autoevaluación rápida

**Respondé estas 4 preguntas:**

1. ¿Pregunta diagnóstica 1?
2. ¿Pregunta diagnóstica 2?
3. ¿Pregunta diagnóstica 3?
4. ¿Pregunta diagnóstica 4?

**Interpretación:**
- 0-1 "sí": Necesitás empezar por lo básico
- 2-3 "sí": Vas bien, optimizá
- 4 "sí": Estás listo para el siguiente nivel

## Plantilla copiar y pegar

\`\`\`
## [Nombre de la plantilla]

**Campo 1:** _________________________
**Campo 2:** _________________________
**Campo 3:** _________________________

Instrucción: Completá esto en 5 min y tenés un plan inicial.
\`\`\`

## Errores comunes y cómo evitarlos

**Error 1:** Descripción del error común
→ **Solución:** Qué hacer en su lugar

**Error 2:** Descripción del error común
→ **Solución:** Qué hacer en su lugar

**Error 3:** Descripción del error común
→ **Solución:** Qué hacer en su lugar

---

## Preguntas frecuentes

### ¿Pregunta 1 real que la gente busca?

Respuesta directa en 30-50 palabras. Sin rodeos.

### ¿Pregunta 2 real que la gente busca?

Respuesta directa en 30-50 palabras. Sin rodeos.

### ¿Pregunta 3 real que la gente busca?

Respuesta directa en 30-50 palabras. Sin rodeos.

### ¿Pregunta 4 real que la gente busca?

Respuesta directa en 30-50 palabras. Sin rodeos.

---

## Próximos 3 pasos

1. **HOY:** Acción específica para hacer ahora mismo
2. **ESTA SEMANA:** Acción de seguimiento
3. **PROFUNDIZAR:** Recurso o herramienta recomendada

---

## Para profundizar

Links externos de autoridad:
${pillarSources.map(s => `- [${s.title}](${s.url})`).join('\n')}

═══════════════════════════════════════════════════════════════
REGLA 3: LEGIBILIDAD PREMIUM
═══════════════════════════════════════════════════════════════

- Párrafos de 1-2 frases (3 máximo)
- Cada sección: 1 idea → 1 ejemplo → 1 acción
- Regla 1 pantalla: cada bloque debe poder leerse sin scrollear mucho
- Listas: 7-12 ítems máx (si no, partir en 2)
- Alternar párrafos cortos (1 oración) con normales para ritmo
- Cada 100-150 palabras: un elemento visual (lista, callout, ejemplo)

═══════════════════════════════════════════════════════════════
REGLA 4: EEAT PRÁCTICO
═══════════════════════════════════════════════════════════════

- Explicar como alguien que lo hace de verdad (pasos, criterios, señales)
- Si no hay dato duro, hablar en términos prácticos
- Cuando haya números o afirmaciones fuertes, citar fuente
- Incluir 1-2 opiniones/insights propios del "autor"

═══════════════════════════════════════════════════════════════
REGLA 5: EJEMPLOS OBLIGATORIOS (2-4)
═══════════════════════════════════════════════════════════════

Formato exacto para cada ejemplo:

> **Ejemplo:** Una pyme de [sector] en [país LATAM] quería [objetivo]. [Qué hicieron brevemente].
>
> **Qué haría hoy:** [Acción específica]. Tiempo: [X horas/días].
>
> **Error típico:** [Lo que la mayoría hace mal].

═══════════════════════════════════════════════════════════════
REGLA 6: LINKS INTERNOS (5-10)
═══════════════════════════════════════════════════════════════

Posts relacionados para linkear:
${internalLinksForPrompt || '- [Ver más artículos](/blog)'}
- [Más sobre ${pillarInfo.label}](/blog?pillar=${selectedTopic.pillar})

- 1 link a "pilar" (guía madre o categoría)
- 3-5 links a posts relacionados (cluster)
- 1-2 links a features/páginas relevantes de VistaCEO
- Anclas naturales (NUNCA "clic aquí")

═══════════════════════════════════════════════════════════════
REGLA 7: COLOCACIÓN EXACTA DE KEYPHRASE
═══════════════════════════════════════════════════════════════

5 lugares EXACTOS (ni más, ni menos):
1. Primer párrafo (intro)
2. Un H2 (solo uno)
3. Meta description (ya lo hacemos)
4. ALT de 1 imagen (ya lo hacemos)
5. Cierre (próximos pasos)

El resto: VARIACIONES SEMÁNTICAS únicamente.

═══════════════════════════════════════════════════════════════
REGLA 8: ELEMENTOS WOW
═══════════════════════════════════════════════════════════════

Incluir AL MENOS 2 de estos:
- Framework simple (ej: "3 capas", "matriz impacto/esfuerzo", "regla 80/20")
- Mini caso LATAM con números suaves (sin inventar)
- Comparación "Antes vs Después" (bullets)
- Sección "Señales de que lo estás haciendo bien" (3-6 señales)

═══════════════════════════════════════════════════════════════
REGLA 9: ESTILO ULTRA-HUMANO
═══════════════════════════════════════════════════════════════

- Voseo natural ("podés", "tenés", "hacé")
- Frases cortas que golpean
- Preguntas retóricas para enganchar
- Variar la estructura de cada sección
- No empezar todas las oraciones igual
- Frases tipo: "La realidad es que...", "Acá viene lo importante:", "Esto es clave:"
- Oraciones de impacto solas: "Eso cambia todo." "Y acá es donde la mayoría falla."

═══════════════════════════════════════════════════════════════
REGLA 10: CTA DE VISTACEO (sin spam)
═══════════════════════════════════════════════════════════════

- 1 mención en cuerpo máximo (opcional, natural)
- CTA final de 2-3 líneas: "Si te sirvió esto, en VistaCEO podés..."
- Conectar al tema (misiones/radar/chat/analytics) sin inventar

═══════════════════════════════════════════════════════════════
CONTEXTO
═══════════════════════════════════════════════════════════════
- Pilar: ${pillarInfo.label} ${pillarInfo.emoji}
- Audiencia: emprendedores y profesionales de LATAM
- Intent: ${selectedTopic.intent}
- Objetivo: tráfico orgánico + tiempo en página alto + featured snippets

Respondé SOLO con el Markdown, sin H1, sin explicaciones previas.`;

    const userPrompt = `Escribí un artículo completo para el blog de VistaCEO.

TÍTULO (ya lo renderiza la página, NO lo incluyas): ${selectedTopic.title_base}

KEYPHRASE PRINCIPAL: ${selectedTopic.title_base.toLowerCase().replace(/[^a-záéíóúñü\s]/g, '').slice(0, 50)}

RECORDÁ las 10 REGLAS SEO PREMIUM:
1. La keyphrase aparece en 5 lugares EXACTOS (intro, 1 H2, meta, alt, cierre)
2. Estructura WOW completa: "En 2 minutos", "Para quién es", "La idea clave", etc.
3. Párrafos ultra cortos (1-3 oraciones máximo)
4. EEAT práctico: escribí como experto que lo hace de verdad
5. 2-4 ejemplos con formato: Ejemplo + Qué haría hoy + Error típico
6. 5-10 links internos con anclas naturales
7. Checklist + Plantilla + Mini ejercicio + Autoevaluación + Errores comunes
8. FAQ con 4-6 preguntas reales que la gente busca
9. Voseo natural, frases cortas, ritmo variado
10. CTA VistaCEO sutil al final

⛔ PROHIBIDO: tablas Markdown, líneas >120 chars, keywords repetidas, frases genéricas de IA`;

    console.log('[generate-blog-post] Calling Lovable AI with PATCH V6 prompt...');

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

    // 7. Generate HERO image (ultra-realistic, no text)
    const heroImageUrl = await generateHeroImage(selectedTopic.title_base, selectedTopic.pillar, selectedTopic.slug, lovableApiKey!, supabaseUrl, supabaseKey);
    qualityGateReport.checks.has_hero_image = !!heroImageUrl;
    
    // 7b. Generate INLINE image (for content body)
    let inlineImageUrl: string | null = null;
    if (heroImageUrl) {
      // Only generate inline if hero succeeded (to save API calls)
      inlineImageUrl = await generateInlineImage(selectedTopic.title_base, selectedTopic.pillar, selectedTopic.slug, lovableApiKey!, supabaseUrl, supabaseKey);
      qualityGateReport.checks.has_inline_images = !!inlineImageUrl;
      
      // Insert inline image into content after "En 2 minutos" or first H2
      if (inlineImageUrl) {
        const inlineAlt = `${selectedTopic.title_base} - concepto visual`;
        const imageMarkdown = `\n![${inlineAlt}](${inlineImageUrl})\n`;
        
        // Try to insert after "En 2 minutos" section
        const en2MinMatch = contentMd.match(/^## En 2 minutos.*?\n\n(?:[-*].*\n)+/m);
        if (en2MinMatch && en2MinMatch.index !== undefined) {
          const insertPos = en2MinMatch.index + en2MinMatch[0].length;
          contentMd = contentMd.slice(0, insertPos) + imageMarkdown + contentMd.slice(insertPos);
          console.log('[generate-blog-post] Inline image inserted after "En 2 minutos"');
        } else {
          // Fallback: insert after first H2
          const firstH2Match = contentMd.match(/^## .*?\n\n/m);
          if (firstH2Match && firstH2Match.index !== undefined) {
            const insertPos = firstH2Match.index + firstH2Match[0].length;
            contentMd = contentMd.slice(0, insertPos) + imageMarkdown + contentMd.slice(insertPos);
            console.log('[generate-blog-post] Inline image inserted after first H2');
          }
        }
      }
    } else {
      qualityGateReport.checks.has_inline_images = false;
    }

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

    // 8.5. Select category with rotation (12-cluster system)
    const selectedCategory = await selectNextCategory(supabase);
    console.log('[generate-blog-post] Assigned category:', selectedCategory);

    // Generate schema JSON-LD - use CANONICAL_DOMAIN
    const schemaJsonld = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": selectedTopic.title_base,
      "description": metaDescription,
      "image": heroImageUrl || `${CANONICAL_DOMAIN}/og-blog-default.jpg`,
      "datePublished": new Date().toISOString(),
      "dateModified": new Date().toISOString(),
      "author": {
        "@type": "Person",
        "name": "Equipo VistaCEO",
        "url": `${CANONICAL_DOMAIN}/about`
      },
      "publisher": {
        "@type": "Organization",
        "name": "VistaCEO",
        "logo": {
          "@type": "ImageObject",
          "url": `${CANONICAL_DOMAIN}/favicon.png`
        }
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": `${CANONICAL_DOMAIN}/blog/${selectedTopic.slug}`
      },
      "wordCount": wordCountTotal,
      "inLanguage": "es",
      "articleSection": BLOG_CLUSTERS[selectedCategory]?.label || 'Tendencias'
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
        category: selectedCategory, // 12-cluster system
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
        author_url: `${CANONICAL_DOMAIN}/about`,
        hero_image_url: heroImageUrl,
        image_alt_text: `Imagen ilustrativa: ${selectedTopic.title_base}`,
        canonical_url: `${CANONICAL_DOMAIN}/blog/${selectedTopic.slug}`,
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
      notes: `PATCH V6: Published "${selectedTopic.title_base}" for LATAM (score: ${qualityGateReport.score}%)`
    });

    // 13. Generate OG/SEO page for social sharing (async, non-blocking)
    const triggerOGGeneration = async () => {
      try {
        console.log('[generate-blog-post] Generating OG page for post:', newPost.slug);
        
        const response = await fetch(`${supabaseUrl}/functions/v1/generate-blog-og`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ post_id: newPost.id }),
        });
        
        const result = await response.json();
        console.log('[generate-blog-post] OG generation result:', result);
      } catch (error) {
        console.error('[generate-blog-post] OG generation error:', error);
      }
    };
    
    // 14. Trigger LinkedIn auto-publish (async, non-blocking)
    const triggerLinkedInPublish = async () => {
      try {
        console.log('[generate-blog-post] Triggering LinkedIn publish for post:', newPost.id);
        
        const response = await fetch(`${supabaseUrl}/functions/v1/linkedin-publish`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ post_id: newPost.id }),
        });
        
        const result = await response.json();
        console.log('[generate-blog-post] LinkedIn publish result:', result);
      } catch (error) {
        console.error('[generate-blog-post] LinkedIn publish error:', error);
      }
    };
    
    // Trigger site deploy for SSG regeneration
    const triggerSiteDeploy = async () => {
      try {
        console.log('[generate-blog-post] Triggering site deploy for SSG regeneration');
        
        const response = await fetch(`${supabaseUrl}/functions/v1/trigger-site-deploy`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            post_id: newPost.id,
            trigger_reason: 'blog_published'
          }),
        });
        
        const result = await response.json();
        console.log('[generate-blog-post] Site deploy trigger result:', result);
      } catch (error) {
        console.error('[generate-blog-post] Site deploy trigger error:', error);
      }
    };
    
    // Fire all tasks in parallel - don't await
    Promise.all([
      triggerOGGeneration().catch(err => console.error('[generate-blog-post] OG background error:', err)),
      triggerLinkedInPublish().catch(err => console.error('[generate-blog-post] LinkedIn background error:', err)),
      triggerSiteDeploy().catch(err => console.error('[generate-blog-post] Deploy background error:', err))
    ]);

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
      quality_gate: qualityGateReport,
      linkedin_queued: true
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
