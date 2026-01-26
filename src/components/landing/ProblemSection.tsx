import { motion } from "framer-motion";
import { AlertTriangle, Clock, TrendingDown, Target, XCircle } from "lucide-react";

const problems = [
  {
    icon: Clock,
    title: "Decisiones reactivas",
    description: "Respondés a emergencias en vez de anticiparte a oportunidades.",
  },
  {
    icon: Target,
    title: "Falta de foco",
    description: "100 tareas pendientes, ninguna prioridad clara.",
  },
  {
    icon: TrendingDown,
    title: "Pérdida de oportunidades",
    description: "Clientes que se van, tendencias que no ves.",
  },
  {
    icon: XCircle,
    title: "Datos sin acción",
    description: "Métricas que no se traducen en mejoras reales.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export const ProblemSection = () => {
  return (
    <section className="py-24 lg:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-destructive/[0.02] to-background" />
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          {/* Warning badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-destructive/10 border border-destructive/20 text-destructive mb-6">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm font-medium">El problema real</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-foreground mb-6 leading-tight">
            Dirigir sin datos claros no es valentía.{" "}
            <span className="text-destructive">Es riesgo.</span>
          </h2>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            La mayoría de los dueños de negocio toman decisiones basadas en intuición, 
            no en información. Eso cuesta dinero, tiempo y oportunidades.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto"
        >
          {problems.map((problem, i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              className="group relative p-6 rounded-2xl bg-card border border-border hover:border-destructive/30 transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center flex-shrink-0 group-hover:bg-destructive/20 transition-colors">
                  <problem.icon className="w-6 h-6 text-destructive" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {problem.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {problem.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
