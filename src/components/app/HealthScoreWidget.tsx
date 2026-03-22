import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  PlusCircle,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import {
  HEALTH_SUB_SCORES,
  getScoreStyle,
} from '@/lib/dashboardCards';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const DIMENSION_COMPLETE_ROUTES: Record<string, { route: string; label: string }> = {
  reputation: { route: '/app/diagnostic', label: 'Conectar Google' },
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
  precisionPct?: number;
  snapshotScore?: number | null;
  onSync?: () => Promise<void>;
  isSyncing?: boolean;
}

const getCertaintyInfo = (pct: number) => {
  if (pct >= 70) return { label: 'Alta', color: 'text-emerald-600 dark:text-emerald-400', icon: CheckCircle2 };
  if (pct >= 40) return { label: 'Media', color: 'text-amber-500', icon: AlertTriangle };
  return { label: 'Baja', color: 'text-red-500', icon: AlertTriangle };
};

/** Color-coded progress bar for each dimension */
const DimensionBar = ({ value, className }: { value: number; className?: string }) => {
  const getBarColor = (v: number) => {
    if (v >= 60) return 'bg-primary';
    if (v >= 40) return 'bg-warning';
    return 'bg-destructive';
  };

  return (
    <div className={cn('relative h-2 w-full rounded-full bg-muted/60 overflow-hidden', className)}>
      <div
        className={cn('absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out', getBarColor(value))}
        style={{ width: `${Math.max(value, 2)}%` }}
      />
    </div>
  );
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

  const score = snapshotScore ?? 0;
  const hasScore = snapshotScore !== null && snapshotScore !== undefined;
  const scoreStyle = getScoreStyle(score);
  const certainty = getCertaintyInfo(precisionPct);
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
    if (!hasScore) { onSync?.(); return; }
    const prompt = `Explicame por qué mi Salud de Negocio está en ${score} y qué puedo hacer para mejorarlo`;
    navigate(`/app/chat?prompt=${encodeURIComponent(prompt)}`);
  };

  // Sort by value descending, show first 4 that have data
  const visibleDimensions = HEALTH_SUB_SCORES
    .map(sub => ({ ...sub, value: subScores[sub.id] }))
    .sort((a, b) => (b.value ?? -1) - (a.value ?? -1))
    .slice(0, 4);

  return (
    <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-[var(--shadow-sm)] transition-all duration-300">
      {/* Top accent stripe */}
      <div className={cn('h-1', scoreStyle.bgColorSolid)} />

      <div className="p-5 space-y-4">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <h3 className="text-[15px] font-semibold text-foreground tracking-tight">
              Salud de Negocio
            </h3>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className={cn(
                    'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium cursor-help',
                    'border bg-card',
                    precisionPct >= 70 ? 'border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400'
                    : precisionPct >= 40 ? 'border-amber-200 dark:border-amber-800 text-amber-500'
                    : 'border-red-200 dark:border-red-800 text-red-500'
                  )}>
                    <CertaintyIcon className="w-3 h-3" />
                    {precisionPct}% certeza
                  </span>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-[200px]">
                  <p className="text-xs">
                    {precisionPct < 40
                      ? 'Agregá más datos para un análisis más confiable'
                      : precisionPct < 70
                      ? 'Conectá integraciones para mayor precisión'
                      : 'Análisis altamente confiable'}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>

        {/* Score + dimensions row */}
        <div className="flex items-start gap-5">
          {/* Score circle */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleScoreClick}
                  disabled={isSyncing}
                  className={cn(
                    'flex-shrink-0 flex flex-col items-center justify-center',
                    'w-[100px] h-[100px] rounded-2xl transition-all duration-200',
                    'cursor-pointer hover:scale-[1.03] active:scale-[0.97]',
                    'border-2',
                    hasScore ? [scoreStyle.bgColor, scoreStyle.borderColor] : 'bg-muted/30 border-border'
                  )}
                >
                  {hasScore ? (
                    <>
                      <div className="flex items-baseline gap-0.5">
                        <span className={cn('text-[2.5rem] font-bold leading-none tracking-tight', scoreStyle.textColor)}>
                          {score}
                        </span>
                        {trend && (
                          <span className="ml-0.5">
                            {trend.direction === 'up' && <TrendingUp className="w-4 h-4 text-emerald-500" />}
                            {trend.direction === 'down' && <TrendingDown className="w-4 h-4 text-red-500" />}
                            {trend.direction === 'stable' && <Minus className="w-3 h-3 text-muted-foreground" />}
                          </span>
                        )}
                      </div>
                      <span className={cn(
                        'text-[11px] font-semibold mt-1 px-2 py-0.5 rounded-full',
                        scoreStyle.bgColor, scoreStyle.textColor
                      )}>
                        {scoreStyle.label}
                      </span>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-1.5">
                      <RefreshCw className={cn('w-6 h-6 text-muted-foreground', isSyncing && 'animate-spin')} />
                      <span className="text-[10px] text-muted-foreground font-medium">
                        {isSyncing ? 'Analizando...' : 'Diagnosticar'}
                      </span>
                    </div>
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="text-xs">{hasScore ? 'Ver análisis completo' : 'Generar diagnóstico'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Dimension bars */}
          <div className="flex-1 space-y-3 pt-1">
            {visibleDimensions.map((dim) => (
              <div key={dim.id} className="flex items-center gap-2.5">
                <span className="text-base leading-none">{dim.icon}</span>
                <span className="text-[13px] text-muted-foreground w-[72px] truncate">{dim.name}</span>
                <div className="flex-1">
                  <DimensionBar value={dim.value ?? 0} />
                </div>
                <span className={cn(
                  'text-[13px] font-semibold w-7 text-right tabular-nums',
                  dim.value !== null ? getScoreStyle(dim.value).textColor : 'text-muted-foreground'
                )}>
                  {dim.value !== null ? dim.value : '—'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Expanded: all dimensions + certainty bar */}
        {expanded && (
          <div className="pt-4 border-t border-border/40 space-y-3 animate-fade-in">
            {/* Full dimension list */}
            {HEALTH_SUB_SCORES.map((sub) => {
              const value = subScores[sub.id];
              const hasData = value !== null;
              const completeConfig = DIMENSION_COMPLETE_ROUTES[sub.id];

              return (
                <div key={sub.id} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{sub.icon}</span>
                      <span className="text-sm font-medium text-foreground">{sub.name}</span>
                      <span className="text-[10px] text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded">
                        {Math.round(sub.weight * 100)}%
                      </span>
                    </div>
                    {hasData ? (
                      <span className={cn('text-sm font-bold tabular-nums', getScoreStyle(value).textColor)}>
                        {value}
                      </span>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs gap-1 text-primary hover:bg-primary/5"
                        onClick={() => navigate(completeConfig?.route || '/app/diagnostic')}
                      >
                        <PlusCircle className="w-3 h-3" />
                        {completeConfig?.label || 'Completar'}
                      </Button>
                    )}
                  </div>
                  {hasData ? (
                    <DimensionBar value={value ?? 0} className="h-2.5" />
                  ) : (
                    <div className="h-2.5 bg-muted/40 rounded-full overflow-hidden">
                      <div className="h-full w-full bg-gradient-to-r from-muted/0 via-primary/15 to-muted/0 animate-shimmer" />
                    </div>
                  )}
                  <p className="text-[10px] text-muted-foreground">
                    {hasData ? sub.description : (
                      <span className="text-amber-500 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 inline" />
                        Sin datos — completar para mayor certeza
                      </span>
                    )}
                  </p>
                </div>
              );
            })}

            {/* Certainty bar */}
            <div className="pt-3 border-t border-border/30 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Certeza del análisis
                </span>
                <span className={cn('font-semibold', certainty.color)}>
                  {precisionPct}%
                </span>
              </div>
              <div className="relative h-2 bg-muted/50 rounded-full overflow-hidden">
                <div
                  className={cn(
                    'absolute inset-y-0 left-0 rounded-full transition-all duration-700',
                    precisionPct >= 70 ? 'bg-emerald-500' : precisionPct >= 40 ? 'bg-amber-400' : 'bg-primary'
                  )}
                  style={{ width: `${precisionPct}%` }}
                />
              </div>
            </div>

            {/* Sync button */}
            {onSync && (
              <Button
                variant="outline"
                size="sm"
                className="w-full h-9 text-xs gap-2 mt-2 border-border/60"
                onClick={onSync}
                disabled={isSyncing}
              >
                <RefreshCw className={cn('w-3.5 h-3.5', isSyncing && 'animate-spin')} />
                {isSyncing ? 'Analizando con IA...' : 'Actualizar diagnóstico'}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
