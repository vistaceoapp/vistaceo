import { useState, forwardRef } from 'react';
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
  ArrowRight,
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
  if (pct >= 70) return { label: 'Alta', color: 'text-success', icon: CheckCircle2 };
  if (pct >= 40) return { label: 'Media', color: 'text-warning', icon: AlertTriangle };
  return { label: 'Baja', color: 'text-destructive', icon: AlertTriangle };
};

/** Color-coded progress bar — uses forwardRef to avoid React warnings */
const DimensionBar = forwardRef<HTMLDivElement, { value: number; className?: string }>(
  ({ value, className }, ref) => {
    const getBarColor = (v: number) => {
      if (v >= 60) return 'bg-primary';
      if (v >= 40) return 'bg-warning';
      return 'bg-destructive';
    };

    return (
      <div ref={ref} className={cn('relative h-1.5 w-full rounded-full bg-muted/50 overflow-hidden', className)}>
        <div
          className={cn('absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out', getBarColor(value))}
          style={{ width: `${Math.max(value, 2)}%` }}
        />
      </div>
    );
  }
);
DimensionBar.displayName = 'DimensionBar';

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

  // All 7 dimensions sorted by value
  const allDimensions = HEALTH_SUB_SCORES
    .map(sub => ({ ...sub, value: subScores[sub.id] }))
    .sort((a, b) => (b.value ?? -1) - (a.value ?? -1));

  const visibleDimensions = expanded ? allDimensions : allDimensions.slice(0, 4);

  return (
    <div className="rounded-2xl border border-border/50 bg-card overflow-hidden transition-all duration-300 hover:shadow-[var(--shadow-md)]">
      <div className="p-5 pb-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground tracking-tight">
              Salud del negocio
            </h3>
            <span className={cn(
              'inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium',
              'bg-muted/60',
              certainty.color
            )}>
              <CertaintyIcon className="w-2.5 h-2.5" />
              {precisionPct}%
            </span>
          </div>

          <button
            onClick={() => setExpanded(!expanded)}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 -mr-1"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {/* Score + Dimensions */}
        <div className="flex items-start gap-5">
          {/* Score */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleScoreClick}
                  disabled={isSyncing}
                  className={cn(
                    'flex-shrink-0 flex flex-col items-center justify-center',
                    'w-20 h-20 rounded-2xl transition-all duration-200',
                    'cursor-pointer hover:scale-[1.03] active:scale-[0.97]',
                    hasScore
                      ? [scoreStyle.bgColor, 'border border-transparent']
                      : 'bg-muted/20 border border-dashed border-border'
                  )}
                >
                  {hasScore ? (
                    <>
                      <div className="flex items-baseline">
                        <span className={cn('text-3xl font-bold leading-none tracking-tighter', scoreStyle.textColor)}>
                          {score}
                        </span>
                        {trend && (
                          <span className="ml-0.5">
                            {trend.direction === 'up' && <TrendingUp className="w-3.5 h-3.5 text-success" />}
                            {trend.direction === 'down' && <TrendingDown className="w-3.5 h-3.5 text-destructive" />}
                            {trend.direction === 'stable' && <Minus className="w-3 h-3 text-muted-foreground" />}
                          </span>
                        )}
                      </div>
                      <span className={cn('text-[10px] font-medium mt-0.5', scoreStyle.textColor)}>
                        {scoreStyle.label}
                      </span>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                      <RefreshCw className={cn('w-5 h-5 text-muted-foreground', isSyncing && 'animate-spin')} />
                      <span className="text-[9px] text-muted-foreground font-medium">
                        {isSyncing ? 'Analizando...' : 'Diagnosticar'}
                      </span>
                    </div>
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="text-xs">{hasScore ? 'Pedí análisis detallado' : 'Generar diagnóstico'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Dimension bars — compact */}
          <div className="flex-1 space-y-2.5 pt-0.5">
            {visibleDimensions.map((dim) => (
              <div key={dim.id} className="group">
                <div className="flex items-center justify-between mb-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs leading-none">{dim.icon}</span>
                    <span className="text-[12px] text-muted-foreground font-medium">{dim.name}</span>
                  </div>
                  <span className={cn(
                    'text-[12px] font-semibold tabular-nums',
                    dim.value !== null ? getScoreStyle(dim.value).textColor : 'text-muted-foreground/50'
                  )}>
                    {dim.value !== null ? dim.value : '—'}
                  </span>
                </div>
                <DimensionBar value={dim.value ?? 0} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="px-5 pb-5 pt-0 space-y-4 animate-fade-in">
          {/* Remaining dimensions if any */}
          {allDimensions.length > 4 && (
            <div className="pt-3 border-t border-border/30 space-y-3">
              {allDimensions.slice(4).map((dim) => {
                const hasData = dim.value !== null;
                const completeConfig = DIMENSION_COMPLETE_ROUTES[dim.id];

                return (
                  <div key={dim.id} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs">{dim.icon}</span>
                        <span className="text-[12px] font-medium text-foreground">{dim.name}</span>
                        <span className="text-[9px] text-muted-foreground bg-muted/50 px-1 py-0.5 rounded">
                          {Math.round(dim.weight * 100)}%
                        </span>
                      </div>
                      {hasData ? (
                        <span className={cn('text-[12px] font-bold tabular-nums', getScoreStyle(dim.value).textColor)}>
                          {dim.value}
                        </span>
                      ) : (
                        <button
                          onClick={() => navigate(completeConfig?.route || '/app/diagnostic')}
                          className="text-[10px] text-primary hover:underline flex items-center gap-0.5"
                        >
                          <PlusCircle className="w-2.5 h-2.5" />
                          {completeConfig?.label || 'Completar'}
                        </button>
                      )}
                    </div>
                    <DimensionBar value={dim.value ?? 0} className="h-1" />
                  </div>
                );
              })}
            </div>
          )}

          {/* Certainty bar */}
          <div className="pt-3 border-t border-border/30">
            <div className="flex items-center justify-between text-[11px] mb-1.5">
              <span className="text-muted-foreground flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Certeza del análisis
              </span>
              <span className={cn('font-semibold', certainty.color)}>
                {certainty.label} · {precisionPct}%
              </span>
            </div>
            <div className="relative h-1.5 bg-muted/40 rounded-full overflow-hidden">
              <div
                className={cn(
                  'absolute inset-y-0 left-0 rounded-full transition-all duration-700',
                  precisionPct >= 70 ? 'bg-success' : precisionPct >= 40 ? 'bg-warning' : 'bg-primary'
                )}
                style={{ width: `${precisionPct}%` }}
              />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1.5">
              {precisionPct < 40
                ? 'Respondé más preguntas para un análisis más preciso'
                : precisionPct < 70
                ? 'Conectá integraciones para subir la certeza'
                : 'Análisis confiable — datos suficientes'}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {onSync && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1 h-8 text-xs gap-1.5"
                onClick={onSync}
                disabled={isSyncing}
              >
                <RefreshCw className={cn('w-3 h-3', isSyncing && 'animate-spin')} />
                {isSyncing ? 'Analizando...' : 'Actualizar'}
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 h-8 text-xs gap-1.5 text-primary hover:text-primary"
              onClick={() => navigate('/app/diagnostic')}
            >
              Ver diagnóstico completo
              <ArrowRight className="w-3 h-3" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
