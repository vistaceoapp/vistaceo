import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/xml; charset=utf-8",
  "Cache-Control": "public, max-age=3600, s-maxage=3600",
};

const CANONICAL_DOMAIN = "https://www.vistaceo.com";

// Static pages with priorities
const STATIC_PAGES = [
  { loc: "/", priority: "1.0", changefreq: "daily" },
  { loc: "/blog", priority: "0.9", changefreq: "daily" },
  { loc: "/auth", priority: "0.5", changefreq: "monthly" },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch published blog posts
    const { data: posts, error } = await supabase
      .from("blog_posts")
      .select("slug, updated_at, publish_at")
      .eq("status", "published")
      .order("publish_at", { ascending: false });

    if (error) {
      console.error("Error fetching posts:", error);
    }

    const today = new Date().toISOString().split("T")[0];

    // Build XML
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
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

    // Add blog posts
    if (posts && posts.length > 0) {
      for (const post of posts) {
        const lastmod = (post.updated_at || post.publish_at || today).split("T")[0];
        xml += `  <url>
    <loc>${CANONICAL_DOMAIN}/blog/${post.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`;
      }
    }

    xml += `</urlset>`;

    return new Response(xml, {
      headers: corsHeaders,
    });
  } catch (error) {
    console.error("Sitemap generation error:", error);
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${CANONICAL_DOMAIN}/</loc>
    <priority>1.0</priority>
  </url>
</urlset>`,
      { headers: corsHeaders }
    );
  }
});
