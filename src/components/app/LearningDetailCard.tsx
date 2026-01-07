import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Globe, ExternalLink, TrendingUp, Clock, BarChart3, 
  CheckCircle2, ThumbsDown, Bookmark, BookmarkCheck,
  Sparkles, ChevronRight, Lightbulb, Target, Users,
  Zap, Building2, FileText, AlertCircle, Rocket
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LearningItem {
  id: string;
  title: string;
  content: string | null;
  item_type: string;
  source: string | null;
  action_steps: unknown;
  is_read: boolean;
  is_saved: boolean;
  created_at: string;
}

interface Business {
  id: string;
  name: string;
  category?: string | null;
  address?: string | null;
  avg_ticket?: number | null;
  currency?: string | null;
}

interface LearningDetailCardProps {
  item: LearningItem;
  business: Business | null;
  onDismiss: () => void;
  onSave: () => void;
  onClose: () => void;
  onApply?: () => void;
  applyLoading?: boolean;
}

// Get type-specific info
const getTypeInfo = (itemType: string) => {
  switch (itemType) {
    case "trend":
      return { 
        icon: TrendingUp, 
        label: "Tendencia", 
        color: "text-accent",
        category: "Investigación"
      };
    case "benchmark":
      return { 
        icon: BarChart3, 
        label: "Benchmark", 
        color: "text-primary",
        category: "Análisis"
      };
    case "opportunity":
      return { 
        icon: Target, 
        label: "Oportunidad", 
        color: "text-success",
        category: "Desarrollo"
      };
    case "tactic":
      return { 
        icon: Zap, 
        label: "Táctica", 
        color: "text-warning",
        category: "Desarrollo"
      };
    case "insight":
      return { 
        icon: Lightbulb, 
        label: "Insight", 
        color: "text-primary",
        category: "Investigación"
      };
    default:
      return { 
        icon: Globe, 
        label: "Externo", 
        color: "text-accent",
        category: "I+D"
      };
  }
};

// Generate business-specific application
const getBusinessApplication = (item: LearningItem, business: Business | null): string => {
  const businessName = business?.name || "tu negocio";
  const category = business?.category || "gastronomía";
  
  const applications: Record<string, string> = {
    trend: `Esta tendencia puede aplicarse en ${businessName} adaptándola al contexto de ${category} local.`,
    benchmark: `Comparando con negocios similares a ${businessName}, hay oportunidad de mejora en esta área.`,
    opportunity: `${businessName} puede capitalizar esta oportunidad considerando su posición actual en el mercado.`,
    tactic: `Esta táctica ha funcionado en negocios de ${category} similares y puede adaptarse a ${businessName}.`,
    insight: `Este insight revela un comportamiento de clientes relevante para ${businessName}.`
  };
  
  return applications[item.item_type] || `Información externa relevante para ${businessName}.`;
};

// Generate detailed action steps
const getDetailedSteps = (item: LearningItem, business: Business | null) => {
  const existingSteps = item.action_steps as string[] | null;
  const businessName = business?.name || "tu negocio";
  const category = business?.category || "gastronomía";
  
  if (existingSteps && existingSteps.length > 0) {
    // Enhance existing steps with more detail
    return existingSteps.map((step, idx) => ({
      title: step,
      description: `Paso ${idx + 1} adaptado para ${businessName}`,
      time: `${10 + idx * 5} min`,
      howTo: [
        "Evalúa cómo aplica a tu contexto específico",
        "Adapta según los recursos disponibles"
      ],
      applicability: idx === 0 ? "Alta" : "Media"
    }));
  }
  
  // Generate default steps based on type
  const defaultSteps = [
    {
      title: "Evaluar relevancia",
      description: `Analizar si esta ${getTypeInfo(item.item_type).label.toLowerCase()} aplica a ${businessName}`,
      time: "10 min",
      howTo: [
        "Lee el contenido completo y toma notas",
        "Identifica qué aspectos aplican a tu situación"
      ],
      applicability: "Alta"
    },
    {
      title: "Adaptar al contexto",
      description: `Personalizar para el rubro de ${category}`,
      time: "15 min",
      howTo: [
        "Considera las diferencias culturales y de mercado",
        "Ajusta según el tamaño y recursos de tu negocio"
      ],
      applicability: "Alta"
    },
    {
      title: "Crear plan de prueba",
      description: "Diseñar un experimento pequeño para validar",
      time: "20 min",
      howTo: [
        "Define métricas claras de éxito",
        "Establece un período de prueba (1-2 semanas)"
      ],
      applicability: "Media"
    },
    {
      title: "Implementar y medir",
      description: "Ejecutar la prueba y documentar resultados",
      time: "Variable",
      howTo: [
        "Registra los resultados en el sistema",
        "Compara con el baseline anterior"
      ],
      applicability: "Media"
    }
  ];
  
  return defaultSteps;
};

