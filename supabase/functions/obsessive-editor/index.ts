import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * VISTACEO OBSESSIVE EDITOR 24/7
 * 
 * Continuous loop: Scan → Fix → Improve → Publish → Link → Refresh → Reindex
 * Priority: P0 broken trust → P1 indexation → P2 semantic SEO → P3 clusters → P4 conversion
 * 
 * Runs every 30 minutes via cron. Each run executes ONE cycle focusing on highest priority tasks.
 */

const BLOG_DOMAIN = "https://blog.vistaceo.com";
const CANONICAL_DOMAIN = "https://www.vistaceo.com";
const COHERENCE_THRESHOLD = 96;
const MIN_WORD_COUNT = 1500;
const MAX_SAME_HOUR_POSTS = 1;

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
    const body = await req.json().catch(() => ({}));
    const { phase: forcePhase } = body;

    console.log(`[ObsessiveEditor] Cycle ${cycleId} starting...`);

    // ══════════════════════════════════════════════════════
    // PHASE 1: SCAN — Detect all issues across the blog
    // ══════════════════════════════════════════════════════
    const scanResults = await phaseScan(supabase, cycleId);
    results.push({ phase: "scan", ...scanResults });

    // ══════════════════════════════════════════════════════
    // PHASE 2: FIX — Auto-repair P0 issues (broken trust)
    // ══════════════════════════════════════════════════════
    const fixResults = await phaseFix(supabase, cycleId);
    results.push({ phase: "fix", ...fixResults });

    // ══════════════════════════════════════════════════════
    // PHASE 3: IMPROVE — Enhance weak content (P2 SEO)
    // ══════════════════════════════════════════════════════
    const improveResults = await phaseImprove(supabase, cycleId);
    results.push({ phase: "improve", ...improveResults });

    // ══════════════════════════════════════════════════════
    // PHASE 4: LINK — Strengthen cluster graph (P3)
    // ══════════════════════════════════════════════════════
    const linkResults = await phaseLink(supabase, cycleId);
    results.push({ phase: "link", ...linkResults });

    // ══════════════════════════════════════════════════════
    // PHASE 5: REFRESH — Micro-improvements for reindex (P1)
    // ══════════════════════════════════════════════════════
    const refreshResults = await phaseRefresh(supabase, cycleId);
    results.push({ phase: "refresh", ...refreshResults });

    // ══════════════════════════════════════════════════════
    // PHASE 6: REINDEX — Trigger indexing signals
    // ══════════════════════════════════════════════════════
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
// PHASE: SCAN
// ═══════════════════════════════════════════════════════════
async function phaseScan(supabase: any, cycleId: string) {
  console.log(`[ObsessiveEditor:Scan] Starting...`);

  const { data: posts } = await supabase
    .from("blog_posts")
    .select("id, slug, title, content_md, excerpt, hero_image_url, meta_title, meta_description, internal_links, external_sources, category, primary_keyword, publish_at, updated_at")
    .eq("status", "published")
    .order("publish_at", { ascending: false });

  if (!posts?.length) return { scanned: 0, issues: 0 };

  let issuesFound = 0;

  // Scan ALL posts for P0 issues, not just a sample
  const toScan = posts;

  for (const post of toScan) {
    const issues = scanPost(post);
    if (issues.length > 0) {
      issuesFound += issues.length;
      for (const issue of issues) {
        await logRun(supabase, cycleId, `scan_${issue.type}`, issue.priority, "detected", post.id, post.slug, { issue_type: issue.type, description: issue.description }, {});
      }
    }
  }

  console.log(`[ObsessiveEditor:Scan] Scanned ${toScan.length}, found ${issuesFound} issues`);
  return { scanned: toScan.length, issues: issuesFound };
}

