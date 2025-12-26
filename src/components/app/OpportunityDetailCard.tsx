import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Building2, Target, TrendingUp, Clock, BarChart3, 
  CheckCircle2, ThumbsDown, Zap, AlertCircle, Database,
  MessageSquare, Star, ShoppingCart, Users, Sparkles,
  ChevronRight, FileText, Lightbulb
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Opportunity {
  id: string;
  title: string;
  description: string | null;
  source: string | null;
  evidence: unknown;
  impact_score: number;
  effort_score: number;
  is_converted: boolean;
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

interface OpportunityDetailCardProps {
  opportunity: Opportunity;
  business: Business | null;
  onDismiss: () => void;
  onAccept: () => void;
  actionLoading: boolean;
}

// Get source-specific icon and label
const getSourceInfo = (source: string | null) => {
  switch (source) {
    case "reviews":
      return { icon: Star, label: "Reseñas", color: "text-warning" };
    case "sales":
      return { icon: ShoppingCart, label: "Ventas", color: "text-success" };
    case "social":
      return { icon: MessageSquare, label: "Redes Sociales", color: "text-accent" };
    case "operations":
      return { icon: BarChart3, label: "Operaciones", color: "text-primary" };
    case "traffic":
      return { icon: Users, label: "Tráfico", color: "text-info" };
    case "ai":
      return { icon: Sparkles, label: "Análisis IA", color: "text-primary" };
    default:
      return { icon: Lightbulb, label: "Diagnóstico", color: "text-primary" };
  }
};

// Generate business-specific trigger based on evidence
const getTrigger = (opportunity: Opportunity, business: Business | null): string => {
  const evidence = opportunity.evidence as Record<string, any> | null;
  
  if (evidence?.trigger) return evidence.trigger;
  
  // Generate contextual trigger based on source and business
  const businessName = business?.name || "tu negocio";
  const category = business?.category || "gastronomía";
  
  switch (opportunity.source) {
    case "reviews":
      return `Se detectó un patrón en las reseñas de ${businessName} que indica oportunidad de mejora`;
    case "sales":
      return `El análisis de transacciones muestra potencial de optimización`;
    case "operations":
      return `Los datos operativos sugieren áreas de eficiencia`;
    default:
      return `Basado en el análisis de ${businessName} en el rubro ${category}`;
  }
};

// Generate detailed, business-specific steps
const getDetailedSteps = (opportunity: Opportunity, business: Business | null) => {
  const evidence = opportunity.evidence as Record<string, any> | null;
  
  if (evidence?.steps && Array.isArray(evidence.steps)) {
    return evidence.steps;
  }
  
  // Generate contextual steps based on source and title
  const businessName = business?.name || "tu negocio";
  const category = business?.category || "gastronomía";
  const avgTicket = business?.avg_ticket;
  const currency = business?.currency || "$";
  
  // Default intelligent steps based on opportunity type
  const baseSteps = [
    {
      title: "Diagnóstico inicial",
      description: `Revisar la situación actual de ${businessName} en esta área específica`,
      time: "15 min",
      howTo: [
        "Accede a tus datos actuales desde el panel de Analytics",
        "Identifica los puntos críticos mencionados en esta oportunidad"
      ],
      metric: "Claridad del problema"
    },
    {
      title: "Definir meta concreta",
      description: `Establecer un objetivo medible para ${businessName}`,
      time: "10 min",
      howTo: [
        "Define un número o porcentaje específico de mejora",
        "Establece un plazo realista (ej: 2-4 semanas)"
      ],
      metric: opportunity.source === "reviews" 
        ? "Rating promedio objetivo" 
        : opportunity.source === "sales" 
          ? `Ticket promedio objetivo (${currency}${avgTicket ? Math.round(avgTicket * 1.1) : '---'})` 
          : "KPI definido"
    },
    {
      title: "Implementar acción",
      description: "Ejecutar el cambio principal recomendado",
      time: "30-60 min",
      howTo: [
        "Comunica el cambio a tu equipo si aplica",
        "Documenta la implementación para seguimiento"
      ],
      metric: "Acción completada"
    },
    {
      title: "Medir resultados",
      description: "Validar el impacto después de 1-2 semanas",
      time: "15 min",
      howTo: [
        "Compara los datos antes vs después",
        "Registra los resultados en el sistema"
      ],
      metric: "Variación porcentual"
    }
  ];
  
  return baseSteps;
};

// Get confidence level with detailed info
const getConfidenceInfo = (opportunity: Opportunity, hasIntegrations: boolean) => {
  const evidence = opportunity.evidence as Record<string, any> | null;
  const dataPoints = evidence?.dataPoints || 0;
  
  if (dataPoints >= 50 && hasIntegrations) {
    return {
      level: "Alta",
      color: "text-success",
      bgColor: "bg-success/10 border-success/20",
      note: "Basado en datos históricos reales de tu negocio",
      sources: evidence?.sources || ["Historial de ventas", "Reseñas", "Operaciones"]
    };
  }
  
  if (dataPoints >= 20 || hasIntegrations) {
    return {
      level: "Media",
      color: "text-warning",
      bgColor: "bg-warning/10 border-warning/20",
      note: "Estimación razonable, conectar más datos mejorará precisión",
      sources: evidence?.sources || ["Diagnóstico inicial", "Patrón detectado"]
    };
  }
  
  return {
    level: "Baja",
    color: "text-muted-foreground",
    bgColor: "bg-muted/50 border-border",
    note: "Faltan integraciones para mayor precisión",
    sources: ["Diagnóstico general"]
  };
};

// Impact dots visualization
const ImpactBar = ({ score, type }: { score: number; type: "impact" | "effort" }) => {
  const isImpact = type === "impact";
  const color = isImpact 
    ? score >= 7 ? "bg-success" : score >= 4 ? "bg-warning" : "bg-muted-foreground"
    : score <= 3 ? "bg-success" : score <= 6 ? "bg-warning" : "bg-destructive";
  
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
        <div 
          className={cn("h-full rounded-full transition-all", color)}
          style={{ width: `${score * 10}%` }}
        />
      </div>
      <span className="text-sm font-semibold text-foreground w-8">{score}/10</span>
    </div>
  );
};

