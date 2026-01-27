import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  ArrowRight, 
  Brain, 
  Target, 
  Radar, 
  MessageSquare, 
  BarChart3, 
  Sparkles,
  Check,
  Star,
  Zap,
  Shield,
  TrendingUp,
  Users,
  Crown,
  Play,
  ChevronDown,
  Activity,
  Globe,
  Lightbulb,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Quote,
  Menu,
  X,
  LockKeyhole,
  Rocket,
  Eye,
  Award
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

// Real mockup components (100% real system UI) - Pro users
import { MockupProDashboard } from "@/components/landing/mockups/MockupProDashboard";
import { MockupProMissions } from "@/components/landing/mockups/MockupProMissions";
import { MockupProRadar } from "@/components/landing/mockups/MockupProRadar";
import { MockupProChat } from "@/components/landing/mockups/MockupProChat";

// Floating particles component
import { FloatingParticles } from "@/components/landing/FloatingParticles";

// Logo
import logoFull from "@/assets/brand/logo-light-full.png";
import logoDark from "@/assets/brand/logo-dark-full.png";

// ============= ANIMATION COMPONENTS =============

const AnimatedCounter = ({ value, suffix = "", prefix = "" }: { value: number; suffix?: string; prefix?: string }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (isInView) {
      const duration = 2000;
      const steps = 60;
      const increment = value / steps;
      let current = 0;
      const timer = setInterval(() => {
        current += increment;
        if (current >= value) {
          setCount(value);
          clearInterval(timer);
        } else {
          setCount(Math.floor(current));
        }
      }, duration / steps);
      return () => clearInterval(timer);
    }
  }, [isInView, value]);

  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>;
};

// Typewriter effect with highlight
const TypewriterText = ({ texts }: { texts: string[] }) => {
  const [currentText, setCurrentText] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const text = texts[currentText];
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (displayText.length < text.length) {
          setDisplayText(text.slice(0, displayText.length + 1));
        } else {
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        if (displayText.length > 0) {
          setDisplayText(text.slice(0, displayText.length - 1));
        } else {
          setIsDeleting(false);
          setCurrentText((prev) => (prev + 1) % texts.length);
        }
      }
    }, isDeleting ? 30 : 80);

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, currentText, texts]);

  return (
    <span className="text-gradient-primary relative">
      {displayText}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
        className="inline-block w-0.5 h-[1em] bg-primary ml-1 align-middle"
      />
    </span>
  );
};

// Floating mockup with enhanced glow
const FloatingMockup = ({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 60, rotateX: 10 }}
    whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 1, delay, ease: "easeOut" }}
    className={cn("relative group perspective-1000", className)}
  >
    <motion.div 
      className="absolute -inset-6 bg-gradient-to-r from-primary/30 via-accent/20 to-primary/30 rounded-3xl blur-3xl opacity-0 group-hover:opacity-100 transition-all duration-700"
      animate={{ scale: [1, 1.05, 1] }}
      transition={{ duration: 4, repeat: Infinity }}
    />
    <motion.div 
      className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl opacity-50"
      animate={{ opacity: [0.3, 0.6, 0.3] }}
      transition={{ duration: 3, repeat: Infinity }}
    />
    <div className="relative">{children}</div>
  </motion.div>
);

// Glowing orb background
const GlowingOrb = ({ className, delay = 0 }: { className?: string; delay?: number }) => (
  <motion.div
    initial={{ scale: 0.8, opacity: 0 }}
    animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.3, 0.6, 0.3] }}
    transition={{ duration: 8, delay, repeat: Infinity, ease: "easeInOut" }}
    className={cn("absolute rounded-full blur-3xl pointer-events-none", className)}
  />
);

