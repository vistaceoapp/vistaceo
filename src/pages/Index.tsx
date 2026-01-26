import { Header } from "@/components/landing/Header";
import { HeroSection } from "@/components/landing/HeroSection";
import { SystemPreviewSection } from "@/components/landing/SystemPreviewSection";
import { SocialProofBar } from "@/components/landing/SocialProofBar";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { SolutionSection } from "@/components/landing/SolutionSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { FreeExperienceSection } from "@/components/landing/FreeExperienceSection";
import { ProExperienceSection } from "@/components/landing/ProExperienceSection";
import { ComparisonSection } from "@/components/landing/ComparisonSection";
import { ROICalculator } from "@/components/landing/ROICalculator";
import { PricingSection } from "@/components/landing/PricingSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { GuaranteeSection } from "@/components/landing/GuaranteeSection";
import { FinalCTASection } from "@/components/landing/FinalCTASection";
import { Footer } from "@/components/landing/Footer";
import { FloatingParticles } from "@/components/landing/FloatingParticles";

const Index = () => {
  return (
    <main className="min-h-screen bg-background relative">
      {/* Background particles */}
      <FloatingParticles />
      
      {/* Content */}
      <div className="relative z-10">
        <Header />
        <HeroSection />
        <SystemPreviewSection />
        <SocialProofBar />
        <ProblemSection />
        <SolutionSection />
        <HowItWorksSection />
        <FreeExperienceSection />
        <ProExperienceSection />
        <ComparisonSection />
        <ROICalculator />
        <PricingSection />
        <TestimonialsSection />
        <GuaranteeSection />
        <FinalCTASection />
        <Footer />
      </div>
    </main>
  );
};

export default Index;
