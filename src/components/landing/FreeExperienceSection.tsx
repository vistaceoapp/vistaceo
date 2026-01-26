import { motion } from "framer-motion";
import { CheckCircle2, Zap, Brain, Target, BarChart3, Lightbulb, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const freeFeatures = [
  { icon: BarChart3, text: "Dashboard completo" },
  { icon: Brain, text: "Análisis de tu negocio" },
  { icon: Zap, text: "Acciones diarias personalizadas" },
  { icon: Target, text: "3 misiones estratégicas/mes" },
  { icon: Lightbulb, text: "5 oportunidades del Radar/mes" },
  { icon: Lightbulb, text: "5 investigaciones I+D/mes" },
];

export const FreeExperienceSection = () => {
  const navigate = useNavigate();
  
  return (
    <section className="py-24 lg:py-32 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 border border-success/20 text-success mb-6">
                <Gift className="w-4 h-4" />
                <span className="text-sm font-semibold">100% Gratis — Para siempre</span>
              </div>
              
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
                Empezá gratis.{" "}
                <span className="text-gradient-primary">En serio.</span>
              </h2>
              
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                El plan Free no es un demo limitado. Es{" "}
                <span className="text-foreground font-semibold">valor real</span>: 
                diagnóstico completo, acciones diarias y la experiencia VistaCEO 
                que ya genera resultados en miles de negocios.
              </p>

              {/* Features grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {freeFeatures.map((feature, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50 border border-border"
                  >
                    <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
                      <feature.icon className="w-5 h-5 text-success" />
                    </div>
                    <span className="text-foreground font-medium text-sm">{feature.text}</span>
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
              <div className="relative">
                {/* Glow effect */}
                <div className="absolute -inset-4 bg-gradient-to-r from-success/20 to-primary/20 rounded-3xl blur-2xl opacity-50" />
                
                <div className="relative bg-card border border-border rounded-3xl p-8 shadow-2xl">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-success/10 flex items-center justify-center">
                        <Gift className="w-7 h-7 text-success" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-foreground">Plan Free</div>
                        <div className="text-sm text-muted-foreground">Todo esto incluido</div>
                      </div>
                    </div>
                    <div className="text-4xl font-bold text-foreground">$0</div>
                  </div>

                  {/* Features list */}
                  <div className="space-y-4 mb-8">
                    {[
                      "Dashboard completo",
                      "Análisis de tu negocio",
                      "Acciones diarias personalizadas",
                      "3 misiones estratégicas/mes",
                      "5 oportunidades del Radar/mes",
                      "5 investigaciones I+D/mes",
                    ].map((feature, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                        <span className="text-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-border mb-6" />

                  {/* Note */}
                  <div className="p-4 rounded-xl bg-success/5 border border-success/20">
                    <p className="text-sm text-muted-foreground">
                      <span className="text-success font-semibold">El Free no es demo.</span>{" "}
                      Es valor real que ya genera resultados en miles de negocios.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