export const OpportunityDetailCard = ({
  opportunity,
  business,
  onDismiss,
  onAccept,
  actionLoading
}: OpportunityDetailCardProps) => {
  const sourceInfo = getSourceInfo(opportunity.source);
  const SourceIcon = sourceInfo.icon;
  const trigger = getTrigger(opportunity, business);
  const steps = getDetailedSteps(opportunity, business);
  const confidence = getConfidenceInfo(opportunity, Boolean(business?.category));
  const evidence = opportunity.evidence as Record<string, any> | null;
  
  return (
    <>
      <DialogHeader>
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <Badge variant="outline" className="text-[10px] bg-primary/5 border-primary/20">
            <Building2 className="w-3 h-3 mr-1" />
            INTERNO
          </Badge>
          <Badge variant="secondary" className={cn("text-[10px]", sourceInfo.color)}>
            <SourceIcon className="w-3 h-3 mr-1" />
            {sourceInfo.label}
          </Badge>
        </div>
        <DialogTitle className="text-xl leading-tight">{opportunity.title}</DialogTitle>
        <DialogDescription className="text-sm">
          Para {business?.name || "tu negocio"} • {business?.category || "Gastronomía"}
        </DialogDescription>
      </DialogHeader>

      <ScrollArea className="max-h-[60vh] pr-2">
        <div className="space-y-5 mt-4">
          {/* Trigger - Por qué apareció */}
          <div className="p-4 rounded-xl bg-accent/5 border border-accent/20">
            <h4 className="font-semibold text-accent mb-2 flex items-center gap-2 text-sm">
              <AlertCircle className="w-4 h-4" />
              Disparador específico
            </h4>
            <p className="text-sm text-foreground leading-relaxed">{trigger}</p>
          </div>

          {/* Description - Qué brinda */}
          <div className="p-4 rounded-xl bg-success/5 border border-success/20">
            <h4 className="font-semibold text-success mb-2 flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4" />
              Qué ganarías
            </h4>
            <p className="text-sm text-foreground leading-relaxed">
              {opportunity.description || "Mejora potencial detectada para optimizar esta área de tu negocio."}
            </p>
          </div>

          {/* Impact & Effort */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-secondary/50">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-success" />
                <span className="text-sm font-medium text-foreground">Impacto</span>
              </div>
              <ImpactBar score={opportunity.impact_score} type="impact" />
            </div>
            <div className="p-4 rounded-xl bg-secondary/50">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-warning" />
                <span className="text-sm font-medium text-foreground">Esfuerzo</span>
              </div>
              <ImpactBar score={opportunity.effort_score} type="effort" />
            </div>
          </div>

          {/* Detailed Steps */}
          <div>
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              Plan de acción detallado
            </h4>
            <div className="space-y-3">
              {steps.map((step: any, idx: number) => (
                <div key={idx} className="p-4 rounded-xl bg-secondary/30 border border-border/50">
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold shrink-0">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h5 className="font-medium text-foreground text-sm">
                          {step.title}
                        </h5>
                        <Badge variant="outline" className="text-[10px]">
                          <Clock className="w-3 h-3 mr-1" />
                          {step.time}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {step.description}
                      </p>
                      
                      {/* How to */}
                      <div className="bg-background/50 rounded-lg p-2 mb-2">
                        <p className="text-[10px] font-medium text-muted-foreground uppercase mb-1">Cómo hacerlo:</p>
                        <ul className="space-y-1">
                          {step.howTo?.map((item: string, i: number) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-foreground">
                              <ChevronRight className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      {/* Metric */}
                      <div className="flex items-center gap-2">
                        <BarChart3 className="w-3 h-3 text-muted-foreground" />
                        <span className="text-[10px] text-muted-foreground">
                          Métrica: <span className="text-foreground font-medium">{step.metric}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Confidence & Sources */}
          <div className={cn("p-4 rounded-xl border", confidence.bgColor)}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Confianza</span>
              </div>
              <Badge variant="outline" className={cn("text-xs", confidence.color)}>
                {confidence.level}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mb-3">{confidence.note}</p>
            
            <div className="flex flex-wrap gap-1">
              <span className="text-[10px] text-muted-foreground mr-1">Basado en:</span>
              {confidence.sources.map((source: string, idx: number) => (
                <Badge key={idx} variant="secondary" className="text-[10px]">
                  {source}
                </Badge>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={onDismiss}>
              <ThumbsDown className="w-4 h-4 mr-1" />
              No me interesa
            </Button>
            <Button 
              size="sm" 
              className="flex-1 gradient-primary" 
              onClick={onAccept} 
              disabled={actionLoading}
            >
              <Target className="w-4 h-4 mr-1" />
              {actionLoading ? "Creando..." : "Convertir en Misión"}
            </Button>
          </div>
        </div>
      </ScrollArea>
    </>
  );
};

export default OpportunityDetailCard;
