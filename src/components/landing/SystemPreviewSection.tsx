import { motion } from "framer-motion";
import { MockupDashboard } from "./mockups/MockupDashboard";
import { MockupRadar } from "./mockups/MockupRadar";
import { MockupMissions } from "./mockups/MockupMissions";

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
            Inteligencia activa <span className="text-gradient-primary">24/7</span>
          </h2>
          <p className="text-muted-foreground">
            Dashboard de salud, radar de oportunidades y misiones guiadas. Todo en un solo lugar.
          </p>
        </motion.div>

        {/* Mockups Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Dashboard */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="flex flex-col items-center"
          >
            <MockupDashboard />
            <p className="mt-4 text-sm text-muted-foreground text-center">
              <span className="font-medium text-foreground">Salud del Negocio</span> — Score en tiempo real
            </p>
          </motion.div>

          {/* Radar */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center"
          >
            <MockupRadar />
            <p className="mt-4 text-sm text-muted-foreground text-center">
              <span className="font-medium text-foreground">Radar I+D</span> — Oportunidades detectadas
            </p>
          </motion.div>

          {/* Missions */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="flex flex-col items-center md:col-span-2 lg:col-span-1"
          >
            <MockupMissions />
            <p className="mt-4 text-sm text-muted-foreground text-center">
              <span className="font-medium text-foreground">Misiones</span> — Guía paso a paso
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
