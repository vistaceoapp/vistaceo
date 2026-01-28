import { Helmet } from 'react-helmet-async';
import type { BlogPost } from '@/lib/blog/types';

interface BlogSchemaProps {
  post: BlogPost;
  url: string;
}

export function BlogSchema({ post, url }: BlogSchemaProps) {
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.meta_title || post.title,
    description: post.meta_description || post.excerpt,
    image: post.hero_image_url || 'https://vistaceo.lovable.app/og-image.png',
    datePublished: post.publish_at,
    dateModified: post.updated_at,
    author: {
      '@type': 'Person',
      name: post.author_name,
      ...(post.author_url && { url: post.author_url }),
    },
    publisher: {
      '@type': 'Organization',
      name: 'VistaCEO',
      logo: {
        '@type': 'ImageObject',
        url: 'https://vistaceo.lovable.app/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
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
        item: 'https://vistaceo.lovable.app/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: 'https://vistaceo.lovable.app/blog',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: url,
      },
    ],
  };

  return (
    <Helmet>
      {/* Basic meta */}
      <title>{post.meta_title || post.title} | VistaCEO Blog</title>
      <meta name="description" content={post.meta_description || post.excerpt || ''} />
      <link rel="canonical" href={post.canonical_url || url} />

      {/* Open Graph */}
      <meta property="og:type" content="article" />
      <meta property="og:title" content={post.meta_title || post.title} />
      <meta property="og:description" content={post.meta_description || post.excerpt || ''} />
      <meta property="og:url" content={url} />
      {post.hero_image_url && <meta property="og:image" content={post.hero_image_url} />}
      <meta property="article:published_time" content={post.publish_at || ''} />
      <meta property="article:modified_time" content={post.updated_at} />
      <meta property="article:author" content={post.author_name} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
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
