import { Link } from 'react-router-dom';
import { Calendar, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PILLARS, COUNTRIES, type PillarKey, type CountryCode } from '@/lib/blog/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface BlogPostCardProps {
  post: {
    slug: string;
    title: string;
    excerpt: string | null;
    hero_image_url: string | null;
    publish_at: string | null;
    reading_time_min: number;
    pillar: string | null;
    country_code: string;
    tags?: string[];
  };
}

export function BlogPostCard({ post }: BlogPostCardProps) {
  const pillar = post.pillar as PillarKey | null;
  const country = post.country_code as CountryCode;
  
  return (
    <Link to={`/blog/${post.slug}`}>
      <Card className="group h-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-primary/50 hover:-translate-y-1">
        {/* Hero Image */}
        <div className="relative aspect-video overflow-hidden bg-muted">
          {post.hero_image_url ? (
            <img
              src={post.hero_image_url}
              alt={post.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 via-primary/10 to-background">
              <div className="text-center">
                <span className="text-5xl block mb-2">
                  {pillar ? PILLARS[pillar]?.emoji : '📝'}
                </span>
                <span className="text-xs text-muted-foreground">
                  {pillar ? PILLARS[pillar]?.label : 'Blog'}
                </span>
              </div>
            </div>
          )}
          
          {/* Country badge overlay */}
          {country && COUNTRIES[country] && (
            <Badge 
              variant="secondary" 
              className="absolute top-3 right-3 gap-1 bg-background/90 backdrop-blur-sm shadow-sm"
            >
              <span>{COUNTRIES[country].flag}</span>
              <span className="text-xs font-medium">{country}</span>
            </Badge>
          )}
        </div>

        <CardContent className="p-5 space-y-3">
          {/* Pillar badge */}
          {pillar && PILLARS[pillar] && (
            <Badge variant="outline" className="gap-1 text-xs">
              <span>{PILLARS[pillar].emoji}</span>
              <span>{PILLARS[pillar].label}</span>
            </Badge>
          )}

          {/* Title */}
          <h3 className="font-semibold text-lg leading-snug line-clamp-2 group-hover:text-primary transition-colors">
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
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {format(new Date(post.publish_at), "d MMM yyyy", { locale: es })}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {post.reading_time_min} min
            </span>
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-2">
              {post.tags.slice(0, 3).map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs px-2 py-0.5">
                  {tag}
                </Badge>
              ))}
              {post.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs px-2 py-0.5">
                  +{post.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
