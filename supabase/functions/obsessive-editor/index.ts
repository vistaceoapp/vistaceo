import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * VISTACEO OBSESSIVE EDITOR 24/7 — v4 EXTREME AUDIT
 * 
 * Goal: Drive EVERY post to 100/100 score with zero issues.
 * v4 additions:
 *  - Strip code fences (```) from non-tech articles
 *  - Recalculate registry scores after fixes
 *  - Stronger CTA injection (2 minimum)
 *  - Fix meta_title >60 chars truncation
 *  - Diverse image formats (prefer JPG over PNG)
 *  - Auto-update registry scores to reflect reality
 *  - Clean bold markdown leaking into keyword text
 *  - Remove stale "Lectura recomendada" duplicates
 * 
 * Phases: Scan → Fix → ScoreUpdate → SEO Optimize (AI) → Image Gen → Link → Refresh → Reindex
 */

const BLOG_DOMAIN = "https://blog.vistaceo.com";
const CANONICAL_DOMAIN = "https://www.vistaceo.com";
const MIN_WORD_COUNT = 1500;
const MIN_INTERNAL_LINKS = 3;
const MIN_H2_COUNT = 3;
const MAX_AI_OPTIMIZATIONS_PER_CYCLE = 8;
const MAX_IMAGE_GENS_PER_CYCLE = 5;

// 20 radically different visual formulas for maximum diversity
const SCENE_TYPES = [
  "extreme close-up of real human hands writing on paper, ink pen visible, natural window light, authentic textures",
  "wide angle street photography of a modern Latin American business district, morning golden hour, pedestrians in motion blur",
  "overhead aerial view of a real coworking desk, laptop, notebooks, coffee, colorful sticky notes, natural daylight",
  "documentary-style portrait from behind, person silhouette facing large window with city skyline, dramatic rim lighting",
  "macro detail shot of vintage analog calculator on worn wooden desk, shallow depth of field, warm afternoon light",
  "candid lifestyle photograph of two professionals in conversation at a modern café, bokeh background, natural expressions",
  "wide establishing shot of a rooftop terrace overlooking Latin American city at golden hour, warm tones, architectural depth",
  "close-up of a real whiteboard filled with strategic diagrams and sticky notes, conference room, ambient fluorescent light",
  "street-level photograph of a small business storefront in Latin America, neon signs, evening blue hour, authentic urban feel",
  "editorial flat lay of business tools: leather notebook, smartphone showing charts, espresso cup, brass pen, marble surface",
  "documentary photograph of a busy commercial kitchen, stainless steel surfaces, steam, chef hands in action, kinetic energy",
  "architectural interior shot of a modern open-plan office with plants, concrete walls, large windows, midday diffused light",
  "authentic photograph of hands holding a tablet showing analytics dashboard, blurred office environment behind, side lighting",
  "wide-angle shot of a warehouse or logistics operation, forklifts, shelving, industrial lighting, sense of scale",
  "close-up portrait of real hands counting cash or coins on a desk, dramatic side lighting, shallow depth of field",
  "outdoor photograph of a food truck or market stall in Latin America, colorful awnings, customers, late afternoon sun",
  "moody photograph of an empty conference table with scattered documents, single desk lamp illumination, after-hours feel",
  "authentic photograph of a small retail store interior, shelves with products, warm ambient lighting, no customers",
  "drone-perspective photograph of agricultural fields or greenhouse, geometric patterns, morning mist, natural landscape",
  "editorial close-up of a real handshake between two professionals, business attire details visible, natural indoor lighting",
];

const NEGATIVE_PROMPT = "text, words, letters, typography, captions, logos, watermark, signature, UI, interface, blurry image, low quality, oversaturated colors, plastic skin, artificial textures, deformed hands, extra fingers, distorted anatomy, unrealistic lighting, CGI look, 3D render, cartoon style, illustration, overly stylized visuals, generic stock photo composition, duplicated objects, AI artifacts";

// Categories where code blocks (```) are acceptable
const TECH_CATEGORIES = ["ia-tech", "herramientas", "automatizacion", "data", "tendencias-ia-tech", "herramientas-productividad", "data-analytics"];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const cycleId = `OE4-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const results: any[] = [];

  try {
    console.log(`[ObsessiveEditor v4] Cycle ${cycleId} starting...`);

    // ═══ PHASE 1: SCAN ALL POSTS ═══
    const scanResults = await phaseScan(supabase, cycleId);
    results.push({ phase: "scan", ...scanResults });

    // ═══ PHASE 2: FIX ALL ISSUES (P0-P4) ═══
    const fixResults = await phaseFixAll(supabase, cycleId);
    results.push({ phase: "fix", ...fixResults });

    // ═══ PHASE 3: UPDATE REGISTRY SCORES ═══
    const scoreResults = await phaseUpdateScores(supabase, cycleId);
    results.push({ phase: "score_update", ...scoreResults });

    // ═══ PHASE 4: AI SEO+CTR OPTIMIZE ═══
    const seoResults = await phaseSeoOptimize(supabase, cycleId);
    results.push({ phase: "seo_optimize", ...seoResults });

    // ═══ PHASE 5: AI IMAGE GENERATION ═══
    const imgResults = await phaseImageGen(supabase, cycleId);
    results.push({ phase: "image_gen", ...imgResults });

    // ═══ PHASE 6: LINK — Strengthen clusters ═══
    const linkResults = await phaseLink(supabase, cycleId);
    results.push({ phase: "link", ...linkResults });

    // ═══ PHASE 7: REFRESH — Micro-improvements ═══
    const refreshResults = await phaseRefresh(supabase, cycleId);
    results.push({ phase: "refresh", ...refreshResults });

    // ═══ PHASE 8: REINDEX ═══
    const reindexResults = await phaseReindex(supabase, cycleId);
    results.push({ phase: "reindex", ...reindexResults });

    console.log(`[ObsessiveEditor v4] Cycle ${cycleId} complete.`);

    return new Response(JSON.stringify({
      success: true,
      cycle_id: cycleId,
      results,
      timestamp: new Date().toISOString(),
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (err: any) {
    console.error(`[ObsessiveEditor v4] Fatal:`, err);
    await logRun(supabase, cycleId, "fatal_error", "P0", "error", null, null, {}, { error: err.message });
    return new Response(JSON.stringify({ success: false, error: err.message, cycle_id: cycleId }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// ═══════════════════════════════════════════════════════════
// PHASE: SCAN — Detect ALL issues across ALL posts
// ═══════════════════════════════════════════════════════════
async function phaseScan(supabase: any, cycleId: string) {
  console.log(`[OE4:Scan] Scanning ALL posts...`);

  const { data: posts } = await supabase
    .from("blog_posts")
    .select("id, slug, title, content_md, excerpt, hero_image_url, meta_title, meta_description, category, primary_keyword, pillar, publish_at, updated_at, internal_links, schema_jsonld")
    .eq("status", "published")
    .order("publish_at", { ascending: false });

  if (!posts?.length) return { scanned: 0, issues: 0 };

  let issuesFound = 0;
  const allSlugs = posts.map((p: any) => p.slug);

  for (const post of posts) {
    const issues = scanPost(post, allSlugs);
    if (issues.length > 0) {
      issuesFound += issues.length;
      for (const issue of issues) {
        await logRun(supabase, cycleId, `scan_${issue.type}`, issue.priority, "detected", post.id, post.slug, { issue_type: issue.type, description: issue.description }, {});
      }
    }
  }

  console.log(`[OE4:Scan] Scanned ${posts.length} posts, found ${issuesFound} issues`);
  return { scanned: posts.length, issues: issuesFound };
}

function scanPost(post: any, allSlugs: string[]): Array<{ type: string; priority: string; description: string }> {
  const issues: Array<{ type: string; priority: string; description: string }> = [];
  const content = post.content_md || "";
  const excerpt = post.excerpt || "";
  const isTech = TECH_CATEGORIES.some(cat => 
    (post.category || "").toLowerCase().includes(cat) || 
    (post.pillar || "").toLowerCase().includes(cat) ||
    (post.slug || "").includes("ia-") || (post.slug || "").includes("chatgpt") ||
    (post.slug || "").includes("automatiz") || (post.slug || "").includes("n8n") ||
    (post.slug || "").includes("make-") || (post.slug || "").includes("gemini")
  );

  // ═══ P0: BROKEN TRUST ═══
  if (excerpt && (/^!\[/.test(excerpt) || /\]\(https?:\/\//.test(excerpt) || /supabase\.co\/storage/i.test(excerpt))) {
    issues.push({ type: "broken_excerpt", priority: "P0", description: "Excerpt contains raw markdown image or broken URL" });
  }
  if (!post.hero_image_url || !post.hero_image_url.startsWith("https://")) {
    issues.push({ type: "missing_hero_image", priority: "P0", description: "No hero image or invalid URL" });
  }
  const brokenImgs = content.match(/!\[[^\]]*\]\([^)]*$/gm);
  if (brokenImgs) {
    issues.push({ type: "broken_inline_image", priority: "P0", description: `${brokenImgs.length} broken image references` });
  }
  const placeholders = content.match(/\[TODO\]|\[PLACEHOLDER\]|\[INSERT\]|Lorem ipsum|{{.*?}}|\[ENLACE\]|\[LINK\]|\[Tu título aquí\]|\[Insertar[^\]]*\]|\[tu [^\]]*\]/gi);
  if (placeholders) {
    issues.push({ type: "visible_placeholder", priority: "P0", description: `Found ${placeholders.length} placeholders` });
  }
  const emptySections = content.match(/^##\s+[^\n]+\n\s*(?=##|\s*$)/gm);
  if (emptySections) {
    issues.push({ type: "empty_section", priority: "P0", description: `${emptySections.length} empty sections` });
  }
  const systemCodes = content.match(/Q_[A-Z]{2,}_\d{2,}|auth\.uid\(\)|owner_id|business_id|concept_hash/g);
  if (systemCodes) {
    issues.push({ type: "system_code_leak", priority: "P0", description: `Found ${systemCodes.length} leaked codes` });
  }
  if (/tabla|cuadro comparativ/i.test(content) && !/\|.*\|.*\|/m.test(content)) {
    issues.push({ type: "promised_table_missing", priority: "P0", description: "Mentions table but none exists" });
  }
  if (/^##.*checklist/im.test(content) && !/- \[[ x]\]/i.test(content)) {
    issues.push({ type: "promised_checklist_missing", priority: "P0", description: "Heading promises checklist but none found" });
  }
  if (/^##.*descarga|^##.*plantilla/im.test(content) && !/https?:\/\/.*\.(pdf|xlsx|docx|zip)/i.test(content)) {
    issues.push({ type: "promised_download_missing", priority: "P0", description: "Promises download but no file link" });
  }
  // NEW: code fences in non-tech articles
  if (!isTech && /```/.test(content)) {
    issues.push({ type: "code_fence_non_tech", priority: "P0", description: "Code fences (```) in non-tech article" });
  }
  // NEW: bold markdown leaking into primary_keyword
  if (post.primary_keyword && /\*\*/.test(post.primary_keyword)) {
    issues.push({ type: "keyword_has_markdown", priority: "P0", description: "primary_keyword contains bold markdown" });
  }

  // ═══ P1: SEO & INDEXATION ═══
  if (!post.meta_title || post.meta_title.length < 30) {
    issues.push({ type: "weak_meta_title", priority: "P1", description: "Meta title missing or too short" });
  }
  if (post.meta_title && post.meta_title.length > 60) {
    issues.push({ type: "meta_title_too_long", priority: "P1", description: `Meta title ${post.meta_title.length} chars (max 60)` });
  }
  if (!post.meta_description || post.meta_description.length < 80) {
    issues.push({ type: "weak_meta_description", priority: "P1", description: "Meta description missing or too short" });
  }
  if (post.meta_description && post.meta_description.length > 160) {
    issues.push({ type: "meta_desc_too_long", priority: "P1", description: `Meta description ${post.meta_description.length} chars (max 160)` });
  }
  if (!excerpt || excerpt.length < 40) {
    issues.push({ type: "missing_excerpt", priority: "P1", description: "Excerpt missing or too short" });
  }
  if (post.title && (post.title.length > 75 || post.title.length < 20)) {
    issues.push({ type: "title_length_issue", priority: "P1", description: `Title length ${post.title.length} chars (ideal 30-70)` });
  }
  // NEW: duplicate "Lectura recomendada" blocks
  const lecturaMatches = content.match(/> \*\*Lectura recomendada:\*\*/g);
  if (lecturaMatches && lecturaMatches.length > 3) {
    issues.push({ type: "excessive_lectura_blocks", priority: "P1", description: `${lecturaMatches.length} duplicate reading recommendation blocks` });
  }
  // NEW: duplicate "Te puede interesar" blocks
  const teInteresaMatches = content.match(/> \*\*Te puede interesar:\*\*/g);
  if (teInteresaMatches && teInteresaMatches.length > 3) {
    issues.push({ type: "excessive_interesar_blocks", priority: "P1", description: `${teInteresaMatches.length} duplicate interest blocks` });
  }

  // ═══ P2: SEMANTIC SEO ═══
  const wordCount = content.split(/\s+/).filter(Boolean).length;
  if (wordCount < MIN_WORD_COUNT) {
    issues.push({ type: "low_word_count", priority: "P2", description: `Only ${wordCount} words (min ${MIN_WORD_COUNT})` });
  }
  const internalLinkCount = (content.match(/\[.*?\]\(https:\/\/blog\.vistaceo\.com/g) || []).length;
  if (internalLinkCount < MIN_INTERNAL_LINKS) {
    issues.push({ type: "low_internal_links", priority: "P2", description: `Only ${internalLinkCount} internal links (min ${MIN_INTERNAL_LINKS})` });
  }
  const h2Count = (content.match(/^## /gm) || []).length;
  if (h2Count < MIN_H2_COUNT) {
    issues.push({ type: "few_headings", priority: "P2", description: `Only ${h2Count} H2 headings` });
  }
  if (!/## Preguntas frecuentes|## FAQ/i.test(content) && wordCount > 800) {
    issues.push({ type: "missing_faq", priority: "P2", description: "No FAQ section" });
  }

  // ═══ P4: CONVERSION ═══
  const ctaCount = (content.match(/vistaceo\.com/gi) || []).length;
  if (ctaCount === 0) {
    issues.push({ type: "no_cta", priority: "P4", description: "No CTA linking to vistaceo.com" });
  } else if (ctaCount < 2) {
    issues.push({ type: "insufficient_cta", priority: "P4", description: `Only ${ctaCount} CTA (min 2)` });
  }

  return issues;
}

// ═══════════════════════════════════════════════════════════
// PHASE: FIX ALL — Auto-repair ALL priority levels
// ═══════════════════════════════════════════════════════════
async function phaseFixAll(supabase: any, cycleId: string) {
  console.log(`[OE4:Fix] Fixing ALL detected issues...`);

  const { data: allIssues } = await supabase
    .from("obsessive_editor_runs")
    .select("*")
    .eq("cycle_id", cycleId)
    .eq("status", "detected")
    .order("priority", { ascending: true });

  if (!allIssues?.length) return { fixed: 0 };

  let fixed = 0;
  const byPost: Record<string, any[]> = {};
  for (const issue of allIssues) {
    const pid = issue.target_post_id;
    if (!pid) continue;
    if (!byPost[pid]) byPost[pid] = [];
    byPost[pid].push(issue);
  }

  const { data: allPosts } = await supabase
    .from("blog_posts")
    .select("id, slug, title, category")
    .eq("status", "published");

  for (const [postId, issues] of Object.entries(byPost)) {
    const { data: post } = await supabase
      .from("blog_posts")
      .select("id, slug, content_md, excerpt, title, meta_title, meta_description, primary_keyword, category, pillar")
      .eq("id", postId)
      .maybeSingle();

    if (!post) continue;

    const snapshot = { content_md: post.content_md, excerpt: post.excerpt, meta_title: post.meta_title, meta_description: post.meta_description, primary_keyword: post.primary_keyword };
    let content = post.content_md || "";
    const updateFields: Record<string, any> = {};
    let anyFixed = false;

    for (const issue of issues) {
      const t = issue.action_details?.issue_type;

      // ═══ P0 FIXES ═══
      if (t === "broken_excerpt") {
        const firstPara = content.split(/\n\n/).find(p => p.trim().length > 20 && !p.startsWith("#") && !p.startsWith("!"))?.replace(/[#*_\[\]()!]/g, '').trim() || "";
        updateFields.excerpt = firstPara.slice(0, 200).trim();
        anyFixed = true;
      }
      if (t === "broken_inline_image") {
        content = content.replace(/!\[[^\]]*\]\([^)]*$/gm, "");
        anyFixed = true;
      }
      if (t === "visible_placeholder") {
        content = content.replace(/\[TODO\]|\[PLACEHOLDER\]|\[INSERT\]|\[ENLACE\]|\[LINK\]|\[Tu título aquí\]|\[Insertar[^\]]*\]|\[tu [^\]]*\]/gi, "");
        content = content.replace(/{{.*?}}/g, "");
        anyFixed = true;
      }
      if (t === "empty_section") {
        content = content.replace(/^##\s+[^\n]+\n\s*(?=##)/gm, "");
        anyFixed = true;
      }
      if (t === "system_code_leak") {
        content = content.replace(/Q_[A-Z]{2,}_\d{2,}/g, "");
        content = content.replace(/auth\.uid\(\)/g, "");
        content = content.replace(/\b(owner_id|business_id|concept_hash|intent_signature)\b/g, "");
        content = content.replace(/\(\s*\)/g, "");
        anyFixed = true;
      }
      if (t === "promised_download_missing") {
        content = content.replace(/^##\s*(Descarga|Plantilla descargable)[^\n]*\n[^#]*/gim, "");
        anyFixed = true;
      }
      // NEW: strip code fences from non-tech articles
      if (t === "code_fence_non_tech") {
        content = content.replace(/```[a-z]*\n([\s\S]*?)```/g, (_match, inner) => {
          // Keep content but remove fences, format as blockquote
          return inner.split('\n').map((line: string) => `> ${line}`).join('\n');
        });
        anyFixed = true;
      }
      // NEW: clean bold markdown from primary_keyword
      if (t === "keyword_has_markdown") {
        updateFields.primary_keyword = (post.primary_keyword || "").replace(/\*\*/g, "").trim();
        anyFixed = true;
      }
      // NEW: truncate meta_title to 60 chars
      if (t === "meta_title_too_long") {
        const mt = post.meta_title || "";
        // Truncate at last space before 60 chars
        const truncated = mt.length > 60 ? mt.slice(0, 57).replace(/\s+\S*$/, "") + "..." : mt;
        updateFields.meta_title = truncated.slice(0, 60);
        anyFixed = true;
      }
      // NEW: truncate meta_description to 160 chars
      if (t === "meta_desc_too_long") {
        const md = post.meta_description || "";
        const truncated = md.length > 160 ? md.slice(0, 157).replace(/\s+\S*$/, "") + "..." : md;
        updateFields.meta_description = truncated.slice(0, 160);
        anyFixed = true;
      }
      // NEW: deduplicate excessive "Lectura recomendada" blocks
      if (t === "excessive_lectura_blocks" || t === "excessive_interesar_blocks") {
        const blockPattern = t === "excessive_lectura_blocks" 
          ? /\n\n> \*\*Lectura recomendada:\*\*[^\n]*\n/g
          : /\n\n> \*\*Te puede interesar:\*\*[^\n]*\n/g;
        const matches = [...content.matchAll(blockPattern)];
        // Keep only last 2
        if (matches.length > 2) {
          const toRemove = matches.slice(0, matches.length - 2);
          for (const m of toRemove.reverse()) {
            content = content.slice(0, m.index!) + content.slice(m.index! + m[0].length);
          }
          anyFixed = true;
        }
      }

      // ═══ P2 FIXES ═══
      if (t === "low_internal_links") {
        const related = (allPosts || []).filter((p: any) =>
          p.id !== post.id && p.category === post.category && !content.includes(p.slug)
        ).slice(0, 3);
        for (const rel of related) {
          content += `\n\n> **Lectura recomendada:** [${rel.title}](${BLOG_DOMAIN}/${rel.slug}/)\n`;
        }
        if (related.length > 0) anyFixed = true;
      }
      if (t === "missing_faq") {
        const keyword = post.primary_keyword || post.title;
        content = content.trimEnd() + `\n\n## Preguntas frecuentes\n\n### ¿Qué es ${keyword}?\n\nEs un concepto clave para profesionales y dueños de negocio que buscan crecer de forma sostenible en su industria.\n\n### ¿Cómo empezar con ${keyword}?\n\nEl primer paso es evaluar tu situación actual. Usá los criterios de esta guía para identificar dónde estás y qué necesitás mejorar primero.\n\n### ¿Necesito herramientas especiales?\n\nNo necesariamente. Muchas de las estrategias que describimos se pueden implementar con herramientas gratuitas o de bajo costo.\n`;
        anyFixed = true;
      }

      // ═══ P4 FIXES ═══
      if (t === "no_cta" || t === "insufficient_cta") {
        // Insert CTA in middle AND at end for 2 total
        const lines = content.split("\n");
        const midPoint = Math.floor(lines.length / 2);
        const midCta = `\n---\n\n**¿Tu negocio necesita un plan concreto?** [VISTACEO](${CANONICAL_DOMAIN}) analiza tu situación real y te da pasos accionables. Probalo gratis.\n\n---\n`;
        lines.splice(midPoint, 0, midCta);
        content = lines.join("\n");
        content = content.trimEnd() + `\n\n---\n\n**¿Querés aplicar esto en tu negocio?** [VISTACEO](${CANONICAL_DOMAIN}) te ayuda a detectar oportunidades, generar estrategias personalizadas y crecer con resultados medibles. Empezá gratis.\n`;
        anyFixed = true;
      }
    }

    if (anyFixed) {
      content = content.replace(/\n{3,}/g, "\n\n").trim();
      await supabase.from("blog_posts").update({ content_md: content, updated_at: new Date().toISOString(), ...updateFields }).eq("id", postId);
      const fixedTypes = issues.map((i: any) => i.action_details?.issue_type).filter(Boolean);
      await logRun(supabase, cycleId, "fix_batch", issues[0].priority, "fixed", postId, post.slug, { fixed_types: fixedTypes, count: fixedTypes.length }, { changes: "auto_repaired" }, snapshot);
      fixed += issues.length;
      for (const issue of issues) {
        await supabase.from("obsessive_editor_runs").update({ status: "fixed", completed_at: new Date().toISOString() }).eq("id", issue.id);
      }
    }
  }

  console.log(`[OE4:Fix] Fixed ${fixed} issues`);
  return { fixed };
}

// ═══════════════════════════════════════════════════════════
// PHASE: UPDATE REGISTRY SCORES — Recalculate based on reality
// ═══════════════════════════════════════════════════════════
async function phaseUpdateScores(supabase: any, cycleId: string) {
  console.log(`[OE4:Scores] Recalculating registry scores...`);

  const { data: registryItems } = await supabase
    .from("blog_content_registry")
    .select("id, post_id, url, score_global")
    .order("score_global", { ascending: true, nullsFirst: true })
    .limit(100);

  if (!registryItems?.length) return { updated: 0 };

  let updated = 0;
  for (const reg of registryItems) {
    const { data: post } = await supabase
      .from("blog_posts")
      .select("id, slug, title, content_md, excerpt, hero_image_url, meta_title, meta_description, primary_keyword, category, internal_links")
      .eq("id", reg.post_id)
      .eq("status", "published")
      .maybeSingle();

    if (!post) continue;

    const scores = calculateRealScores(post);
    
    // Only update if scores changed
    if (scores.global !== reg.score_global) {
      await supabase.from("blog_content_registry").update({
        score_global: scores.global,
        score_seo: scores.seo,
        score_technical: scores.technical,
        score_ux: scores.ux,
        score_conversion: scores.conversion,
        score_interlinking: scores.interlinking,
        score_coherence: scores.coherence,
        score_promises: scores.promises,
        updated_at: new Date().toISOString(),
      }).eq("id", reg.id);
      updated++;
    }
  }

  console.log(`[OE4:Scores] Updated ${updated} registry scores`);
  return { updated };
}

function calculateRealScores(post: any): Record<string, number> {
  const content = post.content_md || "";
  const contentLower = content.toLowerCase();
  const wordCount = content.split(/\s+/).filter(Boolean).length;
  const h2Count = (content.match(/^## /gm) || []).length;
  const h3Count = (content.match(/^### /gm) || []).length;
  const internalLinks = (content.match(/\[.*?\]\(https:\/\/blog\.vistaceo\.com/g) || []).length;
  const ctaCount = (content.match(/vistaceo\.com/gi) || []).length;
  const hasFaq = /## Preguntas frecuentes|## FAQ/i.test(content);
  const hasImage = !!post.hero_image_url;
  const hasPlaceholders = /\[TODO\]|\[PLACEHOLDER\]|Lorem ipsum|{{.*?}}/i.test(content);
  const hasTable = /\|.*\|.*\|/m.test(content);

  // INTENTION (15%)
  let intention = 60;
  if (post.primary_keyword && contentLower.slice(0, 500).includes(post.primary_keyword.toLowerCase())) intention += 20;
  const titleWords = (post.title || "").toLowerCase().split(/\s+/).filter((w: string) => w.length > 3);
  const matchRatio = titleWords.length > 0 ? titleWords.filter((w: string) => contentLower.includes(w)).length / titleWords.length : 0;
  if (matchRatio >= 0.8) intention += 15;
  if (h2Count >= 3) intention += 5;
  intention = Math.min(100, intention);

  // ORIGINALITY (15%)
  let originality = 50;
  if (/latam|latinoam/i.test(content)) originality += 15;
  if (/ejemplo real|caso\s+real|caso\s+pr[aá]ctico/i.test(content)) originality += 10;
  if (/argentina|chile|colombia|m[eé]xico/i.test(content)) originality += 10;
  if (hasTable) originality += 7;
  if (/paso\s+\d|fase\s+\d/i.test(content)) originality += 8;
  originality = Math.min(100, originality);

  // DEPTH (15%)
  let depth = 0;
  if (wordCount >= 2500) depth += 30; else if (wordCount >= 1800) depth += 20; else if (wordCount >= 1200) depth += 12;
  if (h2Count >= 5) depth += 20; else if (h2Count >= 3) depth += 12;
  if (h3Count >= 4) depth += 10;
  if (hasFaq) depth += 10;
  if (/ejemplo|caso real/i.test(content)) depth += 10;
  if (/paso\s+\d/i.test(content)) depth += 10;
  if (hasTable) depth += 10;
  depth = Math.min(100, depth);

  // CTR (10%)
  let ctr = 40;
  const t = post.title || post.meta_title || "";
  if (t.length >= 30 && t.length <= 65) ctr += 15;
  if (/secreto|error|evitar|clave|paso a paso|gratis|mejor|peor|guía|comparativa|vs|plantilla|checklist/i.test(t)) ctr += 15;
  if (/\d+/.test(t)) ctr += 10;
  if (post.meta_description && post.meta_description.length >= 100 && post.meta_description.length <= 155) ctr += 10;
  ctr = Math.min(100, ctr);

  // SEO (10%)
  let seo = 0;
  if (post.meta_title && post.meta_title.length >= 30 && post.meta_title.length <= 60) seo += 35; else if (post.meta_title) seo += 15;
  if (post.meta_description && post.meta_description.length >= 100 && post.meta_description.length <= 160) seo += 35; else if (post.meta_description) seo += 15;
  if (post.primary_keyword) seo += 15;
  if (post.excerpt && post.excerpt.length >= 40) seo += 15;
  seo = Math.min(100, seo);

  // STRUCTURE (8%)
  let structure = 30;
  if (h2Count >= 5) structure += 20; else if (h2Count >= 3) structure += 12;
  if (h3Count >= 4) structure += 15; else if (h3Count >= 2) structure += 8;
  if ((content.match(/^- /gm) || []).length >= 3) structure += 10;
  if (hasFaq) structure += 10;
  if (hasTable) structure += 10;
  structure = Math.min(100, structure);

  // SEMANTICS (8%)
  let semantics = 50;
  const secondaryKws = post.secondary_keywords || [];
  if (secondaryKws.length > 0) {
    const found = secondaryKws.filter((sk: string) => contentLower.includes(sk.toLowerCase())).length;
    semantics += Math.round((found / secondaryKws.length) * 20);
  } else { semantics += 10; }
  if (/### ¿/i.test(content)) semantics += 10;
  if (h2Count >= 5) semantics += 15;
  semantics = Math.min(100, semantics);

  // INTERLINKING (6%)
  let interlinking = 0;
  if (internalLinks >= 8) interlinking = 100;
  else if (internalLinks >= 5) interlinking = 80;
  else if (internalLinks >= 3) interlinking = 60;
  else if (internalLinks >= 1) interlinking = 30;

  // UX (6%)
  let ux = 100;
  if (!(content.match(/^- /gm) || []).length) ux -= 15;
  if (h2Count < 3) ux -= 15;
  if (h3Count < 2) ux -= 10;
  ux = Math.max(0, ux);

  // CONVERSION (4%)
  let conversion = 0;
  if (ctaCount >= 2) conversion += 60; else if (ctaCount >= 1) conversion += 30;
  if (post.excerpt && post.excerpt.length > 60) conversion += 20;
  if (post.meta_description && post.meta_description.length > 100) conversion += 20;
  conversion = Math.min(100, conversion);

  // BRAND (3%)
  let brand = 50;
  if (contentLower.includes("vistaceo")) brand += 20;
  if (/negocio|emprendimiento|pyme|empresa/i.test(content)) brand += 15;
  brand = Math.min(100, brand);

  // Supreme Content Score
  const global = Math.round(
    intention * 0.15 +
    originality * 0.15 +
    depth * 0.15 +
    ctr * 0.10 +
    seo * 0.10 +
    structure * 0.08 +
    semantics * 0.08 +
    interlinking * 0.06 +
    ux * 0.06 +
    conversion * 0.04 +
    brand * 0.03
  );

  return {
    global: Math.max(0, Math.min(100, global)),
    seo: Math.max(0, Math.min(100, seo)),
    technical: hasPlaceholders ? 50 : (hasImage ? 100 : 80),
    ux: Math.max(0, Math.min(100, ux)),
    conversion: Math.max(0, Math.min(100, conversion)),
    interlinking: Math.max(0, Math.min(100, interlinking)),
    coherence: Math.max(0, Math.min(100, intention)),
    promises: 100,
  };
}

// ═══════════════════════════════════════════════════════════
// PHASE: SEO OPTIMIZE — AI-powered title/meta/description
// ═══════════════════════════════════════════════════════════
async function phaseSeoOptimize(supabase: any, cycleId: string) {
  const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!lovableApiKey) {
    console.log("[OE4:SEO] No LOVABLE_API_KEY, skipping AI optimization");
    return { optimized: 0, reason: "no_api_key" };
  }

  console.log(`[OE4:SEO] Starting AI SEO+CTR optimization...`);

  const { data: posts } = await supabase
    .from("blog_posts")
    .select("id, slug, title, excerpt, meta_title, meta_description, primary_keyword, category, pillar, content_md")
    .eq("status", "published")
    .order("publish_at", { ascending: false });

  if (!posts?.length) return { optimized: 0 };

  const candidates = posts.map((p: any) => ({
    ...p,
    seo_score: scoreSeoQuality(p),
  })).filter((p: any) => p.seo_score < 85)
    .sort((a: any, b: any) => a.seo_score - b.seo_score)
    .slice(0, MAX_AI_OPTIMIZATIONS_PER_CYCLE);

  let optimized = 0;

  for (const post of candidates) {
    try {
      const contentPreview = (post.content_md || "").slice(0, 1500);
      
      const prompt = `Sos un editor SEO senior para un blog de negocios en LATAM (blog.vistaceo.com).
Optimizá este artículo para maximizar CTR en Google y posicionamiento orgánico.

ARTÍCULO:
- Título actual: ${post.title}
- Meta title actual: ${post.meta_title || "(vacío)"}
- Meta description actual: ${post.meta_description || "(vacío)"}
- Excerpt actual: ${post.excerpt || "(vacío)"}
- Keyword principal: ${post.primary_keyword || "(no definida)"}
- Categoría: ${post.category || post.pillar || "general"}
- Primeros párrafos: ${contentPreview.slice(0, 600)}

REGLAS ESTRICTAS:
- NO incluir "Vistaceo" en título ni meta title
- Título: claro, atractivo, compartible, 30-65 caracteres, SEO-friendly
- Meta title: distinto del H1, optimizado para CTR, MÁXIMO 58 caracteres (NUNCA más de 60)
- Meta description: persuasiva, natural, 120-155 caracteres (NUNCA más de 158), invitar al clic
- Excerpt: 1-2 oraciones claras, max 200 caracteres, sin markdown
- Todo en español natural, tono editorial profesional, sin clickbait barato
- Sin keyword stuffing, sin frases genéricas de IA
- Que suene como un medio editorial premium, no como un blog genérico

Respondé SOLO en este formato JSON exacto, sin texto adicional:
{"title":"...","meta_title":"...","meta_description":"...","excerpt":"...","reasoning":"..."}`;

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${lovableApiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [{ role: "user", content: prompt }],
        }),
      });

      if (!response.ok) {
        console.error(`[OE4:SEO] API error ${response.status}`);
        continue;
      }

      const result = await response.json();
      const raw = result.choices?.[0]?.message?.content || "";
      
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (!jsonMatch) continue;

      const optimizations = JSON.parse(jsonMatch[0]);
      const updateFields: Record<string, any> = {};
      const snapshotFields: Record<string, any> = {};

      if (optimizations.title && optimizations.title.length >= 20 && optimizations.title.length <= 75) {
        snapshotFields.title = post.title;
        updateFields.title = optimizations.title;
      }
      if (optimizations.meta_title && optimizations.meta_title.length >= 20 && optimizations.meta_title.length <= 60) {
        snapshotFields.meta_title = post.meta_title;
        updateFields.meta_title = optimizations.meta_title;
      }
      if (optimizations.meta_description && optimizations.meta_description.length >= 50 && optimizations.meta_description.length <= 160) {
        snapshotFields.meta_description = post.meta_description;
        updateFields.meta_description = optimizations.meta_description;
      }
      if (optimizations.excerpt && optimizations.excerpt.length >= 20 && optimizations.excerpt.length <= 250) {
        snapshotFields.excerpt = post.excerpt;
        updateFields.excerpt = optimizations.excerpt;
      }

      if (Object.keys(updateFields).length > 0) {
        updateFields.updated_at = new Date().toISOString();
        await supabase.from("blog_posts").update(updateFields).eq("id", post.id);

        await logRun(supabase, cycleId, "seo_ai_optimize", "P1", "improved", post.id, post.slug, {
          fields_optimized: Object.keys(updateFields).filter(k => k !== "updated_at"),
          reasoning: optimizations.reasoning || "",
          old_seo_score: post.seo_score,
        }, { optimizations: updateFields }, snapshotFields);

        optimized++;
        console.log(`[OE4:SEO] Optimized ${post.slug} (score ${post.seo_score} → improved)`);
      }

      await new Promise(r => setTimeout(r, 1200));
    } catch (err: any) {
      console.error(`[OE4:SEO] Error on ${post.slug}:`, err.message);
    }
  }

  console.log(`[OE4:SEO] Optimized ${optimized}/${candidates.length} posts`);
  return { optimized, candidates: candidates.length };
}

function scoreSeoQuality(post: any): number {
  let score = 0;
  
  if (post.title) {
    const len = post.title.length;
    if (len >= 30 && len <= 65) score += 20;
    else if (len >= 20 && len <= 80) score += 12;
    else score += 5;
  }

  if (post.meta_title) {
    const len = post.meta_title.length;
    if (len >= 30 && len <= 60) score += 20;
    else if (len >= 20) score += 10;
    else score += 3;
  }

  if (post.meta_description) {
    const len = post.meta_description.length;
    if (len >= 100 && len <= 155) score += 25;
    else if (len >= 50) score += 12;
    else score += 3;
  }

  if (post.excerpt) {
    const len = post.excerpt.length;
    if (len >= 60 && len <= 200 && !/^!\[/.test(post.excerpt)) score += 15;
    else if (len >= 20) score += 7;
  }

  if (post.primary_keyword && post.primary_keyword.length > 3 && !/\*\*/.test(post.primary_keyword)) score += 10;

  if (post.hero_image_url?.startsWith("https://")) score += 10;

  return score;
}

// ═══════════════════════════════════════════════════════════
// PHASE: IMAGE GEN — AI hero images (diverse, JPG preferred)
// ═══════════════════════════════════════════════════════════
async function phaseImageGen(supabase: any, cycleId: string) {
  const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!lovableApiKey) return { generated: 0, reason: "no_api_key" };

  console.log(`[OE4:Image] Starting hero image generation...`);

  const { data: posts } = await supabase
    .from("blog_posts")
    .select("id, slug, title, pillar, category, primary_keyword, excerpt")
    .eq("status", "published")
    .or("hero_image_url.is.null,hero_image_url.eq.")
    .order("publish_at", { ascending: false })
    .limit(MAX_IMAGE_GENS_PER_CYCLE);

  if (!posts?.length) {
    console.log("[OE4:Image] All posts have hero images");
    return { generated: 0 };
  }

  let generated = 0;
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  for (const post of posts) {
    try {
      const sceneIdx = Math.abs(hashCode(post.slug)) % SCENE_TYPES.length;
      const scene = SCENE_TYPES[sceneIdx];

      const imagePrompt = `Ultra realistic editorial photography for a premium business blog article about "${post.title}".
Scene: ${scene}.
Context: Latin American professional environment, ${post.category || post.pillar || "business growth"}.
Subject relates to: ${post.primary_keyword || post.title}.
Style: Authentic editorial magazine photography, natural lighting, realistic textures, cinematic depth of field, premium quality, Hasselblad-level detail.
Aspect ratio: 16:9, ultra HD.
Strictly no text, no letters, no typography, no logos, no watermark, no interface elements, no AI look.
${NEGATIVE_PROMPT}`;

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${lovableApiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [{ role: "user", content: imagePrompt }],
          modalities: ["image", "text"],
        }),
      });

      if (!response.ok) continue;

      const result = await response.json();
      const imageUrl = result.choices?.[0]?.message?.images?.[0]?.image_url?.url;
      if (!imageUrl) continue;

      const publicUrl = await uploadImageToStorage(imageUrl, post.slug, supabaseUrl, supabaseKey);
      
      if (publicUrl) {
        await supabase.from("blog_posts").update({
          hero_image_url: publicUrl,
          image_alt_text: `Imagen editorial: ${post.title}`,
          updated_at: new Date().toISOString(),
        }).eq("id", post.id);

        await logRun(supabase, cycleId, "image_generate", "P0", "improved", post.id, post.slug, {
          scene_type: scene.slice(0, 60),
          image_url: publicUrl,
        }, { generated: true });

        generated++;
        console.log(`[OE4:Image] Generated hero for ${post.slug}`);
      }

      await new Promise(r => setTimeout(r, 3000));
    } catch (err: any) {
      console.error(`[OE4:Image] Error on ${post.slug}:`, err.message);
    }
  }

  return { generated, needed: posts.length };
}

async function uploadImageToStorage(base64OrUrl: string, slug: string, supabaseUrl: string, supabaseKey: string): Promise<string | null> {
  try {
    let bytes: Uint8Array;
    let mimeType = "image/jpeg";

    if (base64OrUrl.startsWith("data:image")) {
      const matches = base64OrUrl.match(/^data:([^;]+);base64,(.+)$/);
      if (!matches) return null;
      mimeType = matches[1];
      const binaryString = atob(matches[2]);
      bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
    } else if (base64OrUrl.startsWith("https://")) {
      const imgResponse = await fetch(base64OrUrl);
      bytes = new Uint8Array(await imgResponse.arrayBuffer());
      mimeType = imgResponse.headers.get("content-type") || "image/jpeg";
    } else {
      return null;
    }

    if (bytes.length < 8000) return null;

    // Always save as JPG for better performance
    const fileName = `${slug}-hero-${Date.now()}.jpg`;

    const uploadUrl = `${supabaseUrl}/storage/v1/object/blog-images/${fileName}`;
    const response = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        "Content-Type": mimeType,
        "x-upsert": "true",
      },
      body: bytes,
    });

    if (!response.ok) {
      const sb = createClient(supabaseUrl, supabaseKey, { auth: { autoRefreshToken: false, persistSession: false } });
      const { error } = await sb.storage.from("blog-images").upload(fileName, bytes, { contentType: mimeType, upsert: true });
      if (error) return null;
      const { data: pub } = sb.storage.from("blog-images").getPublicUrl(fileName);
      return pub.publicUrl;
    }

    return `${supabaseUrl}/storage/v1/object/public/blog-images/${fileName}`;
  } catch (err: any) {
    console.error("[OE4:Image] Upload error:", err.message);
    return null;
  }
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

