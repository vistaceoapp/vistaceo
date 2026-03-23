import { useState, forwardRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  ArrowRight,
  HelpCircle,
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

/** Color-coded progress bar */
const DimensionBar = forwardRef<HTMLDivElement, { value: number; className?: string }>(
  ({ value, className }, ref) => {
    const getBarColor = (v: number) => {
      if (v >= 60) return 'bg-success';
      if (v >= 40) return 'bg-warning';
      return 'bg-destructive';
    };

    return (
      <div ref={ref} className={cn('relative h-1.5 w-full rounded-full bg-muted/40 overflow-hidden', className)}>
        <div
          className={cn('absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out', getBarColor(value))}
          style={{ width: `${Math.max(value, 2)}%` }}
        />
      </div>
    );
  }
);
DimensionBar.displayName = 'DimensionBar';

interface HealthScoreWidgetProps {
  subScores: Record<string, number | null>;
  previousScore?: number | null;
  precisionPct?: number;
  snapshotScore?: number | null;
  onSync?: () => Promise<void>;
  isSyncing?: boolean;
}

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

  // Show top 4 collapsed, all 7 expanded
  const visibleDimensions = expanded ? allDimensions : allDimensions.slice(0, 4);

  // Find weakest dimension for actionable tip
  const weakest = allDimensions.filter(d => d.value !== null).sort((a, b) => (a.value ?? 99) - (b.value ?? 99))[0];

  return (
    <TooltipProvider delayDuration={200}>
      <div className="rounded-2xl border border-border/60 bg-card overflow-hidden transition-all duration-300 hover:shadow-[var(--shadow-md)]">
        <div className="p-5">
          {/* Header row */}
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <h3 className="text-[13px] font-semibold text-foreground tracking-tight uppercase">
                Salud del negocio
              </h3>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="w-3.5 h-3.5 text-muted-foreground/50 cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-[240px] text-xs">
                  <p>Puntaje de 0 a 100 que refleja la salud integral de tu negocio en 7 dimensiones clave. Se actualiza con cada dato que aportás.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-muted-foreground hover:text-foreground transition-colors p-1 -mr-1"
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {/* Subtitle */}
          <p className="text-[11px] text-muted-foreground mb-4">
            {hasScore
              ? `Basado en ${precisionPct}% de datos recopilados`
              : 'Respondé preguntas para obtener tu primer diagnóstico'
            }
          </p>

          {/* Score circle + dimensions */}
          <div className="flex items-start gap-6">
            {/* Score circle */}
            <button
              onClick={handleScoreClick}
              disabled={isSyncing}
              className={cn(
                'flex-shrink-0 w-[92px] h-[92px] rounded-full flex flex-col items-center justify-center',
                'transition-all duration-200 cursor-pointer',
                'hover:scale-[1.03] active:scale-[0.97]',
                hasScore
                  ? 'border-2 border-current'
                  : 'border-2 border-dashed border-muted-foreground/30'
              )}
              style={hasScore ? { borderColor: `hsl(var(--${score >= 60 ? 'success' : score >= 40 ? 'warning' : 'destructive'}))` } : undefined}
            >
              {hasScore ? (
                <>
                  <div className="flex items-baseline gap-0.5">
                    <span className={cn('text-[34px] font-bold leading-none tracking-tighter', scoreStyle.textColor)}>
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
                <div className="flex flex-col items-center gap-1.5">
                  <RefreshCw className={cn('w-5 h-5 text-muted-foreground', isSyncing && 'animate-spin')} />
                  <span className="text-[9px] text-muted-foreground font-medium text-center px-2">
                    {isSyncing ? 'Analizando...' : 'Diagnosticar'}
                  </span>
                </div>
              )}
            </button>

            {/* Dimension bars */}
            <div className="flex-1 space-y-2.5 pt-0.5">
              {visibleDimensions.map((dim) => (
                <div key={dim.id}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] leading-none">{dim.icon}</span>
                      <span className="text-[12px] text-muted-foreground font-medium">{dim.name}</span>
                    </div>
                    <span className={cn(
                      'text-[12px] font-semibold tabular-nums',
                      dim.value !== null ? getScoreStyle(dim.value).textColor : 'text-muted-foreground/40'
                    )}>
                      {dim.value !== null ? dim.value : '—'}
                    </span>
                  </div>
                  <DimensionBar value={dim.value ?? 0} />
                </div>
              ))}
            </div>
          </div>

          {/* Actionable insight — always visible if we have a score */}
          {hasScore && weakest && weakest.value !== null && weakest.value < 60 && !expanded && (
            <div className="mt-4 pt-3 border-t border-border/30">
              <p className="text-[11px] text-muted-foreground">
                <span className="font-medium text-foreground">💡 Prioridad:</span>{' '}
                <span className="text-foreground/80">{weakest.name}</span> está en {weakest.value} — 
                <button 
                  onClick={() => navigate(`/app/chat?prompt=${encodeURIComponent(`Cómo puedo mejorar ${weakest.name} en mi negocio?`)}`)}
                  className="text-primary hover:underline ml-1 font-medium"
                >
                  ver cómo mejorar →
                </button>
              </p>
            </div>
          )}

          {/* Expanded: certainty + actions */}
          {expanded && (
            <div className="mt-5 pt-4 border-t border-border/40 space-y-4 animate-fade-in">
              {/* Certainty */}
              <div>
                <div className="flex items-center justify-between text-[11px] mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-muted-foreground">Certeza del análisis</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="w-3 h-3 text-muted-foreground/40 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-[200px] text-xs">
                        <p>Mientras más datos aportes (preguntas, check-ins, integraciones), más preciso es tu diagnóstico.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <span className={cn(
                    'font-semibold',
                    precisionPct >= 70 ? 'text-success' : precisionPct >= 40 ? 'text-warning' : 'text-destructive'
                  )}>
                    {precisionPct}%
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
                    className="flex-1 h-9 text-xs gap-1.5 rounded-xl"
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
                  className="flex-1 h-9 text-xs gap-1.5 text-primary hover:text-primary rounded-xl"
                  onClick={() => navigate('/app/diagnostic')}
                >
                  Ver diagnóstico completo
                  <ArrowRight className="w-3 h-3" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
};
