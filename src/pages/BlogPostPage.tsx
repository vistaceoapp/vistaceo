import { Link, useParams } from 'react-router-dom';
import { ChevronRight, Calendar, Clock, User } from 'lucide-react';
import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { BlogMarkdownRenderer } from '@/components/blog/BlogMarkdownRenderer';
import { BlogTableOfContents } from '@/components/blog/BlogTableOfContents';
import { BlogCTA } from '@/components/blog/BlogCTA';
import { BlogPostCard } from '@/components/blog/BlogPostCard';
import { BlogSchema } from '@/components/blog/BlogSchema';
import { useBlogPost, useRelatedPosts } from '@/hooks/use-blog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { PILLARS, COUNTRIES, type PillarKey, type CountryCode } from '@/lib/blog/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: post, isLoading, error } = useBlogPost(slug || '');
  const { data: relatedPosts } = useRelatedPosts(slug || '', post?.pillar || null);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <Skeleton className="h-8 w-3/4 mb-4" />
            <Skeleton className="h-64 w-full mb-8" />
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-4xl text-center py-16">
            <h1 className="text-2xl font-bold mb-4">Artículo no encontrado</h1>
            <p className="text-muted-foreground mb-6">
              El artículo que buscas no existe o fue removido.
            </p>
            <Link to="/blog" className="text-primary hover:underline">
              Volver al blog
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const pillar = post.pillar as PillarKey | null;
  const country = post.country_code as CountryCode;
  const url = `https://vistaceo.lovable.app/blog/${post.slug}`;

  return (
    <>
      <BlogSchema post={post as any} url={url} />

      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="pt-24 pb-16">
          <article className="container mx-auto px-4 max-w-7xl">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
              <Link to="/" className="hover:text-foreground">Inicio</Link>
              <ChevronRight className="h-4 w-4" />
              <Link to="/blog" className="hover:text-foreground">Blog</Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-foreground line-clamp-1">{post.title}</span>
            </nav>

            <div className="grid lg:grid-cols-[1fr_300px] gap-8">
              {/* Main content */}
              <div className="min-w-0">
                {/* Header */}
                <header className="mb-8">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {pillar && PILLARS[pillar] && (
                      <Badge variant="default" className="gap-1">
                        <span>{PILLARS[pillar].emoji}</span>
                        <span>{PILLARS[pillar].label}</span>
                      </Badge>
                    )}
                    {country && COUNTRIES[country] && (
                      <Badge variant="outline" className="gap-1">
                        <span>{COUNTRIES[country].flag}</span>
                        <span>{COUNTRIES[country].name}</span>
                      </Badge>
                    )}
                  </div>

                  <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
                    {post.title}
                  </h1>

                  {post.excerpt && (
                    <p className="text-lg text-muted-foreground mb-4">
                      {post.excerpt}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {post.author_name}
                    </span>
                    {post.publish_at && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(post.publish_at), "d 'de' MMMM, yyyy", { locale: es })}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {post.reading_time_min} min de lectura
                    </span>
                  </div>
                </header>

                {/* Hero image */}
                {post.hero_image_url && (
                  <div className="mb-8 rounded-lg overflow-hidden">
                    <img
                      src={post.hero_image_url}
                      alt={post.image_alt_text || post.title}
                      className="w-full aspect-video object-cover"
                    />
                  </div>
                )}

                {/* Mobile TOC */}
                <div className="lg:hidden mb-8 p-4 bg-muted/50 rounded-lg">
                  <BlogTableOfContents content={post.content_md} />
                </div>

                {/* Content */}
                <BlogMarkdownRenderer content={post.content_md} />

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="mt-8 pt-8 border-t">
                    <h4 className="text-sm font-semibold mb-3">Etiquetas</h4>
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map(tag => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer CTA */}
                <div className="mt-12">
                  <BlogCTA variant="footer" />
                </div>
              </div>

              {/* Sidebar */}
              <aside className="hidden lg:block space-y-6">
                <div className="sticky top-24 space-y-6">
                  {/* TOC */}
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <BlogTableOfContents content={post.content_md} />
                  </div>

                  {/* Sidebar CTA */}
                  <BlogCTA variant="sidebar" />
                </div>
              </aside>
            </div>

            {/* Related posts */}
            {relatedPosts && relatedPosts.length > 0 && (
              <section className="mt-16 pt-8 border-t">
                <h2 className="text-2xl font-bold mb-6">Artículos relacionados</h2>
                <div className="grid gap-6 md:grid-cols-3">
                  {relatedPosts.map((related) => (
                    <BlogPostCard key={related.id} post={related as any} />
                  ))}
                </div>
              </section>
            )}
          </article>
        </main>

        <Footer />
      </div>
    </>
  );
}
