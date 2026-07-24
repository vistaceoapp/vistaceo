import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, Clock, Zap, Eye, Building2, Sparkles,
  Target, CheckCircle2, AlertCircle, Shield
} from "lucide-react";
import { cn } from "@/lib/utils";
import { sanitizeAIOutput } from "@/lib/aiOutputSanitizer";
import { translateTag } from "@/lib/i18nTags";
import { 
  QualityGateResult, 
  getTimeEstimate, 
  getImpactedDrivers 
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

interface OpportunityCardProps {
  opportunity: Opportunity;
  qualityGate?: QualityGateResult;
  onClick: () => void;
  onQuickAction?: () => void;
  compact?: boolean;
}

// Impact level helper
const getImpactLevel = (score: number): { label: string; color: string; bgColor: string } => {
  if (score >= 8) return { label: "Alto", color: "text-success", bgColor: "bg-emerald-50 dark:bg-emerald-950/30" };
  if (score >= 5) return { label: "Medio", color: "text-warning", bgColor: "bg-amber-50 dark:bg-amber-950/30" };
  return { label: "Bajo", color: "text-muted-foreground", bgColor: "bg-secondary" };
};

// Effort level helper
const getEffortLevel = (score: number): { label: string; color: string } => {
  if (score <= 3) return { label: "Bajo", color: "text-success" };
  if (score <= 6) return { label: "Medio", color: "text-warning" };
  return { label: "Alto", color: "text-destructive" };
};

// Confidence badge helper
const getConfidenceBadge = (confidence: number): { label: string; color: string; bgColor: string } => {
  if (confidence >= 70) return { 
    label: `${confidence}%`, 
    color: "text-success", 
    bgColor: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800" 
  };
  if (confidence >= 50) return { 
    label: `${confidence}%`, 
    color: "text-warning", 
    bgColor: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800" 
  };
  return { 
    label: `${confidence}%`, 
    color: "text-muted-foreground", 
    bgColor: "bg-secondary border-border" 
  };
};

// Source icon helper
const getSourceIcon = (source: string | null): string => {
  switch (source) {
    case "reviews": return "⭐";
    case "sales": return "💰";
    case "social": return "📱";
    case "operations": return "⚙️";
    case "ai": return "🤖";
    case "checkin": return "📋";
    case "health": return "❤️";
    case "trend": return "📈";
    default: return "💡";
  }
};

export const OpportunityCard = ({
  opportunity,
  qualityGate,
  onClick,
  onQuickAction,
  compact = false
}: OpportunityCardProps) => {
  const impactInfo = getImpactLevel(opportunity.impact_score);
  const effortInfo = getEffortLevel(opportunity.effort_score);
  const confidence = qualityGate?.confidence || 50;
  const confidenceInfo = getConfidenceBadge(confidence);
  const timeEstimate = getTimeEstimate(opportunity.effort_score);
  const drivers = getImpactedDrivers(opportunity);
  
  // Quick win badge
  const isQuickWin = opportunity.impact_score >= 7 && opportunity.effort_score <= 4;
  
  if (compact) {
    return (
      <div 
        className="group p-4 rounded-xl bg-card border border-border hover:border-primary/30 hover:shadow-lg transition-all cursor-pointer"
        onClick={onClick}
      >
        <div className="flex items-start gap-3">
          <span className="text-2xl">{getSourceIcon(opportunity.source)}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <Badge variant="outline" className="text-[10px] bg-primary/5 border-primary/20">
                <Building2 className="w-2.5 h-2.5 mr-1" />
                Tu negocio
              </Badge>
              {isQuickWin && (
                <Badge className="text-[10px] bg-success/10 text-success border-success/20">
                  <Zap className="w-2.5 h-2.5 mr-1" />
                  Logro rápido
                </Badge>
              )}
            </div>
            
            <h3 className="font-semibold text-foreground text-sm line-clamp-2 group-hover:text-primary transition-colors">
              {opportunity.title}
            </h3>
            
            <div className="flex items-center gap-3 mt-2 text-xs">
              <span className={cn("flex items-center gap-1", impactInfo.color)}>
                <TrendingUp className="w-3 h-3" />
                {impactInfo.label}
              </span>
              <span className="text-muted-foreground">•</span>
              <span className={cn("flex items-center gap-1", effortInfo.color)}>
                <Zap className="w-3 h-3" />
                {effortInfo.label}
              </span>
              <span className="text-muted-foreground">•</span>
              <span className="flex items-center gap-1 text-muted-foreground">
                <Clock className="w-3 h-3" />
                {timeEstimate}
              </span>
            </div>
          </div>
          <Eye className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    );
  }
  
  return (
    <div 
      className="group p-4 sm:p-5 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-xl transition-all cursor-pointer"
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3 flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          <Badge variant="outline" className="text-[10px] bg-primary/5 border-primary/20">
            <Building2 className="w-2.5 h-2.5 mr-1" />
            Tu negocio
          </Badge>
          {isQuickWin && (
            <Badge className="text-[10px] bg-success/10 text-success border-success/20">
              <Zap className="w-2.5 h-2.5 mr-1" />
              Logro rápido
            </Badge>
          )}
        </div>
        <Badge variant="outline" className={cn("text-[10px] border", confidenceInfo.bgColor, confidenceInfo.color)}>
          <Shield className="w-2.5 h-2.5 mr-1" />
          {confidenceInfo.label}
        </Badge>

      </div>
      
      {/* Title & Description */}
      <div className="flex items-start gap-3 mb-4">
        <span className="text-2xl shrink-0">{getSourceIcon(opportunity.source)}</span>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground text-base leading-snug group-hover:text-primary transition-colors">
            {sanitizeAIOutput(opportunity.title)}
          </h3>
          {opportunity.description && (
            <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
              {sanitizeAIOutput(opportunity.description)}
            </p>
          )}
        </div>
      </div>
      
      {/* Metrics — 2x2 en mobile, 4 col en sm+ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        <div className={cn("p-2 rounded-lg text-center", impactInfo.bgColor)}>
          <div className="flex items-center justify-center gap-1 mb-0.5">
            <TrendingUp className={cn("w-3 h-3", impactInfo.color)} />
          </div>
          <div className={cn("text-sm font-semibold", impactInfo.color)}>
            {impactInfo.label}
          </div>
          <div className="text-[10px] text-muted-foreground">Impacto</div>
        </div>
        
        <div className="p-2 rounded-lg text-center bg-secondary/50">
          <div className="flex items-center justify-center gap-1 mb-0.5">
            <Zap className={cn("w-3 h-3", effortInfo.color)} />
          </div>
          <div className={cn("text-sm font-semibold", effortInfo.color)}>
            {effortInfo.label}
          </div>
          <div className="text-[10px] text-muted-foreground">Esfuerzo</div>
        </div>
        
        <div className="p-2 rounded-lg text-center bg-secondary/50">
          <div className="flex items-center justify-center gap-1 mb-0.5">
            <Clock className="w-3 h-3 text-muted-foreground" />
          </div>
          <div className="text-sm font-semibold text-foreground truncate">
            {timeEstimate.split(" ")[0]}
          </div>
          <div className="text-[10px] text-muted-foreground">Tiempo</div>
        </div>
        
        <div className={cn("p-2 rounded-lg text-center", confidenceInfo.bgColor)}>
          <div className="flex items-center justify-center gap-1 mb-0.5">
            <CheckCircle2 className={cn("w-3 h-3", confidenceInfo.color)} />
          </div>
          <div className={cn("text-sm font-semibold", confidenceInfo.color)}>
            {confidence}%
          </div>
          <div className="text-[10px] text-muted-foreground">Confianza</div>
        </div>
      </div>
      
      {/* Evidencia — "por qué te lo digo" */}
      {(() => {
        const ev = (opportunity.evidence ?? {}) as Record<string, unknown>;
        const trigger = typeof ev.trigger === "string" ? ev.trigger : "";
        const reason = typeof ev.recommendation_reason === "string" ? ev.recommendation_reason : "";
        const rawSignals = Array.isArray(ev.signals) ? (ev.signals as unknown[]) : [];
        const signals = rawSignals
          .map((s) => (typeof s === "string" ? s : ""))
          .filter((s) => s && !/^undefined_/i.test(s))
          .slice(0, 3);
        if (!trigger && !reason && signals.length === 0) return null;
        return (
          <div className="mb-4 p-3 rounded-lg bg-primary/5 border border-primary/10">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Sparkles className="w-3 h-3 text-primary" />
              <span className="text-[10px] font-semibold uppercase tracking-wide text-primary">Por qué te lo digo</span>
            </div>
            {trigger && (
              <p className="text-xs text-foreground/80 leading-relaxed line-clamp-3">
                {sanitizeAIOutput(trigger)}
              </p>
            )}
            {reason && reason !== trigger && (
              <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed line-clamp-2">
                {sanitizeAIOutput(reason)}
              </p>
            )}
            {signals.length > 0 && (
              <div className="flex gap-1 flex-wrap mt-2">
                {signals.map((s, i) => (
                  <Badge key={i} variant="outline" className="text-[9px] bg-background/60 border-primary/20 font-normal">
                    {sanitizeAIOutput(s).replace(/_/g, " ")}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        );
      })()}
      
      {/* Simulación de impacto — proyección numérica personalizada */}
      {(() => {
        const ev = (opportunity.evidence ?? {}) as Record<string, unknown>;
        const proj = (ev.projected_impact ?? ev.impact_projection ?? {}) as Record<string, unknown>;
        const revenue = typeof proj.revenue === "string" || typeof proj.revenue === "number" ? String(proj.revenue) : "";
        const timeline = typeof proj.timeline === "string" ? proj.timeline : "";
        const risk = typeof proj.risk === "string" ? proj.risk : "";
        const kpi = typeof proj.kpi === "string" ? proj.kpi : "";
        if (!revenue && !timeline && !risk && !kpi) return null;
        return (
          <div className="mb-4 p-3 rounded-lg bg-gradient-to-br from-primary/5 to-transparent border border-primary/10">
            <div className="flex items-center gap-1.5 mb-2">
              <TrendingUp className="w-3 h-3 text-primary" />
              <span className="text-[10px] font-semibold uppercase tracking-wide text-primary">Proyección de impacto</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              {revenue && (
                <div><span className="text-muted-foreground">Ingresos:</span> <span className="font-semibold text-foreground">{sanitizeAIOutput(revenue)}</span></div>
              )}
              {timeline && (
                <div><span className="text-muted-foreground">Plazo:</span> <span className="font-semibold text-foreground">{sanitizeAIOutput(timeline)}</span></div>
              )}
              {kpi && (
                <div className="col-span-2"><span className="text-muted-foreground">KPI:</span> <span className="font-semibold text-foreground">{sanitizeAIOutput(kpi)}</span></div>
              )}
              {risk && (
                <div className="col-span-2 flex items-start gap-1 text-amber-600 dark:text-amber-400">
                  <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
                  <span>{sanitizeAIOutput(risk)}</span>
                </div>
              )}
            </div>
          </div>
        );
      })()}
      
      {/* Drivers */}
      {drivers.length > 0 && (
        <div className="flex items-start gap-2 mb-4 flex-wrap">
          <span className="text-[10px] text-muted-foreground mt-1">Impacta:</span>
          <div className="flex gap-1 flex-wrap">
            {drivers.slice(0, 3).map((driver, i) => (
              <Badge key={i} variant="secondary" className="text-[10px]">
                {translateTag(driver, "")}
              </Badge>
            ))}
          </div>
        </div>
      )}

      
      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1 h-10"
          onClick={(e) => { e.stopPropagation(); onClick(); }}
        >
          <Eye className="w-3.5 h-3.5 mr-1.5" />
          Ver detalle
        </Button>
        {onQuickAction && (
          <Button 
            size="sm" 
            className="flex-1 h-10 gradient-primary text-white border-0 shadow-sm"
            onClick={(e) => { e.stopPropagation(); onQuickAction(); }}
          >
            <Target className="w-3.5 h-3.5 mr-1.5" />
            Activar misión
          </Button>
        )}
      </div>
    </div>
  );
};

export default OpportunityCard;
