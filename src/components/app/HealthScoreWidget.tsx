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
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import {
  HEALTH_SUB_SCORES,
  calculateHealthScore,
  getScoreLabel,
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
  /** % de preguntas respondidas (0-100). Si no se pasa, se calcula de coverage */
  precisionPct?: number;
}

const getCertaintyLabel = (pct: number) => {
  if (pct >= 80) return { label: 'Alta', color: 'text-success', bg: 'bg-success/10', icon: CheckCircle2 };
  if (pct >= 50) return { label: 'Media', color: 'text-amber-500', bg: 'bg-amber-500/10', icon: AlertTriangle };
  return { label: 'Baja', color: 'text-destructive', bg: 'bg-destructive/10', icon: AlertTriangle };
};

export const HealthScoreWidget = ({
  subScores,
  previousScore,
  precisionPct,
}: HealthScoreWidgetProps) => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  const { score, isEstimated, coverage } = calculateHealthScore(subScores);
  const { label, color } = getScoreLabel(score);

  // Use precision passed in, else fallback to coverage
  const certaintyPct = precisionPct ?? coverage;
  const certainty = getCertaintyLabel(certaintyPct);
  const CertaintyIcon = certainty.icon;

  const getTrend = () => {
    if (previousScore == null) return null;
    const diff = score - previousScore;
    if (diff > 2) return { direction: 'up' as const, value: diff };
    if (diff < -2) return { direction: 'down' as const, value: Math.abs(diff) };
    return { direction: 'stable' as const, value: 0 };
  };

  const trend = getTrend();

  const handleScoreClick = () => {
    const prompt = `Explicame por qué mi Salud de Negocio está en ${score} y qué puedo hacer para mejorarlo`;
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
    <GlassCard className="p-0 overflow-hidden animate-fade-in">
      {/* Color stripe based on score */}
      <div
        className={cn(
          'h-1.5',
          score >= 75
            ? 'bg-success'
            : score >= 60
            ? 'bg-primary'
            : score >= 40
            ? 'bg-amber-500'
            : 'bg-destructive'
        )}
      />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-foreground">Salud de Negocio</h3>

            {/* Certainty badge - always visible */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium cursor-help transition-colors',
                      certainty.bg,
                      certainty.color,
                      'border',
                      certaintyPct >= 80
                        ? 'border-success/30'
                        : certaintyPct >= 50
                        ? 'border-amber-500/30'
                        : 'border-destructive/30'
                    )}
                  >
                    <CertaintyIcon className="w-3 h-3" />
                    {certaintyPct}% certeza
                  </span>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-[220px] text-center">
                  <p className="text-xs font-medium mb-1">
                    Nivel de certeza: {certainty.label}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {certaintyPct < 80
                      ? 'Respondé más preguntas para un análisis más preciso'
                      : 'Tenés datos suficientes para un análisis confiable'}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {isEstimated && certaintyPct < 50 && (
              <Badge
                variant="outline"
                className="text-[10px] bg-amber-500/10 text-amber-500 border-amber-500/30"
              >
                ~Estimado
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
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
                    'flex flex-col items-center justify-center p-4 rounded-2xl transition-all cursor-pointer',
                    'hover:scale-105 active:scale-95',
                    'ring-2 ring-offset-2 ring-offset-background',
                    score >= 75
                      ? 'bg-success/10 ring-success/30'
                      : score >= 60
                      ? 'bg-primary/10 ring-primary/30'
                      : score >= 40
                      ? 'bg-amber-500/10 ring-amber-500/30'
                      : 'bg-destructive/10 ring-destructive/30'
                  )}
                >
                  <div className="flex items-baseline gap-1">
                    <span className={cn('text-4xl font-bold', color)}>{score}</span>
                    {trend && (
                      <span className="flex items-center ml-1">
                        {trend.direction === 'up' && (
                          <TrendingUp className="w-4 h-4 text-success" />
                        )}
                        {trend.direction === 'down' && (
                          <TrendingDown className="w-4 h-4 text-destructive" />
                        )}
                        {trend.direction === 'stable' && (
                          <Minus className="w-3 h-3 text-muted-foreground" />
                        )}
                      </span>
                    )}
                  </div>
                  <Badge variant="outline" className={cn('mt-1 text-xs', color)}>
                    {label}
                  </Badge>
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="text-xs">Tocá para ver análisis completo</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Mini sub-scores preview - show first 4 */}
          <div className="flex-1 space-y-2">
            {HEALTH_SUB_SCORES.slice(0, 4).map((sub) => {
              const value = subScores[sub.id];
              return (
                <div key={sub.id} className="flex items-center gap-2">
                  <span className="text-sm">{sub.icon}</span>
                  <span className="text-xs text-muted-foreground w-20 truncate">
                    {sub.name}
                  </span>
                  <div className="flex-1">
                    <Progress value={value ?? 0} className="h-1.5" />
                  </div>
                  <span
                    className={cn(
                      'text-xs font-medium w-8 text-right',
                      getSubScoreColor(value)
                    )}
                  >
                    {value !== null ? value : '—'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Expanded sub-scores */}
        {expanded && (
          <div className="mt-4 pt-4 border-t border-border/50 space-y-3 animate-fade-in">
            {HEALTH_SUB_SCORES.map((sub) => {
              const value = subScores[sub.id];
              const hasData = value !== null;

              return (
                <div key={sub.id} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{sub.icon}</span>
                      <span className="text-sm font-medium">{sub.name}</span>
                      <Badge variant="secondary" className="text-[10px]">
                        {Math.round(sub.weight * 100)}%
                      </Badge>
                    </div>
                    <span className={cn('text-sm font-bold', getSubScoreColor(value))}>
                      {hasData ? value : 'Sin datos'}
                    </span>
                  </div>
                  <Progress value={value ?? 0} className="h-2" />
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {sub.source.map((src, i) => (
                        <span key={i} className="text-[10px] text-muted-foreground">
                          {src}
                          {i < sub.source.length - 1 ? ' •' : ''}
                        </span>
                      ))}
                    </div>
                    <span className="text-[10px] text-muted-foreground italic">
                      {sub.description}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* CTA Pro - Completar datos */}
        <div className="mt-4 pt-4 border-t border-border/50">
          <Button
            variant="outline"
            size="lg"
            className="w-full gap-3 h-auto py-4 px-5 relative overflow-hidden group
                       bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5
                       border-primary/20 hover:border-primary/40
                       hover:from-primary/10 hover:via-accent/10 hover:to-primary/10
                       transition-all duration-300"
            onClick={() => navigate('/app/diagnostic')}
          >
            {/* Shimmer effect */}
            <div
              className="absolute inset-0 -translate-x-full group-hover:translate-x-full 
                          bg-gradient-to-r from-transparent via-white/10 to-transparent 
                          transition-transform duration-700 ease-out"
            />

            <div className="relative flex items-center gap-3 w-full">
              <div
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent 
                              flex items-center justify-center shadow-lg shadow-primary/20
                              group-hover:scale-110 transition-transform duration-300"
              >
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-semibold text-foreground text-sm">
                  {certaintyPct < 80 ? 'Completar datos...' : 'Ver diagnóstico completo'}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {certaintyPct < 80
                    ? 'Aumentá la certeza para recomendaciones más precisas'
                    : 'Explorá oportunidades y riesgos de tu negocio'}
                </div>
              </div>
              <TrendingUp className="w-4 h-4 text-primary opacity-60 group-hover:opacity-100 transition-opacity" />
            </div>
          </Button>

        {/* Progress bar for certainty with journey message */}
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-muted-foreground flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              Camino a certeza máxima
            </span>
            <span className={cn('font-medium', certainty.color)}>
              {certaintyPct}% → 99%
            </span>
          </div>
          <div className="relative h-2 bg-muted rounded-full overflow-hidden">
            {/* Target zone indicator */}
            <div 
              className="absolute inset-y-0 right-0 w-[15%] bg-success/20 rounded-r-full"
              style={{ left: '85%' }}
            />
            {/* Current progress */}
            <div
              className={cn(
                'absolute inset-y-0 left-0 rounded-full transition-all duration-500',
                certaintyPct >= 80
                  ? 'bg-success'
                  : certaintyPct >= 50
                  ? 'bg-amber-500'
                  : 'bg-primary'
              )}
              style={{ width: `${certaintyPct}%` }}
            />
            {/* Milestone markers */}
            <div className="absolute inset-0 flex items-center justify-between px-1">
              <div className="w-0.5 h-1 bg-background/50 rounded-full" style={{ marginLeft: '25%' }} />
              <div className="w-0.5 h-1 bg-background/50 rounded-full" style={{ marginLeft: '25%' }} />
              <div className="w-0.5 h-1 bg-background/50 rounded-full" style={{ marginLeft: '25%' }} />
            </div>
          </div>
          {/* Encouraging message */}
          <p className="text-[10px] text-muted-foreground text-center italic">
            {certaintyPct < 30
              ? '¡Buen comienzo! Cada dato que agregues mejora las recomendaciones'
              : certaintyPct < 50
              ? '¡Vas muy bien! Seguí completando para análisis más precisos'
              : certaintyPct < 70
              ? '¡Excelente progreso! Ya podemos darte insights valiosos'
              : certaintyPct < 85
              ? '¡Casi llegás! Pocos datos más para máxima precisión'
              : '¡Nivel experto! Tus recomendaciones son altamente personalizadas'}
          </p>
        </div>
        </div>
      </div>
    </GlassCard>
  );
};
