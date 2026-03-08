import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * VISTACEO OBSESSIVE EDITOR 24/7 — v3 SEO+CTR+IMAGE
 * 
 * Goal: Drive EVERY post to 100/100 score with zero issues.
 * Now includes AI-powered SEO optimization for titles, metas, and hero images.
 * 
 * Phases: Scan → Fix → SEO Optimize (AI) → Image Gen → Link → Refresh → Reindex
 */

const BLOG_DOMAIN = "https://blog.vistaceo.com";
const CANONICAL_DOMAIN = "https://www.vistaceo.com";
const MIN_WORD_COUNT = 1500;
const MIN_INTERNAL_LINKS = 3;
const MIN_H2_COUNT = 3;
const MAX_AI_OPTIMIZATIONS_PER_CYCLE = 5;
const MAX_IMAGE_GENS_PER_CYCLE = 3;

// Visual scene types for diversity
const SCENE_TYPES = [
  "editorial portrait from behind, person silhouette in modern office, natural window light",
  "documentary-style close-up of hands working on a real desk with papers, coffee, laptop",
  "macro detail shot of professional tools, textures, authentic materials, shallow depth of field",
  "wide angle real workspace, open floor plan, natural daylight, architectural depth",
  "overhead flat lay of real business documents, notebook, pen, coffee cup, authentic textures",
  "street-level candid shot, urban LATAM business district, morning light, movement blur",
  "real conference room glass walls, city skyline background, warm afternoon light",
  "authentic cafeteria or coworking space, natural interaction, bokeh background",
  "close-up of screen showing data charts, shallow DOF, real office environment behind",
  "wide establishing shot of modern building exterior, golden hour, professional atmosphere",
];

