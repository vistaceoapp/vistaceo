// blog-image-doctor: diagnostica y repara imágenes del blog
// Modos:
//   ?mode=scan       (default) — solo reporta, no toca nada, no gasta IA
//   ?mode=fix        — regenera heros rotos + limpia inline rotos
//   ?mode=enrich     — además inserta 1 imagen inline en notas largas sin ninguna
// Filtros opcionales: ?slug=xxx  (procesa solo esa nota)
//                     ?limit=10  (máximo de notas a procesar en una corrida)
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { decode as b64decode } from "https://deno.land/std@0.190.0/encoding/base64.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BUCKET = "blog-images";
const LOVABLE_KEY = Deno.env.get("LOVABLE_API_KEY") ?? "";
const SUPA_URL = Deno.env.get("SUPABASE_URL")!;
const SUPA_SR = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface Post {
  id: string;
  slug: string;
  title: string;
  category: string | null;
  pillar: string | null;
  hero_image_url: string | null;
  content_md: string | null;
  image_alt_text: string | null;
}

async function headOk(url: string, timeoutMs = 8000): Promise<boolean> {
  if (!url || !/^https?:\/\//i.test(url)) return false;
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs);
    const res = await fetch(url, { method: "HEAD", signal: ctrl.signal });
    clearTimeout(t);
    if (res.ok) return true;
    // algunos CDNs no soportan HEAD; reintentar con GET ranged
    const ctrl2 = new AbortController();
    const t2 = setTimeout(() => ctrl2.abort(), timeoutMs);
    const res2 = await fetch(url, { method: "GET", headers: { Range: "bytes=0-0" }, signal: ctrl2.signal });
    clearTimeout(t2);
    return res2.ok || res2.status === 206;
  } catch {
    return false;
  }
}

function extractInlineImages(md: string): { url: string; full: string }[] {
  const out: { url: string; full: string }[] = [];
  const re = /!\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(md)) !== null) {
    out.push({ url: m[1], full: m[0] });
  }
  return out;
}

function buildHeroPrompt(p: Post): string {
  const ctx: Record<string, string> = {
    "ia-para-pymes": "modern minimal workspace with subtle AI/data visualization, laptop on clean desk",
    "empleo-habilidades": "professional career development scene, resume and notebook on desk, soft natural light",
    "marketing-crecimiento": "modern marketing dashboard on screen, growth charts, clean office",
    "finanzas-cashflow": "minimalist financial planning desk, charts and calculator, premium executive",
    "operaciones-procesos": "organized workflow whiteboard, sticky notes, process diagram",
    "ventas-negociacion": "professional business handshake silhouette, modern meeting room",
    "liderazgo-management": "executive strategy session, premium meeting room from above",
    "estrategia-latam": "premium business strategy map, latin american modern office",
    "herramientas-productividad": "premium productivity desk setup, multiple devices, clean minimal",
    "data-analytics": "data dashboard glow on laptop, abstract data points, dark minimal",
    "tendencias-ia-tech": "futuristic minimal tech composition, soft blue/violet light",
    "servicios-profesionales-rentabilidad": "consultant meeting, premium business advisory, soft natural light",
  };
  const scene = ctx[p.category ?? ""] ?? "premium business editorial scene, modern minimal workspace";
  return [
    `Editorial 16:9 cover image about: ${p.title}.`,
    `Scene: ${scene}.`,
    "Ultra photorealistic, cinematic natural lighting, shallow depth of field, premium business editorial.",
    "Subtle blue (#2692DC) and violet (#746CE6) accent tones, never neon, never orange.",
    "NO text, NO logos, NO watermarks, NO UI screenshots, NO charts with numbers.",
    "If people appear: silhouettes, hands only, or from behind. Never identifiable faces.",
  ].join(" ");
}

