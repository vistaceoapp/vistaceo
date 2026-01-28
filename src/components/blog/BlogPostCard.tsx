import { Link } from 'react-router-dom';
import { Calendar, Clock, Globe } from 'lucide-react';
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
      <Card className="group h-full overflow-hidden transition-all hover:shadow-lg hover:border-primary/50">
        {/* Hero Image */}
        <div className="relative aspect-video overflow-hidden bg-muted">
          {post.hero_image_url ? (
            <img
              src={post.hero_image_url}
              alt={post.title}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
              <span className="text-4xl">
                {pillar ? PILLARS[pillar]?.emoji : '📝'}
              </span>
            </div>
          )}
          
          {/* Country badge */}
          {country && COUNTRIES[country] && (
            <Badge 
              variant="secondary" 
              className="absolute top-3 right-3 gap-1"
            >
              <span>{COUNTRIES[country].flag}</span>
              <span className="text-xs">{country}</span>
            </Badge>
          )}
        </div>

        <CardContent className="p-4 space-y-3">
          {/* Pillar badge */}
          {pillar && PILLARS[pillar] && (
            <Badge variant="outline" className="gap-1">
              <span>{PILLARS[pillar].emoji}</span>
              <span>{PILLARS[pillar].label}</span>
            </Badge>
          )}

          {/* Title */}
          <h3 className="font-semibold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {post.title}
          </h3>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {post.excerpt}
            </p>
          )}

          {/* Meta */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
            {post.publish_at && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {format(new Date(post.publish_at), "d MMM yyyy", { locale: es })}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {post.reading_time_min} min
            </span>
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {post.tags.slice(0, 3).map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {post.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs">
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
