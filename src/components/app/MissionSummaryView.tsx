import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Brain,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Flag,
  Gift,
  HelpCircle,
  Info,
  Lightbulb,
  RefreshCw,
  Shield,
  Sparkles,
  Target,
  Timer,
  TrendingUp,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";

interface Step {
  text: string;
  done: boolean;
  estimatedMinutes?: number;
  timeEstimate?: string;
}

interface EnhancedPlan {
  planTitle: string;
  planDescription: string;
  estimatedDuration: string;
  estimatedImpact: string;
  confidence: "high" | "medium" | "low";
  confidenceExplanation?: string;
  probabilityScore?: number;
  basedOn: string[];
  steps: Step[];
  businessSpecificTips: string[];
  potentialChallenges: string[];
  successMetrics: string[];
  dataGapsIdentified: string[];
  quickWins?: string[];
  weeklyMilestones?: { week: number; milestone: string; metric?: string }[];
  teamInvolvement?: string[];
  estimatedROI?: string;
  dependencies?: string[];
  riskLevel?: "low" | "medium" | "high";
  driversImpacted?: string[];
  competitorInsights?: {
    hasData: boolean;
    summary?: string;
    comparison?: string[];
  };
  expectedBenefit?: {
    range: string;
    confidence: "high" | "medium" | "low";
    timeframe?: string;
  };
  whatYouWillAchieve?: string[];
  definitionOfDone?: string;
  whyNow?: string[];
}

interface Mission {
  id: string;
  title: string;
  description: string | null;
  area: string | null;
  steps: unknown;
  current_step: number;
  status: string;
  impact_score: number;
  effort_score: number;
}

interface MissionSummaryViewProps {
  mission: Mission;
  enhancedPlan: EnhancedPlan | null;
  loading: boolean;
  regenerating: boolean;
  estimatedTimeRemaining: number;
  onRegenerate: () => void;
}

const confidenceConfig = {
  high: { label: "Alta", color: "text-success", bg: "bg-success/10", icon: Shield },
  medium: { label: "Media", color: "text-warning", bg: "bg-warning/10", icon: AlertTriangle },
  low: { label: "Baja", color: "text-muted-foreground", bg: "bg-muted", icon: HelpCircle },
};

const riskConfig = {
  low: { label: "Bajo", color: "text-success", bg: "bg-success/10" },
  medium: { label: "Medio", color: "text-warning", bg: "bg-warning/10" },
  high: { label: "Alto", color: "text-destructive", bg: "bg-destructive/10" },
};

const formatTime = (minutes: number) => {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
};

