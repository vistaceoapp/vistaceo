import { motion, useScroll, useTransform, useSpring, useInView, AnimatePresence } from "framer-motion";
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
  ArrowUpRight,
  Cpu,
  LineChart,
  Activity,
  Globe,
  Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

// Real system screenshots
import analyticsSaludImg from "@/assets/mockups/analytics-salud.png";
import ceoChatImg from "@/assets/mockups/ceo-chat.png";
import dashboardMainImg from "@/assets/mockups/dashboard-main.png";
import misionesImg from "@/assets/mockups/misiones.png";
import radarExternoImg from "@/assets/mockups/radar-externo.png";
import radarInternoImg from "@/assets/mockups/radar-interno.png";

// Logo
import logoFull from "@/assets/brand/logo-light-full.png";
import logoDark from "@/assets/brand/logo-dark-full.png";

// ============= ANIMATED COMPONENTS =============

// Animated gradient orb
const GradientOrb = ({ className, delay = 0 }: { className?: string; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.5 }}
    animate={{ 
      opacity: [0.3, 0.6, 0.3],
      scale: [1, 1.2, 1],
    }}
    transition={{ 
      duration: 8,
      delay,
      repeat: Infinity,
      ease: "easeInOut"
    }}
    className={cn(
      "absolute rounded-full blur-[100px] pointer-events-none",
      className
    )}
  />
);

// Floating particle
const FloatingParticle = ({ delay = 0, size = 4 }: { delay?: number; size?: number }) => (
  <motion.div
    initial={{ y: 100, opacity: 0 }}
    animate={{ 
      y: -100,
      opacity: [0, 1, 0],
    }}
    transition={{ 
      duration: 4 + Math.random() * 2,
      delay,
      repeat: Infinity,
      ease: "easeOut"
    }}
    style={{
      left: `${Math.random() * 100}%`,
      width: size,
      height: size,
    }}
    className="absolute rounded-full bg-primary/40"
  />
);

// Animated counter
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

  return (
    <span ref={ref}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
};

// Glowing button
const GlowingButton = ({ children, onClick, className }: { children: React.ReactNode; onClick?: () => void; className?: string }) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={cn(
      "relative group px-8 py-4 rounded-full font-semibold text-white overflow-hidden",
      "bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%]",
      "animate-[shimmer_3s_ease-in-out_infinite]",
      className
    )}
  >
    <span className="relative z-10 flex items-center gap-2">{children}</span>
    <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-primary/50 via-accent/50 to-primary/50 blur-xl" />
  </motion.button>
);

