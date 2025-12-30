import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Rocket, Info, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBrain } from "@/hooks/use-brain";
import { toast } from "@/hooks/use-toast";
import { GlassCard } from "./GlassCard";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const FOCUS_OPTIONS = [
  { value: "ventas", label: "Ventas", icon: "💰", description: "Aumentar ingresos y ticket promedio" },
  { value: "reputacion", label: "Reputación", icon: "⭐", description: "Mejorar reseñas y percepción" },
  { value: "eficiencia", label: "Operación", icon: "⚙️", description: "Optimizar procesos y tiempos" },
  { value: "marketing", label: "Marketing", icon: "📱", description: "Atraer más clientes" },
  { value: "equipo", label: "Equipo", icon: "👥", description: "Motivar y retener talento" },
  { value: "costos", label: "Rentabilidad", icon: "📊", description: "Reducir costos, aumentar margen" },
];

interface FocusWidgetProps {
  className?: string;
}

export const FocusWidget = ({ className }: FocusWidgetProps) => {
  const { brain, updateFocus } = useBrain();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const currentFocus = brain?.current_focus || "ventas";
  const currentOption = FOCUS_OPTIONS.find(o => o.value === currentFocus) || FOCUS_OPTIONS[0];

  const handleFocusChange = async (newFocus: string) => {
    setIsUpdating(true);
    try {
      await updateFocus(newFocus);
      toast({
        title: `Foco actualizado`,
        description: `Ahora priorizaré ${FOCUS_OPTIONS.find(o => o.value === newFocus)?.label || newFocus}`,
      });
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error updating focus:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el foco",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <GlassCard className={cn("p-4", className)}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Rocket className="w-4 h-4 text-warning" />
            <h4 className="font-semibold text-foreground text-sm">Foco actual</h4>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="text-muted-foreground hover:text-foreground transition-colors">
                  <Info className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="left" className="max-w-[200px]">
                <p className="text-xs">El foco determina qué tipo de recomendaciones priorizamos para tu negocio</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50 mb-3">
          <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
            <span className="text-2xl">{currentOption.icon}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-lg font-bold text-foreground capitalize">{currentOption.label}</p>
            <p className="text-xs text-muted-foreground truncate">{currentOption.description}</p>
          </div>
        </div>

        {/* Microcopy anti-caos */}
        <div className="flex items-center gap-2 p-2 rounded-lg bg-primary/5 border border-primary/10 mb-3">
          <Clock className="w-4 h-4 text-primary flex-shrink-0" />
          <p className="text-[11px] text-muted-foreground leading-tight">
            <span className="text-foreground font-medium">Recomendado:</span> Mantener el mismo foco 15-30 días para que la planificación sea consistente.
          </p>
        </div>

        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          onClick={() => setIsDialogOpen(true)}
        >
          Solicitar cambio de foco
        </Button>

        <p className="text-[10px] text-muted-foreground text-center mt-2 italic">
          El sistema propone el foco ideal según tu situación
        </p>
      </GlassCard>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Rocket className="w-5 h-5 text-warning" />
              ¿Qué querés potenciar?
            </DialogTitle>
          </DialogHeader>

          <p className="text-sm text-muted-foreground mb-4">
            Esto influye en las recomendaciones que te doy. Podés cambiarlo cuando quieras, pero recomendamos mantenerlo al menos 15 días.
          </p>

          <div className="grid grid-cols-2 gap-2">
            {FOCUS_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => handleFocusChange(option.value)}
                disabled={isUpdating}
                className={cn(
                  "p-4 rounded-xl border-2 transition-all text-left",
                  currentFocus === option.value
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/30"
                )}
              >
                <span className="text-2xl block mb-2">{option.icon}</span>
                <p className="font-medium text-foreground text-sm">{option.label}</p>
                <p className="text-xs text-muted-foreground">{option.description}</p>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FocusWidget;
