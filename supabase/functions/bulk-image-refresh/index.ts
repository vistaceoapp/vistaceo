import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * BULK IMAGE REFRESH — Regenera imágenes hero con máxima diversidad visual
 * 
 * Cada imagen es radicalmente diferente: distinto plano, sujeto, luz, atmósfera.
 * Procesa N posts por invocación (default 5, max 10).
 * 
 * Modes:
 *  - "oldest": regenera las imágenes más viejas primero
 *  - "all": procesa todas secuencialmente
 *  - "slugs": regenera slugs específicos
 */

const NEGATIVE_PROMPT = "text, words, letters, typography, captions, logos, watermark, signature, UI, interface, blurry, low quality, oversaturated, plastic skin, artificial textures, deformed hands, extra fingers, distorted anatomy, unrealistic lighting, CGI, 3D render, cartoon, illustration, overly stylized, generic stock photo, duplicated objects, AI artifacts, clipart, icons, lightbulbs, growth arrows, floating graphics";

// 20 radically different visual formulas — NO TWO consecutive posts should look alike
const VISUAL_FORMULAS: Array<{ label: string; prompt: string }> = [
  {
    label: "hands-detail",
    prompt: "Extreme close-up of real human hands writing in a leather notebook with a fountain pen, warm desk lamp glow, shallow depth of field, vintage wood desk texture, coffee cup edge visible, editorial macro photography"
  },
  {
    label: "urban-street",
    prompt: "Wide angle street photography of a modern Latin American business district at golden hour, glass buildings reflecting sunset, one professional walking away from camera, urban energy, warm orange-blue contrast, documentary style"
  },
  {
    label: "aerial-workspace",
    prompt: "Perfectly composed overhead flat lay of an authentic work desk: real documents with charts, smartphone, glasses, colored sticky notes, plant leaf edge, natural morning window light casting soft shadows, ultra detailed textures"
  },
  {
    label: "silhouette-window",
    prompt: "Dramatic silhouette of a business professional standing at floor-to-ceiling windows overlooking a Latin American city skyline, early morning blue hour light, reflective glass, moody cinematic atmosphere, architectural framing"
  },
  {
    label: "team-candid",
    prompt: "Candid documentary photo of a diverse team in a modern open office, shot from behind/side, natural laughter moment, laptops open, whiteboards with real diagrams visible in background, warm afternoon daylight, authentic human connection"
  },
  {
    label: "coffee-shop",
    prompt: "Atmospheric photo inside an upscale Latin American café, person working on laptop seen from side profile, steam rising from artisan coffee, exposed brick wall, hanging plants, moody natural light from large windows, lifestyle editorial"
  },
  {
    label: "data-screen",
    prompt: "Close-up of a real computer monitor displaying colorful data dashboards and analytics charts, person's hands on keyboard slightly out of focus, dark modern office, screen glow illuminating the scene, tech editorial photography"
  },
  {
    label: "architecture-minimal",
    prompt: "Minimalist architectural photography of a modern corporate building entrance, clean geometric lines, polished concrete and glass, one person entering as a small figure for scale, overcast sky creating even diffused light, fine art commercial style"
  },
  {
    label: "workshop-action",
    prompt: "Action shot of a professional workshop or training session, presenter pointing at a real presentation screen, audience seen from behind, conference room with natural light, energetic atmosphere, business event photography"
  },
  {
    label: "nature-strategy",
    prompt: "Person sitting on an outdoor terrace with laptop and notepad, overlooking tropical garden or mountain landscape, Latin American setting, early morning golden light, relaxed strategic planning moment, premium travel-work editorial"
  },
  {
    label: "close-phone",
    prompt: "Ultra detailed close-up of hands holding a smartphone displaying business messages, blurred modern office background with warm bokeh lights, shallow DOF, contemporary commercial photography, authentic textures"
  },
  {
    label: "library-knowledge",
    prompt: "Atmospheric photo of a modern library or study space, rows of books creating leading lines, person reading in background soft-focused, warm tungsten lighting mixed with cool daylight, scholarly editorial photography"
  },
  {
    label: "manufacturing-real",
    prompt: "Real industrial workspace or small factory, artisan hands crafting a product, authentic tools and materials visible, warm workshop lighting, dust particles visible in light beams, documentary manufacturing photography"
  },
  {
    label: "rooftop-city",
    prompt: "Person on a rooftop terrace at dusk with a panoramic Latin American city view, laptop open on a small table, city lights beginning to glow, purple-orange twilight sky, aspirational lifestyle photography"
  },
  {
    label: "whiteboard-strategy",
    prompt: "Person drawing a strategic framework on a large whiteboard, shot over their shoulder, colorful markers and real diagrams visible, bright modern meeting room, natural daylight, authentic business planning moment"
  },
  {
    label: "market-vibrant",
    prompt: "Vibrant Latin American street market or commercial district, colorful storefronts, morning activity, vendors and shoppers in natural motion blur, wide angle, authentic cultural business atmosphere, documentary color photography"
  },
  {
    label: "zen-focus",
    prompt: "Peaceful minimalist workspace with a single person in deep focus, clean white desk, single plant, headphones on, laptop screen glowing, large window with soft overcast light, zen productivity editorial photography"
  },
  {
    label: "construction-growth",
    prompt: "Modern building under construction with cranes and scaffolding against blue sky, metaphor for business growth, architectural photography with human workers as small figures, golden hour side lighting, editorial infrastructure"
  },
  {
    label: "handshake-abstract",
    prompt: "Abstract close-up of two professionals in a handshake, focus on hands and forearms only, blurred elegant office background, warm directional side light creating dramatic shadows, business trust photography"
  },
  {
    label: "night-hustle",
    prompt: "Late night office scene, single desk lamp illuminating a workspace with scattered notes and an open laptop, city lights visible through window, moody blue-amber color palette, dedicated entrepreneur atmosphere, cinematic night photography"
  },
];

