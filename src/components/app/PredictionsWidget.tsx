import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Orbit, 
  TrendingUp, 
  AlertTriangle, 
  ChevronRight,
  Sparkles,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GlassCard } from './GlassCard';
import { usePredictions } from '@/hooks/use-predictions';
import { HORIZON_RINGS, PREDICTION_DOMAINS, type Prediction } from '@/lib/predictions/types';
import { cn } from '@/lib/utils';

// Mini orb visualization
const MiniOrb = memo(({ clarity, pulseState }: { clarity: number; pulseState: 'calm' | 'active' | 'urgent' }) => (
  <div className="relative w-16 h-16">
    {/* Outer glow */}
    <motion.div
      className={cn(
        "absolute inset-0 rounded-full blur-lg",
        pulseState === 'urgent' ? "bg-destructive/40" : 
        pulseState === 'active' ? "bg-primary/40" : "bg-primary/20"
      )}
      animate={{ 
        scale: [1, 1.1, 1],
        opacity: [0.5, 0.8, 0.5] 
      }}
      transition={{ 
        duration: pulseState === 'urgent' ? 1 : 2, 
        repeat: Infinity 
      }}
    />
    {/* Core sphere */}
    <div 
      className={cn(
        "absolute inset-2 rounded-full flex items-center justify-center",
        "bg-gradient-to-br from-primary/80 to-primary shadow-lg",
        pulseState === 'urgent' && "from-destructive/80 to-destructive"
      )}
      style={{ opacity: 0.5 + clarity * 0.5 }}
    >
      <Orbit className="w-6 h-6 text-primary-foreground" />
    </div>
    {/* Rings */}
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 64 64">
      <circle 
        cx="32" cy="32" r="28" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="0.5" 
        className="text-primary/30"
        strokeDasharray="4 2"
      />
      <circle 
        cx="32" cy="32" r="24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="0.5" 
        className="text-primary/20"
        strokeDasharray="2 2"
      />
    </svg>
  </div>
));
MiniOrb.displayName = 'MiniOrb';

// Prediction card mini
const PredictionCardMini = memo(({ prediction }: { prediction: Prediction }) => {
  const domainInfo = PREDICTION_DOMAINS[prediction.domain];
  const horizonInfo = HORIZON_RINGS[prediction.horizon_ring];
  
  return (
    <div className="flex items-center gap-3 p-2 rounded-lg bg-secondary/50 hover:bg-secondary/80 transition-colors">
      <div className={cn(
        "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold",
        prediction.is_breakpoint ? "bg-destructive/20 text-destructive" : "bg-primary/20 text-primary"
      )}>
        {Math.round(prediction.probability * 100)}%
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{prediction.title}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{domainInfo.label}</span>
          <span>•</span>
          <span>{horizonInfo.label}</span>
        </div>
      </div>
      {prediction.is_breakpoint && (
        <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />
      )}
    </div>
  );
});
PredictionCardMini.displayName = 'PredictionCardMini';

export const PredictionsWidget = memo(() => {
  const navigate = useNavigate();
  const { predictions, uiModel, loading, generateNewPredictions } = usePredictions();

  const topPredictions = predictions.slice(0, 3);
  const breakpoints = predictions.filter(p => p.is_breakpoint);
  const avgConfidence = uiModel?.sphere_state.clarity || 0.5;

  if (loading) {
    return (
      <GlassCard className="p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-muted rounded w-1/3" />
          <div className="h-16 bg-muted rounded" />
          <div className="h-12 bg-muted rounded" />
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Orbit className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Predicciones</h3>
          <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/30">
            BETA
          </Badge>
        </div>
        <Button 
          variant="ghost" 
          size="sm"
          className="text-xs"
          onClick={() => navigate('/app/predictions')}
        >
          Ver todo
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>

      {/* Main content */}
      <div className="flex gap-4">
        {/* Mini orb */}
        <div className="shrink-0">
          <MiniOrb 
            clarity={avgConfidence} 
            pulseState={uiModel?.sphere_state.pulse_state || 'calm'} 
          />
        </div>

        {/* Stats */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Predicciones activas</span>
            <span className="font-medium text-foreground">{predictions.length}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Confianza promedio</span>
            <span className="font-medium text-foreground">{Math.round(avgConfidence * 100)}%</span>
          </div>
          {breakpoints.length > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-destructive flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Puntos críticos
              </span>
              <span className="font-medium text-destructive">{breakpoints.length}</span>
            </div>
          )}
        </div>
      </div>

      {/* Top predictions */}
      {topPredictions.length > 0 ? (
        <div className="mt-4 space-y-2">
          <p className="text-xs text-muted-foreground font-medium">Top predicciones</p>
          {topPredictions.map(pred => (
            <PredictionCardMini key={pred.id} prediction={pred} />
          ))}
        </div>
      ) : (
        <div className="mt-4 text-center py-4">
          <Sparkles className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground mb-3">
            Generá tus primeras predicciones
          </p>
          <Button 
            size="sm" 
            onClick={generateNewPredictions}
            className="gradient-primary text-primary-foreground"
          >
            <Eye className="w-4 h-4 mr-2" />
            Analizar futuro
          </Button>
        </div>
      )}

      {/* CTA */}
      {predictions.length > 0 && (
        <Button 
          variant="outline" 
          className="w-full mt-4"
          onClick={() => navigate('/app/predictions')}
        >
          <Orbit className="w-4 h-4 mr-2" />
          Explorar Planetario
        </Button>
      )}
    </GlassCard>
  );
});

PredictionsWidget.displayName = 'PredictionsWidget';
export default PredictionsWidget;
