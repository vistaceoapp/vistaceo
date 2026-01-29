import { useState, useEffect, lazy, Suspense, memo } from "react";
import { HeaderV3 } from "@/components/landing/HeaderV3";
import { HeroSection } from "@/components/landing/sections/HeroSection";
import { LoadingScreen } from "@/components/landing/LoadingScreen";

// Lazy load below-the-fold sections
const HowItWorksSection = lazy(() => import("@/components/landing/sections/HowItWorksSection"));
const FeaturesSection = lazy(() => import("@/components/landing/sections/FeaturesSection"));
const TestimonialsSection = lazy(() => import("@/components/landing/sections/TestimonialsSection"));
const PricingSection = lazy(() => import("@/components/landing/sections/PricingSection"));
const FAQSection = lazy(() => import("@/components/landing/sections/FAQSection"));
const FinalCTASection = lazy(() => import("@/components/landing/sections/FinalCTASection"));

// Minimal skeleton
const SectionSkeleton = memo(() => (
  <div className="py-16 flex items-center justify-center">
    <div className="flex items-center gap-1">
      <div className="w-1.5 h-1.5 rounded-full bg-primary/50 animate-pulse" />
      <div className="w-1.5 h-1.5 rounded-full bg-primary/50 animate-pulse" style={{ animationDelay: '150ms' }} />
      <div className="w-1.5 h-1.5 rounded-full bg-primary/50 animate-pulse" style={{ animationDelay: '300ms' }} />
    </div>
  </div>
));
SectionSkeleton.displayName = "SectionSkeleton";

// Footer
const Footer = memo(() => (
  <footer className="py-12 border-t border-border bg-card/50">
    <div className="container mx-auto px-4">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <img 
            src="/favicon.png" 
            alt="" 
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Quick load - just ensure DOM is ready
    const timer = setTimeout(() => setIsLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-[500px] h-[500px] bg-primary/8 top-0 -left-48 rounded-full blur-[120px]" />
        <div className="absolute w-[400px] h-[400px] bg-accent/6 top-1/3 -right-32 rounded-full blur-[120px]" />
      </div>
      
      <HeaderV3 />

      <main className="relative z-10">
        <HeroSection />
        
        <Suspense fallback={<SectionSkeleton />}>
          <HowItWorksSection />
        </Suspense>
        
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

      <Footer />
    </div>
  );
};

export default LandingV3;
