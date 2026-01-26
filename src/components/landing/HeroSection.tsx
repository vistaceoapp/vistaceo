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
    <section className="relative min-h-[100svh] flex flex-col items-center justify-center overflow-hidden px-4">
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

      <div className="relative z-10 text-center max-w-3xl mx-auto">
        
        {/* Live Counter - Compact premium */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-8"
        >
          <LiveCounter targetNumber={500} label="activos" />
        </motion.div>

        {/* Main headline with rotating text */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-[1.1] tracking-tight"
        >
          Tu <TypewriterText texts={ROTATING_TEXTS} className="text-gradient-primary" />
          <br />
          que piensa por vos
        </motion.h1>

        {/* Subheadline */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-xl mx-auto"
        >
          Detecta oportunidades. Acciones claras. <span className="text-foreground font-medium">Resultados reales.</span>
        </motion.p>

        {/* CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col items-center gap-3"
        >
          <Button 
            variant="hero" 
            size="lg" 
            className="group text-base sm:text-lg px-8 sm:px-10 py-5 sm:py-6 h-auto shadow-xl"
            onClick={() => navigate("/auth")}
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Empezar gratis
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="w-4 h-4 text-success" />
            <span>Sin tarjeta</span>
            <span className="text-border">•</span>
            <span>3 min setup</span>
            <span className="text-border">•</span>
            <span>{!isDetecting && `Pro ${formatCurrencyShort(monthlyPrice)}/mes`}</span>
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator at bottom */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <ChevronDown className="w-6 h-6 text-muted-foreground" />
        </motion.div>
      </motion.div>
    </section>
  );
};
