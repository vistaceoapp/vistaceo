import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ChevronRight } from 'lucide-react';
import { HeaderV3 } from '@/components/landing/HeaderV3';
import { Footer } from '@/components/landing/Footer';
import { BlogPostCard } from '@/components/blog/BlogPostCard';
import { BlogFilters } from '@/components/blog/BlogFilters';
import { useBlogPosts, useBlogStats } from '@/hooks/use-blog';
import { BLOG_CLUSTERS, type BlogClusterKey } from '@/lib/blog/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function BlogPage() {
  const [search, setSearch] = useState('');
  const [pillar, setPillar] = useState('all');
  const [activeCluster, setActiveCluster] = useState<string | null>(null);

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
    setActiveCluster(null);
  };

  // Separate featured post (first) from rest
  const featuredPost = posts?.[0];
  const remainingPosts = posts?.slice(1) || [];

  // Filter by cluster if selected
  const filteredPosts = activeCluster 
    ? remainingPosts.filter(p => p.category === activeCluster)
    : remainingPosts;

  // Get unique clusters from posts for chip nav
  const postClusters = useMemo(() => {
    if (!posts) return [];
    const counts = new Map<string, number>();
    posts.forEach(p => {
      if (p.category) counts.set(p.category, (counts.get(p.category) || 0) + 1);
    });
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([key, count]) => ({ key, count, info: BLOG_CLUSTERS[key as BlogClusterKey] }))
      .filter(c => c.info);
  }, [posts]);

  return (
    <>
      <Helmet>
        <title>Blog | VISTACEO — Recursos para gestionar mejor tu negocio</title>
        <meta name="description" content="Artículos, guías y recursos prácticos para dueños de negocios en LATAM. Liderazgo, IA aplicada, emprendimiento y más." />
        <link rel="canonical" href="https://www.vistaceo.com/blog" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Blog | VISTACEO" />
        <meta property="og:url" content="https://www.vistaceo.com/blog" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <HeaderV3 variant="blog" />
        
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-7xl">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
              <Link to="/" className="hover:text-foreground transition-colors">Inicio</Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-foreground font-medium">Blog</span>
            </nav>

            {/* Hero — Editorial style */}
            <motion.div 
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-12"
            >
              <div className="max-w-3xl">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight mb-4">
                  Recursos para dirigir{' '}
                  <span className="text-primary">con más claridad</span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
                  Ideas, estrategias y herramientas pensadas para quienes lideran negocios 
                  y necesitan tomar mejores decisiones cada día.
                </p>
                {stats && (
                  <p className="text-sm text-muted-foreground mt-3">
                    {stats.total} artículos publicados
                  </p>
                )}
              </div>
            </motion.div>

            {/* Category chips — horizontal scroll */}
            {postClusters.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mb-8 -mx-4 px-4 overflow-x-auto scrollbar-none"
              >
                <div className="flex gap-2 pb-2 min-w-max">
                  <button
                    onClick={() => setActiveCluster(null)}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-medium transition-all border",
                      !activeCluster 
                        ? "bg-primary text-primary-foreground border-primary shadow-sm" 
                        : "bg-card text-muted-foreground border-border hover:border-primary/30 hover:text-foreground"
                    )}
                  >
                    Todos
                  </button>
                  {postClusters.map(({ key, count, info }) => (
                    <button
                      key={key}
                      onClick={() => setActiveCluster(activeCluster === key ? null : key)}
                      className={cn(
                        "px-4 py-2 rounded-full text-sm font-medium transition-all border whitespace-nowrap",
                        activeCluster === key 
                          ? "bg-primary text-primary-foreground border-primary shadow-sm" 
                          : "bg-card text-muted-foreground border-border hover:border-primary/30 hover:text-foreground"
                      )}
                    >
                      {info?.emoji} {info?.label}
                      <span className="ml-1.5 text-xs opacity-60">{count}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Search & filters */}
            <div className="mb-8">
              <BlogFilters
                search={search}
                onSearchChange={setSearch}
                pillar={pillar}
                onPillarChange={setPillar}
                onReset={handleReset}
              />
            </div>

            {/* Content */}
            {isLoading ? (
              <div className="space-y-8">
                <Skeleton className="h-64 w-full rounded-2xl" />
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="space-y-3">
                      <Skeleton className="aspect-[16/10] w-full rounded-2xl" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  ))}
                </div>
              </div>
            ) : posts && posts.length > 0 ? (
              <div className="space-y-10">
                {/* Featured post — only when no cluster filter */}
                {featuredPost && !activeCluster && !search && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <BlogPostCard post={featuredPost} variant="featured" />
                  </motion.div>
                )}

                {/* Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {(activeCluster || search ? (posts || []).filter(p => !activeCluster || p.category === activeCluster) : filteredPosts).map((post, i) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(0.3 + i * 0.05, 0.8) }}
                    >
                      <BlogPostCard post={post} />
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-lg text-muted-foreground mb-2">No se encontraron artículos</p>
                <p className="text-sm text-muted-foreground">Probá con otros filtros o términos de búsqueda.</p>
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
