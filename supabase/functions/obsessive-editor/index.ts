import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * VISTACEO OBSESSIVE EDITOR 24/7
 * 
 * Goal: Drive EVERY post to 100/100 score with zero issues.
 * Scans ALL posts every cycle. Fixes ALL priorities (P0-P4).
 * 
 * Continuous loop: Scan → Fix → Improve → Link → Refresh → Reindex
 * Priority: P0 broken trust → P1 indexation → P2 semantic SEO → P3 clusters → P4 conversion
 */

const BLOG_DOMAIN = "https://blog.vistaceo.com";
const CANONICAL_DOMAIN = "https://www.vistaceo.com";
const MIN_WORD_COUNT = 1500;
const MIN_INTERNAL_LINKS = 3;
const MIN_H2_COUNT = 3;

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

    // ═══ PHASE 3: LINK — Strengthen clusters ═══
    const linkResults = await phaseLink(supabase, cycleId);
    results.push({ phase: "link", ...linkResults });

    // ═══ PHASE 4: REFRESH — Micro-improvements ═══
    const refreshResults = await phaseRefresh(supabase, cycleId);
    results.push({ phase: "refresh", ...refreshResults });

    // ═══ PHASE 5: REINDEX ═══
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
    .select("id, slug, title, content_md, excerpt, hero_image_url, meta_title, meta_description, category, primary_keyword, publish_at, updated_at")
    .eq("status", "published")
    .order("publish_at", { ascending: false });

  if (!posts?.length) return { scanned: 0, issues: 0 };

  let issuesFound = 0;

  // Get all published slugs for internal link validation
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

  // ═══ P0: BROKEN TRUST (must fix immediately) ═══

  if (excerpt && (/^!\[/.test(excerpt) || /\]\(https?:\/\//.test(excerpt) || /supabase\.co\/storage/i.test(excerpt))) {
    issues.push({ type: "broken_excerpt", priority: "P0", description: "Excerpt contains raw markdown image or broken URL" });
  }

  if (!post.hero_image_url || !post.hero_image_url.startsWith("https://")) {
    issues.push({ type: "missing_hero_image", priority: "P0", description: "No hero image or invalid URL" });
  }

  // Raw markdown image syntax visible (truncated URLs)
  const brokenImgs = content.match(/!\[[^\]]*\]\([^)]*$/gm);
  if (brokenImgs) {
    issues.push({ type: "broken_inline_image", priority: "P0", description: `${brokenImgs.length} broken image references` });
  }

  // Placeholders visible to users
  const placeholders = content.match(/\[TODO\]|\[PLACEHOLDER\]|\[INSERT\]|Lorem ipsum|{{.*?}}|\[ENLACE\]|\[LINK\]|\[Tu título aquí\]|\[Insertar[^\]]*\]|\[tu [^\]]*\]/gi);
  if (placeholders) {
    issues.push({ type: "visible_placeholder", priority: "P0", description: `Found ${placeholders.length} placeholders` });
  }

  // Empty sections
  const emptySections = content.match(/^##\s+[^\n]+\n\s*(?=##|\s*$)/gm);
  if (emptySections) {
    issues.push({ type: "empty_section", priority: "P0", description: `${emptySections.length} empty sections` });
  }

  // System code leaks
  const systemCodes = content.match(/Q_[A-Z]{2,}_\d{2,}|auth\.uid\(\)|owner_id|business_id|concept_hash/g);
  if (systemCodes) {
    issues.push({ type: "system_code_leak", priority: "P0", description: `Found ${systemCodes.length} leaked codes` });
  }

  // Promised elements missing
  if (/tabla|cuadro comparativ/i.test(content) && !/\|.*\|.*\|/m.test(content)) {
    issues.push({ type: "promised_table_missing", priority: "P0", description: "Mentions table but none exists" });
  }
  if (/^##.*checklist/im.test(content) && !/- \[[ x]\]/i.test(content)) {
    issues.push({ type: "promised_checklist_missing", priority: "P0", description: "Heading promises checklist but none found" });
  }
  if (/^##.*descarga|^##.*plantilla/im.test(content) && !/https?:\/\/.*\.(pdf|xlsx|docx|zip)/i.test(content)) {
    issues.push({ type: "promised_download_missing", priority: "P0", description: "Promises download but no file link" });
  }

  // ═══ P1: INDEXATION & META ═══

  if (!post.meta_title || post.meta_title.length < 20) {
    issues.push({ type: "missing_meta_title", priority: "P1", description: "Meta title missing or too short" });
  }
  if (!post.meta_description || post.meta_description.length < 50) {
    issues.push({ type: "missing_meta_description", priority: "P1", description: "Meta description missing or too short" });
  }
  if (!excerpt || excerpt.length < 20) {
    issues.push({ type: "missing_excerpt", priority: "P1", description: "Excerpt missing or too short" });
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

  // Missing FAQ section
  if (!/## Preguntas frecuentes|## FAQ/i.test(content) && wordCount > 800) {
    issues.push({ type: "missing_faq", priority: "P2", description: "No FAQ section" });
  }

  // ═══ P4: CONVERSION ═══

  if (!/vistaceo\.com/i.test(content)) {
    issues.push({ type: "no_cta", priority: "P4", description: "No CTA linking to vistaceo.com" });
  }

  // Only 1 CTA (should have at least 2)
  const ctaCount = (content.match(/vistaceo\.com/gi) || []).length;
  if (ctaCount > 0 && ctaCount < 2) {
    issues.push({ type: "insufficient_cta", priority: "P4", description: `Only ${ctaCount} CTA (min 2)` });
  }

  return issues;
}

// ═══════════════════════════════════════════════════════════
// PHASE: FIX ALL — Auto-repair ALL priority levels
// ═══════════════════════════════════════════════════════════
async function phaseFixAll(supabase: any, cycleId: string) {
  console.log(`[ObsessiveEditor:Fix] Fixing ALL detected issues...`);

  // Get ALL detected issues from this cycle (not just P0)
  const { data: allIssues } = await supabase
    .from("obsessive_editor_runs")
    .select("*")
    .eq("cycle_id", cycleId)
    .eq("status", "detected")
    .order("priority", { ascending: true }); // P0 first

  if (!allIssues?.length) return { fixed: 0 };

  let fixed = 0;
  // Group by post to batch updates
  const byPost: Record<string, any[]> = {};
  for (const issue of allIssues) {
    const pid = issue.target_post_id;
    if (!pid) continue;
    if (!byPost[pid]) byPost[pid] = [];
    byPost[pid].push(issue);
  }

  // Get all published posts for linking context
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

      // ═══ P0 FIXES ═══
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

      // ═══ P1 FIXES ═══
      if (t === "missing_meta_title") {
        const keyword = post.primary_keyword || post.title;
        const year = new Date().getFullYear();
        updateFields.meta_title = `${keyword} | Guía ${year}`.slice(0, 60);
        anyFixed = true;
      }
      if (t === "missing_meta_description") {
        const keyword = post.primary_keyword || post.title.toLowerCase();
        updateFields.meta_description = `Descubrí cómo ${keyword} puede impulsar tu negocio. Estrategias probadas, herramientas y pasos accionables para profesionales.`.slice(0, 155);
        anyFixed = true;
      }
      if (t === "missing_excerpt") {
        const firstPara = content.split(/\n\n/)[0]?.replace(/[#*_\[\]()!]/g, '').trim() || "";
        if (firstPara.length > 20) {
          updateFields.excerpt = firstPara.slice(0, 200).trim();
          anyFixed = true;
        }
      }

      // ═══ P2 FIXES ═══
      if (t === "low_internal_links") {
        // Find related posts to link to
        const related = (allPosts || []).filter((p: any) =>
          p.id !== post.id &&
          p.category === post.category &&
          !content.includes(p.slug)
        ).slice(0, 3);

        for (const rel of related) {
          const linkText = `\n\n> **Lectura recomendada:** [${rel.title}](${BLOG_DOMAIN}/${rel.slug}/)\n`;
          content += linkText;
        }
        if (related.length > 0) anyFixed = true;
      }

      if (t === "missing_faq") {
        const keyword = post.primary_keyword || post.title;
        const faqBlock = `\n\n## Preguntas frecuentes\n\n### ¿Qué es ${keyword}?\n\nEs un concepto clave para profesionales y dueños de negocio que buscan crecer de forma sostenible en su industria.\n\n### ¿Cómo empezar con ${keyword}?\n\nEl primer paso es evaluar tu situación actual. Usá los criterios de esta guía para identificar dónde estás y qué necesitás mejorar primero.\n\n### ¿Necesito herramientas especiales?\n\nNo necesariamente. Muchas de las estrategias que describimos se pueden implementar con herramientas gratuitas o de bajo costo.\n`;
        content = content.trimEnd() + faqBlock;
        anyFixed = true;
      }

      // ═══ P4 FIXES ═══
      if (t === "no_cta" || t === "insufficient_cta") {
        const ctaBlock = `\n\n---\n\n**¿Querés aplicar esto en tu negocio?** [VISTACEO](${CANONICAL_DOMAIN}) te ayuda a detectar oportunidades, generar estrategias personalizadas y crecer con resultados medibles. Empezá gratis.\n`;
        // Add CTA at the end
        content = content.trimEnd() + ctaBlock;
        anyFixed = true;
      }
    }

    if (anyFixed) {
      content = content.replace(/\n{3,}/g, "\n\n").trim();
      await supabase.from("blog_posts").update({
        content_md: content,
        updated_at: new Date().toISOString(),
        ...updateFields,
      }).eq("id", postId);

      const fixedTypes = issues.map((i: any) => i.action_details?.issue_type).filter(Boolean);
      await logRun(supabase, cycleId, `fix_batch`, issues[0].priority, "fixed", postId, post.slug, { fixed_types: fixedTypes, count: fixedTypes.length }, { changes: "auto_repaired" }, snapshot);
      fixed += issues.length;

      // Mark all issues as fixed
      for (const issue of issues) {
        await supabase.from("obsessive_editor_runs").update({ status: "fixed", completed_at: new Date().toISOString() }).eq("id", issue.id);
      }
    }
  }

  console.log(`[ObsessiveEditor:Fix] Fixed ${fixed} issues across all priorities`);
  return { fixed };
}

// ═══════════════════════════════════════════════════════════
// PHASE: LINK — Strengthen cluster graph (P3)
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
  }).slice(0, 5); // Fix up to 5 orphans per cycle

  let linked = 0;

  for (const orphan of orphans) {
    const sameCluster = registry.filter((r: any) =>
      r.post_id !== orphan.post_id &&
      r.cluster_assigned === orphan.cluster_assigned &&
      r.cluster_assigned
    );

    if (sameCluster.length === 0) continue;

    const donor = sameCluster[0];

    const { data: donorPost } = await supabase
      .from("blog_posts")
      .select("id, content_md, slug")
      .eq("id", donor.post_id)
      .maybeSingle();

    const { data: orphanPost } = await supabase
      .from("blog_posts")
      .select("id, title, slug")
      .eq("id", orphan.post_id)
      .maybeSingle();

    if (!donorPost?.content_md || !orphanPost?.slug) continue;
    if (donorPost.content_md.includes(orphanPost.slug)) continue;

    const linkBlock = `\n\n> **Te puede interesar:** [${orphanPost.title}](${BLOG_DOMAIN}/${orphanPost.slug}/)\n`;
    const snapshot = { content_md: donorPost.content_md };
    const updatedContent = donorPost.content_md + linkBlock;

    await supabase.from("blog_posts").update({
      content_md: updatedContent,
      updated_at: new Date().toISOString(),
    }).eq("id", donorPost.id);

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
      await supabase.from("blog_posts").update({
        content_md: updated,
        updated_at: new Date().toISOString(),
      }).eq("id", post.id);

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
    await supabase.functions.invoke("seo-auto-indexer", {
      body: { slugs: slugsToIndex },
    });
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
  supabase: any,
  cycleId: string,
  actionType: string,
  priority: string,
  status: string,
  postId: string | null,
  slug: string | null,
  details: any,
  result: any,
  snapshot?: any
) {
  try {
    await supabase.from("obsessive_editor_runs").insert({
      cycle_id: cycleId,
      phase: actionType.split("_")[0],
      priority,
      status,
      target_post_id: postId,
      target_slug: slug,
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