async function generateImageB64(prompt: string): Promise<string | null> {
  if (!LOVABLE_KEY) return null;
  // Modelo barato y rápido
  const res = await fetch("https://ai.gateway.lovable.dev/v1/images/generations", {
    method: "POST",
    headers: { Authorization: `Bearer ${LOVABLE_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "openai/gpt-image-1-mini",
      prompt,
      size: "1536x1024",
      quality: "low",
      n: 1,
    }),
  });
  if (!res.ok) {
    console.error("[image-doctor] gateway error", res.status, await res.text().catch(() => ""));
    return null;
  }
  const j = await res.json();
  return j?.data?.[0]?.b64_json ?? null;
}

async function uploadHero(
  supabase: ReturnType<typeof createClient>,
  slug: string,
  b64: string,
): Promise<string | null> {
  const bin = b64decode(b64);
  const path = `hero-${slug}-${Date.now()}.png`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, bin, {
    contentType: "image/png",
    upsert: true,
  });
  if (error) {
    console.error("[image-doctor] upload error", error);
    return null;
  }
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const url = new URL(req.url);
  let mode = (url.searchParams.get("mode") ?? "scan").toLowerCase();
  const slug = url.searchParams.get("slug");
  const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "50", 10) || 50, 200);

  // permitir body POST
  if (req.method === "POST") {
    try {
      const body = await req.json();
      if (body?.mode) mode = String(body.mode).toLowerCase();
    } catch { /* ignore */ }
  }
  if (!["scan", "fix", "enrich"].includes(mode)) mode = "scan";

  const supabase = createClient(SUPA_URL, SUPA_SR);

  let q = supabase
    .from("blog_posts")
    .select("id,slug,title,category,pillar,hero_image_url,content_md,image_alt_text")
    .eq("status", "published");
  if (slug) q = q.eq("slug", slug);
  const { data: posts, error } = await q.limit(500);
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
  }

  const report: Array<{
    slug: string;
    hero_ok: boolean;
    broken_inline: number;
    inline_total: number;
    action: string;
    new_hero?: string;
  }> = [];

  let processed = 0;
  let heros_regenerated = 0;
  let inline_cleaned = 0;
  let inline_added = 0;

  for (const p of (posts ?? []) as Post[]) {
    if (processed >= limit) break;
    const heroOk = p.hero_image_url ? await headOk(p.hero_image_url) : false;
    const inline = p.content_md ? extractInlineImages(p.content_md) : [];
    const brokenInline: { url: string; full: string }[] = [];
    for (const img of inline) {
      const ok = await headOk(img.url, 6000);
      if (!ok) brokenInline.push(img);
    }

    const entry = {
      slug: p.slug,
      hero_ok: heroOk,
      broken_inline: brokenInline.length,
      inline_total: inline.length,
      action: "none",
    } as typeof report[number];

    if (mode === "scan") {
      report.push(entry);
      processed++;
      continue;
    }

    const updates: Record<string, string> = {};

    // 1. Reparar hero roto
    if (!heroOk) {
      const prompt = buildHeroPrompt(p);
      const b64 = await generateImageB64(prompt);
      if (b64) {
        const newUrl = await uploadHero(supabase, p.slug, b64);
        if (newUrl) {
          updates.hero_image_url = newUrl;
          if (!p.image_alt_text) updates.image_alt_text = p.title;
          entry.new_hero = newUrl;
          entry.action = "hero_regenerated";
          heros_regenerated++;
        }
      }
    }

    // 2. Limpiar inline rotos del markdown
    if (brokenInline.length > 0 && p.content_md) {
      let md = p.content_md;
      for (const img of brokenInline) {
        md = md.split(img.full).join("");
      }
      // normalizar saltos de línea consecutivos
      md = md.replace(/\n{3,}/g, "\n\n");
      updates.content_md = md;
      inline_cleaned += brokenInline.length;
      entry.action = entry.action === "none" ? "inline_cleaned" : entry.action + "+inline_cleaned";
    }

    // 3. Enriquecer: insertar 1 inline si la nota es larga y no tiene ninguna
    if (
      mode === "enrich" &&
      inline.length - brokenInline.length === 0 &&
      (p.content_md?.length ?? 0) > 8000 &&
      heroOk &&
      !updates.hero_image_url
    ) {
      const prompt = buildHeroPrompt(p) + " Variation: secondary editorial shot, different angle.";
      const b64 = await generateImageB64(prompt);
      if (b64) {
        const newUrl = await uploadHero(supabase, p.slug + "-inline", b64);
        if (newUrl) {
          const md = updates.content_md ?? p.content_md ?? "";
          // insertar después del primer H2
          const lines = md.split("\n");
          let inserted = false;
          for (let i = 0; i < lines.length; i++) {
            if (/^##\s+/.test(lines[i])) {
              lines.splice(i + 1, 0, "", `![${p.title}](${newUrl})`, "");
              inserted = true;
              break;
            }
          }
          if (!inserted) lines.push("", `![${p.title}](${newUrl})`, "");
          updates.content_md = lines.join("\n");
          inline_added++;
          entry.action = entry.action === "none" ? "inline_added" : entry.action + "+inline_added";
        }
      }
    }

    if (Object.keys(updates).length > 0) {
      const { error: upErr } = await supabase
        .from("blog_posts")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", p.id);
      if (upErr) {
        entry.action = "update_error:" + upErr.message;
      }
    }

    report.push(entry);
    processed++;
  }

  return new Response(
    JSON.stringify({
      mode,
      processed,
      heros_regenerated,
      inline_cleaned,
      inline_added,
      report,
    }, null, 2),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
