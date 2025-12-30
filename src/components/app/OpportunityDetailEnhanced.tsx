import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Building2, Target, TrendingUp, Clock, BarChart3, 
  CheckCircle2, Zap, AlertCircle,
  Shield, ChevronRight, FileText, Lightbulb, AlertTriangle,
  Link2, Bookmark, Sparkles, RefreshCw, Check
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
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

interface AIStep {
  stepNumber: number;
  title: string;
  description: string;
  timeEstimate: string;
  howTo: string[];
  why: string;
  metric: string;
  resources?: string[];
  tips?: string[];
  confidence: "high" | "medium" | "low";
  warnings?: string[];
}

interface AIPlan {
  planSummary: string;
  estimatedTotalTime: string;
  expectedResult: string;
  confidence: "high" | "medium" | "low";
  confidenceReason: string;
  steps: AIStep[];
  quickWins?: string[];
  risks?: string[];
  dependencies?: string[];
  successChecklist?: string[];
  dataGapsIdentified?: string[];
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
    evidence.signals.slice(0, 2).forEach(signal => bullets.push(signal));
  }
  if (evidence?.basedOn?.length) {
    evidence.basedOn.slice(0, 2).forEach(reason => bullets.push(reason));
  }
  if (opportunity.source === "reviews") {
    bullets.push(`Patrón detectado en reseñas de ${businessName}`);
  } else if (opportunity.source === "sales") {
    bullets.push(`Análisis de transacciones indica oportunidad`);
  }
  if (bullets.length === 0) {
    bullets.push(`Aplica al rubro de ${business?.category || 'gastronomía'}`);
    bullets.push(`Basado en diagnóstico de ${businessName}`);
  }
  return bullets.slice(0, 4);
};