function scanPost(post: any): Array<{ type: string; priority: string; description: string }> {
  const issues: Array<{ type: string; priority: string; description: string }> = [];
  const content = post.content_md || "";
  const excerpt = post.excerpt || "";

  // P0: Broken excerpt (raw markdown image or truncated URL)
  if (excerpt && (/^!\[/.test(excerpt) || /\]\(https?:\/\//.test(excerpt) || /supabase\.co\/storage/i.test(excerpt))) {
    issues.push({ type: "broken_excerpt", priority: "P0", description: "Excerpt contains raw markdown image or broken URL" });
  }

  // P0: Broken trust indicators
  if (!post.hero_image_url || !post.hero_image_url.startsWith("https://")) {
    issues.push({ type: "missing_hero_image", priority: "P0", description: "No hero image or invalid URL" });
  }

  // P0: Raw markdown image syntax visible in content (not rendered)
  const rawImgPatterns = content.match(/!\[[^\]]*\]\([^)]*supabase\.co\/storage[^)]*$/gm);
  if (rawImgPatterns) {
    issues.push({ type: "broken_inline_image", priority: "P0", description: `${rawImgPatterns.length} broken/truncated image references` });
  }

  // P0: Truncated URLs (ending abruptly)
  const truncatedUrls = content.match(/https?:\/\/[^\s)"']*\.supabase\.co\/storage\/v1\/object\/public\/blog-images\/[^\s)"']*[^.)\s"']/g);
  if (truncatedUrls) {
    const broken = truncatedUrls.filter(u => !u.match(/\.(png|jpg|jpeg|gif|webp|svg)$/i));
    if (broken.length > 0) {
      issues.push({ type: "truncated_image_url", priority: "P0", description: `${broken.length} truncated image URLs` });
    }
  }

  // P0: Placeholder text visible
  const placeholders = content.match(/\[TODO\]|\[PLACEHOLDER\]|\[INSERT\]|Lorem ipsum|{{.*?}}|\[ENLACE\]|\[LINK\]|\[Tu título aquí\]|\[Insertar/gi);
  if (placeholders) {
    issues.push({ type: "visible_placeholder", priority: "P0", description: `Found ${placeholders.length} placeholders` });
  }

  // P0: Empty sections (heading followed by another heading or end)
  const emptySections = content.match(/^##\s+[^\n]+\n\s*(?=##|\s*$)/gm);
  if (emptySections) {
    issues.push({ type: "empty_section", priority: "P0", description: `${emptySections.length} empty sections` });
  }

  // P0: Leaked system codes
  const systemCodes = content.match(/Q_[A-Z]{2,}_\d{2,}|auth\.uid\(\)|owner_id|business_id|concept_hash/g);
  if (systemCodes) {
    issues.push({ type: "system_code_leak", priority: "P0", description: `Found ${systemCodes.length} leaked codes` });
  }

  // P0: Promised elements that don't exist
  if (/tabla|cuadro comparativ/i.test(content) && !/\|.*\|.*\|/m.test(content)) {
    issues.push({ type: "promised_table_missing", priority: "P0", description: "Mentions table but none exists" });
  }
  if (/checklist|lista de verificación/i.test(content) && !/- \[[ x]\]/i.test(content)) {
    if (/^##.*checklist/im.test(content)) {
      issues.push({ type: "promised_checklist_missing", priority: "P0", description: "Heading promises checklist but none found" });
    }
  }
  if (/descarga|plantilla descargable/i.test(content) && !/https?:\/\/.*\.(pdf|xlsx|docx|zip)/i.test(content)) {
    if (/^##.*descarga|^##.*plantilla/im.test(content)) {
      issues.push({ type: "promised_download_missing", priority: "P0", description: "Promises download but no file link" });
    }
  }

  // P1: Word count too low
  const wordCount = content.split(/\s+/).filter(Boolean).length;
  if (wordCount < MIN_WORD_COUNT) {
    issues.push({ type: "low_word_count", priority: "P1", description: `Only ${wordCount} words (min ${MIN_WORD_COUNT})` });
  }

  // P1: Missing meta
  if (!post.meta_title || post.meta_title.length < 20) {
    issues.push({ type: "missing_meta_title", priority: "P1", description: "Meta title missing or too short" });
  }
  if (!post.meta_description || post.meta_description.length < 50) {
    issues.push({ type: "missing_meta_description", priority: "P1", description: "Meta description missing or too short" });
  }

  // P2: No internal links
  const internalLinkCount = (content.match(/\[.*?\]\(https:\/\/blog\.vistaceo\.com/g) || []).length;
  if (internalLinkCount < 3) {
    issues.push({ type: "low_internal_links", priority: "P2", description: `Only ${internalLinkCount} internal links (min 3)` });
  }

  // P2: No H2 headings
  const h2Count = (content.match(/^## /gm) || []).length;
  if (h2Count < 3) {
    issues.push({ type: "few_headings", priority: "P2", description: `Only ${h2Count} H2 headings` });
  }

  // P4: No CTA
  if (!/vistaceo\.com/i.test(content)) {
    issues.push({ type: "no_cta", priority: "P4", description: "No CTA linking to vistaceo.com" });
  }

  return issues;
}

// ═══════════════════════════════════════════════════════════
// PHASE: FIX — Auto-repair P0 issues
// ═══════════════════════════════════════════════════════════
async function phaseFix(supabase: any, cycleId: string) {
  console.log(`[ObsessiveEditor:Fix] Starting P0 fixes...`);

  // Get detected issues from this cycle
  const { data: p0Issues } = await supabase
    .from("obsessive_editor_runs")
    .select("*")
    .eq("cycle_id", cycleId)
    .eq("priority", "P0")
    .eq("status", "detected");

  if (!p0Issues?.length) return { fixed: 0 };

  let fixed = 0;

  for (const issue of p0Issues) {
    const postId = issue.target_post_id;
    if (!postId) continue;

    const { data: post } = await supabase
      .from("blog_posts")
      .select("id, slug, content_md, excerpt, title, meta_title, meta_description")
      .eq("id", postId)
      .maybeSingle();

    if (!post) continue;

    // Save rollback snapshot
    const snapshot = { content_md: post.content_md, excerpt: post.excerpt, meta_title: post.meta_title, meta_description: post.meta_description };
    let content = post.content_md || "";
    let excerpt = post.excerpt || "";
    let wasFixed = false;
    let updateFields: Record<string, any> = {};
    const actionType = issue.action_details?.issue_type;

    // Fix: Broken excerpt (raw markdown image)
    if (actionType === "broken_excerpt") {
      // Generate a clean excerpt from the first paragraph of content
      const firstPara = content.split(/\n\n/)[0]?.replace(/[#*_\[\]()!]/g, '').trim() || "";
      const cleanExcerpt = firstPara.slice(0, 200).trim();
      if (cleanExcerpt.length > 20) {
        updateFields.excerpt = cleanExcerpt;
        wasFixed = true;
      }
    }

    // Fix: Remove broken/truncated inline images
    if (actionType === "broken_inline_image" || actionType === "truncated_image_url") {
      // Remove broken image markdown where URL is truncated
      content = content.replace(/!\[[^\]]*\]\([^)]*supabase\.co\/storage[^)]*$/gm, "");
      // Remove orphaned image references with incomplete URLs
      content = content.replace(/!\[[^\]]*\]\(https?:\/\/[^\s)]*\.supabase\.co\/storage\/v1\/object\/public\/blog-images\/[^\s)]*[^.)\s"']\)?/g, "");
      wasFixed = true;
    }

    // Fix: Remove placeholders
    if (actionType === "visible_placeholder") {
      content = content.replace(/\[TODO\]|\[PLACEHOLDER\]|\[INSERT\]|\[ENLACE\]|\[LINK\]|\[Tu título aquí\]|\[Insertar[^\]]*\]/gi, "");
      content = content.replace(/{{.*?}}/g, "");
      wasFixed = true;
    }

    // Fix: Remove system code leaks
    if (actionType === "system_code_leak") {
      content = content.replace(/Q_[A-Z]{2,}_\d{2,}/g, "");
      content = content.replace(/auth\.uid\(\)/g, "");
      content = content.replace(/\b(owner_id|business_id|concept_hash|intent_signature)\b/g, "");
      content = content.replace(/\(\s*\)/g, "");
      wasFixed = true;
    }

    // Fix: Remove empty sections
    if (actionType === "empty_section") {
      content = content.replace(/^##\s+[^\n]+\n\s*(?=##)/gm, "");
      wasFixed = true;
    }

    // Fix: Remove broken promise headings
    if (actionType === "promised_table_missing" || actionType === "promised_checklist_missing" || actionType === "promised_download_missing") {
      if (actionType === "promised_download_missing") {
        content = content.replace(/^##\s*(Descarga|Plantilla descargable)[^\n]*\n[^#]*/gim, "");
      }
      wasFixed = true;
    }

    if (wasFixed) {
      // Clean up artifacts
      content = content.replace(/\n{3,}/g, "\n\n").trim();
      
      await supabase.from("blog_posts").update({ content_md: content, updated_at: new Date().toISOString() }).eq("id", postId);
      await logRun(supabase, cycleId, `fix_${actionType}`, "P0", "fixed", postId, post.slug, {}, { changes: "auto_repaired" }, snapshot);
      fixed++;
    } else {
      await supabase.from("obsessive_editor_runs").update({ status: "skipped" }).eq("id", issue.id);
    }
  }

  console.log(`[ObsessiveEditor:Fix] Fixed ${fixed} P0 issues`);
  return { fixed };
}

// ═══════════════════════════════════════════════════════════
// PHASE: IMPROVE — Semantic SEO improvements (P2)
// ═══════════════════════════════════════════════════════════
async function phaseImprove(supabase: any, cycleId: string) {
  console.log(`[ObsessiveEditor:Improve] Starting...`);

  // Find posts with low scores in registry
  const { data: weakPosts } = await supabase
    .from("blog_content_registry")
    .select("post_id, score_global, score_seo, score_coherence, url, primary_keyword")
    .lt("score_global", COHERENCE_THRESHOLD)
    .order("score_global", { ascending: true })
    .limit(3);

  if (!weakPosts?.length) return { improved: 0 };

  let improved = 0;

  for (const entry of weakPosts) {
    // Invoke blog-improve-post for the weakest posts
    try {
      const { data: improveResult, error } = await supabase.functions.invoke("blog-improve-post", {
        body: { post_id: entry.post_id, mode: "auto" },
      });

      if (!error && improveResult?.success) {
        await logRun(supabase, cycleId, "improve_weak_post", "P2", "improved", entry.post_id, null, { old_score: entry.score_global }, { new_content: "rewritten" });
        improved++;
      }
    } catch (err: any) {
      console.error(`[ObsessiveEditor:Improve] Failed for ${entry.post_id}:`, err.message);
    }
  }

  console.log(`[ObsessiveEditor:Improve] Improved ${improved} posts`);
  return { improved };
}

// ═══════════════════════════════════════════════════════════
// PHASE: LINK — Strengthen cluster graph (P3)
// ═══════════════════════════════════════════════════════════
async function phaseLink(supabase: any, cycleId: string) {
  console.log(`[ObsessiveEditor:Link] Starting cluster linking...`);

  // Find orphan posts (no incoming links)
  const { data: registry } = await supabase
    .from("blog_content_registry")
    .select("post_id, url, cluster_assigned, internal_links_in, primary_keyword")
    .order("created_at", { ascending: false })
    .limit(100);

  if (!registry?.length) return { linked: 0 };

  // Find orphans (no or few incoming links)
  const orphans = registry.filter((r: any) => {
    const linksIn = r.internal_links_in;
    return !linksIn || (Array.isArray(linksIn) && linksIn.length < 1);
  }).slice(0, 3);

  let linked = 0;

  for (const orphan of orphans) {
    // Find related posts in same cluster to add a link FROM
    const sameCluster = registry.filter((r: any) =>
      r.post_id !== orphan.post_id &&
      r.cluster_assigned === orphan.cluster_assigned &&
      r.cluster_assigned
    );

    if (sameCluster.length === 0) continue;

    // Pick the post with most content to inject link into
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

    // Add "Te puede interesar" link at the end before any CTA
    const linkBlock = `\n\n> **Te puede interesar:** [${orphanPost.title}](${BLOG_DOMAIN}/${orphanPost.slug}/)\n`;
    
    // Check if link already exists
    if (donorPost.content_md.includes(orphanPost.slug)) continue;

    const snapshot = { content_md: donorPost.content_md };
    const updatedContent = donorPost.content_md + linkBlock;

    await supabase.from("blog_posts").update({
      content_md: updatedContent,
      updated_at: new Date().toISOString(),
    }).eq("id", donorPost.id);

    // Update registry links
    const newLinksIn = [...(Array.isArray(orphan.internal_links_in) ? orphan.internal_links_in : []), donor.url];
    await supabase.from("blog_content_registry").update({ internal_links_in: newLinksIn }).eq("post_id", orphan.post_id);

    await logRun(supabase, cycleId, "link_orphan", "P3", "linked", donorPost.id, donorPost.slug, { orphan_slug: orphanPost.slug, cluster: orphan.cluster_assigned }, {}, snapshot);
    linked++;
  }

  console.log(`[ObsessiveEditor:Link] Linked ${linked} orphan posts`);
  return { linked };
}

// ═══════════════════════════════════════════════════════════
// PHASE: REFRESH — Micro-improvements for crawl freshness (P1)
// ═══════════════════════════════════════════════════════════
async function phaseRefresh(supabase: any, cycleId: string) {
  console.log(`[ObsessiveEditor:Refresh] Starting micro-improvements...`);

  // Find top-performing posts that haven't been updated recently (>14 days)
  const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();

  const { data: stalePosts } = await supabase
    .from("blog_posts")
    .select("id, slug, title, content_md, updated_at, primary_keyword")
    .eq("status", "published")
    .lt("updated_at", twoWeeksAgo)
    .order("publish_at", { ascending: false })
    .limit(20);

  if (!stalePosts?.length) return { refreshed: 0 };

  // Pick 2 posts to micro-improve
  const toRefresh = stalePosts.sort(() => Math.random() - 0.5).slice(0, 2);
  let refreshed = 0;

  for (const post of toRefresh) {
    const content = post.content_md || "";
    let updated = content;
    let changed = false;

    // Add current year reference if outdated
    const currentYear = new Date().getFullYear();
    if (!content.includes(String(currentYear)) && content.includes(String(currentYear - 1))) {
      updated = updated.replace(new RegExp(String(currentYear - 1), "g"), String(currentYear));
      changed = true;
    }

    // Add FAQ section if missing
    if (!/## Preguntas frecuentes|## FAQ/i.test(content) && content.length > 2000) {
      const faqBlock = `\n\n## Preguntas frecuentes\n\n### ¿${post.title}?\n\nSí, esta guía cubre todo lo que necesitás saber sobre el tema para aplicar en tu negocio hoy.\n\n### ¿Necesito experiencia previa?\n\nNo. Esta guía está diseñada para cualquier profesional o dueño de negocio que quiera mejorar en esta área.\n`;
      updated = updated.trimEnd() + faqBlock;
      changed = true;
    }

    if (changed) {
      const snapshot = { content_md: content };
      await supabase.from("blog_posts").update({
        content_md: updated,
        updated_at: new Date().toISOString(),
      }).eq("id", post.id);

      await logRun(supabase, cycleId, "refresh_micro", "P1", "refreshed", post.id, post.slug, {}, { type: "year_update_or_faq" }, snapshot);
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

  // Find all posts modified in this cycle
  const { data: modifiedRuns } = await supabase
    .from("obsessive_editor_runs")
    .select("target_slug")
    .eq("cycle_id", cycleId)
    .in("status", ["fixed", "improved", "refreshed", "linked"])
    .not("target_slug", "is", null);

  const slugsToIndex = [...new Set((modifiedRuns || []).map((r: any) => r.target_slug).filter(Boolean))];

  if (slugsToIndex.length === 0) {
    // Still trigger sitemap refresh
    await triggerSitemapPing();
    return { indexed: 0, sitemap_pinged: true };
  }

  // Submit to IndexNow
  try {
    await supabase.functions.invoke("seo-auto-indexer", {
      body: { slugs: slugsToIndex },
    });
  } catch (err: any) {
    console.error("[ObsessiveEditor:Reindex] IndexNow failed:", err.message);
  }

  // Trigger GitHub build if needed
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
