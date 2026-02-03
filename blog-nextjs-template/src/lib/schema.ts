import { BlogPost } from "./types";
import { getMetaTitle, getMetaDescription, getOgImage, getClusterInfo } from "./posts";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://blog.vistaceo.com";
const MAIN_SITE_URL = process.env.NEXT_PUBLIC_MAIN_SITE_URL || "https://www.vistaceo.com";

export function generateBlogPostingSchema(post: BlogPost) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: getMetaTitle(post),
    description: getMetaDescription(post),
    image: getOgImage(post),
    datePublished: post.publish_at || post.created_at,
    dateModified: post.updated_at,
    author: {
      "@type": "Person",
      name: post.author_name || "Equipo VistaCEO",
    },
    publisher: {
      "@type": "Organization",
      name: "VistaCEO",
      logo: {
        "@type": "ImageObject",
        url: `${MAIN_SITE_URL}/favicon.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/${post.slug}`,
    },
    wordCount: post.content_md?.split(/\s+/).length || 0,
    articleSection: getClusterInfo(post.pillar)?.name || "Blog",
    keywords: [
      post.primary_keyword,
      ...(post.secondary_keywords || []),
      ...(post.tags || []),
    ]
      .filter(Boolean)
      .join(", "),
  };
}

export function generateBreadcrumbSchema(post: BlogPost) {
  const cluster = getClusterInfo(post.pillar);
  const items = [
    {
      "@type": "ListItem",
      position: 1,
      name: "Blog",
      item: SITE_URL,
    },
  ];

  if (cluster) {
    items.push({
      "@type": "ListItem",
      position: 2,
      name: cluster.name,
      item: `${SITE_URL}/tema/${cluster.slug}`,
    });
    items.push({
      "@type": "ListItem",
      position: 3,
      name: post.title,
      item: `${SITE_URL}/${post.slug}`,
    });
  } else {
    items.push({
      "@type": "ListItem",
      position: 2,
      name: post.title,
      item: `${SITE_URL}/${post.slug}`,
    });
  }

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items,
  };
}

export function generateWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "VistaCEO Blog",
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "VistaCEO",
    url: MAIN_SITE_URL,
    logo: `${MAIN_SITE_URL}/favicon.png`,
    sameAs: [
      "https://www.linkedin.com/company/vistaceo",
      "https://twitter.com/vistaceo",
    ],
    description:
      "VistaCEO es tu copiloto de IA para tomar decisiones de negocio más inteligentes en Latinoamérica.",
  };
}

export function generateItemListSchema(posts: BlogPost[], name: string) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    itemListElement: posts.slice(0, 10).map((post, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${SITE_URL}/${post.slug}`,
      name: post.title,
    })),
  };
}
