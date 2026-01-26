import { motion } from "framer-motion";
import { Shield, Undo2, Clock, HeartHandshake } from "lucide-react";

const guarantees = [
  {
    icon: Undo2,
    title: "7 días de garantía",
    description: "Si no ves valor real en 7 días, te devolvemos el 100%. Sin preguntas.",
  },
  {
    icon: Clock,
    title: "Cancelá cuando quieras",
    description: "Sin contratos. Sin permanencias. Cancelás con un click.",
  },
  {
    icon: HeartHandshake,
    title: "Soporte humano real",
    description: "Personas reales que entienden tu negocio. No bots genéricos.",
  },
];

export const GuaranteeSection = () => {
  return (
    <section className="py-24 lg:py-32 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <div className="relative bg-card border border-success/20 rounded-3xl p-8 lg:p-12 text-center overflow-hidden">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-success/5 via-transparent to-success/5" />
            
            <div className="relative">
              {/* Shield icon */}
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="w-20 h-20 mx-auto rounded-2xl bg-success/10 border border-success/20 flex items-center justify-center mb-8"
              >
                <Shield className="w-10 h-10 text-success" />
              </motion.div>
              
              <h2 className="text-3xl sm:text-4xl font-semibold text-foreground mb-4">
                Probalo sin riesgo
              </h2>
              
              <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
                Si VistaCEO Pro no genera valor real para tu negocio en los primeros 7 días, 
                te devolvemos el 100% de tu inversión. Sin excusas, sin letras pequeñas.
              </p>

              {/* Guarantees grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {guarantees.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-secondary/50 border border-border rounded-2xl p-6"
                  >
                    <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center mx-auto mb-4">
                      <item.icon className="w-6 h-6 text-success" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
