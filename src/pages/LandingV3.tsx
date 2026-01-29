import { lazy, Suspense, memo } from "react";
import { HeaderV3 } from "@/components/landing/HeaderV3";
import { HeroSection } from "@/components/landing/sections/HeroSection";

// Lazy load ALL below-the-fold sections
const FeaturesSection = lazy(() => import("@/components/landing/sections/FeaturesSection"));
const TestimonialsSection = lazy(() => import("@/components/landing/sections/TestimonialsSection"));
const PricingSection = lazy(() => import("@/components/landing/sections/PricingSection"));
const FAQSection = lazy(() => import("@/components/landing/sections/FAQSection"));
const FinalCTASection = lazy(() => import("@/components/landing/sections/FinalCTASection"));

// Ultra-minimal skeleton
const SectionSkeleton = memo(() => (
  <div className="py-16 flex items-center justify-center">
    <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
  </div>
));
SectionSkeleton.displayName = "SectionSkeleton";

// Footer - ultra minimal
const Footer = memo(() => (
  <footer className="py-8 border-t border-border bg-card/50">
    <div className="container mx-auto px-4 text-center">
      <span className="text-sm text-muted-foreground">© 2025 VistaCEO</span>
    </div>
  </footer>
));
Footer.displayName = "Footer";

const LandingV3 = () => {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <HeaderV3 />

      <main>
        {/* Hero - immediate load */}
        <HeroSection />
        
        {/* All other sections - lazy */}
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
