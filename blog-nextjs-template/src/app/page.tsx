import { Metadata } from "next";
import { getAllPosts } from "@/lib/posts";
import { generateItemListSchema } from "@/lib/schema";
import { CLUSTERS } from "@/lib/types";
import PostCard from "@/components/PostCard";
import Link from "next/link";
import { ArrowRight, Sparkles, BookOpen, TrendingUp, Lightbulb, Target } from "lucide-react";

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
  const restPosts = posts.slice(7);
  const MAIN_SITE = process.env.NEXT_PUBLIC_MAIN_SITE_URL || "https://www.vistaceo.com";

  const VALUE_CARDS = [
    { icon: "📊", title: "Análisis práctico", detail: "Estrategias aplicables hoy en tu negocio" },
    { icon: "🤖", title: "IA para negocios", detail: "Cómo usar inteligencia artificial sin ser técnico" },
    { icon: "🌎", title: "Foco LATAM", detail: "Contexto real de emprendedores latinoamericanos" },
    { icon: "🎯", title: "Decisiones mejores", detail: "Frameworks y métodos para crecer con datos" },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateItemListSchema(posts, "Últimos artículos")),
        }}
      />

      {/* ═══════════════════════════════════════════════ */}
      {/* HERO — mirrors landing HeroSection aesthetic   */}
      {/* ═══════════════════════════════════════════════ */}
      <section className="relative min-h-[70vh] flex flex-col justify-center pt-24 pb-12 overflow-hidden">
        {/* Background gradients — same as landing */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 -left-1/4 w-[70%] h-[60%] rounded-full blur-[150px]" style={{ background: "hsl(262 83% 58% / 0.15)" }} />
          <div className="absolute bottom-0 -right-1/4 w-[60%] h-[50%] rounded-full blur-[150px]" style={{ background: "hsl(210 70% 50% / 0.10)" }} />
        </div>

        <div className="max-w-5xl mx-auto px-4 relative z-10 text-center">
          {/* Badge — same as landing */}
          <div className="mb-5">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-medium"
              style={{
                borderColor: "hsl(262 83% 58% / 0.4)",
                backgroundColor: "hsl(262 83% 58% / 0.1)",
              }}
            >
              <Sparkles className="w-3.5 h-3.5" style={{ color: "hsl(262 83% 58%)" }} />
              <span>
                <BookOpen className="w-3 h-3 inline mr-1" />
                {posts.length} artículos · Actualizado semanalmente
              </span>
            </span>
          </div>

          {/* Main headline — large, bold, gradient text like landing */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight tracking-tight mb-5">
            Inteligencia de negocios{" "}
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(135deg, hsl(262 83% 58%), hsl(210 70% 50%))" }}>
              para Latinoamérica
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl max-w-2xl mx-auto mb-8 leading-relaxed" style={{ color: "hsl(240 5% 64.9%)" }}>
            Guías prácticas de IA, liderazgo, empleo y estrategia para emprendedores y profesionales que quieren{" "}
            <span className="font-semibold" style={{ color: "hsl(0 0% 98%)" }}>tomar mejores decisiones</span>.
          </p>

          {/* CTA + secondary — same button as landing */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
            <Link
              href={`${MAIN_SITE}/auth?mode=signup`}
              className="gradient-primary inline-flex items-center gap-2 text-white rounded-full px-8 py-3.5 font-semibold shadow-xl text-base hover:scale-[1.02] active:scale-[0.98] transition-transform"
              style={{ boxShadow: "0 10px 30px -5px hsl(262 83% 58% / 0.3)" }}
            >
              Probar VISTACEO gratis
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="#articulos"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border font-medium text-sm transition-colors"
              style={{
                borderColor: "hsl(240 3.7% 15.9%)",
                color: "hsl(240 5% 64.9%)",
              }}
            >
              <BookOpen className="w-4 h-4" />
              Ver artículos
            </a>
          </div>

          {/* Value cards — like landing signal cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-2.5 max-w-3xl mx-auto">
            {VALUE_CARDS.map((card, i) => (
              <div
                key={i}
                className="relative p-3 rounded-xl border shadow-sm"
                style={{
                  borderColor: "hsl(240 3.7% 15.9% / 0.5)",
                  backgroundColor: "hsl(240 10% 3.9% / 0.6)",
                  backdropFilter: "blur(8px)",
                }}
              >
                <div className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full" style={{ backgroundColor: "hsl(262 83% 58%)" }} />
                <div className="pl-2.5">
                  <span className="text-lg mb-1 block">{card.icon}</span>
                  <p className="text-xs font-medium leading-snug mb-0.5" style={{ color: "hsl(0 0% 98%)" }}>{card.title}</p>
                  <p className="text-[10px] leading-tight" style={{ color: "hsl(240 5% 64.9%)" }}>{card.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* CATEGORIES — pill navigation                   */}
      {/* ═══════════════════════════════════════════════ */}
      <section className="py-6 border-y" style={{ borderColor: "hsl(240 3.7% 15.9% / 0.5)", backgroundColor: "hsl(240 3.7% 15.9% / 0.2)" }}>
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-2.5">
            {Object.values(CLUSTERS).map((cluster) => (
              <Link
                key={cluster.slug}
                href={`/tema/${cluster.slug}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all hover:border-[hsl(262,83%,58%,0.5)] hover:bg-[hsl(262,83%,58%,0.05)]"
                style={{
                  borderColor: "hsl(240 3.7% 15.9% / 0.5)",
                  backgroundColor: "hsl(240 10% 3.9%)",
                }}
              >
                <span>{cluster.emoji}</span>
                <span>{cluster.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* FEATURED POST                                  */}
      {/* ═══════════════════════════════════════════════ */}
      {featuredPost && (
        <section id="articulos" className="py-10 scroll-mt-20">
          <div className="max-w-5xl mx-auto px-4">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-1 h-6 rounded-full" style={{ backgroundColor: "hsl(262 83% 58%)" }} />
              <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: "hsl(262 83% 58%)" }}>
                Artículo destacado
              </h2>
            </div>
            <PostCard post={featuredPost} featured />
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════ */}
      {/* RECENT POSTS GRID                              */}
      {/* ═══════════════════════════════════════════════ */}
      <section className="py-10">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Últimos artículos</h2>
            <span className="text-sm" style={{ color: "hsl(240 5% 64.9%)" }}>
              {posts.length} publicados
            </span>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      </section>

      {/* More posts if available */}
      {restPosts.length > 0 && (
        <section className="py-10 border-t" style={{ borderColor: "hsl(240 3.7% 15.9% / 0.5)" }}>
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6">Más artículos</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {restPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════ */}
      {/* CTA — matching landing gradient                */}
      {/* ═══════════════════════════════════════════════ */}
      <section className="py-20 relative overflow-hidden border-t" style={{ borderColor: "hsl(240 3.7% 15.9% / 0.5)" }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(135deg, hsl(262 83% 58% / 0.08), hsl(210 70% 50% / 0.06), transparent)" }} />
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            ¿Listo para tomar mejores decisiones?
          </h2>
          <p className="mb-8 text-lg" style={{ color: "hsl(240 5% 64.9%)" }}>
            VISTACEO es tu copiloto de IA para analizar datos, detectar oportunidades y hacer crecer tu negocio.
          </p>
          <Link
            href={`${MAIN_SITE}/auth?mode=signup`}
            className="gradient-primary inline-flex items-center gap-2 text-white px-8 py-3.5 rounded-full font-semibold hover:scale-[1.02] active:scale-[0.98] transition-transform text-base"
            style={{ boxShadow: "0 10px 30px -5px hsl(262 83% 58% / 0.3)" }}
          >
            Probar VISTACEO gratis
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </>
  );
}
