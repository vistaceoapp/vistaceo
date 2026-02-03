import { getAllPosts, getMetaTitle, getMetaDescription } from "@/lib/posts";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://blog.vistaceo.com";

export async function GET() {
  const posts = await getAllPosts();
  const latestPosts = posts.slice(0, 50);

  const rssItems = latestPosts
    .map((post) => {
      const title = getMetaTitle(post);
      const description = getMetaDescription(post);
      const pubDate = post.publish_at
        ? new Date(post.publish_at).toUTCString()
        : new Date(post.created_at).toUTCString();

      return `
    <item>
      <title><![CDATA[${title}]]></title>
      <link>${SITE_URL}/${post.slug}</link>
      <guid isPermaLink="true">${SITE_URL}/${post.slug}</guid>
      <description><![CDATA[${description}]]></description>
      <pubDate>${pubDate}</pubDate>
      <author>equipo@vistaceo.com (Equipo VistaCEO)</author>
      ${post.pillar ? `<category>${post.pillar}</category>` : ""}
    </item>`;
    })
    .join("");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>VistaCEO Blog</title>
    <link>${SITE_URL}</link>
    <description>Guías prácticas de IA, liderazgo, empleo y estrategia para emprendedores y profesionales de Latinoamérica.</description>
    <language>es-la</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>${SITE_URL}/favicon.png</url>
      <title>VistaCEO Blog</title>
      <link>${SITE_URL}</link>
    </image>
    ${rssItems}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
