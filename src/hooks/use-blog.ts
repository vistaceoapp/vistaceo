import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

// Types from DB schema
type DbBlogPost = Database['public']['Tables']['blog_posts']['Row'];
type DbBlogTopic = Database['public']['Tables']['blog_topics']['Row'];
type DbBlogPlan = Database['public']['Tables']['blog_plan']['Row'];
type DbBlogRun = Database['public']['Tables']['blog_runs']['Row'];

// Fetch published posts with optional filters
export function useBlogPosts(filters?: {
  pillar?: string;
  tag?: string;
  search?: string;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: ['blog-posts', filters],
    queryFn: async () => {
      let query = supabase
        .from('blog_posts')
        .select('*')
        .eq('status', 'published')
        .order('publish_at', { ascending: false });

      if (filters?.pillar) {
        query = query.eq('pillar', filters.pillar);
      }
      if (filters?.tag) {
        query = query.contains('tags', [filters.tag]);
      }
      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,excerpt.ilike.%${filters.search}%`);
      }
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }
      if (filters?.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as DbBlogPost[];
    },
  });
}

// Fetch single post by slug
export function useBlogPost(slug: string) {
  return useQuery({
    queryKey: ['blog-post', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .maybeSingle();

      if (error) throw error;
      return data as DbBlogPost | null;
    },
    enabled: !!slug,
  });
}

// Fetch related posts (same pillar, different slug)
export function useRelatedPosts(currentSlug: string, pillar: string | null, limit = 3) {
  return useQuery({
    queryKey: ['related-posts', currentSlug, pillar],
    queryFn: async () => {
      if (!pillar) return [];
      
      const { data, error } = await supabase
        .from('blog_posts')
        .select('id, title, slug, excerpt, hero_image_url, publish_at, reading_time_min')
        .eq('status', 'published')
        .eq('pillar', pillar)
        .neq('slug', currentSlug)
        .order('publish_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    },
    enabled: !!pillar,
  });
}

// Fetch posts by category/cluster (12-cluster system)
export function useBlogPostsByCluster(cluster: string) {
  return useQuery({
    queryKey: ['blog-posts-cluster', cluster],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('id, title, slug, excerpt, hero_image_url, publish_at, reading_time_min, category, pillar, tags')
        .eq('status', 'published')
        .eq('category', cluster)
        .order('publish_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!cluster,
  });
}

// Fetch cluster stats (count by category)
export function useBlogClusterStats() {
  return useQuery({
    queryKey: ['blog-cluster-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('category')
        .eq('status', 'published');

      if (error) throw error;

      const byCluster: Record<string, number> = {};
      
      data.forEach(post => {
        if (post.category) {
          byCluster[post.category] = (byCluster[post.category] || 0) + 1;
        }
      });

      return { total: data.length, byCluster };
    },
  });
}

// Fetch all unique tags
export function useBlogTags() {
  return useQuery({
    queryKey: ['blog-tags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('tags')
        .eq('status', 'published');

      if (error) throw error;
      
      const allTags = data.flatMap(post => post.tags || []);
      const uniqueTags = [...new Set(allTags)].sort();
      return uniqueTags;
    },
  });
}

// Fetch posts count by pillar
export function useBlogStats() {
  return useQuery({
    queryKey: ['blog-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('pillar')
        .eq('status', 'published');

      if (error) throw error;

      const byPillar: Record<string, number> = {};
      
      data.forEach(post => {
        if (post.pillar) {
          byPillar[post.pillar] = (byPillar[post.pillar] || 0) + 1;
        }
      });

      return { total: data.length, byPillar };
    },
  });
}

// Admin: Fetch all posts (including drafts)
export function useAdminBlogPosts() {
  return useQuery({
    queryKey: ['admin-blog-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as DbBlogPost[];
    },
  });
}

// Admin: Fetch topics
export function useBlogTopics() {
  return useQuery({
    queryKey: ['blog-topics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_topics')
        .select('*')
        .order('priority_score', { ascending: false });

      if (error) throw error;
      return data as DbBlogTopic[];
    },
  });
}

// Admin: Fetch plan
export function useBlogPlan() {
  return useQuery({
    queryKey: ['blog-plan'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_plan')
        .select('*, topic:blog_topics(*)')
        .order('planned_date', { ascending: true });

      if (error) throw error;
      return data as (DbBlogPlan & { topic: DbBlogTopic | null })[];
    },
  });
}

// Admin: Fetch runs
export function useBlogRuns(limit = 50) {
  return useQuery({
    queryKey: ['blog-runs', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_runs')
        .select('*')
        .order('run_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as DbBlogRun[];
    },
  });
}

// Admin: Fetch config
export function useBlogConfig() {
  return useQuery({
    queryKey: ['blog-config'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_config')
        .select('*');

      if (error) throw error;
      
      const config: Record<string, unknown> = {};
      (data || []).forEach((row) => {
        config[row.key] = row.value;
      });
      return config;
    },
  });
}
