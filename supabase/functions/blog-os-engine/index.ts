import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body = await req.json().catch(() => ({}));
    const { action, ...params } = body;

    switch (action) {
      case "process_queue":
        return json(await processQueue(supabase, params));
      case "detect_cannibalization":
        return json(await detectCannibalization(supabase));
      case "build_cluster_graph":
        return json(await buildClusterGraph(supabase));
      case "create_experiment":
        return json(await createExperiment(supabase, params));
      case "check_experiments":
        return json(await checkExperiments(supabase));
      case "get_cta_blocks":
        return json(await getCTABlocks(supabase, params));
      case "assign_ctas":
        return json(await assignCTAs(supabase, params));
      case "detect_decay":
        return json(await detectDecay(supabase));
      case "detect_top_winners":
        return json(await detectTopWinners(supabase));
      default:
        return json({ error: "Unknown action" }, 400);
    }
  } catch (err: any) {
    console.error("Blog OS Engine error:", err);
    return json({ error: err.message }, 500);
  }
});

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// ===== S3: AUTOPILOT SCHEDULER =====

async function processQueue(supabase: any, params: any) {
  const { queue = "Q1", limit = 5 } = params;

  const { data: tasks, error } = await supabase
    .from("blog_task_queue")
    .select("*")
    .eq("queue", queue)
    .eq("status", "pending")
    .order("priority", { ascending: true })
    .limit(limit);

  if (error) throw error;
  if (!tasks?.length) return { processed: 0, message: "Cola vacía" };

  let processed = 0;
  for (const task of tasks) {
    await supabase
      .from("blog_task_queue")
      .update({ status: "in_progress", started_at: new Date().toISOString() })
      .eq("id", task.id);

    try {
      // Increment attempts
      const attempts = (task.attempts || 0) + 1;
      const maxAttempts = task.max_attempts || 3;

      if (attempts > maxAttempts) {
        await supabase
          .from("blog_task_queue")
          .update({ status: "failed", result: { error: "Max attempts exceeded" }, attempts })
          .eq("id", task.id);
        continue;
      }

      // Process based on task type
      let result: any = {};
      switch (task.task_type) {
        case "critical_fix":
        case "seo_fix":
        case "conversion_fix":
        case "editorial_improvement":
          result = { status: "queued_for_review", task_type: task.task_type };
          break;
        case "recheck_score":
          // Trigger re-audit via blog-os-audit
          result = { status: "rescored", task_type: task.task_type };
          break;
        default:
          result = { status: "unknown_type" };
      }

      await supabase
        .from("blog_task_queue")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
          result,
          attempts,
        })
        .eq("id", task.id);

      processed++;
    } catch (taskErr: any) {
      await supabase
        .from("blog_task_queue")
        .update({
          status: "pending",
          result: { error: taskErr.message },
          attempts: (task.attempts || 0) + 1,
        })
        .eq("id", task.id);
    }
  }

  return { processed, total: tasks.length, queue };
}

// ===== S5: CANNIBALIZATION DETECTION =====

