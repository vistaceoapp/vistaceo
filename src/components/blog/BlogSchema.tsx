import { Helmet } from 'react-helmet-async';
import type { BlogPost } from '@/lib/blog/types';

const CANONICAL_DOMAIN = "https://www.vistaceo.com";

interface BlogSchemaProps {
  post: BlogPost;
  url: string;
}

export function BlogSchema({ post, url }: BlogSchemaProps) {
  // Ensure URL uses canonical domain
  const canonicalUrl = url.startsWith(CANONICAL_DOMAIN) 
    ? url 
    : `${CANONICAL_DOMAIN}/blog/${post.slug}`;

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.meta_title || post.title,
    description: post.meta_description || post.excerpt,
    image: post.hero_image_url || `${CANONICAL_DOMAIN}/og-image.png`,
    datePublished: post.publish_at,
    dateModified: post.updated_at,
    author: {
      '@type': 'Person',
      name: post.author_name || 'VistaCEO',
      ...(post.author_url && { url: post.author_url }),
    },
    publisher: {
      '@type': 'Organization',
      name: 'VistaCEO',
      logo: {
        '@type': 'ImageObject',
        url: `${CANONICAL_DOMAIN}/favicon.png`,
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
        item: CANONICAL_DOMAIN,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: `${CANONICAL_DOMAIN}/blog`,
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
      {/* Basic meta */}
      <title>{post.meta_title || post.title} | VistaCEO Blog</title>
      <meta name="description" content={post.meta_description || post.excerpt || ''} />
      <link rel="canonical" href={post.canonical_url || canonicalUrl} />

      {/* Open Graph */}
      <meta property="og:type" content="article" />
      <meta property="og:site_name" content="VistaCEO" />
      <meta property="og:title" content={post.meta_title || post.title} />
      <meta property="og:description" content={post.meta_description || post.excerpt || ''} />
      <meta property="og:url" content={canonicalUrl} />
      {post.hero_image_url && <meta property="og:image" content={post.hero_image_url} />}
      <meta property="og:locale" content="es_LA" />
      <meta property="article:published_time" content={post.publish_at || ''} />
      <meta property="article:modified_time" content={post.updated_at} />
      <meta property="article:author" content={post.author_name || 'VistaCEO'} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@vistaceo" />
      <meta name="twitter:title" content={post.meta_title || post.title} />
      <meta name="twitter:description" content={post.meta_description || post.excerpt || ''} />
      {post.hero_image_url && <meta name="twitter:image" content={post.hero_image_url} />}

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