const NEGATIVE_PROMPT = "text, words, letters, typography, captions, logos, watermark, signature, UI, interface, blurry image, low quality, oversaturated colors, plastic skin, artificial textures, deformed hands, extra fingers, distorted anatomy, unrealistic lighting, CGI look, 3D render, cartoon style, illustration, overly stylized visuals, generic stock photo composition, duplicated objects, AI artifacts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const cycleId = `OE-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const results: any[] = [];

  try {
    console.log(`[ObsessiveEditor] Cycle ${cycleId} starting...`);

    // ═══ PHASE 1: SCAN ALL POSTS ═══
    const scanResults = await phaseScan(supabase, cycleId);
    results.push({ phase: "scan", ...scanResults });

    // ═══ PHASE 2: FIX ALL ISSUES (P0-P4) ═══
    const fixResults = await phaseFixAll(supabase, cycleId);
    results.push({ phase: "fix", ...fixResults });

    // ═══ PHASE 3: AI SEO+CTR OPTIMIZE ═══
    const seoResults = await phaseSeoOptimize(supabase, cycleId);
    results.push({ phase: "seo_optimize", ...seoResults });

    // ═══ PHASE 4: AI IMAGE GENERATION ═══
    const imgResults = await phaseImageGen(supabase, cycleId);
    results.push({ phase: "image_gen", ...imgResults });

    // ═══ PHASE 5: LINK — Strengthen clusters ═══
    const linkResults = await phaseLink(supabase, cycleId);
    results.push({ phase: "link", ...linkResults });

    // ═══ PHASE 6: REFRESH — Micro-improvements ═══
    const refreshResults = await phaseRefresh(supabase, cycleId);
    results.push({ phase: "refresh", ...refreshResults });

    // ═══ PHASE 7: REINDEX ═══
    const reindexResults = await phaseReindex(supabase, cycleId);
    results.push({ phase: "reindex", ...reindexResults });

    console.log(`[ObsessiveEditor] Cycle ${cycleId} complete.`);

    return new Response(JSON.stringify({
      success: true,
      cycle_id: cycleId,
      results,
      timestamp: new Date().toISOString(),
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (err: any) {
    console.error(`[ObsessiveEditor] Fatal:`, err);
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
  console.log(`[ObsessiveEditor:Scan] Scanning ALL posts...`);

  const { data: posts } = await supabase
    .from("blog_posts")
    .select("id, slug, title, content_md, excerpt, hero_image_url, meta_title, meta_description, category, primary_keyword, pillar, publish_at, updated_at")
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

  console.log(`[ObsessiveEditor:Scan] Scanned ${posts.length} posts, found ${issuesFound} issues`);
  return { scanned: posts.length, issues: issuesFound };
}

function scanPost(post: any, allSlugs: string[]): Array<{ type: string; priority: string; description: string }> {
  const issues: Array<{ type: string; priority: string; description: string }> = [];
  const content = post.content_md || "";
  const excerpt = post.excerpt || "";

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

  // ═══ P1: SEO & INDEXATION ═══
  if (!post.meta_title || post.meta_title.length < 30) {
    issues.push({ type: "weak_meta_title", priority: "P1", description: "Meta title missing or needs AI optimization" });
  }
  if (!post.meta_description || post.meta_description.length < 80) {
    issues.push({ type: "weak_meta_description", priority: "P1", description: "Meta description missing or needs AI optimization" });
  }
  if (!excerpt || excerpt.length < 40) {
    issues.push({ type: "missing_excerpt", priority: "P1", description: "Excerpt missing or too short" });
  }
  // Title quality: too long, too short, or generic
  if (post.title && (post.title.length > 80 || post.title.length < 20)) {
    issues.push({ type: "title_length_issue", priority: "P1", description: `Title length ${post.title.length} chars (ideal 30-70)` });
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
  console.log(`[ObsessiveEditor:Fix] Fixing ALL detected issues...`);

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
      .select("id, slug, content_md, excerpt, title, meta_title, meta_description, primary_keyword, category")
      .eq("id", postId)
      .maybeSingle();

    if (!post) continue;

    const snapshot = { content_md: post.content_md, excerpt: post.excerpt, meta_title: post.meta_title, meta_description: post.meta_description };
    let content = post.content_md || "";
    const updateFields: Record<string, any> = {};
    let anyFixed = false;

    for (const issue of issues) {
      const t = issue.action_details?.issue_type;

      // P0 FIXES
      if (t === "broken_excerpt") {
        const firstPara = content.split(/\n\n/)[0]?.replace(/[#*_\[\]()!]/g, '').trim() || "";
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

      // P2 FIXES
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

      // P4 FIXES
      if (t === "no_cta" || t === "insufficient_cta") {
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

  console.log(`[ObsessiveEditor:Fix] Fixed ${fixed} issues`);
  return { fixed };
}

// ═══════════════════════════════════════════════════════════
// PHASE: SEO OPTIMIZE — AI-powered title/meta/description
// ═══════════════════════════════════════════════════════════
async function phaseSeoOptimize(supabase: any, cycleId: string) {
  const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!lovableApiKey) {
    console.log("[ObsessiveEditor:SEO] No LOVABLE_API_KEY, skipping AI optimization");
    return { optimized: 0, reason: "no_api_key" };
  }

  console.log(`[ObsessiveEditor:SEO] Starting AI SEO+CTR optimization...`);

  // Find posts that need optimization: weak metas, generic titles, or never optimized
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("id, slug, title, excerpt, meta_title, meta_description, primary_keyword, category, pillar, content_md")
    .eq("status", "published")
    .order("publish_at", { ascending: false });

  if (!posts?.length) return { optimized: 0 };

  // Score each post's SEO quality and pick the worst ones
  const candidates = posts.map((p: any) => ({
    ...p,
    seo_score: scoreSeoQuality(p),
  })).filter((p: any) => p.seo_score < 90)
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

REGLAS:
- NO incluir "Vistaceo" en título ni meta title
- Título: claro, atractivo, compartible, 30-65 caracteres, SEO-friendly
- Meta title: distinto del H1, optimizado para CTR, max 60 caracteres
- Meta description: persuasiva, natural, 120-155 caracteres, invitar al clic
- Excerpt: 1-2 oraciones claras, max 200 caracteres, sin markdown
- Todo en español natural, tono editorial profesional, sin clickbait barato
- Sin keyword stuffing, sin frases genéricas de IA

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
        console.error(`[ObsessiveEditor:SEO] API error ${response.status}`);
        continue;
      }

      const result = await response.json();
      const raw = result.choices?.[0]?.message?.content || "";
      
      // Extract JSON from response
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.log(`[ObsessiveEditor:SEO] No JSON in response for ${post.slug}`);
        continue;
      }

      const optimizations = JSON.parse(jsonMatch[0]);
      
      // Validate before applying
      const updateFields: Record<string, any> = {};
      const snapshot: Record<string, any> = {};

      if (optimizations.title && optimizations.title.length >= 20 && optimizations.title.length <= 80) {
        snapshot.title = post.title;
        updateFields.title = optimizations.title;
      }
      if (optimizations.meta_title && optimizations.meta_title.length >= 20 && optimizations.meta_title.length <= 60) {
        snapshot.meta_title = post.meta_title;
        updateFields.meta_title = optimizations.meta_title;
      }
      if (optimizations.meta_description && optimizations.meta_description.length >= 50 && optimizations.meta_description.length <= 160) {
        snapshot.meta_description = post.meta_description;
        updateFields.meta_description = optimizations.meta_description;
      }
      if (optimizations.excerpt && optimizations.excerpt.length >= 20 && optimizations.excerpt.length <= 250) {
        snapshot.excerpt = post.excerpt;
        updateFields.excerpt = optimizations.excerpt;
      }

      if (Object.keys(updateFields).length > 0) {
        updateFields.updated_at = new Date().toISOString();
        await supabase.from("blog_posts").update(updateFields).eq("id", post.id);

        await logRun(supabase, cycleId, "seo_ai_optimize", "P1", "improved", post.id, post.slug, {
          fields_optimized: Object.keys(updateFields).filter(k => k !== "updated_at"),
          reasoning: optimizations.reasoning || "",
          old_seo_score: post.seo_score,
        }, { optimizations: updateFields }, snapshot);

        optimized++;
        console.log(`[ObsessiveEditor:SEO] Optimized ${post.slug} (score ${post.seo_score} → improved)`);
      }

      // Small delay between AI calls
      await new Promise(r => setTimeout(r, 1500));

    } catch (err: any) {
      console.error(`[ObsessiveEditor:SEO] Error on ${post.slug}:`, err.message);
    }
  }

  console.log(`[ObsessiveEditor:SEO] Optimized ${optimized}/${candidates.length} posts`);
  return { optimized, candidates: candidates.length };
}

function scoreSeoQuality(post: any): number {
  let score = 0;
  
  // Title (0-20)
  if (post.title) {
    const len = post.title.length;
    if (len >= 30 && len <= 65) score += 20;
    else if (len >= 20 && len <= 80) score += 12;
    else score += 5;
  }

  // Meta title (0-20)
  if (post.meta_title) {
    const len = post.meta_title.length;
    if (len >= 30 && len <= 60) score += 20;
    else if (len >= 20) score += 10;
    else score += 3;
  }

  // Meta description (0-25)
  if (post.meta_description) {
    const len = post.meta_description.length;
    if (len >= 100 && len <= 155) score += 25;
    else if (len >= 50) score += 12;
    else score += 3;
  }

  // Excerpt (0-15)
  if (post.excerpt) {
    const len = post.excerpt.length;
    if (len >= 60 && len <= 200 && !/^!\[/.test(post.excerpt)) score += 15;
    else if (len >= 20) score += 7;
  }

  // Primary keyword set (0-10)
  if (post.primary_keyword && post.primary_keyword.length > 3) score += 10;

  // Hero image (0-10)
  if (post.hero_image_url?.startsWith("https://")) score += 10;

  return score;
}

// ═══════════════════════════════════════════════════════════
// PHASE: IMAGE GEN — AI hero images for posts without them
// ═══════════════════════════════════════════════════════════
async function phaseImageGen(supabase: any, cycleId: string) {
  const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!lovableApiKey) return { generated: 0, reason: "no_api_key" };

  console.log(`[ObsessiveEditor:Image] Starting hero image generation...`);

  const { data: posts } = await supabase
    .from("blog_posts")
    .select("id, slug, title, pillar, category, primary_keyword, excerpt")
    .eq("status", "published")
    .or("hero_image_url.is.null,hero_image_url.eq.")
    .order("publish_at", { ascending: false })
    .limit(MAX_IMAGE_GENS_PER_CYCLE);

  if (!posts?.length) {
    console.log("[ObsessiveEditor:Image] All posts have hero images");
    return { generated: 0 };
  }

  let generated = 0;
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  for (const post of posts) {
    try {
      // Pick a diverse scene type based on post index
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
          model: "google/gemini-2.5-flash-image",
          messages: [{ role: "user", content: imagePrompt }],
          modalities: ["image", "text"],
        }),
      });

      if (!response.ok) {
        console.error(`[ObsessiveEditor:Image] API error ${response.status} for ${post.slug}`);
        continue;
      }

      const result = await response.json();
      const imageUrl = result.choices?.[0]?.message?.images?.[0]?.image_url?.url;

      if (!imageUrl) {
        console.log(`[ObsessiveEditor:Image] No image returned for ${post.slug}`);
        continue;
      }

      // Upload to storage
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
        console.log(`[ObsessiveEditor:Image] Generated hero for ${post.slug}`);
      }

      await new Promise(r => setTimeout(r, 3000));
    } catch (err: any) {
      console.error(`[ObsessiveEditor:Image] Error on ${post.slug}:`, err.message);
    }
  }

  console.log(`[ObsessiveEditor:Image] Generated ${generated}/${posts.length} images`);
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

    // Skip blank/tiny images
    if (bytes.length < 8000) return null;

    const extension = mimeType.includes("png") ? "png" : "jpg";
    const fileName = `${slug}-hero-${Date.now()}.${extension}`;

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
      // Fallback: use client
      const sb = createClient(supabaseUrl, supabaseKey, { auth: { autoRefreshToken: false, persistSession: false } });
      const { error } = await sb.storage.from("blog-images").upload(fileName, bytes, { contentType: mimeType, upsert: true });
      if (error) return null;
      const { data: pub } = sb.storage.from("blog-images").getPublicUrl(fileName);
      return pub.publicUrl;
    }

    return `${supabaseUrl}/storage/v1/object/public/blog-images/${fileName}`;
  } catch (err: any) {
    console.error("[ObsessiveEditor:Image] Upload error:", err.message);
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
  console.log(`[ObsessiveEditor:Link] Starting cluster linking...`);

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

  console.log(`[ObsessiveEditor:Link] Linked ${linked} orphan posts`);
  return { linked };
}

