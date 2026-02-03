import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getPostsByPillar, getAllPosts } from "@/lib/posts";
import { generateItemListSchema } from "@/lib/schema";
import { CLUSTERS } from "@/lib/types";
import PostCard from "@/components/PostCard";
import { ArrowLeft } from "lucide-react";

export const revalidate = 300;

interface PageProps {
  params: Promise<{ cluster: string }>;
}

// Map URL slug to pillar key
function getClusterBySlug(slug: string) {
  return Object.entries(CLUSTERS).find(([, cluster]) => cluster.slug === slug);
}

export async function generateStaticParams() {
  return Object.values(CLUSTERS).map((cluster) => ({
    cluster: cluster.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { cluster: clusterSlug } = await params;
  const clusterEntry = getClusterBySlug(clusterSlug);

  if (!clusterEntry) {
    return { title: "Categoría no encontrada" };
  }

  const [, cluster] = clusterEntry;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://blog.vistaceo.com";

  return {
    title: `${cluster.name} | VistaCEO Blog`,
    description: cluster.description,
    openGraph: {
      type: "website",
      locale: "es_LA",
      url: `${siteUrl}/tema/${cluster.slug}`,
      title: `${cluster.name} | VistaCEO Blog`,
      description: cluster.description,
      siteName: "VistaCEO Blog",
    },
    alternates: {
      canonical: `${siteUrl}/tema/${cluster.slug}`,
    },
  };
}

export default async function ClusterPage({ params }: PageProps) {
  const { cluster: clusterSlug } = await params;
  const clusterEntry = getClusterBySlug(clusterSlug);

  if (!clusterEntry) {
    notFound();
  }

  const [pillarKey, cluster] = clusterEntry;
  const posts = await getPostsByPillar(pillarKey);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateItemListSchema(posts, cluster.name)),
        }}
      />

      {/* Header */}
      <section className="py-12 border-b border-border/50">
        <div className="max-w-5xl mx-auto px-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al blog
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">{cluster.emoji}</span>
            <h1 className="text-3xl md:text-4xl font-bold">{cluster.name}</h1>
          </div>

          <p className="text-xl text-muted-foreground max-w-2xl">
            {cluster.description}
          </p>

          <p className="text-sm text-muted-foreground mt-4">
            {posts.length} artículos publicados
          </p>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="py-12">
        <div className="max-w-5xl mx-auto px-4">
          {posts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Todavía no hay artículos en esta categoría.
              </p>
              <Link
                href="/"
                className="text-primary hover:underline mt-2 inline-block"
              >
                Ver todos los artículos
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Other Clusters */}
      <section className="py-12 bg-secondary/20 border-t border-border/50">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-xl font-bold mb-6">Otras categorías</h2>
          <div className="flex flex-wrap gap-3">
            {Object.entries(CLUSTERS)
              .filter(([key]) => key !== pillarKey)
              .map(([, otherCluster]) => (
                <Link
                  key={otherCluster.slug}
                  href={`/tema/${otherCluster.slug}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border/50 bg-background hover:border-primary/50 transition-all text-sm"
                >
                  <span>{otherCluster.emoji}</span>
                  <span>{otherCluster.name}</span>
                </Link>
              ))}
          </div>
        </div>
      </section>
    </>
  );
}
