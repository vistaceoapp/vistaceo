import { Metadata } from "next";
import { getAllPosts } from "@/lib/posts";
import { generateItemListSchema } from "@/lib/schema";
import { CLUSTERS } from "@/lib/types";
import PostCard from "@/components/PostCard";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "VISTACEO Blog | Inteligencia de Negocios para Latinoamérica",
  description:
    "Guías prácticas de IA, liderazgo, empleo y estrategia para emprendedores y profesionales de Latinoamérica.",
};

export default async function HomePage() {
  const posts = await getAllPosts();
  const featuredPost = posts[0];
  const recentPosts = posts.slice(1, 7);
  const MAIN_SITE = process.env.NEXT_PUBLIC_MAIN_SITE_URL || "https://www.vistaceo.com";

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateItemListSchema(posts, "Últimos artículos")),
        }}
      />

      {/* Hero — premium, aligned with landing */}
      <section className="relative pt-28 pb-16 overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/8 via-background to-background pointer-events-none" />
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full blur-[160px] opacity-20 pointer-events-none"
          style={{ background: "radial-gradient(circle, hsl(262 83% 58% / 0.4) 0%, transparent 70%)" }}
        />

        <div className="relative max-w-5xl mx-auto px-4 text-center">
          <p className="inline-flex items-center gap-2 text-xs font-medium text-primary bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-6">
            📚 {posts.length} artículos publicados
          </p>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-5 leading-tight tracking-tight">
            Inteligencia de negocios{" "}
            <span className="bg-gradient-to-r from-primary to-[hsl(210,70%,50%)] bg-clip-text text-transparent">
              para Latinoamérica
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
            Guías prácticas de IA, liderazgo, empleo y estrategia para emprendedores y profesionales que quieren tomar mejores decisiones.
          </p>

          <div className="flex flex-wrap justify-center gap-3 mb-4">
            <Link
              href={`${MAIN_SITE}/auth?mode=signup`}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[hsl(262,83%,58%)] to-[hsl(210,70%,50%)] text-white rounded-full px-6 py-3 font-semibold shadow-lg hover:opacity-90 transition-opacity text-sm"
            >
              Probar VISTACEO gratis
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Categories — pill navigation */}
      <section className="py-6 border-y border-border/50 bg-secondary/20">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-2.5">
            {Object.values(CLUSTERS).map((cluster) => (
              <Link
                key={cluster.slug}
                href={`/tema/${cluster.slug}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border/50 bg-background hover:border-primary/50 hover:bg-primary/5 transition-all text-sm font-medium"
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
        <section className="py-10">
          <div className="max-w-5xl mx-auto px-4">
            <PostCard post={featuredPost} featured />
          </div>
        </section>
      )}

      {/* Recent Posts */}
      <section className="py-10">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">Últimos artículos</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>

          {posts.length > 7 && (
            <div className="mt-8 text-center">
              <p className="text-muted-foreground text-sm">
                {posts.length} artículos publicados en total
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA — matching landing gradient */}
      <section className="py-20 relative overflow-hidden border-t border-border/50">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "linear-gradient(135deg, hsl(262 83% 58% / 0.08), hsl(210 70% 50% / 0.06), transparent)" }}
        />
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            ¿Listo para tomar mejores decisiones?
          </h2>
          <p className="text-muted-foreground mb-8 text-lg">
            VISTACEO es tu copiloto de IA para analizar datos, detectar oportunidades y hacer crecer tu negocio.
          </p>
          <Link
            href={`${MAIN_SITE}/auth?mode=signup`}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[hsl(262,83%,58%)] to-[hsl(210,70%,50%)] text-white px-8 py-3.5 rounded-full font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-primary/20 text-base"
          >
            Probar VISTACEO gratis
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </>
  );
}
