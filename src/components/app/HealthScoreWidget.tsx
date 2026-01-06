import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  PlusCircle,
  ExternalLink,
} from 'lucide-react';
import {
  HEALTH_SUB_SCORES,
  getScoreLabel,
  getScoreStyle,
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

// Map dimension IDs to routes/actions for completing data
const DIMENSION_COMPLETE_ROUTES: Record<string, { route: string; label: string; integration?: string }> = {
  reputation: { route: '/app/diagnostic', label: 'Conectar Google', integration: 'google' },
  profitability: { route: '/app/diagnostic', label: 'Completar datos' },
  finances: { route: '/app/diagnostic', label: 'Completar datos' },
  efficiency: { route: '/app/diagnostic', label: 'Completar datos' },
  traffic: { route: '/app/diagnostic', label: 'Completar datos' },
  team: { route: '/app/diagnostic', label: 'Completar datos' },
  growth: { route: '/app/diagnostic', label: 'Completar datos' },
};

interface HealthScoreWidgetProps {
  subScores: Record<string, number | null>;
  previousScore?: number | null;
  /** % de certeza basado en datos disponibles (0-100) */
  precisionPct?: number;
  /** Score directo del snapshot (calculado por IA) */
  snapshotScore?: number | null;
  /** Callback para sincronizar/regenerar diagnóstico */
  onSync?: () => Promise<void>;
  /** Si está sincronizando */
  isSyncing?: boolean;
}

// Thresholds for certainty levels
const getCertaintyLabel = (pct: number) => {
  if (pct >= 70) return { label: 'Alta', color: 'text-success', bg: 'bg-success/10', icon: CheckCircle2 };
  if (pct >= 40) return { label: 'Media', color: 'text-amber-500', bg: 'bg-amber-500/10', icon: AlertTriangle };
  return { label: 'Baja', color: 'text-destructive', bg: 'bg-destructive/10', icon: AlertTriangle };
};

export const HealthScoreWidget = ({
  subScores,
  previousScore,
  precisionPct = 0,
  snapshotScore,
  onSync,
  isSyncing = false,
}: HealthScoreWidgetProps) => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  // Always use snapshot score from AI - no local fallback calculation
  const score = snapshotScore ?? 0;
  const hasScore = snapshotScore !== null && snapshotScore !== undefined;
  const { label, color } = getScoreLabel(score);

  // Use certainty from props (calculated from data completeness)
  const certaintyPct = precisionPct;
  const certainty = getCertaintyLabel(certaintyPct);
  const CertaintyIcon = certainty.icon;

  const getTrend = () => {
    if (previousScore == null || !hasScore) return null;
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

  // Use centralized score styling 
  const getSubScoreColor = (value: number | null) => {
    return getScoreStyle(value).textColor;
  };
  
  // Get style for main score
  const scoreStyle = getScoreStyle(score);

  return (
    <GlassCard className="p-0 overflow-hidden animate-fade-in">
      {/* Color stripe based on score - using solid color */}
      <div className={cn('h-1.5', scoreStyle.bgColorSolid)} />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-foreground">Salud de Negocio</h3>

            {/* Certainty badge */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium cursor-help transition-colors',
                      certainty.bg,
                      certainty.color,
                      'border',
                        certaintyPct >= 70
                          ? 'border-success/30'
                          : certaintyPct >= 40
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
                    {certaintyPct < 40
                      ? 'Agregá más datos e integraciones para aumentar la certeza'
                      : certaintyPct < 70
                      ? 'Conectá integraciones para un análisis más preciso'
                      : 'Tenés datos suficientes para un análisis confiable'}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {!hasScore && (
              <Badge
                variant="outline"
                className="text-[10px] bg-muted text-muted-foreground border-muted-foreground/30"
              >
                Sin diagnóstico
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            {/* Sync button */}
            {onSync && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2"
                      onClick={onSync}
                      disabled={isSyncing}
                    >
                      <RefreshCw className={cn('w-4 h-4', isSyncing && 'animate-spin')} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p className="text-xs">
                      {isSyncing ? 'Analizando...' : 'Actualizar diagnóstico con IA'}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            
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
        </div>

        {/* Main score */}
        <div className="flex items-center gap-6">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={hasScore ? handleScoreClick : onSync}
                  disabled={isSyncing}
                  className={cn(
                    'flex flex-col items-center justify-center p-4 rounded-2xl transition-all cursor-pointer',
                    'hover:scale-105 active:scale-95',
                    'ring-2 ring-offset-2 ring-offset-background',
                    scoreStyle.bgColor,
                    scoreStyle.ringColor
                  )}
                >
                  {hasScore ? (
                    <>
                      <div className="flex items-baseline gap-1">
                        <span className={cn('text-4xl font-bold', scoreStyle.textColor)}>{score}</span>
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
                      <Badge variant="outline" className={cn('mt-1 text-xs', scoreStyle.textColor)}>
                        {label}
                      </Badge>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <RefreshCw className={cn('w-8 h-8 text-muted-foreground', isSyncing && 'animate-spin')} />
                      <span className="text-xs text-muted-foreground">
                        {isSyncing ? 'Analizando...' : 'Generar diagnóstico'}
                      </span>
                    </div>
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="text-xs">
                  {hasScore ? 'Tocá para ver análisis completo' : 'Tocá para generar diagnóstico con IA'}
                </p>
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

        {/* Expanded sub-scores with complete buttons */}
        {expanded && (
          <div className="mt-4 pt-4 border-t border-border/50 space-y-3 animate-fade-in">
            {HEALTH_SUB_SCORES.map((sub) => {
              const value = subScores[sub.id];
              const hasData = value !== null;
              const completeConfig = DIMENSION_COMPLETE_ROUTES[sub.id];

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
                    {hasData ? (
                      <span className={cn('text-sm font-bold', getSubScoreColor(value))}>
                        {value}
                      </span>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs gap-1 text-primary hover:text-primary/80 hover:bg-primary/10"
                        onClick={() => navigate(completeConfig?.route || '/app/diagnostic')}
                      >
                        <PlusCircle className="w-3 h-3" />
                        {completeConfig?.label || 'Completar'}
                      </Button>
                    )}
                  </div>
                  {hasData ? (
                    <Progress value={value ?? 0} className="h-2" />
                  ) : (
                    <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-muted via-primary/20 to-muted animate-pulse" />
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {sub.source.map((src, i) => (
                        <span key={i} className="text-[10px] text-muted-foreground">
                          {src}
                          {i < sub.source.length - 1 ? ' •' : ''}
                        </span>
                      ))}
                    </div>
                    {hasData ? (
                      <span className="text-[10px] text-muted-foreground italic">
                        {sub.description}
                      </span>
                    ) : (
                      <span className="text-[10px] text-amber-500 font-medium flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Sin datos - responder para mejorar certeza
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Progress bar for certainty */}
        <div className="mt-4 pt-4 border-t border-border/50">
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-muted-foreground flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              Nivel de certeza del análisis
            </span>
            <span className={cn('font-medium', certainty.color)}>
              {certaintyPct}%
            </span>
          </div>
          <div className="relative h-2 bg-muted rounded-full overflow-hidden">
            {/* Target zones */}
            <div className="absolute inset-y-0 bg-amber-500/10" style={{ left: '40%', width: '30%' }} />
            <div className="absolute inset-y-0 right-0 bg-success/10" style={{ left: '70%' }} />
            {/* Current progress */}
            <div
              className={cn(
                'absolute inset-y-0 left-0 rounded-full transition-all duration-500',
                certaintyPct >= 70
                  ? 'bg-success'
                  : certaintyPct >= 40
                  ? 'bg-amber-500'
                  : 'bg-primary'
              )}
              style={{ width: `${certaintyPct}%` }}
            />
          </div>
          {/* Encouraging message */}
          <p className="text-[10px] text-muted-foreground text-center italic">
            {certaintyPct < 20
              ? '¡Buen comienzo! Cada dato mejora el análisis'
              : certaintyPct < 40
              ? 'Conectá Google o integraciones para más precisión'
              : certaintyPct < 60
              ? '¡Buen nivel! Más integraciones = mayor certeza'
              : certaintyPct < 80
              ? '¡Excelente! Análisis altamente confiable'
              : '¡Nivel experto! Recomendaciones ultra personalizadas'}
          </p>
        </div>
        </div>
      </div>
    </GlassCard>
  );
};
