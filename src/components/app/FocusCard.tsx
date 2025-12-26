import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Rocket } from "lucide-react";
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

interface FocusCardProps {
  className?: string;
}

const FOCUS_OPTIONS = [
  { value: "ventas", label: "Ventas", icon: "💰", description: "Aumentar ingresos y ticket promedio" },
  { value: "reputacion", label: "Reputación", icon: "⭐", description: "Mejorar reseñas y percepción" },
  { value: "eficiencia", label: "Operación", icon: "⚙️", description: "Optimizar procesos y tiempos" },
  { value: "marketing", label: "Marketing", icon: "📱", description: "Atraer más clientes" },
  { value: "equipo", label: "Equipo", icon: "👥", description: "Motivar y retener talento" },
  { value: "costos", label: "Rentabilidad", icon: "📊", description: "Reducir costos, aumentar margen" },
];

export const FocusCard = ({ className }: FocusCardProps) => {
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
      <GlassCard 
        interactive 
        className={cn("p-4 cursor-pointer", className)}
        onClick={() => setIsDialogOpen(true)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
            <Rocket className="w-5 h-5 text-warning" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-foreground text-sm">Quiero potenciar...</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <span>{currentOption.icon}</span>
              <span className="capitalize">{currentOption.label}</span>
            </p>
          </div>
          <Button variant="outline" size="sm">
            Cambiar
          </Button>
        </div>
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
            Esto influye en las recomendaciones que te doy. Podés cambiarlo cuando quieras.
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

export default FocusCard;