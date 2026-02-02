import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Mail, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export interface TocItem {
  id: string;
  title: string;
  level: number;
}

interface LegalPageLayoutProps {
  title: string;
  subtitle: string;
  lastUpdated: string;
  tocItems: TocItem[];
  quickSummary: string[];
  children: React.ReactNode;
  crossLinks?: { title: string; href: string; description: string }[];
}

export const LegalPageLayout = ({
  title,
  subtitle,
  lastUpdated,
  tocItems,
  quickSummary,
  children,
  crossLinks,
}: LegalPageLayoutProps) => {
  const [activeSection, setActiveSection] = useState<string>("");
  const [isTocOpen, setIsTocOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const sections = tocItems.map((item) => document.getElementById(item.id));
      const scrollPosition = window.scrollY + 120;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(tocItems[i].id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [tocItems]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const elementPosition = element.offsetTop - offset;
      window.scrollTo({ top: elementPosition, behavior: "smooth" });
      setIsTocOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Volver a VistaCEO</span>
            </Link>
            <a 
              href="mailto:info@vistaceo.com" 
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <Mail className="w-4 h-4" />
              <span className="hidden sm:inline">info@vistaceo.com</span>
            </a>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 lg:py-12">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Sidebar ToC - Desktop */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24">
              <nav className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                  Contenido
                </p>
                {tocItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={cn(
                      "block w-full text-left text-sm py-1.5 transition-colors",
                      item.level === 2 ? "pl-0" : "pl-4",
                      activeSection === item.id
                        ? "text-primary font-medium"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {item.title}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 max-w-3xl">
            {/* Hero */}
            <div className="mb-8">
              <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-3">
                {title}
              </h1>
              <p className="text-lg text-muted-foreground mb-4">{subtitle}</p>
              <p className="text-sm text-muted-foreground">
                Última actualización: {lastUpdated}
              </p>
            </div>

            {/* Mobile ToC */}
            <div className="lg:hidden mb-8">
              <Collapsible open={isTocOpen} onOpenChange={setIsTocOpen}>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between"
                  >
                    <span>Tabla de contenidos</span>
                    {isTocOpen ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2">
                  <nav className="bg-card border border-border rounded-lg p-4 space-y-2">
                    {tocItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => scrollToSection(item.id)}
                        className={cn(
                          "block w-full text-left text-sm py-1 transition-colors",
                          item.level === 2 ? "pl-0 font-medium" : "pl-4",
                          "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {item.title}
                      </button>
                    ))}
                  </nav>
                </CollapsibleContent>
              </Collapsible>
            </div>

            {/* Quick Summary */}
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 mb-10">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <span className="text-xl">📋</span>
                Resumen rápido
              </h2>
              <ul className="space-y-2">
                {quickSummary.map((item, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 text-sm text-muted-foreground"
                  >
                    <span className="text-primary mt-0.5">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Content */}
            <div className="prose prose-neutral dark:prose-invert max-w-none legal-content">
              {children}
            </div>

            {/* Cross Links */}
            {crossLinks && crossLinks.length > 0 && (
              <div className="mt-12 pt-8 border-t border-border">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Documentos relacionados
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  {crossLinks.map((link) => (
                    <Link
                      key={link.href}
                      to={link.href}
                      className="block p-4 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors group"
                    >
                      <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                        {link.title}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {link.description}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Contact Footer */}
            <div className="mt-12 pt-8 border-t border-border">
              <div className="bg-card border border-border rounded-xl p-6 text-center">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  ¿Tenés preguntas?
                </h3>
                <p className="text-muted-foreground mb-4">
                  Estamos para ayudarte con cualquier consulta sobre este documento.
                </p>
                <a
                  href="mailto:info@vistaceo.com"
                  className="inline-flex items-center gap-2 text-primary hover:underline"
                >
                  <Mail className="w-4 h-4" />
                  info@vistaceo.com
                </a>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

// Reusable components for legal content
export const LegalSection = ({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) => (
  <section id={id} className="mb-10 scroll-mt-28">
    <h2 className="text-xl font-semibold text-foreground mb-4 pb-2 border-b border-border">
      {title}
    </h2>
    {children}
  </section>
);

export const LegalSubsection = ({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) => (
  <div id={id} className="mb-6 scroll-mt-28">
    <h3 className="text-lg font-medium text-foreground mb-3">{title}</h3>
    {children}
  </div>
);

export const WhatThisMeans = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-accent/30 border-l-4 border-primary rounded-r-lg p-4 my-4">
    <p className="text-sm font-medium text-foreground mb-1 flex items-center gap-2">
      <span>💡</span> ¿Qué significa esto para vos?
    </p>
    <p className="text-sm text-muted-foreground">{children}</p>
  </div>
);

export const FAQSection = ({
  questions,
}: {
  questions: { q: string; a: string }[];
}) => (
  <section id="faq" className="mb-10 scroll-mt-28">
    <h2 className="text-xl font-semibold text-foreground mb-6 pb-2 border-b border-border">
      Preguntas frecuentes
    </h2>
    <div className="space-y-4">
      {questions.map((item, index) => (
        <details
          key={index}
          className="group bg-card border border-border rounded-lg"
        >
          <summary className="flex items-center justify-between cursor-pointer p-4 text-foreground font-medium hover:bg-accent/50 rounded-lg transition-colors">
            <span>{item.q}</span>
            <ChevronDown className="w-4 h-4 text-muted-foreground group-open:rotate-180 transition-transform" />
          </summary>
          <div className="px-4 pb-4 pt-0 text-sm text-muted-foreground">
            {item.a}
          </div>
        </details>
      ))}
    </div>
  </section>
);
