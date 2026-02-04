import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseKey = import.meta.env.SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

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

export async function getAllPublishedPosts(): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('status', 'published')
    .order('publish_at', { ascending: false });

  if (error) {
    console.error('Error fetching posts:', error);
    return [];
  }

  return data || [];
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (error) {
    console.error('Error fetching post:', error);
    return null;
  }

  return data;
}

export async function getPostsByCluster(cluster: string): Promise<BlogPost[]> {
  // Use category field (12-cluster system)
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('status', 'published')
    .eq('category', cluster)
    .order('publish_at', { ascending: false });

  if (error) {
    console.error('Error fetching posts by cluster:', error);
    return [];
  }

  return data || [];
}

export async function getRelatedPosts(currentSlug: string, category: string | null, limit = 3): Promise<BlogPost[]> {
  if (!category) return [];

  // Use category (12-cluster system) for related posts
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('status', 'published')
    .eq('category', category)
    .neq('slug', currentSlug)
    .order('publish_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching related posts:', error);
    return [];
  }

  return data || [];
}

export async function getLatestPosts(limit = 20): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('status', 'published')
    .order('publish_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching latest posts:', error);
    return [];
  }

  return data || [];
}

// Get cluster stats for displaying post counts
export async function getClusterStats(): Promise<Record<string, number>> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('category')
    .eq('status', 'published')
    .not('category', 'is', null);

  if (error) {
    console.error('Error fetching cluster stats:', error);
    return {};
  }

  const counts: Record<string, number> = {};
  (data || []).forEach(post => {
    if (post.category) {
      counts[post.category] = (counts[post.category] || 0) + 1;
    }
  });

  return counts;
}
