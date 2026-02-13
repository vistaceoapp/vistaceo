import { useState, memo, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Orbit, TrendingUp, AlertTriangle, ChevronRight, Sparkles, Eye, Filter, Calendar,
  Target, Zap, RefreshCw, Info, X, Check, ArrowRight, Wallet, Users, Settings,
  ShoppingCart, Megaphone, Package, Cpu, Send, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { usePredictions } from '@/hooks/use-predictions';
import { 
  HORIZON_RINGS, PREDICTION_DOMAINS, PUBLICATION_LEVELS,
  type Prediction, type HorizonRing, type PredictionDomain 
} from '@/lib/predictions/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { format, addDays, differenceInDays, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

// Domain icons mapping
const DOMAIN_ICONS: Record<PredictionDomain, React.ElementType> = {
  cashflow: Wallet, demand: TrendingUp, operations: Settings, customer: Users,
  competition: Target, risk: AlertTriangle, strategy: Orbit, pricing: Zap,
  inventory: Package, sales: ShoppingCart, marketing: Megaphone, team: Users, tech: Cpu,
};

// ==================== SPHERE ====================
const PlanetarySphere = memo(({ predictions, onSelectPrediction, clarity, pulseState }: { 
  predictions: Prediction[]; onSelectPrediction: (p: Prediction) => void;
  clarity: number; pulseState: 'calm' | 'active' | 'urgent';
}) => {
  const rings: HorizonRing[] = ['H0', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'H7'];
  
  return (
    <div className="relative w-full aspect-square max-w-lg mx-auto">
      <div className="absolute inset-0 bg-gradient-radial from-primary/20 via-transparent to-transparent rounded-full" />
      
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 400">
        {rings.map((ring, i) => {
          const radius = 40 + i * 20;
          const ringPreds = predictions.filter(p => p.horizon_ring === ring);
          const hasBreakpoint = ringPreds.some(p => p.is_breakpoint);
          
          return (
            <g key={ring}>
              <circle cx="200" cy="200" r={radius} fill="none"
                stroke={hasBreakpoint ? 'hsl(var(--destructive))' : 'hsl(var(--primary))'}
                strokeWidth={ringPreds.length > 0 ? 2 : 0.5}
                strokeOpacity={0.3 + ringPreds.length * 0.1}
                strokeDasharray={i > 3 ? '4 4' : 'none'}
              />
              <text x="200" y={200 - radius - 5} textAnchor="middle" className="fill-muted-foreground text-[8px]">
                {HORIZON_RINGS[ring].label}
              </text>
              {ringPreds.map((pred, j) => {
                const angle = (j / Math.max(ringPreds.length, 1)) * 2 * Math.PI - Math.PI / 2;
                const x = 200 + radius * Math.cos(angle);
                const y = 200 + radius * Math.sin(angle);
                const domainInfo = PREDICTION_DOMAINS[pred.domain];
                
                return (
                  <g key={pred.id} onClick={() => onSelectPrediction(pred)} className="cursor-pointer">
                    <motion.circle cx={x} cy={y} r={6 + pred.probability * 4}
                      className={cn(pred.is_breakpoint ? "fill-destructive" : "fill-primary")}
                      fillOpacity={0.5 + pred.confidence * 0.5}
                      whileHover={{ scale: 1.5 }}
                    />
                    <title>{pred.title} ({Math.round(pred.probability * 100)}%)</title>
                  </g>
                );
              })}
            </g>
          );
        })}
        
        {/* Central orb with clarity-based glow */}
        <motion.circle cx="200" cy="200" r="35" className="fill-primary/20"
          animate={{ r: [35, 38, 35], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: pulseState === 'urgent' ? 1 : 2, repeat: Infinity }}
        />
        <circle cx="200" cy="200" r="25" className="fill-background" />
        <circle cx="200" cy="200" r="20" className="fill-primary" style={{ opacity: 0.5 + clarity * 0.5 }} />
        <text x="200" y="205" textAnchor="middle" className="fill-primary-foreground text-[10px] font-bold">
          {predictions.length}
        </text>
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
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span>
            {pulseState === 'urgent' ? 'Urgente' : pulseState === 'active' ? 'Activo' : 'Estable'}
          </span>
        </div>
      </div>
    </div>
  );
});
PlanetarySphere.displayName = 'PlanetarySphere';

// ==================== PREDICTION CARD ====================
const PredictionCard = memo(({ prediction, onView, onDismiss, onConvert }: { 
  prediction: Prediction; onView: () => void; onDismiss: () => void; onConvert: () => void;
}) => {
  const domainInfo = PREDICTION_DOMAINS[prediction.domain];
  const horizonInfo = HORIZON_RINGS[prediction.horizon_ring];
  const levelInfo = PUBLICATION_LEVELS[prediction.publication_level];
  const DomainIcon = DOMAIN_ICONS[prediction.domain];

  return (
    <Card className={cn(
      "transition-all hover:border-primary/50 cursor-pointer",
      prediction.is_breakpoint && "border-destructive/50 bg-destructive/5"
    )} onClick={onView}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center",
              prediction.is_breakpoint ? "bg-destructive/20" : "bg-primary/20"
            )}>
              <DomainIcon className={cn("w-5 h-5", prediction.is_breakpoint ? "text-destructive" : "text-primary")} />
            </div>
            <div>
              <CardTitle className="text-base">{prediction.title}</CardTitle>
              <CardDescription className="text-xs">{domainInfo.label} • {horizonInfo.label}</CardDescription>
            </div>
          </div>
          <Badge variant="outline" className={cn("text-[10px]",
            prediction.publication_level === 'A' && "bg-success/10 text-success border-success/30",
            prediction.publication_level === 'B' && "bg-warning/10 text-warning border-warning/30",
            prediction.publication_level === 'C' && "bg-muted text-muted-foreground"
          )}>
            {levelInfo.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {prediction.summary && <p className="text-sm text-muted-foreground line-clamp-2">{prediction.summary}</p>}
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
        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground">Evidencia:</span>
          <Badge variant="secondary" className="text-[10px]">
            {prediction.evidence.evidence_strength === 'high' ? '🟢 Alta' : 
             prediction.evidence.evidence_strength === 'medium' ? '🟡 Media' : '🔴 Baja'}
          </Badge>
        </div>
        <div className="flex gap-2 pt-2" onClick={e => e.stopPropagation()}>
          <Button variant="outline" size="sm" className="flex-1" onClick={onView}>
            <Eye className="w-4 h-4 mr-1" />Ver
          </Button>
          {prediction.available_actions?.convert_to_mission && (
            <Button size="sm" className="flex-1 gradient-primary text-primary-foreground" onClick={onConvert}>
              <Target className="w-4 h-4 mr-1" />Misión
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onDismiss}><X className="w-4 h-4" /></Button>
        </div>
      </CardContent>
    </Card>
  );
});
PredictionCard.displayName = 'PredictionCard';

// ==================== INTERACTIVE CALIBRATION ====================
const CalibrationCard = memo(({ calibration, onAnswer }: { 
  calibration: { id: string; priority: number; reason: string; input: { question: string; type: string; unit?: string; options?: Array<{ label: string; value: string | number }>; min?: number; max?: number; default?: number } };
  onAnswer: (answer: unknown) => void;
}) => {
  const [textValue, setTextValue] = useState('');
  const [sliderValue, setSliderValue] = useState<number[]>([calibration.input.default || 50]);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (value: unknown) => {
    setSubmitted(true);
    onAnswer(value);
  };

  if (submitted) {
    return (
      <Card className="border-success/30 bg-success/5">
        <CardContent className="py-4 text-center">
          <Check className="w-6 h-6 text-success mx-auto mb-2" />
          <p className="text-sm text-success font-medium">¡Calibración enviada!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <CardTitle className="text-sm">Calibración</CardTitle>
          <Badge variant="outline" className="text-[10px] ml-auto">
            Prioridad {calibration.priority}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm font-medium">{calibration.input.question}</p>
        <p className="text-xs text-muted-foreground">{calibration.reason}</p>
        
        {/* Select type */}
        {calibration.input.type === 'select' && calibration.input.options && (
          <div className="flex flex-wrap gap-2">
            {calibration.input.options.map(opt => (
              <Button key={String(opt.value)} variant="outline" size="sm"
                onClick={() => handleSubmit(opt.value)}>
                {opt.label}
              </Button>
            ))}
          </div>
        )}

        {/* Slider type */}
        {(calibration.input.type === 'slider' || calibration.input.type === 'minmax') && (
          <div className="space-y-3">
            <Slider 
              value={sliderValue}
              onValueChange={setSliderValue}
              min={calibration.input.min || 0}
              max={calibration.input.max || 100}
              step={1}
            />
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{sliderValue[0]} {calibration.input.unit || ''}</span>
              <Button size="sm" onClick={() => handleSubmit(sliderValue[0])}>
                <Send className="w-4 h-4 mr-1" />Enviar
              </Button>
            </div>
          </div>
        )}

        {/* Quick number / text input */}
        {(calibration.input.type === 'quick_number' || calibration.input.type === 'tap') && (
          <div className="flex gap-2">
            <Input 
              type={calibration.input.type === 'quick_number' ? 'number' : 'text'}
              placeholder={`Ej: ${calibration.input.default || '...'} ${calibration.input.unit || ''}`}
              value={textValue}
              onChange={e => setTextValue(e.target.value)}
              className="flex-1"
              onKeyDown={e => e.key === 'Enter' && textValue && handleSubmit(calibration.input.type === 'quick_number' ? Number(textValue) : textValue)}
            />
            <Button size="sm" disabled={!textValue} onClick={() => handleSubmit(calibration.input.type === 'quick_number' ? Number(textValue) : textValue)}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
});
CalibrationCard.displayName = 'CalibrationCard';

// ==================== TIMELINE ====================
const PredictionTimeline = memo(({ predictions, onSelect }: { predictions: Prediction[]; onSelect: (p: Prediction) => void }) => {
  const now = new Date();
  
  // Group by time ranges
  const timeGroups = useMemo(() => {
    const groups: { label: string; predictions: Prediction[]; color: string }[] = [
      { label: '30 días', predictions: [], color: 'primary' },
      { label: '90 días', predictions: [], color: 'primary' },
      { label: '6 meses', predictions: [], color: 'accent' },
      { label: '1 año', predictions: [], color: 'accent' },
      { label: '3+ años', predictions: [], color: 'muted-foreground' },
    ];

    predictions.forEach(p => {
      const ring = p.horizon_ring;
      if (ring === 'H0') groups[0].predictions.push(p);
      else if (ring === 'H1') groups[1].predictions.push(p);
      else if (ring === 'H2') groups[2].predictions.push(p);
      else if (ring === 'H3') groups[3].predictions.push(p);
      else groups[4].predictions.push(p);
    });

    return groups.filter(g => g.predictions.length > 0);
  }, [predictions]);

  if (predictions.length === 0) {
    return (
      <Card className="py-12 text-center">
        <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Sin predicciones activas</h3>
        <p className="text-muted-foreground">Generá predicciones para ver el timeline</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {timeGroups.map((group, gi) => (
        <div key={group.label}>
          <div className="flex items-center gap-3 mb-3">
            <div className={cn("w-3 h-3 rounded-full", `bg-${group.color}`)} 
              style={{ backgroundColor: gi < 2 ? 'hsl(var(--primary))' : gi < 4 ? 'hsl(var(--accent))' : 'hsl(var(--muted-foreground))' }} />
            <h3 className="text-sm font-semibold text-foreground">{group.label}</h3>
            <Badge variant="outline" className="text-[10px]">{group.predictions.length}</Badge>
          </div>
          <div className="ml-6 border-l-2 border-border pl-4 space-y-3">
            {group.predictions.map(pred => {
              const DomainIcon = DOMAIN_ICONS[pred.domain];
              const domainInfo = PREDICTION_DOMAINS[pred.domain];
              return (
                <div key={pred.id} 
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all hover:border-primary/50",
                    pred.is_breakpoint && "border-destructive/30 bg-destructive/5"
                  )}
                  onClick={() => onSelect(pred)}
                >
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                    pred.is_breakpoint ? "bg-destructive/20" : "bg-primary/20"
                  )}>
                    <DomainIcon className={cn("w-4 h-4", pred.is_breakpoint ? "text-destructive" : "text-primary")} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{pred.title}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge variant="secondary" className="text-[10px]">{domainInfo.label}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {Math.round(pred.probability * 100)}% prob.
                      </span>
                      {pred.time_window?.action_window && (
                        <span className="text-xs text-primary flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Ventana de acción
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={cn("text-lg font-bold",
                      pred.is_breakpoint ? "text-destructive" : "text-primary"
                    )}>
                      {Math.round(pred.probability * 100)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
});
PredictionTimeline.displayName = 'PredictionTimeline';

// ==================== MAIN PAGE ====================
export default function PredictionsPage() {
  const { 
    predictions, calibrations, uiModel, loading, 
    generateNewPredictions, dismissPrediction, convertToMission, answerCalibration
  } = usePredictions();

  const [selectedPrediction, setSelectedPrediction] = useState<Prediction | null>(null);
  const [activeHorizon, setActiveHorizon] = useState<HorizonRing | 'all'>('all');
  const [activeDomain, setActiveDomain] = useState<PredictionDomain | 'all'>('all');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try { await generateNewPredictions(); toast.success('Predicciones generadas'); }
    catch { toast.error('Error al generar predicciones'); }
    finally { setIsGenerating(false); }
  };

  const handleDismiss = async (id: string) => {
    try { await dismissPrediction(id); toast.success('Predicción descartada'); }
    catch { toast.error('Error al descartar'); }
  };

  const handleConvert = async (id: string) => {
    try { const mid = await convertToMission(id); if (mid) toast.success('Misión creada desde predicción'); }
    catch { toast.error('Error al convertir en misión'); }
  };

  const filteredPredictions = predictions
    .filter(p => activeHorizon === 'all' || p.horizon_ring === activeHorizon)
    .filter(p => activeDomain === 'all' || p.domain === activeDomain);

  const breakpoints = predictions.filter(p => p.is_breakpoint);
  const clarity = uiModel?.sphere_state.clarity || 0.5;
  const pulseState = uiModel?.sphere_state.pulse_state || 'calm';

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid md:grid-cols-2 gap-6">
          <Skeleton className="aspect-square" />
          <div className="space-y-4"><Skeleton className="h-32" /><Skeleton className="h-32" /></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Orbit className="w-7 h-7 text-primary" />Predicciones
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Anticipá el futuro de tu negocio basado en datos reales
          </p>
        </div>
        <Button onClick={handleGenerate} disabled={isGenerating} className="gradient-primary text-primary-foreground">
          {isGenerating ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
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
            {calibrations.slice(0, 6).map(cal => (
              <CalibrationCard key={cal.id} calibration={cal as any}
                onAnswer={(answer) => answerCalibration(cal.id, answer)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Breakpoints */}
      {breakpoints.length > 0 && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="flex items-center gap-4 py-4">
            <AlertTriangle className="w-8 h-8 text-destructive shrink-0" />
            <div>
              <h3 className="font-semibold text-destructive">
                {breakpoints.length} punto(s) de inflexión detectado(s)
              </h3>
              <p className="text-sm text-muted-foreground">Eventos críticos que requieren atención inmediata</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="sphere" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="sphere"><Orbit className="w-4 h-4 mr-1" />Esfera</TabsTrigger>
          <TabsTrigger value="list"><Filter className="w-4 h-4 mr-1" />Lista</TabsTrigger>
          <TabsTrigger value="timeline"><Calendar className="w-4 h-4 mr-1" />Timeline</TabsTrigger>
        </TabsList>

        {/* SPHERE */}
        <TabsContent value="sphere" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardContent className="pt-6">
                <PlanetarySphere predictions={predictions} onSelectPrediction={setSelectedPrediction}
                  clarity={clarity} pulseState={pulseState} />
              </CardContent>
            </Card>
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2"><Info className="w-4 h-4" />Calidad del modelo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-secondary/50">
                      <p className="text-xs text-muted-foreground">Claridad</p>
                      <p className="text-xl font-bold text-primary">{Math.round(clarity * 100)}%</p>
                    </div>
                    <div className="p-3 rounded-lg bg-secondary/50">
                      <p className="text-xs text-muted-foreground">Dominios activos</p>
                      <p className="text-xl font-bold text-primary">
                        {Object.values(uiModel?.constellations || {}).filter(v => v.active).length}/13
                      </p>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary/50">
                    <p className="text-xs text-muted-foreground mb-2">Estado del gemelo digital</p>
                    <Badge variant={uiModel?.quality_dashboard.drift_status === 'stable' ? 'default' : 'destructive'}>
                      {uiModel?.quality_dashboard.drift_status === 'stable' ? '✓ Estable' : 
                       uiModel?.quality_dashboard.drift_status === 'drifting' ? '⚠ Deriva detectada' : '🔴 Cambio de régimen'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Por dominio</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(PREDICTION_DOMAINS).map(([key, info]) => {
                      const count = predictions.filter(p => p.domain === key).length;
                      if (count === 0) return null;
                      const Icon = DOMAIN_ICONS[key as PredictionDomain];
                      return (
                        <Badge key={key} variant={activeDomain === key ? 'default' : 'outline'}
                          className="flex items-center gap-1 cursor-pointer hover:bg-secondary"
                          onClick={() => setActiveDomain(activeDomain === key ? 'all' : key as PredictionDomain)}>
                          <Icon className="w-3 h-3" />{info.label} ({count})
                        </Badge>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* LIST */}
        <TabsContent value="list" className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-muted-foreground">Horizonte:</span>
            <Button variant={activeHorizon === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setActiveHorizon('all')}>Todos</Button>
            {(['H0', 'H1', 'H2', 'H3'] as HorizonRing[]).map(h => (
              <Button key={h} variant={activeHorizon === h ? 'default' : 'outline'} size="sm"
                onClick={() => setActiveHorizon(activeHorizon === h ? 'all' : h)}>{HORIZON_RINGS[h].label}</Button>
            ))}
          </div>
          {filteredPredictions.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPredictions.map(pred => (
                <PredictionCard key={pred.id} prediction={pred}
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
              <p className="text-muted-foreground mb-4">Generá predicciones para anticipar el futuro</p>
              <Button onClick={handleGenerate} className="gradient-primary text-primary-foreground">
                <Sparkles className="w-4 h-4 mr-2" />Generar predicciones
              </Button>
            </Card>
          )}
        </TabsContent>

        {/* TIMELINE */}
        <TabsContent value="timeline">
          <PredictionTimeline predictions={predictions} onSelect={setSelectedPrediction} />
        </TabsContent>
      </Tabs>

      {/* Detail Modal */}
      <Dialog open={!!selectedPrediction} onOpenChange={() => setSelectedPrediction(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedPrediction && (() => {
            const DomainIcon = DOMAIN_ICONS[selectedPrediction.domain];
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <DomainIcon className="w-5 h-5 text-primary" />{selectedPrediction.title}
                  </DialogTitle>
                  <DialogDescription>
                    {PREDICTION_DOMAINS[selectedPrediction.domain].label} • {HORIZON_RINGS[selectedPrediction.horizon_ring].label}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  {selectedPrediction.summary && <p className="text-muted-foreground">{selectedPrediction.summary}</p>}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-lg bg-secondary/50 text-center">
                      <p className="text-xs text-muted-foreground">Probabilidad</p>
                      <p className="text-2xl font-bold text-primary">{Math.round(selectedPrediction.probability * 100)}%</p>
                    </div>
                    <div className="p-3 rounded-lg bg-secondary/50 text-center">
                      <p className="text-xs text-muted-foreground">Confianza</p>
                      <p className="text-2xl font-bold">{Math.round(selectedPrediction.confidence * 100)}%</p>
                    </div>
                    <div className="p-3 rounded-lg bg-secondary/50 text-center">
                      <p className="text-xs text-muted-foreground">Nivel</p>
                      <Badge className="mt-1">{PUBLICATION_LEVELS[selectedPrediction.publication_level].label}</Badge>
                    </div>
                  </div>
                  
                  {/* Uncertainty band */}
                  {selectedPrediction.uncertainty_band && (
                    <div className="p-3 rounded-lg bg-secondary/30">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Rango esperado</span>
                        <span>{selectedPrediction.uncertainty_band.unit}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs">{selectedPrediction.uncertainty_band.low}</span>
                        <Progress value={50} className="flex-1 h-2" />
                        <span className="text-xs">{selectedPrediction.uncertainty_band.high}</span>
                      </div>
                      <p className="text-center text-sm font-medium mt-1">Base: {selectedPrediction.uncertainty_band.base}</p>
                    </div>
                  )}

                  {/* Evidence */}
                  {(selectedPrediction.evidence.signals_internal_top.length > 0 || selectedPrediction.evidence.signals_external_top.length > 0) && (
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
                  )}

                  {/* Assumptions */}
                  {selectedPrediction.evidence.assumptions?.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2 text-sm">Supuestos</h4>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {selectedPrediction.evidence.assumptions.map((a, i) => (
                          <li key={i} className="flex items-start gap-2"><span>•</span>{a}</li>
                        ))}
                      </ul>
                    </div>
                  )}

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
                      <Button className="flex-1 gradient-primary text-primary-foreground"
                        onClick={() => { handleConvert(selectedPrediction.id); setSelectedPrediction(null); }}>
                        <Target className="w-4 h-4 mr-2" />Convertir en Misión
                      </Button>
                    )}
                    <Button variant="outline" onClick={() => { handleDismiss(selectedPrediction.id); setSelectedPrediction(null); }}>
                      Descartar
                    </Button>
                  </div>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
