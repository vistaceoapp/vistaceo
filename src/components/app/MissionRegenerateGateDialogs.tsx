import { RefreshCw, Award, TrendingDown, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { RegenGateMode } from "@/hooks/use-mission-regenerate-gate";

interface Props {
  mode: RegenGateMode;
  setMode: (m: RegenGateMode) => void;
  confirmRegenerate: () => void;
}

export const MissionRegenerateGateDialogs = ({ mode, setMode, confirmRegenerate }: Props) => {
  const navigate = useNavigate();
  return (
    <>
      <AlertDialog open={mode === "confirm"} onOpenChange={(o) => !o && setMode("closed")}>
        <AlertDialogContent className="sm:rounded-2xl">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <AlertDialogTitle className="text-lg">¿Regenerar la guía?</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-sm leading-relaxed space-y-2">
              <span className="block">
                Tu plan Pro incluye <strong>1 regeneración por misión</strong>. Vas a generar un enfoque diferente y la guía actual se reemplazará.
              </span>
              <span className="block bg-muted/50 rounded-lg p-3 text-xs">
                💡 El progreso de los pasos completados se mantiene intacto.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-10">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRegenerate} className="h-10 gap-1.5">
              <RefreshCw className="w-4 h-4" /> Regenerar (usa tu 1 cupo)
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={mode === "free"} onOpenChange={(o) => !o && setMode("closed")}>
        <AlertDialogContent className="sm:rounded-2xl">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                <Award className="w-5 h-5 text-primary-foreground" />
              </div>
              <AlertDialogTitle className="text-lg">Regeneración exclusiva Pro</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-sm leading-relaxed">
              La guía que generamos ya está calibrada con tu negocio. En el plan Pro podés pedir un enfoque alternativo cuando lo necesites.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-10">Entendido</AlertDialogCancel>
            <AlertDialogAction onClick={() => navigate("/checkout")} className="h-10">
              Conocer Pro
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={mode === "exhausted"} onOpenChange={(o) => !o && setMode("closed")}>
        <AlertDialogContent className="sm:rounded-2xl">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                <Award className="w-5 h-5 text-success" />
              </div>
              <AlertDialogTitle className="text-lg">Tu plan ya está optimizado</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-sm leading-relaxed space-y-3">
              <span className="block">
                Según el análisis de miles de misiones ejecutadas en VISTACEO, <strong>regenerar más de una vez reduce ~34% la tasa de finalización</strong>: se pierde foco y nunca se termina ningún plan.
              </span>
              <span className="block bg-muted/50 rounded-lg p-3 text-xs">
                <TrendingDown className="w-3.5 h-3.5 inline-block mr-1 text-success" />
                La guía actual ya está calibrada con tu contexto. El siguiente paso es donde está el impacto real.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction className="h-10 w-full" onClick={() => setMode("closed")}>
              Sigamos con esta guía
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
