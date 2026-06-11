import { useMemo } from "react";
import { Compass } from "lucide-react";
import { useBusiness } from "@/contexts/BusinessContext";
import { personalizedSignatureForNow } from "@/lib/sector-baselines";
import { cn } from "@/lib/utils";

interface SectorSignatureStripProps {
  className?: string;
}

/**
 * Strip contextual del hero del Dashboard.
 * Muestra la etiqueta personalizada del negocio + daypart actual + línea
 * generada por IA a partir del contexto real del negocio. Nunca inventa
 * números del negocio: las frases provienen del seed personalizado.
 */
export const SectorSignatureStrip = ({ className }: SectorSignatureStripProps) => {
  const { currentBusiness } = useBusiness();

  const sig = useMemo(
    () => personalizedSignatureForNow(currentBusiness),
    [currentBusiness],
  );

  return (
    <div
      className={cn(
        "flex items-start gap-2.5 rounded-2xl border border-border/40 bg-background/60",
        "px-3.5 py-2.5 backdrop-blur-sm",
        className,
      )}
      aria-label={`Contexto — ${sig.label}, ${sig.daypartLabel}`}
    >
      <div className="mt-0.5 shrink-0 w-7 h-7 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
        <Compass className="w-3.5 h-3.5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground/80 font-medium mb-0.5 truncate">
          {sig.label} · {sig.daypartLabel}
        </p>
        <p className="text-[13px] text-foreground/85 leading-snug">{sig.line}</p>
      </div>
    </div>
  );
};