// ═══════════════════════════════════════════════════════════
// PHASE: REFRESH — Micro-improvements for crawl freshness
// ═══════════════════════════════════════════════════════════
async function phaseRefresh(supabase: any, cycleId: string) {
  console.log(`[ObsessiveEditor:Refresh] Starting micro-improvements...`);

  const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
  const { data: stalePosts } = await supabase
    .from("blog_posts")
    .select("id, slug, title, content_md, updated_at, primary_keyword")
    .eq("status", "published")
    .lt("updated_at", twoWeeksAgo)
    .order("publish_at", { ascending: false })
    .limit(30);

  if (!stalePosts?.length) return { refreshed: 0 };

  const toRefresh = stalePosts.sort(() => Math.random() - 0.5).slice(0, 3);
  let refreshed = 0;

  for (const post of toRefresh) {
    const content = post.content_md || "";
    let updated = content;
    let changed = false;

    const currentYear = new Date().getFullYear();
    if (!content.includes(String(currentYear)) && content.includes(String(currentYear - 1))) {
      updated = updated.replace(new RegExp(String(currentYear - 1), "g"), String(currentYear));
      changed = true;
    }

    if (changed) {
      const snapshot = { content_md: content };
      await supabase.from("blog_posts").update({ content_md: updated, updated_at: new Date().toISOString() }).eq("id", post.id);
      await logRun(supabase, cycleId, "refresh_micro", "P1", "refreshed", post.id, post.slug, {}, { type: "year_update" }, snapshot);
      refreshed++;
    }
  }

  console.log(`[ObsessiveEditor:Refresh] Refreshed ${refreshed} posts`);
  return { refreshed };
}

