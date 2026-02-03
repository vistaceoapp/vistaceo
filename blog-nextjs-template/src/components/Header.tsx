import Link from "next/link";
import { CLUSTERS } from "@/lib/types";

const MAIN_SITE = process.env.NEXT_PUBLIC_MAIN_SITE_URL || "https://www.vistaceo.com";

export default function Header() {
  return (
    <header className="border-b border-border/50 bg-background/95 backdrop-blur sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <span className="text-white font-bold text-sm">V</span>
            </div>
            <span className="font-semibold text-lg group-hover:text-primary transition-colors">
              VistaCEO <span className="text-muted-foreground font-normal">Blog</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {Object.values(CLUSTERS).slice(0, 4).map((cluster) => (
              <Link
                key={cluster.slug}
                href={`/tema/${cluster.slug}`}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {cluster.emoji} {cluster.name}
              </Link>
            ))}
            <Link
              href={MAIN_SITE}
              className="text-sm bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Probar VistaCEO
            </Link>
          </nav>

          {/* Mobile menu button */}
          <Link
            href={MAIN_SITE}
            className="md:hidden text-sm bg-primary text-primary-foreground px-3 py-1.5 rounded-lg"
          >
            Probar
          </Link>
        </div>
      </div>
    </header>
  );
}