// Get confidence based on source
const getConfidenceInfo = (item: LearningItem) => {
  const source = item.source?.toLowerCase() || "";
  
  if (source.includes("estudio") || source.includes("research")) {
    return {
      level: "Alta",
      color: "text-success",
      bgColor: "bg-success/10 border-success/20",
      note: "Basado en investigación verificada",
      sourceType: "Estudio/Investigación"
    };
  }
  
  if (source.includes("industria") || source.includes("benchmark")) {
    return {
      level: "Alta",
      color: "text-success",
      bgColor: "bg-success/10 border-success/20",
      note: "Datos de la industria relevante",
      sourceType: "Benchmark de industria"
    };
  }
  
  if (source.includes("tendencia") || source.includes("trend")) {
    return {
      level: "Media",
      color: "text-warning",
      bgColor: "bg-warning/10 border-warning/20",
      note: "Tendencia emergente, requiere validación local",
      sourceType: "Tendencia de mercado"
    };
  }
  
  return {
    level: "Media",
    color: "text-warning",
    bgColor: "bg-warning/10 border-warning/20",
    note: "Información externa, adaptar a tu contexto",
    sourceType: item.source || "Fuente externa"
  };
};

export const LearningDetailCard = ({
  item,
  business,
  onDismiss,
  onSave,
  onClose,
  onApply,
  applyLoading
}: LearningDetailCardProps) => {
  const typeInfo = getTypeInfo(item.item_type);
  const TypeIcon = typeInfo.icon;
  const businessApplication = getBusinessApplication(item, business);
  const steps = getDetailedSteps(item, business);
  const confidence = getConfidenceInfo(item);
  
  return (
    <>
      <DialogHeader>
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <Badge variant="outline" className="text-[10px] bg-accent/5 border-accent/20">
            <ExternalLink className="w-3 h-3 mr-1" />
            EXTERNO
          </Badge>
          <Badge variant="secondary" className={cn("text-[10px]", typeInfo.color)}>
            <TypeIcon className="w-3 h-3 mr-1" />
            {typeInfo.label}
          </Badge>
          <Badge variant="outline" className="text-[10px]">
            I+D | {typeInfo.category}
          </Badge>
        </div>
        <DialogTitle className="text-xl leading-tight">{item.title}</DialogTitle>
        <DialogDescription className="text-sm">
          Aplicable a {business?.name || "tu negocio"} • {business?.category || "Gastronomía"}
        </DialogDescription>
      </DialogHeader>

      <ScrollArea className="max-h-[60vh] pr-2">
        <div className="space-y-5 mt-4">
          {/* Content - Por qué te lo sugiero */}
          <div className="p-4 rounded-xl bg-accent/5 border border-accent/20">
            <h4 className="font-semibold text-accent mb-2 flex items-center gap-2 text-sm">
              <Globe className="w-4 h-4" />
              Qué detectamos
            </h4>
            <p className="text-sm text-foreground leading-relaxed">
              {item.content || "Información externa relevante detectada para tu tipo de negocio."}
            </p>
          </div>

          {/* Business Application */}
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
            <h4 className="font-semibold text-primary mb-2 flex items-center gap-2 text-sm">
              <Building2 className="w-4 h-4" />
              Cómo aplica a {business?.name || "tu negocio"}
            </h4>
            <p className="text-sm text-foreground leading-relaxed">
              {businessApplication}
            </p>
          </div>

          {/* Detailed Steps */}
          <div>
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-accent" />
              Pasos para implementar
            </h4>
            <div className="space-y-3">
              {steps.map((step: any, idx: number) => (
                <div key={idx} className="p-4 rounded-xl bg-secondary/30 border border-border/50">
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center text-accent text-sm font-bold shrink-0">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
                        <h5 className="font-medium text-foreground text-sm">
                          {step.title}
                        </h5>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px]">
                            <Clock className="w-3 h-3 mr-1" />
                            {step.time}
                          </Badge>
                          <Badge 
                            variant="secondary" 
                            className={cn(
                              "text-[10px]",
                              step.applicability === "Alta" ? "text-success" : "text-warning"
                            )}
                          >
                            {step.applicability}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {step.description}
                      </p>
                      
                      {/* How to */}
                      <div className="bg-background/50 rounded-lg p-2">
                        <p className="text-[10px] font-medium text-muted-foreground uppercase mb-1">Cómo hacerlo:</p>
                        <ul className="space-y-1">
                          {step.howTo?.map((item: string, i: number) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-foreground">
                              <ChevronRight className="w-3 h-3 text-accent shrink-0 mt-0.5" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Potential Impact */}
          <div className="p-4 rounded-xl bg-success/5 border border-success/20">
            <h4 className="font-semibold text-success mb-2 flex items-center gap-2 text-sm">
              <TrendingUp className="w-4 h-4" />
              Potencial de impacto
            </h4>
            <div className="grid grid-cols-3 gap-3 mt-3">
              <div className="text-center">
                <div className="text-lg font-bold text-foreground">Medio-Alto</div>
                <div className="text-[10px] text-muted-foreground">Impacto estimado</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-foreground">2-4 sem</div>
                <div className="text-[10px] text-muted-foreground">Tiempo para ver resultados</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-foreground">Bajo</div>
                <div className="text-[10px] text-muted-foreground">Riesgo</div>
              </div>
            </div>
          </div>

          {/* Confidence & Source */}
          <div className={cn("p-4 rounded-xl border", confidence.bgColor)}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Confianza</span>
              </div>
              <Badge variant="outline" className={cn("text-xs", confidence.color)}>
                {confidence.level}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mb-3">{confidence.note}</p>
            
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground">Fuente:</span>
              <Badge variant="secondary" className="text-[10px]">
                {confidence.sourceType}
              </Badge>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={onDismiss}>
              <ThumbsDown className="w-4 h-4 mr-1" />
              No me interesa
            </Button>
            <Button variant="ghost" size="sm" onClick={onDismiss}>
              <CheckCircle2 className="w-4 h-4 mr-1" />
              Ya lo conozco
            </Button>
            <Button variant="outline" size="sm" onClick={onSave}>
              {item.is_saved ? (
                <>
                  <BookmarkCheck className="w-4 h-4 mr-1 text-primary" />
                  Guardado
                </>
              ) : (
                <>
                  <Bookmark className="w-4 h-4 mr-1" />
                  Guardar
                </>
              )}
            </Button>
            {onApply && (
              <Button 
                size="sm" 
                className="flex-1 gradient-primary" 
                onClick={onApply}
                disabled={applyLoading}
              >
                <Rocket className={cn("w-4 h-4 mr-1", applyLoading && "animate-spin")} />
                {applyLoading ? "Creando misión..." : "Aplicar → Misión"}
              </Button>
            )}
          </div>
        </div>
      </ScrollArea>
    </>
  );
};

export default LearningDetailCard;
