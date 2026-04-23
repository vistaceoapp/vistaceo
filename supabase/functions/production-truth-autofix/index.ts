import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * PRODUCTION TRUTH AUTOFIX v2
 * 
 * Self-improving autonomous system that:
 * 1. Structural fixes (duplicate FAQs, legacy templates, title mismatches, categories)
 * 2. AI-powered content improvement for posts still below quality threshold
 * 3. Triggers reindexing after fixes
 * 4. Logs everything for admin traceability
 */

interface FixResult {
  slug: string;
  title: string;
  fixes_applied: string[];
  fixes_failed: string[];
  ai_improved: boolean;
  new_score_estimate: number;
  status: "fixed" | "partially_fixed" | "skipped" | "error";
}

// ═══ STRUCTURAL FIX FUNCTIONS ═══

function fixDuplicateFAQs(content: string): { fixed: string; applied: boolean; detail: string } {
  const lines = content.split("\n");
  const headingCounts: Record<string, number[]> = {};
  
  lines.forEach((line, i) => {
    const match = line.match(/^(#{2,3})\s+(.+)$/);
    if (match) {
      const key = match[2].toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
      if (!headingCounts[key]) headingCounts[key] = [];
      headingCounts[key].push(i);
    }
  });
  
  const linesToRemove = new Set<number>();
  let duplicatesFound = 0;
  
  for (const [, indices] of Object.entries(headingCounts)) {
    if (indices.length <= 1) continue;
    duplicatesFound += indices.length - 1;
    
    for (let k = 1; k < indices.length; k++) {
      const startLine = indices[k];
      const headingLevel = (lines[startLine].match(/^(#+)/) || ["##"])[0].length;
      let endLine = startLine + 1;
      
      while (endLine < lines.length) {
        const nextMatch = lines[endLine].match(/^(#+)\s/);
        if (nextMatch && nextMatch[1].length <= headingLevel) break;
        endLine++;
      }
      
      for (let j = startLine; j < endLine; j++) {
        linesToRemove.add(j);
      }
    }
  }
  
  if (linesToRemove.size === 0) {
    return { fixed: content, applied: false, detail: "" };
  }
  
  const fixedLines = lines.filter((_, i) => !linesToRemove.has(i));
  const cleaned = fixedLines.join("\n").replace(/\n{4,}/g, "\n\n\n");
  
  return {
    fixed: cleaned,
    applied: true,
    detail: `Eliminadas ${duplicatesFound} secciones duplicadas (${linesToRemove.size} líneas)`
  };
}

function fixLegacyTemplateSections(content: string): { fixed: string; applied: boolean; detail: string } {
  const legacyPatterns = [
    /^## .*en 2 minutos.*\n[\s\S]*?(?=\n## |\n---|\Z)/gim,
    /^## .*para qui[eé]n es.*\(y para qui[eé]n no\).*\n[\s\S]*?(?=\n## |\n---|\Z)/gim,
    /^## .*la idea clave.*\n[\s\S]*?(?=\n## |\n---|\Z)/gim,
    /^## .*qu[eé] cambia en la pr[aá]ctica.*\n[\s\S]*?(?=\n## |\n---|\Z)/gim,
    /^## .*pr[oó]ximos 3 pasos.*\n[\s\S]*?(?=\n## |\n---|\Z)/gim,
    /^## .*para profundizar.*\n[\s\S]*?(?=\n## |\n---|\Z)/gim,
  ];
  
  let result = content;
  let removedCount = 0;
  
  for (const pattern of legacyPatterns) {
    const matches = result.match(pattern);
    if (matches) {
      removedCount += matches.length;
      result = result.replace(pattern, "\n");
    }
  }
  
  if (removedCount === 0) {
    return { fixed: content, applied: false, detail: "" };
  }
  
  result = result.replace(/\n{4,}/g, "\n\n\n").trim();
  
  return {
    fixed: result,
    applied: true,
    detail: `Eliminadas ${removedCount} secciones de plantilla legacy`
  };
}

function fixGenericFAQs(content: string): { fixed: string; applied: boolean; detail: string } {
  // Remove generic FAQ patterns like "¿Qué es [title]?", "¿Cómo empezar con [title]?", "¿Necesito herramientas especiales?"
  const genericFaqPatterns = [
    /^###?\s*¿(?:que|qué) es .*?\?\n[\s\S]*?(?=\n###? |\n## |\n---|\Z)/gim,
    /^###?\s*¿(?:como|cómo) empezar .*?\?\n[\s\S]*?(?=\n###? |\n## |\n---|\Z)/gim,
    /^###?\s*¿necesito herramientas especiales\?.*\n[\s\S]*?(?=\n###? |\n## |\n---|\Z)/gim,
  ];
  
  let result = content;
  let removedCount = 0;
  
  for (const pattern of genericFaqPatterns) {
    const matches = result.match(pattern);
    if (matches && matches.length > 1) {
      // Keep the first, remove the rest
      let firstFound = false;
      result = result.replace(pattern, (match) => {
        if (!firstFound) { firstFound = true; return match; }
        removedCount++;
        return "\n";
      });
    }
  }
  
  if (removedCount === 0) {
    return { fixed: content, applied: false, detail: "" };
  }
  
  result = result.replace(/\n{4,}/g, "\n\n\n").trim();
  return { fixed: result, applied: true, detail: `Eliminadas ${removedCount} FAQs genéricas duplicadas` };
}

function fixTitleH1Mismatch(title: string, metaTitle: string | null): { newMetaTitle: string; applied: boolean; detail: string } {
  if (!metaTitle) {
    const truncated = title.length > 55 ? title.slice(0, 55).replace(/\s\S*$/, "") + "…" : title;
    return { newMetaTitle: truncated, applied: true, detail: `Meta title generado desde H1` };
  }
  
  const cleanTitle = title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const cleanMeta = metaTitle.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s*\|\s*vistaceo\s*$/i, "");
  
  const titleTokens = new Set(cleanTitle.split(/\s+/).filter(w => w.length > 3));
  const metaTokens = new Set(cleanMeta.split(/\s+/).filter(w => w.length > 3));
  const overlap = [...titleTokens].filter(t => metaTokens.has(t)).length;
  const ratio = overlap / Math.max(titleTokens.size, 1);
  
  if (ratio < 0.3) {
    const coreWords = title.split(/[:\-–—|]/).map(s => s.trim()).filter(s => s.length > 3);
    const shortTitle = coreWords[0]?.slice(0, 55) || title.slice(0, 55);
    const newMeta = shortTitle;
    return { newMetaTitle: newMeta, applied: true, detail: `Meta title realineado (overlap era ${Math.round(ratio * 100)}%)` };
  }
  
  return { newMetaTitle: metaTitle, applied: false, detail: "" };
}

function detectBestCategory(content: string, title: string): string | null {
  const CATEGORY_SIGNALS: Record<string, string[]> = {
    "empleo-habilidades": ["empleo", "trabajo", "carrera", "cv", "entrevista", "habilidades", "talento", "reclutamiento", "perfil profesional"],
    "ia-para-pymes": ["ia para", "inteligencia artificial", "chatgpt", "automatizar con ia", "chatbot", "deepseek", "claude"],
    "finanzas-cashflow": ["finanzas", "cash flow", "costos", "margen", "precio", "presupuesto", "facturación", "rentabilidad"],
    "ventas-negociacion": ["ventas", "vender", "negociar", "cerrar", "prospecto", "pipeline", "clientes"],
    "liderazgo-management": ["liderazgo", "líder", "equipo", "management", "cultura", "delegación", "gestión de equipos"],
    "marketing-crecimiento": ["marketing", "contenido", "redes sociales", "marca", "branding", "funnel", "growth"],
    "operaciones-procesos": ["operaciones", "procesos", "eficiencia", "workflow", "automatizar procesos", "logística"],
    "estrategia-latam": ["estrategia", "latam", "escalar", "modelo de negocio", "expansión", "emprender"],
    "herramientas-productividad": ["herramientas", "productividad", "apps", "software", "notion", "zapier", "make"],
    "tendencias-ia-tech": ["tendencias", "futuro", "agentes ia", "multimodal", "2026"],
    "data-analytics": ["data", "analytics", "datos", "métricas", "dashboard", "kpi"],
    "servicios-profesionales-rentabilidad": ["servicios profesionales", "consultoría", "freelance", "honorarios"],
  };
  
  const text = `${title} ${content.slice(0, 3000)}`.toLowerCase();
  let bestCat = "";
  let bestScore = 0;
  
  for (const [cat, keywords] of Object.entries(CATEGORY_SIGNALS)) {
    const score = keywords.filter(k => text.includes(k)).length;
    if (score > bestScore) { bestScore = score; bestCat = cat; }
  }
  
  return bestScore >= 2 ? bestCat : null;
}

// ═══ AI CONTENT IMPROVEMENT ═══

const AI_IMPROVE_PROMPT = `Sos el Editor Final del blog VistaCEO. Recibís una nota que ya pasó correcciones estructurales pero necesita mejora de calidad editorial.

TU MISIÓN: Reescribir el contenido para que sea excelente, no genérico.

REGLAS:
1. Mantené TODO el contenido valioso que ya existe
2. Eliminá cualquier sección repetida o redundante que detectes
3. Mejorá introducciones débiles (primeros 2 párrafos deben ser magnéticos)
4. Asegurate de que cada H2 aporte valor real y no sea relleno
5. Agregá ejemplos concretos de LATAM donde falten
6. Las FAQs deben ser ÚNICAS y ÚTILES, no genéricas
7. El cierre debe tener un paso concreto, no un CTA genérico
8. NO uses frases como "en el mundo actual", "en la era digital", "es fundamental"
9. NO repitas la keyword principal más de 3 veces
10. Párrafos de 1-2 oraciones máximo
11. Tono: profesional, directo, humano, español LATAM neutral

FORMATO: Solo devolvé el markdown limpio. Sin H1. Sin frontmatter. Sin explicaciones.`;

async function aiImproveContent(
  post: { id: string; title: string; content_md: string; category: string; primary_keyword: string },
  lovableApiKey: string
): Promise<string | null> {
  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: AI_IMPROVE_PROMPT },
          { role: "user", content: `NOTA: "${post.title}"\nCATEGORÍA: ${post.category}\nKEYWORD: ${post.primary_keyword}\n\nCONTENIDO:\n${post.content_md.slice(0, 12000)}` }
        ],
        max_tokens: 8000,
        temperature: 0.5,
      }),
    });

    if (!response.ok) {
      console.error(`[autofix-ai] AI call failed: ${response.status}`);
      return null;
    }

    const result = await response.json();
    let text = result.choices?.[0]?.message?.content || "";
    text = text.trim().replace(/^```markdown\n?/i, "").replace(/\n?```$/i, "");
    text = text.replace(/^---\n[\s\S]*?\n---\n?/m, "");
    
    // Validate output is substantial
    if (text.length < post.content_md.length * 0.5) {
      console.error(`[autofix-ai] Output too short (${text.length} vs ${post.content_md.length})`);
      return null;
    }
    
    return text;
  } catch (err) {
    console.error(`[autofix-ai] Error:`, err);
    return null;
  }
}

