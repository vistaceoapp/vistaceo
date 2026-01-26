import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Zap, TrendingUp, Users } from "lucide-react";
import { VistaceoLogo } from "@/components/ui/VistaceoLogo";
import { useNavigate } from "react-router-dom";

export const FinalCTASection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-24 lg:py-32 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-secondary/30 via-background to-background" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] rounded-full blur-[300px] opacity-20"
        style={{ background: 'radial-gradient(circle, hsl(204, 79%, 50%, 0.2), hsl(254, 61%, 67%, 0.1), transparent 70%)' }}
      />
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          {/* Logo floating */}
          <motion.div
            animate={{ y: [-8, 8, -8] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="inline-block mb-8"
          >
            <VistaceoLogo size={80} variant="icon" />
          </motion.div>
          
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-semibold text-foreground mb-6 leading-tight">
            Las decisiones importantes{" "}
            <span className="text-gradient-primary">no se postergan</span>
          </h2>
          
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Mientras lo pensás, tu competencia ya está actuando. 
            VistaCEO te da la claridad para moverte primero.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Button 
              variant="hero" 
              size="xl" 
              className="w-full sm:w-auto group text-lg px-10"
              onClick={() => navigate("/auth")}
            >
              Empezar gratis ahora
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              variant="heroOutline" 
              size="xl" 
              className="w-full sm:w-auto group"
              onClick={() => navigate("/auth?plan=pro_monthly")}
            >
              Ir directo a Pro
              <Zap className="w-5 h-5 ml-2 group-hover:scale-110 transition-transform" />
            </Button>
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <span><strong className="text-foreground">500+</strong> negocios activos</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-success" />
              <span><strong className="text-foreground">+32%</strong> crecimiento promedio</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent" />
              <span><strong className="text-foreground">5 min</strong> para empezar</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