async function detectCannibalization(supabase: any) {
  const { data: registry } = await supabase
    .from("blog_content_registry")
    .select("id, post_id, url, primary_keyword, keyword_variants, category, cluster_assigned")
    .not("primary_keyword", "is", null);

  if (!registry?.length) return { cannibalization_pairs: [], total: 0 };

  const pairs: any[] = [];

  for (let i = 0; i < registry.length; i++) {
    for (let j = i + 1; j < registry.length; j++) {
      const a = registry[i];
      const b = registry[j];

      let overlapScore = 0;
      const reasons: string[] = [];

      // 1. Same primary keyword
      if (a.primary_keyword && b.primary_keyword) {
        const kwA = a.primary_keyword.toLowerCase().trim();
        const kwB = b.primary_keyword.toLowerCase().trim();
        if (kwA === kwB) {
          overlapScore += 50;
          reasons.push("Misma keyword primaria");
        } else {
          // Partial overlap
          const wordsA = new Set(kwA.split(/\s+/));
          const wordsB = new Set(kwB.split(/\s+/));
          const intersection = [...wordsA].filter(w => wordsB.has(w) && w.length > 3);
          if (intersection.length >= 2) {
            overlapScore += 25;
            reasons.push(`Keywords solapadas: ${intersection.join(", ")}`);
          }
        }
      }

      // 2. Same category + cluster
      if (a.category === b.category && a.category) {
        overlapScore += 10;
        reasons.push("Misma categoría");
      }
      if (a.cluster_assigned === b.cluster_assigned && a.cluster_assigned) {
        overlapScore += 10;
        reasons.push("Mismo cluster");
      }

      // 3. Keyword variant overlap
      const varA = (a.keyword_variants || []).map((v: string) => v.toLowerCase());
      const varB = (b.keyword_variants || []).map((v: string) => v.toLowerCase());
      const varOverlap = varA.filter((v: string) => varB.includes(v));
      if (varOverlap.length >= 2) {
        overlapScore += 20;
        reasons.push(`${varOverlap.length} variantes compartidas`);
      }

      // 4. URL slug similarity
      const slugA = a.url.replace(/https?:\/\/[^/]+\//, "").replace(/\/$/, "").split("-");
      const slugB = b.url.replace(/https?:\/\/[^/]+\//, "").replace(/\/$/, "").split("-");
      const slugOverlap = slugA.filter((w: string) => slugB.includes(w) && w.length > 3);
      if (slugOverlap.length >= 3) {
        overlapScore += 15;
        reasons.push(`Slugs similares: ${slugOverlap.join(", ")}`);
      }

      if (overlapScore >= 30) {
        const risk = overlapScore >= 60 ? "critical" : overlapScore >= 45 ? "high" : "medium";
        pairs.push({
          post_a: { id: a.id, url: a.url, keyword: a.primary_keyword },
          post_b: { id: b.id, url: b.url, keyword: b.primary_keyword },
          overlap_score: overlapScore,
          risk,
          reasons,
          suggested_action: overlapScore >= 60
            ? "Fusionar y redirigir"
            : overlapScore >= 45
            ? "Diferenciar intención y reescribir titles"
            : "Monitorear y ajustar interlinks",
        });
      }
    }
  }

  // Sort by overlap score desc
  pairs.sort((a, b) => b.overlap_score - a.overlap_score);

  // Create tasks for critical pairs
  for (const pair of pairs.filter(p => p.risk === "critical")) {
    await supabase.from("blog_task_queue").upsert({
      registry_id: pair.post_a.id,
      post_id: null,
      queue: "Q2",
      priority: 2,
      task_type: "cannibalization_fix",
      description: `Canibalización crítica: "${pair.post_a.keyword}" entre ${pair.post_a.url} y ${pair.post_b.url}`,
      status: "pending",
      payload: pair,
    }, { onConflict: "id" });
  }

  return { cannibalization_pairs: pairs, total: pairs.length };
}

// ===== S5: CLUSTER GRAPH =====

async function buildClusterGraph(supabase: any) {
  const { data: registry } = await supabase
    .from("blog_content_registry")
    .select("id, post_id, url, category, cluster_assigned, primary_keyword, keyword_variants, internal_links_out, internal_links_in");

  if (!registry?.length) return { edges_created: 0 };

  // Clear old edges
  await supabase.from("blog_cluster_edges").delete().neq("id", "00000000-0000-0000-0000-000000000000");

  const edges: any[] = [];

  for (let i = 0; i < registry.length; i++) {
    for (let j = i + 1; j < registry.length; j++) {
      const a = registry[i];
      const b = registry[j];

      // Same cluster edge
      if (a.cluster_assigned && a.cluster_assigned === b.cluster_assigned) {
        edges.push({
          source_registry_id: a.id,
          target_registry_id: b.id,
          edge_type: "same_cluster",
          weight: 0.5,
          metadata: { cluster: a.cluster_assigned },
        });
      }

      // Keyword similarity edge
      const kwSim = computeKeywordSimilarity(a, b);
      if (kwSim > 0.3) {
        edges.push({
          source_registry_id: a.id,
          target_registry_id: b.id,
          edge_type: "semantic_similarity",
          weight: kwSim,
          metadata: {},
        });
      }

      // Internal link edge
      const linksA = extractUrls(a.internal_links_out);
      const linksB = extractUrls(b.internal_links_out);
      if (linksA.some((l: string) => b.url && l.includes(b.url.replace("https://blog.vistaceo.com/", "")))) {
        edges.push({
          source_registry_id: a.id,
          target_registry_id: b.id,
          edge_type: "internal_link",
          weight: 1.0,
        });
      }
      if (linksB.some((l: string) => a.url && l.includes(a.url.replace("https://blog.vistaceo.com/", "")))) {
        edges.push({
          source_registry_id: b.id,
          target_registry_id: a.id,
          edge_type: "internal_link",
          weight: 1.0,
        });
      }
    }
  }

  // Batch insert
  if (edges.length > 0) {
    const batchSize = 100;
    for (let i = 0; i < edges.length; i += batchSize) {
      await supabase.from("blog_cluster_edges").insert(edges.slice(i, i + batchSize));
    }
  }

  // Detect orphan pages (no edges)
  const connectedIds = new Set<string>();
  edges.forEach(e => {
    connectedIds.add(e.source_registry_id);
    connectedIds.add(e.target_registry_id);
  });
  const orphans = registry.filter((r: any) => !connectedIds.has(r.id));

  return {
    edges_created: edges.length,
    total_nodes: registry.length,
    orphan_pages: orphans.map((o: any) => ({ id: o.id, url: o.url })),
    clusters: [...new Set(registry.map((r: any) => r.cluster_assigned).filter(Boolean))],
  };
}

function computeKeywordSimilarity(a: any, b: any): number {
  const wordsA = new Set([
    ...(a.primary_keyword || "").toLowerCase().split(/\s+/),
    ...(a.keyword_variants || []).flatMap((v: string) => v.toLowerCase().split(/\s+/)),
  ].filter((w: string) => w.length > 3));

  const wordsB = new Set([
    ...(b.primary_keyword || "").toLowerCase().split(/\s+/),
    ...(b.keyword_variants || []).flatMap((v: string) => v.toLowerCase().split(/\s+/)),
  ].filter((w: string) => w.length > 3));

  if (wordsA.size === 0 || wordsB.size === 0) return 0;
  const intersection = [...wordsA].filter(w => wordsB.has(w)).length;
  return intersection / Math.min(wordsA.size, wordsB.size);
}

function extractUrls(links: any): string[] {
  if (!links) return [];
  if (Array.isArray(links)) {
    return links.map((l: any) => typeof l === "string" ? l : l.url || l.href || "").filter(Boolean);
  }
  return [];
}

// ===== S6: EXPERIMENTS =====

async function createExperiment(supabase: any, params: any) {
  const { post_id, experiment_type, hypothesis, variant_a, variant_b, measurement_window_hours = 168 } = params;

  // Get registry
  const { data: reg } = await supabase
    .from("blog_content_registry")
    .select("id")
    .eq("post_id", post_id)
    .maybeSingle();

  if (!reg) throw new Error("Post not in registry");

  // Check no active experiment for this post
  const { data: active } = await supabase
    .from("blog_experiments")
    .select("id")
    .eq("post_id", post_id)
    .eq("status", "running")
    .maybeSingle();

  if (active) throw new Error("Already has active experiment");

  const { data: exp, error } = await supabase
    .from("blog_experiments")
    .insert({
      registry_id: reg.id,
      post_id,
      experiment_type,
      hypothesis,
      variant_a,
      variant_b,
      measurement_window_hours,
      active_variant: "A",
      status: "running",
    })
    .select()
    .single();

  if (error) throw error;
  return { experiment: exp };
}

async function checkExperiments(supabase: any) {
  const { data: experiments } = await supabase
    .from("blog_experiments")
    .select("*")
    .eq("status", "running");

  if (!experiments?.length) return { checked: 0, rolled_back: 0 };

  let rolledBack = 0;
  for (const exp of experiments) {
    const now = Date.now();
    const started = new Date(exp.started_at).getTime();
    const windowMs = (exp.measurement_window_hours || 168) * 3600 * 1000;
    const elapsed = now - started;

    // Check if window expired
    if (elapsed >= windowMs) {
      await supabase
        .from("blog_experiments")
        .update({
          status: "completed",
          ended_at: new Date().toISOString(),
          decision: "window_expired_review",
        })
        .eq("id", exp.id);
      continue;
    }

    // Guardrail check: if results show degradation, rollback
    const results = exp.results || {};
    if (results.ctr_delta && results.ctr_delta < -15) {
      await supabase
        .from("blog_experiments")
        .update({
          status: "rolled_back",
          ended_at: new Date().toISOString(),
          guardrail_triggered: true,
          guardrail_reason: `CTR cayó ${results.ctr_delta}% (guardrail: -15%)`,
          decision: "rollback",
          active_variant: "A",
        })
        .eq("id", exp.id);
      rolledBack++;
    }

    if (results.bounce_delta && results.bounce_delta > 20) {
      await supabase
        .from("blog_experiments")
        .update({
          status: "rolled_back",
          ended_at: new Date().toISOString(),
          guardrail_triggered: true,
          guardrail_reason: `Bounce subió ${results.bounce_delta}% (guardrail: +20%)`,
          decision: "rollback",
          active_variant: "A",
        })
        .eq("id", exp.id);
      rolledBack++;
    }
  }

  return { checked: experiments.length, rolled_back: rolledBack };
}

// ===== S6: CTA BLOCKS =====

async function getCTABlocks(supabase: any, params: any) {
  const { intent, country, sector, stage } = params;

  let query = supabase
    .from("blog_cta_blocks")
    .select("*")
    .eq("is_active", true)
    .order("priority", { ascending: false });

  const { data: blocks } = await query;
  if (!blocks?.length) return { blocks: [] };

  // Score blocks by match quality
  const scored = blocks.map((block: any) => {
    let matchScore = block.priority || 50;

    if (intent && block.intent_match?.includes(intent)) matchScore += 30;
    if (country && block.country_match?.length > 0 && block.country_match.includes(country)) matchScore += 20;
    if (sector && block.sector_match?.length > 0 && block.sector_match.includes(sector)) matchScore += 20;
    if (stage && block.conversion_stage === stage) matchScore += 15;

    // Boost by conversion rate
    matchScore += (block.conversion_rate || 0) * 10;

    return { ...block, match_score: matchScore };
  });

  scored.sort((a: any, b: any) => b.match_score - a.match_score);

  return { blocks: scored.slice(0, 5) };
}

async function assignCTAs(supabase: any, params: any) {
  const { post_id } = params;

  const { data: post } = await supabase
    .from("blog_posts")
    .select("intent, category, primary_keyword, country_code, sector")
    .eq("id", post_id)
    .single();

  if (!post) throw new Error("Post not found");

  const result = await getCTABlocks(supabase, {
    intent: post.intent,
    country: post.country_code,
    sector: post.sector,
    stage: post.intent === "transactional" ? "decision" : "discovery",
  });

  return {
    post_id,
    recommended_ctas: result.blocks.slice(0, 3).map((b: any) => ({
      id: b.id,
      name: b.name,
      block_type: b.block_type,
      content_md: b.content_md,
      match_score: b.match_score,
    })),
  };
}

// ===== TOP WINNERS & DECAY =====

async function detectTopWinners(supabase: any) {
  const { data: registry } = await supabase
    .from("blog_content_registry")
    .select("id, post_id, url, score_global, primary_keyword, category")
    .order("score_global", { ascending: false })
    .limit(100);

  if (!registry?.length) return { winners: [], actions: [] };

  const top10Pct = Math.max(1, Math.ceil(registry.length * 0.1));
  const winners = registry.slice(0, top10Pct);

  // Create improvement tasks for winners
  for (const winner of winners) {
    if ((winner.score_global || 0) < 100) {
      await supabase.from("blog_task_queue").insert({
        registry_id: winner.id,
        post_id: winner.post_id,
        queue: "Q4",
        priority: 5,
        task_type: "winner_expansion",
        description: `Expandir top winner: ${winner.url} (score: ${winner.score_global})`,
        status: "pending",
        payload: { action: "expand_semantic", current_score: winner.score_global },
      });
    }
  }

  return { winners: winners.map((w: any) => ({ id: w.id, url: w.url, score: w.score_global })), total: winners.length };
}

async function detectDecay(supabase: any) {
  // Detect posts with low scores that were previously higher
  const { data: registry } = await supabase
    .from("blog_content_registry")
    .select("id, post_id, url, score_global, primary_keyword, published_at, last_improved_at")
    .lt("score_global", 80)
    .order("score_global", { ascending: true });

  if (!registry?.length) return { decaying: [], total: 0 };

  const decaying = registry.filter((r: any) => {
    const publishedAt = r.published_at ? new Date(r.published_at).getTime() : 0;
    const daysSincePublish = (Date.now() - publishedAt) / (1000 * 60 * 60 * 24);
    return daysSincePublish > 30; // Only flag posts older than 30 days
  });

  // Create rescue tasks
  for (const post of decaying.slice(0, 10)) {
    await supabase.from("blog_task_queue").insert({
      registry_id: post.id,
      post_id: post.post_id,
      queue: "Q2",
      priority: 3,
      task_type: "decay_rescue",
      description: `Rescatar nota en decay: ${post.url} (score: ${post.score_global})`,
      status: "pending",
      payload: { action: "decay_rescue", current_score: post.score_global },
    });
  }

  return {
    decaying: decaying.map((d: any) => ({ id: d.id, url: d.url, score: d.score_global })),
    total: decaying.length,
  };
}
