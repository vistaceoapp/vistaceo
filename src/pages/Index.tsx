import { lazy, Suspense, useEffect, useState } from "react";
import { Header } from "@/components/landing/Header";
import { HeroSection } from "@/components/landing/sections/HeroSection";

// Below-the-fold sections: lazy-loaded to slash initial JS bundle
const SystemPreviewSection = lazy(() => import("@/components/landing/SystemPreviewSection").then(m => ({ default: m.SystemPreviewSection })));
const SocialProofBar = lazy(() => import("@/components/landing/SocialProofBar").then(m => ({ default: m.SocialProofBar })));
const ProblemSection = lazy(() => import("@/components/landing/ProblemSection").then(m => ({ default: m.ProblemSection })));
const SolutionSection = lazy(() => import("@/components/landing/SolutionSection").then(m => ({ default: m.SolutionSection })));
const HowItWorksSection = lazy(() => import("@/components/landing/HowItWorksSection").then(m => ({ default: m.HowItWorksSection })));
const CapabilitiesShowcase = lazy(() => import("@/components/landing/CapabilitiesShowcase").then(m => ({ default: m.CapabilitiesShowcase })));
const FreeExperienceSection = lazy(() => import("@/components/landing/FreeExperienceSection").then(m => ({ default: m.FreeExperienceSection })));
const ProExperienceSection = lazy(() => import("@/components/landing/ProExperienceSection").then(m => ({ default: m.ProExperienceSection })));
const ComparisonSection = lazy(() => import("@/components/landing/ComparisonSection").then(m => ({ default: m.ComparisonSection })));
const ROICalculator = lazy(() => import("@/components/landing/ROICalculator").then(m => ({ default: m.ROICalculator })));
const PricingSection = lazy(() => import("@/components/landing/PricingSection").then(m => ({ default: m.PricingSection })));
const TestimonialsSection = lazy(() => import("@/components/landing/TestimonialsSection").then(m => ({ default: m.TestimonialsSection })));
const FAQSection = lazy(() => import("@/components/landing/FAQSection").then(m => ({ default: m.FAQSection })));
const GuaranteeSection = lazy(() => import("@/components/landing/GuaranteeSection").then(m => ({ default: m.GuaranteeSection })));
const FinalCTASection = lazy(() => import("@/components/landing/FinalCTASection").then(m => ({ default: m.FinalCTASection })));
const Footer = lazy(() => import("@/components/landing/Footer").then(m => ({ default: m.Footer })));
const FloatingParticles = lazy(() => import("@/components/landing/FloatingParticles"));

const SectionFallback = () => <div className="min-h-[40vh]" aria-hidden />;

const Index = () => {
  // Defer non-critical decorative canvas until after first paint + idle
  const [showParticles, setShowParticles] = useState(false);
  useEffect(() => {
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (isMobile || reduceMotion) return; // skip particles on mobile / reduced motion
    const ric = (window as any).requestIdleCallback || ((cb: any) => setTimeout(cb, 1500));
    const id = ric(() => setShowParticles(true));
    return () => {
      const cic = (window as any).cancelIdleCallback || clearTimeout;
      cic(id);
    };
  }, []);

  return (
    <main className="min-h-screen bg-background relative">
      {showParticles && (
        <Suspense fallback={null}>
          <FloatingParticles />
        </Suspense>
      )}

      <div className="relative z-10">
        <Header />
        <HeroSection />
        <Suspense fallback={<SectionFallback />}>
          <SystemPreviewSection />
          <SocialProofBar />
          <ProblemSection />
          <SolutionSection />
          <CapabilitiesShowcase />
          <HowItWorksSection />
          <FreeExperienceSection />
          <ProExperienceSection />
          <ComparisonSection />
          <ROICalculator />
          <PricingSection />
          <TestimonialsSection />
          <FAQSection />
          <GuaranteeSection />
          <FinalCTASection />
          <Footer />
        </Suspense>
      </div>
    </main>
  );
};

export default Index;
