"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, ArrowRight } from "lucide-react";
import { CLUSTERS } from "@/lib/types";

const MAIN_SITE = process.env.NEXT_PUBLIC_MAIN_SITE_URL || "https://www.vistaceo.com";

const navItems = [
  { label: "Características", href: `${MAIN_SITE}/#características`, external: true },
  { label: "Precios", href: `${MAIN_SITE}/#precios`, external: true },
  { label: "Blog", href: "/", external: false },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[hsl(240,10%,3.9%,0.9)] backdrop-blur-xl border-b border-[hsl(240,3.7%,15.9%,0.5)] shadow-sm"
          : "bg-[hsl(240,10%,3.9%,0.6)] backdrop-blur-md"
      }`}
    >
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-[72px]">
          {/* Logo — identical to landing HeaderV3 */}
          <Link href="/" className="flex items-center shrink-0 group">
            <Image
              src="/icon-vistaceo.webp"
              alt="VISTACEO"
              width={36}
              height={36}
              className="h-9 w-9 object-contain lg:hidden"
              priority
            />
            <Image
              src="/logo-full-text.png"
              alt="VISTACEO"
              width={140}
              height={36}
              className="h-8 w-auto object-contain hidden lg:block"
              priority
            />
          </Link>

          {/* Desktop Navigation — same style as landing */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-2 text-sm text-[hsl(240,5%,64.9%)] hover:text-[hsl(0,0%,98%)] transition-colors font-medium"
              >
                {item.label}
              </Link>
            ))}
            {/* Category dropdown on desktop */}
            {Object.values(CLUSTERS).slice(0, 3).map((cluster) => (
              <Link
                key={cluster.slug}
                href={`/tema/${cluster.slug}`}
                className="px-3 py-2 text-sm text-[hsl(240,5%,64.9%)] hover:text-[hsl(0,0%,98%)] transition-colors font-medium"
              >
                {cluster.emoji} {cluster.name}
              </Link>
            ))}
          </nav>

          {/* Right side — identical CTA to landing */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href={`${MAIN_SITE}/auth?mode=login`}
              className="hidden sm:flex text-sm text-[hsl(240,5%,64.9%)] hover:text-[hsl(0,0%,98%)] transition-colors px-3 py-2 font-medium"
            >
              Iniciar sesión
            </Link>

            <Link
              href={`${MAIN_SITE}/auth?mode=signup`}
              className="gradient-primary inline-flex items-center gap-1 text-white rounded-full px-4 sm:px-5 py-2 font-medium shadow-lg shadow-[hsl(262,83%,58%,0.2)] text-sm hover:scale-[1.02] active:scale-[0.98] transition-transform"
            >
              <span className="hidden xs:inline">Empezar</span> gratis
              <ArrowRight className="w-4 h-4" />
            </Link>

            <button
              className="lg:hidden h-9 w-9 flex items-center justify-center text-[hsl(0,0%,98%)] rounded-lg hover:bg-[hsl(240,3.7%,15.9%,0.5)] transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[hsl(240,3.7%,15.9%)] bg-[hsl(240,10%,3.9%,0.95)] backdrop-blur-xl">
          <nav className="max-w-[1200px] mx-auto px-4 py-4 flex flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="py-3 px-3 text-[hsl(0,0%,98%)] hover:text-[hsl(262,83%,58%)] hover:bg-[hsl(240,3.7%,15.9%,0.5)] rounded-lg transition-all font-medium"
              >
                {item.label}
              </Link>
            ))}
            {/* All categories in mobile */}
            <div className="pt-2 mt-1 border-t border-[hsl(240,3.7%,15.9%)]">
              <p className="px-3 py-2 text-xs text-[hsl(240,5%,64.9%)] uppercase tracking-wider font-medium">Categorías</p>
              {Object.values(CLUSTERS).map((cluster) => (
                <Link
                  key={cluster.slug}
                  href={`/tema/${cluster.slug}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 px-3 text-sm text-[hsl(0,0%,98%)] hover:text-[hsl(262,83%,58%)] hover:bg-[hsl(240,3.7%,15.9%,0.5)] rounded-lg transition-all font-medium block"
                >
                  {cluster.emoji} {cluster.name}
                </Link>
              ))}
            </div>
            <div className="pt-3 mt-2 border-t border-[hsl(240,3.7%,15.9%)] flex flex-col gap-2">
              <Link
                href={`${MAIN_SITE}/auth?mode=login`}
                className="py-2.5 px-3 text-center text-[hsl(0,0%,98%)] border border-[hsl(240,3.7%,15.9%)] rounded-lg hover:bg-[hsl(240,3.7%,15.9%,0.5)] transition-all font-medium"
              >
                Iniciar sesión
              </Link>
              <Link
                href={`${MAIN_SITE}/auth?mode=signup`}
                className="py-2.5 px-3 text-center text-white gradient-primary rounded-lg font-medium"
              >
                Empezar gratis
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
