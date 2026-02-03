import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/xml; charset=utf-8",
  "Cache-Control": "public, max-age=300, s-maxage=300, stale-while-revalidate=600",
};

const CANONICAL_DOMAIN = "https://www.vistaceo.com";

// Static pages with priorities and change frequencies
const STATIC_PAGES = [
  { loc: "/", priority: "1.0", changefreq: "daily" },
  { loc: "/blog", priority: "0.9", changefreq: "daily" },
  { loc: "/auth", priority: "0.3", changefreq: "monthly" },
  { loc: "/privacy", priority: "0.2", changefreq: "yearly" },
  { loc: "/terms", priority: "0.2", changefreq: "yearly" },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all published blog posts
    const { data: posts, error } = await supabase
      .from("blog_posts")
      .select("slug, updated_at, publish_at, pillar")
      .eq("status", "published")
      .order("publish_at", { ascending: false });

    if (error) {
      console.error("[Sitemap] Error fetching posts:", error);
    }

    const today = new Date().toISOString().split("T")[0];

    // Build XML sitemap
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
`;

    // Add static pages
    for (const page of STATIC_PAGES) {
      xml += `  <url>
    <loc>${CANONICAL_DOMAIN}${page.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
    }

    // Add blog posts with proper lastmod
    if (posts && posts.length > 0) {
      for (const post of posts) {
        if (!post.slug) continue;
        
        const lastmod = (post.updated_at || post.publish_at || today).split("T")[0];
        
        // Pillar posts get higher priority
        const isPillar = post.pillar === "hub" || post.pillar === "pillar";
        const priority = isPillar ? "0.8" : "0.7";
        
        xml += `  <url>
    <loc>${CANONICAL_DOMAIN}/blog/${post.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>
`;
      }
    }

    xml += `</urlset>`;

    console.log(`[Sitemap] Generated with ${STATIC_PAGES.length} static pages + ${posts?.length || 0} blog posts`);

    return new Response(xml, {
      headers: corsHeaders,
    });
  } catch (error) {
    console.error("[Sitemap] Fatal error:", error);
    
    // Fallback minimal sitemap
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${CANONICAL_DOMAIN}/</loc>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${CANONICAL_DOMAIN}/blog</loc>
    <priority>0.9</priority>
  </url>
</urlset>`,
      { headers: corsHeaders }
    );
  }
});
