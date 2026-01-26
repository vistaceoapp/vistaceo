import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, TrendingUp, Brain, Target, Zap, CheckCircle2, Star, Clock, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useCountryDetection } from "@/hooks/use-country-detection";
import { MockupRadar } from "./mockups/MockupRadar";
import { MockupMissions } from "./mockups/MockupMissions";
import { TypewriterText } from "./TypewriterText";
import { LiveCounter } from "./LiveCounter";


// Rotating words for the headline
const ROTATING_TEXTS = [
  "CEO digital",
  "mentor 24/7",
  "radar inteligente",
  "estratega IA",
];

// Mockup data for the live dashboard preview
const MOCK_BUSINESS = {
  name: "Café Aurora",
  type: "Cafetería Premium",
  healthScore: 78,
  certaintyPct: 72,
  dimensions: [
    { name: "Crecimiento", score: 82, icon: "📈" },
    { name: "Reputación", score: 91, icon: "⭐" },
    { name: "Eficiencia", score: 74, icon: "⚡" },
    { name: "Finanzas", score: 68, icon: "💰" },
  ],
  todayAction: {
    title: "Optimizar horario de sábados",
    impact: "+$45,000/mes",
    time: "15 min",
  },
};

export const HeroSection = () => {
  const navigate = useNavigate();
  const { formatCurrencyShort, monthlyPrice, isDetecting } = useCountryDetection();

  const benefits = [
    { icon: Brain, text: "Analiza 24/7" },
    { icon: Target, text: "Acciones diarias" },
    { icon: TrendingUp, text: "Mejora continua" },
  ];

  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden pt-16 pb-8">
      {/* Background with premium animated gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
      
      {/* Animated gradient orbs */}
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full blur-[180px]" 
        style={{ background: 'radial-gradient(circle, hsl(var(--primary) / 0.25) 0%, transparent 70%)' }} 
      />
      <motion.div 
        animate={{ scale: [1, 1.3, 1], opacity: [0.08, 0.15, 0.08] }}
        transition={{ duration: 10, repeat: Infinity, delay: 2 }}
        className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full blur-[150px]" 
        style={{ background: 'radial-gradient(circle, hsl(var(--accent) / 0.2) 0%, transparent 70%)' }} 
      />

      <div className="container mx-auto px-4 sm:px-6 relative z-10 flex-1 flex flex-col">
        <div className="max-w-7xl mx-auto text-center flex-1 flex flex-col">
          
          {/* Live Counter - Compact premium */}
          <div className="flex justify-center mb-6">
            <LiveCounter targetNumber={500} label="activos" />
          </div>

          {/* Main headline with rotating text - More compact */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 leading-[1.1] tracking-tight"
          >
            Tu <TypewriterText texts={ROTATING_TEXTS} className="text-gradient-primary" />
            <br />
            que piensa por vos
          </motion.h1>

          {/* Subheadline - Ultra short */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base sm:text-lg text-muted-foreground mb-5 max-w-lg mx-auto"
          >
            Detecta oportunidades. Acciones claras. <span className="text-foreground font-medium">Resultados reales.</span>
          </motion.p>

          {/* CTA - Compact */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col items-center gap-2 mb-6"
          >
            <Button 
              variant="hero" 
              size="lg" 
              className="group text-sm sm:text-base px-6 sm:px-8 py-4 sm:py-5 h-auto shadow-xl"
              onClick={() => navigate("/auth")}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Empezar gratis
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="w-3 h-3 text-success" />
              <span>Sin tarjeta</span>
              <span className="text-border">•</span>
              <span>3 min</span>
              <span className="text-border">•</span>
              <span>{!isDetecting && `Pro ${formatCurrencyShort(monthlyPrice)}/mes`}</span>
            </div>
          </motion.div>

          {/* Premium App Preview - Simple & Clean */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="relative max-w-4xl mx-auto mt-4"
          >
            {/* Glow effect */}
            <motion.div 
              animate={{ opacity: [0.2, 0.4, 0.2] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute -inset-10 bg-gradient-to-r from-primary/20 via-accent/15 to-primary/20 rounded-3xl blur-3xl" 
            />
            
            {/* Single elegant preview card */}
            <div className="relative bg-card/90 backdrop-blur-sm border border-border rounded-2xl shadow-2xl overflow-hidden">
              {/* Browser-like header */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-secondary/40">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-destructive/60" />
                  <div className="w-3 h-3 rounded-full bg-warning/60" />
                  <div className="w-3 h-3 rounded-full bg-success/60" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="px-4 py-1 rounded-full bg-secondary/60 text-[10px] text-muted-foreground">
                    app.vistaceo.com
                  </div>
                </div>
              </div>
              
              {/* Dashboard preview - simplified */}
              <div className="p-6 bg-gradient-to-b from-secondary/20 to-transparent">
                <div className="grid grid-cols-3 gap-4 items-center">
                  {/* Left stat */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="text-center p-4 rounded-xl bg-card/60 border border-border"
                  >
                    <div className="text-3xl font-bold text-success mb-1">78</div>
                    <div className="text-xs text-muted-foreground">Salud</div>
                  </motion.div>

                  {/* Center - Main score with animation */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                    className="text-center"
                  >
                    <motion.div 
                      animate={{ scale: [1, 1.02, 1] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border-2 border-primary/30 flex flex-col items-center justify-center mb-2"
                    >
                      <Zap className="w-8 h-8 text-primary mb-1" />
                      <span className="text-xs text-primary font-medium">En vivo</span>
                    </motion.div>
                    <div className="text-sm font-semibold text-foreground">Analizando</div>
                  </motion.div>

                  {/* Right stat */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                    className="text-center p-4 rounded-xl bg-card/60 border border-border"
                  >
                    <div className="text-3xl font-bold text-accent mb-1">5</div>
                    <div className="text-xs text-muted-foreground">Oportunidades</div>
                  </motion.div>
                </div>

                {/* Action hint */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                  className="mt-4 p-3 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 text-center"
                >
                  <div className="flex items-center justify-center gap-2 text-sm text-foreground">
                    <TrendingUp className="w-4 h-4 text-success" />
                    <span className="font-medium">+$45,000/mes</span>
                    <span className="text-muted-foreground">potencial detectado</span>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
            className="flex flex-col items-center mt-6"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <ChevronDown className="w-6 h-6 text-muted-foreground" />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
