import { Metadata } from "next";
import { getAllPosts } from "@/lib/posts";
import { generateItemListSchema } from "@/lib/schema";
import { CLUSTERS } from "@/lib/types";
import PostCard from "@/components/PostCard";
import Link from "next/link";

export const revalidate = 300; // Revalidate every 5 minutes

export const metadata: Metadata = {
  title: "VistaCEO Blog | Inteligencia de Negocios para Latinoamérica",
  description:
    "Guías prácticas de IA, liderazgo, empleo y estrategia para emprendedores y profesionales de Latinoamérica.",
};

export default async function HomePage() {
  const posts = await getAllPosts();
  const featuredPost = posts[0];
  const recentPosts = posts.slice(1, 7);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateItemListSchema(posts, "Últimos artículos")),
        }}
      />

      {/* Hero */}
      <section className="py-12 border-b border-border/50">
        <div className="max-w-5xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Inteligencia de Negocios para{" "}
            <span className="text-primary">Latinoamérica</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Guías prácticas de IA, liderazgo, empleo y estrategia para emprendedores y profesionales.
          </p>
        </div>
      </section>

      {/* Clusters */}
      <section className="py-8 bg-secondary/20">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex flex-wrap gap-3">
            {Object.values(CLUSTERS).map((cluster) => (
              <Link
                key={cluster.slug}
                href={`/tema/${cluster.slug}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border/50 bg-background hover:border-primary/50 hover:bg-primary/5 transition-all text-sm"
              >
                <span>{cluster.emoji}</span>
                <span>{cluster.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Post */}
      {featuredPost && (
        <section className="py-8">
          <div className="max-w-5xl mx-auto px-4">
            <PostCard post={featuredPost} featured />
          </div>
        </section>
      )}

      {/* Recent Posts */}
      <section className="py-8">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">Últimos artículos</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>

          {posts.length > 7 && (
            <div className="mt-8 text-center">
              <p className="text-muted-foreground">
                {posts.length} artículos publicados
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-br from-primary/10 to-primary/5 border-t border-border/50">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            ¿Listo para tomar mejores decisiones?
          </h2>
          <p className="text-muted-foreground mb-6">
            VistaCEO es tu copiloto de IA para analizar datos, detectar oportunidades y hacer crecer tu negocio.
          </p>
          <Link
            href={process.env.NEXT_PUBLIC_MAIN_SITE_URL || "https://www.vistaceo.com"}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
          >
            Probar VistaCEO gratis
          </Link>
        </div>
      </section>
    </>
  );
}
