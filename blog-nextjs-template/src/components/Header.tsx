"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, ArrowRight } from "lucide-react";
import { CLUSTERS } from "@/lib/types";

const MAIN_SITE = process.env.NEXT_PUBLIC_MAIN_SITE_URL || "https://www.vistaceo.com";

const navItems = [
  ...Object.values(CLUSTERS).slice(0, 4).map((cluster) => ({
    label: `${cluster.emoji} ${cluster.name}`,
    href: `/tema/${cluster.slug}`,
  })),
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
          ? "bg-background/90 backdrop-blur-xl border-b border-border/50 shadow-sm"
          : "bg-background/60 backdrop-blur-md"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-18">
          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0 group gap-2">
            <Image
              src="/icon-vistaceo.webp"
              alt="VISTACEO"
              width={36}
              height={36}
              className="h-9 w-9 object-contain"
              priority
            />
            <Image
              src="/logo-full-text.png"
              alt="VISTACEO"
              width={140}
              height={36}
              className="h-8 w-auto object-contain hidden sm:block"
              priority
            />
            <span className="text-xs font-medium text-muted-foreground hidden sm:inline ml-1 border-l border-border/50 pl-2">
              Blog
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href={`${MAIN_SITE}/auth?mode=login`}
              className="hidden sm:flex text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-2 font-medium"
            >
              Iniciar sesión
            </Link>

            <Link
              href={`${MAIN_SITE}/auth?mode=signup`}
              className="inline-flex items-center gap-1 bg-gradient-to-r from-[hsl(262,83%,58%)] to-[hsl(210,70%,50%)] text-white rounded-full px-4 sm:px-5 py-2 font-medium shadow-lg text-sm hover:opacity-90 transition-opacity"
            >
              Empezar gratis
              <ArrowRight className="w-4 h-4" />
            </Link>

            <button
              className="lg:hidden h-9 w-9 flex items-center justify-center text-foreground rounded-lg hover:bg-secondary/50 transition-colors"
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
        <div className="lg:hidden border-t border-border bg-background/95 backdrop-blur-xl">
          <nav className="max-w-6xl mx-auto px-4 py-4 flex flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="py-3 px-3 text-foreground hover:text-primary hover:bg-secondary/50 rounded-lg transition-all font-medium"
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-3 mt-2 border-t border-border flex flex-col gap-2">
              <Link
                href={`${MAIN_SITE}/auth?mode=login`}
                className="py-2.5 px-3 text-center text-foreground border border-border rounded-lg hover:bg-secondary/50 transition-all font-medium"
              >
                Iniciar sesión
              </Link>
              <Link
                href={`${MAIN_SITE}/auth?mode=signup`}
                className="py-2.5 px-3 text-center text-white bg-gradient-to-r from-[hsl(262,83%,58%)] to-[hsl(210,70%,50%)] rounded-lg font-medium"
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