function getVisualFormula(slug: string, index: number): { label: string; prompt: string } {
  // Use a combination of slug hash and index to ensure diversity
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = ((hash << 5) - hash) + slug.charCodeAt(i);
    hash |= 0;
  }
  // Mix index to avoid same formula for posts with similar slugs
  const combined = Math.abs(hash + index * 7) % VISUAL_FORMULAS.length;
  return VISUAL_FORMULAS[combined];
}

// Category-specific context enrichment
const CATEGORY_CONTEXT: Record<string, string> = {
  "ia-para-pymes": "artificial intelligence tools in a real business setting",
  "empleo-habilidades": "career development and professional growth",
  "marketing-crecimiento": "creative marketing and digital growth strategies",
  "finanzas-cashflow": "financial analysis and business accounting",
  "operaciones-procesos": "business operations and workflow optimization",
  "ventas-negociacion": "sales meetings and negotiation scenarios",
  "liderazgo-management": "leadership and team management",
  "estrategia-latam": "Latin American business strategy and regional markets",
  "herramientas-productividad": "productivity tools and efficient workflows",
  "data-analytics": "data analysis, charts, and business intelligence",
  "tendencias-ia-tech": "cutting-edge technology and innovation trends",
  "servicios-profesionales-rentabilidad": "professional services and client relationships",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

    if (!lovableApiKey) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const body = await req.json().catch(() => ({}));
    const mode = body.mode || "oldest";
    const limit = Math.min(body.limit || 5, 10);
    const slugs: string[] = body.slugs || [];

    console.log(`[BulkImageRefresh] Mode: ${mode}, Limit: ${limit}`);

    let posts: any[] = [];

    if (mode === "slugs" && slugs.length > 0) {
      const { data } = await supabase
        .from("blog_posts")
        .select("id, slug, title, pillar, category, primary_keyword, excerpt, hero_image_url")
        .eq("status", "published")
        .in("slug", slugs);
      posts = data || [];
    } else if (mode === "oldest") {
      // Get posts with the oldest hero images (by filename timestamp) or no image
      const { data } = await supabase
        .from("blog_posts")
        .select("id, slug, title, pillar, category, primary_keyword, excerpt, hero_image_url")
        .eq("status", "published")
        .order("publish_at", { ascending: true })
        .limit(limit * 3); // Fetch more to filter
      
      // Sort by image age (extract timestamp from filename) — oldest first
      posts = (data || []).sort((a: any, b: any) => {
        const tsA = extractImageTimestamp(a.hero_image_url);
        const tsB = extractImageTimestamp(b.hero_image_url);
        return tsA - tsB;
      }).slice(0, limit);
    } else if (mode === "all") {
      const { data } = await supabase
        .from("blog_posts")
        .select("id, slug, title, pillar, category, primary_keyword, excerpt, hero_image_url")
        .eq("status", "published")
        .order("publish_at", { ascending: false })
        .limit(limit);
      posts = data || [];
    }

    if (posts.length === 0) {
      return new Response(JSON.stringify({ success: true, message: "No posts to process", generated: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`[BulkImageRefresh] Processing ${posts.length} posts...`);

    const results: any[] = [];

    for (let i = 0; i < posts.length; i++) {
      const post = posts[i];
      const formula = getVisualFormula(post.slug, i);
      const categoryCtx = CATEGORY_CONTEXT[post.category] || CATEGORY_CONTEXT[post.pillar] || "professional business environment";

      const imagePrompt = `${formula.prompt}

Topic connection: The scene subtly relates to "${post.title}" in the context of ${categoryCtx}.
Latin American professional environment. Ultra realistic. Hasselblad medium format quality. 16:9 aspect ratio. Ultra HD resolution.
Strictly no text, no letters, no logos, no watermarks, no UI elements.
${NEGATIVE_PROMPT}`;

      console.log(`[BulkImageRefresh] [${i + 1}/${posts.length}] ${post.slug} → ${formula.label}`);

      try {
        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${lovableApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash-image",
            messages: [{ role: "user", content: imagePrompt }],
            modalities: ["image", "text"],
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          console.error(`[BulkImageRefresh] API error ${response.status}:`, errText.slice(0, 200));
          results.push({ slug: post.slug, success: false, error: `API ${response.status}` });

          if (response.status === 429) {
            console.log("[BulkImageRefresh] Rate limited, waiting 10s...");
            await new Promise(r => setTimeout(r, 10000));
          }
          continue;
        }

        const result = await response.json();
        const imageUrl = result.choices?.[0]?.message?.images?.[0]?.image_url?.url;

        if (!imageUrl) {
          results.push({ slug: post.slug, success: false, error: "no_image_returned" });
          continue;
        }

        // Upload to storage
        const publicUrl = await uploadToStorage(imageUrl, post.slug, supabaseUrl, supabaseKey);

        if (publicUrl) {
          await supabase.from("blog_posts").update({
            hero_image_url: publicUrl,
            image_alt_text: `Imagen editorial: ${post.title}`,
            updated_at: new Date().toISOString(),
          }).eq("id", post.id);

          results.push({ slug: post.slug, success: true, formula: formula.label, url: publicUrl });
          console.log(`[BulkImageRefresh] ✓ ${post.slug} → ${formula.label}`);
        } else {
          results.push({ slug: post.slug, success: false, error: "upload_failed" });
        }

        // Delay between generations to avoid rate limits
        await new Promise(r => setTimeout(r, 4000));

      } catch (err: any) {
        console.error(`[BulkImageRefresh] Error on ${post.slug}:`, err.message);
        results.push({ slug: post.slug, success: false, error: err.message });
      }
    }

    const successCount = results.filter(r => r.success).length;
    console.log(`[BulkImageRefresh] Complete: ${successCount}/${results.length} images regenerated`);

    return new Response(JSON.stringify({
      success: true,
      generated: successCount,
      total: results.length,
      results,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (err: any) {
    console.error("[BulkImageRefresh] Fatal:", err);
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function extractImageTimestamp(url: string | null): number {
  if (!url) return 0;
  const match = url.match(/(\d{13})\./);
  return match ? parseInt(match[1]) : 0;
}

async function uploadToStorage(base64OrUrl: string, slug: string, supabaseUrl: string, supabaseKey: string): Promise<string | null> {
  try {
    let bytes: Uint8Array;
    let mimeType = "image/jpeg";

    if (base64OrUrl.startsWith("data:image")) {
      const matches = base64OrUrl.match(/^data:([^;]+);base64,(.+)$/);
      if (!matches) return null;
      mimeType = matches[1];
      const binary = atob(matches[2]);
      bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    } else if (base64OrUrl.startsWith("https://")) {
      const resp = await fetch(base64OrUrl);
      bytes = new Uint8Array(await resp.arrayBuffer());
      mimeType = resp.headers.get("content-type") || "image/jpeg";
    } else {
      return null;
    }

    if (bytes.length < 5000) return null;

    const ext = mimeType.includes("png") ? "png" : "jpg";
    const fileName = `${slug}-hero-${Date.now()}.${ext}`;

    const response = await fetch(`${supabaseUrl}/storage/v1/object/blog-images/${fileName}`, {
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
      const sb = createClient(supabaseUrl, supabaseKey, { auth: { autoRefreshToken: false, persistSession: false } });
      const { error } = await sb.storage.from("blog-images").upload(fileName, bytes, { contentType: mimeType, upsert: true });
      if (error) return null;
      const { data: pub } = sb.storage.from("blog-images").getPublicUrl(fileName);
      return pub.publicUrl;
    }

    return `${supabaseUrl}/storage/v1/object/public/blog-images/${fileName}`;
  } catch (err: any) {
    console.error("[BulkImageRefresh] Upload error:", err.message);
    return null;
  }
}
