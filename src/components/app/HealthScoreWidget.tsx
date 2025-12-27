import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Info,
  ChevronDown,
  ChevronUp,
  Sparkles
} from 'lucide-react';
import { 
  HEALTH_SUB_SCORES, 
  calculateHealthScore, 
  getScoreLabel,
  HealthSubScore 
} from '@/lib/dashboardCards';
import { GlassCard } from './GlassCard';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface HealthScoreWidgetProps {
  subScores: Record<string, number | null>;
  previousScore?: number | null;
}

export const HealthScoreWidget = ({ subScores, previousScore }: HealthScoreWidgetProps) => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  const { score, isEstimated, coverage } = calculateHealthScore(subScores);
  const { label, color } = getScoreLabel(score);

  const getTrend = () => {
    if (!previousScore) return null;
    const diff = score - previousScore;
    if (diff > 2) return { direction: 'up', value: diff };
    if (diff < -2) return { direction: 'down', value: Math.abs(diff) };
    return { direction: 'stable', value: 0 };
  };

  const trend = getTrend();

  const handleScoreClick = () => {
    const prompt = `Explicame por qué mi Business Health Score está en ${score} y qué puedo hacer para mejorarlo`;
    navigate(`/app/chat?prompt=${encodeURIComponent(prompt)}`);
  };

  const getSubScoreColor = (value: number | null) => {
    if (value === null) return 'text-muted-foreground';
    if (value >= 75) return 'text-success';
    if (value >= 60) return 'text-primary';
    if (value >= 40) return 'text-amber-500';
    return 'text-destructive';
  };

  return (
    <GlassCard className="p-0 overflow-hidden">
      {/* Color stripe based on score */}
      <div className={cn(
        "h-1",
        score >= 75 ? "bg-success" :
        score >= 60 ? "bg-primary" :
        score >= 40 ? "bg-amber-500" :
        "bg-destructive"
      )} />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground">Business Health Score</h3>
            {isEstimated && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-500 border-amber-500/30">
                      ~ESTIMADO
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Cobertura de datos: {coverage}%</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 px-2"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>

        {/* Main score */}
        <div className="flex items-center gap-6">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={handleScoreClick}
                  className={cn(
                    "flex flex-col items-center justify-center p-4 rounded-2xl transition-all cursor-pointer",
                    "hover:scale-105 active:scale-95",
                    "ring-2 ring-offset-2 ring-offset-background",
                    score >= 75 ? "bg-success/10 ring-success/30" :
                    score >= 60 ? "bg-primary/10 ring-primary/30" :
                    score >= 40 ? "bg-amber-500/10 ring-amber-500/30" :
                    "bg-destructive/10 ring-destructive/30"
                  )}
                >
                  <div className="flex items-baseline gap-1">
                    <span className={cn("text-4xl font-bold", color)}>
                      {score}
                    </span>
                    {trend && (
                      <span className="flex items-center ml-1">
                        {trend.direction === 'up' && <TrendingUp className="w-4 h-4 text-success" />}
                        {trend.direction === 'down' && <TrendingDown className="w-4 h-4 text-destructive" />}
                        {trend.direction === 'stable' && <Minus className="w-3 h-3 text-muted-foreground" />}
                      </span>
                    )}
                  </div>
                  <Badge variant="outline" className={cn("mt-1 text-xs", color)}>
                    {label}
                  </Badge>
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="text-xs">Tocá para ver análisis completo</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Mini sub-scores preview */}
          <div className="flex-1 space-y-2">
            {HEALTH_SUB_SCORES.slice(0, 3).map(sub => {
              const value = subScores[sub.id];
              return (
                <div key={sub.id} className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-24 truncate">{sub.name}</span>
                  <div className="flex-1">
                    <Progress value={value || 0} className="h-1.5" />
                  </div>
                  <span className={cn("text-xs font-medium w-8 text-right", getSubScoreColor(value))}>
                    {value !== null ? value : '—'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Expanded sub-scores */}
        {expanded && (
          <div className="mt-4 pt-4 border-t border-border/50 space-y-3">
            {HEALTH_SUB_SCORES.map(sub => {
              const value = subScores[sub.id];
              const hasData = value !== null;
              
              return (
                <div key={sub.id} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{sub.name}</span>
                      <Badge variant="secondary" className="text-[10px]">
                        {Math.round(sub.weight * 100)}%
                      </Badge>
                    </div>
                    <span className={cn("text-sm font-bold", getSubScoreColor(value))}>
                      {hasData ? value : 'Sin datos'}
                    </span>
                  </div>
                  <Progress value={value || 0} className="h-2" />
                  <div className="flex flex-wrap gap-1">
                    {sub.source.map((src, i) => (
                      <span key={i} className="text-[10px] text-muted-foreground">
                        {src}{i < sub.source.length - 1 ? ' •' : ''}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* CTA if low coverage */}
        {coverage < 80 && (
          <div className="mt-4 pt-4 border-t border-border/50">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <Info className="w-3 h-3" />
              <span>Cobertura: {coverage}% • Mejorá con más datos</span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full gap-2"
              onClick={() => navigate('/app/more')}
            >
              <Sparkles className="w-4 h-4" />
              Completar datos
            </Button>
          </div>
        )}
      </div>
    </GlassCard>
  );
};
