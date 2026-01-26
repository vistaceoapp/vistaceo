import { forwardRef } from "react";
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
  ChevronRight, Lightbulb, Target, Users,
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

// Helper to parse and render content with links properly
const parseContentWithLinks = (content: string): React.ReactNode => {
  // Pattern to match markdown links: [text](url) or **text**
  const parts: React.ReactNode[] = [];
  let remaining = content;
  let key = 0;
  
  // Match markdown links [text](url)
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let lastIndex = 0;
  let match;
  
  while ((match = linkRegex.exec(content)) !== null) {
    // Add text before the link
    if (match.index > lastIndex) {
      const textBefore = content.slice(lastIndex, match.index);
      // Parse bold text in this segment
      parts.push(<span key={key++}>{parseBoldText(textBefore)}</span>);
    }
    
    // Add the link
    const linkText = match[1];
    const linkUrl = match[2];
    
    // Extract domain for display
    let displayText = linkText;
    try {
      if (linkText.startsWith('http')) {
        const url = new URL(linkText);
        displayText = url.hostname.replace('www.', '');
      }
    } catch {
      // Keep original text
    }
    
    parts.push(
      <a 
        key={key++}
        href={linkUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary hover:underline inline-flex items-center gap-1"
        onClick={(e) => e.stopPropagation()}
      >
        {displayText}
        <ExternalLink className="w-3 h-3" />
      </a>
    );
    
    lastIndex = match.index + match[0].length;
  }
  
  // Add remaining text
  if (lastIndex < content.length) {
    parts.push(<span key={key++}>{parseBoldText(content.slice(lastIndex))}</span>);
  }
  
  return parts.length > 0 ? parts : parseBoldText(content);
};

// Helper to parse bold text **text**
const parseBoldText = (text: string): React.ReactNode => {
  const parts: React.ReactNode[] = [];
  const boldRegex = /\*\*([^*]+)\*\*/g;
  let lastIndex = 0;
  let match;
  let key = 0;
  
  while ((match = boldRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push(<strong key={key++}>{match[1]}</strong>);
    lastIndex = match.index + match[0].length;
  }
  
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  
  return parts.length > 0 ? <>{parts}</> : text;
};

// Extract clean source info from URL or source string
const extractSourceInfo = (source: string | null): { domain: string; url: string | null; date: string | null } => {
  if (!source) {
    return { domain: "Fuente externa", url: null, date: null };
  }
  
  // Check if it's a URL
  if (source.startsWith('http')) {
    try {
      const url = new URL(source);
      const domain = url.hostname.replace('www.', '');
      // Try to extract date from Google News URLs
      const dateMatch = source.match(/(\d{4})-(\d{2})/);
      const date = dateMatch ? `${dateMatch[1]}-${dateMatch[2]}` : null;
      return { domain, url: source, date };
    } catch {
      return { domain: source.slice(0, 30) + '...', url: source, date: null };
    }
  }
  
  // If it contains a URL, extract it
  const urlMatch = source.match(/(https?:\/\/[^\s]+)/);
  if (urlMatch) {
    try {
      const url = new URL(urlMatch[1]);
      return { domain: url.hostname.replace('www.', ''), url: urlMatch[1], date: null };
    } catch {
      return { domain: source, url: null, date: null };
    }
  }
  
  return { domain: source, url: null, date: null };
};

export const LearningDetailCard = forwardRef<HTMLDivElement, LearningDetailCardProps>(
  ({ item, business, onDismiss, onSave, onClose, onApply, applyLoading }, ref) => {
    const typeInfo = getTypeInfo(item.item_type);
    const TypeIcon = typeInfo.icon;
    const businessApplication = getBusinessApplication(item, business);
    const steps = getDetailedSteps(item, business);
    const confidence = getConfidenceInfo(item);
    const sourceInfo = extractSourceInfo(item.source);
    
    return (
      <div ref={ref} className="flex flex-col max-h-[80vh]">
        {/* Header - Fixed */}
        <DialogHeader className="shrink-0 pb-4">
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
          <DialogTitle className="text-lg sm:text-xl leading-tight pr-6">{item.title}</DialogTitle>
          <DialogDescription className="text-sm">
            Aplicable a {business?.name || "tu negocio"} • {business?.category || "Gastronomía"}
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable Content */}
        <ScrollArea className="flex-1 pr-3">
          <div className="space-y-4 pb-4">
            {/* Content - Qué detectamos */}
            <div className="p-4 rounded-xl bg-accent/5 border border-accent/20">
              <h4 className="font-semibold text-accent mb-2 flex items-center gap-2 text-sm">
                <Globe className="w-4 h-4" />
                Qué detectamos
              </h4>
              <div className="text-sm text-foreground leading-relaxed">
                {item.content ? parseContentWithLinks(item.content) : "Información externa relevante detectada para tu tipo de negocio."}
              </div>
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
              <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2 text-sm">
                <FileText className="w-4 h-4 text-accent" />
                Pasos para implementar
              </h4>
              <div className="space-y-3">
                {steps.map((step: any, idx: number) => (
                  <div key={idx} className="p-3 sm:p-4 rounded-xl bg-secondary/30 border border-border/50">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center text-accent text-xs font-bold shrink-0">
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-1 gap-1 sm:gap-2">
                          <h5 className="font-medium text-foreground text-sm">
                            {step.title}
                          </h5>
                          <div className="flex items-center gap-2 shrink-0">
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
                            {step.howTo?.map((howToItem: string, i: number) => (
                              <li key={i} className="flex items-start gap-2 text-xs text-foreground">
                                <ChevronRight className="w-3 h-3 text-accent shrink-0 mt-0.5" />
                                <span>{howToItem}</span>
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
              <div className="grid grid-cols-3 gap-2 mt-3">
                <div className="text-center p-2 bg-background/50 rounded-lg">
                  <div className="text-sm sm:text-base font-bold text-foreground">Medio-Alto</div>
                  <div className="text-[10px] text-muted-foreground">Impacto</div>
                </div>
                <div className="text-center p-2 bg-background/50 rounded-lg">
                  <div className="text-sm sm:text-base font-bold text-foreground">2-4 sem</div>
                  <div className="text-[10px] text-muted-foreground">Tiempo</div>
                </div>
                <div className="text-center p-2 bg-background/50 rounded-lg">
                  <div className="text-sm sm:text-base font-bold text-foreground">Bajo</div>
                  <div className="text-[10px] text-muted-foreground">Riesgo</div>
                </div>
              </div>
            </div>

            {/* Confidence & Source - Fixed source display */}
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
              
              {/* Source with clean display */}
              <div className="flex flex-col gap-1 pt-2 border-t border-border/30">
                <span className="text-[10px] text-muted-foreground uppercase">Fuente:</span>
                <div className="flex items-center gap-2 flex-wrap">
                  {sourceInfo.url ? (
                    <a 
                      href={sourceInfo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline flex items-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {sourceInfo.domain}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-xs text-foreground">{sourceInfo.domain}</span>
                  )}
                  {sourceInfo.date && (
                    <Badge variant="outline" className="text-[10px]">
                      {sourceInfo.date}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Actions - Fixed at bottom */}
        <div className="shrink-0 pt-4 border-t border-border/50 mt-2">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Button variant="outline" size="sm" onClick={onDismiss} className="text-xs h-9">
              <ThumbsDown className="w-3 h-3 mr-1" />
              <span className="truncate">No me interesa</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={onDismiss} className="text-xs h-9">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              <span className="truncate">Ya lo conozco</span>
            </Button>
            <Button variant="outline" size="sm" onClick={onSave} className="text-xs h-9">
              {item.is_saved ? (
                <>
                  <BookmarkCheck className="w-3 h-3 mr-1 text-primary" />
                  <span className="truncate">Guardado</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-3 h-3 mr-1" />
                  <span className="truncate">Guardar</span>
                </>
              )}
            </Button>
            {onApply && (
              <Button 
                size="sm" 
                className="gradient-primary text-xs h-9 col-span-2 sm:col-span-1" 
                onClick={onApply}
                disabled={applyLoading}
              >
                <Rocket className={cn("w-3 h-3 mr-1", applyLoading && "animate-spin")} />
                <span className="truncate">{applyLoading ? "Creando..." : "Aplicar"}</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }
);

LearningDetailCard.displayName = "LearningDetailCard";

export default LearningDetailCard;