// ═══════════════════════════════════════════════════════════
// PHASE: REINDEX — Trigger indexing signals
// ═══════════════════════════════════════════════════════════
async function phaseReindex(supabase: any, cycleId: string) {
  console.log(`[ObsessiveEditor:Reindex] Triggering indexing...`);

  const { data: modifiedRuns } = await supabase
    .from("obsessive_editor_runs")
    .select("target_slug")
    .eq("cycle_id", cycleId)
    .in("status", ["fixed", "improved", "refreshed", "linked"])
    .not("target_slug", "is", null);

  const slugsToIndex = [...new Set((modifiedRuns || []).map((r: any) => r.target_slug).filter(Boolean))];

  if (slugsToIndex.length === 0) {
    await triggerSitemapPing();
    return { indexed: 0, sitemap_pinged: true };
  }

  try {
    await supabase.functions.invoke("seo-auto-indexer", { body: { slugs: slugsToIndex } });
  } catch (err: any) {
    console.error("[ObsessiveEditor:Reindex] IndexNow failed:", err.message);
  }

  const githubToken = Deno.env.get("GH_PAT");
  if (githubToken && slugsToIndex.length > 0) {
    try {
      await supabase.functions.invoke("trigger-site-deploy", { body: {} });
    } catch (_) { /* best effort */ }
  }

  await triggerSitemapPing();
  await logRun(supabase, cycleId, "reindex_batch", "P1", "indexed", null, null, { slugs: slugsToIndex }, { count: slugsToIndex.length });

  console.log(`[ObsessiveEditor:Reindex] Submitted ${slugsToIndex.length} URLs`);
  return { indexed: slugsToIndex.length, sitemap_pinged: true };
}

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════
async function triggerSitemapPing() {
  const sitemapUrl = encodeURIComponent(`${BLOG_DOMAIN}/sitemap.xml`);
  try {
    await Promise.allSettled([
      fetch(`https://www.google.com/ping?sitemap=${sitemapUrl}`),
      fetch(`https://www.bing.com/ping?sitemap=${sitemapUrl}`),
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
    console.error("[ObsessiveEditor] Log failed:", err.message);
  }
}
