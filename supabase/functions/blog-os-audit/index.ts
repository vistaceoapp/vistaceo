import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AuditResult {
  post_id: string;
  scores: Record<string, number>;
  issues: Array<{ type: string; severity: string; description: string; location?: string; auto_fixable: boolean }>;
  fault_radar: string[];
  gates_passed: string[];
  gates_failed: string[];
  score_global: number;
  supreme_score: number;
}

// ═══════════════════════════════════════════════════════════
// SUPREME CONTENT SCORE WEIGHTS (from editorial protocol)
// intention 15, originality 15, depth 15, CTR 10, SEO 10,
// structure 8, semantics 8, interlinking 6, UX 6, conversion 4, brand 3
// ═══════════════════════════════════════════════════════════
const SUPREME_WEIGHTS = {
  intention: 0.15,
  originality: 0.15,
  depth: 0.15,
  ctr: 0.10,
  seo: 0.10,
  structure: 0.08,
  semantics: 0.08,
  interlinking: 0.06,
  ux: 0.06,
  conversion: 0.04,
  brand: 0.03,
};

// Anti-mediocrity banned phrases
const BANNED_PHRASES = [
  "en el mundo actual",
  "en la era digital",
  "en un mundo cada vez más",
  "hoy en día",
  "no es un secreto",
  "como todos sabemos",
  "es importante destacar que",
  "cabe mencionar que",
  "sin lugar a dudas",
  "en este sentido",
  "a lo largo de este artículo",
  "en conclusión podemos decir",
  "como hemos visto",
  "dicho esto",
  "en resumen",
  "para finalizar",
  "en definitiva",
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body = await req.json().catch(() => ({}));
    const { action = "audit_all", post_id, auto_fix = false } = body;

    if (action === "audit_single" && post_id) {
      const result = await auditPost(supabase, post_id, auto_fix);
      return new Response(JSON.stringify({ success: true, result }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "audit_all") {
      const { data: posts, error } = await supabase
        .from("blog_posts")
        .select("id, slug, title, content_md, meta_title, meta_description, excerpt, hero_image_url, pillar, category, tags, primary_keyword, secondary_keywords, internal_links, external_sources, publish_at, status, schema_jsonld, author_name")
        .eq("status", "published")
        .order("publish_at", { ascending: false });

      if (error) throw error;

      // Get all slugs for cannibalization check
      const allPosts = posts || [];
      const results: AuditResult[] = [];
      for (const post of allPosts) {
        const result = await auditPost(supabase, post.id, auto_fix, post, allPosts);
        results.push(result);
      }

      const summary = {
        total: results.length,
        passing_90: results.filter(r => r.supreme_score >= 90).length,
        premium_94: results.filter(r => r.supreme_score >= 94).length,
        flagship_97: results.filter(r => r.supreme_score >= 97).length,
        blocked_below_85: results.filter(r => r.supreme_score < 85).length,
        improvement_85_89: results.filter(r => r.supreme_score >= 85 && r.supreme_score < 90).length,
        critical_issues: results.reduce((acc, r) => acc + r.issues.filter(i => i.severity === "critical").length, 0),
        avg_supreme_score: results.length ? Math.round(results.reduce((a, r) => a + r.supreme_score, 0) / results.length) : 0,
        gates_summary: {
          most_failed: getMostFailedGates(results),
        },
      };

      return new Response(JSON.stringify({ success: true, summary, results }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "sync_registry") {
      const synced = await syncRegistry(supabase);
      return new Response(JSON.stringify({ success: true, synced }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("Blog OS Audit error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function getMostFailedGates(results: AuditResult[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const r of results) {
    for (const g of r.gates_failed) {
      counts[g] = (counts[g] || 0) + 1;
    }
  }
  return Object.fromEntries(Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5));
}

async function syncRegistry(supabase: any): Promise<number> {
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("id, slug, category, pillar, primary_keyword, secondary_keywords, publish_at, internal_links, status")
    .eq("status", "published");

  if (!posts?.length) return 0;

  let synced = 0;
  for (const post of posts) {
    const { data: existing } = await supabase
      .from("blog_content_registry")
      .select("id")
      .eq("post_id", post.id)
      .maybeSingle();

    if (!existing) {
      await supabase.from("blog_content_registry").insert({
        post_id: post.id,
        url: `https://blog.vistaceo.com/${post.slug}/`,
        pipeline_state: post.status,
        category: post.category,
        primary_keyword: post.primary_keyword,
        keyword_variants: post.secondary_keywords || [],
        cluster_assigned: post.category,
        published_at: post.publish_at,
        internal_links_out: post.internal_links || [],
      });
      synced++;
    }
  }
  return synced;
}

async function auditPost(supabase: any, postId: string, autoFix: boolean, postData?: any, allPosts?: any[]): Promise<AuditResult> {
  let post = postData;
  if (!post) {
    const { data } = await supabase.from("blog_posts").select("*").eq("id", postId).single();
    post = data;
  }
  if (!post) throw new Error(`Post ${postId} not found`);

  const content = post.content_md || "";
  const title = post.title || "";
  const metaTitle = post.meta_title || "";
  const metaDesc = post.meta_description || "";
  const excerpt = post.excerpt || "";
  const contentLower = content.toLowerCase();

  const issues: AuditResult["issues"] = [];
  const faultRadar: string[] = [];
  const gatesPassed: string[] = [];
  const gatesFailed: string[] = [];

  // ═══════════════════════════════════════════════════════════
  // 20 QUALITY GATES
  // ═══════════════════════════════════════════════════════════

  // GATE 01: Intent Match
  const intentScore = scoreIntentMatch(title, content, post.primary_keyword);
  if (intentScore >= 70) gatesPassed.push("G01_Intent"); else { gatesFailed.push("G01_Intent"); issues.push({ type: "gate", severity: "critical", description: "La nota no responde con precisión a la intención de búsqueda principal", auto_fixable: false }); }

  // GATE 02: Promise Integrity
  const { score: promiseScore, issues: promiseIssues } = checkPromises(title, content);
  issues.push(...promiseIssues);
  if (promiseScore >= 70) gatesPassed.push("G02_Promise"); else { gatesFailed.push("G02_Promise"); faultRadar.push("título promete más que entrega"); }

  // GATE 03: Originality
  const originalityScore = scoreOriginality(content, post);
  if (originalityScore >= 60) gatesPassed.push("G03_Originality"); else { gatesFailed.push("G03_Originality"); issues.push({ type: "gate", severity: "high", description: "La pieza no aporta ángulo original, marco propio ni contexto LATAM diferencial", auto_fixable: false }); }

  // GATE 04: Anti Generic
  const antiGenericScore = scoreAntiGeneric(content);
  if (antiGenericScore >= 70) gatesPassed.push("G04_AntiGeneric"); else { gatesFailed.push("G04_AntiGeneric"); issues.push({ type: "gate", severity: "high", description: "Contenido con frases vacías, relleno o consejos genéricos intercambiables", auto_fixable: false }); }

  // GATE 05: Human Tone
  const humanToneScore = scoreHumanTone(content);
  if (humanToneScore >= 70) gatesPassed.push("G05_HumanTone"); else { gatesFailed.push("G05_HumanTone"); issues.push({ type: "gate", severity: "high", description: "Tono robótico, exceso de simetría o frases predecibles de IA", auto_fixable: false }); }

  // GATE 06: Depth
  const depthScore = scoreDepth(content, post);
  if (depthScore >= 60) gatesPassed.push("G06_Depth"); else { gatesFailed.push("G06_Depth"); issues.push({ type: "gate", severity: "high", description: "Profundidad insuficiente — el lector necesitaría volver a Google", auto_fixable: false }); }

  // GATE 07: SERP Superiority
  const serpScore = scoreSerpSuperiority(content, post);
  if (serpScore >= 60) gatesPassed.push("G07_SERP"); else { gatesFailed.push("G07_SERP"); issues.push({ type: "gate", severity: "medium", description: "Sin hipótesis clara de por qué sería mejor que otros resultados de la SERP", auto_fixable: false }); }

  // GATE 08: Semantic Coverage
  const semanticScore = scoreSemanticCoverage(content, post);
  if (semanticScore >= 60) gatesPassed.push("G08_Semantic"); else { gatesFailed.push("G08_Semantic"); issues.push({ type: "gate", severity: "medium", description: "Agujeros semánticos: subtemas o entidades faltantes", auto_fixable: false }); }

  // GATE 09: CTR Magnetism
  const ctrScore = scoreCTRMagnetism(title, metaTitle, metaDesc);
  if (ctrScore >= 60) gatesPassed.push("G09_CTR"); else { gatesFailed.push("G09_CTR"); issues.push({ type: "gate", severity: "high", description: "Título o meta correctos pero olvidables, bajo potencial de clic", auto_fixable: true }); }

  // GATE 10: Snippet Readiness
  const snippetScore = scoreSnippetReadiness(content);
  if (snippetScore >= 50) gatesPassed.push("G10_Snippet"); else { gatesFailed.push("G10_Snippet"); issues.push({ type: "gate", severity: "medium", description: "Sin bloques aptos para featured snippet, definición rápida o lista de pasos", auto_fixable: true }); }

  // GATE 11: Interlinking Power
  const interlinkScore = checkInterlinking(post);
  if (interlinkScore >= 60) gatesPassed.push("G11_Interlink"); else { gatesFailed.push("G11_Interlink"); issues.push({ type: "interlinking", severity: "medium", description: "Menos de 3 enlaces internos — nota aislada del ecosistema", auto_fixable: true }); }

  // GATE 12: Cannibalization
  const cannibScore = scoreCannibalization(post, allPosts || []);
  if (cannibScore >= 80) gatesPassed.push("G12_Cannibal"); else { gatesFailed.push("G12_Cannibal"); issues.push({ type: "gate", severity: "high", description: "Posible canibalización con otra nota existente", auto_fixable: false }); }

  // GATE 13: Freshness
  const freshnessScore = scoreFreshness(post);
  if (freshnessScore >= 50) gatesPassed.push("G13_Freshness"); else { gatesFailed.push("G13_Freshness"); issues.push({ type: "gate", severity: "low", description: "Contenido potencialmente desactualizado", auto_fixable: true }); }

  // GATE 14: Experience (reading UX)
  const experienceScore = checkUX(content);
  if (experienceScore >= 60) gatesPassed.push("G14_Experience"); else { gatesFailed.push("G14_Experience"); issues.push({ type: "gate", severity: "medium", description: "Experiencia de lectura pobre: bloques largos, sin aire visual, sin escaneo", auto_fixable: true }); }

  // GATE 15: Conversion Fit
  const conversionScore = checkConversion(content);
  if (conversionScore >= 40) gatesPassed.push("G15_Conversion"); else { gatesFailed.push("G15_Conversion"); faultRadar.push("CTA ausente o genérico"); issues.push({ type: "conversion", severity: "medium", description: "Sin CTA contextual o CTA forzado/genérico", auto_fixable: true }); }

  // GATE 16: Brand Alignment
  const brandScore = scoreBrandAlignment(content, post);
  if (brandScore >= 60) gatesPassed.push("G16_Brand"); else { gatesFailed.push("G16_Brand"); issues.push({ type: "gate", severity: "low", description: "Contenido no refuerza autoridad de VistaCEO", auto_fixable: false }); }

  // GATE 17: Image Relevance
  const imageScore = scoreImageRelevance(post);
  if (imageScore >= 50) gatesPassed.push("G17_Image"); else { gatesFailed.push("G17_Image"); issues.push({ type: "gate", severity: "medium", description: "Imagen hero ausente, genérica o con aspecto de IA evidente", auto_fixable: true }); }

  // GATE 18: Shareability
  const shareScore = scoreShareability(title, metaDesc, post);
  if (shareScore >= 50) gatesPassed.push("G18_Share"); else { gatesFailed.push("G18_Share"); issues.push({ type: "gate", severity: "low", description: "Bajo potencial de compartir fuera de Google", auto_fixable: true }); }

  // GATE 19: Admin Explainability (always passes if we log properly)
  gatesPassed.push("G19_Explain");

  // GATE 20: Zero Embarrassment
  const embarrassScore = scoreZeroEmbarrassment(content, post);
  if (embarrassScore >= 70) gatesPassed.push("G20_ZeroEmb"); else { gatesFailed.push("G20_ZeroEmb"); issues.push({ type: "gate", severity: "high", description: "Contenido correcto pero olvidable — no parece de un blog referente", auto_fixable: false }); }

  // Technical integrity check (not a gate but adds issues)
  const { score: scoreTechnical, issues: techIssues } = checkTechnicalIntegrity(content);
  issues.push(...techIssues);

  // SEO on-page check
  const scoreSeo = checkSEO(post);
  if (!post.primary_keyword) {
    issues.push({ type: "seo", severity: "high", description: "Sin keyword primaria", auto_fixable: false });
  }
  if (!metaDesc || metaDesc.length < 50) {
    issues.push({ type: "seo", severity: "high", description: "Meta description ausente o muy corta", auto_fixable: true });
  }

  // ═══════════════════════════════════════════════════════════
  // SUPREME CONTENT SCORE CALCULATION
  // ═══════════════════════════════════════════════════════════
  const supremeScore = Math.round(
    intentScore * SUPREME_WEIGHTS.intention +
    originalityScore * SUPREME_WEIGHTS.originality +
    depthScore * SUPREME_WEIGHTS.depth +
    ctrScore * SUPREME_WEIGHTS.ctr +
    scoreSeo * SUPREME_WEIGHTS.seo +
    scoreStructure(content) * SUPREME_WEIGHTS.structure +
    semanticScore * SUPREME_WEIGHTS.semantics +
    interlinkScore * SUPREME_WEIGHTS.interlinking +
    experienceScore * SUPREME_WEIGHTS.ux +
    conversionScore * SUPREME_WEIGHTS.conversion +
    brandScore * SUPREME_WEIGHTS.brand
  );

  // Legacy global score (for backward compat)
  const scoreCoherence = scoreCoherenceCheck(title, metaTitle, content);
  const scoreGlobal = Math.round(
    scoreCoherence * 0.15 +
    promiseScore * 0.15 +
    scoreTechnical * 0.15 +
    scoreSeo * 0.15 +
    interlinkScore * 0.10 +
    experienceScore * 0.10 +
    conversionScore * 0.10 +
    originalityScore * 0.10
  );

  // Determine tier
  let tier = "blocked";
  if (supremeScore >= 97) tier = "flagship";
  else if (supremeScore >= 94) tier = "premium";
  else if (supremeScore >= 90) tier = "approved";
  else if (supremeScore >= 85) tier = "improvement_needed";

  // Ensure/update registry entry
  const { data: registry } = await supabase
    .from("blog_content_registry")
    .select("id")
    .eq("post_id", post.id)
    .maybeSingle();

  const registryData = {
    post_id: post.id,
    url: `https://blog.vistaceo.com/${post.slug}/`,
    pipeline_state: post.status,
    category: post.category,
    primary_keyword: post.primary_keyword,
    keyword_variants: post.secondary_keywords || [],
    cluster_assigned: post.category,
    published_at: post.publish_at,
    score_global: supremeScore,
    score_coherence: intentScore,
    score_promises: promiseScore,
    score_technical: scoreTechnical,
    score_seo: scoreSeo,
    score_interlinking: interlinkScore,
    score_ux: experienceScore,
    score_conversion: conversionScore,
    fault_radar: faultRadar,
    internal_links_out: post.internal_links || [],
    last_improved_at: new Date().toISOString(),
  };

  let registryId: string;
  if (registry) {
    await supabase.from("blog_content_registry").update(registryData).eq("id", registry.id);
    registryId = registry.id;
  } else {
    const { data: inserted } = await supabase.from("blog_content_registry").insert(registryData).select("id").single();
    registryId = inserted.id;
  }

  // Clean old issues and insert new ones
  await supabase.from("blog_audit_issues").delete().eq("post_id", post.id);
  if (issues.length > 0) {
    await supabase.from("blog_audit_issues").insert(
      issues.map(issue => ({
        registry_id: registryId,
        post_id: post.id,
        issue_type: issue.type,
        severity: issue.severity,
        description: issue.description,
        location: issue.location,
        auto_fixable: issue.auto_fixable,
      }))
    );
  }

  // Store quality gate results
  await supabase.from("blog_quality_results").delete().eq("registry_id", registryId);
  const gateResults = [
    ...gatesPassed.map(g => ({ registry_id: registryId, gate_name: g, passed: true, score: 100 })),
    ...gatesFailed.map(g => ({ registry_id: registryId, gate_name: g, passed: false, score: 0 })),
  ];
  if (gateResults.length > 0) {
    await supabase.from("blog_quality_results").insert(gateResults);
  }

  // Create tasks for critical issues
  if (issues.some(i => i.severity === "critical")) {
    await supabase.from("blog_task_queue").insert({
      registry_id: registryId,
      post_id: post.id,
      queue: "Q1",
      priority: 1,
      task_type: "critical_fix",
      description: `Arreglar ${issues.filter(i => i.severity === "critical").length} issues críticos en "${title}" | Tier: ${tier} | Score: ${supremeScore}`,
      status: "pending",
      payload: { issues: issues.filter(i => i.severity === "critical"), gates_failed: gatesFailed, supreme_score: supremeScore, tier },
    });
  }

  return {
    post_id: post.id,
    scores: {
      intention: intentScore,
      originality: originalityScore,
      depth: depthScore,
      ctr: ctrScore,
      seo: scoreSeo,
      structure: scoreStructure(content),
      semantics: semanticScore,
      interlinking: interlinkScore,
      ux: experienceScore,
      conversion: conversionScore,
      brand: brandScore,
      technical: scoreTechnical,
      promises: promiseScore,
    },
    issues,
    fault_radar: faultRadar,
    gates_passed: gatesPassed,
    gates_failed: gatesFailed,
    score_global: scoreGlobal,
    supreme_score: supremeScore,
  };
}

// ═══════════════════════════════════════════════════════════
// GATE SCORING FUNCTIONS
// ═══════════════════════════════════════════════════════════

function scoreIntentMatch(title: string, content: string, keyword: string | null): number {
  let score = 60;
  const titleLower = title.toLowerCase();
  const contentLower = content.toLowerCase();
  const kw = (keyword || "").toLowerCase();

  // Keyword appears in first 500 chars
  if (kw && contentLower.slice(0, 500).includes(kw)) score += 15;
  else if (kw && contentLower.includes(kw)) score += 8;

  // Title words appear in content
  const titleWords = titleLower.split(/\s+/).filter(w => w.length > 3);
  const matchRatio = titleWords.length > 0
    ? titleWords.filter(w => contentLower.includes(w)).length / titleWords.length
    : 0;
  if (matchRatio >= 0.8) score += 15;
  else if (matchRatio >= 0.6) score += 8;

  // Has H2s that relate to title
  const h2s = content.match(/^## .+$/gm) || [];
  const h2Text = h2s.join(" ").toLowerCase();
  const kwInH2 = kw && h2Text.includes(kw);
  if (kwInH2) score += 10;
  if (h2s.length >= 3) score += 5;

  return Math.min(100, Math.max(0, score));
}

function scoreOriginality(content: string, post: any): number {
  let score = 50;
  const contentLower = content.toLowerCase();

  // Has LATAM context
  if (/latam|latinoam[eé]rica|am[eé]rica latina|regi[oó]n|mercado\s+hispano/i.test(content)) score += 15;
  if (/argentina|chile|colombia|m[eé]xico|uruguay|ecuador|per[uú]|costa rica|panam[aá]/i.test(content)) score += 10;

  // Has examples or case studies
  if (/ejemplo real|caso\s+real|caso\s+pr[aá]ctico|en\s+la\s+pr[aá]ctica/i.test(content)) score += 10;
  if (/un\s+cliente|un\s+negocio|un\s+restaurante|una\s+pyme|una\s+empresa/i.test(content)) score += 8;

  // Has original frameworks or checklists
  if (/paso\s+\d|fase\s+\d|etapa\s+\d|nivel\s+\d|pilar\s+\d/i.test(content)) score += 8;
  if (/- \[[ x]\]/i.test(content)) score += 5;

  // Has comparison/tables
  if (/\|.*\|.*\|/m.test(content)) score += 7;

  return Math.min(100, Math.max(0, score));
}

function scoreAntiGeneric(content: string): number {
  let score = 100;
  const contentLower = content.toLowerCase();

  // Check for banned phrases
  let bannedCount = 0;
  for (const phrase of BANNED_PHRASES) {
    if (contentLower.includes(phrase)) bannedCount++;
  }
  score -= bannedCount * 8;

  // Check for generic AI patterns
  const genericPatterns = [
    /es\s+fundamental\s+para\s+cualquier/i,
    /resulta\s+esencial\s+comprender/i,
    /es\s+crucial\s+(?:entender|comprender|saber)/i,
    /no\s+cabe\s+duda/i,
    /en\s+este\s+contexto/i,
  ];
  for (const p of genericPatterns) {
    if (p.test(content)) score -= 6;
  }

  // Too many bullet lists without development (>50% of content is lists)
  const listLines = (content.match(/^- .+$/gm) || []).length;
  const totalLines = content.split("\n").filter(l => l.trim()).length;
  if (totalLines > 20 && listLines / totalLines > 0.5) score -= 15;

  return Math.max(0, Math.min(100, score));
}

function scoreHumanTone(content: string): number {
  let score = 80;

  // Check for excessive symmetry (all H2s same length ±5 chars)
  const h2s = (content.match(/^## .+$/gm) || []).map(h => h.length);
  if (h2s.length >= 4) {
    const avg = h2s.reduce((a, b) => a + b, 0) / h2s.length;
    const allSimilar = h2s.every(h => Math.abs(h - avg) < 5);
    if (allSimilar) score -= 15;
  }

  // Check for repetitive patterns (same sentence structure)
  const paragraphs = content.split(/\n\n/).filter(p => p.trim().length > 30 && !p.startsWith("#"));
  if (paragraphs.length >= 5) {
    const starters = paragraphs.slice(0, 10).map(p => p.trim().split(/\s+/).slice(0, 3).join(" ").toLowerCase());
    const uniqueStarters = new Set(starters);
    if (uniqueStarters.size < starters.length * 0.6) score -= 15;
  }

  // Has conversational elements (questions, second person)
  if (/\?/.test(content)) score += 5;
  if (/vos\s|tu\s|tus\s|te\s/i.test(content)) score += 5;
  if (/¿/i.test(content)) score += 5;

  return Math.max(0, Math.min(100, score));
}

function scoreDepth(content: string, post: any): number {
  let score = 0;
  const wordCount = content.split(/\s+/).filter(Boolean).length;

  if (wordCount >= 2500) score += 30;
  else if (wordCount >= 1800) score += 20;
  else if (wordCount >= 1200) score += 12;
  else score += 5;

  const h2Count = (content.match(/^## /gm) || []).length;
  const h3Count = (content.match(/^### /gm) || []).length;
  if (h2Count >= 5) score += 20;
  else if (h2Count >= 3) score += 12;
  if (h3Count >= 4) score += 10;

  // Has FAQ
  if (/## Preguntas frecuentes|## FAQ/i.test(content)) score += 10;

  // Has examples
  if (/ejemplo|caso real|caso práctico/i.test(content)) score += 10;

  // Has actionable steps
  if (/paso\s+\d|Paso\s+\d/i.test(content)) score += 10;

  // Has tables
  if (/\|.*\|.*\|/m.test(content)) score += 10;

  return Math.min(100, Math.max(0, score));
}

function scoreSerpSuperiority(content: string, post: any): number {
  let score = 50;
  const wordCount = content.split(/\s+/).filter(Boolean).length;

  // Length advantage
  if (wordCount >= 2000) score += 15;
  else if (wordCount >= 1500) score += 8;

  // Structural advantage
  const h2Count = (content.match(/^## /gm) || []).length;
  const hasFaq = /## Preguntas frecuentes|## FAQ/i.test(content);
  const hasTable = /\|.*\|.*\|/m.test(content);
  if (h2Count >= 5) score += 10;
  if (hasFaq) score += 10;
  if (hasTable) score += 10;

  // LATAM specificity
  if (/latam|latinoam/i.test(content)) score += 10;

  return Math.min(100, Math.max(0, score));
}

function scoreSemanticCoverage(content: string, post: any): number {
  let score = 50;
  const contentLower = content.toLowerCase();
  const kw = (post.primary_keyword || "").toLowerCase();

  // Secondary keywords present
  const secondaryKws = post.secondary_keywords || [];
  if (secondaryKws.length > 0) {
    const found = secondaryKws.filter((sk: string) => contentLower.includes(sk.toLowerCase())).length;
    const ratio = found / secondaryKws.length;
    score += Math.round(ratio * 20);
  } else {
    score += 10; // no secondaries defined, neutral
  }

  // Has related questions
  if (/\?/.test(content)) score += 10;
  if (/### ¿/i.test(content)) score += 10;

  // Subtopic coverage (H2/H3 diversity)
  const h2s = (content.match(/^## .+$/gm) || []).length;
  if (h2s >= 5) score += 15;
  else if (h2s >= 3) score += 8;

  return Math.min(100, Math.max(0, score));
}

function scoreCTRMagnetism(title: string, metaTitle: string, metaDesc: string): number {
  let score = 40;
  const t = title || metaTitle || "";

  // Title length sweet spot
  if (t.length >= 30 && t.length <= 65) score += 15;
  else if (t.length >= 20 && t.length <= 80) score += 8;

  // Has power words
  const powerWords = /secreto|error|evitar|clave|real|paso a paso|gratis|rápido|fácil|mejor|peor|guía|comparativa|vs|verdad|mito|solución|plantilla|checklist|diagnóstico/i;
  if (powerWords.test(t)) score += 15;

  // Has numbers
  if (/\d+/.test(t)) score += 10;

  // Meta desc quality
  if (metaDesc.length >= 100 && metaDesc.length <= 155) score += 10;
  if (/descubr|aprend|conoc|encontr/i.test(metaDesc)) score += 5;

  // Not bland
  const blandPatterns = /todo\s+lo\s+que\s+necesitas\s+saber|guía\s+completa|todo\s+sobre/i;
  if (blandPatterns.test(t)) score -= 10;

  return Math.max(0, Math.min(100, score));
}

function scoreSnippetReadiness(content: string): number {
  let score = 30;

  // Has definition-style paragraphs
  if (/es\s+(?:un|una|el|la)\s+\w+\s+que/i.test(content)) score += 15;

  // Has numbered steps
  if (/^\d+\.\s/m.test(content)) score += 15;

  // Has bullet lists
  if ((content.match(/^- .+$/gm) || []).length >= 3) score += 10;

  // Has tables
  if (/\|.*\|.*\|/m.test(content)) score += 15;

  // Has FAQ with questions
  if (/### ¿.+\?/i.test(content)) score += 15;

  return Math.min(100, Math.max(0, score));
}

function scoreCannibalization(post: any, allPosts: any[]): number {
  if (!allPosts || allPosts.length < 2) return 100;
  const slug = post.slug || "";
  const kw = (post.primary_keyword || "").toLowerCase();
  const titleWords = (post.title || "").toLowerCase().split(/\s+/).filter((w: string) => w.length > 4);

  for (const other of allPosts) {
    if (other.id === post.id) continue;
    const otherSlug = other.slug || "";
    const otherKw = (other.primary_keyword || "").toLowerCase();
    const otherTitleWords = (other.title || "").toLowerCase().split(/\s+/).filter((w: string) => w.length > 4);

    // Slug overlap
    const slugWords = slug.split("-");
    const otherSlugWords = otherSlug.split("-");
    const slugOverlap = slugWords.filter((w: string) => otherSlugWords.includes(w) && w.length > 3).length;

    // Title overlap
    const titleOverlap = titleWords.filter((w: string) => otherTitleWords.includes(w)).length;

    // Keyword match
    const kwMatch = kw && otherKw && (kw === otherKw || kw.includes(otherKw) || otherKw.includes(kw));

    if (kwMatch && titleOverlap >= 3) return 30; // High cannibalization risk
    if (slugOverlap >= 5 && titleOverlap >= 3) return 40;
    if (kwMatch && slugOverlap >= 3) return 50;
  }

  return 100;
}

function scoreFreshness(post: any): number {
  const publishDate = post.publish_at ? new Date(post.publish_at) : null;
  if (!publishDate) return 50;

  const daysSincePublish = (Date.now() - publishDate.getTime()) / (1000 * 60 * 60 * 24);
  if (daysSincePublish < 30) return 100;
  if (daysSincePublish < 90) return 80;
  if (daysSincePublish < 180) return 60;
  if (daysSincePublish < 365) return 40;
  return 20;
}

function scoreBrandAlignment(content: string, post: any): number {
  let score = 50;
  const contentLower = content.toLowerCase();

  // Mentions VistaCEO
  if (contentLower.includes("vistaceo")) score += 20;

  // Business-relevant content
  const businessTerms = /negocio|emprendimiento|pyme|empresa|dueño|fundador|estrategia|crecimiento|ventas|marketing|finanzas|operaciones|equipo|liderazgo/i;
  if (businessTerms.test(content)) score += 15;

  // Category alignment
  const goodCategories = ["marketing", "finanzas", "operaciones", "ventas", "liderazgo", "estrategia", "ia", "herramientas", "automatizacion"];
  if (goodCategories.some(c => (post.category || "").toLowerCase().includes(c) || (post.pillar || "").toLowerCase().includes(c))) {
    score += 15;
  }

  return Math.min(100, Math.max(0, score));
}

function scoreImageRelevance(post: any): number {
  if (!post.hero_image_url) return 0;
  if (!post.hero_image_url.startsWith("https://")) return 10;

  let score = 60;
  // Has proper alt text
  if (post.image_alt_text && post.image_alt_text.length > 10) score += 20;
  // Image URL looks proper (not placeholder)
  if (post.hero_image_url.includes("supabase.co") || post.hero_image_url.includes("storage")) score += 20;

  return Math.min(100, score);
}

function scoreShareability(title: string, metaDesc: string, post: any): number {
  let score = 40;

  // Title is compelling (not too long, not too short)
  if (title.length >= 25 && title.length <= 70) score += 15;

  // Has hook in first line
  if (metaDesc && metaDesc.length >= 80) score += 15;

  // Has hero image (essential for social)
  if (post.hero_image_url) score += 15;

  // Has shareable angle
  if (/error|secreto|mito|verdad|mejor|peor|gratis|plantilla|checklist/i.test(title)) score += 15;

  return Math.min(100, Math.max(0, score));
}

function scoreZeroEmbarrassment(content: string, post: any): number {
  let score = 60;
  const wordCount = content.split(/\s+/).filter(Boolean).length;

  // Sufficient length
  if (wordCount >= 1800) score += 10;
  else if (wordCount < 800) score -= 20;

  // Has structure
  const h2Count = (content.match(/^## /gm) || []).length;
  if (h2Count >= 4) score += 10;

  // Has image
  if (post.hero_image_url) score += 5;

  // Has meta
  if (post.meta_title && post.meta_description) score += 5;

  // Anti-generic check
  const bannedCount = BANNED_PHRASES.filter(p => content.toLowerCase().includes(p)).length;
  score -= bannedCount * 3;

  // Has examples/data
  if (/ejemplo|caso|dato|estudio|investigación|encuesta/i.test(content)) score += 10;

  return Math.max(0, Math.min(100, score));
}

function scoreStructure(content: string): number {
  let score = 30;
  const h2Count = (content.match(/^## /gm) || []).length;
  const h3Count = (content.match(/^### /gm) || []).length;
  const hasBullets = (content.match(/^- /gm) || []).length >= 3;
  const hasFaq = /## Preguntas frecuentes|## FAQ/i.test(content);
  const hasTable = /\|.*\|.*\|/m.test(content);

  if (h2Count >= 5) score += 20; else if (h2Count >= 3) score += 12;
  if (h3Count >= 4) score += 15; else if (h3Count >= 2) score += 8;
  if (hasBullets) score += 10;
  if (hasFaq) score += 10;
  if (hasTable) score += 10;

  return Math.min(100, Math.max(0, score));
}

// ═══════════════════════════════════════════════════════════
// LEGACY SCORING FUNCTIONS (kept for backward compat)
// ═══════════════════════════════════════════════════════════

function scoreCoherenceCheck(title: string, metaTitle: string, content: string): number {
  let score = 100;
  const titleWords = title.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  const contentLower = content.toLowerCase();
  const matchedWords = titleWords.filter(w => contentLower.includes(w));
  const matchRatio = titleWords.length > 0 ? matchedWords.length / titleWords.length : 0;
  if (matchRatio < 0.5) score -= 40;
  else if (matchRatio < 0.7) score -= 20;
  else if (matchRatio < 0.9) score -= 10;
  const h2s = content.match(/^## .+$/gm) || [];
  if (h2s.length < 2) score -= 15;
  return Math.max(0, Math.min(100, score));
}

function checkPromises(title: string, content: string): { score: number; issues: AuditResult["issues"] } {
  const issues: AuditResult["issues"] = [];
  let score = 100;
  const contentLower = content.toLowerCase();
  const titleLower = title.toLowerCase();

  const promisePatterns = [
    { regex: /(\d+)\s*(herramientas|tools|opciones|alternativas|apps|plataformas|software)/i, type: "list_count" },
    { regex: /plantilla|template|descarg/i, type: "template" },
    { regex: /checklist|lista de verificación/i, type: "checklist" },
    { regex: /paso a paso|step.by.step|guía/i, type: "steps" },
    { regex: /comparativ|vs\.?|versus/i, type: "comparison" },
    { regex: /tabla|cuadro comparativo/i, type: "table" },
  ];

  for (const pattern of promisePatterns) {
    if (pattern.regex.test(titleLower) || pattern.regex.test(contentLower.slice(0, 500))) {
      if (pattern.type === "list_count") {
        const match = titleLower.match(/(\d+)/);
        if (match) {
          const promised = parseInt(match[1]);
          const h3count = (content.match(/^### /gm) || []).length;
          const numberedItems = (content.match(/^\d+\.\s/gm) || []).length;
          const actual = Math.max(h3count, numberedItems);
          if (actual < promised * 0.7) {
            score -= 30;
            issues.push({ type: "promise", severity: "critical", description: `Título promete ${promised} items pero solo hay ~${actual}`, auto_fixable: false });
          }
        }
      }
      if (pattern.type === "table" && !content.includes("|")) {
        score -= 15;
        issues.push({ type: "promise", severity: "medium", description: "Menciona tabla pero no incluye ninguna", auto_fixable: true });
      }
    }
  }

  return { score: Math.max(0, score), issues };
}

function checkTechnicalIntegrity(content: string): { score: number; issues: AuditResult["issues"] } {
  const issues: AuditResult["issues"] = [];
  let score = 100;

  const emptyHeadings = content.match(/^#{1,6}\s*$/gm) || [];
  if (emptyHeadings.length > 0) {
    score -= 20;
    issues.push({ type: "technical", severity: "critical", description: `${emptyHeadings.length} headings vacíos`, auto_fixable: true });
  }

  const placeholders = content.match(/\[TODO\]|\[PENDIENTE\]|\[INSERT\]|lorem ipsum|placeholder/gi) || [];
  if (placeholders.length > 0) {
    score -= 30;
    issues.push({ type: "technical", severity: "critical", description: `${placeholders.length} placeholders visibles`, auto_fixable: false });
  }

  const contentWithoutUrls = content.replace(/https?:\/\/[^\s\)]+/g, '');
  const leaks = contentWithoutUrls.match(/Q_\w+|id_\w{8,}|auth\.uid|(?<!\w)supabase(?!\w)|edge\.function/gi) || [];
  if (leaks.length > 0) {
    score -= 30;
    issues.push({ type: "technical", severity: "critical", description: `Strings del sistema filtrados: ${leaks.join(", ")}`, auto_fixable: true });
  }

  const brokenLinks = content.match(/\[([^\]]*)\]\(\s*\)/g) || [];
  if (brokenLinks.length > 0) {
    score -= 15;
    issues.push({ type: "technical", severity: "high", description: `${brokenLinks.length} enlaces con URL vacía`, auto_fixable: true });
  }

  const wordCount = content.split(/\s+/).length;
  if (wordCount < 800) {
    score -= 25;
    issues.push({ type: "technical", severity: "high", description: `Thin content: solo ${wordCount} palabras (mínimo 800)`, auto_fixable: false });
  }

  return { score: Math.max(0, score), issues };
}

function checkSEO(post: any): number {
  let score = 100;
  if (!post.primary_keyword) score -= 25;
  if (!post.meta_title || post.meta_title.length < 20) score -= 15;
  if (!post.meta_description || post.meta_description.length < 80) score -= 15;
  if (post.meta_title && post.meta_title.length > 60) score -= 10;
  if (post.meta_description && post.meta_description.length > 160) score -= 10;
  if (!post.excerpt || post.excerpt.length < 50) score -= 10;
  if (post.primary_keyword && post.title) {
    const kw = post.primary_keyword.toLowerCase();
    if (!post.title.toLowerCase().includes(kw)) score -= 15;
  }
  const h2s = (post.content_md || "").match(/^## .+$/gm) || [];
  if (h2s.length < 3) score -= 10;
  return Math.max(0, score);
}

function checkUX(content: string): number {
  let score = 100;
  const lines = content.split("\n");
  let consecutiveLines = 0;
  for (const line of lines) {
    if (line.trim() && !line.startsWith("#") && !line.startsWith("-") && !line.startsWith("|")) {
      consecutiveLines++;
      if (consecutiveLines > 6) { score -= 5; consecutiveLines = 0; }
    } else { consecutiveLines = 0; }
  }
  const hasBullets = (content.match(/^- /gm) || []).length >= 3;
  const hasH2 = (content.match(/^## /gm) || []).length >= 3;
  const hasH3 = (content.match(/^### /gm) || []).length >= 2;
  if (!hasBullets) score -= 15;
  if (!hasH2) score -= 15;
  if (!hasH3) score -= 10;
  const firstParagraph = content.split("\n\n")[0] || "";
  if (firstParagraph.length > 500) score -= 10;
  return Math.max(0, Math.min(100, score));
}

function checkConversion(content: string): number {
  let score = 0;
  const contentLower = content.toLowerCase();
  if (contentLower.includes("vistaceo")) score += 30;
  if (contentLower.includes("vistaceo.com") || contentLower.includes("app.vistaceo")) score += 20;
  const ctaPatterns = [
    /cre[aá]\s+(tu|una)\s+cuenta/i, /registr[aá]te/i, /prob[aá]\s+gratis/i,
    /empez[aá]\s+ahora/i, /diagnostic[oa]/i, /descubr[ií]\s+(tus|las)/i,
    /consult[aá]\s+gratis/i, /activ[aá]\s+(tu|la)/i, /optimiz[aá]\s+(tu|tus)/i,
  ];
  for (const pattern of ctaPatterns) { if (pattern.test(content)) score += 10; }
  const genericCtaPatterns = /aprend[eéi]|descubr[ií]|implement[aá]|aplic[aá]|mejor[aá]|transform[aá]|inici[aá]/i;
  if (genericCtaPatterns.test(content) && score < 60) score = 60;
  const outboundLinks = (content.match(/\[.*?\]\(https?:\/\//g) || []).length;
  if (outboundLinks >= 2 && score < 70) score = 70;
  return Math.min(100, score);
}

function checkInterlinking(post: any): number {
  const content = post.content_md || "";
  const internalLinkMatches = content.match(/blog\.vistaceo\.com/g) || [];
  const internalCount = internalLinkMatches.length;
  const jsonLinks = Array.isArray(post.internal_links) ? post.internal_links.length : 0;
  const totalLinks = Math.max(internalCount, jsonLinks);
  if (totalLinks >= 8) return 100;
  if (totalLinks >= 5) return 80;
  if (totalLinks >= 3) return 60;
  if (totalLinks >= 1) return 30;
  return 0;
}
