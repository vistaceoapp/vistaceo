import Link from "next/link";
import Image from "next/image";
import { BlogPost } from "@/lib/types";
import { formatDate, getClusterInfo, getOgImage } from "@/lib/posts";
import { Clock, Calendar } from "lucide-react";

interface PostCardProps {
  post: BlogPost;
  featured?: boolean;
}

export default function PostCard({ post, featured = false }: PostCardProps) {
  const cluster = getClusterInfo(post.pillar);
  const imageUrl = getOgImage(post);

  if (featured) {
    return (
      <article className="group relative overflow-hidden rounded-2xl border border-border/50 bg-secondary/30 hover:border-primary/30 transition-all">
        <Link href={`/${post.slug}`} className="block">
          <div className="aspect-[21/9] relative">
            <Image
              src={imageUrl}
              alt={post.image_alt_text || post.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-6">
            {cluster && (
              <span className="inline-flex items-center gap-1 text-xs bg-primary/20 text-primary px-2 py-1 rounded-full mb-3">
                {cluster.emoji} {cluster.name}
              </span>
            )}
            <h2 className="text-2xl md:text-3xl font-bold mb-2 group-hover:text-primary transition-colors">
              {post.title}
            </h2>
            {post.excerpt && (
              <p className="text-muted-foreground line-clamp-2 mb-4">{post.excerpt}</p>
            )}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatDate(post.publish_at)}
              </span>
              {post.reading_time_min && (
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {post.reading_time_min} min
                </span>
              )}
            </div>
          </div>
        </Link>
      </article>
    );
  }

  return (
    <article className="group border border-border/50 rounded-xl overflow-hidden bg-secondary/20 hover:border-primary/30 transition-all">
      <Link href={`/${post.slug}`} className="block">
        <div className="aspect-video relative">
          <Image
            src={imageUrl}
            alt={post.image_alt_text || post.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
        </div>
        <div className="p-4">
          {cluster && (
            <span className="inline-flex items-center gap-1 text-xs text-primary mb-2">
              {cluster.emoji} {cluster.name}
            </span>
          )}
          <h3 className="font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {post.title}
          </h3>
          {post.excerpt && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{post.excerpt}</p>
          )}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>{formatDate(post.publish_at)}</span>
            {post.reading_time_min && <span>{post.reading_time_min} min</span>}
          </div>
        </div>
      </Link>
    </article>
  );
}
