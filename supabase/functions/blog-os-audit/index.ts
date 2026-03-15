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
  score_global: number;
}

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
        .select("id, slug, title, content_md, meta_title, meta_description, excerpt, hero_image_url, pillar, category, tags, primary_keyword, secondary_keywords, internal_links, external_sources, publish_at, status")
        .eq("status", "published")
        .order("publish_at", { ascending: false });

      if (error) throw error;

      const results: AuditResult[] = [];
      for (const post of posts || []) {
        const result = await auditPost(supabase, post.id, auto_fix, post);
        results.push(result);
      }

      const summary = {
        total: results.length,
        passing: results.filter(r => r.score_global >= 94).length,
        failing: results.filter(r => r.score_global < 94).length,
        critical_issues: results.reduce((acc, r) => acc + r.issues.filter(i => i.severity === "critical").length, 0),
        avg_score: results.length ? Math.round(results.reduce((a, r) => a + r.score_global, 0) / results.length) : 0,
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

async function auditPost(supabase: any, postId: string, autoFix: boolean, postData?: any): Promise<AuditResult> {
  // Fetch post if not provided
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

  const issues: AuditResult["issues"] = [];
  const faultRadar: string[] = [];

  // === GATE A: Coherencia título–contenido ===
  const scoreCoherence = scoreCoherenceCheck(title, metaTitle, content);

  // === GATE B: Promesas y entregables ===
  const { score: scorePromises, issues: promiseIssues } = checkPromises(title, content);
  issues.push(...promiseIssues);
  if (promiseIssues.length > 0) faultRadar.push("título promete más que entrega");

  // === GATE C: Integridad técnica visual ===
  const { score: scoreTechnical, issues: techIssues } = checkTechnicalIntegrity(content);
  issues.push(...techIssues);

  // === GATE D: SEO semántico ===
  const scoreSeo = checkSEO(post);
  if (!post.primary_keyword) {
    issues.push({ type: "seo", severity: "high", description: "Sin keyword primaria", auto_fixable: false });
  }
  if (!metaDesc || metaDesc.length < 50) {
    issues.push({ type: "seo", severity: "high", description: "Meta description ausente o muy corta", auto_fixable: true });
  }

  // === GATE E: UX humana ===
  const scoreUx = checkUX(content);

  // === GATE F: Conversión VISTACEO ===
  const scoreConversion = checkConversion(content);
  if (scoreConversion < 50) {
    faultRadar.push("CTA mal ubicado");
    issues.push({ type: "conversion", severity: "medium", description: "Sin CTAs contextuales hacia VISTACEO", auto_fixable: true });
  }

  // === Interlinking ===
  const scoreInterlinking = checkInterlinking(post);
  if (scoreInterlinking < 50) {
    issues.push({ type: "interlinking", severity: "medium", description: "Menos de 4 enlaces internos", auto_fixable: true });
  }

  // Calculate global score (weighted)
  const scoreGlobal = Math.round(
    scoreCoherence * 0.20 +
    scorePromises * 0.20 +
    scoreTechnical * 0.15 +
    scoreSeo * 0.15 +
    scoreInterlinking * 0.10 +
    scoreUx * 0.10 +
    scoreConversion * 0.10
  );

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
    score_global: scoreGlobal,
    score_coherence: scoreCoherence,
    score_promises: scorePromises,
    score_technical: scoreTechnical,
    score_seo: scoreSeo,
    score_interlinking: scoreInterlinking,
    score_ux: scoreUx,
    score_conversion: scoreConversion,
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

  // Create tasks for critical issues
  if (issues.some(i => i.severity === "critical")) {
    await supabase.from("blog_task_queue").insert({
      registry_id: registryId,
      post_id: post.id,
      queue: "Q1",
      priority: 1,
      task_type: "critical_fix",
      description: `Arreglar ${issues.filter(i => i.severity === "critical").length} issues críticos en "${title}"`,
      status: "pending",
      payload: { issues: issues.filter(i => i.severity === "critical") },
    });
  }

  return {
    post_id: post.id,
    scores: {
      coherence: scoreCoherence,
      promises: scorePromises,
      technical: scoreTechnical,
      seo: scoreSeo,
      interlinking: scoreInterlinking,
      ux: scoreUx,
      conversion: scoreConversion,
    },
    issues,
    fault_radar: faultRadar,
    score_global: scoreGlobal,
  };
}

// ============= SCORING FUNCTIONS =============

function scoreCoherenceCheck(title: string, metaTitle: string, content: string): number {
  let score = 100;
  const titleWords = title.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  const contentLower = content.toLowerCase();

  // Check if title keywords appear in content
  const matchedWords = titleWords.filter(w => contentLower.includes(w));
  const matchRatio = titleWords.length > 0 ? matchedWords.length / titleWords.length : 0;
  if (matchRatio < 0.5) score -= 40;
  else if (matchRatio < 0.7) score -= 20;
  else if (matchRatio < 0.9) score -= 10;

  // Check if meta title matches
  if (metaTitle && metaTitle !== title) {
    const metaWords = metaTitle.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    const metaMatch = metaWords.filter(w => contentLower.includes(w));
    if (metaMatch.length / metaWords.length < 0.5) score -= 10;
  }

  // Check H2s exist and relate to title
  const h2s = content.match(/^## .+$/gm) || [];
  if (h2s.length < 2) score -= 15;

  return Math.max(0, Math.min(100, score));
}

function checkPromises(title: string, content: string): { score: number; issues: AuditResult["issues"] } {
  const issues: AuditResult["issues"] = [];
  let score = 100;
  const contentLower = content.toLowerCase();
  const titleLower = title.toLowerCase();

  // Detect promise patterns
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
            issues.push({
              type: "promise",
              severity: "critical",
              description: `Título promete ${promised} items pero solo hay ~${actual}`,
              auto_fixable: false,
            });
          }
        }
      }
      if (pattern.type === "checklist" && !content.includes("- [ ]") && !content.includes("- [x]") && (content.match(/^- /gm) || []).length < 5) {
        score -= 20;
        issues.push({ type: "promise", severity: "high", description: "Promete checklist pero no tiene lista suficiente", auto_fixable: true });
      }
      if (pattern.type === "template" && !content.match(/```|<template|descarg|copi[aá]/i)) {
        score -= 15;
        issues.push({ type: "promise", severity: "high", description: "Promete plantilla pero no incluye recurso copiable", auto_fixable: true });
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

  // Check for empty headings
  const emptyHeadings = content.match(/^#{1,6}\s*$/gm) || [];
  if (emptyHeadings.length > 0) {
    score -= 20;
    issues.push({ type: "technical", severity: "critical", description: `${emptyHeadings.length} headings vacíos`, auto_fixable: true });
  }

  // Check for broken markdown
  const unclosedBold = (content.match(/\*\*/g) || []).length % 2 !== 0;
  if (unclosedBold) {
    score -= 10;
    issues.push({ type: "technical", severity: "medium", description: "Negritas sin cerrar en markdown", auto_fixable: true });
  }

  // Check for placeholder text
  const placeholders = content.match(/\[TODO\]|\[PENDIENTE\]|\[INSERT\]|lorem ipsum|placeholder/gi) || [];
  if (placeholders.length > 0) {
    score -= 30;
    issues.push({ type: "technical", severity: "critical", description: `${placeholders.length} placeholders visibles`, auto_fixable: false });
  }

  // Check for leaked system strings (exclude storage URLs which legitimately contain "supabase")
  const contentWithoutUrls = content.replace(/https?:\/\/[^\s\)]+/g, '');
  const leaks = contentWithoutUrls.match(/Q_\w+|id_\w{8,}|auth\.uid|(?<!\w)supabase(?!\w)|edge\.function/gi) || [];
  if (leaks.length > 0) {
    score -= 30;
    issues.push({ type: "technical", severity: "critical", description: `Strings del sistema filtrados: ${leaks.join(", ")}`, auto_fixable: true });
  }

  // Check for broken links syntax
  const brokenLinks = content.match(/\[([^\]]*)\]\(\s*\)/g) || [];
  if (brokenLinks.length > 0) {
    score -= 15;
    issues.push({ type: "technical", severity: "high", description: `${brokenLinks.length} enlaces con URL vacía`, auto_fixable: true });
  }

  // Thin content check
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

  // Check keyword in title
  if (post.primary_keyword && post.title) {
    const kw = post.primary_keyword.toLowerCase();
    if (!post.title.toLowerCase().includes(kw)) score -= 15;
  }

  // Check H2 structure
  const h2s = (post.content_md || "").match(/^## .+$/gm) || [];
  if (h2s.length < 3) score -= 10;

  return Math.max(0, score);
}

function checkUX(content: string): number {
  let score = 100;
  const lines = content.split("\n");

  // Check for giant text blocks (more than 6 consecutive non-empty, non-heading lines)
  let consecutiveLines = 0;
  for (const line of lines) {
    if (line.trim() && !line.startsWith("#") && !line.startsWith("-") && !line.startsWith("|")) {
      consecutiveLines++;
      if (consecutiveLines > 6) {
        score -= 5;
        consecutiveLines = 0;
      }
    } else {
      consecutiveLines = 0;
    }
  }

  // Check for scannable elements
  const hasBullets = (content.match(/^- /gm) || []).length >= 3;
  const hasH2 = (content.match(/^## /gm) || []).length >= 3;
  const hasH3 = (content.match(/^### /gm) || []).length >= 2;

  if (!hasBullets) score -= 15;
  if (!hasH2) score -= 15;
  if (!hasH3) score -= 10;

  // Intro length check (first paragraph)
  const firstParagraph = content.split("\n\n")[0] || "";
  if (firstParagraph.length > 500) score -= 10;

  return Math.max(0, Math.min(100, score));
}

function checkConversion(content: string): number {
  let score = 0;
  const contentLower = content.toLowerCase();

  // Check for VISTACEO mentions and CTAs
  if (contentLower.includes("vistaceo")) score += 30;
  if (contentLower.includes("vistaceo.com") || contentLower.includes("app.vistaceo")) score += 20;

  // Check for CTA patterns
  const ctaPatterns = [
    /cre[aá]\s+(tu|una)\s+cuenta/i,
    /registr[aá]te/i,
    /prob[aá]\s+gratis/i,
    /empez[aá]\s+ahora/i,
    /diagnostic[oa]/i,
    /descubr[ií]\s+(tus|las)/i,
    /consult[aá]\s+gratis/i,
    /activ[aá]\s+(tu|la)/i,
    /optimiz[aá]\s+(tu|tus)/i,
  ];

  for (const pattern of ctaPatterns) {
    if (pattern.test(content)) score += 10;
  }

  // Baseline: if the article has any call-to-action language, it deserves at least 60
  const genericCtaPatterns = /aprend[eéi]|descubr[ií]|implement[aá]|aplic[aá]|mejor[aá]|transform[aá]|inici[aá]/i;
  if (genericCtaPatterns.test(content) && score < 60) score = 60;
  
  // If there are at least 2 outbound links, give minimum 70
  const outboundLinks = (content.match(/\[.*?\]\(https?:\/\//g) || []).length;
  if (outboundLinks >= 2 && score < 70) score = 70;

  return Math.min(100, score);
}

function checkInterlinking(post: any): number {
  // Count actual internal links in content (more reliable than internal_links JSON field)
  const content = post.content_md || "";
  const internalLinkMatches = content.match(/blog\.vistaceo\.com/g) || [];
  const internalCount = internalLinkMatches.length;

  // Also check the JSON field as fallback
  const jsonLinks = Array.isArray(post.internal_links) ? post.internal_links.length : 0;
  const totalLinks = Math.max(internalCount, jsonLinks);

  if (totalLinks >= 8) return 100;
  if (totalLinks >= 5) return 80;
  if (totalLinks >= 3) return 60;
  if (totalLinks >= 1) return 30;
  return 0;
}