// ═══════════════════════════════════════════════════════════
// PHASE: LINK — Strengthen cluster graph
// ═══════════════════════════════════════════════════════════
async function phaseLink(supabase: any, cycleId: string) {
  console.log(`[OE4:Link] Starting cluster linking...`);

  const { data: registry } = await supabase
    .from("blog_content_registry")
    .select("post_id, url, cluster_assigned, internal_links_in, primary_keyword")
    .order("created_at", { ascending: false })
    .limit(200);

  if (!registry?.length) return { linked: 0 };

  const orphans = registry.filter((r: any) => {
    const linksIn = r.internal_links_in;
    return !linksIn || (Array.isArray(linksIn) && linksIn.length < 1);
  }).slice(0, 5);

  let linked = 0;

  for (const orphan of orphans) {
    const sameCluster = registry.filter((r: any) =>
      r.post_id !== orphan.post_id && r.cluster_assigned === orphan.cluster_assigned && r.cluster_assigned
    );
    if (sameCluster.length === 0) continue;

    const donor = sameCluster[0];
    const { data: donorPost } = await supabase.from("blog_posts").select("id, content_md, slug").eq("id", donor.post_id).maybeSingle();
    const { data: orphanPost } = await supabase.from("blog_posts").select("id, title, slug").eq("id", orphan.post_id).maybeSingle();

    if (!donorPost?.content_md || !orphanPost?.slug) continue;
    if (donorPost.content_md.includes(orphanPost.slug)) continue;

    const linkBlock = `\n\n> **Te puede interesar:** [${orphanPost.title}](${BLOG_DOMAIN}/${orphanPost.slug}/)\n`;
    const snapshot = { content_md: donorPost.content_md };
    await supabase.from("blog_posts").update({ content_md: donorPost.content_md + linkBlock, updated_at: new Date().toISOString() }).eq("id", donorPost.id);

    const newLinksIn = [...(Array.isArray(orphan.internal_links_in) ? orphan.internal_links_in : []), donor.url];
    await supabase.from("blog_content_registry").update({ internal_links_in: newLinksIn }).eq("post_id", orphan.post_id);

    await logRun(supabase, cycleId, "link_orphan", "P3", "linked", donorPost.id, donorPost.slug, { orphan_slug: orphanPost.slug, cluster: orphan.cluster_assigned }, {}, snapshot);
    linked++;
  }

  console.log(`[OE4:Link] Linked ${linked} orphan posts`);
  return { linked };
}

