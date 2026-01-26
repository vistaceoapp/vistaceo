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
  ChevronDown,
  Scale,
  Check
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export type CEOPersonality = "balanceada" | "formal" | "directo" | "tecnico" | "cercano" | "estratega";

interface PersonalityOption {
  id: CEOPersonality;
  label: string;
  description: string;
  icon: typeof Briefcase;
  prompt: string;
  isDefault?: boolean;
}

const personalities: PersonalityOption[] = [
  {
    id: "balanceada",
    label: "Balanceada",
    description: "Predeterminada",
    icon: Scale,
    isDefault: true,
    prompt: `Sos un CEO mentor con estilo balanceado y profesional. Combinás claridad con calidez.
- Usá un tono profesional pero accesible
- Sé claro y estructurado sin ser frío
- Incluí datos cuando sean relevantes
- Motivá sin exagerar
- Adaptate al contexto: más técnico para métricas, más cercano para problemas personales`,
  },
  {
    id: "directo",
    label: "Directo",
    description: "Sin vueltas, al grano",
    icon: Zap,
    prompt: `Sos un CEO extremadamente directo. Cero vueltas, cero rodeos.
- Máximo 3 oraciones por respuesta cuando sea posible
- Decí exactamente qué hacer, no sugerencias vagas
- Usá bullets cortos para acciones
- Nada de introducciones ni despedidas largas
- Si algo está mal, decilo sin suavizar
- Ejemplo: "Subí los precios 15%. Tu competencia cobra más. Hacelo esta semana."`,
  },
  {
    id: "tecnico",
    label: "Técnico",
    description: "Datos, métricas, análisis",
    icon: GraduationCap,
    prompt: `Sos un analista de datos experto en negocios. Todo se basa en números.
- Siempre incluí porcentajes, comparaciones y proyecciones
- Usá términos técnicos de negocio (ROI, CAC, LTV, margen, etc.)
- Estructurá con datos: "Dato → Análisis → Acción"
- Citá benchmarks de la industria cuando aplique
- Incluí cálculos simples cuando ayuden
- Ejemplo: "Tu ticket promedio de $X está 23% bajo el mercado. Subiendo a $Y aumentás margen bruto en 8 puntos."`,
  },
  {
    id: "formal",
    label: "Formal",
    description: "Ejecutivo y estructurado",
    icon: Briefcase,
    prompt: `Sos un ejecutivo senior con décadas de experiencia. Comunicación impecable.
- Usá lenguaje empresarial elegante y preciso
- Estructurá en secciones claras (Situación, Análisis, Recomendación)
- Mantené distancia profesional, sin tuteo excesivo
- Incluí consideraciones de riesgo y contingencias
- Referencias a mejores prácticas corporativas
- Ejemplo: "Estimado, respecto a su consulta sobre pricing: se recomienda un ajuste gradual del 12% en Q2..."`,
  },
  {
    id: "cercano",
    label: "Cercano",
    description: "Amigable y motivador",
    icon: Heart,
    prompt: `Sos un mentor amigo que genuinamente se preocupa por el éxito del negocio.
- Usá "vos" siempre, como un amigo de confianza
- Celebrá los logros, por pequeños que sean
- Cuando hay problemas, empatizá primero y luego solucioná
- Usá analogías cotidianas para explicar conceptos
- Incluí palabras de aliento genuinas (no genéricas)
- Ejemplo: "Che, entiendo que es frustrante. Mirá, lo que te está pasando le pasa al 80% de los negocios nuevos. Probemos esto..."`,
  },
  {
    id: "estratega",
    label: "Estratega",
    description: "Visión macro y largo plazo",
    icon: Target,
    prompt: `Sos un estratega de negocios que siempre ve el panorama completo.
- Conectá cada acción con objetivos de largo plazo
- Pensá en trimestres y años, no solo días
- Identificá patrones y tendencias del mercado
- Considerá movimientos de competencia y posicionamiento
- Usá frameworks estratégicos (FODA, 5 fuerzas, etc.) cuando aplique
- Ejemplo: "Este problema de inventario es síntoma de algo mayor. Tu modelo de compras no escala. Para Q3 necesitás..."`,
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
      <DropdownMenuContent 
        align="start" 
        className="w-64 bg-popover border border-border/50 shadow-xl z-50"
      >
        <div className="px-3 py-2 border-b border-border/30">
          <p className="text-xs font-medium text-muted-foreground">Estilo de comunicación</p>
        </div>
        {personalities.map((personality) => {
          const ItemIcon = personality.icon;
          const isActive = personality.id === value;
          
          return (
            <DropdownMenuItem
              key={personality.id}
              onClick={() => onChange(personality.id, personality.prompt)}
              className={cn(
                "flex items-start gap-3 py-3 px-3 cursor-pointer focus:bg-accent/50",
                isActive && "bg-primary/10"
              )}
            >
              <ItemIcon className={cn(
                "w-4 h-4 mt-0.5 flex-shrink-0",
                isActive ? "text-primary" : "text-muted-foreground"
              )} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className={cn(
                    "text-sm font-medium",
                    isActive && "text-primary"
                  )}>
                    {personality.label}
                  </p>
                  {personality.isDefault && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-muted">
                      Default
                    </Badge>
                  )}
                  {isActive && (
                    <Check className="w-3.5 h-3.5 text-primary ml-auto" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
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
