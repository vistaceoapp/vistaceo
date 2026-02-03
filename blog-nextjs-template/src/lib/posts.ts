import { supabase } from "./supabase";
import { BlogPost, CLUSTERS } from "./types";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://blog.vistaceo.com";
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.jpg`;

export async function getAllPosts(): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("status", "published")
    .order("publish_at", { ascending: false });

  if (error) {
    console.error("Error fetching posts:", error);
    return [];
  }

  return data || [];
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error) {
    console.error("Error fetching post:", error);
    return null;
  }

  return data;
}

export async function getPostsByPillar(pillar: string): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("status", "published")
    .eq("pillar", pillar)
    .order("publish_at", { ascending: false });

  if (error) {
    console.error("Error fetching posts by pillar:", error);
    return [];
  }

  return data || [];
}

export async function getRelatedPosts(
  currentSlug: string,
  pillar: string | null,
  limit = 3
): Promise<BlogPost[]> {
  if (!pillar) return [];

  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("status", "published")
    .eq("pillar", pillar)
    .neq("slug", currentSlug)
    .order("publish_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching related posts:", error);
    return [];
  }

  return data || [];
}

export async function getAllSlugs(): Promise<string[]> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("slug")
    .eq("status", "published");

  if (error) {
    console.error("Error fetching slugs:", error);
    return [];
  }

  return (data || []).map((p) => p.slug);
}

export function getMetaTitle(post: BlogPost): string {
  if (post.meta_title && post.meta_title.length > 0) {
    return post.meta_title.slice(0, 60);
  }
  return post.title.slice(0, 57) + (post.title.length > 57 ? "..." : "");
}

export function getMetaDescription(post: BlogPost): string {
  if (post.meta_description && post.meta_description.length > 0) {
    return post.meta_description.slice(0, 160);
  }
  if (post.excerpt) {
    return post.excerpt.slice(0, 157) + (post.excerpt.length > 157 ? "..." : "");
  }
  return `${post.title} - Guía completa por VistaCEO`;
}

export function getOgImage(post: BlogPost): string {
  if (post.hero_image_url && isValidPublicUrl(post.hero_image_url)) {
    return post.hero_image_url;
  }
  return DEFAULT_OG_IMAGE;
}

function isValidPublicUrl(url: string | null): boolean {
  if (!url) return false;
  if (url.startsWith("data:")) return false;
  return url.startsWith("http://") || url.startsWith("https://");
}

export function getClusterInfo(pillar: string | null) {
  if (!pillar) return null;
  return CLUSTERS[pillar] || null;
}

export function formatDate(dateString: string | null): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("es-LA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}
