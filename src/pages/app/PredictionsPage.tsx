import { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Orbit, 
  TrendingUp, 
  AlertTriangle, 
  ChevronRight,
  Sparkles,
  Eye,
  Filter,
  Calendar,
  Target,
  Zap,
  RefreshCw,
  Info,
  X,
  Check,
  ArrowRight,
  Wallet,
  Users,
  Settings,
  ShoppingCart,
  Megaphone,
  Package,
  Cpu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { usePredictions } from '@/hooks/use-predictions';
import { 
  HORIZON_RINGS, 
  PREDICTION_DOMAINS, 
  PUBLICATION_LEVELS,
  type Prediction,
  type HorizonRing,
  type PredictionDomain 
} from '@/lib/predictions/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Domain icons mapping
const DOMAIN_ICONS: Record<PredictionDomain, React.ElementType> = {
  cashflow: Wallet,
  demand: TrendingUp,
  operations: Settings,
  customer: Users,
  competition: Target,
  risk: AlertTriangle,
  strategy: Orbit,
  pricing: Zap,
  inventory: Package,
  sales: ShoppingCart,
  marketing: Megaphone,
  team: Users,
  tech: Cpu,
};

// Planetary Sphere Visualization
const PlanetarySphere = memo(({ 
  predictions, 
  onSelectPrediction 
}: { 
  predictions: Prediction[];
  onSelectPrediction: (p: Prediction) => void;
}) => {
  const rings: HorizonRing[] = ['H0', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'H7'];
  
  return (
    <div className="relative w-full aspect-square max-w-lg mx-auto">
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-radial from-primary/20 via-transparent to-transparent rounded-full" />
      
      {/* SVG Rings */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 400">
        {rings.map((ring, i) => {
          const radius = 40 + i * 20;
          const ringPreds = predictions.filter(p => p.horizon_ring === ring);
          const hasBreakpoint = ringPreds.some(p => p.is_breakpoint);
          
          return (
            <g key={ring}>
              {/* Ring circle */}
              <circle
                cx="200"
                cy="200"
                r={radius}
                fill="none"
                stroke={hasBreakpoint ? 'hsl(var(--destructive))' : 'hsl(var(--primary))'}
                strokeWidth={ringPreds.length > 0 ? 2 : 0.5}
                strokeOpacity={0.3 + ringPreds.length * 0.1}
                strokeDasharray={i > 3 ? '4 4' : 'none'}
              />
              
              {/* Ring label */}
              <text
                x="200"
                y={200 - radius - 5}
                textAnchor="middle"
                className="fill-muted-foreground text-[8px]"
              >
                {HORIZON_RINGS[ring].label}
              </text>
              
              {/* Prediction dots on ring */}
              {ringPreds.map((pred, j) => {
                const angle = (j / Math.max(ringPreds.length, 1)) * 2 * Math.PI - Math.PI / 2;
                const x = 200 + radius * Math.cos(angle);
                const y = 200 + radius * Math.sin(angle);
                
                return (
                  <motion.circle
                    key={pred.id}
                    cx={x}
                    cy={y}
                    r={6 + pred.probability * 4}
                    className={cn(
                      "cursor-pointer transition-all",
                      pred.is_breakpoint ? "fill-destructive" : "fill-primary"
                    )}
                    fillOpacity={0.5 + pred.confidence * 0.5}
                    whileHover={{ scale: 1.5 }}
                    onClick={() => onSelectPrediction(pred)}
                  />
                );
              })}
            </g>
          );
        })}
        
        {/* Central orb */}
        <circle
          cx="200"
          cy="200"
          r="30"
          className="fill-primary/80"
        />
        <circle
          cx="200"
          cy="200"
          r="25"
          className="fill-background"
        />
        <circle
          cx="200"
          cy="200"
          r="20"
          className="fill-primary"
        />
      </svg>
      
      {/* Legend */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-primary" />
          <span>Predicción</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-destructive" />
          <span>Punto crítico</span>
        </div>
      </div>
    </div>
  );
});
PlanetarySphere.displayName = 'PlanetarySphere';

// Prediction Card
const PredictionCard = memo(({ 
  prediction, 
  onView,
  onDismiss,
  onConvert
}: { 
  prediction: Prediction;
  onView: () => void;
  onDismiss: () => void;
  onConvert: () => void;
}) => {
  const domainInfo = PREDICTION_DOMAINS[prediction.domain];
  const horizonInfo = HORIZON_RINGS[prediction.horizon_ring];
  const levelInfo = PUBLICATION_LEVELS[prediction.publication_level];
  const DomainIcon = DOMAIN_ICONS[prediction.domain];

  return (
    <Card className={cn(
      "transition-all hover:border-primary/50",
      prediction.is_breakpoint && "border-destructive/50 bg-destructive/5"
    )}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center",
              prediction.is_breakpoint ? "bg-destructive/20" : "bg-primary/20"
            )}>
              <DomainIcon className={cn(
                "w-5 h-5",
                prediction.is_breakpoint ? "text-destructive" : "text-primary"
              )} />
            </div>
            <div>
              <CardTitle className="text-base">{prediction.title}</CardTitle>
              <CardDescription className="text-xs">
                {domainInfo.label} • {horizonInfo.label}
              </CardDescription>
            </div>
          </div>
          <Badge 
            variant="outline" 
            className={cn(
              "text-[10px]",
              prediction.publication_level === 'A' && "bg-success/10 text-success border-success/30",
              prediction.publication_level === 'B' && "bg-warning/10 text-warning border-warning/30",
              prediction.publication_level === 'C' && "bg-muted text-muted-foreground"
            )}
          >
            {levelInfo.label}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {prediction.summary && (
          <p className="text-sm text-muted-foreground">{prediction.summary}</p>
        )}
        
        {/* Metrics */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center justify-between p-2 rounded-lg bg-secondary/50">
            <span className="text-muted-foreground">Probabilidad</span>
            <span className="font-bold text-primary">{Math.round(prediction.probability * 100)}%</span>
          </div>
          <div className="flex items-center justify-between p-2 rounded-lg bg-secondary/50">
            <span className="text-muted-foreground">Confianza</span>
            <span className="font-bold">{Math.round(prediction.confidence * 100)}%</span>
          </div>
        </div>

        {/* Uncertainty band */}
        {prediction.uncertainty_band && (
          <div className="p-2 rounded-lg bg-secondary/30">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Rango esperado</span>
              <span>{prediction.uncertainty_band.unit}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{prediction.uncertainty_band.low}</span>
              <Progress value={50} className="flex-1 h-2" />
              <span className="text-xs text-muted-foreground">{prediction.uncertainty_band.high}</span>
            </div>
            <p className="text-center text-sm font-medium mt-1">
              Base: {prediction.uncertainty_band.base}
            </p>
          </div>
        )}

        {/* Evidence strength */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground">Evidencia:</span>
          <Badge variant="secondary" className="text-[10px]">
            {prediction.evidence.evidence_strength === 'high' ? '🟢 Alta' : 
             prediction.evidence.evidence_strength === 'medium' ? '🟡 Media' : '🔴 Baja'}
          </Badge>
          <span className="text-muted-foreground">
            {prediction.evidence.signals_internal_top.length + prediction.evidence.signals_external_top.length} señales
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={onView}>
            <Eye className="w-4 h-4 mr-1" />
            Ver detalle
          </Button>
          {prediction.available_actions?.convert_to_mission && (
            <Button size="sm" className="flex-1 gradient-primary text-primary-foreground" onClick={onConvert}>
              <Target className="w-4 h-4 mr-1" />
              Misión
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onDismiss}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});
PredictionCard.displayName = 'PredictionCard';

// Calibration Card
const CalibrationCard = memo(({ 
  calibration, 
  onAnswer 
}: { 
  calibration: { id: string; priority: number; reason: string; input: { question: string; type: string; options?: Array<{ label: string; value: string | number }> } };
  onAnswer: (answer: unknown) => void;
}) => (
  <Card className="border-primary/30 bg-primary/5">
    <CardHeader className="pb-2">
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-primary" />
        <CardTitle className="text-sm">Calibración</CardTitle>
      </div>
    </CardHeader>
    <CardContent>
      <p className="text-sm mb-3">{calibration.input.question}</p>
      <p className="text-xs text-muted-foreground mb-3">{calibration.reason}</p>
      
      {calibration.input.type === 'select' && calibration.input.options && (
        <div className="flex flex-wrap gap-2">
          {calibration.input.options.map(opt => (
            <Button 
              key={String(opt.value)} 
              variant="outline" 
              size="sm"
              onClick={() => onAnswer(opt.value)}
            >
              {opt.label}
            </Button>
          ))}
        </div>
      )}
    </CardContent>
  </Card>
));
CalibrationCard.displayName = 'CalibrationCard';

// Main Page
export default function PredictionsPage() {
  const { 
    predictions, 
    calibrations,
    uiModel,
    loading, 
    generateNewPredictions,
    dismissPrediction,
    convertToMission,
    answerCalibration,
    filterByHorizon,
    filterByDomain
  } = usePredictions();

  const [selectedPrediction, setSelectedPrediction] = useState<Prediction | null>(null);
  const [activeHorizon, setActiveHorizon] = useState<HorizonRing | 'all'>('all');
  const [activeDomain, setActiveDomain] = useState<PredictionDomain | 'all'>('all');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      await generateNewPredictions();
      toast.success('Predicciones generadas');
    } catch (err) {
      toast.error('Error al generar predicciones');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDismiss = async (id: string) => {
    try {
      await dismissPrediction(id);
      toast.success('Predicción descartada');
    } catch (err) {
      toast.error('Error al descartar');
    }
  };

  const handleConvert = async (id: string) => {
    try {
      const missionId = await convertToMission(id);
      if (missionId) {
        toast.success('Misión creada desde predicción');
      }
    } catch (err) {
      toast.error('Error al convertir en misión');
    }
  };

  const filteredPredictions = predictions
    .filter(p => activeHorizon === 'all' || p.horizon_ring === activeHorizon)
    .filter(p => activeDomain === 'all' || p.domain === activeDomain);

  const breakpoints = predictions.filter(p => p.is_breakpoint);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid md:grid-cols-2 gap-6">
          <Skeleton className="aspect-square" />
          <div className="space-y-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Orbit className="w-7 h-7 text-primary" />
            Predicciones
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Anticipá el futuro de tu negocio basado en datos reales
          </p>
        </div>
        <Button 
          onClick={handleGenerate} 
          disabled={isGenerating}
          className="gradient-primary text-primary-foreground"
        >
          {isGenerating ? (
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4 mr-2" />
          )}
          Generar predicciones
        </Button>
      </div>

      {/* Calibrations */}
      {calibrations.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground">
            Calibraciones pendientes ({calibrations.length})
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {calibrations.slice(0, 3).map(cal => (
              <CalibrationCard 
                key={cal.id} 
                calibration={cal as any}
                onAnswer={(answer) => answerCalibration(cal.id, answer)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Breakpoints alert */}
      {breakpoints.length > 0 && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="flex items-center gap-4 py-4">
            <AlertTriangle className="w-8 h-8 text-destructive shrink-0" />
            <div>
              <h3 className="font-semibold text-destructive">
                {breakpoints.length} punto(s) de inflexión detectado(s)
              </h3>
              <p className="text-sm text-muted-foreground">
                Eventos críticos que requieren atención inmediata
              </p>
            </div>
            <Button variant="destructive" size="sm" className="ml-auto">
              Ver todos
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Main content */}
      <Tabs defaultValue="sphere" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="sphere" className="flex items-center gap-2">
            <Orbit className="w-4 h-4" />
            Esfera
          </TabsTrigger>
          <TabsTrigger value="list" className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Lista
          </TabsTrigger>
          <TabsTrigger value="timeline" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Timeline
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sphere" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Sphere visualization */}
            <Card>
              <CardContent className="pt-6">
                <PlanetarySphere 
                  predictions={predictions} 
                  onSelectPrediction={setSelectedPrediction}
                />
              </CardContent>
            </Card>

            {/* Stats & quality */}
            <div className="space-y-4">
              {/* Quality dashboard */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    Calidad del modelo
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-secondary/50">
                      <p className="text-xs text-muted-foreground">Precisión histórica</p>
                      <p className="text-xl font-bold text-success">
                        {Math.round((uiModel?.quality_dashboard.accuracy_event_rate || 0.75) * 100)}%
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-secondary/50">
                      <p className="text-xs text-muted-foreground">Cobertura</p>
                      <p className="text-xl font-bold text-primary">
                        {Object.values(uiModel?.quality_dashboard.coverage_by_domain || {}).filter(v => v > 0).length}/13
                      </p>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary/50">
                    <p className="text-xs text-muted-foreground mb-2">Estado del gemelo digital</p>
                    <Badge variant={uiModel?.quality_dashboard.drift_status === 'stable' ? 'default' : 'destructive'}>
                      {uiModel?.quality_dashboard.drift_status === 'stable' ? '✓ Estable' : 
                       uiModel?.quality_dashboard.drift_status === 'drifting' ? '⚠ Deriva detectada' : 
                       '🔴 Cambio de régimen'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Domain breakdown */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Por dominio</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(PREDICTION_DOMAINS).map(([key, info]) => {
                      const count = predictions.filter(p => p.domain === key).length;
                      if (count === 0) return null;
                      const Icon = DOMAIN_ICONS[key as PredictionDomain];
                      return (
                        <Badge 
                          key={key} 
                          variant="outline" 
                          className="flex items-center gap-1 cursor-pointer hover:bg-secondary"
                          onClick={() => setActiveDomain(key as PredictionDomain)}
                        >
                          <Icon className="w-3 h-3" />
                          {info.label} ({count})
                        </Badge>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Horizonte:</span>
              <div className="flex gap-1">
                <Button 
                  variant={activeHorizon === 'all' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setActiveHorizon('all')}
                >
                  Todos
                </Button>
                {(['H0', 'H1', 'H2', 'H3'] as HorizonRing[]).map(h => (
                  <Button 
                    key={h}
                    variant={activeHorizon === h ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setActiveHorizon(h)}
                  >
                    {HORIZON_RINGS[h].label}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Predictions grid */}
          {filteredPredictions.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPredictions.map(pred => (
                <PredictionCard 
                  key={pred.id}
                  prediction={pred}
                  onView={() => setSelectedPrediction(pred)}
                  onDismiss={() => handleDismiss(pred.id)}
                  onConvert={() => handleConvert(pred.id)}
                />
              ))}
            </div>
          ) : (
            <Card className="py-12 text-center">
              <Orbit className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Sin predicciones</h3>
              <p className="text-muted-foreground mb-4">
                Generá predicciones para anticipar el futuro de tu negocio
              </p>
              <Button onClick={handleGenerate} className="gradient-primary text-primary-foreground">
                <Sparkles className="w-4 h-4 mr-2" />
                Generar predicciones
              </Button>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <Card className="py-12 text-center">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Timeline en desarrollo</h3>
            <p className="text-muted-foreground">
              Próximamente: visualización temporal de predicciones y ventanas de acción
            </p>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Prediction Detail Modal */}
      <Dialog open={!!selectedPrediction} onOpenChange={() => setSelectedPrediction(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedPrediction && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {(() => {
                    const Icon = DOMAIN_ICONS[selectedPrediction.domain];
                    return <Icon className="w-5 h-5 text-primary" />;
                  })()}
                  {selectedPrediction.title}
                </DialogTitle>
                <DialogDescription>
                  {PREDICTION_DOMAINS[selectedPrediction.domain].label} • {HORIZON_RINGS[selectedPrediction.horizon_ring].label}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Summary */}
                {selectedPrediction.summary && (
                  <p className="text-muted-foreground">{selectedPrediction.summary}</p>
                )}

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg bg-secondary/50 text-center">
                    <p className="text-xs text-muted-foreground">Probabilidad</p>
                    <p className="text-2xl font-bold text-primary">
                      {Math.round(selectedPrediction.probability * 100)}%
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary/50 text-center">
                    <p className="text-xs text-muted-foreground">Confianza</p>
                    <p className="text-2xl font-bold">
                      {Math.round(selectedPrediction.confidence * 100)}%
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary/50 text-center">
                    <p className="text-xs text-muted-foreground">Nivel</p>
                    <Badge className="mt-1">
                      {PUBLICATION_LEVELS[selectedPrediction.publication_level].label}
                    </Badge>
                  </div>
                </div>

                {/* Evidence */}
                <div>
                  <h4 className="font-medium mb-2">Evidencia</h4>
                  <div className="space-y-2">
                    {selectedPrediction.evidence.signals_internal_top.map((sig, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm p-2 rounded bg-secondary/30">
                        <Badge variant="outline" className="text-[10px]">Interno</Badge>
                        <span>{sig.name}</span>
                        <span className="text-muted-foreground">→ {sig.why_it_matters}</span>
                      </div>
                    ))}
                    {selectedPrediction.evidence.signals_external_top.map((sig, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm p-2 rounded bg-secondary/30">
                        <Badge variant="outline" className="text-[10px]">Externo</Badge>
                        <span>{sig.name}</span>
                        <span className="text-muted-foreground">→ {sig.why_it_matters}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommended actions */}
                {selectedPrediction.recommended_actions.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Acciones recomendadas</h4>
                    <div className="space-y-2">
                      {selectedPrediction.recommended_actions.map((action, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-lg border">
                          <Badge variant="outline">{action.tier}</Badge>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{action.action}</p>
                            <p className="text-xs text-muted-foreground">{action.why}</p>
                            <p className="text-xs text-primary mt-1">KPI: {action.kpi}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-3 pt-4">
                  {selectedPrediction.available_actions?.convert_to_mission && (
                    <Button 
                      className="flex-1 gradient-primary text-primary-foreground"
                      onClick={() => {
                        handleConvert(selectedPrediction.id);
                        setSelectedPrediction(null);
                      }}
                    >
                      <Target className="w-4 h-4 mr-2" />
                      Convertir en Misión
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      handleDismiss(selectedPrediction.id);
                      setSelectedPrediction(null);
                    }}
                  >
                    Descartar
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
