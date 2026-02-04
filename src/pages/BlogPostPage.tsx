import { Link, useParams } from 'react-router-dom';
import { ChevronRight, Calendar, Clock, User, ExternalLink, ArrowLeft } from 'lucide-react';
import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { BlogMarkdownRenderer } from '@/components/blog/BlogMarkdownRenderer';
import { BlogTableOfContents } from '@/components/blog/BlogTableOfContents';
import { BlogReadingToolbar } from '@/components/blog/BlogReadingToolbar';
import { BlogCTA } from '@/components/blog/BlogCTA';
import { BlogPostCard } from '@/components/blog/BlogPostCard';
import { BlogSchema } from '@/components/blog/BlogSchema';
import { useBlogPost, useRelatedPosts } from '@/hooks/use-blog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { BLOG_CLUSTERS, type BlogClusterKey } from '@/lib/blog/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: post, isLoading, error } = useBlogPost(slug || '');
  const { data: relatedPosts } = useRelatedPosts(slug || '', post?.category || null);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <Skeleton className="h-8 w-3/4 mb-4" />
            <Skeleton className="h-[400px] w-full mb-8 rounded-xl" />
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

  // Use category (12 clusters) for proper categorization
  const categoryKey = post.category as BlogClusterKey | null;
  const clusterInfo = categoryKey ? BLOG_CLUSTERS[categoryKey] : null;
  const url = `https://www.vistaceo.com/blog/${post.slug}`;
  
  // Parse external sources if available
  const externalSources = Array.isArray(post.external_sources) 
    ? post.external_sources as Array<{url: string; title: string; domain?: string}>
    : [];

  return (
    <>
      <BlogSchema post={post as any} url={url} />

      <div className="min-h-screen bg-background">
        <Header />
        
        {/* Smart reading toolbar */}
        <BlogReadingToolbar 
          content={post.content_md} 
          title={post.title} 
          slug={post.slug} 
        />
        
        <main className="pt-24 pb-16">
          <article className="container mx-auto px-4">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4 max-w-4xl mx-auto">
              <Link to="/" className="hover:text-foreground transition-colors">Inicio</Link>
              <ChevronRight className="h-4 w-4" />
              <Link to="/blog" className="hover:text-foreground transition-colors">Blog</Link>
              {clusterInfo && (
                <>
                  <ChevronRight className="h-4 w-4" />
                  <Link 
                    to={`/blog/tema/${categoryKey}`} 
                    className="hover:text-foreground transition-colors"
                  >
                    {clusterInfo.label}
                  </Link>
                </>
              )}
              <ChevronRight className="h-4 w-4" />
              <span className="text-foreground line-clamp-1">{post.title}</span>
            </nav>

            {/* Back to blog button */}
            <div className="max-w-4xl mx-auto mb-6">
              <Link to="/blog">
                <Button variant="ghost" size="sm" className="-ml-2 gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Volver al blog
                </Button>
              </Link>
            </div>

            {/* Main layout - TOC on LEFT for desktop (like the reference) */}
            <div className="grid lg:grid-cols-[260px_1fr] gap-8 xl:gap-12 max-w-7xl mx-auto">
              {/* Desktop TOC - LEFT sidebar, sticky */}
              <aside className="hidden lg:block">
                <div className="sticky top-24">
                  <div className="bg-muted/30 rounded-xl border border-border/50 p-5">
                    <BlogTableOfContents content={post.content_md} variant="sidebar" />
                  </div>
                </div>
              </aside>

              {/* Main content column */}
              <div className="min-w-0 max-w-3xl">
                {/* Article header */}
                <header className="mb-8">
                  {/* Category badge - 12 cluster system */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {clusterInfo && (
                      <Link to={`/blog/tema/${categoryKey}`}>
                        <Badge variant="default" className="gap-1.5 hover:opacity-80 transition-opacity cursor-pointer">
                          <span>{clusterInfo.emoji}</span>
                          <span>{clusterInfo.label}</span>
                        </Badge>
                      </Link>
                    )}
                  </div>

                  {/* Title - H1 */}
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-5 leading-tight tracking-tight">
                    {post.title}
                  </h1>

                  {/* Excerpt */}
                  {post.excerpt && (
                    <p className="text-lg md:text-xl text-muted-foreground mb-6 leading-relaxed">
                      {post.excerpt}
                    </p>
                  )}

                  {/* Meta info */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground pb-6 border-b border-border">
                    <span className="flex items-center gap-1.5">
                      <User className="h-4 w-4" />
                      {post.author_name}
                    </span>
                    {post.publish_at && (
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(post.publish_at), "d 'de' MMMM, yyyy", { locale: es })}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4" />
                      {post.reading_time_min} min de lectura
                    </span>
                  </div>
                </header>

                {/* Hero image */}
                {post.hero_image_url && !post.hero_image_url.startsWith('data:') && (
                  <figure className="mb-10 -mx-4 md:mx-0">
                    <img
                      src={post.hero_image_url}
                      alt={post.image_alt_text || post.title}
                      className="w-full aspect-video object-cover rounded-none md:rounded-2xl shadow-lg"
                      loading="eager"
                    />
                    {post.image_alt_text && (
                      <figcaption className="text-center text-sm text-muted-foreground mt-3 px-4">
                        {post.image_alt_text}
                      </figcaption>
                    )}
                  </figure>
                )}

                {/* Mobile TOC - collapsible card */}
                <div className="lg:hidden mb-8 p-5 bg-muted/30 rounded-xl border border-border/50">
                  <BlogTableOfContents content={post.content_md} variant="mobile" />
                </div>

                {/* Article content */}
                <BlogMarkdownRenderer 
                  content={post.content_md} 
                  className="mb-12"
                />

                {/* External sources */}
                {externalSources.length > 0 && (
                  <div className="mt-10 p-6 bg-muted/30 rounded-xl border border-border">
                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                      <ExternalLink className="h-5 w-5" />
                      Para profundizar
                    </h3>
                    <ul className="space-y-2">
                      {externalSources.map((source, idx) => (
                        <li key={idx}>
                          <a 
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline flex items-center gap-2"
                          >
                            {source.title}
                            {source.domain && (
                              <span className="text-xs text-muted-foreground">({source.domain})</span>
                            )}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="mt-10 pt-8 border-t border-border">
                    <h4 className="text-sm font-semibold mb-3 text-muted-foreground">Etiquetas</h4>
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-sm">
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
            </div>

            {/* Related posts */}
            {relatedPosts && relatedPosts.length > 0 && (
              <section className="mt-20 pt-10 border-t border-border max-w-7xl mx-auto">
                <h2 className="text-2xl font-bold mb-8">Artículos relacionados</h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
