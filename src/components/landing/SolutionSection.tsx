import { motion } from "framer-motion";
import { Sparkles, Brain, Zap, Target, TrendingUp, Shield } from "lucide-react";
import { VistaceoLogo } from "@/components/ui/VistaceoLogo";

const benefits = [
  { icon: Brain, text: "Analiza tu negocio 24/7" },
  { icon: Target, text: "Prioriza lo importante" },
  { icon: Zap, text: "Acciones claras, no datos" },
  { icon: TrendingUp, text: "Mejora medible y real" },
  { icon: Shield, text: "Decisiones con respaldo" },
];

export const SolutionSection = () => {
  return (
    <section className="py-24 lg:py-32 relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/[0.02] to-background" />
      
      {/* Glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[200px] opacity-30"
        style={{ background: 'radial-gradient(circle, hsl(204, 79%, 50%, 0.15), transparent 70%)' }}
      />
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
          {/* Left: Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary mb-6">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">La solución</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-foreground mb-6 leading-tight">
              VistaCEO convierte{" "}
              <span className="text-gradient-primary">complejidad</span>{" "}
              en claridad accionable
            </h2>
            
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Imagina tener un socio estratégico que nunca duerme, que conoce tu negocio 
              en profundidad y te dice exactamente qué hacer cada día para crecer.
            </p>

            {/* Benefits list */}
            <div className="space-y-4">
              {benefits.map((benefit, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-4"
                >
                  <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
                    <benefit.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-foreground font-medium">{benefit.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right: Visual */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            {/* Main card */}
            <div className="relative bg-card border border-border rounded-3xl p-8 shadow-xl">
              {/* Animated border */}
              <div className="absolute -inset-[1px] rounded-3xl bg-gradient-to-r from-primary via-accent to-primary opacity-20 blur-sm animate-pulse-slow" />
              
              <div className="relative">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                  <VistaceoLogo size={48} variant="icon" className="animate-float" />
                  <div>
                    <div className="text-sm text-muted-foreground">VistaCEO dice:</div>
                    <div className="text-lg font-semibold text-foreground">Tu visión estratégica</div>
                  </div>
                </div>

                {/* Mock UI */}
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-success/10 border border-success/20">
                    <div className="flex items-center gap-3 mb-2">
                      <TrendingUp className="w-5 h-5 text-success" />
                      <span className="font-medium text-success">Oportunidad detectada</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Tus ventas de los martes cayeron 23%. Sugerencia: lanzar promoción "Martes VIP".
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-secondary border border-border">
                    <div className="text-sm font-medium text-foreground mb-2">Próxima acción:</div>
                    <p className="text-sm text-muted-foreground">
                      Contactar a 3 clientes que no compraron en 30 días
                    </p>
                    <div className="mt-3 flex gap-2">
                      <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                        +$4,500 potencial
                      </div>
                      <div className="px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium">
                        15 min
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Precisión de recomendaciones</span>
                    <span className="font-semibold text-primary">94%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating elements */}
            <motion.div
              animate={{ y: [-5, 5, -5] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-4 -right-4 w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center shadow-lg"
            >
              <Brain className="w-10 h-10 text-white" />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
