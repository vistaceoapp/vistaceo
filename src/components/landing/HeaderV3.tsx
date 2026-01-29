import { useState, useEffect, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { Menu, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Import optimized logo assets
import logoFullText from "@/assets/brand/logo-full-text.png";
import logoIcon from "@/assets/brand/logo-icon.png";

interface HeaderV3Props {
  variant?: "landing" | "blog" | "app";
  className?: string;
}

const navItems = [
  { label: "Características", href: "/#características" },
  { label: "Precios", href: "/#precios" },
  { label: "FAQ", href: "/#faq" },
  { label: "Blog", href: "/blog", isRoute: true },
];

export const HeaderV3 = memo(({ variant = "landing", className }: HeaderV3Props) => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (href: string, isRoute?: boolean) => {
    setMobileMenuOpen(false);
    if (isRoute) {
      navigate(href);
    } else if (href.startsWith("/#")) {
      // Navigate to landing page with anchor
      const hash = href.substring(1); // Remove leading /
      if (window.location.pathname === "/") {
        // Already on landing, just scroll
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      } else {
        // Navigate to landing then scroll
        navigate("/" + hash);
      }
    } else {
      // Smooth scroll to section on same page
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-background/90 backdrop-blur-xl border-b border-border/50 shadow-sm"
          : "bg-background/60 backdrop-blur-md",
        className
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-18">
          {/* Logo - Responsive: Icon on mobile, Full on desktop */}
          <Link 
            to="/"
            className="flex items-center shrink-0 group"
          >
            {/* Mobile: Icon only (always visible) */}
            <img
              src={logoIcon}
              alt="VistaCEO"
              width={36}
              height={36}
              className="h-9 w-9 object-contain md:hidden transition-transform duration-200 group-hover:scale-105"
              loading="eager"
              decoding="async"
            />
            {/* Desktop: Full logo with text */}
            <img
              src={logoFullText}
              alt="VistaCEO"
              width={140}
              height={36}
              className="h-8 w-auto object-contain hidden md:block transition-transform duration-200 group-hover:scale-[1.02]"
              loading="eager"
              decoding="async"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.href}
                onClick={() => handleNavClick(item.href, item.isRoute)}
                className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors relative group font-medium"
              >
                {item.label}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-primary rounded-full group-hover:w-2/3 transition-all duration-300" />
              </button>
            ))}
          </nav>

          {/* Right side: CTAs + Mobile menu */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Login - hidden on very small screens */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/auth")}
              className="hidden sm:flex text-sm"
            >
              Iniciar sesión
            </Button>

            {/* Primary CTA */}
            <Button
              size="sm"
              className="gradient-primary text-primary-foreground rounded-full px-4 sm:px-5 font-medium shadow-lg shadow-primary/20 text-sm"
              onClick={() => navigate("/auth")}
            >
              <span className="hidden xs:inline">Empezar</span> gratis
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-9 w-9"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden border-t border-border bg-background/95 backdrop-blur-xl"
          >
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-1">
              {navItems.map((item) => (
                <button
                  key={item.href}
                  onClick={() => handleNavClick(item.href, item.isRoute)}
                  className="py-3 px-3 text-left text-foreground hover:text-primary hover:bg-secondary/50 rounded-lg transition-all font-medium"
                >
                  {item.label}
                </button>
              ))}
              {/* Mobile-only login button */}
              <div className="pt-3 mt-2 border-t border-border">
                <Button
                  variant="outline"
                  className="w-full justify-center"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate("/auth");
                  }}
                >
                  Iniciar sesión
                </Button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
});

HeaderV3.displayName = "HeaderV3";
