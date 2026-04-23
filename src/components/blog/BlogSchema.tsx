import { Helmet } from 'react-helmet-async';
import type { BlogPost } from '@/lib/blog/types';

const BLOG_DOMAIN = "https://blog.vistaceo.com";
const DEFAULT_OG_IMAGE = `${BLOG_DOMAIN}/og-blog-default.jpg`;

// Check if image is a valid public URL (not base64 or local)
function isValidPublicImageUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  // Reject base64 images
  if (url.startsWith('data:')) return false;
  // Reject local/relative paths
  if (!url.startsWith('http://') && !url.startsWith('https://')) return false;
  // Accept https URLs
  return true;
}

interface BlogSchemaProps {
  post: BlogPost;
  url: string;
}

export function BlogSchema({ post, url }: BlogSchemaProps) {
  // Ensure URL uses canonical domain
  const canonicalUrl = url.startsWith(BLOG_DOMAIN) 
    ? url 
    : `${BLOG_DOMAIN}/${post.slug}/`;

  // Use hero image only if it's a valid public URL, otherwise use default
  const ogImage = isValidPublicImageUrl(post.hero_image_url) 
    ? post.hero_image_url 
    : DEFAULT_OG_IMAGE;

  // Always use the full article title for sharing/SEO — never the truncated meta_title.
  // No "| VISTACEO" suffix — keep titles clean and intact.
  const shareTitle = post.title;

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: shareTitle,
    description: post.meta_description || post.excerpt,
    image: ogImage,
    datePublished: post.publish_at,
    dateModified: post.updated_at,
    author: {
      '@type': 'Person',
      name: post.author_name || 'VISTACEO',
      ...(post.author_url && { url: post.author_url }),
    },
    publisher: {
      '@type': 'Organization',
      name: 'VISTACEO',
      logo: {
        '@type': 'ImageObject',
        url: `https://www.vistaceo.com/favicon.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Inicio',
          item: 'https://www.vistaceo.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
          item: BLOG_DOMAIN,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: canonicalUrl,
      },
    ],
  };

  return (
    <Helmet>
      {/* Basic meta — full title, no suffix, no truncation */}
      <title>{shareTitle}</title>
      <meta name="description" content={post.meta_description || post.excerpt || ''} />
      <link rel="canonical" href={post.canonical_url || canonicalUrl} />

      {/* Open Graph - CRITICAL for LinkedIn/Social sharing */}
      <meta property="og:type" content="article" />
      <meta property="og:site_name" content="VISTACEO" />
      <meta property="og:title" content={shareTitle} />
      <meta property="og:description" content={post.meta_description || post.excerpt || ''} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content="es_LA" />
      <meta property="article:published_time" content={post.publish_at || ''} />
      <meta property="article:modified_time" content={post.updated_at} />
      <meta property="article:author" content={post.author_name || 'VISTACEO'} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@vistaceo" />
      <meta name="twitter:title" content={shareTitle} />
      <meta name="twitter:description" content={post.meta_description || post.excerpt || ''} />
      <meta name="twitter:image" content={ogImage} />

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(articleSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbSchema)}
      </script>
    </Helmet>
  );
}