// Shimmer button effect
const ShimmerButton = ({ children, className, onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={cn(
      "relative overflow-hidden gradient-primary text-primary-foreground font-semibold rounded-full shadow-xl shadow-primary/30",
      className
    )}
  >
    <motion.div
      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
      animate={{ x: ["-100%", "100%"] }}
      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
    />
    <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
  </motion.button>
);

// ============= MAIN COMPONENT =============

const LandingV3 = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.95]);

  // Product showcase tabs with REAL mockups
  const productTabs = [
    { 
      id: "dashboard", 
      label: "Dashboard", 
      icon: BarChart3,
      description: "Visualiza la salud de tu negocio en 7 dimensiones con métricas en tiempo real.",
      component: <MockupProDashboard business="argentina" />
    },
    { 
      id: "missions", 
      label: "Misiones", 
      icon: Target,
      description: "Planes de acción paso a paso con impacto medible y tiempo estimado.",
      component: <MockupProMissions business="mexico" />
    },
    { 
      id: "radar", 
      label: "Radar", 
      icon: Radar,
      description: "Detecta oportunidades internas y tendencias del mercado automáticamente.",
      component: <MockupProRadar business="argentina" />
    },
    { 
      id: "chat", 
      label: "Chat CEO", 
      icon: MessageSquare,
      description: "Tu mentor ejecutivo 24/7. Preguntale cualquier cosa de tu negocio.",
      component: <MockupProChat business="mexico" />
    },
  ];

  // Business testimonials with real case data
  const testimonials = [
    {
      name: "Martín Rodríguez",
      business: "Parrilla Don Martín",
      location: "Buenos Aires, Argentina",
      type: "Restaurante / Parrilla",
      avatar: "MR",
      quote: "En 3 meses aumenté mis ventas un 28%. VistaCEO me mostró que mis sábados tenían 23% menos tráfico que la competencia. Cambié el horario y todo cambió.",
      metrics: { growth: "+28%", missions: 12, health: 78 },
      gradient: "from-orange-500 to-red-500"
    },
    {
      name: "Carolina Méndez",
      business: "Boutique Carmela",
      location: "Ciudad de México, México",
      type: "Retail / Moda",
      avatar: "CM",
      quote: "Las misiones son increíbles. Cada una tiene pasos claros y puedo medir el impacto. Es como tener un consultor disponible las 24 horas.",
      metrics: { growth: "+45%", missions: 18, health: 85 },
      gradient: "from-pink-500 to-purple-500"
    },
    {
      name: "Diego Fernández",
      business: "Clínica Sonrisas",
      location: "Santiago, Chile",
      type: "Salud / Odontología",
      avatar: "DF",
      quote: "El diagnóstico de salud del negocio me abrió los ojos. Descubrí que perdía el 40% de mis pacientes nuevos por mal seguimiento. Ahora tengo el 92%.",
      metrics: { growth: "+52%", missions: 24, health: 92 },
      gradient: "from-emerald-500 to-teal-500"
    },
  ];

  const features = [
    {
      icon: Brain,
      title: "Cerebro que Aprende",
      description: "IA que memoriza cada decisión, aprende tu estilo y se adapta a tu negocio específico.",
      highlight: "180+ tipos de negocio"
    },
    {
      icon: Target,
      title: "Misiones de Impacto",
      description: "Planes paso a paso con métricas claras, tiempo estimado y ROI proyectado.",
      highlight: "5-12 pasos por misión"
    },
    {
      icon: Radar,
      title: "Radar 360°",
      description: "Detecta oportunidades internas y tendencias externas antes que tu competencia.",
      highlight: "Actualización diaria"
    },
    {
      icon: MessageSquare,
      title: "Mentor Ejecutivo 24/7",
      description: "Chat multimodal: texto, voz, fotos y documentos. Tu consultor siempre disponible.",
      highlight: "Respuesta inmediata"
    },
    {
      icon: Activity,
      title: "7 Dimensiones de Salud",
      description: "Diagnóstico profundo: Ventas, Equipo, Finanzas, Eficiencia, Marketing, Operación, Reputación.",
      highlight: "Score de 0 a 100"
    },
    {
      icon: Lightbulb,
      title: "Aprendizaje Continuo",
      description: "El sistema detecta patrones de éxito y los replica automáticamente.",
      highlight: "Mejora cada semana"
    },
  ];

  const stats = [
    { value: 500, suffix: "+", label: "Negocios activos", icon: Users },
    { value: 32, suffix: "%", label: "Crecimiento promedio", icon: TrendingUp },
    { value: 180, suffix: "+", label: "Tipos de negocio", icon: Globe },
    { value: 15, suffix: "min", label: "Setup inicial", icon: Zap },
  ];

  const pricingPlans = [
    {
      name: "Free",
      description: "Para empezar a conocer tu negocio",
      price: { ars: "0", usd: "0" },
      period: "para siempre",
      features: [
        "Dashboard de salud completo",
        "3 misiones estratégicas/mes",
        "5 oportunidades de Radar/mes",
        "Check-in diario básico",
        "1 acción diaria sugerida",
      ],
      cta: "Empezar gratis",
      highlighted: false
    },
    {
      name: "Pro",
      description: "El Cerebro Completo de tu negocio",
      price: { ars: "$29.999", usd: "$29" },
      period: "/mes",
      annual: { ars: "$299.999", usd: "$299", savings: "2 meses gratis" },
      features: [
        "Todo lo de Free +",
        "Chat CEO multimodal ilimitado",
        "Misiones y Radar ilimitados",
        "Análisis de fotos y documentos",
        "Google Reviews integrado",
        "Analíticas avanzadas",
        "Soporte prioritario",
      ],
      cta: "Activar Pro",
      highlighted: true
    },
  ];

  const faqs = [
    {
      question: "¿Qué tipo de negocios pueden usar VistaCEO?",
      answer: "VistaCEO está diseñado para +180 tipos de negocios: restaurantes, cafeterías, retail, clínicas, salones de belleza, servicios profesionales, y muchos más. El sistema se adapta automáticamente a tu industria específica."
    },
    {
      question: "¿Cuánto tiempo toma ver resultados?",
      answer: "La mayoría de nuestros usuarios ven mejoras medibles en las primeras 2-4 semanas. El setup inicial toma solo 15 minutos y desde el primer día recibís diagnóstico y acciones concretas."
    },
    {
      question: "¿Mis datos están seguros?",
      answer: "Absolutamente. Usamos encriptación de grado bancario y nunca compartimos tu información. Tus datos de negocio son 100% privados."
    },
    {
      question: "¿Puedo cancelar cuando quiera?",
      answer: "Sí, podés cancelar tu suscripción Pro en cualquier momento sin compromiso. Tu cuenta se convierte en Free y mantenés acceso básico."
    },
  ];

  // How it works steps
  const howItWorks = [
    {
      step: 1,
      title: "Contanos de tu negocio",
      description: "15 minutos de setup guiado. Respondé preguntas simples sobre tu operación.",
      icon: MessageSquare,
      visual: <MockupProChat business="argentina" />
    },
    {
      step: 2,
      title: "Recibí tu diagnóstico",
      description: "Obtené un análisis profundo de las 7 dimensiones de salud de tu negocio.",
      icon: Activity,
      visual: <MockupProDashboard business="mexico" />
    },
    {
      step: 3,
      title: "Ejecutá misiones",
      description: "Seguí planes de acción paso a paso con métricas claras de impacto.",
      icon: Target,
      visual: <MockupProMissions business="argentina" />
    },
    {
      step: 4,
      title: "Crecé sin límites",
      description: "El radar detecta oportunidades y el cerebro aprende de cada decisión.",
      icon: Rocket,
      visual: <MockupProRadar business="mexico" />
    },
  ];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden relative">
      {/* Floating particles background */}
      <FloatingParticles />
      
      {/* Animated gradient orbs */}
      <GlowingOrb className="w-[600px] h-[600px] bg-primary/20 top-0 -left-64" delay={0} />
      <GlowingOrb className="w-[500px] h-[500px] bg-accent/20 top-1/3 -right-48" delay={2} />
      <GlowingOrb className="w-[400px] h-[400px] bg-primary/15 bottom-1/4 left-1/4" delay={4} />
      {/* ============= HEADER ============= */}
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50"
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="flex items-center"
            >
              <img src={logoDark} alt="VistaCEO" className="h-7 md:h-8 dark:hidden" />
              <img src={logoFull} alt="VistaCEO" className="h-7 md:h-8 hidden dark:block" />
            </motion.div>
            
            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              {['Producto', 'Características', 'Casos de Éxito', 'Precios', 'FAQ'].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replace(/ /g, '-')}`}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors relative group"
                >
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
                </a>
              ))}
            </nav>
            
            {/* CTA Buttons */}
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate("/auth")}
                className="hidden sm:flex"
              >
                Iniciar sesión
              </Button>
              <Button 
                size="sm"
                className="gradient-primary text-primary-foreground rounded-full px-5 font-medium shadow-lg shadow-primary/25"
                onClick={() => navigate("/auth")}
              >
                Empezar gratis
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
              
              {/* Mobile menu */}
              <Button 
                variant="ghost" 
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border bg-background"
          >
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-3">
              {['Producto', 'Características', 'Casos de Éxito', 'Precios', 'FAQ'].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replace(/ /g, '-')}`}
                  className="py-2 text-foreground hover:text-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item}
                </a>
              ))}
            </nav>
          </motion.div>
        )}
      </motion.header>

      {/* ============= HERO ============= */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center pt-20 pb-16 md:pt-28 md:pb-20 overflow-hidden">
        {/* Enhanced animated background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }}
            transition={{ duration: 10, repeat: Infinity }}
            className="absolute top-0 -left-1/4 w-[70%] h-[60%] bg-primary/20 rounded-full blur-[150px]" 
          />
          <motion.div 
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 12, repeat: Infinity, delay: 2 }}
            className="absolute bottom-0 -right-1/4 w-[60%] h-[50%] bg-accent/20 rounded-full blur-[150px]" 
          />
          <motion.div 
            animate={{ scale: [1, 1.3, 1], opacity: [0.05, 0.15, 0.05] }}
            transition={{ duration: 8, repeat: Infinity, delay: 4 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" 
          />
        </div>

        <motion.div 
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="container mx-auto px-4 relative z-10"
        >
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
              {/* Left: Text content */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="text-center lg:text-left"
              >
                {/* Animated badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Badge 
                    variant="outline" 
                    className="mb-6 px-4 py-2 border-primary/40 bg-primary/10 backdrop-blur-sm"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles className="w-4 h-4 mr-2 text-primary" />
                    </motion.div>
                    <span className="text-sm font-medium">+500 negocios creciendo con IA</span>
                  </Badge>
                </motion.div>
                
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-[1.05] tracking-tight">
                  Tu negocio
                  <br />
                  merece un{" "}
                  <TypewriterText texts={["CEO digital", "mentor 24/7", "radar inteligente", "estratega IA"]} />
                </h1>
                
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-lg md:text-xl text-muted-foreground mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed"
                >
                  Inteligencia artificial que <span className="text-foreground font-semibold">diagnostica</span>, <span className="text-foreground font-semibold">planifica</span> y <span className="text-foreground font-semibold">ejecuta</span> para hacer crecer tu negocio.
                </motion.p>
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-10"
                >
                  <ShimmerButton
                    className="w-full sm:w-auto px-8 py-4 text-lg"
                    onClick={() => navigate("/auth")}
                  >
                    Empezar gratis
                    <ArrowRight className="w-5 h-5" />
                  </ShimmerButton>
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="w-full sm:w-auto rounded-full px-8 h-14 text-lg group border-2 hover:border-primary/50 hover:bg-primary/5"
                  >
                    <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                    Ver demo
                  </Button>
                </motion.div>

                {/* Enhanced Stats with icons */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="grid grid-cols-2 sm:grid-cols-4 gap-3"
                >
                  {stats.map((stat, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.9 + i * 0.1 }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      className="p-3 rounded-xl bg-card/50 border border-border/50 backdrop-blur-sm text-center lg:text-left"
                    >
                      <div className="flex items-center gap-2 mb-1 justify-center lg:justify-start">
                        <stat.icon className="w-4 h-4 text-primary" />
                        <span className="text-xl md:text-2xl font-bold text-foreground">
                          <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">{stat.label}</div>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>

              {/* Right: Real Dashboard Mockup with enhanced effects */}
              <motion.div
                initial={{ opacity: 0, y: 60, rotateY: -8 }}
                animate={{ opacity: 1, y: 0, rotateY: 0 }}
                transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
                className="relative perspective-1000"
              >
                <div className="relative">
                  {/* Animated glow effect */}
                  <motion.div 
                    className="absolute -inset-6 bg-gradient-to-r from-primary/40 via-accent/30 to-primary/40 rounded-3xl blur-3xl"
                    animate={{ opacity: [0.4, 0.7, 0.4], scale: [0.95, 1.05, 0.95] }}
                    transition={{ duration: 4, repeat: Infinity }}
                  />
                  
                  {/* Browser frame with enhanced styling */}
                  <motion.div 
                    className="relative bg-card/95 backdrop-blur-xl rounded-2xl border border-border/80 shadow-2xl shadow-primary/10 overflow-hidden"
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/40">
                      <div className="flex gap-1.5">
                        <motion.div whileHover={{ scale: 1.2 }} className="w-3 h-3 rounded-full bg-destructive/70" />
                        <motion.div whileHover={{ scale: 1.2 }} className="w-3 h-3 rounded-full bg-accent/70" />
                        <motion.div whileHover={{ scale: 1.2 }} className="w-3 h-3 rounded-full bg-primary/70" />
                      </div>
                      <div className="flex-1 flex justify-center">
                        <div className="px-4 py-1.5 rounded-full bg-background/60 text-xs text-muted-foreground border border-border/50 flex items-center gap-2">
                          <LockKeyhole className="w-3 h-3" />
                          app.vistaceo.com
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-secondary/30 to-background">
                      <MockupProDashboard business="argentina" />
                    </div>
                  </motion.div>
                  
                  {/* Floating badge */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.5, type: "spring" }}
                    className="absolute -bottom-4 -right-4 bg-card border border-border rounded-xl p-3 shadow-xl"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
                        <TrendingUp className="w-4 h-4 text-success" />
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Este mes</div>
                        <div className="text-sm font-bold text-success">+28% ventas</div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Enhanced scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden md:block"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center gap-2 text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
          >
            <span className="text-xs uppercase tracking-[0.2em] font-medium">Descubrí más</span>
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <ChevronDown className="w-5 h-5" />
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* ============= HOW IT WORKS ============= */}
      <section className="py-20 md:py-32 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge variant="outline" className="mb-4 border-primary/30 bg-primary/5">
              <Rocket className="w-4 h-4 mr-2" />
              Cómo funciona
            </Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              En <span className="text-gradient-primary">4 simples pasos</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              De cero a un negocio más inteligente en menos de 15 minutos.
            </p>
          </motion.div>

          {/* Steps with alternating layout */}
          <div className="max-w-6xl mx-auto space-y-24">
            {howItWorks.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
                className={cn(
                  "grid lg:grid-cols-2 gap-12 items-center",
                  i % 2 === 1 && "lg:grid-flow-dense"
                )}
              >
                {/* Text */}
                <div className={cn(i % 2 === 1 && "lg:col-start-2")}>
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ type: "spring", delay: 0.2 }}
                    className="inline-flex items-center gap-3 mb-4"
                  >
                    <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center text-primary-foreground text-xl font-bold shadow-lg shadow-primary/25">
                      {item.step}
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                  </motion.div>
                  <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-3">{item.title}</h3>
                  <p className="text-lg text-muted-foreground">{item.description}</p>
                </div>
                
                {/* Visual */}
                <div className={cn(i % 2 === 1 && "lg:col-start-1 lg:row-start-1")}>
                  <FloatingMockup delay={0.3}>
                    {item.visual}
                  </FloatingMockup>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============= PRODUCT SHOWCASE ============= */}
      <section id="producto" className="py-20 md:py-32 bg-gradient-to-b from-secondary/50 to-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12 md:mb-16"
          >
            <Badge variant="outline" className="mb-4 border-primary/30 bg-primary/5">
              <BarChart3 className="w-4 h-4 mr-2" />
              Producto
            </Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Un sistema <span className="text-gradient-primary">completo</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Dashboard profesional, IA avanzada y herramientas de crecimiento diseñadas para dueños de negocios reales.
            </p>
          </motion.div>

          {/* Tab navigation */}
          <div className="flex justify-center gap-2 md:gap-4 mb-8 md:mb-12 flex-wrap">
            {productTabs.map((tab, i) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(i)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 rounded-full text-sm font-medium transition-all",
                  activeTab === i
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                    : "bg-card/80 text-muted-foreground hover:text-foreground border border-border hover:border-primary/30"
                )}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </motion.button>
            ))}
          </div>

          {/* Content area */}
          <div className="max-w-5xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              {/* Description */}
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
                className="order-2 lg:order-1"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                    {(() => {
                      const Icon = productTabs[activeTab].icon;
                      return <Icon className="w-6 h-6 text-primary-foreground" />;
                    })()}
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">{productTabs[activeTab].label}</h3>
                </div>
                <p className="text-lg text-muted-foreground mb-6">{productTabs[activeTab].description}</p>
                
                <ul className="space-y-3 mb-8">
                  {[
                    "100% personalizado a tu negocio",
                    "Actualización en tiempo real",
                    "Sin curva de aprendizaje"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-foreground">
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>

                <Button 
                  className="gradient-primary text-primary-foreground rounded-full px-6"
                  onClick={() => navigate("/auth")}
                >
                  Probalo gratis
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>

              {/* Mockup */}
              <motion.div
                key={`mockup-${activeTab}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
                className="order-1 lg:order-2"
              >
                <FloatingMockup>
                  {productTabs[activeTab].component}
                </FloatingMockup>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ============= FEATURES GRID ============= */}
      <section id="características" className="py-20 md:py-32 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 left-0 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12 md:mb-16"
          >
            <Badge variant="outline" className="mb-4 border-primary/30 bg-primary/5">
              <Zap className="w-4 h-4 mr-2" />
              Características
            </Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Todo para <span className="text-gradient-primary">crecer</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Herramientas de IA diseñadas para dueños de negocios que quieren resultados sin complicaciones.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group"
              >
                <div className="h-full p-6 md:p-8 rounded-2xl bg-card/80 backdrop-blur-sm border border-border hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300">
                  <motion.div 
                    className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center mb-5 shadow-lg shadow-primary/20"
                    whileHover={{ rotate: [0, -5, 5, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <feature.icon className="w-7 h-7 text-primary-foreground" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">{feature.title}</h3>
                  <p className="text-muted-foreground mb-4">{feature.description}</p>
                  <Badge variant="secondary" className="text-xs border border-primary/20">{feature.highlight}</Badge>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============= TESTIMONIALS ============= */}
      <section id="casos-de-éxito" className="py-20 md:py-32 bg-gradient-to-b from-secondary/50 to-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12 md:mb-16"
          >
            <Badge variant="outline" className="mb-4 border-primary/30 bg-primary/5">
              <Star className="w-4 h-4 mr-2" />
              Casos de Éxito
            </Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Negocios reales, <span className="text-gradient-primary">resultados reales</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Dueños de negocios de toda Latinoamérica están creciendo con VistaCEO.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {testimonials.map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="group"
              >
                <div className="h-full p-6 md:p-8 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all relative overflow-hidden">
                  {/* Growth badge */}
                  <Badge className="absolute top-4 right-4 bg-primary/10 text-primary border-primary/20 font-bold">
                    {testimonial.metrics.growth}
                  </Badge>

                  {/* Stars */}
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-accent text-accent" />
                    ))}
                  </div>

                  {/* Quote */}
                  <p className="text-foreground mb-6 leading-relaxed">"{testimonial.quote}"</p>

                  {/* Author */}
                  <div className="flex items-center gap-3 pt-4 border-t border-border">
                    <div className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center text-white font-bold bg-gradient-to-br",
                      testimonial.gradient
                    )}>
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.business}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        {testimonial.location}
                      </div>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-border">
                    <div className="text-center">
                      <div className="text-lg font-bold text-primary">{testimonial.metrics.missions}</div>
                      <div className="text-xs text-muted-foreground">Misiones</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-primary">{testimonial.metrics.health}</div>
                      <div className="text-xs text-muted-foreground">Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-primary">{testimonial.metrics.growth}</div>
                      <div className="text-xs text-muted-foreground">Crecimiento</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============= PRICING ============= */}
      <section id="precios" className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12 md:mb-16"
          >
            <Badge variant="outline" className="mb-4 border-primary/30 bg-primary/5">
              <Crown className="w-4 h-4 mr-2" />
              Precios
            </Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Simple y <span className="text-gradient-primary">transparente</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Empezá gratis, crecé cuando quieras. Sin sorpresas ni costos ocultos.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {pricingPlans.map((plan, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className={cn(
                  "relative rounded-2xl p-8",
                  plan.highlighted
                    ? "bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 border-2 border-primary/30"
                    : "bg-card border border-border"
                )}
              >
                {plan.highlighted && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 gradient-primary text-primary-foreground">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Más popular
                  </Badge>
                )}

                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
                  <p className="text-muted-foreground">{plan.description}</p>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-foreground">{plan.price.ars}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  {plan.annual && (
                    <p className="text-sm text-primary mt-2">
                      Anual: {plan.annual.ars}/año ({plan.annual.savings})
                    </p>
                  )}
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-3 text-foreground">
                      <Check className="w-5 h-5 text-primary shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button 
                  className={cn(
                    "w-full rounded-full h-12",
                    plan.highlighted
                      ? "gradient-primary text-primary-foreground shadow-lg shadow-primary/25"
                      : ""
                  )}
                  variant={plan.highlighted ? "default" : "outline"}
                  onClick={() => navigate("/auth")}
                >
                  {plan.cta}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
            ))}
          </div>

          {/* Trust signals */}
          <div className="flex flex-wrap justify-center gap-6 mt-12 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              Garantía 7 días
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              Cancela cuando quieras
            </div>
            <div className="flex items-center gap-2">
              <LockKeyhole className="w-4 h-4 text-primary" />
              Pago 100% seguro
            </div>
          </div>
        </div>
      </section>

      {/* ============= FAQ ============= */}
      <section id="faq" className="py-20 md:py-32 bg-gradient-to-b from-secondary/50 to-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12 md:mb-16"
          >
            <Badge variant="outline" className="mb-4 border-primary/30 bg-primary/5">
              <MessageSquare className="w-4 h-4 mr-2" />
              FAQ
            </Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Preguntas <span className="text-gradient-primary">frecuentes</span>
            </h2>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card rounded-xl border border-border p-6"
              >
                <h3 className="text-lg font-semibold text-foreground mb-2">{faq.question}</h3>
                <p className="text-muted-foreground">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============= FINAL CTA ============= */}
      <section className="py-20 md:py-32 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[100px]"
          />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="relative">
              <motion.div 
                className="absolute -inset-6 bg-gradient-to-r from-primary/30 via-accent/20 to-primary/30 rounded-3xl blur-3xl"
                animate={{ opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
              <div className="relative bg-card/95 backdrop-blur-xl rounded-3xl border border-border/80 p-8 md:p-16 shadow-2xl">
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring" }}
                >
                  <Badge variant="outline" className="mb-6 border-primary/40 bg-primary/10 px-4 py-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles className="w-4 h-4 mr-2 text-primary" />
                    </motion.div>
                    Empezá hoy
                  </Badge>
                </motion.div>
                
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
                  Tu negocio está a 15 minutos de{" "}
                  <span className="text-gradient-primary">crecer diferente</span>
                </h2>
                
                <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Más de 500 negocios ya están usando VistaCEO para tomar mejores decisiones. Empezá gratis y sin compromiso.
                </p>
                
                <ShimmerButton
                  className="px-10 py-4 text-lg mx-auto"
                  onClick={() => navigate("/auth")}
                >
                  Empezar gratis ahora
                  <ArrowRight className="w-5 h-5" />
                </ShimmerButton>
                
                <p className="text-sm text-muted-foreground mt-6 flex items-center justify-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    Sin tarjeta de crédito
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-primary" />
                    Setup en 15 minutos
                  </span>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============= FOOTER ============= */}
      <footer className="py-12 border-t border-border bg-card/50 relative z-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <img src={logoDark} alt="VistaCEO" className="h-6 dark:hidden" />
              <img src={logoFull} alt="VistaCEO" className="h-6 hidden dark:block" />
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
    </div>
  );
};

export default LandingV3;