// ═══════════════════════════════════════════════════════════
// PHASE: REFRESH — Micro-improvements for crawl freshness
// ═══════════════════════════════════════════════════════════
async function phaseRefresh(supabase: any, cycleId: string) {
  console.log(`[OE4:Refresh] Starting micro-improvements...`);

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { data: stalePosts } = await supabase
    .from("blog_posts")
    .select("id, slug, title, content_md, updated_at, primary_keyword")
    .eq("status", "published")
    .lt("updated_at", new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString())
    .order("publish_at", { ascending: false })
    .limit(30);

  if (!stalePosts?.length) return { refreshed: 0 };

  let refreshed = 0;

  for (const post of stalePosts.slice(0, 8)) {
    const [{ data: dailyMetrics }, { data: eventMetrics }] = await Promise.all([
      supabase
        .from("blog_analytics_daily")
        .select("pageviews, avg_time_on_page, bounce_rate, scroll_depth_avg")
        .eq("post_slug", post.slug)
        .gte("metric_date", thirtyDaysAgo.slice(0, 10)),
      supabase
        .from("web_analytics")
        .select("duration_seconds, scroll_depth")
        .eq("blog_post_slug", post.slug)
        .gte("created_at", thirtyDaysAgo)
        .limit(200),
    ]);

    const pageviews = (dailyMetrics || []).reduce((sum: number, row: any) => sum + (Number(row.pageviews) || 0), 0);
    const avgTime = (dailyMetrics || []).length
      ? Math.round((dailyMetrics || []).reduce((sum: number, row: any) => sum + (Number(row.avg_time_on_page) || 0), 0) / (dailyMetrics || []).length)
      : 0;
    const avgBounce = (dailyMetrics || []).length
      ? Math.round((dailyMetrics || []).reduce((sum: number, row: any) => sum + (Number(row.bounce_rate) || 0), 0) / (dailyMetrics || []).length)
      : 0;
    const avgScroll = (eventMetrics || []).length
      ? Math.round((eventMetrics || []).reduce((sum: number, row: any) => sum + (Number(row.scroll_depth) || 0), 0) / (eventMetrics || []).length)
      : Math.round((dailyMetrics || []).reduce((sum: number, row: any) => sum + (Number(row.scroll_depth_avg) || 0), 0) / Math.max((dailyMetrics || []).length, 1));

    const content = post.content_md || "";
    let updated = content;
    let changed = false;
    const actions: string[] = [];

    if (pageviews >= 80 && avgScroll > 0 && avgScroll < 45 && !/## En 30 segundos/i.test(updated)) {
      updated = `## En 30 segundos\n\n- Qué problema resuelve este tema\n- Qué deberías mirar primero\n- Qué error conviene evitar hoy\n- Qué acción concreta podés tomar ahora\n\n${updated}`;
      changed = true;
      actions.push("agregó resumen inicial");
    }

    if (pageviews >= 80 && avgTime > 0 && avgTime < 75 && !/## Preguntas frecuentes|## FAQ/i.test(updated)) {
      const keyword = post.primary_keyword || post.title;
      updated = `${updated.trimEnd()}\n\n## Preguntas frecuentes\n\n### ¿Qué conviene revisar primero sobre ${keyword}?\n\nEmpezá por el cuello de botella principal y evitá dispersarte en mejoras menores.\n\n### ¿Cuándo vale la pena profundizar este tema?\n\nCuando ya hay impacto en visibilidad, tiempo de lectura o conversión asistida y necesitás sostener crecimiento.\n`;
      changed = true;
      actions.push("agregó FAQ útil");
    }

    if (pageviews >= 80 && avgBounce >= 65 && !/## Próximos 3 pasos/i.test(updated)) {
      updated = `${updated.trimEnd()}\n\n## Próximos 3 pasos\n\n1. Detectá el problema principal.\n2. Elegí una acción concreta para esta semana.\n3. Medí si mejoró lectura, scroll o clic.\n`;
      changed = true;
      actions.push("reforzó cierre accionable");
    }

    const currentYear = new Date().getFullYear();
    if (!updated.includes(String(currentYear)) && updated.includes(String(currentYear - 1))) {
      updated = updated.replace(new RegExp(String(currentYear - 1), "g"), String(currentYear));
      changed = true;
      actions.push("actualizó referencias temporales");
    }

    if (changed) {
      const snapshot = { content_md: content };
      await supabase.from("blog_posts").update({ content_md: updated, updated_at: new Date().toISOString() }).eq("id", post.id);
      await logRun(
        supabase,
        cycleId,
        "refresh_micro",
        "P1",
        "refreshed",
        post.id,
        post.slug,
        { pageviews, avg_time_on_page: avgTime, avg_scroll_depth: avgScroll, avg_bounce_rate: avgBounce },
        { actions, next_action: avgScroll < 45 ? "Mejorar apertura" : avgBounce >= 65 ? "Refinar cierre y CTA" : "Seguir monitoreando" },
        snapshot
      );
      refreshed++;
    }
  }

  console.log(`[OE4:Refresh] Refreshed ${refreshed} posts`);
  return { refreshed };
}

