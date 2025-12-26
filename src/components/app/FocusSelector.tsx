import { useState } from "react";
import { Target, ChevronDown, Check, Sparkles, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBrain } from "@/hooks/use-brain";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

interface FocusSelectorProps {
  variant?: "button" | "card" | "inline";
  showDescription?: boolean;
  className?: string;
}

const FOCUS_OPTIONS = [
  { 
    value: "ventas", 
    label: "Ventas", 
    icon: "💰",
    description: "Aumentar ingresos y ticket promedio",
    color: "text-success"
  },
  { 
    value: "reputacion", 
    label: "Reputación", 
    icon: "⭐",
    description: "Mejorar ratings y reseñas",
    color: "text-warning"
  },
  { 
    value: "marketing", 
    label: "Marketing", 
    icon: "📱",
    description: "Atraer más clientes",
    color: "text-accent"
  },
  { 
    value: "eficiencia", 
    label: "Eficiencia", 
    icon: "⚡",
    description: "Optimizar operaciones y tiempos",
    color: "text-primary"
  },
  { 
    value: "equipo", 
    label: "Equipo", 
    icon: "👥",
    description: "Gestión y retención de personal",
    color: "text-muted-foreground"
  },
  { 
    value: "producto", 
    label: "Producto", 
    icon: "📦",
    description: "Mejorar menú y oferta",
    color: "text-primary"
  },
  { 
    value: "costos", 
    label: "Costos", 
    icon: "📊",
    description: "Reducir gastos y desperdicios",
    color: "text-destructive"
  },
  { 
    value: "expansion", 
    label: "Expansión", 
    icon: "🚀",
    description: "Crecer y escalar el negocio",
    color: "text-primary"
  },
];

export const FocusSelector = ({ 
  variant = "button", 
  showDescription = true,
  className 
}: FocusSelectorProps) => {
  const { brain, focusConfig, updateFocus, loading } = useBrain();
  const [updating, setUpdating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const currentFocus = brain?.current_focus || focusConfig?.current_focus || "ventas";
  const currentOption = FOCUS_OPTIONS.find(o => o.value === currentFocus) || FOCUS_OPTIONS[0];

  const handleFocusChange = async (focus: string) => {
    if (focus === currentFocus) return;
    
    setUpdating(true);
    try {
      await updateFocus(focus);
      toast({
        title: `${FOCUS_OPTIONS.find(o => o.value === focus)?.icon} Foco actualizado`,
        description: `Ahora las recomendaciones priorizarán ${focus}`,
      });
      setDialogOpen(false);
    } catch (error) {
      console.error("Error updating focus:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el foco",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className={cn("animate-pulse h-10 rounded-lg bg-muted", className)} />
    );
  }

  // Button variant with dropdown
  if (variant === "button") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className={cn("gap-2", className)}
            disabled={updating}
          >
            <Target className="w-4 h-4 text-primary" />
            <span>{currentOption.icon}</span>
            <span className="capitalize">{currentOption.label}</span>
            <ChevronDown className="w-4 h-4 ml-1 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
            Foco principal del negocio
          </div>
          <DropdownMenuSeparator />
          {FOCUS_OPTIONS.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => handleFocusChange(option.value)}
              className="flex items-center gap-3 py-2.5 cursor-pointer"
            >
              <span className="text-lg">{option.icon}</span>
              <div className="flex-1">
                <p className="font-medium">{option.label}</p>
                {showDescription && (
                  <p className="text-xs text-muted-foreground">{option.description}</p>
                )}
              </div>
              {option.value === currentFocus && (
                <Check className="w-4 h-4 text-primary" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Inline variant - clickable badge
  if (variant === "inline") {
    return (
      <>
        <Badge 
          variant="outline" 
          className={cn(
            "cursor-pointer hover:bg-primary/10 hover:border-primary/30 transition-colors gap-1.5",
            className
          )}
          onClick={() => setDialogOpen(true)}
        >
          <span>{currentOption.icon}</span>
          <span className="capitalize">{currentOption.label}</span>
          <ChevronDown className="w-3 h-3 opacity-50" />
        </Badge>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Cambiar foco del negocio
              </DialogTitle>
              <DialogDescription>
                El foco determina qué tipo de acciones y recomendaciones priorizamos
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-2 mt-4">
              {FOCUS_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleFocusChange(option.value)}
                  disabled={updating}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg text-left transition-all",
                    "hover:bg-secondary border border-transparent",
                    option.value === currentFocus 
                      ? "bg-primary/10 border-primary/30" 
                      : "bg-card hover:border-border"
                  )}
                >
                  <span className="text-2xl">{option.icon}</span>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{option.label}</p>
                    <p className="text-xs text-muted-foreground">{option.description}</p>
                  </div>
                  {option.value === currentFocus && (
                    <Check className="w-5 h-5 text-primary" />
                  )}
                </button>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Card variant - full display
  return (
    <div className={cn(
      "rounded-xl border border-border bg-card p-4",
      className
    )}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Foco actual</h3>
        </div>
        <Badge variant="secondary" className="gap-1">
          <Sparkles className="w-3 h-3" />
          Personalizado
        </Badge>
      </div>
      
      <div className="bg-secondary/50 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{currentOption.icon}</span>
          <div>
            <p className="text-lg font-bold text-foreground capitalize">
              {currentOption.label}
            </p>
            <p className="text-sm text-muted-foreground">
              {currentOption.description}
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <TrendingUp className="w-3 h-3" />
          Las acciones se priorizan según este foco
        </p>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setDialogOpen(true)}
        >
          Cambiar
        </Button>
      </div>
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Cambiar foco del negocio
            </DialogTitle>
            <DialogDescription>
              El foco determina qué tipo de acciones y recomendaciones priorizamos
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-2 mt-4">
            {FOCUS_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => handleFocusChange(option.value)}
                disabled={updating}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg text-left transition-all",
                  "hover:bg-secondary border border-transparent",
                  option.value === currentFocus 
                    ? "bg-primary/10 border-primary/30" 
                    : "bg-card hover:border-border"
                )}
              >
                <span className="text-2xl">{option.icon}</span>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{option.label}</p>
                  <p className="text-xs text-muted-foreground">{option.description}</p>
                </div>
                {option.value === currentFocus && (
                  <Check className="w-5 h-5 text-primary" />
                )}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FocusSelector;
