import { lazy, Suspense, memo } from "react";
import { HeaderV3 } from "@/components/landing/HeaderV3";
import { HeroSection } from "@/components/landing/sections/HeroSection";

// Lazy load all below-the-fold sections for better initial load
const FeaturesSection = lazy(() => import("@/components/landing/sections/FeaturesSection"));
const TestimonialsSection = lazy(() => import("@/components/landing/sections/TestimonialsSection"));
const PricingSection = lazy(() => import("@/components/landing/sections/PricingSection"));
const FAQSection = lazy(() => import("@/components/landing/sections/FAQSection"));
const FinalCTASection = lazy(() => import("@/components/landing/sections/FinalCTASection"));

// Minimal skeleton for lazy sections
const SectionSkeleton = memo(() => (
  <div className="py-20 flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
  </div>
));
SectionSkeleton.displayName = "SectionSkeleton";

// Footer - static, no animations (restored original)
const Footer = memo(() => (
  <footer className="py-12 border-t border-border bg-card/50 relative z-10">
    <div className="container mx-auto px-4">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <img 
            src="/favicon.png" 
            alt="VistaCEO" 
            width={24}
            height={24}
            loading="lazy"
            className="h-6 w-6 object-contain" 
          />
          <span className="text-sm text-muted-foreground">© 2025 VistaCEO. Todos los derechos reservados.</span>
        </div>
        
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <a href="#" className="hover:text-foreground transition-colors">Términos</a>
          <a href="#" className="hover:text-foreground transition-colors">Privacidad</a>
          <a href="#" className="hover:text-foreground transition-colors">Contacto</a>
        </div>
      </div>
    </div>
  </footer>
));
Footer.displayName = "Footer";

const LandingV3 = () => {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden relative">
      {/* Static gradient orbs - no JS animations */}
      <div className="absolute w-[600px] h-[600px] bg-primary/10 top-0 -left-64 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute w-[500px] h-[500px] bg-accent/10 top-1/3 -right-48 rounded-full blur-[150px] pointer-events-none" />
      
      {/* Header */}
      <HeaderV3 />

      {/* Main Content */}
      <main>
        {/* Hero - loaded immediately (above the fold) */}
        <HeroSection />
        
        {/* Below-the-fold sections - lazy loaded */}
        <Suspense fallback={<SectionSkeleton />}>
          <FeaturesSection />
        </Suspense>
        
        <Suspense fallback={<SectionSkeleton />}>
          <TestimonialsSection />
        </Suspense>
        
        <Suspense fallback={<SectionSkeleton />}>
          <PricingSection />
        </Suspense>
        
        <Suspense fallback={<SectionSkeleton />}>
          <FAQSection />
        </Suspense>
        
        <Suspense fallback={<SectionSkeleton />}>
          <FinalCTASection />
        </Suspense>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default LandingV3;
