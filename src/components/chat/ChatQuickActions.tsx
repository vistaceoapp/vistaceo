import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  Star,
  DollarSign,
  Users,
  Lightbulb,
  Zap,
  BarChart3,
  Target,
} from "lucide-react";

interface QuickAction {
  id: string;
  label: string;
  icon: typeof TrendingUp;
  prompt: string;
  color: string;
}

const quickActions: QuickAction[] = [
  {
    id: "ventas",
    label: "Ventas",
    icon: DollarSign,
    prompt: "Analiza mis ventas actuales y dame 3 acciones específicas para aumentarlas esta semana",
    color: "text-emerald-500",
  },
  {
    id: "reputacion",
    label: "Reputación",
    icon: Star,
    prompt: "¿Cómo está mi reputación online? Dame un análisis y plan de mejora",
    color: "text-amber-500",
  },
  {
    id: "marketing",
    label: "Marketing",
    icon: TrendingUp,
    prompt: "Dame una estrategia de marketing de bajo costo para esta semana",
    color: "text-blue-500",
  },
  {
    id: "clientes",
    label: "Clientes",
    icon: Users,
    prompt: "¿Cómo puedo mejorar la experiencia de mis clientes y aumentar la fidelización?",
    color: "text-purple-500",
  },
  {
    id: "oportunidades",
    label: "Oportunidades",
    icon: Lightbulb,
    prompt: "Identifica oportunidades de crecimiento que no estoy aprovechando",
    color: "text-orange-500",
  },
  {
    id: "eficiencia",
    label: "Eficiencia",
    icon: Zap,
    prompt: "Analiza mi operación y sugiere cómo optimizar costos y tiempos",
    color: "text-cyan-500",
  },
  {
    id: "metricas",
    label: "Métricas",
    icon: BarChart3,
    prompt: "Dame un resumen ejecutivo de las métricas clave de mi negocio",
    color: "text-pink-500",
  },
  {
    id: "objetivos",
    label: "Objetivos",
    icon: Target,
    prompt: "Ayúdame a definir objetivos SMART para el próximo mes",
    color: "text-indigo-500",
  },
];

interface ChatQuickActionsProps {
  onSelectAction: (prompt: string) => void;
  disabled?: boolean;
  compact?: boolean;
}

export const ChatQuickActions = ({
  onSelectAction,
  disabled = false,
  compact = false,
}: ChatQuickActionsProps) => {
  if (compact) {
    return (
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
        {quickActions.slice(0, 4).map((action) => {
          const Icon = action.icon;
          return (
            <Button
              key={action.id}
              variant="ghost"
              size="sm"
              onClick={() => onSelectAction(action.prompt)}
              disabled={disabled}
              className="flex-shrink-0 h-7 px-2 gap-1.5 text-xs"
            >
              <Icon className={cn("w-3 h-3", action.color)} />
              <span>{action.label}</span>
            </Button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-2">
      {quickActions.map((action) => {
        const Icon = action.icon;
        return (
          <button
            key={action.id}
            onClick={() => onSelectAction(action.prompt)}
            disabled={disabled}
            className={cn(
              "flex flex-col items-center gap-1.5 p-3 rounded-xl",
              "bg-card/50 border border-border/40 hover:border-primary/30",
              "transition-all duration-200 hover:scale-[1.02]",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            <Icon className={cn("w-5 h-5", action.color)} />
            <span className="text-xs font-medium text-foreground/80">{action.label}</span>
          </button>
        );
      })}
    </div>
  );
};
