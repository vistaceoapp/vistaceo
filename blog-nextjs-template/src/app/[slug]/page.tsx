import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  getPostBySlug,
  getAllSlugs,
  getRelatedPosts,
  getMetaTitle,
  getMetaDescription,
  getOgImage,
  getClusterInfo,
  formatDate,
} from "@/lib/posts";
import {
  generateBlogPostingSchema,
  generateBreadcrumbSchema,
} from "@/lib/schema";
import MarkdownContent from "@/components/MarkdownContent";
import PostCard from "@/components/PostCard";
import { Clock, Calendar, User, ArrowLeft } from "lucide-react";

export const revalidate = 300;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return { title: "Artículo no encontrado" };
  }

  const title = getMetaTitle(post);
  const description = getMetaDescription(post);
  const ogImage = getOgImage(post);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://blog.vistaceo.com";

  return {
    title,
    description,
    keywords: [
      post.primary_keyword,
      ...(post.secondary_keywords || []),
      ...(post.tags || []),
    ].filter(Boolean),
    authors: [{ name: post.author_name || "Equipo VistaCEO" }],
    openGraph: {
      type: "article",
      locale: "es_LA",
      url: `${siteUrl}/${post.slug}`,
      title,
      description,
      siteName: "VistaCEO Blog",
      publishedTime: post.publish_at || undefined,
      modifiedTime: post.updated_at,
      authors: [post.author_name || "Equipo VistaCEO"],
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    alternates: {
      canonical: `${siteUrl}/${post.slug}`,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = await getRelatedPosts(post.slug, post.pillar, 3);
  const cluster = getClusterInfo(post.pillar);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateBlogPostingSchema(post)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateBreadcrumbSchema(post)),
        }}
      />

      <article className="py-8">
        <div className="max-w-3xl mx-auto px-4">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground transition-colors flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" />
              Blog
            </Link>
            {cluster && (
              <>
                <span>/</span>
                <Link
                  href={`/tema/${cluster.slug}`}
                  className="hover:text-foreground transition-colors"
                >
                  {cluster.name}
                </Link>
              </>
            )}
          </nav>

          {/* Header */}
          <header className="mb-8">
            {cluster && (
              <Link
                href={`/tema/${cluster.slug}`}
                className="inline-flex items-center gap-1 text-sm bg-primary/10 text-primary px-3 py-1 rounded-full mb-4 hover:bg-primary/20 transition-colors"
              >
                {cluster.emoji} {cluster.name}
              </Link>
            )}

            <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="text-xl text-muted-foreground mb-6">{post.excerpt}</p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground pb-6 border-b border-border/50">
              <span className="flex items-center gap-1">
                <User className="w-4 h-4" />
                {post.author_name || "Equipo VistaCEO"}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatDate(post.publish_at)}
              </span>
              {post.reading_time_min && (
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {post.reading_time_min} min de lectura
                </span>
              )}
            </div>
          </header>

          {/* Hero Image */}
          {post.hero_image_url && (
            <figure className="mb-8">
              <Image
                src={post.hero_image_url}
                alt={post.image_alt_text || post.title}
                width={1200}
                height={630}
                className="rounded-xl w-full h-auto"
                priority
              />
              {post.image_alt_text && (
                <figcaption className="text-center text-sm text-muted-foreground mt-2">
                  {post.image_alt_text}
                </figcaption>
              )}
            </figure>
          )}

          {/* Content */}
          <div className="prose-container">
            <MarkdownContent content={post.content_md} />
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-8 pt-8 border-t border-border/50">
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full bg-secondary text-sm text-muted-foreground"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Author Bio */}
          {post.author_bio && (
            <div className="mt-8 p-6 rounded-xl bg-secondary/30 border border-border/50">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">{post.author_name || "Equipo VistaCEO"}</p>
                  <p className="text-sm text-muted-foreground mt-1">{post.author_bio}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="max-w-5xl mx-auto px-4 mt-16">
            <h2 className="text-2xl font-bold mb-6">Artículos relacionados</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <PostCard key={relatedPost.id} post={relatedPost} />
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="max-w-3xl mx-auto px-4 mt-16">
          <div className="p-8 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 text-center">
            <h3 className="text-2xl font-bold mb-3">
              ¿Te gustó este artículo?
            </h3>
            <p className="text-muted-foreground mb-6">
              Probá VistaCEO gratis y empezá a tomar decisiones más inteligentes con IA.
            </p>
            <Link
              href={process.env.NEXT_PUBLIC_MAIN_SITE_URL || "https://www.vistaceo.com"}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              Probar VistaCEO gratis
            </Link>
          </div>
        </section>
      </article>
    </>
  );
}
