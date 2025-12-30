import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Building2, Target, TrendingUp, Clock, BarChart3, 
  CheckCircle2, ThumbsDown, Zap, AlertCircle, Database,
  Shield, ChevronRight, FileText, Lightbulb, AlertTriangle,
  Link2, Bookmark, HelpCircle, Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  QualityGateResult, 
  getTimeEstimate, 
  getImpactedDrivers,
  OpportunityEvidence
} from "@/lib/radarQualityGates";

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

interface OpportunityDetailEnhancedProps {
  opportunity: Opportunity;
  business: Business | null;
  qualityGate?: QualityGateResult;
  activeMissionsCount?: number;
  maxMissions?: number;
  isPro?: boolean;
  onDismiss: () => void;
  onAccept: () => void;
  onSaveForLater?: () => void;
  actionLoading: boolean;
}

// Get source-specific info
const getSourceInfo = (source: string | null) => {
  const sources: Record<string, { icon: string; label: string; color: string }> = {
    reviews: { icon: "⭐", label: "Reseñas", color: "text-warning" },
    sales: { icon: "💰", label: "Ventas", color: "text-success" },
    social: { icon: "📱", label: "Redes Sociales", color: "text-accent" },
    operations: { icon: "⚙️", label: "Operaciones", color: "text-primary" },
    traffic: { icon: "👥", label: "Tráfico", color: "text-info" },
    ai: { icon: "🤖", label: "Análisis IA", color: "text-primary" },
    checkin: { icon: "📋", label: "Check-ins", color: "text-accent" },
    health: { icon: "❤️", label: "Salud del negocio", color: "text-destructive" },
  };
  return sources[source || ""] || { icon: "💡", label: "Diagnóstico", color: "text-primary" };
};

// Impact bar component
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
      <span className="text-sm font-semibold text-foreground w-12">{score}/10</span>
    </div>
  );
};

// Generate business-specific trigger
const getTrigger = (opportunity: Opportunity, business: Business | null): string => {
  const evidence = opportunity.evidence as OpportunityEvidence | null;
  
  if (evidence?.trigger) return evidence.trigger;
  
  const businessName = business?.name || "tu negocio";
  const sourceInfo = getSourceInfo(opportunity.source);
  
  return `Detectado a través de ${sourceInfo.label.toLowerCase()} en ${businessName}`;
};

// Generate "why this applies" bullets
const getWhyItApplies = (opportunity: Opportunity, business: Business | null): string[] => {
  const evidence = opportunity.evidence as OpportunityEvidence | null;
  const bullets: string[] = [];
  const businessName = business?.name || "tu negocio";
  
  if (evidence?.signals?.length) {
    evidence.signals.slice(0, 2).forEach(signal => {
      bullets.push(signal);
    });
  }
  
  if (evidence?.basedOn?.length) {
    evidence.basedOn.slice(0, 2).forEach(reason => {
      bullets.push(reason);
    });
  }
  
  // Add source-specific bullets
  if (opportunity.source === "reviews") {
    bullets.push(`Patrón detectado en reseñas de ${businessName}`);
  } else if (opportunity.source === "sales") {
    bullets.push(`Análisis de transacciones indica oportunidad`);
  } else if (opportunity.source === "health") {
    bullets.push(`Score de salud sugiere área de mejora`);
  }
  
  if (bullets.length === 0) {
    bullets.push(`Aplica al rubro de ${business?.category || 'gastronomía'}`);
    bullets.push(`Basado en diagnóstico de ${businessName}`);
  }
  
  return bullets.slice(0, 4);
};

// Generate detailed action plan
const getActionPlan = (opportunity: Opportunity, business: Business | null) => {
  const evidence = opportunity.evidence as OpportunityEvidence | null;
  const businessName = business?.name || "tu negocio";
  
  if (evidence?.actionPlan?.length) {
    return evidence.actionPlan;
  }
  
  if (evidence?.steps?.length) {
    return evidence.steps.map((step: any, idx: number) => ({
      ...step,
      timeEstimate: step.time || `${15 + idx * 10} min`
    }));
  }
  
  // Generate default steps based on opportunity type
  return [
    {
      title: "Diagnóstico inicial",
      description: `Revisar el estado actual de ${businessName} en esta área`,
      timeEstimate: "15 min",
      howTo: [
        "Accede a tus datos actuales desde Analytics",
        "Identifica los puntos críticos mencionados"
      ],
      metric: "Claridad del problema"
    },
    {
      title: "Definir objetivo medible",
      description: "Establecer una meta concreta y un plazo",
      timeEstimate: "10 min",
      howTo: [
        "Define un número o porcentaje específico",
        "Establece un plazo realista (2-4 semanas)"
      ],
      metric: "KPI objetivo definido"
    },
    {
      title: "Planificar la acción",
      description: "Crear el plan detallado de implementación",
      timeEstimate: "20 min",
      howTo: [
        "Lista los recursos necesarios",
        "Asigna responsables si aplica"
      ],
      metric: "Plan documentado"
    },
    {
      title: "Ejecutar el cambio",
      description: "Implementar la mejora paso a paso",
      timeEstimate: "Variable",
      howTo: [
        "Comunica el cambio a tu equipo",
        "Documenta la implementación"
      ],
      metric: "Acción completada"
    },
    {
      title: "Medir resultados",
      description: "Validar el impacto después de 1-2 semanas",
      timeEstimate: "15 min",
      howTo: [
        "Compara datos antes vs después",
        "Registra los resultados en el sistema"
      ],
      metric: "Variación medida"
    }
  ];
};

