import { createClient } from '@supabase/supabase-js';

const FALLBACK_SUPABASE_URL = 'https://nlewrgmcawzcdazhfiyy.supabase.co';
const FALLBACK_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5sZXdyZ21jYXd6Y2RhemhmaXl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1MDg0NjksImV4cCI6MjA4MjA4NDQ2OX0.fWTySDGOsNNvddTJSj39qVq5gAWwXOVXf-dBzfDDJl0';

const supabaseUrl = import.meta.env.SUPABASE_URL || process.env.SUPABASE_URL || FALLBACK_SUPABASE_URL;
const supabaseKey = import.meta.env.SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || FALLBACK_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  meta_title: string | null;
  meta_description: string | null;
  excerpt: string | null;
  content_md: string;
  hero_image_url: string | null;
  image_alt_text: string | null;
  pillar: string | null;
  category: string | null; // 12-cluster system
  tags: string[] | null;
  author_name: string | null;
  author_bio: string | null;
  reading_time_min: number | null;
  publish_at: string | null;
  updated_at: string;
  created_at: string;
  primary_keyword: string | null;
  secondary_keywords: string[] | null;
}

// Cache en memoria para el proceso de build: Astro llama estas funciones una
// vez por página generada. Sin caché, cada build dispara cientos de SELECT *
// (con content_md completo) sobre blog_posts. Con caché: una sola consulta.
const buildCache = new Map<string, Promise<unknown>>();

function memo<T>(key: string, fn: () => Promise<T>): Promise<T> {
  if (!buildCache.has(key)) buildCache.set(key, fn());
  return buildCache.get(key) as Promise<T>;
}

export async function getAllPublishedPosts(): Promise<BlogPost[]> {
  return memo('all-published', async () => {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('status', 'published')
      .order('publish_at', { ascending: false });

    if (error) {
      console.error('Error fetching posts:', error);
      return [] as BlogPost[];
    }

    return (data || []) as BlogPost[];
  });
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  // Derivado del listado cacheado: evita una consulta por página.
  const all = await getAllPublishedPosts();
  const hit = all.find((p) => p.slug === slug);
  if (hit) return hit;

  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle();

  if (error) {
    console.error('Error fetching post:', error);
    return null;
  }

  return (data as BlogPost) || null;
}

export async function getPostsByCluster(cluster: string): Promise<BlogPost[]> {
  // Use category field (12-cluster system)
  const all = await getAllPublishedPosts();
  return all.filter((p) => p.category === cluster);
}

export async function getRelatedPosts(currentSlug: string, category: string | null, limit = 3): Promise<BlogPost[]> {
  if (!category) return [];

  const all = await getAllPublishedPosts();
  return all
    .filter((p) => p.category === category && p.slug !== currentSlug)
    .slice(0, limit);
}

export async function getLatestPosts(limit = 20): Promise<BlogPost[]> {
  const all = await getAllPublishedPosts();
  return all.slice(0, limit);
}

// Blog redirects (301-equivalent for static hosting)
export interface BlogRedirect {
  from_slug: string;
  to_slug: string;
  reason: string | null;
}

export async function getAllRedirects(): Promise<BlogRedirect[]> {
  return memo('all-redirects', async () => {
    const { data, error } = await supabase
      .from('blog_redirects')
      .select('from_slug, to_slug, reason');

    if (error) {
      console.error('Error fetching redirects:', error);
      return [] as BlogRedirect[];
    }

    return (data || []) as BlogRedirect[];
  });
}

// Get cluster stats for displaying post counts
export async function getClusterStats(): Promise<Record<string, number>> {
  const all = await getAllPublishedPosts();
  const counts: Record<string, number> = {};
  all.forEach((post) => {
    if (post.category) {
      counts[post.category] = (counts[post.category] || 0) + 1;
    }
  });
  return counts;
}
