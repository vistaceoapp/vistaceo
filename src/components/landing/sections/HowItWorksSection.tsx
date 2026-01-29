import { memo, useState } from "react";
import { Check, ArrowRight, Brain, Radar, Target, Zap, TrendingUp, BarChart3, Lightbulb, Search, Heart, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// Import real mockup components  
import { MockupProDashboard } from "@/components/landing/mockups/MockupProDashboard";
import { MockupProMissions } from "@/components/landing/mockups/MockupProMissions";
import { MockupProRadar } from "@/components/landing/mockups/MockupProRadar";
import { MockupProChat } from "@/components/landing/mockups/MockupProChat";
import { MockupProAnalytics } from "@/components/landing/mockups/MockupProAnalytics";

// Import business photos
import parrillaImg from "@/assets/testimonials/parrilla-argentina.jpg";
import boutiqueImg from "@/assets/testimonials/boutique-moda.jpg";

const steps = [
  {
    number: "01",
    icon: Brain,
    title: "Conectás tu negocio",
    description: "Elegí tu tipo de negocio y país. VistaCEO crea tu perfil inteligente en minutos.",
    details: [
      "+180 tipos de negocio soportados",
      "Restaurantes, clínicas, tiendas, servicios...",
      "Sin tarjeta de crédito",
    ],
  },
  {
    number: "02",
    icon: Radar,
    title: "El Radar detecta oportunidades",
    description: "Dos motores de inteligencia trabajan 24/7 para encontrar lo que vos no ves.",
    details: [
      "Radar Interno: analiza TUS datos",
      "Radar I+D: tendencias del mercado",
      "Oportunidades priorizadas por impacto",
    ],
  },
  {
    number: "03",
    icon: Zap,
    title: "Recibís acciones cada día",
    description: "Cada mañana, acciones concretas con contexto, pasos claros y impacto estimado.",
    details: [
      "Basadas en diagnóstico real",
      "Tiempo estimado incluido",
      "Impacto económico calculado",
    ],
  },
  {
    number: "04",
    icon: Target,
    title: "Transformás en misiones",
    description: "Convertí oportunidades en misiones con guía paso a paso.",
    details: [
      "Guía detallada para cada objetivo",
      "Ventas, reputación, eficiencia...",
      "El sistema aprende de vos",
    ],
  },
];

const improvementAreas = [
  { icon: TrendingUp, label: "Ventas" },
  { icon: BarChart3, label: "Finanzas" },
  { icon: Lightbulb, label: "Marketing" },
  { icon: Search, label: "Reputación" },
  { icon: Zap, label: "Eficiencia" },
];

// Interactive tabs with real mockups - now 5 tabs
const mockupTabs = [
  { 
    key: "salud", 
    label: "Salud", 
    sub: "Diagnóstico",
    icon: Heart
  },
  { 
    key: "misiones", 
    label: "Misiones", 
    sub: "Paso a paso",
    icon: Target
  },
  { 
    key: "radar", 
    label: "Radar", 
    sub: "Oportunidades",
    icon: Radar
  },
  { 
    key: "chat", 
    label: "Chat CEO", 
    sub: "Mentor 24/7",
    icon: MessageCircle
  },
  { 
    key: "analytics", 
    label: "Métricas", 
    sub: "Evolución",
    icon: BarChart3
  },
] as const;

type TabKey = typeof mockupTabs[number]["key"];

// Business profiles with photos
const businesses = {
  mexico: {
    name: "Boutique Carmela",
    location: "Polanco, CDMX",
    type: "Retail / Moda",
    image: boutiqueImg,
  },
  argentina: {
    name: "Parrilla Don Martín",
    location: "Palermo, Buenos Aires",
    type: "Restaurante / Parrilla",
    image: parrillaImg,
  }
};

const StepCard = memo(({ step, index }: { step: typeof steps[0]; index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.1 }}
    className="relative bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-5 md:p-6 hover:border-primary/30 transition-colors"
  >
    <div className="absolute -top-3 -left-3 w-9 h-9 md:w-10 md:h-10 rounded-xl gradient-primary flex items-center justify-center font-bold text-xs md:text-sm text-white shadow-lg">
      {step.number}
    </div>
    
    <div className="w-11 h-11 md:w-12 md:h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3 md:mb-4 mt-2">
      <step.icon className="w-5 h-5 md:w-6 md:h-6 text-primary" aria-hidden="true" />
    </div>
    
    <h3 className="text-lg md:text-xl font-bold text-foreground mb-2">{step.title}</h3>
    <p className="text-muted-foreground text-sm mb-3 md:mb-4">{step.description}</p>

    <ul className="space-y-1.5 md:space-y-2">
      {step.details.map((detail) => (
        <li key={detail} className="flex items-start gap-2 text-xs md:text-sm">
          <Check className="w-3.5 h-3.5 md:w-4 md:h-4 text-success shrink-0 mt-0.5" aria-hidden="true" />
          <span className="text-foreground/80">{detail}</span>
        </li>
      ))}
    </ul>
  </motion.div>
));
StepCard.displayName = "StepCard";