// Get risks and dependencies
const getRisksAndDependencies = (opportunity: Opportunity) => {
  const evidence = opportunity.evidence as OpportunityEvidence | null;
  
  return {
    risks: evidence?.risks || [
      "Requiere consistencia en la implementación",
      "Resultados pueden variar según contexto"
    ],
    dependencies: evidence?.dependencies || [
      "Tiempo disponible para implementar",
      "Compromiso del equipo si aplica"
    ]
  };
};

export const OpportunityDetailEnhanced = ({
  opportunity,
  business,
  qualityGate,
  activeMissionsCount = 0,
  maxMissions = 2,
  isPro = false,
  onDismiss,
  onAccept,
  onSaveForLater,
  actionLoading
}: OpportunityDetailEnhancedProps) => {
  const sourceInfo = getSourceInfo(opportunity.source);
  const trigger = getTrigger(opportunity, business);
  const whyItApplies = getWhyItApplies(opportunity, business);
  const actionPlan = getActionPlan(opportunity, business);
  const { risks, dependencies } = getRisksAndDependencies(opportunity);
  const drivers = getImpactedDrivers(opportunity);
  const timeEstimate = getTimeEstimate(opportunity.effort_score);
  const confidence = qualityGate?.confidence || 50;
  
  // Check mission limits
  const atMissionLimit = activeMissionsCount >= maxMissions;
  const canConvert = !atMissionLimit || isPro;
  
  // Confidence color
  const getConfidenceColor = (conf: number) => {
    if (conf >= 70) return "text-success";
    if (conf >= 50) return "text-warning";
    return "text-muted-foreground";
  };
  
  return (
    <>
      <DialogHeader>
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <Badge variant="outline" className="text-[10px] bg-primary/5 border-primary/20">
            <Building2 className="w-3 h-3 mr-1" />
            INTERNO
          </Badge>
          <Badge variant="secondary" className={cn("text-[10px]", sourceInfo.color)}>
            <span className="mr-1">{sourceInfo.icon}</span>
            {sourceInfo.label}
          </Badge>
          {opportunity.impact_score >= 7 && opportunity.effort_score <= 4 && (
            <Badge className="text-[10px] bg-success/10 text-success border-success/20">
              <Zap className="w-3 h-3 mr-1" />
              Quick Win
            </Badge>
          )}
        </div>
        <DialogTitle className="text-xl leading-tight">{opportunity.title}</DialogTitle>
        <DialogDescription className="text-sm">
          Para {business?.name || "tu negocio"} • {business?.category || "Gastronomía"}
        </DialogDescription>
      </DialogHeader>

      <ScrollArea className="max-h-[65vh] pr-2">
        <div className="space-y-5 mt-4">
          {/* Qué es - 1 frase */}
          <div className="p-4 rounded-xl bg-secondary/30 border border-border">
            <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2 text-sm">
              <Lightbulb className="w-4 h-4 text-primary" />
              Qué es
            </h4>
            <p className="text-sm text-foreground leading-relaxed">
              {opportunity.description || "Oportunidad de mejora detectada para optimizar esta área de tu negocio."}
            </p>
          </div>

          {/* Disparador específico */}
          <div className="p-4 rounded-xl bg-accent/5 border border-accent/20">
            <h4 className="font-semibold text-accent mb-2 flex items-center gap-2 text-sm">
              <AlertCircle className="w-4 h-4" />
              Disparador específico
            </h4>
            <p className="text-sm text-foreground leading-relaxed">{trigger}</p>
          </div>

          {/* Por qué aplica a TU negocio */}
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
            <h4 className="font-semibold text-primary mb-3 flex items-center gap-2 text-sm">
              <Target className="w-4 h-4" />
              Por qué aplica a {business?.name || "tu negocio"}
            </h4>
            <ul className="space-y-2">
              {whyItApplies.map((bullet, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-foreground">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Qué mejora del score (drivers) */}
          <div className="p-4 rounded-xl bg-success/5 border border-success/20">
            <h4 className="font-semibold text-success mb-2 flex items-center gap-2 text-sm">
              <TrendingUp className="w-4 h-4" />
              Qué mejora del score
            </h4>
            <div className="flex gap-2 flex-wrap">
              {drivers.map((driver, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs bg-success/10 text-success">
                  {driver}
                </Badge>
              ))}
            </div>
          </div>

          {/* Impact & Effort & Time & Confidence */}
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
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-secondary/50">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Tiempo estimado</span>
              </div>
              <p className="text-lg font-semibold text-foreground">{timeEstimate}</p>
            </div>
            <div className="p-4 rounded-xl bg-secondary/50">
              <div className="flex items-center gap-2 mb-1">
                <Shield className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Confianza</span>
              </div>
              <div className="flex items-center gap-2">
                <p className={cn("text-lg font-semibold", getConfidenceColor(confidence))}>
                  {confidence}/100
                </p>
                <Progress value={confidence} className="flex-1 h-2" />
              </div>
            </div>
          </div>

          {/* Plan de acción detallado */}
          <div>
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              Plan de acción ({actionPlan.length} pasos)
            </h4>
            <div className="space-y-3">
              {actionPlan.slice(0, 6).map((step: any, idx: number) => (
                <div key={idx} className="p-4 rounded-xl bg-secondary/30 border border-border/50">
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold shrink-0">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
                        <h5 className="font-medium text-foreground text-sm">
                          {step.title}
                        </h5>
                        <Badge variant="outline" className="text-[10px]">
                          <Clock className="w-3 h-3 mr-1" />
                          {step.timeEstimate || step.time}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {step.description}
                      </p>
                      
                      {step.howTo?.length > 0 && (
                        <div className="bg-background/50 rounded-lg p-2 mb-2">
                          <p className="text-[10px] font-medium text-muted-foreground uppercase mb-1">Cómo hacerlo:</p>
                          <ul className="space-y-1">
                            {step.howTo.slice(0, 3).map((item: string, i: number) => (
                              <li key={i} className="flex items-start gap-2 text-xs text-foreground">
                                <ChevronRight className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {step.metric && (
                        <div className="flex items-center gap-2">
                          <BarChart3 className="w-3 h-3 text-muted-foreground" />
                          <span className="text-[10px] text-muted-foreground">
                            Métrica: <span className="text-foreground font-medium">{step.metric}</span>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Riesgos + Dependencias */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/20">
              <h4 className="font-semibold text-destructive mb-2 flex items-center gap-2 text-sm">
                <AlertTriangle className="w-4 h-4" />
                Riesgos
              </h4>
              <ul className="space-y-1.5">
                {risks.slice(0, 2).map((risk, idx) => (
                  <li key={idx} className="text-xs text-foreground flex items-start gap-2">
                    <span className="text-destructive">•</span>
                    {risk}
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-4 rounded-xl bg-secondary/50 border border-border">
              <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2 text-sm">
                <Link2 className="w-4 h-4 text-muted-foreground" />
                Dependencias
              </h4>
              <ul className="space-y-1.5">
                {dependencies.slice(0, 2).map((dep, idx) => (
                  <li key={idx} className="text-xs text-foreground flex items-start gap-2">
                    <span className="text-muted-foreground">•</span>
                    {dep}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Quality Gate Info */}
          {qualityGate && (
            <div className="p-4 rounded-xl bg-secondary/30 border border-border">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-foreground flex items-center gap-2 text-sm">
                  <Database className="w-4 h-4 text-muted-foreground" />
                  Validación de calidad
                </h4>
                <Badge variant="outline" className={cn("text-xs", getConfidenceColor(qualityGate.score))}>
                  {qualityGate.score}% aprobado
                </Badge>
              </div>
              <div className="flex flex-wrap gap-1">
                {qualityGate.gates.map((gate, idx) => (
                  <Badge 
                    key={idx} 
                    variant="outline" 
                    className={cn(
                      "text-[10px]",
                      gate.passed ? "text-success border-success/30" : "text-muted-foreground border-border"
                    )}
                  >
                    {gate.passed ? "✓" : "○"} {gate.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Mission Limit Warning */}
          {atMissionLimit && !isPro && (
            <div className="p-4 rounded-xl bg-warning/10 border border-warning/30">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-warning shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Ya tienes {activeMissionsCount} misiones activas
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Los usuarios Free pueden tener hasta {maxMissions} misiones en paralelo. 
                    Pausa una misión actual, guarda esta oportunidad, o actualiza a Pro para misiones ilimitadas.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
            <Button variant="outline" size="sm" onClick={onDismiss}>
              <ThumbsDown className="w-4 h-4 mr-1" />
              No me interesa
            </Button>
            
            {onSaveForLater && (
              <Button variant="ghost" size="sm" onClick={onSaveForLater}>
                <Bookmark className="w-4 h-4 mr-1" />
                Guardar
              </Button>
            )}
            
            <Button 
              size="sm" 
              className={cn("flex-1", canConvert ? "gradient-primary" : "bg-muted")}
              onClick={onAccept} 
              disabled={actionLoading || (!canConvert && !isPro)}
            >
              {actionLoading ? (
                <>
                  <Sparkles className="w-4 h-4 mr-1 animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  <Target className="w-4 h-4 mr-1" />
                  Convertir en Misión
                </>
              )}
            </Button>
          </div>
          
          {/* Pro CTA if at limit */}
          {atMissionLimit && !isPro && (
            <div className="text-center">
              <Button variant="link" size="sm" className="text-primary">
                <Sparkles className="w-3 h-3 mr-1" />
                Desbloquear misiones ilimitadas con Pro
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>
    </>
  );
};

export default OpportunityDetailEnhanced;
