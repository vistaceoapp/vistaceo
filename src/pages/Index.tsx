import { Header } from "@/components/landing/Header";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { CTASection } from "@/components/landing/CTASection";
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
        <FeaturesSection />
        <HowItWorksSection />
        <TestimonialsSection />
        <PricingSection />
        <CTASection />
        <Footer />
      </div>
    </main>
  );
};

export default Index;
