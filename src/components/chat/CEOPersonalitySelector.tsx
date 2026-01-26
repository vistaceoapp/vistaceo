import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Briefcase, 
  Zap, 
  GraduationCap, 
  Heart, 
  Target,
  ChevronDown 
} from "lucide-react";

export type CEOPersonality = "formal" | "directo" | "tecnico" | "cercano" | "estratega";

interface PersonalityOption {
  id: CEOPersonality;
  label: string;
  description: string;
  icon: typeof Briefcase;
  prompt: string;
}

const personalities: PersonalityOption[] = [
  {
    id: "formal",
    label: "Formal",
    description: "Profesional y estructurado",
    icon: Briefcase,
    prompt: "Responde de manera formal, profesional y estructurada. Usa lenguaje empresarial elegante.",
  },
  {
    id: "directo",
    label: "Directo",
    description: "Sin vueltas, al grano",
    icon: Zap,
    prompt: "Sé directo y conciso. Ve al punto sin rodeos. Respuestas cortas y accionables.",
  },
  {
    id: "tecnico",
    label: "Técnico",
    description: "Datos y análisis profundo",
    icon: GraduationCap,
    prompt: "Enfócate en datos, métricas y análisis técnico. Incluye números y estadísticas cuando sea posible.",
  },
  {
    id: "cercano",
    label: "Cercano",
    description: "Amigable y motivador",
    icon: Heart,
    prompt: "Sé cálido, cercano y motivador. Usa un tono amigable que inspire confianza.",
  },
  {
    id: "estratega",
    label: "Estratega",
    description: "Visión macro y largo plazo",
    icon: Target,
    prompt: "Enfócate en la estrategia de largo plazo. Conecta las acciones con objetivos mayores.",
  },
];

interface CEOPersonalitySelectorProps {
  value: CEOPersonality;
  onChange: (personality: CEOPersonality, promptModifier: string) => void;
  compact?: boolean;
}

export const CEOPersonalitySelector = ({
  value,
  onChange,
  compact = false,
}: CEOPersonalitySelectorProps) => {
  const currentPersonality = personalities.find((p) => p.id === value) || personalities[0];
  const Icon = currentPersonality.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size={compact ? "sm" : "default"}
          className={cn(
            "gap-2 text-muted-foreground hover:text-foreground",
            compact && "h-8 px-2"
          )}
        >
          <Icon className={cn("w-4 h-4", compact && "w-3.5 h-3.5")} />
          {!compact && <span className="text-sm">{currentPersonality.label}</span>}
          <ChevronDown className={cn("w-3 h-3 opacity-50", compact && "w-2.5 h-2.5")} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {personalities.map((personality) => {
          const ItemIcon = personality.icon;
          const isActive = personality.id === value;
          
          return (
            <DropdownMenuItem
              key={personality.id}
              onClick={() => onChange(personality.id, personality.prompt)}
              className={cn(
                "flex items-start gap-3 py-2.5 cursor-pointer",
                isActive && "bg-primary/10"
              )}
            >
              <ItemIcon className={cn(
                "w-4 h-4 mt-0.5 flex-shrink-0",
                isActive ? "text-primary" : "text-muted-foreground"
              )} />
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-sm font-medium",
                  isActive && "text-primary"
                )}>
                  {personality.label}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {personality.description}
                </p>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export { personalities };