// ═══ QUALITY SCORING ═══

function calculatePostScore(content: string, title: string, metaTitle: string | null): number {
  let score = 100;
  const lines = content.split("\n");
  const wordCount = content.split(/\s+/).length;
  
  // Check for duplicate headings
  const headings = lines.filter(l => /^#{2,3}\s/.test(l)).map(l => l.toLowerCase().trim());
  const uniqueHeadings = new Set(headings);
  if (uniqueHeadings.size < headings.length) score -= 15;
  
  // Check word count
  if (wordCount < 1200) score -= 10;
  if (wordCount < 800) score -= 10;
  
  // Check H2 count
  const h2Count = lines.filter(l => /^## /.test(l)).length;
  if (h2Count < 3) score -= 8;
  
  // Check for generic phrases
  const genericPhrases = ["en el mundo actual", "en la era digital", "es fundamental", "es importante destacar"];
  const lowerContent = content.toLowerCase();
  for (const phrase of genericPhrases) {
    if (lowerContent.includes(phrase)) score -= 3;
  }
  
  // Check title/meta alignment
  if (metaTitle) {
    const cleanT = title.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    const cleanM = metaTitle.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    const overlap = cleanT.filter(w => cleanM.some(m => m.includes(w))).length;
    if (overlap / Math.max(cleanT.length, 1) < 0.3) score -= 8;
  }
  
  // Check internal links
  const linkCount = (content.match(/\[.*?\]\(\/.*?\)/g) || []).length;
  if (linkCount < 2) score -= 5;
  
  return Math.max(0, Math.min(100, score));
}

// ═══ MAIN HANDLER ═══

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY") || "";

    let mode: "critical_only" | "all" | "single" = "all";
    let targetSlug: string | null = null;
    let dryRun = false;
    let enableAI = true;
    
    try {
      const body = await req.json();
      mode = body.mode || "all";
      targetSlug = body.slug || null;
      dryRun = body.dry_run || false;
      enableAI = body.enable_ai !== false;
      if (targetSlug) mode = "single";
    } catch { /* no body */ }

    // Fetch posts
    let query = supabase
      .from("blog_posts")
      .select("id, slug, title, category, meta_title, meta_description, content_md, primary_keyword, hero_image_url, status")
      .eq("status", "published")
      .order("publish_at", { ascending: false });

    if (mode === "single" && targetSlug) {
      query = query.eq("slug", targetSlug);
    } else {
      query = query.limit(100);
    }

    const { data: posts, error } = await query;
    if (error) throw error;
    if (!posts || posts.length === 0) {
      return new Response(JSON.stringify({ results: [], summary: { total_scanned: 0 } }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results: FixResult[] = [];
    let totalFixed = 0;
    let totalAIImproved = 0;
    let totalSkipped = 0;
    const MAX_FIXES_PER_RUN = 10; // Cost-optimized: reduced from 20
    const MAX_AI_PER_RUN = 2; // Cost-optimized: reduced from 5

    for (const post of posts) {
      if (totalFixed >= MAX_FIXES_PER_RUN) break;
      
      const content = post.content_md || "";
      const fixesApplied: string[] = [];
      const fixesFailed: string[] = [];
      let currentContent = content;
      let needsUpdate = false;
      const updates: Record<string, unknown> = {};

      // 1. Fix duplicate FAQs / headings
      const faqFix = fixDuplicateFAQs(currentContent);
      if (faqFix.applied) {
        currentContent = faqFix.fixed;
        fixesApplied.push(faqFix.detail);
        needsUpdate = true;
      }

      // 2. Fix generic FAQ spam
      const genericFix = fixGenericFAQs(currentContent);
      if (genericFix.applied) {
        currentContent = genericFix.fixed;
        fixesApplied.push(genericFix.detail);
        needsUpdate = true;
      }

      // 3. Fix legacy template sections
      const templateFix = fixLegacyTemplateSections(currentContent);
      if (templateFix.applied) {
        currentContent = templateFix.fixed;
        fixesApplied.push(templateFix.detail);
        needsUpdate = true;
      }

      // 4. Fix title/H1 mismatch
      const titleFix = fixTitleH1Mismatch(post.title, post.meta_title);
      if (titleFix.applied) {
        updates.meta_title = titleFix.newMetaTitle;
        fixesApplied.push(titleFix.detail);
        needsUpdate = true;
      }

      // 5. Fix category mismatch
      const bestCat = detectBestCategory(currentContent, post.title);
      if (bestCat && bestCat !== post.category) {
        updates.category = bestCat;
        fixesApplied.push(`Categoría: "${post.category}" → "${bestCat}"`);
        needsUpdate = true;
      }

      // 6. Calculate score after structural fixes
      const scoreAfterFixes = calculatePostScore(currentContent, post.title, (updates.meta_title as string) || post.meta_title);
      
      // 7. AI improvement if score is still below 90 and AI is enabled
      let aiImproved = false;
      if (enableAI && lovableApiKey && scoreAfterFixes < 75 && totalAIImproved < MAX_AI_PER_RUN) { // Cost-optimized: only AI-improve truly weak posts (was < 90)
        console.log(`[autofix] AI improving "${post.slug}" (score: ${scoreAfterFixes})`);
        const improved = await aiImproveContent(
          {
            id: post.id,
            title: post.title,
            content_md: currentContent,
            category: post.category || "general",
            primary_keyword: post.primary_keyword || post.title,
          },
          lovableApiKey
        );
        
        if (improved) {
          currentContent = improved;
          aiImproved = true;
          totalAIImproved++;
          fixesApplied.push(`Contenido mejorado por IA (score previo: ${scoreAfterFixes})`);
          needsUpdate = true;
        }
      }

      if (!needsUpdate) {
        totalSkipped++;
        continue;
      }

      // Apply updates
      const finalScore = calculatePostScore(currentContent, post.title, (updates.meta_title as string) || post.meta_title);
      
      if (!dryRun) {
        if (currentContent !== content) {
          updates.content_md = currentContent;
        }
        updates.updated_at = new Date().toISOString();

        const { error: updateError } = await supabase
          .from("blog_posts")
          .update(updates)
          .eq("id", post.id);

        if (updateError) {
          fixesFailed.push(`Error DB: ${updateError.message}`);
        } else {
          // Update registry score
          await supabase
            .from("blog_content_registry")
            .update({
              score_global: finalScore,
              pipeline_state: finalScore >= 90 ? "published" : "needs_improvement",
              last_improved_at: new Date().toISOString(),
              fix_history: [
                { at: new Date().toISOString(), fixes: fixesApplied, ai: aiImproved, score_before: scoreAfterFixes, score_after: finalScore }
              ],
            })
            .eq("post_id", post.id);
        }
      }

      totalFixed++;
      results.push({
        slug: post.slug,
        title: post.title,
        fixes_applied: fixesApplied,
        fixes_failed: fixesFailed,
        ai_improved: aiImproved,
        new_score_estimate: finalScore,
        status: fixesFailed.length === 0 ? "fixed" : "partially_fixed",
      });
    }

    // Log run
    if (!dryRun && results.some(r => r.status === "fixed")) {
      await supabase.from("blog_runs").insert({
        result: "published",
        notes: `[AutoFix v2] ${totalFixed} notas corregidas, ${totalAIImproved} mejoradas con IA. ${results.flatMap(r => r.fixes_applied).length} fixes totales.`,
        quality_gate_report: {
          autofix_v2: true,
          fixed_count: totalFixed,
          ai_improved_count: totalAIImproved,
          skipped_count: totalSkipped,
          fixes: results.map(r => ({ slug: r.slug, fixes: r.fixes_applied, ai: r.ai_improved, score: r.new_score_estimate })),
        },
      });
    }

    const summary = {
      mode,
      dry_run: dryRun,
      ai_enabled: enableAI,
      total_scanned: posts.length,
      total_fixed: totalFixed,
      total_ai_improved: totalAIImproved,
      total_skipped: totalSkipped,
      fixes_applied: results.flatMap(r => r.fixes_applied).length,
    };

    console.log(`[production-truth-autofix] ${JSON.stringify(summary)}`);

    return new Response(JSON.stringify({ results, summary }, null, 2), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("[production-truth-autofix] Error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