const confidenceConfig = {
  high: { label: "Alta", color: "text-success", bg: "bg-success/10" },
  medium: { label: "Media", color: "text-warning", bg: "bg-warning/10" },
  low: { label: "Baja", color: "text-muted-foreground", bg: "bg-muted" }
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
  const [aiPlan, setAIPlan] = useState<AIPlan | null>(null);
  const [planLoading, setPlanLoading] = useState(false);
  const [planError, setPlanError] = useState(false);

  const sourceInfo = getSourceInfo(opportunity.source);
  const trigger = getTrigger(opportunity, business);
  const whyItApplies = getWhyItApplies(opportunity, business);
  const drivers = getImpactedDrivers(opportunity);
  const timeEstimate = getTimeEstimate(opportunity.effort_score);
  const confidence = qualityGate?.confidence || 50;
  const atMissionLimit = activeMissionsCount >= maxMissions;
  const canConvert = !atMissionLimit || isPro;

  // Fetch AI-generated plan when component mounts
  useEffect(() => {
    const fetchAIPlan = async () => {
      if (!business?.id) return;
      
      setPlanLoading(true);
      setPlanError(false);

      try {
        const { data, error } = await supabase.functions.invoke("generate-opportunity-plan", {
          body: { businessId: business.id, opportunityId: opportunity.id }
        });

        if (error) throw error;
        if (data?.plan) {
          setAIPlan(data.plan);
        }
      } catch (err) {
        console.error("Error fetching AI plan:", err);
        setPlanError(true);
      } finally {
        setPlanLoading(false);
      }
    };

    fetchAIPlan();
  }, [business?.id, opportunity.id]);

  const regeneratePlan = async () => {
    if (!business?.id) return;
    
    setPlanLoading(true);
    setPlanError(false);
    setAIPlan(null);

    try {
      const { data, error } = await supabase.functions.invoke("generate-opportunity-plan", {
        body: { businessId: business.id, opportunityId: opportunity.id }
      });

      if (error) throw error;
      if (data?.plan) {
        setAIPlan(data.plan);
        toast({ title: "Plan regenerado", description: "Se generó un nuevo plan personalizado" });
      }
    } catch (err) {
      console.error("Error regenerating plan:", err);
      setPlanError(true);
      toast({ title: "Error", description: "No se pudo regenerar el plan", variant: "destructive" });
    } finally {
      setPlanLoading(false);
    }
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
          {/* Qué es */}
          <div className="p-4 rounded-xl bg-secondary/30 border border-border">
            <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2 text-sm">
              <Lightbulb className="w-4 h-4 text-primary" />
              Qué es
            </h4>
            <p className="text-sm text-foreground leading-relaxed">
              {opportunity.description || "Oportunidad de mejora detectada para optimizar esta área de tu negocio."}
            </p>
          </div>

          {/* AI Plan Summary - if loaded */}
          {aiPlan && (
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/30">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-primary flex items-center gap-2 text-sm">
                  <Sparkles className="w-4 h-4" />
                  Plan Personalizado para {business?.name}
                </h4>
                <Button variant="ghost" size="sm" onClick={regeneratePlan} disabled={planLoading}>
                  <RefreshCw className={cn("w-3 h-3 mr-1", planLoading && "animate-spin")} />
                  Regenerar
                </Button>
              </div>
              <p className="text-sm text-foreground mb-3">{aiPlan.planSummary}</p>
              <div className="flex flex-wrap gap-2 text-xs">
                <Badge variant="outline" className="bg-background">
                  <Clock className="w-3 h-3 mr-1" />
                  {aiPlan.estimatedTotalTime}
                </Badge>
                <Badge variant="outline" className={cn("bg-background", confidenceConfig[aiPlan.confidence].color)}>
                  <Shield className="w-3 h-3 mr-1" />
                  Confianza: {confidenceConfig[aiPlan.confidence].label}
                </Badge>
              </div>
              {aiPlan.expectedResult && (
                <p className="text-xs text-success mt-2 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  Resultado esperado: {aiPlan.expectedResult}
                </p>
              )}
            </div>
          )}

          {/* Disparador específico */}
          <div className="p-4 rounded-xl bg-accent/5 border border-accent/20">
            <h4 className="font-semibold text-accent mb-2 flex items-center gap-2 text-sm">
              <AlertCircle className="w-4 h-4" />
              Disparador específico
            </h4>
            <p className="text-sm text-foreground leading-relaxed">{trigger}</p>
          </div>

          {/* Por qué aplica */}
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

          {/* Drivers + Metrics */}
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
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-secondary/50">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Tiempo estimado</span>
              </div>
              <p className="text-lg font-semibold text-foreground">
                {aiPlan?.estimatedTotalTime || timeEstimate}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-secondary/50">
              <div className="flex items-center gap-2 mb-1">
                <Shield className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Confianza</span>
              </div>
              <div className="flex items-center gap-2">
                <p className={cn("text-lg font-semibold", confidence >= 70 ? "text-success" : confidence >= 50 ? "text-warning" : "text-muted-foreground")}>
                  {confidence}/100
                </p>
                <Progress value={confidence} className="flex-1 h-2" />
              </div>
            </div>
          </div>

          {/* AI Plan Steps */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-foreground flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                Plan de acción personalizado
              </h4>
              {aiPlan && (
                <Badge variant="outline" className="text-[10px]">
                  {aiPlan.steps.length} pasos
                </Badge>
              )}
            </div>
            
            {planLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-4 rounded-xl bg-secondary/30 border border-border/50">
                    <div className="flex items-start gap-3">
                      <Skeleton className="w-7 h-7 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  </div>
                ))}
                <p className="text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                  Generando plan personalizado para {business?.name}...
                </p>
              </div>
            ) : planError ? (
              <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/20 text-center">
                <AlertTriangle className="w-8 h-8 text-destructive mx-auto mb-2" />
                <p className="text-sm text-foreground mb-2">No se pudo generar el plan</p>
                <Button variant="outline" size="sm" onClick={regeneratePlan}>
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Reintentar
                </Button>
              </div>
            ) : aiPlan?.steps ? (
              <div className="space-y-3">
                {aiPlan.steps.map((step, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-secondary/30 border border-border/50 hover:border-primary/30 transition-all">
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold shrink-0">
                        {step.stepNumber || idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
                          <h5 className="font-medium text-foreground text-sm">{step.title}</h5>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[10px]">
                              <Clock className="w-3 h-3 mr-1" />
                              {step.timeEstimate}
                            </Badge>
                            <Badge variant="outline" className={cn("text-[10px]", confidenceConfig[step.confidence || "medium"].bg, confidenceConfig[step.confidence || "medium"].color)}>
                              {confidenceConfig[step.confidence || "medium"].label}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{step.description}</p>
                        
                        {step.howTo?.length > 0 && (
                          <div className="bg-background/50 rounded-lg p-2 mb-2">
                            <p className="text-[10px] font-medium text-muted-foreground uppercase mb-1">Cómo hacerlo:</p>
                            <ul className="space-y-1">
                              {step.howTo.slice(0, 4).map((item, i) => (
                                <li key={i} className="flex items-start gap-2 text-xs text-foreground">
                                  <ChevronRight className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {step.why && (
                          <p className="text-[10px] text-muted-foreground mb-2 italic">
                            💡 {step.why}
                          </p>
                        )}
                        
                        <div className="flex flex-wrap gap-2">
                          {step.metric && (
                            <div className="flex items-center gap-1">
                              <BarChart3 className="w-3 h-3 text-muted-foreground" />
                              <span className="text-[10px] text-muted-foreground">
                                Métrica: <span className="text-foreground font-medium">{step.metric}</span>
                              </span>
                            </div>
                          )}
                        </div>

                        {step.tips?.length > 0 && (
                          <div className="mt-2 p-2 rounded-lg bg-primary/5">
                            <p className="text-[10px] text-primary font-medium">💡 {step.tips[0]}</p>
                          </div>
                        )}

                        {step.warnings?.length > 0 && (
                          <div className="mt-2 p-2 rounded-lg bg-warning/5">
                            <p className="text-[10px] text-warning font-medium">⚠️ {step.warnings[0]}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-secondary/30 border border-border text-center">
                <p className="text-sm text-muted-foreground">
                  El plan se generará al convertir en misión
                </p>
              </div>
            )}
          </div>

          {/* Quick Wins */}
          {aiPlan?.quickWins && aiPlan.quickWins.length > 0 && (
            <div className="p-4 rounded-xl bg-success/5 border border-success/20">
              <h4 className="font-semibold text-success mb-2 flex items-center gap-2 text-sm">
                <Zap className="w-4 h-4" />
                Quick Wins - Podés hacer hoy
              </h4>
              <ul className="space-y-1.5">
                {aiPlan.quickWins.map((win, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-foreground">
                    <Check className="w-3 h-3 text-success shrink-0 mt-0.5" />
                    {win}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Risks & Dependencies */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/20">
              <h4 className="font-semibold text-destructive mb-2 flex items-center gap-2 text-sm">
                <AlertTriangle className="w-4 h-4" />
                Riesgos
              </h4>
              <ul className="space-y-1.5">
                {(aiPlan?.risks || ["Requiere consistencia", "Resultados pueden variar"]).slice(0, 3).map((risk, idx) => (
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
                {(aiPlan?.dependencies || ["Tiempo disponible", "Compromiso del equipo"]).slice(0, 3).map((dep, idx) => (
                  <li key={idx} className="text-xs text-foreground flex items-start gap-2">
                    <span className="text-muted-foreground">•</span>
                    {dep}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Success Checklist */}
          {aiPlan?.successChecklist && aiPlan.successChecklist.length > 0 && (
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
              <h4 className="font-semibold text-primary mb-2 flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4" />
                Checklist de éxito
              </h4>
              <ul className="space-y-1.5">
                {aiPlan.successChecklist.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-foreground">
                    <div className="w-4 h-4 rounded border border-primary/30 shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Data Gaps */}
          {aiPlan?.dataGapsIdentified && aiPlan.dataGapsIdentified.length > 0 && (
            <div className="p-3 rounded-xl bg-warning/5 border border-warning/20">
              <p className="text-xs text-warning flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>
                  <strong>Para mejorar este plan:</strong> {aiPlan.dataGapsIdentified.join(". ")}
                </span>
              </p>
            </div>
          )}

          {/* Mission Limit Warning */}
          {atMissionLimit && !isPro && (
            <div className="p-4 rounded-xl bg-warning/10 border border-warning/30">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-warning" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground mb-1">Límite alcanzado</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Tenés {activeMissionsCount} misiones activas. Completá o pausá una para iniciar otra.
                  </p>
                  <Button variant="outline" size="sm" className="text-xs">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Con Pro: Misiones ilimitadas
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Action Buttons */}
      <div className="flex gap-2 mt-4 pt-4 border-t border-border">
        <Button variant="ghost" size="sm" onClick={onDismiss} disabled={actionLoading} className="text-muted-foreground">
          Descartar
        </Button>
        {onSaveForLater && (
          <Button variant="outline" size="sm" onClick={onSaveForLater} disabled={actionLoading}>
            <Bookmark className="w-4 h-4 mr-1" />
            Guardar
          </Button>
        )}
        <Button 
          className="flex-1" 
          onClick={onAccept}
          disabled={actionLoading || !canConvert || planLoading}
        >
          {actionLoading ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Convirtiendo...
            </>
          ) : (
            <>
              <Target className="w-4 h-4 mr-2" />
              Convertir en misión
            </>
          )}
        </Button>
      </div>
    </>
  );
};