export const MissionSummaryView = ({
  mission,
  enhancedPlan,
  loading,
  regenerating,
  estimatedTimeRemaining,
  onRegenerate,
}: MissionSummaryViewProps) => {
  if (loading && !enhancedPlan) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full rounded-xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
        </div>
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
    );
  }

  const confidenceLevel = enhancedPlan?.confidence || "medium";
  const ConfidenceIcon = confidenceConfig[confidenceLevel].icon;
  const probabilityScore = enhancedPlan?.probabilityScore ?? 70;
  const riskLevel = enhancedPlan?.riskLevel || "medium";
  const expectedBenefit = enhancedPlan?.expectedBenefit;

  // Traceability: if a mission was created from Radar Externo (I+D), reflect it here.
  // We don't change UI/UX structure; only the label logic.
  const isExternalOrigin =
    mission.title?.trim().startsWith("[I+D]") ||
    (mission.description || "").includes("Radar Externo") ||
    (mission.description || "").includes("I+D");
  const originLabel = isExternalOrigin ? "Origen: Radar Externo (I+D)" : "Origen: Radar Interno";

  return (
    <div className="space-y-6">
      {/* A) Header resumen (card grande) */}
      <section className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-5 rounded-2xl border border-primary/20">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Brain className="w-7 h-7 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-bold text-foreground mb-1 line-clamp-2">
                {enhancedPlan?.planTitle || mission.title}
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                {enhancedPlan?.planDescription || mission.description}
              </p>
            </div>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onRegenerate}
                  disabled={regenerating}
                  className="flex-shrink-0"
                >
                  <RefreshCw className={cn("w-4 h-4", regenerating && "animate-spin")} />
                  <span className="ml-2 hidden sm:inline">Regenerar</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Actualizo con lo último que sé de tu negocio</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        {/* Pills */}
        <div className="flex flex-wrap gap-2">
          <Badge className={cn("text-xs", riskConfig[riskLevel].bg, riskConfig[riskLevel].color)}>
            <AlertTriangle className="w-3 h-3 mr-1" />
            Riesgo {riskConfig[riskLevel].label}
          </Badge>
          <Badge variant="outline" className="text-xs">
            <Sparkles className="w-3 h-3 mr-1" />
            {originLabel}
          </Badge>
          <Badge variant={mission.status === "active" ? "default" : "secondary"} className="text-xs">
            {mission.status === "active" ? "Activa" : "Pausada"}
          </Badge>
        </div>
      </section>

      {/* B) Métricas (cards) */}
      <section className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {/* Probability */}
        <div className="bg-card border border-border rounded-xl p-3">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="w-full text-left">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-primary" />
                  <span className="text-xs font-medium text-muted-foreground">Probabilidad</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-foreground">{probabilityScore}%</span>
                  <Badge className={cn("text-[9px]", confidenceConfig[confidenceLevel].bg, confidenceConfig[confidenceLevel].color)}>
                    {confidenceConfig[confidenceLevel].label}
                  </Badge>
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-xs">{enhancedPlan?.confidenceExplanation || "Calculado según señales de tu negocio y datos históricos similares."}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Impact */}
        <div className="bg-card border border-border rounded-xl p-3">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-success" />
            <span className="text-xs font-medium text-muted-foreground">Impacto</span>
          </div>
          <div className="text-xl font-bold text-foreground">{mission.impact_score}/10</div>
        </div>

        {/* Effort */}
        <div className="bg-card border border-border rounded-xl p-3">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-warning" />
            <span className="text-xs font-medium text-muted-foreground">Esfuerzo</span>
          </div>
          <div className="text-xl font-bold text-foreground">{mission.effort_score}/10</div>
        </div>

        {/* Time */}
        <div className="bg-card border border-border rounded-xl p-3">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="w-full text-left">
                <div className="flex items-center gap-2 mb-2">
                  <Timer className="w-4 h-4 text-accent" />
                  <span className="text-xs font-medium text-muted-foreground">Tiempo restante</span>
                </div>
                <div className="text-xl font-bold text-foreground">{formatTime(estimatedTimeRemaining)}</div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Se calcula con la suma de pasos pendientes</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Expected Benefit (NEW) */}
        <div className="bg-card border border-border rounded-xl p-3 col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 mb-2">
            <Gift className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium text-muted-foreground">Beneficio esperado</span>
          </div>
          {expectedBenefit ? (
            <div>
              <div className="text-sm font-bold text-foreground">{expectedBenefit.range}</div>
              <div className="flex items-center gap-1 mt-0.5">
                <Badge className={cn("text-[8px]", confidenceConfig[expectedBenefit.confidence].bg, confidenceConfig[expectedBenefit.confidence].color)}>
                  Confianza {confidenceConfig[expectedBenefit.confidence].label}
                </Badge>
                {expectedBenefit.timeframe && (
                  <span className="text-[10px] text-muted-foreground">({expectedBenefit.timeframe})</span>
                )}
              </div>
            </div>
          ) : (
            <div className="text-sm font-bold text-foreground">+10-15% ticket</div>
          )}
        </div>
      </section>

      {/* C) Qué vas a lograr */}
      {(enhancedPlan?.whatYouWillAchieve || enhancedPlan?.successMetrics) && (
        <section className="bg-success/5 border border-success/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="w-5 h-5 text-success" />
            <h3 className="font-semibold text-foreground text-sm">Qué vas a lograr</h3>
          </div>
          <ul className="space-y-2 mb-3">
            {(enhancedPlan?.whatYouWillAchieve || enhancedPlan?.successMetrics)?.slice(0, 3).map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-foreground">
                <CheckCircle2 className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
          {enhancedPlan?.definitionOfDone && (
            <div className="bg-background/50 rounded-lg p-3 border border-success/10">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Hecho cuando:</span>
              <p className="text-sm text-foreground mt-1">{enhancedPlan.definitionOfDone}</p>
            </div>
          )}
        </section>
      )}

      {/* D) Por qué esta misión te conviene ahora */}
      {(enhancedPlan?.basedOn || enhancedPlan?.whyNow) && (
        <section className="bg-primary/5 border border-primary/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground text-sm">Por qué esta misión te conviene ahora</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {(enhancedPlan?.whyNow || enhancedPlan?.basedOn)?.slice(0, 6).map((signal, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                {signal}
              </Badge>
            ))}
          </div>
          {/* Drivers impacted */}
          {enhancedPlan?.driversImpacted && enhancedPlan.driversImpacted.length > 0 && (
            <div className="mt-3 pt-3 border-t border-primary/10 flex items-center gap-2 flex-wrap">
              <span className="text-xs text-muted-foreground">Drivers impactados:</span>
              {enhancedPlan.driversImpacted.map((driver, idx) => (
                <Badge key={idx} variant="outline" className="text-[10px] border-primary/30 text-primary">
                  {driver}
                </Badge>
              ))}
            </div>
          )}
        </section>
      )}

      {/* E) Plan general (Milestones) */}
      {enhancedPlan?.weeklyMilestones && enhancedPlan.weeklyMilestones.length > 0 && (
        <section className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-5 h-5 text-accent" />
            <h3 className="font-semibold text-foreground text-sm">Plan general</h3>
          </div>
          <div className="space-y-3">
            {enhancedPlan.weeklyMilestones.map((milestone, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-accent">S{milestone.week}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{milestone.milestone}</p>
                  {milestone.metric && (
                    <p className="text-xs text-muted-foreground mt-0.5">{milestone.metric}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* F) Competencia / Mercado */}
      <section className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Building2 className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground text-sm">Competencia / Mercado</h3>
          {!enhancedPlan?.competitorInsights?.hasData && (
            <Badge variant="outline" className="text-[9px] ml-auto">
              Estimado
            </Badge>
          )}
        </div>
        {enhancedPlan?.competitorInsights?.hasData ? (
          <>
            {enhancedPlan.competitorInsights.summary && (
              <p className="text-sm text-muted-foreground mb-3">
                {enhancedPlan.competitorInsights.summary}
              </p>
            )}
            {enhancedPlan.competitorInsights.comparison && (
              <ul className="space-y-2">
                {enhancedPlan.competitorInsights.comparison.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-foreground">
                    <ArrowRight className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : (
          <div className="text-center py-4">
            <p className="text-xs text-muted-foreground mb-3">
              Basado en datos de mercado similares. Conecta Google Business para datos reales de tu zona.
            </p>
            <Badge variant="secondary" className="text-xs mb-3">
              Confianza: Media
            </Badge>
            <Button variant="outline" size="sm" className="w-full mt-2">
              <Sparkles className="w-4 h-4 mr-2" />
              Conectar Pro para comparación real
            </Button>
          </div>
        )}
      </section>

      {/* G) Riesgos y Dependencias */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Risks */}
        {enhancedPlan?.potentialChallenges && enhancedPlan.potentialChallenges.length > 0 && (
          <section className="bg-destructive/5 border border-destructive/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-5 h-5 text-destructive" />
              <h3 className="font-semibold text-foreground text-sm">Riesgos y cómo evitarlos</h3>
            </div>
            <ul className="space-y-2">
              {enhancedPlan.potentialChallenges.slice(0, 4).map((challenge, idx) => {
                // Handle both string and object formats
                const challengeText = typeof challenge === 'string' 
                  ? challenge 
                  : typeof challenge === 'object' && challenge !== null
                    ? (challenge as { challenge?: string; solution?: string }).challenge 
                      ? `${(challenge as { challenge?: string; solution?: string }).challenge}${(challenge as { challenge?: string; solution?: string }).solution ? ` → ${(challenge as { challenge?: string; solution?: string }).solution}` : ''}`
                      : JSON.stringify(challenge)
                    : String(challenge);
                return (
                  <li key={idx} className="flex items-start gap-2 text-sm text-foreground">
                    <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                    {challengeText}
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {/* Dependencies */}
        {enhancedPlan?.dependencies && enhancedPlan.dependencies.length > 0 && (
          <section className="bg-accent/5 border border-accent/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-5 h-5 text-accent" />
              <h3 className="font-semibold text-foreground text-sm">Dependencias</h3>
            </div>
            <ul className="space-y-2">
              {enhancedPlan.dependencies.map((dep, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-foreground">
                  <ArrowRight className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                  {dep}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      {/* Quick wins */}
      {enhancedPlan?.quickWins && enhancedPlan.quickWins.length > 0 && (
        <section className="bg-warning/5 border border-warning/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-5 h-5 text-warning" />
            <h3 className="font-semibold text-foreground text-sm">Quick wins</h3>
          </div>
          <ul className="space-y-2">
            {enhancedPlan.quickWins.map((win, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-foreground">
                <Gift className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
                {win}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};
