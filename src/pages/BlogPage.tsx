import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ChevronRight } from 'lucide-react';
import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { BlogPostCard } from '@/components/blog/BlogPostCard';
import { BlogFilters } from '@/components/blog/BlogFilters';
import { useBlogPosts, useBlogStats } from '@/hooks/use-blog';
import { PILLARS } from '@/lib/blog/types';
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

  const handleReset = () => {
    setSearch('');
    setPillar('all');
  };

  return (
    <>
      <Helmet>
        <title>Blog | VistaCEO - Recursos para gestionar mejor tu negocio</title>
        <meta name="description" content="Artículos, guías y recursos prácticos para dueños de negocios en LATAM. Liderazgo, IA aplicada, emprendimiento y más." />
        <link rel="canonical" href="https://vistaceo.lovable.app/blog" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-7xl">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
              <Link to="/" className="hover:text-foreground">Inicio</Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-foreground">Blog</span>
            </nav>

            {/* Header */}
            <div className="mb-10">
              <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                Recursos para hacer crecer tu negocio
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
                Guías accionables, plantillas listas para usar y estrategias probadas por dueños de negocios en toda Latinoamérica.
              </p>
              {stats && (
                <p className="text-sm text-primary/80 mt-3 font-medium">
                  {stats.total} artículos disponibles
                </p>
              )}
            </div>

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
