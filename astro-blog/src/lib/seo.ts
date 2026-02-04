import type { BlogPost } from './supabase';
import { getCluster } from './clusters';
import { truncate } from './text';

const SITE_URL = 'https://blog.vistaceo.com';
const MAIN_SITE_URL = 'https://www.vistaceo.com';
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.jpg`;

export function getMetaTitle(post: BlogPost): string {
  if (post.meta_title && post.meta_title.length > 0) {
    return truncate(post.meta_title, 60);
  }
  const generated = `${post.title} | VistaCEO Blog`;
  return truncate(generated, 60);
}

export function getMetaDescription(post: BlogPost): string {
  if (post.meta_description && post.meta_description.length > 0) {
    return truncate(post.meta_description, 160);
  }
  if (post.excerpt) {
    return truncate(post.excerpt, 155);
  }
  return truncate(`${post.title} - Guía completa por VistaCEO`, 155);
}

export function getOgImage(post: BlogPost): string {
  if (post.hero_image_url && isValidPublicUrl(post.hero_image_url)) {
    return post.hero_image_url;
  }
  return DEFAULT_OG_IMAGE;
}

function isValidPublicUrl(url: string | null): boolean {
  if (!url) return false;
  if (url.startsWith('data:')) return false;
  return url.startsWith('http://') || url.startsWith('https://');
}

export function getCanonicalUrl(slug: string): string {
  return `${SITE_URL}/${slug}`;
}

export function generateBlogPostingSchema(post: BlogPost) {
  // Use category (12-cluster system) first, fallback to pillar
  const cluster = getCluster(post.category || post.pillar);
  
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": getMetaTitle(post),
    "description": getMetaDescription(post),
    "image": getOgImage(post),
    "datePublished": post.publish_at || post.created_at,
    "dateModified": post.updated_at,
    "author": {
      "@type": "Person",
      "name": post.author_name || "Equipo VistaCEO",
      "url": `${MAIN_SITE_URL}/equipo`
    },
    "publisher": {
      "@type": "Organization",
      "name": "VistaCEO",
      "logo": {
        "@type": "ImageObject",
        "url": `${MAIN_SITE_URL}/favicon.png`
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": getCanonicalUrl(post.slug)
    },
    "wordCount": post.content_md?.split(/\s+/).length || 0,
    "articleSection": cluster?.name || "Blog",
    "inLanguage": "es-419",
    "keywords": [
      post.primary_keyword,
      ...(post.secondary_keywords || []),
      ...(post.tags || [])
    ].filter(Boolean).join(", ")
  };
}

export function generateBreadcrumbSchema(post: BlogPost) {
  // Use category (12-cluster system) first, fallback to pillar
  const cluster = getCluster(post.category || post.pillar);
  const items = [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Blog",
      "item": SITE_URL
    }
  ];

  if (cluster) {
    items.push({
      "@type": "ListItem",
      "position": 2,
      "name": cluster.name,
      "item": `${SITE_URL}/tema/${cluster.slug}`
    });
    items.push({
      "@type": "ListItem",
      "position": 3,
      "name": post.title,
      "item": getCanonicalUrl(post.slug)
    });
  } else {
    items.push({
      "@type": "ListItem",
      "position": 2,
      "name": post.title,
      "item": getCanonicalUrl(post.slug)
    });
  }

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items
  };
}

export function generateWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "VistaCEO Blog",
    "url": SITE_URL,
    "inLanguage": "es-419",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${SITE_URL}/?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };
}

export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "VistaCEO",
    "url": MAIN_SITE_URL,
    "logo": `${MAIN_SITE_URL}/favicon.png`,
    "sameAs": [
      "https://www.linkedin.com/company/vistaceo",
      "https://twitter.com/vistaceo",
      "https://instagram.com/vistaceo"
    ],
    "description": "VistaCEO es tu copiloto de IA para tomar decisiones de negocio más inteligentes en Latinoamérica."
  };
}

export function generateCollectionPageSchema(clusterName: string, clusterUrl: string, posts: BlogPost[]) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": clusterName,
    "url": clusterUrl,
    "inLanguage": "es-419",
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": posts.slice(0, 10).map((post, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "url": getCanonicalUrl(post.slug),
        "name": post.title
      }))
    }
  };
}

// NEW: FAQ Schema for cluster pages
export function generateFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
}

// NEW: Article structured data for enhanced SEO
export function generateArticleSchema(post: BlogPost) {
  // Use category (12-cluster system) first, fallback to pillar
  const cluster = getCluster(post.category || post.pillar);
  
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": getMetaTitle(post),
    "description": getMetaDescription(post),
    "image": {
      "@type": "ImageObject",
      "url": getOgImage(post),
      "width": 1200,
      "height": 630
    },
    "datePublished": post.publish_at || post.created_at,
    "dateModified": post.updated_at,
    "author": {
      "@type": "Person",
      "name": post.author_name || "Equipo VistaCEO"
    },
    "publisher": {
      "@type": "Organization",
      "name": "VistaCEO",
      "logo": {
        "@type": "ImageObject",
        "url": `${MAIN_SITE_URL}/favicon.png`,
        "width": 512,
        "height": 512
      }
    },
    "mainEntityOfPage": getCanonicalUrl(post.slug),
    "articleBody": post.content_md?.substring(0, 500),
    "articleSection": cluster?.name || "Negocios",
    "inLanguage": "es-419",
    "isAccessibleForFree": true,
    "speakable": {
      "@type": "SpeakableSpecification",
      "cssSelector": [".post-content h1", ".post-content h2", ".post-takeaways"]
    }
  };
}