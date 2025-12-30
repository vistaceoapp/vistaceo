import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, Clock, Zap, Eye, Building2, Sparkles,
  Target, CheckCircle2, AlertCircle, Shield
} from "lucide-react";
import { cn } from "@/lib/utils";
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
                INTERNO
              </Badge>
              {isQuickWin && (
                <Badge className="text-[10px] bg-success/10 text-success border-success/20">
                  <Zap className="w-2.5 h-2.5 mr-1" />
                  Quick Win
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
      className="group p-5 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-xl transition-all cursor-pointer"
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-[10px] bg-primary/5 border-primary/20">
            <Building2 className="w-2.5 h-2.5 mr-1" />
            INTERNO
          </Badge>
          {isQuickWin && (
            <Badge className="text-[10px] bg-success/10 text-success border-success/20">
              <Zap className="w-2.5 h-2.5 mr-1" />
              Quick Win
            </Badge>
          )}
        </div>
        <Badge variant="outline" className={cn("text-[10px] border", confidenceInfo.bgColor, confidenceInfo.color)}>
          <Shield className="w-2.5 h-2.5 mr-1" />
          Confianza {confidenceInfo.label}
        </Badge>
      </div>
      
      {/* Title & Description */}
      <div className="flex items-start gap-3 mb-4">
        <span className="text-2xl">{getSourceIcon(opportunity.source)}</span>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground text-base group-hover:text-primary transition-colors">
            {opportunity.title}
          </h3>
          {opportunity.description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {opportunity.description}
            </p>
          )}
        </div>
      </div>
      
      {/* Metrics */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        <div className={cn("p-2 rounded-lg text-center", impactInfo.bgColor)}>
          <div className="flex items-center justify-center gap-1 mb-1">
            <TrendingUp className={cn("w-3 h-3", impactInfo.color)} />
          </div>
          <div className={cn("text-sm font-semibold", impactInfo.color)}>
            {impactInfo.label}
          </div>
          <div className="text-[10px] text-muted-foreground">Impacto</div>
        </div>
        
        <div className="p-2 rounded-lg text-center bg-secondary/50">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Zap className={cn("w-3 h-3", effortInfo.color)} />
          </div>
          <div className={cn("text-sm font-semibold", effortInfo.color)}>
            {effortInfo.label}
          </div>
          <div className="text-[10px] text-muted-foreground">Esfuerzo</div>
        </div>
        
        <div className="p-2 rounded-lg text-center bg-secondary/50">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Clock className="w-3 h-3 text-muted-foreground" />
          </div>
          <div className="text-sm font-semibold text-foreground">
            {timeEstimate.split(" ")[0]}
          </div>
          <div className="text-[10px] text-muted-foreground">Tiempo</div>
        </div>
        
        <div className={cn("p-2 rounded-lg text-center", confidenceInfo.bgColor)}>
          <div className="flex items-center justify-center gap-1 mb-1">
            <CheckCircle2 className={cn("w-3 h-3", confidenceInfo.color)} />
          </div>
          <div className={cn("text-sm font-semibold", confidenceInfo.color)}>
            {confidence}%
          </div>
          <div className="text-[10px] text-muted-foreground">Confianza</div>
        </div>
      </div>
      
      {/* Drivers */}
      {drivers.length > 0 && (
        <div className="flex items-center gap-2 mb-4">
          <span className="text-[10px] text-muted-foreground">Impacta:</span>
          <div className="flex gap-1 flex-wrap">
            {drivers.slice(0, 3).map((driver, i) => (
              <Badge key={i} variant="secondary" className="text-[10px]">
                {driver}
              </Badge>
            ))}
          </div>
        </div>
      )}
      
      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1"
          onClick={(e) => { e.stopPropagation(); onClick(); }}
        >
          <Eye className="w-3.5 h-3.5 mr-1.5" />
          Ver detalle
        </Button>
        {onQuickAction && (
          <Button 
            size="sm" 
            className="flex-1 gradient-primary"
            onClick={(e) => { e.stopPropagation(); onQuickAction(); }}
          >
            <Target className="w-3.5 h-3.5 mr-1.5" />
            Convertir
          </Button>
        )}
      </div>
    </div>
  );
};

export default OpportunityCard;
