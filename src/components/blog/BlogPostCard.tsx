import { Link } from 'react-router-dom';
import { Calendar, Clock, ArrowUpRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { BLOG_CLUSTERS, type BlogClusterKey } from '@/lib/blog/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface BlogPostCardProps {
  post: {
    slug: string;
    title: string;
    excerpt: string | null;
    hero_image_url: string | null;
    publish_at: string | null;
    reading_time_min: number;
    pillar?: string | null;
    category?: string | null;
    tags?: string[];
  };
  variant?: 'default' | 'featured' | 'compact';
}

// Visual variety: each category gets a unique gradient for fallback
const CATEGORY_GRADIENTS: Record<string, string> = {
  'empleo-habilidades': 'from-blue-600/20 via-blue-400/10 to-indigo-500/5',
  'ia-para-pymes': 'from-violet-600/20 via-purple-400/10 to-fuchsia-500/5',
  'servicios-profesionales-rentabilidad': 'from-emerald-600/20 via-green-400/10 to-teal-500/5',
  'marketing-crecimiento': 'from-orange-600/20 via-amber-400/10 to-yellow-500/5',
  'finanzas-cashflow': 'from-green-600/20 via-emerald-400/10 to-lime-500/5',
  'operaciones-procesos': 'from-slate-600/20 via-gray-400/10 to-zinc-500/5',
  'ventas-negociacion': 'from-rose-600/20 via-pink-400/10 to-red-500/5',
  'liderazgo-management': 'from-amber-600/20 via-yellow-400/10 to-orange-500/5',
  'estrategia-latam': 'from-cyan-600/20 via-sky-400/10 to-blue-500/5',
  'herramientas-productividad': 'from-indigo-600/20 via-blue-400/10 to-violet-500/5',
  'data-analytics': 'from-teal-600/20 via-cyan-400/10 to-emerald-500/5',
  'tendencias-ia-tech': 'from-fuchsia-600/20 via-purple-400/10 to-pink-500/5',
};

// Decorative patterns for cards without images
const CATEGORY_PATTERNS: Record<string, string> = {
  'empleo-habilidades': '◆',
  'ia-para-pymes': '⬡',
  'servicios-profesionales-rentabilidad': '◇',
  'marketing-crecimiento': '△',
  'finanzas-cashflow': '○',
  'operaciones-procesos': '□',
  'ventas-negociacion': '▽',
  'liderazgo-management': '◈',
  'estrategia-latam': '⬢',
  'herramientas-productividad': '⊞',
  'data-analytics': '◉',
  'tendencias-ia-tech': '✦',
};

