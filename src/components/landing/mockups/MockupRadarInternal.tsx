import { motion } from "framer-motion";
import { FileText, Lightbulb, Zap, X, AlertCircle, Target, CheckCircle2 } from "lucide-react";

export const MockupRadarInternal = () => {
  return (
    <div className="bg-background rounded-2xl border border-border shadow-2xl overflow-hidden w-full max-w-md">
      {/* Header badges */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 mb-4">
          <span className="px-3 py-1.5 rounded-full bg-foreground text-background text-xs font-medium flex items-center gap-1.5">
            <FileText className="w-3 h-3" /> INTERNO
          </span>
          <span className="px-3 py-1.5 rounded-full bg-success/10 text-success text-xs font-medium flex items-center gap-1.5">
            <Lightbulb className="w-3 h-3" /> Diagnóstico
          </span>
          <span className="px-3 py-1.5 rounded-full bg-warning/10 text-warning text-xs font-medium flex items-center gap-1.5">
            <Zap className="w-3 h-3" /> Quick Win
          </span>
          <button className="ml-auto p-1 hover:bg-muted rounded-lg">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-foreground mb-1 leading-tight">
          instalar 1 pizarra de feedback: descubrí por qué tus clientes principales (estudiantes) no se identifican
        </h3>
        <p className="text-sm text-muted-foreground">
          Para Café la tratoría • cafeteria
        </p>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4 max-h-[380px] overflow-y-auto">
        {/* What it is */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-4 rounded-xl border border-border bg-card"
        >
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-4 h-4 text-foreground" />
            <span className="text-sm font-semibold text-foreground">Qué es</span>
          </div>
          <p className="text-sm text-foreground leading-relaxed">
            Detectamos que tu principal obstáculo para fidelizar es que los estudiantes, que son tus 
            clientes principales, 'no se sienten identificados con el ambiente'. Esto significa que 
            hay una desconexión clave que te impide convertirlos en clientes recurrentes. Si instalás 
            una pizarra simple y visible con la pregunta '¿Qué le falta a La Tratoría para ser tu lugar 
            ideal?', vas a obtener ideas directas y honestas de ellos, entendiendo qué cambios (enchufes, 
            música, promos) realmente valorarían antes de invertir a ciegas.
          </p>
        </motion.div>

        {/* Specific trigger */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-4 rounded-xl border border-border bg-muted/30"
        >
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-warning" />
            <span className="text-sm font-semibold text-warning">Disparador específico</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Tu mayor obstáculo para fidelizar estudiantes es que 'no se sienten identificados con el ambiente'.
          </p>
        </motion.div>

        {/* Why it applies */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-4 rounded-xl border border-primary/20 bg-primary/5"
        >
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary">Por qué aplica a Café la tratoría</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <p className="text-sm text-foreground">
                Tus clientes principales son 'estudiantes y jóvenes con tiempo libre'.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <p className="text-sm text-foreground">
                Tu ubicación es 'céntrica y de fácil acceso', ideal para este público.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
