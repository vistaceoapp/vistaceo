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
  Lock,
  Crown,
  Target,
  Brain
} from 'lucide-react';
import { GlassCard } from './GlassCard';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { invokeEdgeFunctionSafe } from '@/lib/edge-function-caller';

interface PrecisionRingWidgetProps {
  healthScore: number;
  precisionScore: number; // 0-100 based on questionsAnswered / questionsAvailable
  precisionLevel?: 'Básica' | 'Media' | 'Alta';
  answeredQuestions?: number;
  totalQuestions?: number;
  previousHealthScore?: number | null;
  isEstimated?: boolean;
  isPro?: boolean;
  onStartDiagnostic?: () => void;
}

const getPrecisionLabel = (score: number, level?: 'Básica' | 'Media' | 'Alta'): { label: string; color: string } => {
  if (level) {
    if (level === 'Alta') return { label: 'Alta', color: 'text-success' };
    if (level === 'Media') return { label: 'Media', color: 'text-primary' };
    return { label: 'Básica', color: 'text-amber-500' };
  }
  if (score >= 80) return { label: 'Alta', color: 'text-success' };
  if (score >= 50) return { label: 'Media', color: 'text-primary' };
  return { label: 'Básica', color: 'text-amber-500' };
};

const getScoreLabel = (score: number): { label: string; color: string } => {
  if (score >= 96) return { label: 'Excelente', color: 'text-health-excellent' };
  if (score >= 85) return { label: 'Muy bueno', color: 'text-health-veryGood' };
  if (score >= 70) return { label: 'Bueno', color: 'text-health-good' };
  if (score >= 50) return { label: 'Regular', color: 'text-health-regular' };
  if (score >= 30) return { label: 'Crítico', color: 'text-health-critical' };
  return { label: 'Muy crítico', color: 'text-health-veryCritical' };
};