export const HowItWorksSection = memo(() => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>("salud");
  const [activeBusiness, setActiveBusiness] = useState<"argentina" | "mexico">("mexico");

  const currentBusiness = businesses[activeBusiness];

  return (
    <section id="how-it-works" className="py-16 md:py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/20 to-background pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-12 md:mb-16"
        >
          <span className="inline-block text-sm font-medium text-primary mb-4 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20">
            Cómo funciona
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 leading-tight">
            Inteligencia que <span className="text-gradient-primary">trabaja para vos</span>
          </h2>
          <p className="text-base md:text-lg text-muted-foreground">
            Un sistema que diagnostica, detecta oportunidades y te guía paso a paso.
          </p>
        </motion.div>

        {/* Business selector with PROMINENT photos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto mb-8"
        >
          <p className="text-center text-sm text-muted-foreground mb-4">
            Explorá cómo se ve para diferentes negocios:
          </p>
          <div className="grid grid-cols-2 gap-3">
            {(["mexico", "argentina"] as const).map((key) => {
              const biz = businesses[key];
              const isActive = activeBusiness === key;
              return (
                <button
                  key={key}
                  onClick={() => setActiveBusiness(key)}
                  className={cn(
                    "relative overflow-hidden rounded-2xl border-2 transition-all p-0",
                    isActive 
                      ? "border-primary shadow-lg shadow-primary/20 ring-2 ring-primary/20" 
                      : "border-border hover:border-primary/30"
                  )}
                >
                  {/* Business photo */}
                  <div className="relative h-24 sm:h-32">
                    <img 
                      src={biz.image} 
                      alt={biz.name} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    
                    {/* Business info overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 text-left">
                      <div className="font-bold text-white text-sm sm:text-base">{biz.name}</div>
                      <div className="text-white/70 text-xs">{biz.location}</div>
                    </div>

                    {/* Active indicator */}
                    {isActive && (
                      <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-4 h-4 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Interactive tabs (tap-to-switch) - 5 tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto mb-8"
        >
          <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
            {mockupTabs.map((tab) => {
              const isActive = tab.key === activeTab;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    "text-center rounded-xl border px-2 py-2.5 sm:px-3 sm:py-3 transition-all",
                    isActive
                      ? "border-primary bg-primary/10 shadow-lg shadow-primary/10"
                      : "border-border bg-card/60 hover:border-primary/20 hover:bg-secondary/50"
                  )}
                >
                  <Icon className={cn(
                    "w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )} />
                  <div className={cn(
                    "text-[10px] sm:text-xs font-semibold truncate",
                    isActive ? "text-primary" : "text-foreground"
                  )}>
                    {tab.label}
                  </div>
                  <div className="text-[8px] sm:text-[10px] text-muted-foreground truncate hidden sm:block">
                    {tab.sub}
                  </div>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Main Mockup Display - Animated switching */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-lg mx-auto mb-16 md:mb-20"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeTab}-${activeBusiness}`}
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === "salud" && (
                <MockupProDashboard business={activeBusiness} />
              )}
              {activeTab === "misiones" && (
                <MockupProMissions business={activeBusiness} />
              )}
              {activeTab === "radar" && (
                <MockupProRadar business={activeBusiness} />
              )}
              {activeTab === "chat" && (
                <MockupProChat business={activeBusiness} />
              )}
              {activeTab === "analytics" && (
                <MockupProAnalytics business={activeBusiness} />
              )}
            </motion.div>
          </AnimatePresence>
          
          <p className="mt-4 text-sm text-muted-foreground text-center">
            <span className="font-medium text-foreground">
              {activeTab === "salud" && "Salud del Negocio"}
              {activeTab === "misiones" && "Misiones Estratégicas"}
              {activeTab === "radar" && "Radar de Oportunidades"}
              {activeTab === "chat" && "Chat CEO"}
              {activeTab === "analytics" && "Analíticas Avanzadas"}
            </span>
            {" — "}
            {activeTab === "salud" && "Diagnóstico integral en tiempo real"}
            {activeTab === "misiones" && "Guías ultra personalizadas paso a paso"}
            {activeTab === "radar" && "Detectando lo que vos no ves"}
            {activeTab === "chat" && "Tu mentor estratégico disponible 24/7"}
            {activeTab === "analytics" && "Métricas y evolución de tu negocio"}
          </p>
        </motion.div>

        {/* Steps Grid */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-12 md:mb-16">
          {steps.map((step, index) => (
            <StepCard key={step.number} step={step} index={index} />
          ))}
        </div>

        {/* Improvement areas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center mb-10 md:mb-12"
        >
          <p className="text-sm text-muted-foreground mb-4">Áreas que podés mejorar</p>
          <div className="flex flex-wrap justify-center gap-2 md:gap-3">
            {improvementAreas.map((area) => (
              <div
                key={area.label}
                className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-secondary/80 border border-border"
              >
                <area.icon className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" aria-hidden="true" />
                <span className="text-xs md:text-sm font-medium text-foreground">{area.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Button 
            size="lg" 
            className="gradient-primary text-primary-foreground rounded-full px-8 py-6 text-base md:text-lg font-semibold shadow-xl shadow-primary/25"
            onClick={() => navigate("/auth")}
          >
            Empezar gratis ahora
            <ArrowRight className="w-5 h-5 ml-2" aria-hidden="true" />
          </Button>
          <p className="text-xs text-muted-foreground mt-3">
            Sin tarjeta • 3 min de setup • Valor desde el día 1
          </p>
        </motion.div>
      </div>
    </section>
  );
});

HowItWorksSection.displayName = "HowItWorksSection";
export default HowItWorksSection;
