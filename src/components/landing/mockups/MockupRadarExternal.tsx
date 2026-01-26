import { motion } from "framer-motion";
import { ExternalLink, TrendingUp, Globe, FileText, X, ThumbsDown, Check, Bookmark, Rocket } from "lucide-react";

export const MockupRadarExternal = () => {
  return (
    <div className="bg-background rounded-2xl border border-border shadow-2xl overflow-hidden w-full max-w-md">
      {/* Header badges */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 mb-4">
          <span className="px-3 py-1.5 rounded-full bg-foreground text-background text-xs font-medium flex items-center gap-1.5">
            <ExternalLink className="w-3 h-3" /> EXTERNO
          </span>
          <span className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium flex items-center gap-1.5">
            <TrendingUp className="w-3 h-3" /> Tendencia
          </span>
          <span className="px-3 py-1.5 rounded-full bg-muted text-muted-foreground text-xs font-medium">
            I+D | Investigación
          </span>
          <button className="ml-auto p-1 hover:bg-muted rounded-lg">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-foreground mb-1 leading-tight">
          Confirmado en Córdoba: crece el auge del 'Work-from-Cafe'
        </h3>
        <p className="text-sm text-muted-foreground">
          Aplicable a Café la tratoría • cafeteria
        </p>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto">
        {/* What we detected */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-4 rounded-xl border border-border bg-card"
        >
          <div className="flex items-center gap-2 mb-3">
            <Globe className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary">Qué detectamos</span>
          </div>
          <p className="text-sm text-foreground leading-relaxed">
            Una tendencia que ya se observaba globalmente ahora es confirmada por medios locales: 
            el trabajo remoto desde cafeterías es un comportamiento en crecimiento en Córdoba. 
            Esto representa una demanda concreta de espacios con buen wifi, enchufes y un ambiente 
            propicio para la concentración.
          </p>
          <p className="text-sm text-foreground mt-3 leading-relaxed">
            <span className="font-semibold">Por qué aplica a tu negocio:</span> Aplica directamente 
            a tu cafetería en Córdoba, AR, ya que valida una oportunidad de mercado en tu ciudad 
            para tu cliente objetivo (estudiantes).
          </p>
          <div className="mt-3">
            <span className="text-sm font-semibold text-foreground">Fuente: </span>
            <a href="#" className="text-sm text-primary hover:underline">
              Córdoba. Del home office en casa al trabajo entre café, medialunas y bebidas, una tendencia que crece
            </a>
            <ExternalLink className="w-3 h-3 inline ml-1 text-primary" />
          </div>
        </motion.div>

        {/* How it applies */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-4 rounded-xl border border-border bg-muted/30"
        >
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary">Cómo aplica a Café la tratoría</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Esta tendencia puede aplicarse en Café la tratoría adaptándola al contexto de cafeteria local.
          </p>
        </motion.div>
      </div>

      {/* Action buttons */}
      <div className="p-4 border-t border-border bg-muted/20">
        <div className="grid grid-cols-4 gap-2">
          <button className="flex flex-col items-center gap-1 p-2 rounded-xl border border-border bg-background hover:bg-muted transition-colors">
            <ThumbsDown className="w-4 h-4 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">No me interesa</span>
          </button>
          <button className="flex flex-col items-center gap-1 p-2 rounded-xl border border-border bg-background hover:bg-muted transition-colors">
            <Check className="w-4 h-4 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">Ya lo conozco</span>
          </button>
          <button className="flex flex-col items-center gap-1 p-2 rounded-xl border border-border bg-background hover:bg-muted transition-colors">
            <Bookmark className="w-4 h-4 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">Guardar</span>
          </button>
          <button className="flex flex-col items-center gap-1 p-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
            <Rocket className="w-4 h-4" />
            <span className="text-[10px] font-medium">Aplicar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