// SVG Ring component
const ScoreRing = ({ 
  score, 
  size = 120, 
  strokeWidth = 10,
  color,
  label,
  subtitle
}: { 
  score: number; 
  size?: number; 
  strokeWidth?: number;
  color: string;
  label: string;
  subtitle: string;
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center">
      <svg width={size} height={size} className="-rotate-90">
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/20"
        />
        {/* Progress ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={cn(
            "transition-all duration-700 ease-out",
            color === 'health-good' && "text-health-good",
            color === 'health-veryGood' && "text-health-veryGood",
            color === 'health-excellent' && "text-health-excellent",
            color === 'health-regular' && "text-health-regular",
            color === 'health-critical' && "text-health-critical",
            color === 'health-veryCritical' && "text-health-veryCritical",
            color === 'primary' && "text-primary",
            color === 'success' && "text-success",
            color === 'amber' && "text-amber-500",
            color === 'destructive' && "text-destructive",
          )}
        />
      </svg>
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn(
          "text-2xl font-bold",
          color === 'health-good' && "text-health-good",
          color === 'health-veryGood' && "text-health-veryGood",
          color === 'health-excellent' && "text-health-excellent",
          color === 'health-regular' && "text-health-regular",
          color === 'health-critical' && "text-health-critical",
          color === 'health-veryCritical' && "text-health-veryCritical",
          color === 'primary' && "text-primary",
          color === 'success' && "text-success",
          color === 'amber' && "text-amber-500",
          color === 'destructive' && "text-destructive",
        )}>
          {score}
        </span>
        <span className="text-[10px] text-muted-foreground font-medium">{label}</span>
      </div>
      <span className="text-xs text-muted-foreground mt-2 font-medium">{subtitle}</span>
    </div>
  );
};

export const PrecisionRingWidget = ({ 
  healthScore, 
  precisionScore,
  precisionLevel,
  answeredQuestions,
  totalQuestions,
  previousHealthScore,
  isEstimated = false,
  isPro = false,
  onStartDiagnostic
}: PrecisionRingWidgetProps) => {
  const navigate = useNavigate();
  const [showPaywall, setShowPaywall] = useState(false);

  const healthInfo = getScoreLabel(healthScore);
  const precisionInfo = getPrecisionLabel(precisionScore, precisionLevel);

  const getTrend = () => {
    if (!previousHealthScore) return null;
    const diff = healthScore - previousHealthScore;
    if (diff > 2) return { direction: 'up', value: diff };
    if (diff < -2) return { direction: 'down', value: Math.abs(diff) };
    return { direction: 'stable', value: 0 };
  };

  const trend = getTrend();

  const handleDiagnosticClick = async () => {
    if (!isPro) {
      setShowPaywall(true);
      return;
    }

    // Flujo integrado silencioso: dispara análisis de gaps en background
    // y abre el chat con un prompt que despierta las preguntas inteligentes
    // dentro de la misma conversación (sin abrir un cuestionario aparte).
    if (onStartDiagnostic) {
      onStartDiagnostic();
      return;
    }

    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Lee businessId del contexto vía localStorage para no acoplar el hook
        const stored = localStorage.getItem('currentBusinessId');
        if (stored) {
          invokeEdgeFunctionSafe('brain-analyze-gaps', {
            body: { businessId: stored },
          }).catch(() => { /* best effort */ });
        }
      }
    } catch { /* best effort */ }

    const prompt = 'Ayudame a completar mi perfil. Hacé las preguntas más importantes que te falten para entender bien el negocio, una por una y sin tecnicismos.';
    navigate(`/app/chat?prompt=${encodeURIComponent(prompt)}`);
  };

  const getHealthColor = () => {
    if (healthScore >= 96) return 'health-excellent';
    if (healthScore >= 85) return 'health-veryGood';
    if (healthScore >= 70) return 'health-good';
    if (healthScore >= 50) return 'health-regular';
    if (healthScore >= 30) return 'health-critical';
    return 'health-veryCritical';
  };

  const getPrecisionColor = () => {
    if (precisionScore >= 80) return 'success';
    if (precisionScore >= 50) return 'primary';
    return 'amber';
  };

  return (
    <>
      <GlassCard className="p-0 overflow-hidden">
        {/* Color stripe based on health score */}
        <div className={cn(
          "h-1",
          healthScore >= 96 ? "bg-health-excellent" :
          healthScore >= 85 ? "bg-health-veryGood" :
          healthScore >= 70 ? "bg-health-good" :
          healthScore >= 50 ? "bg-health-regular" :
          healthScore >= 30 ? "bg-health-critical" :
          "bg-health-veryCritical"
        )} />

        <div className="p-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-foreground">Business Health</h3>
              {isEstimated && (
                <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-500 border-amber-500/30">
                  ~ESTIMADO
                </Badge>
              )}
            </div>
            {trend && (
              <div className="flex items-center gap-1 text-xs">
                {trend.direction === 'up' && (
                  <>
                    <TrendingUp className="w-3 h-3 text-success" />
                    <span className="text-success">+{trend.value}</span>
                  </>
                )}
                {trend.direction === 'down' && (
                  <>
                    <TrendingDown className="w-3 h-3 text-destructive" />
                    <span className="text-destructive">-{trend.value}</span>
                  </>
                )}
                {trend.direction === 'stable' && (
                  <Minus className="w-3 h-3 text-muted-foreground" />
                )}
              </div>
            )}
          </div>

          {/* Dual Rings */}
          <div className="flex items-center justify-center gap-8">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    onClick={() => {
                      const prompt = `Explicame por qué mi Business Health Score está en ${healthScore}`;
                      navigate(`/app/chat?prompt=${encodeURIComponent(prompt)}`);
                    }}
                    className="cursor-pointer hover:scale-105 transition-transform"
                  >
                    <ScoreRing 
                      score={healthScore} 
                      color={getHealthColor()} 
                      label={healthInfo.label}
                      subtitle="Salud"
                    />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Tocá para ver análisis completo</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <div className="w-px h-20 bg-border" />

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    onClick={handleDiagnosticClick}
                    className="cursor-pointer hover:scale-105 transition-transform relative"
                  >
                    <ScoreRing 
                      score={precisionScore} 
                      color={getPrecisionColor()} 
                      label={precisionInfo.label}
                      subtitle="Precisión"
                    />
                    {!isPro && precisionScore < 80 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center">
                        <Lock className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">
                    {isPro 
                      ? "Mejorá la precisión completando el diagnóstico" 
                      : "Hacete Pro para desbloquear"
                    }
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Precision text */}
          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              Precisión: <span className={cn("font-semibold", precisionInfo.color)}>{precisionInfo.label}</span>
              {answeredQuestions !== undefined && totalQuestions !== undefined && (
                <span className="text-xs ml-1">({answeredQuestions}/{totalQuestions})</span>
              )}
            </p>
            {precisionScore < 70 && (
              <p className="text-xs text-muted-foreground mt-1">
                Completá más para tener una noción más real de cómo estamos parados.
              </p>
            )}
          </div>

          {/* CTA Button */}
          <div className="mt-4 pt-4 border-t border-border/50">
            {isPro ? (
              <Button 
                className="w-full gap-2 gradient-primary"
                onClick={handleDiagnosticClick}
              >
                <Brain className="w-4 h-4" />
                Completar diagnóstico (3 min)
              </Button>
            ) : (
              <Button 
                variant="outline"
                className="w-full gap-2 relative overflow-hidden"
                onClick={handleDiagnosticClick}
              >
                <Lock className="w-4 h-4" />
                Completar diagnóstico (Pro)
                <Crown className="w-4 h-4 text-amber-500 ml-1" />
              </Button>
            )}
            {!isPro && (
              <p className="text-[11px] text-center text-muted-foreground mt-2">
                Hacete Pro para conocer tu negocio en serio.
              </p>
            )}
          </div>
        </div>
      </GlassCard>

      {/* Paywall Modal */}
      <Dialog open={showPaywall} onOpenChange={setShowPaywall}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mb-4">
              <Crown className="w-8 h-8 text-primary-foreground" />
            </div>
            <DialogTitle className="text-center text-2xl">Desbloqueá Pro</DialogTitle>
            <DialogDescription className="text-center">
              Accedé al Diagnóstico Profundo para conocer tu negocio en detalle y recibir recomendaciones más precisas.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-3">
              {[
                'Diagnóstico profundo adaptativo',
                'Precisión hasta 100%',
                'Widgets personalizados',
                'Alertas inteligentes',
                'Misiones avanzadas'
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center">
                    <Sparkles className="w-3 h-3 text-success" />
                  </div>
                  <span className="text-sm text-foreground">{feature}</span>
                </div>
              ))}
            </div>

            <Button 
              className="w-full gradient-primary mt-6" 
              size="lg"
              onClick={() => {
                setShowPaywall(false);
                navigate('/pricing');
              }}
            >
              <Crown className="w-5 h-5 mr-2" />
              Ver planes Pro
            </Button>

            <Button 
              variant="ghost" 
              className="w-full text-muted-foreground"
              onClick={() => setShowPaywall(false)}
            >
              Quizás más tarde
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
