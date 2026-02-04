import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ChevronRight } from 'lucide-react';
import { HeaderV3 } from '@/components/landing/HeaderV3';
import { Footer } from '@/components/landing/Footer';
import { BlogPostCard } from '@/components/blog/BlogPostCard';
import { BlogFilters } from '@/components/blog/BlogFilters';
import { useBlogPosts, useBlogStats, useBlogClusterStats } from '@/hooks/use-blog';
import { PILLARS, BLOG_CLUSTERS } from '@/lib/blog/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function BlogPage() {
  const [search, setSearch] = useState('');
  const [pillar, setPillar] = useState('all');

  const filters = useMemo(() => ({
    search: search || undefined,
    pillar: pillar !== 'all' ? pillar : undefined,
    limit: 50,
  }), [search, pillar]);

  const { data: posts, isLoading } = useBlogPosts(filters);
  const { data: stats } = useBlogStats();
  const { data: clusterStats } = useBlogClusterStats();

  const handleReset = () => {
    setSearch('');
    setPillar('all');
  };

  return (
    <>
      <Helmet>
        <title>Blog | VistaCEO - Recursos para gestionar mejor tu negocio</title>
        <meta name="description" content="Artículos, guías y recursos prácticos para dueños de negocios en LATAM. Liderazgo, IA aplicada, emprendimiento y más." />
        <link rel="canonical" href="https://www.vistaceo.com/blog" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Blog | VistaCEO - Recursos para gestionar mejor tu negocio" />
        <meta property="og:url" content="https://www.vistaceo.com/blog" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <HeaderV3 variant="blog" />
        
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-7xl">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
              <Link to="/" className="hover:text-foreground">Inicio</Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-foreground">Blog</span>
            </nav>

            {/* Header - Ultra Premium */}
            <div className="mb-12 relative">
              {/* Subtle gradient background */}
              <div className="absolute -inset-4 bg-gradient-to-r from-[#2692DC]/5 via-[#746CE6]/5 to-transparent rounded-3xl blur-xl" />
              
              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-1 w-12 bg-gradient-to-r from-[#2692DC] to-[#746CE6] rounded-full" />
                  <span className="text-sm font-medium text-[#746CE6]">Blog VistaCEO</span>
                </div>
                
                <h1 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-[#2692DC] via-[#5A7FE1] to-[#746CE6] bg-clip-text text-transparent">
                  Notas, noticias y tendencias
                </h1>
                
                <p className="text-lg md:text-xl text-muted-foreground max-w-3xl leading-relaxed">
                  Análisis · Guías prácticas · Casos reales · Herramientas · Lo último en IA y tecnología · Estrategia · Liderazgo · Finanzas · Operaciones · Marketing · Crecimiento
                </p>
                
                {stats && (
                  <div className="flex items-center gap-2 mt-5">
                    <div className="h-2 w-2 rounded-full bg-gradient-to-r from-[#2692DC] to-[#746CE6] animate-pulse" />
                    <p className="text-sm font-medium bg-gradient-to-r from-[#2692DC] to-[#746CE6] bg-clip-text text-transparent">
                      {stats.total} artículos disponibles
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Cluster Categories - 12 themes */}
            <section className="mb-12">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                🗂️ Explorar por Tema
              </h2>
              <p className="text-muted-foreground text-sm mb-6">
                12 categorías especializadas para PyMEs latinoamericanas
              </p>
              <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {Object.entries(BLOG_CLUSTERS).map(([key, info]) => {
                  const count = clusterStats?.byCluster?.[key] || 0;
                  return (
                    <Link
                      key={key}
                      to={`/blog/tema/${key}`}
                      className="group p-4 rounded-xl border border-border/50 bg-muted/30 hover:bg-muted/50 hover:border-primary/30 hover:shadow-md transition-all text-center"
                    >
                      <span className="text-2xl mb-2 block group-hover:scale-110 transition-transform">{info.emoji}</span>
                      <h3 className="font-medium text-xs leading-tight mb-1">{info.label}</h3>
                      <span className="text-xs text-muted-foreground">
                        {count} {count === 1 ? 'artículo' : 'artículos'}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </section>

            {/* Filters */}
            <div className="mb-8">
              <BlogFilters
                search={search}
                onSearchChange={setSearch}
                pillar={pillar}
                onPillarChange={setPillar}
                onReset={handleReset}
              />
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
                  <BlogPostCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-muted-foreground">
                  No se encontraron artículos con los filtros seleccionados.
                </p>
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
