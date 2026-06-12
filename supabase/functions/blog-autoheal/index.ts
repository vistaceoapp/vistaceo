// blog-autoheal — reparación quirúrgica con IA mínima.
// Input: { incident_id } o { post_id, issues[] }
// Solo arregla campos puntuales. NUNCA reescribe la nota completa.
// Versionado en blog_autoheal_runs (before/after).

import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-2.5-flash-lite"; // económico

async function aiCall(systemPrompt: string, userPrompt: string, maxTokens = 200): Promise<string> {
  const key = Deno.env.get("LOVABLE_API_KEY");
  if (!key) throw new Error("LOVABLE_API_KEY missing");
  const res = await fetch(GATEWAY, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: maxTokens,
      temperature: 0.4,
    }),
  });
  if (!res.ok) throw new Error(`AI ${res.status}: ${await res.text()}`);
  const json = await res.json();
  return (json.choices?.[0]?.message?.content ?? "").trim();
}

interface Body {
  incident_id?: string;
  post_id?: string;
  issues?: string[];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  try {
    const body = (await req.json()) as Body;
    let incident: any = null;
    let postId = body.post_id;
    let issues = body.issues ?? [];

    if (body.incident_id) {
      const { data } = await supabase
        .from("ops_incidents")
        .select("*")
        .eq("id", body.incident_id)
        .maybeSingle();
      if (!data) throw new Error("Incident not found");
      incident = data;
      const ctx = (data.context ?? {}) as Record<string, unknown>;
      postId = postId ?? (ctx.post_id as string | undefined);
      if (!issues.length && Array.isArray(ctx.issues)) issues = ctx.issues as string[];
    }

    if (!postId) throw new Error("post_id requerido");

    const { data: post, error: postErr } = await supabase
      .from("blog_posts")
      .select("id, slug, title, content_md, meta_description, excerpt, hero_image_url, primary_keyword, status")
      .eq("id", postId)
      .maybeSingle();
    if (postErr || !post) throw new Error("Post not found");

    if (incident?.id) {
      await supabase.from("ops_incidents").update({ status: "auto_fixing" }).eq("id", incident.id);
    }

    const before = { ...post };
    const updates: Record<string, unknown> = {};
    const fieldsChanged: string[] = [];
    const skipped: string[] = [];
    let aiCalls = 0;
    let manualRequired = false;
    const notes: string[] = [];

    const has = (kw: string) => issues.some((i) => i === kw || i.startsWith(kw));

    // 1) META DESCRIPTION — 1 AI call, ≤200 tokens out
    if (has("missing_meta_description") || has("db_meta_thin") || has("meta_description_length_")) {
      try {
        const out = await aiCall(
          "Sos editor SEO. Devolvés SOLO la meta description en español neutro profesional, 140-155 chars, sin comillas, sin emojis, sin clickbait. Incluí keyword si aplica.",
          `Título: ${post.title}\nKeyword: ${post.primary_keyword ?? "n/a"}\nExtracto: ${(post.excerpt ?? "").slice(0, 400)}\nContenido inicio: ${(post.content_md ?? "").slice(0, 800)}`,
          120,
        );
        aiCalls++;
        const cleaned = out.replace(/^["']|["']$/g, "").replace(/\s+/g, " ").trim();
        if (cleaned.length >= 60 && cleaned.length <= 165) {
          updates.meta_description = cleaned;
          fieldsChanged.push("meta_description");
        } else {
          notes.push(`meta IA fuera de rango (${cleaned.length})`);
          skipped.push("meta_description");
        }
      } catch (e) {
        notes.push(`meta IA error: ${(e as Error).message}`);
        skipped.push("meta_description");
      }
    }

    // 2) MISSING H1 — fix sin IA (prepend al markdown)
    if (has("missing_h1") && post.content_md && !/^#\s/m.test(post.content_md)) {
      updates.content_md = `# ${post.title}\n\n${post.content_md}`;
      fieldsChanged.push("content_md(h1)");
    }

    // 3) PLACEHOLDER LEAK — quitar sin IA
    if (has("template_placeholder_leak") && post.content_md) {
      const cleaned = post.content_md.replace(/\{\{[^}]+\}\}/g, "").replace(/\n{3,}/g, "\n\n");
      if (cleaned !== post.content_md) {
        updates.content_md = (updates.content_md as string ?? cleaned)
          .replace(/\{\{[^}]+\}\}/g, "")
          .replace(/\n{3,}/g, "\n\n");
        if (!fieldsChanged.includes("content_md(h1)")) fieldsChanged.push("content_md(placeholders)");
      }
    }

    // 4) Casos que NO auto-curamos en esta versión (requieren generación pesada)
    for (const i of issues) {
      if (
        i === "db_content_thin" ||
        i === "lorem_ipsum_leak" ||
        i === "no_hero_image_url" ||
        i === "hero_image_unreachable" ||
        i.startsWith("http_5") ||
        i.startsWith("images_missing_alt_")
      ) {
        manualRequired = true;
        skipped.push(i);
      }
    }

    // Persist
    let status: "applied" | "skipped" | "manual_required" | "failed" = "applied";
    if (fieldsChanged.length === 0) {
      status = manualRequired ? "manual_required" : "skipped";
    }

    if (fieldsChanged.length > 0) {
      const { error: upErr } = await supabase
        .from("blog_posts")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", postId);
      if (upErr) {
        status = "failed";
        notes.push(`update error: ${upErr.message}`);
      }
    }

    const { data: run } = await supabase
      .from("blog_autoheal_runs")
      .insert({
        post_id: postId,
        incident_id: incident?.id ?? null,
        slug: post.slug,
        issues,
        fields_changed: fieldsChanged,
        before_snapshot: {
          meta_description: before.meta_description,
          content_md_len: before.content_md?.length ?? 0,
        },
        after_snapshot: {
          meta_description: updates.meta_description ?? before.meta_description,
          content_md_len: (updates.content_md as string | undefined)?.length ?? before.content_md?.length ?? 0,
        },
        ai_model: aiCalls > 0 ? MODEL : null,
        ai_calls: aiCalls,
        status,
        notes: notes.join(" | ") || null,
      })
      .select("id")
      .single();

    // Update incident
    if (incident?.id) {
      const incStatus =
        status === "applied" ? "fixed" :
        status === "manual_required" ? "manual_required" :
        status === "failed" ? "open" : "open";

      await supabase
        .from("ops_incidents")
        .update({
          status: incStatus,
          fix_strategy: `autoheal: ${fieldsChanged.join(", ") || "ninguno"}`,
          fix_result: { run_id: run?.id, fields_changed: fieldsChanged, skipped, ai_calls: aiCalls, notes },
          fixed_at: status === "applied" ? new Date().toISOString() : null,
        })
        .eq("id", incident.id);
    }

    // Trigger revalidate si cambió algo publicable
    if (fieldsChanged.length > 0 && post.status === "published") {
      try {
        await supabase.functions.invoke("trigger-blog-revalidate", {
          body: { slug: post.slug, type: "single" },
        });
      } catch (e) {
        console.error("[blog-autoheal] revalidate failed", e);
      }
    }

    return new Response(
      JSON.stringify({ ok: true, status, fields_changed: fieldsChanged, skipped, ai_calls: aiCalls, run_id: run?.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("[blog-autoheal] error", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
