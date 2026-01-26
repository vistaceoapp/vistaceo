import { motion } from "framer-motion";
import { Sparkles, CheckCircle2, Zap, Brain, Target, MessageSquare, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const freeFeatures = [
  { icon: Brain, text: "Diagnóstico completo de tu negocio" },
  { icon: Zap, text: "1 acción diaria priorizada" },
  { icon: Target, text: "3 misiones por mes" },
  { icon: MessageSquare, text: "Chat con VistaCEO (texto)" },
];

export const FreeExperienceSection = () => {
  const navigate = useNavigate();
  
  return (
    <section className="py-24 lg:py-32 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 border border-success/20 text-success mb-6">
                <Gift className="w-4 h-4" />
                <span className="text-sm font-medium">100% Gratis</span>
              </div>
              
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-foreground mb-6 leading-tight">
                Empezá gratis.{" "}
                <span className="text-gradient-primary">En serio.</span>
              </h2>
              
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                El plan Free no es un demo limitado. Es valor real: diagnóstico completo, 
                acciones diarias y la experiencia VistaCEO que genera resultados.
              </p>

              {/* Features */}
              <div className="space-y-4 mb-8">
                {freeFeatures.map((feature, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-4"
                  >
                    <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center flex-shrink-0">
                      <feature.icon className="w-5 h-5 text-success" />
                    </div>
                    <span className="text-foreground font-medium">{feature.text}</span>
                  </motion.div>
                ))}
              </div>

              <Button 
                variant="hero" 
                size="xl" 
                className="group"
                onClick={() => navigate("/auth")}
              >
                Comenzar gratis ahora
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <p className="text-sm text-muted-foreground mt-4">
                Sin tarjeta de crédito. Sin límite de tiempo.
              </p>
            </motion.div>

            {/* Right: Visual card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <div className="relative bg-card border border-border rounded-3xl p-8 shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-success" />
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-foreground">Plan Free</div>
                      <div className="text-sm text-muted-foreground">Todo esto incluido</div>
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-foreground">$0</div>
                </div>

                {/* Features list */}
                <div className="space-y-3 mb-6">
                  {[
                    "Dashboard completo",
                    "Análisis de tu negocio",
                    "Acción diaria personalizada",
                    "3 misiones estratégicas/mes",
                    "Chat con VistaCEO",
                    "Radar de oportunidades básico",
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                      <span className="text-foreground">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Note */}
                <div className="p-4 rounded-xl bg-success/5 border border-success/20">
                  <p className="text-sm text-muted-foreground">
                    <span className="text-success font-medium">El Free no es demo.</span>{" "}
                    Es valor real que ya genera resultados en miles de negocios.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
