import { useState, useMemo } from "react";
import { RefreshCw, Lock, Sparkles, TrendingDown, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSubscription } from "@/hooks/use-subscription";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

const PRO_REGEN_LIMIT = 1;
const REGEN_KEY_PREFIX = "mission_regen_count_";

function getRegenCount(missionId: string): number {
  try {
    return parseInt(localStorage.getItem(REGEN_KEY_PREFIX + missionId) || "0", 10);
  } catch {
    return 0;
  }
}

function incRegenCount(missionId: string): number {
  const next = getRegenCount(missionId) + 1;
  try {
    localStorage.setItem(REGEN_KEY_PREFIX + missionId, String(next));
  } catch {}
  return next;
}

interface Props {
  missionId: string;
  regenerating: boolean;
  onConfirmRegenerate: () => void;
  size?: "sm" | "icon";
  className?: string;
}

export const MissionRegenerateButton = ({
  missionId,
  regenerating,
  onConfirmRegenerate,
  size = "sm",
  className,
}: Props) => {
  const { isPro, isLoading } = useSubscription();
  const navigate = useNavigate();
  const [openConfirm, setOpenConfirm] = useState(false);
  const [openFreeBlock, setOpenFreeBlock] = useState(false);
  const [openProLimit, setOpenProLimit] = useState(false);

  const used = useMemo(() => getRegenCount(missionId), [missionId, regenerating]);
  const proExhausted = isPro && used >= PRO_REGEN_LIMIT;

  if (isLoading) return null;

  const handleClick = () => {
    if (!isPro) { setOpenFreeBlock(true); return; }
    if (proExhausted) { setOpenProLimit(true); return; }
    setOpenConfirm(true);
  };

  const handleConfirm = () => {
    setOpenConfirm(false);
    incRegenCount(missionId);
    onConfirmRegenerate();
  };

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {size === "icon" ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClick}
                disabled={regenerating}
                className={cn("h-9 w-9", className)}
                aria-label="Regenerar plan"
              >
                {!isPro || proExhausted ? (
                  <Lock className="w-4 h-4" />
                ) : (
                  <RefreshCw className={cn("w-4 h-4", regenerating && "animate-spin")} />
                )}
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClick}
                disabled={regenerating}
                className={cn("h-8 text-xs gap-1.5", className)}
              >
                {!isPro || proExhausted ? (
                  <Lock className="w-3.5 h-3.5" />
                ) : (
                  <RefreshCw className={cn("w-3.5 h-3.5", regenerating && "animate-spin")} />
                )}
                <span className="hidden lg:inline">Regenerar</span>
              </Button>
            )}
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">
              {!isPro
                ? "Regeneración disponible en plan Pro"
                : proExhausted
                  ? "Ya regeneraste esta misión 1 vez"
                  : "Generá una guía con enfoque alternativo (1 regeneración disponible)"}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Confirmación Pro (1ra regeneración) */}
      <AlertDialog open={openConfirm} onOpenChange={setOpenConfirm}>
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
              <span className="block text-foreground bg-muted/50 rounded-lg p-3 text-xs">
                💡 El progreso de los pasos completados se mantiene intacto.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-10">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm} className="h-10 gap-1.5">
              <RefreshCw className="w-4 h-4" />
              Regenerar (usa tu 1 cupo)
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bloqueo Free — push a Pro */}
      <AlertDialog open={openFreeBlock} onOpenChange={setOpenFreeBlock}>
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

      {/* Pro ya regeneró 1 vez — copy "tu plan ya está optimizado" */}
      <AlertDialog open={openProLimit} onOpenChange={setOpenProLimit}>
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
                Según el análisis de miles de misiones ejecutadas en VISTACEO, <strong>regenerar más de una vez reduce ~34% la tasa de finalización</strong>: el dueño pierde foco y nunca termina ningún plan.
              </span>
              <span className="block bg-muted/50 rounded-lg p-3 text-xs text-foreground">
                <TrendingDown className="w-3.5 h-3.5 inline-block mr-1 text-success" />
                La guía actual ya está calibrada con tu contexto. Te recomendamos avanzar — el siguiente paso es donde está el impacto real.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction className="h-10 w-full">Sigamos con esta guía</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
