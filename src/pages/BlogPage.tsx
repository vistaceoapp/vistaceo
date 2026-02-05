import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ChevronRight, TrendingUp, Lightbulb, Target, Zap } from 'lucide-react';
import { HeaderV3 } from '@/components/landing/HeaderV3';
import { Footer } from '@/components/landing/Footer';
import { BlogPostCard } from '@/components/blog/BlogPostCard';
import { BlogFilters } from '@/components/blog/BlogFilters';
import { useBlogPosts, useBlogStats } from '@/hooks/use-blog';
import { PILLARS } from '@/lib/blog/types';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';

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

  // Value propositions for the hero
  const valueProps = [
    { icon: TrendingUp, text: "Estrategias probadas" },
    { icon: Lightbulb, text: "Ideas accionables" },
    { icon: Target, text: "Resultados medibles" },
    { icon: Zap, text: "Implementación rápida" },
  ];

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

            {/* Hero Section - Ultra Premium */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-16 relative"
            >
              {/* Background effects */}
              <div className="absolute -inset-8 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 rounded-3xl blur-2xl pointer-events-none" />
              
              <div className="relative grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                {/* Left: Content */}
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-xs font-medium text-primary">Blog VistaCEO</span>
                    {stats && (
                      <span className="text-xs text-muted-foreground">· {stats.total} artículos</span>
                    )}
                  </div>
                  
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                    Tu CEO Ultra <span className="text-primary">inteligente</span> para escalar tu negocio
                  </h1>
                  
                  <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
                    Contenido estratégico diseñado para dueños de PyMEs que quieren 
                    <span className="text-foreground font-medium"> tomar mejores decisiones</span>, 
                    optimizar operaciones y acelerar su crecimiento.
                  </p>

                  {/* Value props grid */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    {valueProps.map((prop, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + i * 0.1 }}
                        className="flex items-center gap-2 text-sm text-muted-foreground"
                      >
                        <div className="p-1.5 rounded-lg bg-primary/10">
                          <prop.icon className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <span>{prop.text}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Right: Featured visual card */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="relative hidden lg:block"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl blur-xl" />
                  <div className="relative bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-6 shadow-xl">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                          <Lightbulb className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">Insights semanales</p>
                          <p className="text-xs text-muted-foreground">Tendencias y análisis</p>
                        </div>
                      </div>
                      
                      <div className="h-px bg-border/50" />
                      
                      <div className="space-y-2">
                        {['IA aplicada a negocios', 'Estrategia y liderazgo', 'Finanzas y operaciones'].map((topic, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary/60" />
                            <span className="text-muted-foreground">{topic}</span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex items-center gap-2 pt-2">
                        <div className="flex -space-x-2">
                          {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-6 w-6 rounded-full bg-gradient-to-br from-primary/40 to-accent/40 border-2 border-card" />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">+2.5K lectores mensuales</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>

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