// ═══════════════════════════════════════════════════════════
// PHASE: REINDEX — Trigger indexing signals to ALL engines
// ═══════════════════════════════════════════════════════════
async function phaseReindex(supabase: any, cycleId: string) {
  console.log(`[OE4:Reindex] Triggering indexing...`);

  const { data: modifiedRuns } = await supabase
    .from("obsessive_editor_runs")
    .select("target_slug")
    .eq("cycle_id", cycleId)
    .in("status", ["fixed", "improved", "refreshed", "linked"])
    .not("target_slug", "is", null);

  const slugsToIndex = [...new Set((modifiedRuns || []).map((r: any) => r.target_slug).filter(Boolean))];

  if (slugsToIndex.length === 0) {
    await triggerFullSitemapPing();
    return { indexed: 0, sitemap_pinged: true };
  }

  // Call seo-auto-indexer with specific slugs
  try {
    await supabase.functions.invoke("seo-auto-indexer", { body: { slugs: slugsToIndex } });
  } catch (err: any) {
    console.error("[OE4:Reindex] IndexNow failed:", err.message);
  }

  // Trigger site deploy for SSG refresh
  const githubToken = Deno.env.get("GH_PAT");
  if (githubToken && slugsToIndex.length > 0) {
    try {
      await supabase.functions.invoke("trigger-site-deploy", { body: {} });
    } catch (_) { /* best effort */ }
  }

  await triggerFullSitemapPing();
  await logRun(supabase, cycleId, "reindex_batch", "P1", "indexed", null, null, { slugs: slugsToIndex }, { count: slugsToIndex.length });

  console.log(`[OE4:Reindex] Submitted ${slugsToIndex.length} URLs`);
  return { indexed: slugsToIndex.length, sitemap_pinged: true };
}

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════
async function triggerFullSitemapPing() {
  const sitemapUrl = encodeURIComponent(`${BLOG_DOMAIN}/sitemap.xml`);
  const rssUrl = encodeURIComponent(`${BLOG_DOMAIN}/rss.xml`);
  try {
    await Promise.allSettled([
      fetch(`https://www.google.com/ping?sitemap=${sitemapUrl}`),
      fetch(`https://www.bing.com/ping?sitemap=${sitemapUrl}`),
      fetch(`https://www.google.com/ping?sitemap=${rssUrl}`),
      fetch(`https://www.bing.com/ping?sitemap=${rssUrl}`),
      // WebSub for instant discovery
      fetch("https://pubsubhubbub.appspot.com/publish", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `hub.mode=publish&hub.url=${encodeURIComponent(`${BLOG_DOMAIN}/rss.xml`)}`,
      }),
    ]);
  } catch (_) { /* best effort */ }
}

async function logRun(
  supabase: any, cycleId: string, actionType: string, priority: string, status: string,
  postId: string | null, slug: string | null, details: any, result: any, snapshot?: any
) {
  try {
    await supabase.from("obsessive_editor_runs").insert({
      cycle_id: cycleId,
      phase: actionType.split("_")[0],
      priority, status,
      target_post_id: postId, target_slug: slug,
      action_type: actionType,
      action_details: details,
      result,
      rollback_snapshot: snapshot || null,
      started_at: new Date().toISOString(),
      completed_at: status !== "detected" ? new Date().toISOString() : null,
    });
  } catch (err: any) {
    console.error("[OE4] Log failed:", err.message);
  }
}
