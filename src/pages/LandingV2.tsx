import { motion, useScroll, useTransform } from "framer-motion";
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
  Clock,
  TrendingUp,
  Users,
  Crown,
  Play,
  ChevronDown,
  Sun,
  Moon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useRef } from "react";

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

const LandingV2 = () => {
  const navigate = useNavigate();
  const [isDarkPreview, setIsDarkPreview] = useState(true);
  const heroRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

  const stats = [
    { value: "500+", label: "Negocios activos" },
    { value: "+32%", label: "Crecimiento promedio" },
    { value: "7", label: "Dimensiones de salud" },
    { value: "24/7", label: "CEO Digital activo" },
  ];

  const features = [
    {
      icon: Brain,
      title: "Cerebro del Negocio",
      description: "IA que aprende de tu operación diaria y te conoce mejor cada día. Memoriza decisiones, patrones de éxito y preferencias.",
      color: "from-violet-500 to-purple-600"
    },
    {
      icon: Target,
      title: "Misiones Estratégicas",
      description: "Planes de acción paso a paso generados por IA. Cada misión tiene impacto medible y tiempo estimado.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Radar,
      title: "Radar I+D",
      description: "Detecta oportunidades de mercado, tendencias y movimientos de competencia en tiempo real.",
      color: "from-emerald-500 to-green-500"
    },
    {
      icon: MessageSquare,
      title: "Chat con tu CEO",
      description: "Mentor ejecutivo disponible 24/7 por texto o voz. Analiza fotos, documentos y reportes.",
      color: "from-orange-500 to-amber-500"
    },
    {
      icon: BarChart3,
      title: "Salud del Negocio",
      description: "Diagnóstico en 7 dimensiones: Ventas, Equipo, Finanzas, Eficiencia, Reputación, Crecimiento y Rentabilidad.",
      color: "from-pink-500 to-rose-500"
    },
    {
      icon: Zap,
      title: "Acciones Diarias",
      description: "Cada día recibís las 3 acciones de mayor impacto personalizadas para tu negocio.",
      color: "from-yellow-500 to-orange-500"
    },
  ];

  const screenshots = [
    { 
      img: dashboardMainImg, 
      title: "Dashboard Principal", 
      description: "Vista general de tu negocio con métricas clave y acciones prioritarias",
      badge: "Vista General"
    },
    { 
      img: analyticsSaludImg, 
      title: "Salud del Negocio", 
      description: "Diagnóstico en 7 dimensiones con radar visual y métricas detalladas",
      badge: "Analytics"
    },
    { 
      img: misionesImg, 
      title: "Misiones Estratégicas", 
      description: "Planes de acción paso a paso con impacto estimado y seguimiento de progreso",
      badge: "Misiones"
    },
    { 
      img: ceoChatImg, 
      title: "Chat con VistaCEO", 
      description: "Tu mentor ejecutivo disponible 24/7 para consultas estratégicas",
      badge: "Chat IA"
    },
    { 
      img: radarInternoImg, 
      title: "Radar Interno", 
      description: "Detecta oportunidades dentro de tu operación basadas en datos reales",
      badge: "Radar"
    },
    { 
      img: radarExternoImg, 
      title: "Radar Externo (I+D)", 
      description: "Investigación de mercado, tendencias y movimientos de competencia",
      badge: "I+D"
    },
  ];

  const testimonials = [
    {
      name: "Martín Rodríguez",
      role: "Dueño de Parrilla Don Martín",
      location: "Buenos Aires, Argentina",
      quote: "En 3 meses aumenté mis ventas un 28%. VistaCEO me mostró oportunidades que nunca hubiera visto solo.",
      avatar: "MR"
    },
    {
      name: "Carolina Méndez",
      role: "Fundadora de Boutique Carmela",
      location: "Ciudad de México, México",
      quote: "Es como tener un consultor de negocios disponible las 24 horas. Las misiones son muy accionables.",
      avatar: "CM"
    },
    {
      name: "Diego Fernández",
      role: "Gerente de Clínica Dental Sonrisas",
      location: "Santiago, Chile",
      quote: "El diagnóstico de salud del negocio me abrió los ojos. Ahora tomo decisiones con datos, no intuición.",
      avatar: "DF"
    },
  ];

  const pricingPlans = [
    {
      name: "Free",
      price: "Gratis",
      period: "para siempre",
      description: "Ideal para empezar a conocer tu negocio",
      features: [
        "Dashboard completo",
        "3 misiones/mes",
        "5 oportunidades Radar/mes",
        "Acciones diarias personalizadas",
        "Diagnóstico de salud",
      ],
      cta: "Empezar gratis",
      popular: false
    },
    {
      name: "Pro",
      price: "$29.999",
      period: "/año",
      description: "El cerebro completo para tu negocio",
      features: [
        "Todo lo del plan Free",
        "Chat ilimitado con VistaCEO",
        "Análisis de fotos y documentos",
        "Radar I+D completo",
        "Integración Google Reviews",
        "Analytics avanzado",
        "Soporte prioritario",
      ],
      cta: "Comenzar con 2 meses gratis",
      popular: true,
      badge: "Más popular"
    },
  ];

  const faqs = [
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
  ];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 md:h-20">
            <div className="flex items-center gap-2">
              <img 
                src={logoDark} 
                alt="VistaCEO" 
                className="h-8 md:h-10 dark:hidden"
              />
              <img 
                src={logoFull} 
                alt="VistaCEO" 
                className="h-8 md:h-10 hidden dark:block"
              />
            </div>
            
            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Características
              </a>
              <a href="#product" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Producto
              </a>
              <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Precios
              </a>
              <a href="#faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                FAQ
              </a>
            </nav>
            
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate("/auth")}
              >
                Iniciar sesión
              </Button>
              <Button 
                size="sm"
                className="gradient-primary text-white"
                onClick={() => navigate("/auth")}
              >
                Empezar gratis
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section 
        ref={heroRef}
        className="relative pt-32 md:pt-40 pb-20 md:pb-32 overflow-hidden"
      >
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
        <div className="absolute top-20 left-1/4 w-[500px] h-[500px] rounded-full blur-[150px] opacity-20 bg-primary" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full blur-[150px] opacity-15 bg-accent" />
        
        <motion.div 
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="container mx-auto px-4 sm:px-6 relative z-10"
        >
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm">
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                +500 negocios ya están creciendo
              </Badge>
            </motion.div>
            
            {/* Main headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-[1.1] tracking-tight"
            >
              Tu negocio merece un{" "}
              <span className="text-gradient-primary">CEO digital</span>
            </motion.h1>
            
            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed"
            >
              Inteligencia artificial que diagnostica, planifica y te guía paso a paso 
              para hacer crecer tu negocio. Sin consultores caros. Sin perder tiempo.
            </motion.p>
            
            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
            >
              <Button 
                size="lg"
                className="gradient-primary text-white px-8 h-14 text-base group"
                onClick={() => navigate("/auth")}
              >
                Empezar gratis
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="px-8 h-14 text-base"
              >
                <Play className="w-5 h-5 mr-2" />
                Ver demo en 2 min
              </Button>
            </motion.div>
            
            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8"
            >
              {stats.map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-foreground mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </motion.div>
        
        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
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

      {/* Product Screenshots Section */}
      <section id="product" className="py-20 md:py-32 bg-secondary/30">
        <div className="container mx-auto px-4 sm:px-6">
          {/* Section header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <Badge variant="outline" className="mb-4">
              Producto
            </Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Un sistema completo para{" "}
              <span className="text-gradient-primary">tu negocio</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Dashboard profesional, IA avanzada y herramientas de crecimiento. 
              Todo en un solo lugar.
            </p>
          </motion.div>

          {/* Main screenshot */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
              <div className="relative max-w-6xl mx-auto">
              {/* Browser frame */}
              <div className="bg-card rounded-2xl border border-border shadow-2xl overflow-hidden">
                {/* Browser header */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/50">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-destructive/80" />
                    <div className="w-3 h-3 rounded-full bg-accent/80" />
                    <div className="w-3 h-3 rounded-full bg-primary/80" />
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="px-4 py-1 rounded-full bg-background text-xs text-muted-foreground">
                      app.vistaceo.com
                    </div>
                  </div>
                  <div className="w-16" />
                </div>
                {/* Screenshot */}
                <img 
                  src={analyticsSaludImg} 
                  alt="VistaCEO Dashboard - Salud del Negocio" 
                  className="w-full"
                />
              </div>
              
              {/* Floating badge */}
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground px-4 py-2 shadow-lg">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Diagnóstico en 7 dimensiones
                </Badge>
              </div>
            </div>
          </motion.div>

          {/* Screenshot grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {screenshots.slice(0, 6).map((screenshot, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group"
              >
                <div className="bg-card rounded-xl border border-border overflow-hidden hover:border-primary/50 transition-all hover:shadow-xl">
                  {/* Image */}
                  <div className="relative overflow-hidden">
                    <img 
                      src={screenshot.img} 
                      alt={screenshot.title}
                      className="w-full aspect-[16/10] object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge variant="secondary" className="text-xs">
                        {screenshot.badge}
                      </Badge>
                    </div>
                  </div>
                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-semibold text-foreground mb-1">
                      {screenshot.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {screenshot.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-32">
        <div className="container mx-auto px-4 sm:px-6">
          {/* Section header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <Badge variant="outline" className="mb-4">
              Características
            </Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Todo lo que necesitás para{" "}
              <span className="text-gradient-primary">crecer</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Herramientas de IA diseñadas específicamente para dueños de negocios 
              que quieren resultados sin complicaciones.
            </p>
          </motion.div>

          {/* Features grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative"
              >
                <div className="h-full bg-card border border-border rounded-2xl p-6 md:p-8 hover:border-primary/50 transition-all hover:shadow-lg">
                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 md:py-32 bg-secondary/30">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <Badge variant="outline" className="mb-4">
              Cómo funciona
            </Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              De cero a resultados en{" "}
              <span className="text-gradient-primary">15 minutos</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                step: "01",
                title: "Contanos tu negocio",
                description: "Respondé algunas preguntas sobre tu operación. VistaCEO aprende tu contexto único.",
                icon: Users
              },
              {
                step: "02",
                title: "Recibí tu diagnóstico",
                description: "Obtenés un análisis completo de las 7 dimensiones de salud de tu negocio.",
                icon: BarChart3
              },
              {
                step: "03",
                title: "Ejecutá y crecé",
                description: "Seguí las misiones y acciones diarias. Medí tu progreso en tiempo real.",
                icon: TrendingUp
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative text-center"
              >
                {/* Connector line */}
                {i < 2 && (
                  <div className="hidden md:block absolute top-16 left-[60%] w-[80%] h-0.5 bg-border" />
                )}
                
                {/* Step number */}
                <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-card border-2 border-primary/20 flex items-center justify-center relative">
                  <item.icon className="w-12 h-12 text-primary" />
                  <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white font-bold text-sm">
                    {item.step}
                  </div>
                </div>
                
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {item.title}
                </h3>
                <p className="text-muted-foreground">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof / Testimonials */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <Badge variant="outline" className="mb-4">
              Testimonios
            </Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Negocios que ya están{" "}
              <span className="text-gradient-primary">creciendo</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {testimonials.map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card border border-border rounded-2xl p-6 md:p-8"
              >
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-5 h-5 fill-accent text-accent" />
                  ))}
                </div>
                
                {/* Quote */}
                <p className="text-foreground mb-6 leading-relaxed">
                  "{testimonial.quote}"
                </p>
                
                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-white font-semibold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {testimonial.role}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {testimonial.location}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 md:py-32 bg-secondary/30">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <Badge variant="outline" className="mb-4">
              Precios
            </Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Planes para cada{" "}
              <span className="text-gradient-primary">etapa</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Empezá gratis y escalá cuando estés listo. Sin compromisos.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {pricingPlans.map((plan, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`relative bg-card border rounded-2xl p-6 md:p-8 ${
                  plan.popular ? 'border-primary shadow-xl shadow-primary/10' : 'border-border'
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground px-4">
                      <Crown className="w-3.5 h-3.5 mr-1.5" />
                      {plan.badge}
                    </Badge>
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-foreground">
                      {plan.price}
                    </span>
                    <span className="text-muted-foreground">
                      {plan.period}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {plan.description}
                  </p>
                </div>
                
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className={`w-full h-12 ${plan.popular ? 'gradient-primary text-white' : ''}`}
                  variant={plan.popular ? "default" : "outline"}
                  onClick={() => navigate(plan.popular ? "/auth?plan=pro_yearly" : "/auth")}
                >
                  {plan.cta}
                  {plan.popular && <ArrowRight className="w-4 h-4 ml-2" />}
                </Button>
              </motion.div>
            ))}
          </div>

          {/* Guarantee */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary">
              <Shield className="w-4 h-4" />
              <span className="text-sm font-medium">Garantía de satisfacción de 7 días</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 md:py-32">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <Badge variant="outline" className="mb-4">
              FAQ
            </Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Preguntas frecuentes
            </h2>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-card border border-border rounded-xl p-6"
              >
                <h3 className="font-semibold text-foreground mb-2">
                  {faq.q}
                </h3>
                <p className="text-muted-foreground">
                  {faq.a}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 md:py-32 bg-gradient-to-b from-primary/10 via-primary/5 to-background">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              ¿Listo para tener tu{" "}
              <span className="text-gradient-primary">CEO digital</span>?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Empezá gratis hoy y descubrí cómo VistaCEO puede transformar tu negocio.
            </p>
            <Button 
              size="lg"
              className="gradient-primary text-white px-10 h-14 text-base group"
              onClick={() => navigate("/auth")}
            >
              Empezar gratis ahora
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <p className="text-sm text-muted-foreground mt-4">
              Sin tarjeta de crédito. Configuración en 5 minutos.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <img 
                src={logoDark} 
                alt="VistaCEO" 
                className="h-8 dark:hidden"
              />
              <img 
                src={logoFull} 
                alt="VistaCEO" 
                className="h-8 hidden dark:block"
              />
            </div>
            
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">
                Términos
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Privacidad
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Contacto
              </a>
            </div>
            
            <div className="text-sm text-muted-foreground">
              © 2024 VistaCEO. Todos los derechos reservados.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingV2;
