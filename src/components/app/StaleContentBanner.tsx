import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StaleContentBannerProps {
  show: boolean;
  onRegenerate: () => void;
  onDismiss: () => void;
  loading?: boolean;
  label?: string;
}

/**
 * Banner premium que avisa al usuario que su negocio cambió significativamente
 * desde que se generó este contenido, y le ofrece regenerar con la info actualizada.
 *
 * Se muestra de manera sutil, no invasiva — coherente con la estética Apple/Linear.
 */
export function StaleContentBanner({
  show,
  onRegenerate,
  onDismiss,
  loading = false,
  label = "Tu negocio cambió desde que se generó esto",
}: StaleContentBannerProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -8, height: 0 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          exit={{ opacity: 0, y: -8, height: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="overflow-hidden"
        >
          <div className="relative rounded-xl border border-primary/20 bg-gradient-to-r from-primary/5 via-primary/[0.03] to-transparent p-3 pr-10">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground">
                  Regenerá para alinear el análisis con tu información actual.
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={onRegenerate}
                disabled={loading}
                className="shrink-0 border-primary/30 hover:bg-primary/10"
              >
                <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
                Regenerar
              </Button>
            </div>
            <button
              onClick={onDismiss}
              className="absolute right-2 top-2 rounded-md p-1 text-muted-foreground hover:bg-secondary/60 hover:text-foreground transition-colors"
              aria-label="Descartar"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
