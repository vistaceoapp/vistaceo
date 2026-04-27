import type { BlogPost } from './supabase';
import { getCluster } from './clusters';
import { truncate } from './text';

const SITE_URL = 'https://blog.vistaceo.com';
const MAIN_SITE_URL = 'https://www.vistaceo.com';
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.jpg`;
const BRAND = 'VISTACEO® Latinoamérica';
const PUBLISHER = 'VISTACEO';

// LATAM target areas — boostea relevancia regional para Search Console
const LATAM_AREAS = [
  'AR', 'MX', 'CO', 'CL', 'PE', 'UY', 'EC', 'VE', 'BO', 'PY',
  'CR', 'PA', 'DO', 'GT', 'HN', 'SV', 'NI', 'PR'
];

export function getMetaTitle(post: BlogPost): string {
  if (post.meta_title && post.meta_title.length > 0) {
    return truncate(post.meta_title, 60);
  }
  return truncate(post.title, 60);
}

export function getMetaDescription(post: BlogPost): string {
  if (post.meta_description && post.meta_description.length > 0) {
    return truncate(post.meta_description, 160);
  }
  if (post.excerpt) {
    return truncate(post.excerpt, 155);
  }
  return truncate(`${post.title} - Guía ejecutiva por VISTACEO`, 155);
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
  return `${SITE_URL}/${slug}/`;
}

export function generateBlogPostingSchema(post: BlogPost) {
  const cluster = getCluster(post.category || post.pillar);
  const wordCount = post.content_md?.split(/\s+/).length || 0;
  const readingMinutes = Math.max(1, Math.round(wordCount / 220));

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "alternativeHeadline": post.meta_title || post.title,
    "description": getMetaDescription(post),
    "image": [getOgImage(post)],
    "datePublished": post.publish_at || post.created_at,
    "dateModified": post.updated_at,
    "author": {
      "@type": "Organization",
      "name": post.author_name || PUBLISHER,
      "url": MAIN_SITE_URL
    },
    "publisher": {
      "@type": "Organization",
      "name": PUBLISHER,
      "logo": {
        "@type": "ImageObject",
        "url": `${MAIN_SITE_URL}/favicon.png`,
        "width": 512,
        "height": 512
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": getCanonicalUrl(post.slug)
    },
    "wordCount": wordCount,
    "timeRequired": `PT${readingMinutes}M`,
    "articleSection": cluster?.name || "Negocios",
    "inLanguage": "es-419",
    "isAccessibleForFree": true,
    "spatialCoverage": LATAM_AREAS.map(code => ({
      "@type": "Country",
      "identifier": code
    })),
    "keywords": [
      post.primary_keyword,
      ...(post.secondary_keywords || []),
      ...(post.tags || [])
    ].filter(Boolean).join(", ")
  };
}

export function generateBreadcrumbSchema(post: BlogPost) {
  const cluster = getCluster(post.category || post.pillar);
  const items: any[] = [
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
    "name": BRAND,
    "alternateName": "VISTACEO Blog",
    "url": SITE_URL,
    "inLanguage": "es-419",
    "publisher": { "@type": "Organization", "name": PUBLISHER, "url": MAIN_SITE_URL },
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
    "name": PUBLISHER,
    "alternateName": BRAND,
    "url": MAIN_SITE_URL,
    "logo": `${MAIN_SITE_URL}/favicon.png`,
    "sameAs": [
      "https://www.linkedin.com/company/vistaceo",
      "https://twitter.com/vistaceo",
      "https://instagram.com/vistaceo"
    ],
    "areaServed": LATAM_AREAS.map(code => ({ "@type": "Country", "identifier": code })),
    "description": "VISTACEO es inteligencia ejecutiva impulsada por IA para tomar mejores decisiones de negocio en Latinoamérica."
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

export function generateArticleSchema(post: BlogPost) {
  const cluster = getCluster(post.category || post.pillar);
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
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
      "@type": "Organization",
      "name": post.author_name || PUBLISHER,
      "url": MAIN_SITE_URL
    },
    "publisher": {
      "@type": "Organization",
      "name": PUBLISHER,
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
    "spatialCoverage": LATAM_AREAS.map(code => ({
      "@type": "Country",
      "identifier": code
    })),
    "speakable": {
      "@type": "SpeakableSpecification",
      "cssSelector": [".post-content h1", ".post-content h2", ".post-takeaways"]
    }
  };
}
