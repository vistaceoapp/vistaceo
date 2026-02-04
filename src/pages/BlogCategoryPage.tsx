import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import { HeaderV3 } from '@/components/landing/HeaderV3';
import { Footer } from '@/components/landing/Footer';
import { BlogPostCard } from '@/components/blog/BlogPostCard';
import { useBlogPostsByCluster } from '@/hooks/use-blog';
import { BLOG_CLUSTERS, type BlogClusterKey } from '@/lib/blog/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

export default function BlogCategoryPage() {
  const { cluster } = useParams<{ cluster: string }>();
  
  const clusterKey = cluster as BlogClusterKey;
  const clusterInfo = BLOG_CLUSTERS[clusterKey];
  
  const { data: posts, isLoading } = useBlogPostsByCluster(cluster || '');

  if (!clusterInfo) {
    return (
      <div className="min-h-screen bg-background">
        <HeaderV3 variant="blog" />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-7xl text-center py-16">
            <h1 className="text-2xl font-bold mb-4">Categoría no encontrada</h1>
            <p className="text-muted-foreground mb-6">
              La categoría que buscás no existe.
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

  return (
    <>
      <Helmet>
        <title>{clusterInfo.label} | Blog VistaCEO</title>
        <meta 
          name="description" 
          content={`Artículos y guías sobre ${clusterInfo.label.toLowerCase()} para PyMEs latinoamericanas. Recursos prácticos y estrategias probadas.`} 
        />
        <link rel="canonical" href={`https://www.vistaceo.com/blog/tema/${cluster}`} />
      </Helmet>

      <div className="min-h-screen bg-background">
        <HeaderV3 variant="blog" />
        
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-7xl">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
              <Link to="/" className="hover:text-foreground">Inicio</Link>
              <ChevronRight className="h-4 w-4" />
              <Link to="/blog" className="hover:text-foreground">Blog</Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-foreground">{clusterInfo.label}</span>
            </nav>

            {/* Back button */}
            <Link to="/blog">
              <Button variant="ghost" size="sm" className="mb-6 -ml-2">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Ver todos los artículos
              </Button>
            </Link>

            {/* Header */}
            <div className="mb-12 relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-[#2692DC]/5 via-[#746CE6]/5 to-transparent rounded-3xl blur-xl" />
              
              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-4xl">{clusterInfo.emoji}</span>
                  <div className="h-1 w-12 bg-gradient-to-r from-[#2692DC] to-[#746CE6] rounded-full" />
                </div>
                
                <h1 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-[#2692DC] via-[#5A7FE1] to-[#746CE6] bg-clip-text text-transparent">
                  {clusterInfo.label}
                </h1>
                
                <p className="text-lg md:text-xl text-muted-foreground max-w-3xl leading-relaxed">
                  Artículos, guías y recursos prácticos sobre {clusterInfo.label.toLowerCase()} para PyMEs y profesionales en Latinoamérica.
                </p>
                
                {posts && (
                  <div className="flex items-center gap-2 mt-5">
                    <div className="h-2 w-2 rounded-full bg-gradient-to-r from-[#2692DC] to-[#746CE6] animate-pulse" />
                    <p className="text-sm font-medium bg-gradient-to-r from-[#2692DC] to-[#746CE6] bg-clip-text text-transparent">
                      {posts.length} {posts.length === 1 ? 'artículo' : 'artículos'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Posts Grid */}
            {isLoading ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="aspect-video w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}
              </div>
            ) : posts && posts.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {posts.map((post) => (
                  <BlogPostCard key={post.id} post={post as any} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-muted/30 rounded-2xl border border-border">
                <span className="text-6xl mb-4 block">{clusterInfo.emoji}</span>
                <h2 className="text-xl font-semibold mb-2">Próximamente</h2>
                <p className="text-muted-foreground mb-6">
                  Estamos preparando contenido sobre {clusterInfo.label.toLowerCase()}.
                </p>
                <Link to="/blog">
                  <Button variant="outline">
                    Ver otros artículos
                  </Button>
                </Link>
              </div>
            )}

            {/* All categories section */}
            <section className="mt-20 pt-10 border-t border-border">
              <h2 className="text-2xl font-bold mb-8">🗂️ Explorar por Tema</h2>
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {Object.entries(BLOG_CLUSTERS).map(([key, info]) => (
                  <Link
                    key={key}
                    to={`/blog/tema/${key}`}
                    className={`p-4 rounded-xl border transition-all hover:shadow-md hover:border-primary/30 ${
                      key === cluster 
                        ? 'bg-primary/10 border-primary/50' 
                        : 'bg-muted/30 border-border/50 hover:bg-muted/50'
                    }`}
                  >
                    <span className="text-2xl mb-2 block">{info.emoji}</span>
                    <h3 className="font-medium text-sm">{info.label}</h3>
                  </Link>
                ))}
              </div>
            </section>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
