import { motion } from "framer-motion";
import { Crown, MessageSquare, FileImage, Radar, Star, HeadphonesIcon, BarChart3, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const proFeatures = [
  { 
    icon: MessageSquare, 
    title: "Chat ultra-inteligente con VistaCEO",
    description: "Hablá con tu CEO digital por texto o voz. Respuestas personalizadas a tu negocio."
  },
  { 
    icon: FileImage, 
    title: "Análisis de fotos, documentos y reportes",
    description: "Enviá facturas, menús, reportes. VistaCEO los analiza y te da insights."
  },
  { 
    icon: Radar, 
    title: "Radar I+D completo e ilimitado",
    description: "Detectá oportunidades de mercado, tendencias y competencia en tiempo real."
  },
  { 
    icon: Star, 
    title: "Integración con Google Reviews",
    description: "Analizá automáticamente tus reseñas y recibí acciones para mejorar tu reputación."
  },
  { 
    icon: HeadphonesIcon, 
    title: "Soporte prioritario",
    description: "Atención preferencial cuando lo necesites. Respuestas en menos de 24hs."
  },
  { 
    icon: BarChart3, 
    title: "Analytics avanzado",
    description: "Métricas profundas, predicciones IA y evolución de tu negocio en el tiempo."
  },
];

export const ProExperienceSection = () => {
  const navigate = useNavigate();
  
  return (
    <section className="py-24 lg:py-32 relative overflow-hidden bg-secondary/30">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[200px] opacity-30"
        style={{ background: 'radial-gradient(circle, hsl(204, 79%, 50%, 0.15), transparent 70%)' }}
      />
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            {/* Pro Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary to-accent text-white mb-6">
              <Crown className="w-5 h-5" />
              <span className="text-sm font-semibold">VistaCEO Pro</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
              Desbloqueá el{" "}
              <span className="text-gradient-primary">cerebro completo</span>
            </h2>
            
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Todo lo del plan Free, más las herramientas avanzadas que usan 
              los negocios que más crecen.
            </p>
          </motion.div>

          {/* Features grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {proFeatures.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative"
              >
                {/* Card */}
                <div className="relative h-full bg-card border border-border rounded-2xl p-6 hover:border-primary/50 transition-colors">
                  {/* Icon */}
                  <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Button 
              variant="hero" 
              size="xl" 
              className="group"
              onClick={() => navigate("/auth?plan=pro_yearly")}
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Comenzar con 2 meses gratis
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <p className="text-sm text-muted-foreground mt-4">
              Plan anual. 7 días de garantía. Cancelás cuando quieras.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
