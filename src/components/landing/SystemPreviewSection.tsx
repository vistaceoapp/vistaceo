import { motion } from "framer-motion";
import { MockupAnalyticsDashboard } from "./mockups/MockupAnalyticsDashboard";
import { MockupMissionsView } from "./mockups/MockupMissionsView";

export const SystemPreviewSection = () => {
  return (
    <section className="py-16 lg:py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/10 to-background" />
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Section header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <span className="inline-block text-xs font-medium text-primary mb-3 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
            Así se ve VistaCEO
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 leading-tight">
            Tu negocio en <span className="text-gradient-primary">tiempo real</span>
          </h2>
          <p className="text-muted-foreground">
            Dashboard de salud, diagnóstico por dimensiones y misiones guiadas paso a paso.
          </p>
        </motion.div>

        {/* Analytics Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="max-w-5xl mx-auto mb-12"
        >
          <MockupAnalyticsDashboard />
          <p className="mt-4 text-sm text-muted-foreground text-center">
            <span className="font-medium text-foreground">Salud del Negocio</span> — Diagnóstico en 7 dimensiones con radar visual
          </p>
        </motion.div>

        {/* Missions View Preview */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="max-w-5xl mx-auto"
        >
          <MockupMissionsView />
          <p className="mt-4 text-sm text-muted-foreground text-center">
            <span className="font-medium text-foreground">Misiones Guiadas</span> — Plan de acción paso a paso con métricas de impacto
          </p>
        </motion.div>
      </div>
    </section>
  );
};
