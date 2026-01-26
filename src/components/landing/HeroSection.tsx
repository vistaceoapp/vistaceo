import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, TrendingUp, Brain, Target, Zap, CheckCircle2, Star, Clock, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useCountryDetection } from "@/hooks/use-country-detection";
import { MockupRadar } from "./mockups/MockupRadar";
import { MockupMissions } from "./mockups/MockupMissions";
import { TypewriterText } from "./TypewriterText";
import { LiveCounter } from "./LiveCounter";
import { FloatingTestimonial } from "./FloatingTestimonial";

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
          
          {/* Live Counter - Premium element */}
          <div className="flex justify-center mb-8">
            <LiveCounter targetNumber={500} label="negocios activos ahora" />
          </div>

          {/* Main headline with rotating text */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-[1.1] tracking-tight"
          >
            Tu <TypewriterText texts={ROTATING_TEXTS} className="text-gradient-primary" />
            <br />
            <span className="text-foreground">que piensa por vos</span>
          </motion.h1>

          {/* Subheadline - shorter, more impactful */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-6 max-w-2xl mx-auto"
          >
            Detecta oportunidades. Te dice{" "}
            <span className="text-foreground font-semibold">qué hacer</span>. Cada día.
          </motion.p>

          {/* Benefits pills - compact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-wrap justify-center gap-2 mb-6"
          >
            {benefits.map((benefit, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/80 backdrop-blur-sm border border-border"
              >
                <benefit.icon className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground">{benefit.text}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex flex-col items-center gap-3 mb-8"
          >
            <Button 
              variant="hero" 
              size="xl" 
              className="group text-base sm:text-lg px-10 py-6 h-auto shadow-2xl"
              onClick={() => navigate("/auth")}
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Empezar gratis ahora
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-success" />
                Sin tarjeta
              </span>
              <span className="text-border">•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-primary" />
                3 min setup
              </span>
              <span className="text-border">•</span>
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 text-warning" />
                {!isDetecting && `Pro ${formatCurrencyShort(monthlyPrice)}/mes`}
              </span>
            </div>
          </motion.div>

          {/* ULTRA WOW Triple Dashboard Preview */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="flex-1"
          >
            <div className="w-full max-w-6xl mx-auto relative">
              {/* Glow effect */}
              <motion.div 
                animate={{ opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -inset-8 bg-gradient-to-r from-primary/15 via-accent/15 to-primary/15 rounded-3xl blur-3xl" 
              />
              
              {/* Triple panel layout */}
              <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 items-start">
                {/* Left: Radar */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                  className="hidden lg:block"
                >
                  <MockupRadar />
                </motion.div>

                {/* Center: Main Dashboard Card */}
                <div className="lg:col-span-1">
                  <div className="bg-card/95 backdrop-blur-sm border border-border rounded-2xl shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary/30">
                      <div className="flex items-center gap-3">
                        <motion.div 
                          animate={{ rotate: [0, 5, -5, 0] }}
                          transition={{ duration: 3, repeat: Infinity }}
                          className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center"
                        >
                          <Zap className="w-4 h-4 text-white" />
                        </motion.div>
                        <div>
                          <div className="text-sm font-semibold text-foreground">{MOCK_BUSINESS.name}</div>
                          <div className="text-[10px] text-muted-foreground">{MOCK_BUSINESS.type}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-success/10 text-success text-[10px] font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                        En vivo
                      </div>
                    </div>
                    
                    {/* Health Score */}
                    <div className="p-4">
                      <div className="bg-secondary/50 rounded-xl border border-border p-4 mb-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-semibold text-foreground">Salud del Negocio</span>
                          <span className="px-2 py-0.5 rounded-full bg-success/10 text-success text-[10px] font-medium">
                            {MOCK_BUSINESS.certaintyPct}% certeza
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <motion.div 
                            animate={{ scale: [1, 1.02, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="w-20 h-20 rounded-2xl bg-gradient-to-br from-success/20 to-success/10 border-2 border-success/30 flex flex-col items-center justify-center relative"
                          >
                            <span className="text-3xl font-bold text-success">{MOCK_BUSINESS.healthScore}</span>
                            <span className="text-[10px] text-success font-medium">Bueno</span>
                            <motion.div
                              animate={{ scale: [1, 1.3, 1] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                              className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-success flex items-center justify-center"
                            >
                              <TrendingUp className="w-3 h-3 text-white" />
                            </motion.div>
                          </motion.div>
                          
                          <div className="flex-1 space-y-2">
                            {MOCK_BUSINESS.dimensions.map((dim, i) => (
                              <motion.div 
                                key={dim.name}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 1 + i * 0.1 }}
                                className="flex items-center gap-2"
                              >
                                <span className="text-xs">{dim.icon}</span>
                                <span className="text-[10px] text-muted-foreground w-16 truncate">{dim.name}</span>
                                <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${dim.score}%` }}
                                    transition={{ delay: 1.2 + i * 0.1, duration: 0.6 }}
                                    className="h-full rounded-full"
                                    style={{ 
                                      backgroundColor: dim.score >= 80 ? 'hsl(var(--success))' : 
                                                       dim.score >= 60 ? 'hsl(var(--primary))' : 
                                                       'hsl(var(--warning))' 
                                    }}
                                  />
                                </div>
                                <span className="text-[10px] font-medium text-foreground w-6 text-right">{dim.score}</span>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Today's Action */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.3 }}
                        className="bg-gradient-to-br from-primary/10 via-accent/5 to-transparent rounded-xl border border-primary/20 p-4"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center">
                            <Zap className="w-3.5 h-3.5 text-white" />
                          </div>
                          <span className="text-xs text-muted-foreground">Tu acción de hoy</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-destructive/10 text-destructive font-medium">
                            PRIORIDAD
                          </span>
                        </div>
                        
                        <h4 className="font-semibold text-foreground text-sm mb-2">
                          {MOCK_BUSINESS.todayAction.title}
                        </h4>
                        
                        <div className="flex items-center gap-3 text-xs">
                          <span className="flex items-center gap-1 text-success font-semibold">
                            <TrendingUp className="w-3.5 h-3.5" />
                            {MOCK_BUSINESS.todayAction.impact}
                          </span>
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="w-3.5 h-3.5" />
                            {MOCK_BUSINESS.todayAction.time}
                          </span>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </div>

                {/* Right: Missions */}
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9, duration: 0.6 }}
                  className="hidden lg:block"
                >
                  <MockupMissions />
                </motion.div>
              </div>

              {/* Mobile: Show panels below */}
              <div className="lg:hidden grid grid-cols-2 gap-3 mt-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                  className="transform scale-90 origin-top"
                >
                  <MockupRadar />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1 }}
                  className="transform scale-90 origin-top"
                >
                  <MockupMissions />
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Floating Testimonial */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 }}
            className="mt-8"
          >
            <FloatingTestimonial />
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
