import { motion } from "framer-motion";
import { Crown, Sparkles, Brain, BarChart3, Mic, Image, FileText, Zap, Lock, Unlock, TrendingUp, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const proFeatures = [
  { icon: BarChart3, title: "Analytics completo", description: "Métricas, tendencias y predicciones en tiempo real" },
  { icon: Brain, title: "IA Predictiva", description: "Anticipa problemas y oportunidades antes de que ocurran" },
  { icon: Mic, title: "Hablar con el CEO", description: "Conversaciones por voz, como con un socio real" },
  { icon: Image, title: "Análisis de fotos", description: "Enviá fotos y VistaCEO las analiza e interpreta" },
  { icon: FileText, title: "Documentos e informes", description: "Procesamiento de archivos y reportes ejecutivos" },
  { icon: TrendingUp, title: "Radar I+D avanzado", description: "Tendencias de mercado e inteligencia competitiva" },
];

export const ProExperienceSection = () => {
  const navigate = useNavigate();
  
  return (
    <section className="py-24 lg:py-32 relative overflow-hidden bg-secondary/30">
      {/* Top border gradient */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      
      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[250px] opacity-20"
        style={{ background: 'radial-gradient(circle, hsl(45, 93%, 47%, 0.3), transparent 70%)' }}
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
            {/* Pro badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-500 mb-6">
              <Crown className="w-5 h-5" />
              <span className="text-sm font-semibold">VistaCEO Pro</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-foreground mb-6 leading-tight">
              Desbloqueá el{" "}
              <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                cerebro completo
              </span>
            </h2>
            
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Pro no es "más funciones". Es el salto de tener un asistente a tener 
              un verdadero socio estratégico que piensa con vos.
            </p>
          </motion.div>

          {/* Features grid */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16"
          >
            {proFeatures.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative bg-card border border-border rounded-2xl p-6 hover:border-amber-500/30 transition-all duration-300"
              >
                {/* Glow on hover */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-amber-500" />
                  </div>
                  
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Unlock animation card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative max-w-2xl mx-auto"
          >
            <div className="relative bg-card border border-amber-500/20 rounded-3xl p-8 text-center overflow-hidden">
              {/* Animated border */}
              <div className="absolute inset-0 rounded-3xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 opacity-10 animate-shimmer" 
                  style={{ backgroundSize: '200% 100%' }}
                />
              </div>
              
              <div className="relative">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mb-6 shadow-lg"
                >
                  <Crown className="w-10 h-10 text-white" />
                </motion.div>
                
                <h3 className="text-2xl font-semibold text-foreground mb-4">
                  El momento de crecer es ahora
                </h3>
                
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Con Pro, cada decisión está respaldada por datos, predicciones y 
                  la inteligencia de un CEO que nunca descansa.
                </p>
                
                <Button 
                  size="xl" 
                  className="group bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg"
                  onClick={() => navigate("/auth?plan=pro_monthly")}
                >
                  Desbloquear Pro
                  <Unlock className="w-5 h-5 ml-2 group-hover:scale-110 transition-transform" />
                </Button>
                
                <p className="text-sm text-muted-foreground mt-4">
                  7 días de garantía. Si no ves valor, te devolvemos el 100%.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