export function BlogPostCard({ post, variant = 'default' }: BlogPostCardProps) {
  const categoryKey = post.category as BlogClusterKey | null;
  const clusterInfo = categoryKey ? BLOG_CLUSTERS[categoryKey] : null;
  const gradient = (categoryKey && CATEGORY_GRADIENTS[categoryKey]) || 'from-primary/15 via-primary/5 to-background';
  const pattern = (categoryKey && CATEGORY_PATTERNS[categoryKey]) || '◆';

  if (variant === 'featured') {
    return (
      <Link to={`/blog/${post.slug}`} className="block group">
        <div className="relative grid md:grid-cols-2 gap-0 overflow-hidden rounded-2xl border border-border bg-card shadow-sm hover:shadow-xl hover:border-primary/30 transition-all duration-500">
          {/* Image */}
          <div className="relative aspect-[16/10] md:aspect-auto overflow-hidden">
            {post.hero_image_url ? (
              <img
                src={post.hero_image_url}
                alt={post.title}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="eager"
              />
            ) : (
              <div className={cn("h-full w-full bg-gradient-to-br", gradient, "flex items-center justify-center")}>
                <span className="text-8xl opacity-10 select-none">{pattern}</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </div>

          {/* Content */}
          <div className="p-6 md:p-8 flex flex-col justify-center space-y-4">
            {clusterInfo && (
              <Badge variant="outline" className="w-fit gap-1.5 text-xs border-primary/20 text-primary">
                <span>{clusterInfo.emoji}</span>
                <span>{clusterInfo.label}</span>
              </Badge>
            )}
            <h2 className="text-xl md:text-2xl font-bold leading-snug group-hover:text-primary transition-colors duration-300">
              {post.title}
            </h2>
            {post.excerpt && (
              <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                {post.excerpt}
              </p>
            )}
            <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
              {post.publish_at && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {format(new Date(post.publish_at), "d MMM yyyy", { locale: es })}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {post.reading_time_min} min
              </span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === 'compact') {
    return (
      <Link to={`/blog/${post.slug}`} className="group">
        <div className="flex items-start gap-4 p-4 rounded-xl border border-transparent hover:border-border hover:bg-card/50 transition-all duration-300">
          {/* Small thumbnail */}
          <div className="shrink-0 w-20 h-20 rounded-lg overflow-hidden">
            {post.hero_image_url ? (
              <img src={post.hero_image_url} alt="" className="w-full h-full object-cover" loading="lazy" />
            ) : (
              <div className={cn("w-full h-full bg-gradient-to-br flex items-center justify-center", gradient)}>
                <span className="text-2xl opacity-20">{pattern}</span>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0 space-y-1">
            <h3 className="font-semibold text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
              {post.title}
            </h3>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {post.publish_at && (
                <span>{format(new Date(post.publish_at), "d MMM", { locale: es })}</span>
              )}
              <span>{post.reading_time_min} min</span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Default card
  return (
    <Link to={`/blog/${post.slug}`}>
      <div className="group h-full overflow-hidden rounded-2xl border border-border bg-card transition-all duration-500 hover:shadow-xl hover:border-primary/30 hover:-translate-y-1">
        {/* Hero Image with unique fallback per category */}
        <div className="relative aspect-[16/10] overflow-hidden">
          {post.hero_image_url ? (
            <img
              src={post.hero_image_url}
              alt={post.title}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className={cn("h-full w-full bg-gradient-to-br flex items-center justify-center relative", gradient)}>
              {/* Premium geometric pattern */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute inset-0 grid grid-cols-6 grid-rows-4 gap-3 p-4 opacity-[0.04]">
                  {Array.from({ length: 24 }).map((_, i) => (
                    <span key={i} className="text-xl text-foreground flex items-center justify-center select-none rotate-12">{pattern}</span>
                  ))}
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-card/60 to-transparent" />
              </div>
              <div className="relative z-10 text-center space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-background/80 backdrop-blur-sm shadow-lg flex items-center justify-center mx-auto border border-border/50">
                  <span className="text-3xl">{clusterInfo?.emoji || '📝'}</span>
                </div>
                <span className="text-xs font-medium text-muted-foreground/80">{clusterInfo?.label || 'Blog'}</span>
              </div>
            </div>
          )}
          
          {/* Hover arrow indicator */}
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-1 group-hover:translate-x-0">
            <div className="h-8 w-8 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
              <ArrowUpRight className="h-4 w-4 text-foreground" />
            </div>
          </div>
        </div>

        <div className="p-5 space-y-3">
          {/* Category badge */}
          {clusterInfo && (
            <Badge variant="outline" className="gap-1.5 text-xs font-medium">
              <span>{clusterInfo.emoji}</span>
              <span>{clusterInfo.label}</span>
            </Badge>
          )}

          {/* Title */}
          <h3 className="font-semibold text-lg leading-snug line-clamp-2 group-hover:text-primary transition-colors duration-300">
            {post.title}
          </h3>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {post.excerpt}
            </p>
          )}

          {/* Meta */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
            {post.publish_at && (
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {format(new Date(post.publish_at), "d MMM yyyy", { locale: es })}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {post.reading_time_min} min
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
