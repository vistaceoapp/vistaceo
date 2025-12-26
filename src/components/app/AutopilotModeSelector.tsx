import { useState } from "react";
import { cn } from "@/lib/utils";
import { 
  Zap, 
  Brain, 
  Rocket, 
  AlertTriangle,
  Check,
  Lock
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

interface AutopilotModeSelectorProps {
  currentMode: UserMode;
  userId: string;
  onModeChange?: (mode: UserMode) => void;
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

interface AutopilotModeSelectorProps {
  currentMode: UserMode;
  userId: string;
  onModeChange?: (mode: UserMode) => void;
  isPro?: boolean;
}

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

  const handleSelectMode = async (mode: UserMode) => {
    if (mode === selectedMode) return;
    
    // Show warning dialog
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

  return (
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
  );
};