// 3D Card
const Card3D = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    setRotateX((y - centerY) / 20);
    setRotateY((centerX - x) / 20);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ rotateX, rotateY }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      style={{ transformStyle: "preserve-3d" }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Screenshot showcase with perspective
const ScreenshotShowcase = ({ src, alt, badge, isActive }: { src: string; alt: string; badge: string; isActive: boolean }) => (
  <motion.div
    initial={{ opacity: 0, y: 50, rotateX: 10 }}
    animate={{ 
      opacity: isActive ? 1 : 0.3,
      y: isActive ? 0 : 20,
      scale: isActive ? 1 : 0.9,
      rotateX: isActive ? 0 : 10,
    }}
    transition={{ duration: 0.5 }}
    className="relative"
    style={{ transformStyle: "preserve-3d", perspective: 1000 }}
  >
    <div className="relative bg-card rounded-2xl border border-border shadow-2xl overflow-hidden">
      {/* Glow effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-2xl blur-xl opacity-50" />
      
      <div className="relative">
        {/* Browser chrome */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/30 backdrop-blur">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-destructive/60" />
            <div className="w-3 h-3 rounded-full bg-accent/60" />
            <div className="w-3 h-3 rounded-full bg-primary/60" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="px-4 py-1 rounded-full bg-background/50 text-xs text-muted-foreground border border-border/50">
              app.vistaceo.com
            </div>
          </div>
        </div>
        
        <img src={src} alt={alt} className="w-full" />
      </div>
    </div>
    
    <Badge className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground shadow-lg">
      {badge}
    </Badge>
  </motion.div>
);

// ============= MAIN COMPONENT =============

const LandingUltra = () => {
  const navigate = useNavigate();
  const [activeScreenshot, setActiveScreenshot] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  
  // Parallax values
  const heroY = useTransform(smoothProgress, [0, 0.3], [0, -100]);
  const heroOpacity = useTransform(smoothProgress, [0, 0.2], [1, 0]);
  const heroScale = useTransform(smoothProgress, [0, 0.2], [1, 0.9]);

  // Auto-rotate screenshots
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveScreenshot((prev) => (prev + 1) % screenshots.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const screenshots = [
    { src: dashboardMainImg, alt: "Dashboard", badge: "Dashboard Principal" },
    { src: analyticsSaludImg, alt: "Analytics", badge: "Salud del Negocio" },
    { src: misionesImg, alt: "Misiones", badge: "Misiones Estratégicas" },
    { src: ceoChatImg, alt: "Chat", badge: "Chat CEO" },
    { src: radarInternoImg, alt: "Radar", badge: "Radar Interno" },
    { src: radarExternoImg, alt: "I+D", badge: "Investigación I+D" },
  ];

  const features = [
    {
      icon: Brain,
      title: "Cerebro Adaptativo",
      description: "IA que memoriza cada decisión y aprende tu estilo de gestión único.",
      gradient: "from-violet-500 to-purple-600",
      stats: "180+ tipos de negocio"
    },
    {
      icon: Target,
      title: "Misiones de Impacto",
      description: "Planes paso a paso con métricas claras y tiempo estimado.",
      gradient: "from-blue-500 to-cyan-500",
      stats: "5-12 pasos por misión"
    },
    {
      icon: Radar,
      title: "Radar 360°",
      description: "Detecta oportunidades internas y tendencias externas en tiempo real.",
      gradient: "from-emerald-500 to-teal-500",
      stats: "Actualización diaria"
    },
    {
      icon: MessageSquare,
      title: "Mentor Ejecutivo",
      description: "Chat multimodal 24/7: texto, voz, fotos y documentos.",
      gradient: "from-orange-500 to-amber-500",
      stats: "Respuesta inmediata"
    },
    {
      icon: BarChart3,
      title: "7 Dimensiones",
      description: "Diagnóstico profundo: Ventas, Equipo, Finanzas, Eficiencia y más.",
      gradient: "from-pink-500 to-rose-500",
      stats: "Score de 0 a 100"
    },
    {
      icon: Activity,
      title: "Pulso Diario",
      description: "Check-ins rápidos que alimentan la inteligencia del sistema.",
      gradient: "from-indigo-500 to-violet-500",
      stats: "2 min por día"
    },
  ];

  const stats = [
    { value: 500, suffix: "+", label: "Negocios activos", icon: Users },
    { value: 32, suffix: "%", label: "Crecimiento promedio", icon: TrendingUp },
    { value: 7, suffix: "", label: "Dimensiones de salud", icon: Activity },
    { value: 180, suffix: "+", label: "Tipos de negocio", icon: Globe },
  ];

  const testimonials = [
    {
      name: "Martín Rodríguez",
      role: "Parrilla Don Martín",
      location: "Buenos Aires, Argentina",
      quote: "En 3 meses aumenté mis ventas un 28%. VistaCEO me mostró oportunidades que nunca hubiera visto solo.",
      avatar: "MR",
      growth: "+28%"
    },
    {
      name: "Carolina Méndez",
      role: "Boutique Carmela",
      location: "Ciudad de México",
      quote: "Es como tener un consultor de negocios disponible las 24 horas. Las misiones son muy accionables.",
      avatar: "CM",
      growth: "+45%"
    },
    {
      name: "Diego Fernández",
      role: "Clínica Sonrisas",
      location: "Santiago, Chile",
      quote: "El diagnóstico de salud del negocio me abrió los ojos. Ahora tomo decisiones con datos.",
      avatar: "DF",
      growth: "+52%"
    },
  ];

  return (
    <div ref={containerRef} className="min-h-screen bg-background overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <GradientOrb className="w-[800px] h-[800px] bg-primary/30 -top-[400px] -left-[200px]" delay={0} />
        <GradientOrb className="w-[600px] h-[600px] bg-accent/20 top-1/2 -right-[200px]" delay={2} />
        <GradientOrb className="w-[500px] h-[500px] bg-primary/20 bottom-0 left-1/3" delay={4} />
        
        {/* Floating particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <FloatingParticle key={i} delay={i * 0.5} size={2 + Math.random() * 4} />
          ))}
        </div>
        
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px),
                             linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      {/* Navigation */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50"
      >
        <div className="mx-4 mt-4">
          <div className="max-w-7xl mx-auto bg-card/60 backdrop-blur-xl rounded-2xl border border-border/50 shadow-lg">
            <div className="flex items-center justify-between h-16 px-6">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-2"
              >
                <img src={logoDark} alt="VistaCEO" className="h-8 dark:hidden" />
                <img src={logoFull} alt="VistaCEO" className="h-8 hidden dark:block" />
              </motion.div>
              
              <nav className="hidden md:flex items-center gap-8">
                {['Producto', 'Features', 'Precios', 'FAQ'].map((item, i) => (
                  <motion.a
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors relative group"
                  >
                    {item}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
                  </motion.a>
                ))}
              </nav>
              
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex items-center gap-3"
              >
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
                  className="gradient-primary text-white rounded-full px-6"
                  onClick={() => navigate("/auth")}
                >
                  Empezar gratis
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-32 pb-20 px-4">
        <motion.div 
          style={{ y: heroY, opacity: heroOpacity, scale: heroScale }}
          className="container mx-auto relative z-10"
        >
          <div className="max-w-5xl mx-auto text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              <Badge 
                variant="outline" 
                className="mb-8 px-6 py-2 text-sm border-primary/30 bg-primary/5 backdrop-blur"
              >
                <Sparkles className="w-4 h-4 mr-2 text-primary" />
                <span className="text-foreground">+500 negocios ya están creciendo con IA</span>
              </Badge>
            </motion.div>
            
            {/* Main headline */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-foreground mb-8 leading-[0.95] tracking-tight">
                Tu negocio{" "}
                <span className="relative inline-block">
                  <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary animate-[shimmer_3s_ease-in-out_infinite] bg-[length:200%_100%]">
                    merece
                  </span>
                </span>
                <br />
                un{" "}
                <span className="relative inline-block">
                  <span className="text-gradient-primary">CEO digital</span>
                  <motion.span 
                    className="absolute -right-4 -top-4"
                    animate={{ rotate: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Sparkles className="w-8 h-8 text-accent" />
                  </motion.span>
                </span>
              </h1>
            </motion.div>
            
            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed"
            >
              Inteligencia artificial que{" "}
              <span className="text-foreground font-medium">diagnostica</span>,{" "}
              <span className="text-foreground font-medium">planifica</span> y{" "}
              <span className="text-foreground font-medium">ejecuta</span>{" "}
              para hacer crecer tu negocio.
            </motion.p>
            
            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
            >
              <GlowingButton onClick={() => navigate("/auth")}>
                Empezar gratis
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </GlowingButton>
              
              <Button 
                variant="outline" 
                size="lg"
                className="px-8 h-14 rounded-full border-2 group"
              >
                <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                Ver demo en 2 min
              </Button>
            </motion.div>
            
            {/* Stats row */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.8 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
            >
              {stats.map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.2 + i * 0.1 }}
                  className="relative group"
                >
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
                  <div className="relative p-4 rounded-2xl bg-card/50 backdrop-blur border border-border/50 hover:border-primary/30 transition-colors">
                    <stat.icon className="w-5 h-5 text-primary mx-auto mb-2" />
                    <div className="text-3xl font-bold text-foreground">
                      <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                    </div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>
        
        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center gap-2 text-muted-foreground"
          >
            <span className="text-xs uppercase tracking-widest">Descubrí más</span>
            <ChevronDown className="w-5 h-5" />
          </motion.div>
        </motion.div>
      </section>

      {/* Product Showcase */}
      <section id="producto" className="py-32 relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <Badge variant="outline" className="mb-6 border-primary/30 bg-primary/5">
              <Cpu className="w-4 h-4 mr-2" />
              Producto
            </Badge>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              Un sistema{" "}
              <span className="text-gradient-primary">completo</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Dashboard profesional, IA avanzada y herramientas de crecimiento. 
              Todo diseñado para dueños de negocios reales.
            </p>
          </motion.div>

          {/* Screenshot carousel */}
          <div className="max-w-5xl mx-auto mb-12">
            <AnimatePresence mode="wait">
              <ScreenshotShowcase
                key={activeScreenshot}
                src={screenshots[activeScreenshot].src}
                alt={screenshots[activeScreenshot].alt}
                badge={screenshots[activeScreenshot].badge}
                isActive={true}
              />
            </AnimatePresence>
          </div>

          {/* Screenshot selector */}
          <div className="flex justify-center gap-3 flex-wrap">
            {screenshots.map((screenshot, i) => (
              <motion.button
                key={i}
                onClick={() => setActiveScreenshot(i)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all",
                  i === activeScreenshot
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                    : "bg-card/50 text-muted-foreground hover:text-foreground border border-border/50 hover:border-primary/30"
                )}
              >
                {screenshot.badge}
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 bg-gradient-to-b from-secondary/30 to-background relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <Badge variant="outline" className="mb-6 border-primary/30 bg-primary/5">
              <Zap className="w-4 h-4 mr-2" />
              Características
            </Badge>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              Todo para{" "}
              <span className="text-gradient-primary">crecer</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Herramientas de IA diseñadas para dueños de negocios 
              que quieren resultados sin complicaciones.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card3D className="h-full">
                  <div className="h-full bg-card/80 backdrop-blur border border-border/50 rounded-2xl p-8 hover:border-primary/30 transition-all group">
                    {/* Icon */}
                    <div className={cn(
                      "w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center mb-6",
                      "group-hover:scale-110 group-hover:shadow-lg transition-all duration-300",
                      feature.gradient
                    )}>
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                    
                    {/* Content */}
                    <h3 className="text-xl font-bold text-foreground mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground mb-4 leading-relaxed">
                      {feature.description}
                    </p>
                    
                    {/* Stats badge */}
                    <Badge variant="secondary" className="text-xs">
                      {feature.stats}
                    </Badge>
                  </div>
                </Card3D>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-32 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <Badge variant="outline" className="mb-6 border-primary/30 bg-primary/5">
              <LineChart className="w-4 h-4 mr-2" />
              Proceso
            </Badge>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              De cero a resultados en{" "}
              <span className="text-gradient-primary">15 minutos</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-24 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-primary/50 via-accent/50 to-primary/50" />
            
            {[
              {
                step: "01",
                title: "Contanos tu negocio",
                description: "Respondé algunas preguntas sobre tu operación. VistaCEO aprende tu contexto único.",
                icon: Users,
                color: "from-violet-500 to-purple-600"
              },
              {
                step: "02",
                title: "Recibí tu diagnóstico",
                description: "Obtenés un análisis completo de las 7 dimensiones de salud de tu negocio.",
                icon: BarChart3,
                color: "from-blue-500 to-cyan-500"
              },
              {
                step: "03",
                title: "Ejecutá y crecé",
                description: "Seguí las misiones y acciones diarias. Medí tu progreso en tiempo real.",
                icon: TrendingUp,
                color: "from-emerald-500 to-teal-500"
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="relative text-center"
              >
                {/* Step circle */}
                <div className="relative mx-auto mb-8 w-40 h-40">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 rounded-full border-2 border-dashed border-primary/20"
                  />
                  <div className={cn(
                    "absolute inset-4 rounded-full bg-gradient-to-br flex items-center justify-center",
                    item.color
                  )}>
                    <item.icon className="w-12 h-12 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-12 h-12 rounded-full bg-card border-2 border-primary flex items-center justify-center font-bold text-primary text-lg shadow-lg">
                    {item.step}
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-foreground mb-3">
                  {item.title}
                </h3>
                <p className="text-muted-foreground max-w-xs mx-auto">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32 bg-gradient-to-b from-background via-secondary/20 to-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <Badge variant="outline" className="mb-6 border-primary/30 bg-primary/5">
              <Star className="w-4 h-4 mr-2" />
              Testimonios
            </Badge>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              Negocios{" "}
              <span className="text-gradient-primary">creciendo</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                <Card3D className="h-full">
                  <div className="h-full bg-card/80 backdrop-blur border border-border/50 rounded-2xl p-8 relative overflow-hidden">
                    {/* Growth badge */}
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-primary/10 text-primary border-primary/20 font-bold">
                        {testimonial.growth}
                      </Badge>
                    </div>
                    
                    {/* Stars */}
                    <div className="flex gap-1 mb-6">
                      {[...Array(5)].map((_, j) => (
                        <Star key={j} className="w-5 h-5 fill-accent text-accent" />
                      ))}
                    </div>
                    
                    {/* Quote */}
                    <p className="text-foreground text-lg mb-8 leading-relaxed">
                      "{testimonial.quote}"
                    </p>
                    
                    {/* Author */}
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-lg">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <div className="font-bold text-foreground">{testimonial.name}</div>
                        <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                        <div className="text-xs text-muted-foreground">{testimonial.location}</div>
                      </div>
                    </div>
                  </div>
                </Card3D>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="precios" className="py-32 relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <Badge variant="outline" className="mb-6 border-primary/30 bg-primary/5">
              <Crown className="w-4 h-4 mr-2" />
              Planes
            </Badge>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              Precios{" "}
              <span className="text-gradient-primary">simples</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Empezá gratis y escalá cuando estés listo. Sin compromisos.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card3D className="h-full">
                <div className="h-full bg-card/80 backdrop-blur border border-border/50 rounded-2xl p-8">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-foreground mb-2">Free</h3>
                    <div className="flex items-baseline justify-center gap-1 mb-2">
                      <span className="text-5xl font-bold text-foreground">Gratis</span>
                    </div>
                    <p className="text-muted-foreground">para siempre</p>
                  </div>
                  
                  <ul className="space-y-4 mb-8">
                    {[
                      "Dashboard completo",
                      "3 misiones/mes",
                      "5 oportunidades Radar/mes",
                      "Acciones diarias personalizadas",
                      "Diagnóstico de salud",
                    ].map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="w-full h-14 rounded-full"
                    onClick={() => navigate("/auth")}
                  >
                    Empezar gratis
                  </Button>
                </div>
              </Card3D>
            </motion.div>

            {/* Pro Plan */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card3D className="h-full">
                <div className="h-full relative bg-card border-2 border-primary rounded-2xl p-8 overflow-hidden">
                  {/* Glow */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-2xl blur-xl" />
                  
                  <div className="relative">
                    {/* Popular badge */}
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <Badge className="bg-gradient-to-r from-primary to-accent text-white px-4 py-1">
                        <Crown className="w-4 h-4 mr-1" />
                        Más popular
                      </Badge>
                    </div>
                    
                    <div className="text-center mb-8 pt-4">
                      <h3 className="text-2xl font-bold text-foreground mb-2">Pro</h3>
                      <div className="flex items-baseline justify-center gap-1 mb-2">
                        <span className="text-5xl font-bold text-foreground">$29.999</span>
                        <span className="text-muted-foreground">/año</span>
                      </div>
                      <p className="text-primary font-medium">2 meses gratis incluidos</p>
                    </div>
                    
                    <ul className="space-y-4 mb-8">
                      {[
                        "Todo lo del plan Free",
                        "Chat ilimitado con VistaCEO",
                        "Análisis de fotos y documentos",
                        "Radar I+D completo",
                        "Integración Google Reviews",
                        "Analytics avanzado",
                        "Soporte prioritario",
                      ].map((feature, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                          <span className="text-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <GlowingButton 
                      onClick={() => navigate("/auth?plan=pro_yearly")}
                      className="w-full justify-center"
                    >
                      Comenzar ahora
                      <ArrowRight className="w-5 h-5" />
                    </GlowingButton>
                  </div>
                </div>
              </Card3D>
            </motion.div>
          </div>

          {/* Guarantee */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-primary/10 border border-primary/20">
              <Shield className="w-5 h-5 text-primary" />
              <span className="text-foreground font-medium">Garantía de satisfacción de 7 días</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-32 bg-secondary/20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge variant="outline" className="mb-6 border-primary/30 bg-primary/5">
              FAQ
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">
              Preguntas frecuentes
            </h2>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-4">
            {[
              {
                q: "¿Cómo funciona el período de prueba?",
                a: "Al suscribirte al plan anual, obtenés 2 meses gratis. Si no estás satisfecho en los primeros 7 días, te devolvemos el 100% sin preguntas."
              },
              {
                q: "¿Qué tipo de negocios pueden usar VistaCEO?",
                a: "VistaCEO está optimizado para +180 tipos de negocios: gastronomía, retail, salud, servicios profesionales, turismo, educación, y muchos más."
              },
              {
                q: "¿Necesito conectar mis cuentas o sistemas?",
                a: "No es obligatorio. VistaCEO aprende de las respuestas que le das. Pero si conectás Google Reviews, Instagram o Facebook, la inteligencia se potencia."
              },
              {
                q: "¿Mis datos están seguros?",
                a: "Absolutamente. Usamos encriptación de grado bancario y nunca compartimos tu información con terceros."
              },
            ].map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card/80 backdrop-blur border border-border/50 rounded-2xl p-6 hover:border-primary/30 transition-colors"
              >
                <h3 className="font-bold text-lg text-foreground mb-3 flex items-start gap-3">
                  <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary text-sm">
                    {i + 1}
                  </span>
                  {faq.q}
                </h3>
                <p className="text-muted-foreground pl-11">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-primary/5 to-background" />
        <GradientOrb className="w-[600px] h-[600px] bg-primary/20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.05, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ duration: 4, repeat: Infinity }}
              className="inline-block mb-8"
            >
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Brain className="w-12 h-12 text-white" />
              </div>
            </motion.div>
            
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              ¿Listo para tu{" "}
              <span className="text-gradient-primary">CEO digital</span>?
            </h2>
            <p className="text-xl text-muted-foreground mb-12">
              Empezá gratis hoy y descubrí cómo VistaCEO puede transformar tu negocio.
            </p>
            
            <GlowingButton onClick={() => navigate("/auth")} className="text-lg px-12 py-6">
              Empezar gratis ahora
              <ArrowUpRight className="w-6 h-6" />
            </GlowingButton>
            
            <p className="text-sm text-muted-foreground mt-6 flex items-center justify-center gap-4">
              <span className="flex items-center gap-1.5">
                <Lock className="w-4 h-4" />
                Sin tarjeta de crédito
              </span>
              <span className="w-1 h-1 rounded-full bg-muted-foreground" />
              <span>Configuración en 5 min</span>
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <img src={logoDark} alt="VistaCEO" className="h-8 dark:hidden" />
              <img src={logoFull} alt="VistaCEO" className="h-8 hidden dark:block" />
            </div>
            
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Términos</a>
              <a href="#" className="hover:text-foreground transition-colors">Privacidad</a>
              <a href="#" className="hover:text-foreground transition-colors">Contacto</a>
            </div>
            
            <div className="text-sm text-muted-foreground">
              © 2024 VistaCEO. Todos los derechos reservados.
            </div>
          </div>
        </div>
      </footer>

      {/* Custom styles for shimmer animation */}
      <style>{`
        @keyframes shimmer {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </div>
  );
};

export default LandingUltra;
