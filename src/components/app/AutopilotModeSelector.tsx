import { useState } from "react";
import { cn } from "@/lib/utils";
import { 
  Zap, 
  Brain, 
  Rocket, 
  AlertTriangle,
  Check,
  Lock,
  Crown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
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

type UserMode = "nano" | "standard" | "proactive" | "sos";

interface AutopilotModeSelectorProps {
  currentMode: UserMode;
  userId: string;
  onModeChange?: (mode: UserMode) => void;
  isPro?: boolean;
}

const modes: {
  id: UserMode;
  name: string;
  description: string;
  icon: typeof Zap;
  color: string;
  features: string[];
}[] = [
  {
    id: "nano",
    name: "Nano",
    description: "Mínima interacción, solo lo esencial",
    icon: Zap,
    color: "text-emerald-500",
    features: [
      "1 acción diaria máxima",
      "Solo alertas críticas",
      "Check-in opcional",
      "Sin micro-preguntas"
    ]
  },
  {
    id: "standard",
    name: "Estándar",
    description: "Balance perfecto entre guía y autonomía",
    icon: Brain,
    color: "text-primary",
    features: [
      "2-3 acciones diarias",
      "Check-in diario breve",
      "Micro-preguntas adaptativas",
      "Resumen semanal"
    ]
  },
  {
    id: "proactive",
    name: "Proactivo",
    description: "Máximo aprovechamiento del sistema",
    icon: Rocket,
    color: "text-violet-500",
    features: [
      "Hasta 5 acciones diarias",
      "Check-in completo por turno",
      "Oportunidades proactivas",
      "Análisis predictivo"
    ]
  },
  {
    id: "sos",
    name: "SOS",
    description: "Modo crisis para momentos difíciles",
    icon: AlertTriangle,
    color: "text-destructive",
    features: [
      "Enfoque en supervivencia",
      "Solo acciones de alto impacto",
      "Soporte emocional activo",
      "Priorización automática"
    ]
  }
];

export const AutopilotModeSelector = ({
  currentMode,
  userId,
  onModeChange,
  isPro = false
}: AutopilotModeSelectorProps) => {
  const [selectedMode, setSelectedMode] = useState<UserMode>(currentMode);
  const [saving, setSaving] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [pendingMode, setPendingMode] = useState<UserMode | null>(null);

  const handleSelectMode = (mode: UserMode) => {
    if (mode === selectedMode) return;
    
    // Show warning dialog before changing
    setPendingMode(mode);
    setShowWarning(true);
  };

  const confirmModeChange = async () => {
    if (!pendingMode) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ user_mode: pendingMode })
        .eq("id", userId);

      if (error) throw error;

      setSelectedMode(pendingMode);
      onModeChange?.(pendingMode);
      toast({
        title: "Modo actualizado",
        description: `Ahora estás en modo ${modes.find(m => m.id === pendingMode)?.name}. Podés volver cuando quieras.`
      });
    } catch (error) {
      console.error("Error updating mode:", error);
      toast({
        title: "Error",
        description: "No se pudo cambiar el modo",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
      setShowWarning(false);
      setPendingMode(null);
    }
  };

  const cancelModeChange = () => {
    setShowWarning(false);
    setPendingMode(null);
  };

  // If not Pro, show upgrade prompt
  if (!isPro) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-transparent p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Crown className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">
            Autopilot es una función Pro
          </h3>
          <p className="text-muted-foreground mb-4 max-w-md mx-auto">
            Personaliza cómo interactúa el sistema con vos: desde modo mínimo hasta proactivo. 
            Actualiza a Pro para desbloquear esta y otras funciones avanzadas.
          </p>
          <Button onClick={() => toast({ title: "Próximamente" })}>
            <Crown className="w-4 h-4 mr-2" />
            Ver planes Pro
          </Button>
        </div>

        {/* Show modes as preview (locked) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-60">
          {modes.map((mode) => {
            const Icon = mode.icon;
            const isSelected = selectedMode === mode.id;
            
            return (
              <div
                key={mode.id}
                className={cn(
                  "relative p-5 rounded-xl border-2 text-left",
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card"
                )}
              >
                {/* Lock indicator */}
                <div className="absolute top-3 right-3">
                  <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                    <Lock className="w-3 h-3 text-muted-foreground" />
                  </div>
                </div>

                {/* Mode header */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                    <Icon className={cn("w-5 h-5", mode.color)} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{mode.name}</h3>
                    <p className="text-sm text-muted-foreground">{mode.description}</p>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-1.5">
                  {mode.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {modes.map((mode) => {
            const Icon = mode.icon;
            const isSelected = selectedMode === mode.id;
            
            return (
              <button
                key={mode.id}
                onClick={() => handleSelectMode(mode.id)}
                disabled={saving}
                className={cn(
                  "relative p-5 rounded-xl border-2 text-left transition-all duration-200",
                  "hover:shadow-lg hover:scale-[1.02]",
                  isSelected
                    ? "border-primary bg-primary/5 shadow-md"
                    : "border-border bg-card hover:border-primary/50"
                )}
              >
                {/* Selected indicator */}
                {isSelected && (
                  <div className="absolute top-3 right-3">
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-4 h-4 text-primary-foreground" />
                    </div>
                  </div>
                )}

                {/* Mode header */}
                <div className="flex items-center gap-3 mb-3">
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    isSelected ? "bg-primary/20" : "bg-secondary"
                  )}>
                    <Icon className={cn("w-5 h-5", mode.color)} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{mode.name}</h3>
                    <p className="text-sm text-muted-foreground">{mode.description}</p>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-1.5">
                  {mode.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        isSelected ? "bg-primary" : "bg-muted-foreground/50"
                      )} />
                      {feature}
                    </li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Puedes cambiar el modo en cualquier momento según tus necesidades
        </p>
      </div>

      {/* Warning Dialog */}
      <AlertDialog open={showWarning} onOpenChange={setShowWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cambiar modo de operación?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Vas a cambiar de <span className="font-medium text-foreground">{modes.find(m => m.id === selectedMode)?.name}</span> a{" "}
                <span className="font-medium text-foreground">{modes.find(m => m.id === pendingMode)?.name}</span>.
              </p>
              <p>
                Este cambio modificará tu interacción con el sistema, pero <strong>no borra ningún historial</strong>. 
                Podés volver cuando quieras.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelModeChange}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmModeChange} disabled={saving}>
              {saving ? "Guardando..." : "Confirmar cambio"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
