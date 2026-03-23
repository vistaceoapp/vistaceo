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

/** Animated arc for score visualization */
const ScoreArc = ({ score, size = 100 }: { score: number; size?: number }) => {
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const style = getScoreStyle(score);

  const getStrokeColor = (s: number) => {
    if (s >= 60) return 'hsl(var(--success))';
    if (s >= 40) return 'hsl(var(--warning))';
    return 'hsl(var(--destructive))';
  };

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="hsl(var(--muted) / 0.3)"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={getStrokeColor(score)}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={circumference - progress}
        strokeLinecap="round"
        className="transition-all duration-1000 ease-out"
      />
    </svg>
  );
};

/** Color-coded progress bar */
const DimensionBar = forwardRef<HTMLDivElement, { value: number; className?: string }>(
  ({ value, className }, ref) => {
    const getBarColor = (v: number) => {
      if (v >= 60) return 'bg-success';
      if (v >= 40) return 'bg-warning';
      return 'bg-destructive';
    };

    return (
      <div ref={ref} className={cn('relative h-1 w-full rounded-full bg-muted/30 overflow-hidden', className)}>
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
      <div className="rounded-2xl border border-border/50 bg-card overflow-hidden transition-all duration-300 hover:shadow-[var(--shadow-md)]">
        <div className="p-5">
          {/* Header row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-semibold text-muted-foreground tracking-widest uppercase">
                Salud del negocio
              </h3>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="w-3.5 h-3.5 text-muted-foreground/40 cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-[240px] text-xs">
                  <p>Puntaje de 0 a 100 basado en 7 dimensiones clave. Se actualiza con cada dato nuevo.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-muted-foreground/60 hover:text-foreground transition-colors p-1 -mr-1"
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {/* Score + dimensions layout */}
          <div className="flex items-start gap-5">
            {/* Score circle */}
            <button
              onClick={handleScoreClick}
              disabled={isSyncing}
              className="flex-shrink-0 relative group cursor-pointer"
            >
              {hasScore ? (
                <div className="w-[88px] h-[88px] rounded-2xl bg-muted/20 flex flex-col items-center justify-center gap-0.5 group-hover:bg-muted/30 transition-colors">
                  <div className="flex items-baseline gap-0.5">
                    <span className={cn('text-3xl font-bold leading-none tracking-tight', scoreStyle.textColor)}>
                      {score}
                    </span>
                    {trend && (
                      <span className="ml-0.5">
                        {trend.direction === 'up' && <TrendingUp className="w-3 h-3 text-success" />}
                        {trend.direction === 'down' && <TrendingDown className="w-3 h-3 text-destructive" />}
                        {trend.direction === 'stable' && <Minus className="w-2.5 h-2.5 text-muted-foreground" />}
                      </span>
                    )}
                  </div>
                  <span className={cn('text-[9px] font-medium', scoreStyle.textColor)}>
                    {scoreStyle.label}
                  </span>
                </div>
              ) : (
                <div className="w-[88px] h-[88px] rounded-full border-2 border-dashed border-muted-foreground/20 flex flex-col items-center justify-center gap-1.5 hover:border-primary/30 transition-colors">
                  <RefreshCw className={cn('w-5 h-5 text-muted-foreground/60', isSyncing && 'animate-spin')} />
                  <span className="text-[9px] text-muted-foreground/60 font-medium">
                    {isSyncing ? 'Analizando...' : 'Diagnosticar'}
                  </span>
                </div>
              )}
            </button>

            {/* Dimension bars */}
            <div className="flex-1 space-y-2 pt-0.5">
              {/* Certainty micro-label */}
              <p className="text-[10px] text-muted-foreground/60 mb-2">
                {hasScore
                  ? `Certeza: ${precisionPct}% de datos`
                  : 'Respondé preguntas para tu primer diagnóstico'
                }
              </p>

              {visibleDimensions.map((dim) => (
                <div key={dim.id}>
                  <div className="flex items-center justify-between mb-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] leading-none">{dim.icon}</span>
                      <span className="text-[11px] text-muted-foreground">{dim.name}</span>
                    </div>
                    <span className={cn(
                      'text-[11px] font-semibold tabular-nums',
                      dim.value !== null ? getScoreStyle(dim.value).textColor : 'text-muted-foreground/30'
                    )}>
                      {dim.value !== null ? dim.value : '—'}
                    </span>
                  </div>
                  <DimensionBar value={dim.value ?? 0} />
                </div>
              ))}
            </div>
          </div>

          {/* Actionable insight — collapsed only */}
          {hasScore && weakest && weakest.value !== null && weakest.value < 60 && !expanded && (
            <div className="mt-4 pt-3 border-t border-border/20">
              <p className="text-[11px] text-muted-foreground leading-relaxed">
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
            <div className="mt-4 pt-4 border-t border-border/20 space-y-4 animate-fade-in">
              {/* Certainty bar */}
              <div>
                <div className="flex items-center justify-between text-[11px] mb-1.5">
                  <span className="text-muted-foreground">Certeza del análisis</span>
                  <span className={cn(
                    'font-semibold tabular-nums',
                    precisionPct >= 70 ? 'text-success' : precisionPct >= 40 ? 'text-warning' : 'text-destructive'
                  )}>
                    {precisionPct}%
                  </span>
                </div>
                <div className="relative h-1 bg-muted/30 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'absolute inset-y-0 left-0 rounded-full transition-all duration-700',
                      precisionPct >= 70 ? 'bg-success' : precisionPct >= 40 ? 'bg-warning' : 'bg-primary'
                    )}
                    style={{ width: `${precisionPct}%` }}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground/60 mt-1.5">
                  {precisionPct < 40
                    ? 'Más datos = diagnóstico más preciso'
                    : precisionPct < 70
                    ? 'Conectá integraciones para mayor certeza'
                    : 'Análisis confiable'}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {onSync && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-8 text-[11px] gap-1.5 rounded-xl"
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
                  className="flex-1 h-8 text-[11px] gap-1.5 text-primary hover:text-primary rounded-xl"
                  onClick={() => navigate('/app/diagnostic')}
                >
                  Diagnóstico completo
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
