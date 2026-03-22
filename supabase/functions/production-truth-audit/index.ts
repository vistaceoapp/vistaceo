import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * PRODUCTION TRUTH AUDIT — Verifica la realidad publicada, no intenciones internas.
 * 
 * 12 checks por URL:
 * A. No repetition
 * B. No template fingerprint
 * C. No polluted first screen
 * D. No generic FAQ spam
 * E. No duplicate intent with another URL
 * F. No misleading title/H1 mismatch
 * G. No weak snippet surface
 * H. No thin hub behavior
 * I. No fake metrics/example risk
 * J. No shallow internal linking
 * K. No category mismatch
 * L. No admin-reality mismatch
 */

interface AuditCheck {
  id: string;
  name: string;
  passed: boolean;
  severity: "critical" | "high" | "medium" | "low";
  detail: string;
}

interface PostAudit {
  slug: string;
  title: string;
  category: string | null;
  production_truth_score: number;
  status: "apta" | "apta_con_observaciones" | "riesgo_medio" | "riesgo_alto" | "critica";
  resumen: string;
  hallazgos: string[];
  impacto: string[];
  accion_ejecutada: string | null;
  accion_pendiente: string | null;
  proximo_paso: string;
  checks: AuditCheck[];
}

// ═══ DETECTION FUNCTIONS ═══

