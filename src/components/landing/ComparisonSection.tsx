import { motion } from "framer-motion";
import { Check, X, Crown, Sparkles } from "lucide-react";

const comparisonData = [
  { feature: "Dashboard completo", free: true, pro: true },
  { feature: "Diagnóstico de negocio", free: true, pro: true },
  { feature: "1 Acción diaria", free: true, pro: true },
  { feature: "Chat con VistaCEO (texto)", free: true, pro: true },
  { feature: "Misiones estratégicas", free: "3/mes", pro: "Ilimitadas" },
  { feature: "Analytics avanzado", free: false, pro: true },
  { feature: "Predicciones IA", free: false, pro: true },
  { feature: "Hablar con VistaCEO (voz)", free: false, pro: true },
  { feature: "Análisis de fotos", free: false, pro: true },
  { feature: "Documentos y reportes", free: false, pro: true },
  { feature: "Radar I+D completo", free: false, pro: true },
  { feature: "Integraciones premium", free: false, pro: true },
  { feature: "Soporte prioritario", free: false, pro: true },
];

export const ComparisonSection = () => {
  return (
    <section className="py-24 lg:py-32 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary mb-6">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Comparación</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-foreground mb-6 leading-tight">
            Free vs Pro:{" "}
            <span className="text-gradient-primary">decide con claridad</span>
          </h2>
          
          <p className="text-lg text-muted-foreground">
            Ambos planes generan valor. Pro desbloquea el potencial completo.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-lg">
            {/* Header */}
            <div className="grid grid-cols-3 bg-secondary/50 border-b border-border">
              <div className="p-6 text-sm font-medium text-muted-foreground">
                Funcionalidad
              </div>
              <div className="p-6 text-center border-x border-border">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 border border-success/20">
                  <Sparkles className="w-4 h-4 text-success" />
                  <span className="text-sm font-semibold text-success">Free</span>
                </div>
              </div>
              <div className="p-6 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30">
                  <Crown className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-semibold text-amber-500">Pro</span>
                </div>
              </div>
            </div>

            {/* Rows */}
            {comparisonData.map((row, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.03 }}
                className={`grid grid-cols-3 ${
                  i < comparisonData.length - 1 ? "border-b border-border" : ""
                } hover:bg-secondary/30 transition-colors`}
              >
                <div className="p-5 text-sm text-foreground font-medium">
                  {row.feature}
                </div>
                <div className="p-5 flex items-center justify-center border-x border-border">
                  {typeof row.free === "boolean" ? (
                    row.free ? (
                      <Check className="w-5 h-5 text-success" />
                    ) : (
                      <X className="w-5 h-5 text-muted-foreground/40" />
                    )
                  ) : (
                    <span className="text-sm text-muted-foreground">{row.free}</span>
                  )}
                </div>
                <div className="p-5 flex items-center justify-center">
                  {typeof row.pro === "boolean" ? (
                    row.pro ? (
                      <Check className="w-5 h-5 text-amber-500" />
                    ) : (
                      <X className="w-5 h-5 text-muted-foreground/40" />
                    )
                  ) : (
                    <span className="text-sm font-medium text-amber-500">{row.pro}</span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};
