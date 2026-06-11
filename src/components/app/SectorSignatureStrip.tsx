import { useMemo } from "react";
import { Compass } from "lucide-react";
import { useBusiness } from "@/contexts/BusinessContext";
import { sectorSignatureForNow } from "@/lib/sector-baselines";
import { cn } from "@/lib/utils";

const DAYPART_LABEL: Record<string, string> = {
  early_morning: "Temprano",
  morning: "Mañana",
  midday: "Mediodía",
  afternoon: "Tarde",
  evening: "Noche",
  late_night: "Madrugada",
};

interface SectorSignatureStripProps {
  className?: string;
}

/**
 * Strip contextual del hero: muestra sector + daypart actual + línea sectorial.
 * Nunca inventa números del negocio: usa el catálogo `sector-baselines`.
 */
export const SectorSignatureStrip = ({ className }: SectorSignatureStripProps) => {
  const { currentBusiness } = useBusiness();

  const sig = useMemo(
    () => sectorSignatureForNow(currentBusiness?.category as string | undefined),
    [currentBusiness?.category],
  );

  return (
    <div
      className={cn(
        "flex items-start gap-2.5 rounded-2xl border border-border/40 bg-background/60",
        "px-3.5 py-2.5 backdrop-blur-sm",
        className,
      )}
      aria-label={`Contexto sectorial — ${sig.baseline.displayName}, ${DAYPART_LABEL[sig.daypart]}`}
    >
      <div className="mt-0.5 shrink-0 w-7 h-7 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
        <Compass className="w-3.5 h-3.5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground/80 font-medium mb-0.5">
          {sig.baseline.displayName} · {DAYPART_LABEL[sig.daypart]}
        </p>
        <p className="text-[13px] text-foreground/85 leading-snug">{sig.line}</p>
      </div>
    </div>
  );
};
