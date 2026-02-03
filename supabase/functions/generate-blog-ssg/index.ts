import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CANONICAL_DOMAIN = "https://www.vistaceo.com";
const DEFAULT_OG_IMAGE = `${CANONICAL_DOMAIN}/og-blog-default.jpg`;
const STORAGE_BUCKET = "blog-ssg-pages";

// ===== HTML ESCAPING =====
function escapeHtml(text: string): string {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

function truncate(text: string, maxLength: number): string {
  if (!text) return "";
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (cleaned.length <= maxLength) return cleaned;
  const truncated = cleaned.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");
  return lastSpace > maxLength * 0.6 ? truncated.substring(0, lastSpace) + "..." : truncated + "...";
}

// ===== IMAGE URL VALIDATION =====
function getValidImageUrl(heroImageUrl: string | null): string {
  if (!heroImageUrl) return DEFAULT_OG_IMAGE;
  if (heroImageUrl.startsWith("data:")) return DEFAULT_OG_IMAGE;
  if (heroImageUrl.startsWith("https://")) return heroImageUrl;
  if (heroImageUrl.startsWith("http://")) return heroImageUrl.replace("http://", "https://");
  if (heroImageUrl.startsWith("/")) return `${CANONICAL_DOMAIN}${heroImageUrl}`;
  return DEFAULT_OG_IMAGE;
}

// ===== MARKDOWN TO HTML (BASIC) =====
function markdownToHtml(markdown: string): string {
  if (!markdown) return "";
  
  let html = markdown
    // Code blocks
    .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
    // Headers
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // Bold and italic
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    // Images
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" loading="lazy" />')
    // Lists
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
    // Horizontal rules
    .replace(/^---$/gm, '<hr />')
    // Paragraphs
    .split('\n\n')
    .map(block => {
      block = block.trim();
      if (!block) return '';
      if (block.startsWith('<')) return block;
      return `<p>${block.replace(/\n/g, '<br />')}</p>`;
    })
    .join('\n');

  return html;
}

// ===== EXTRACT TOC =====
function extractTableOfContents(markdown: string): Array<{level: number, text: string, id: string}> {
  const toc: Array<{level: number, text: string, id: string}> = [];
  const headingRegex = /^(#{2,3})\s+(.+)$/gm;
  let match;
  
  while ((match = headingRegex.exec(markdown)) !== null) {
    const level = match[1].length;
    const text = match[2].replace(/[*_`]/g, '').trim();
    const id = text.toLowerCase().replace(/[^a-z0-9áéíóúñü]+/g, '-').replace(/^-|-$/g, '');
    toc.push({ level, text, id });
  }
  
  return toc.slice(0, 12);
}

// ===== JSON-LD GENERATION =====
function generateJsonLd(post: any, canonicalUrl: string, imageUrl: string) {
  const publishDate = post.publish_at || new Date().toISOString();
  const modifiedDate = post.updated_at || publishDate;
  
  return {
    blogPosting: {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": post.meta_title || post.title,
      "description": truncate(post.meta_description || post.excerpt || "", 160),
      "image": imageUrl,
      "url": canonicalUrl,
      "datePublished": publishDate,
      "dateModified": modifiedDate,
      "author": {
        "@type": "Person",
        "name": post.author_name || "Equipo VistaCEO"
      },
      "publisher": {
        "@type": "Organization",
        "name": "VistaCEO",
        "logo": {
          "@type": "ImageObject",
          "url": `${CANONICAL_DOMAIN}/favicon.png`
        }
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": canonicalUrl
      }
    },
    breadcrumb: {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Inicio", "item": CANONICAL_DOMAIN },
        { "@type": "ListItem", "position": 2, "name": "Blog", "item": `${CANONICAL_DOMAIN}/blog` },
        { "@type": "ListItem", "position": 3, "name": post.title, "item": canonicalUrl }
      ]
    },
    organization: {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "VistaCEO",
      "url": CANONICAL_DOMAIN,
      "logo": `${CANONICAL_DOMAIN}/favicon.png`,
      "sameAs": [
        "https://www.linkedin.com/company/vistaceo"
      ]
    }
  };
}

// ===== GENERATE FULL HTML PAGE =====
function generateStaticHtml(post: any): string {
  const canonicalUrl = `${CANONICAL_DOMAIN}/blog/${post.slug}`;
  const imageUrl = getValidImageUrl(post.hero_image_url);
  const title = escapeHtml(post.meta_title || post.title);
  const description = escapeHtml(truncate(post.meta_description || post.excerpt || "", 160));
  const publishDate = post.publish_at || new Date().toISOString();
  const modifiedDate = post.updated_at || publishDate;
  const authorName = escapeHtml(post.author_name || "Equipo VistaCEO");
  
  const jsonLd = generateJsonLd(post, canonicalUrl, imageUrl);
  const toc = extractTableOfContents(post.content_md || "");
  const contentHtml = markdownToHtml(post.content_md || "");
  
  // Format publish date for display
  const publishDateFormatted = new Date(publishDate).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long", 
    day: "numeric"
  });

  const tagsHtml = post.tags?.length 
    ? post.tags.map((tag: string) => `<meta property="article:tag" content="${escapeHtml(tag)}">`).join("\n    ")
    : "";

  const tocHtml = toc.length > 0 ? `
    <nav class="toc" aria-label="Contenido del artículo">
      <h2>En este artículo</h2>
      <ul>
        ${toc.map(h => `<li class="toc-h${h.level}"><a href="#${h.id}">${escapeHtml(h.text)}</a></li>`).join("\n        ")}
      </ul>
    </nav>
  ` : "";

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  
  <!-- SEO Core -->
  <title>${title} | VistaCEO Blog</title>
  <meta name="description" content="${description}">
  <link rel="canonical" href="${canonicalUrl}">
  <meta name="robots" content="index, follow, max-image-preview:large">
  
  <!-- Open Graph -->
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="VistaCEO">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:image" content="${imageUrl}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${escapeHtml(post.image_alt_text || title)}">
  <meta property="og:locale" content="es_LA">
  <meta property="article:published_time" content="${publishDate}">
  <meta property="article:modified_time" content="${modifiedDate}">
  <meta property="article:author" content="${authorName}">
  ${tagsHtml}
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@vistaceo">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${imageUrl}">
  <meta name="twitter:image:alt" content="${escapeHtml(post.image_alt_text || title)}">
  
  <!-- Favicon -->
  <link rel="icon" type="image/png" href="${CANONICAL_DOMAIN}/favicon.png">
  <link rel="apple-touch-icon" href="${CANONICAL_DOMAIN}/favicon.png">
  
  <!-- Preconnect -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  
  <!-- Structured Data -->
  <script type="application/ld+json">${JSON.stringify(jsonLd.blogPosting)}</script>
  <script type="application/ld+json">${JSON.stringify(jsonLd.breadcrumb)}</script>
  <script type="application/ld+json">${JSON.stringify(jsonLd.organization)}</script>
  
  <!-- Minimal Styles for Readability -->
  <style>
    :root {
      --primary: #7c3aed;
      --bg: #0f0f0f;
      --surface: #1a1a1a;
      --text: #e5e5e5;
      --text-muted: #a3a3a3;
      --border: #2a2a2a;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html { font-size: 16px; scroll-behavior: smooth; }
    body {
      font-family: system-ui, -apple-system, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.7;
      min-height: 100vh;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem 1.5rem;
    }
    header {
      padding: 1rem 1.5rem;
      border-bottom: 1px solid var(--border);
      background: var(--surface);
    }
    .logo {
      font-weight: 700;
      font-size: 1.25rem;
      color: var(--primary);
      text-decoration: none;
    }
    .breadcrumb {
      font-size: 0.875rem;
      color: var(--text-muted);
      margin-bottom: 1.5rem;
    }
    .breadcrumb a {
      color: var(--text-muted);
      text-decoration: none;
    }
    .breadcrumb a:hover { color: var(--primary); }
    article { margin-bottom: 3rem; }
    h1 {
      font-size: 2rem;
      font-weight: 700;
      line-height: 1.2;
      margin-bottom: 1rem;
      color: var(--text);
    }
    .meta {
      font-size: 0.875rem;
      color: var(--text-muted);
      margin-bottom: 1.5rem;
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }
    .hero-image {
      width: 100%;
      height: auto;
      border-radius: 0.5rem;
      margin-bottom: 2rem;
    }
    .toc {
      background: var(--surface);
      padding: 1.5rem;
      border-radius: 0.5rem;
      margin-bottom: 2rem;
      border: 1px solid var(--border);
    }
    .toc h2 {
      font-size: 1rem;
      margin-bottom: 0.75rem;
      color: var(--text);
    }
    .toc ul { list-style: none; }
    .toc li { margin-bottom: 0.5rem; }
    .toc a {
      color: var(--text-muted);
      text-decoration: none;
      font-size: 0.9rem;
    }
    .toc a:hover { color: var(--primary); }
    .toc-h3 { padding-left: 1rem; }
    .content h2 {
      font-size: 1.5rem;
      font-weight: 600;
      margin: 2rem 0 1rem;
      color: var(--text);
    }
    .content h3 {
      font-size: 1.25rem;
      font-weight: 600;
      margin: 1.5rem 0 0.75rem;
      color: var(--text);
    }
    .content p { margin-bottom: 1rem; }
    .content ul, .content ol {
      margin: 1rem 0;
      padding-left: 1.5rem;
    }
    .content li { margin-bottom: 0.5rem; }
    .content a {
      color: var(--primary);
      text-decoration: underline;
    }
    .content img {
      max-width: 100%;
      height: auto;
      border-radius: 0.5rem;
      margin: 1.5rem 0;
    }
    .content pre {
      background: var(--surface);
      padding: 1rem;
      border-radius: 0.5rem;
      overflow-x: auto;
      margin: 1rem 0;
    }
    .content code {
      font-family: ui-monospace, monospace;
      font-size: 0.875rem;
    }
    .content hr {
      border: none;
      border-top: 1px solid var(--border);
      margin: 2rem 0;
    }
    .content blockquote {
      border-left: 3px solid var(--primary);
      padding-left: 1rem;
      margin: 1.5rem 0;
      color: var(--text-muted);
      font-style: italic;
    }
    .cta-box {
      background: linear-gradient(135deg, var(--primary), #9333ea);
      padding: 2rem;
      border-radius: 0.75rem;
      margin: 2rem 0;
      text-align: center;
    }
    .cta-box h3 {
      color: white;
      margin-bottom: 0.5rem;
    }
    .cta-box p {
      color: rgba(255,255,255,0.9);
      margin-bottom: 1rem;
    }
    .cta-box a {
      display: inline-block;
      background: white;
      color: var(--primary);
      padding: 0.75rem 2rem;
      border-radius: 0.5rem;
      text-decoration: none;
      font-weight: 600;
    }
    footer {
      border-top: 1px solid var(--border);
      padding: 2rem 1.5rem;
      text-align: center;
      color: var(--text-muted);
      font-size: 0.875rem;
    }
    footer a {
      color: var(--text-muted);
      text-decoration: none;
    }
    footer a:hover { color: var(--primary); }
    @media (max-width: 640px) {
      h1 { font-size: 1.5rem; }
      .container { padding: 1.5rem 1rem; }
    }
  </style>
</head>
<body>
  <header>
    <a href="${CANONICAL_DOMAIN}" class="logo">VistaCEO</a>
  </header>
  
  <main class="container">
    <nav class="breadcrumb" aria-label="Breadcrumb">
      <a href="${CANONICAL_DOMAIN}">Inicio</a> / 
      <a href="${CANONICAL_DOMAIN}/blog">Blog</a> / 
      <span>${title}</span>
    </nav>
    
    <article itemscope itemtype="https://schema.org/BlogPosting">
      <h1 itemprop="headline">${title}</h1>
      
      <div class="meta">
        <span itemprop="author" itemscope itemtype="https://schema.org/Person">
          Por <span itemprop="name">${authorName}</span>
        </span>
        <time itemprop="datePublished" datetime="${publishDate}">${publishDateFormatted}</time>
        ${post.reading_time_min ? `<span>${post.reading_time_min} min de lectura</span>` : ""}
      </div>
      
      ${post.hero_image_url && !post.hero_image_url.startsWith("data:") ? 
        `<img 
          class="hero-image" 
          src="${imageUrl}" 
          alt="${escapeHtml(post.image_alt_text || title)}"
          itemprop="image"
          loading="eager"
        />` : ""
      }
      
      ${tocHtml}
      
      <div class="content" itemprop="articleBody">
        ${contentHtml}
      </div>
      
      <div class="cta-box">
        <h3>¿Querés tomar mejores decisiones en tu negocio?</h3>
        <p>VistaCEO te da la visión de un CEO, aunque no tengas uno.</p>
        <a href="${CANONICAL_DOMAIN}?utm_source=blog&utm_medium=cta&utm_campaign=${post.slug}">Conocé VistaCEO</a>
      </div>
    </article>
  </main>
  
  <footer>
    <p>© ${new Date().getFullYear()} VistaCEO. Todos los derechos reservados.</p>
    <p>
      <a href="${CANONICAL_DOMAIN}/blog">Más artículos</a> · 
      <a href="${CANONICAL_DOMAIN}/privacy">Privacidad</a> · 
      <a href="${CANONICAL_DOMAIN}/terms">Términos</a>
    </p>
  </footer>
</body>
</html>`;
}

// ===== MAIN HANDLER =====
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const startTime = Date.now();
  
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    const slug = url.searchParams.get("slug");
    const batch = url.searchParams.get("batch") === "true";

    // BATCH MODE: Generate all published posts
    if (batch) {
      console.log("[SSG] Starting batch generation...");
      
      const { data: posts, error: fetchError } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("status", "published")
        .order("publish_at", { ascending: false });

      if (fetchError) throw new Error(`Fetch error: ${fetchError.message}`);
      if (!posts || posts.length === 0) {
        return new Response(
          JSON.stringify({ success: true, message: "No published posts found", generated: 0 }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log(`[SSG] Found ${posts.length} published posts`);

      const results: Array<{slug: string, success: boolean, error?: string}> = [];

      for (const post of posts) {
        try {
          const html = generateStaticHtml(post);
          const htmlBytes = new TextEncoder().encode(html);
          const storagePath = `blog/${post.slug}/index.html`;

          // Upload to storage
          const { error: uploadError } = await supabase.storage
            .from(STORAGE_BUCKET)
            .upload(storagePath, htmlBytes, {
              contentType: "text/html; charset=utf-8",
              upsert: true,
              cacheControl: "public, max-age=300, stale-while-revalidate=600"
            });

          if (uploadError) throw uploadError;

          // Log audit
          await supabase.from("blog_ssg_audits").insert({
            slug: post.slug,
            action: "generate",
            success: true,
            html_size_bytes: htmlBytes.length,
            generation_time_ms: Date.now() - startTime,
            triggered_by: "batch"
          });

          results.push({ slug: post.slug, success: true });
          console.log(`[SSG] ✓ Generated: ${post.slug}`);
        } catch (err: any) {
          results.push({ slug: post.slug, success: false, error: err.message });
          console.error(`[SSG] ✗ Error for ${post.slug}:`, err.message);
          
          await supabase.from("blog_ssg_audits").insert({
            slug: post.slug,
            action: "error",
            success: false,
            error_message: err.message,
            triggered_by: "batch"
          });
        }
      }

      const successCount = results.filter(r => r.success).length;
      
      return new Response(
        JSON.stringify({
          success: true,
          message: `Batch complete: ${successCount}/${posts.length} generated`,
          generated: successCount,
          failed: posts.length - successCount,
          results
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // SINGLE SLUG MODE
    if (!slug || !/^[a-z0-9-]{3,200}$/.test(slug)) {
      return new Response(
        JSON.stringify({ error: "Invalid or missing slug parameter" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[SSG] Generating for slug: ${slug}`);

    // Fetch post
    const { data: post, error: fetchError } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .single();

    if (fetchError || !post) {
      return new Response(
        JSON.stringify({ error: "Post not found or not published" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate HTML
    const html = generateStaticHtml(post);
    const htmlBytes = new TextEncoder().encode(html);
    const storagePath = `blog/${slug}/index.html`;

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, htmlBytes, {
        contentType: "text/html; charset=utf-8",
        upsert: true,
        cacheControl: "public, max-age=300, stale-while-revalidate=600"
      });

    if (uploadError) {
      throw new Error(`Storage upload failed: ${uploadError.message}`);
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(storagePath);

    const generationTime = Date.now() - startTime;

    // Log audit
    await supabase.from("blog_ssg_audits").insert({
      slug,
      action: "generate",
      success: true,
      html_size_bytes: htmlBytes.length,
      generation_time_ms: generationTime,
      triggered_by: "manual"
    });

    console.log(`[SSG] ✓ Generated ${slug} in ${generationTime}ms (${htmlBytes.length} bytes)`);

    return new Response(
      JSON.stringify({
        success: true,
        slug,
        storage_path: storagePath,
        public_url: publicUrlData.publicUrl,
        html_size_bytes: htmlBytes.length,
        generation_time_ms: generationTime
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("[SSG] Fatal error:", error);
    
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