function detectRepeatedHeadings(content: string): { found: boolean; detail: string } {
  const headings = (content.match(/^#{2,3}\s+.+$/gm) || []).map(h =>
    h.replace(/^#{2,3}\s+/, "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim()
  );
  const counts: Record<string, number> = {};
  headings.forEach(h => { counts[h] = (counts[h] || 0) + 1; });
  const dupes = Object.entries(counts).filter(([, c]) => c > 1);
  if (dupes.length > 0) {
    return { found: true, detail: `Headings duplicados: ${dupes.map(([h, c]) => `"${h}" (${c}x)`).join(", ")}` };
  }
  return { found: false, detail: "Sin headings duplicados" };
}

function detectGenericFAQ(content: string): { found: boolean; detail: string } {
  const genericPatterns = [
    /¿qué es .+\?/i,
    /¿cómo empezar/i,
    /¿necesito herramientas especiales/i,
    /¿qué herramientas necesito/i,
    /¿es difícil/i,
    /¿cuánto tiempo toma/i,
    /¿funciona para cualquier/i,
  ];
  const faqSection = content.match(/## (?:Preguntas frecuentes|FAQ)[\s\S]*?(?=\n## |\n---|\Z)/i)?.[0] || "";
  const faqHeadings = (faqSection.match(/^###\s+.+$/gm) || []).map(h => h.replace(/^###\s+/, ""));
  const genericHits = faqHeadings.filter(h => genericPatterns.some(p => p.test(h)));
  
  if (genericHits.length >= 2) {
    return { found: true, detail: `${genericHits.length} FAQs genéricas: ${genericHits.join("; ")}` };
  }
  return { found: false, detail: `${faqHeadings.length} FAQs, ${genericHits.length} genéricas` };
}

function detectTemplateFingerprint(content: string, recentStructures: string[][]): { found: boolean; detail: string } {
  const headings = (content.match(/^## .+$/gm) || []).map(h =>
    h.replace(/^## /, "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim()
  );
  
  // Check legacy universal sections
  const legacySections = ["en 2 minutos", "para quien es", "la idea clave", "que cambia en la practica", "proximos 3 pasos"];
  const legacyHits = headings.filter(h => legacySections.some(l => h.includes(l)));
  if (legacyHits.length >= 3) {
    return { found: true, detail: `${legacyHits.length} secciones de plantilla legacy: ${legacyHits.join(", ")}` };
  }
  
  // Check overlap with recent posts
  for (const recent of recentStructures) {
    const overlap = headings.filter(h => recent.includes(h)).length;
    const ratio = overlap / Math.max(headings.length, 1);
    if (ratio > 0.6 && overlap >= 4) {
      return { found: true, detail: `${Math.round(ratio * 100)}% overlap estructural con post reciente (${overlap} H2 compartidos)` };
    }
  }
  
  return { found: false, detail: "Estructura única" };
}

function detectFirstScreenPollution(content: string): { found: boolean; detail: string } {
  const first500 = content.slice(0, 500);
  const polluters = [
    { pattern: /\[.*ir a sección.*\]/i, name: "TOC" },
    { pattern: /compartir|share/i, name: "Share widget" },
    { pattern: /% leído|progreso/i, name: "Progress bar" },
    { pattern: /\d+ min de lectura/i, name: "Reading time" },
  ];
  const hits = polluters.filter(p => p.pattern.test(first500));
  if (hits.length >= 2) {
    return { found: true, detail: `First screen contaminado: ${hits.map(h => h.name).join(", ")}` };
  }
  return { found: false, detail: "First screen limpio" };
}

function detectTitleH1Mismatch(title: string, metaTitle: string | null): { found: boolean; detail: string } {
  if (!metaTitle) return { found: false, detail: "Sin meta_title" };
  
  const cleanTitle = title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const cleanMeta = metaTitle.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s*\|\s*vistaceo\s*$/i, "");
  
  // Tokenize and compare
  const titleTokens = new Set(cleanTitle.split(/\s+/).filter(w => w.length > 3));
  const metaTokens = new Set(cleanMeta.split(/\s+/).filter(w => w.length > 3));
  const overlap = [...titleTokens].filter(t => metaTokens.has(t)).length;
  const ratio = overlap / Math.max(titleTokens.size, 1);
  
  if (ratio < 0.3) {
    return { found: true, detail: `Title y H1 muy diferentes (${Math.round(ratio * 100)}% overlap). Google puede reescribir.` };
  }
  return { found: false, detail: `Title/H1 coherentes (${Math.round(ratio * 100)}% overlap)` };
}

function detectWeakSnippetSurface(content: string): { found: boolean; detail: string } {
  const first1000 = content.slice(0, 1000);
  // Check if first substantial paragraph is after too many non-content elements
  const lines = first1000.split("\n").filter(l => l.trim());
  const firstSubstantialLine = lines.findIndex(l => 
    l.length > 80 && !l.startsWith("#") && !l.startsWith("-") && !l.startsWith(">") && !l.startsWith("!")
  );
  
  if (firstSubstantialLine > 5) {
    return { found: true, detail: `Primer párrafo sustancial aparece en línea ${firstSubstantialLine + 1}. Google puede tomar contenido accesorio.` };
  }
  return { found: false, detail: "Snippet surface limpia" };
}

function detectShallowInterlinking(content: string): { found: boolean; count: number; detail: string } {
  const internalLinks = (content.match(/\[[^\]]+\]\(https?:\/\/blog\.vistaceo\.com\/[^)]+\)/g) || []).length;
  const vistaceoLinks = (content.match(/\[[^\]]+\]\(https?:\/\/(?:www\.)?vistaceo\.com\/[^)]+\)/g) || []).length;
  const total = internalLinks + vistaceoLinks;
  
  if (total < 3) {
    return { found: true, count: total, detail: `Solo ${total} enlaces internos (mínimo 3)` };
  }
  return { found: false, count: total, detail: `${total} enlaces internos` };
}

function detectFakeMetrics(content: string): { found: boolean; detail: string } {
  // Detect suspiciously specific percentages/numbers without attribution
  const suspiciousPatterns = [
    /\b\d{2,3}%\s+(?:de las|de los|más)\b/g,
    /\bahorr[óa]\s+\$?\d[\d.,]+/g,
    /\bfactur[óa]\s+\$?\d[\d.,]+/g,
    /\bgenera?\s+\$?\d[\d.,]+/g,
  ];
  
  let suspiciousCount = 0;
  for (const pattern of suspiciousPatterns) {
    const matches = content.match(pattern) || [];
    suspiciousCount += matches.length;
  }
  
  // Check if there are attributions near numbers
  const hasAttributions = /según|fuente:|estudio|informe|datos de|reporte/i.test(content);
  
  if (suspiciousCount >= 3 && !hasAttributions) {
    return { found: true, detail: `${suspiciousCount} métricas específicas sin atribución visible` };
  }
  return { found: false, detail: hasAttributions ? "Métricas con atribución" : "Sin métricas sospechosas" };
}

function detectCategoryMismatch(content: string, title: string, category: string | null): { found: boolean; detail: string } {
  if (!category) return { found: false, detail: "Sin categoría" };
  
  const CATEGORY_SIGNALS: Record<string, string[]> = {
    "empleo-habilidades": ["empleo", "trabajo", "carrera", "cv", "entrevista", "habilidades", "talento"],
    "ia-para-pymes": ["ia para", "inteligencia artificial", "chatgpt", "automatizar con ia", "chatbot"],
    "finanzas-cashflow": ["finanzas", "cash flow", "costos", "margen", "precio", "presupuesto", "facturación"],
    "ventas-negociacion": ["ventas", "vender", "negociar", "cerrar", "prospecto", "pipeline"],
    "liderazgo-management": ["liderazgo", "líder", "equipo", "management", "cultura", "delegación"],
    "marketing-crecimiento": ["marketing", "contenido", "redes sociales", "marca", "branding", "funnel"],
    "operaciones-procesos": ["operaciones", "procesos", "eficiencia", "workflow", "automatizar procesos"],
    "estrategia-latam": ["estrategia", "latam", "escalar", "modelo de negocio", "expansión"],
    "herramientas-productividad": ["herramientas", "productividad", "apps", "software", "notion", "zapier"],
    "tendencias-ia-tech": ["tendencias", "futuro", "agentes", "chatgpt", "gemini", "deepseek"],
  };
  
  const text = `${title} ${content.slice(0, 2000)}`.toLowerCase();
  let bestCat = "";
  let bestScore = 0;
  
  for (const [cat, keywords] of Object.entries(CATEGORY_SIGNALS)) {
    const score = keywords.filter(k => text.includes(k)).length;
    if (score > bestScore) { bestScore = score; bestCat = cat; }
  }
  
  if (bestCat && bestCat !== category && bestScore >= 3) {
    return { found: true, detail: `Categoría actual "${category}" pero el contenido apunta más a "${bestCat}" (${bestScore} señales)` };
  }
  return { found: false, detail: `Categoría "${category}" coherente` };
}

function detectDuplicateIntent(
  title: string, 
  primaryKeyword: string | null, 
  category: string | null,
  otherPosts: Array<{ title: string; slug: string; primary_keyword: string | null; category: string | null }>
): { found: boolean; detail: string; candidates: string[] } {
  const candidates: string[] = [];
  const titleWords = new Set(title.toLowerCase().split(/\s+/).filter(w => w.length > 4));
  
  for (const other of otherPosts) {
    const otherWords = new Set(other.title.toLowerCase().split(/\s+/).filter(w => w.length > 4));
    const overlap = [...titleWords].filter(w => otherWords.has(w)).length;
    const ratio = overlap / Math.max(titleWords.size, 1);
    
    const sameCategory = category && other.category === category;
    const kwOverlap = primaryKeyword && other.primary_keyword && 
      (primaryKeyword.includes(other.primary_keyword) || other.primary_keyword.includes(primaryKeyword));
    
    if ((ratio > 0.5 && sameCategory) || (kwOverlap && sameCategory)) {
      candidates.push(other.slug);
    }
  }
  
  if (candidates.length > 0) {
    return { found: true, detail: `Posible canibalización con ${candidates.length} URL(s)`, candidates };
  }
  return { found: false, detail: "Sin canibalización detectada", candidates: [] };
}

// ═══ MAIN AUDIT FUNCTION ═══

async function auditPost(
  post: any,
  allPosts: any[],
  recentStructures: string[][]
): Promise<PostAudit> {
  const content = post.content_md || "";
  const checks: AuditCheck[] = [];
  const hallazgos: string[] = [];
  const impacto: string[] = [];
  
  // A. No repetition
  const rep = detectRepeatedHeadings(content);
  checks.push({ id: "A", name: "No repetition", passed: !rep.found, severity: "critical", detail: rep.detail });
  if (rep.found) { hallazgos.push(rep.detail); impacto.push("Google puede fragmentar snippets"); }
  
  // B. No template fingerprint
  const tmpl = detectTemplateFingerprint(content, recentStructures);
  checks.push({ id: "B", name: "No template fingerprint", passed: !tmpl.found, severity: "high", detail: tmpl.detail });
  if (tmpl.found) { hallazgos.push(tmpl.detail); impacto.push("Percepción de contenido en serie"); }
  
  // C. No polluted first screen
  const poll = detectFirstScreenPollution(content);
  checks.push({ id: "C", name: "No polluted first screen", passed: !poll.found, severity: "medium", detail: poll.detail });
  if (poll.found) { hallazgos.push(poll.detail); impacto.push("Daña experiencia mobile y retención"); }
  
  // D. No generic FAQ spam
  const faq = detectGenericFAQ(content);
  checks.push({ id: "D", name: "No generic FAQ spam", passed: !faq.found, severity: "critical", detail: faq.detail });
  if (faq.found) { hallazgos.push(faq.detail); impacto.push("Señal de contenido generado en serie"); }
  
  // E. No duplicate intent
  const otherPosts = allPosts.filter(p => p.slug !== post.slug).map(p => ({
    title: p.title, slug: p.slug, primary_keyword: p.primary_keyword, category: p.category
  }));
  const dupe = detectDuplicateIntent(post.title, post.primary_keyword, post.category, otherPosts);
  checks.push({ id: "E", name: "No duplicate intent", passed: !dupe.found, severity: "high", detail: dupe.detail });
  if (dupe.found) { hallazgos.push(`${dupe.detail}: ${dupe.candidates.join(", ")}`); impacto.push("Canibalización de ranking"); }
  
  // F. No title/H1 mismatch
  const mismatch = detectTitleH1Mismatch(post.title, post.meta_title);
  checks.push({ id: "F", name: "No title/H1 mismatch", passed: !mismatch.found, severity: "high", detail: mismatch.detail });
  if (mismatch.found) { hallazgos.push(mismatch.detail); impacto.push("Google reescribe el title en SERP"); }
  
  // G. No weak snippet surface
  const snippet = detectWeakSnippetSurface(content);
  checks.push({ id: "G", name: "No weak snippet surface", passed: !snippet.found, severity: "medium", detail: snippet.detail });
  if (snippet.found) { hallazgos.push(snippet.detail); impacto.push("Google puede tomar texto irrelevante como snippet"); }
  
  // H. Thin hub (check word count)
  const wordCount = content.split(/\s+/).length;
  const isThin = wordCount < 800;
  checks.push({ id: "H", name: "No thin content", passed: !isThin, severity: "high", detail: `${wordCount} palabras` });
  if (isThin) { hallazgos.push(`Contenido delgado: solo ${wordCount} palabras`); impacto.push("Bajo ranking potencial"); }
  
  // I. No fake metrics
  const fake = detectFakeMetrics(content);
  checks.push({ id: "I", name: "No fake metrics risk", passed: !fake.found, severity: "medium", detail: fake.detail });
  if (fake.found) { hallazgos.push(fake.detail); impacto.push("Daña credibilidad y E-E-A-T"); }
  
  // J. No shallow interlinking
  const links = detectShallowInterlinking(content);
  checks.push({ id: "J", name: "No shallow interlinking", passed: !links.found, severity: "medium", detail: links.detail });
  if (links.found) { hallazgos.push(links.detail); impacto.push("Nota aislada, debilita cluster"); }
  
  // K. No category mismatch
  const catMismatch = detectCategoryMismatch(content, post.title, post.category);
  checks.push({ id: "K", name: "No category mismatch", passed: !catMismatch.found, severity: "high", detail: catMismatch.detail });
  if (catMismatch.found) { hallazgos.push(catMismatch.detail); impacto.push("Diluye autoridad topical del cluster"); }
  
  // L. Has hero image
  const hasImage = !!post.hero_image_url;
  checks.push({ id: "L", name: "Has hero image", passed: hasImage, severity: "medium", detail: hasImage ? "Imagen presente" : "Sin imagen hero" });
  if (!hasImage) { hallazgos.push("Sin imagen hero"); impacto.push("Bajo CTR en redes y SERP"); }
  
  // Calculate Production Truth Score
  const weights: Record<string, number> = {
    critical: 20, high: 12, medium: 6, low: 2
  };
  const maxScore = checks.reduce((sum, c) => sum + weights[c.severity], 0);
  const lostScore = checks.filter(c => !c.passed).reduce((sum, c) => sum + weights[c.severity], 0);
  const score = Math.max(0, Math.round(((maxScore - lostScore) / maxScore) * 100));
  
  // Determine status
  let status: PostAudit["status"];
  const criticalFails = checks.filter(c => !c.passed && c.severity === "critical").length;
  const highFails = checks.filter(c => !c.passed && c.severity === "high").length;
  
  if (criticalFails > 0) status = "critica";
  else if (highFails >= 2) status = "riesgo_alto";
  else if (highFails === 1 || checks.filter(c => !c.passed).length >= 3) status = "riesgo_medio";
  else if (checks.some(c => !c.passed)) status = "apta_con_observaciones";
  else status = "apta";
  
  // Build summary
  const failCount = checks.filter(c => !c.passed).length;
  const resumen = failCount === 0
    ? "Nota limpia. Cumple todos los controles de producción."
    : `${failCount} hallazgo(s) detectado(s). ${criticalFails > 0 ? "Tiene fallas críticas que requieren acción inmediata." : highFails > 0 ? "Tiene fallas importantes que afectan SEO o UX." : "Observaciones menores."}`;
  
  // Determine next action
  let proximo_paso = "Monitorear métricas orgánicas";
  if (criticalFails > 0) proximo_paso = "Corregir fallas críticas antes de indexar";
  else if (dupe.found) proximo_paso = `Evaluar fusión o redireccionamiento con: ${dupe.candidates[0]}`;
  else if (catMismatch.found) proximo_paso = "Reasignar categoría";
  else if (links.found) proximo_paso = "Reforzar interlinking con cluster";
  
  return {
    slug: post.slug,
    title: post.title,
    category: post.category,
    production_truth_score: score,
    status,
    resumen,
    hallazgos,
    impacto,
    accion_ejecutada: null,
    accion_pendiente: criticalFails > 0 ? "fix_now" : highFails > 0 ? "queue_rewrite" : null,
    proximo_paso,
    checks,
  };
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

    let slug: string | null = null;
    try {
      const body = await req.json();
      slug = body.slug || null;
    } catch { /* no body */ }

    // Fetch posts
    let query = supabase
      .from("blog_posts")
      .select("id, slug, title, category, meta_title, meta_description, content_md, primary_keyword, hero_image_url, publish_at, quality_gate_report")
      .eq("status", "published")
      .order("publish_at", { ascending: false });

    if (slug) {
      query = query.eq("slug", slug);
    } else {
      query = query.limit(25);
    }

    const { data: posts, error } = await query;
    if (error) throw error;
    if (!posts || posts.length === 0) {
      return new Response(JSON.stringify({ results: [], summary: { total: 0 } }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get ALL published posts for cannibalization check
    const { data: allPosts } = await supabase
      .from("blog_posts")
      .select("slug, title, primary_keyword, category")
      .eq("status", "published")
      .limit(300);

    // Build recent structures for template fingerprint
    const recentStructures: string[][] = posts.slice(0, 10).map(p => {
      const headings = ((p.content_md || "").match(/^## .+$/gm) || []).map((h: string) =>
        h.replace(/^## /, "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim()
      );
      return headings;
    });

    // Audit each post (limit to 25 for CPU)
    const results: PostAudit[] = [];
    for (const post of posts.slice(0, 25)) {
      const audit = await auditPost(post, allPosts || [], recentStructures);
      results.push(audit);
    }

    // Summary
    const summary = {
      total: results.length,
      apta: results.filter(r => r.status === "apta").length,
      apta_con_observaciones: results.filter(r => r.status === "apta_con_observaciones").length,
      riesgo_medio: results.filter(r => r.status === "riesgo_medio").length,
      riesgo_alto: results.filter(r => r.status === "riesgo_alto").length,
      critica: results.filter(r => r.status === "critica").length,
      avg_score: Math.round(results.reduce((s, r) => s + r.production_truth_score, 0) / Math.max(results.length, 1)),
      top_issues: (() => {
        const issueCount: Record<string, number> = {};
        results.forEach(r => r.hallazgos.forEach(h => {
          const key = h.slice(0, 60);
          issueCount[key] = (issueCount[key] || 0) + 1;
        }));
        return Object.entries(issueCount).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([issue, count]) => ({ issue, count }));
      })(),
    };

    // Auto-trigger fixes for critical posts
    const criticalSlugs = results.filter(r => r.status === "critica" || r.status === "riesgo_alto");
    if (criticalSlugs.length > 0) {
      try {
        const autofixUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/production-truth-autofix`;
        await fetch(autofixUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
          },
          body: JSON.stringify({ mode: "critical_only" }),
        });
        console.log(`[production-truth-audit] Auto-triggered fixes for ${criticalSlugs.length} critical posts`);
      } catch (fixErr) {
        console.error("[production-truth-audit] Autofix trigger failed:", fixErr);
      }
    }

    return new Response(JSON.stringify({ results, summary }, null, 2), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("[production-truth-audit] Error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
