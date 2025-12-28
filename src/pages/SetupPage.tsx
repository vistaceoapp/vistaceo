import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight, 
  ArrowLeft, 
  Brain, 
  Sparkles, 
  Check,
  Loader2,
  Clock,
  Zap,
  Target,
  MapPin,
  Store,
  Users,
  DollarSign,
  Calendar,
  Utensils,
  TrendingUp
} from 'lucide-react';
import { OwlLogo } from '@/components/ui/OwlLogo';
import { useBusiness } from '@/contexts/BusinessContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { COUNTRY_PACKS, CountryCode } from '@/lib/countryPacks';

// Import step components
import { SetupStepChips } from '@/components/app/SetupStepChips';
import { SetupStepSlider } from '@/components/app/SetupStepSlider';
import { SetupStepMix } from '@/components/app/SetupStepMix';

// Step definitions for new flow
interface SetupStepDef {
  id: string;
  title: string;
  subtitle: string;
  icon: typeof Brain;
  required: boolean;
  fastTrack: boolean; // Show in fast track mode
}

const SETUP_STEPS: SetupStepDef[] = [
  { id: 'welcome', title: '¡Bienvenido!', subtitle: 'En 5-8 minutos armamos tu dashboard personalizado.', icon: Brain, required: true, fastTrack: true },
  { id: 'mode', title: 'Elegí tu camino', subtitle: '¿Cuánto tiempo tenés?', icon: Zap, required: true, fastTrack: true },
  { id: 'type', title: '¿Qué tipo de negocio tenés?', subtitle: 'Esto define cómo te analizo.', icon: Store, required: true, fastTrack: true },
  { id: 'positioning', title: 'Tu negocio en una frase', subtitle: '¿Qué hacés y para quién?', icon: Target, required: true, fastTrack: true },
  { id: 'service_model', title: '¿Cómo vendés principalmente?', subtitle: 'Tu modelo de servicio.', icon: Users, required: true, fastTrack: true },
  { id: 'dayparts', title: '¿En qué horarios competís fuerte?', subtitle: 'Seleccioná tus franjas principales.', icon: Calendar, required: true, fastTrack: true },
  { id: 'top_sellers', title: '¿Qué vendés más?', subtitle: 'Top 1-3 productos estrella.', icon: Utensils, required: true, fastTrack: true },
  { id: 'ticket', title: 'Ticket promedio', subtitle: 'Aproximado en tu moneda local.', icon: DollarSign, required: true, fastTrack: true },
  { id: 'focus', title: '¿En qué querés enfocarte?', subtitle: 'Tu prioridad principal ahora.', icon: Target, required: true, fastTrack: true },
  { id: 'constraints', title: 'Restricciones reales', subtitle: 'Para darte recomendaciones realistas.', icon: Clock, required: true, fastTrack: true },
  { id: 'channel_mix', title: 'Mix de canales', subtitle: 'Repartí 100% de tu venta.', icon: TrendingUp, required: false, fastTrack: false },
  { id: 'capacity', title: 'Tu capacidad real', subtitle: 'Cuánto podés atender.', icon: Users, required: false, fastTrack: false },
  { id: 'costs', title: 'Costos clave', subtitle: 'Con rangos alcanza.', icon: DollarSign, required: false, fastTrack: false },
  { id: 'complete', title: '¡Listo!', subtitle: 'Tu Brain está activo.', icon: Check, required: true, fastTrack: true },
];

interface SetupData {
  mode: 'fast' | 'complete';
  primaryType: string;
  positioning: string;
  serviceModel: string;
  activeDayparts: string[];
  topSellers: string[];
  ticketRange: string;
  currentFocus: string;
  constraints: {
    weeklyTime: string;
    teamSize: string;
    mainLimitation: string;
  };
  channelMix: { dineIn: number; delivery: number; takeaway: number };
  capacity: number;
  foodCostPercent: number;
  fixedCosts: number;
}

const SetupPage = () => {
  const navigate = useNavigate();
  const { currentBusiness, refreshBusinesses } = useBusiness();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [setupMode, setSetupMode] = useState<'fast' | 'complete'>('fast');
  
  const countryCode = (currentBusiness?.country as CountryCode) || 'AR';
  const countryPack = COUNTRY_PACKS[countryCode];
  
  const [setupData, setSetupData] = useState<SetupData>({
    mode: 'fast',
    primaryType: '',
    positioning: '',
    serviceModel: '',
    activeDayparts: [],
    topSellers: [],
    ticketRange: '',
    currentFocus: '',
    constraints: {
      weeklyTime: '',
      teamSize: '',
      mainLimitation: '',
    },
    channelMix: { dineIn: 60, delivery: 30, takeaway: 10 },
    capacity: 50,
    foodCostPercent: 30,
    fixedCosts: 0,
  });

  // Filter steps based on mode
  const activeSteps = SETUP_STEPS.filter(step => 
    setupMode === 'complete' || step.fastTrack
  );
  
  const stepConfig = activeSteps[currentStep];
  const totalSteps = activeSteps.length;
  const progressPercent = ((currentStep + 1) / totalSteps) * 100;

  // Precision score calculation
  const precisionScore = calculatePrecision(setupData, setupMode);

  const handleNext = async () => {
    if (currentStep < totalSteps - 1) {
      // Auto-save progress
      await saveProgress();
      setCurrentStep(prev => prev + 1);
    } else {
      // Complete setup
      await completeSetup();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const saveProgress = async () => {
    if (!currentBusiness) return;
    
    try {
      await supabase
        .from('business_setup_progress')
        .upsert({
          business_id: currentBusiness.id,
          current_step: stepConfig?.id || 'welcome',
          setup_data: setupData as any,
          precision_score: precisionScore,
        }, { onConflict: 'business_id' });
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  const completeSetup = async () => {
    if (!currentBusiness) return;
    setLoading(true);
    
    try {
      // Mark setup as complete
      await supabase
        .from('business_setup_progress')
        .upsert({
          business_id: currentBusiness.id,
          current_step: 'complete',
          setup_data: setupData as any,
          precision_score: precisionScore,
          completed_at: new Date().toISOString(),
        }, { onConflict: 'business_id' });

      // Update business with setup data
      await supabase
        .from('businesses')
        .update({
          setup_completed: true,
          category: mapTypeToCategory(setupData.primaryType) as any,
          service_model: setupData.serviceModel,
          active_dayparts: setupData.activeDayparts,
          channel_mix: setupData.channelMix,
          precision_score: precisionScore,
        })
        .eq('id', currentBusiness.id);

      // Create or update Brain
      await supabase
        .from('business_brains')
        .upsert({
          business_id: currentBusiness.id,
          primary_business_type: setupData.primaryType,
          current_focus: setupData.currentFocus || 'ventas',
          factual_memory: {
            positioning: setupData.positioning,
            top_sellers: setupData.topSellers,
            ticket_range: setupData.ticketRange,
            constraints: setupData.constraints,
          },
          preferences_memory: {
            autopilot_mode: 'standard',
            language: countryPack.locale,
            currency: countryPack.currency,
          },
          mvc_completion_pct: precisionScore,
        }, { onConflict: 'business_id' });

      // Create baseline snapshot
      await supabase
        .from('snapshots')
        .insert({
          business_id: currentBusiness.id,
          source: 'setup_baseline',
          total_score: Math.round(precisionScore * 0.5), // Initial health score based on precision
          dimensions_json: {
            data_quality: precisionScore,
            setup_mode: setupMode,
          },
        });

      await refreshBusinesses();
      
      toast.success('¡Tu Brain está activo! Dashboard listo.');
      navigate('/app');
    } catch (error) {
      console.error('Error completing setup:', error);
      toast.error('Error al completar el setup');
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    const stepId = stepConfig?.id;
    switch (stepId) {
      case 'welcome': return true;
      case 'mode': return true;
      case 'type': return !!setupData.primaryType;
      case 'positioning': return setupData.positioning.length > 5;
      case 'service_model': return !!setupData.serviceModel;
      case 'dayparts': return setupData.activeDayparts.length > 0;
      case 'top_sellers': return setupData.topSellers.length > 0;
      case 'ticket': return !!setupData.ticketRange;
      case 'focus': return !!setupData.currentFocus;
      case 'constraints': return !!setupData.constraints.weeklyTime;
      case 'channel_mix': return true;
      case 'capacity': return true;
      case 'costs': return true;
      case 'complete': return true;
      default: return true;
    }
  };

  // Render step content
  const renderStepContent = () => {
    const stepId = stepConfig?.id;

    switch (stepId) {
      case 'welcome':
        return (
          <div className="flex flex-col items-center justify-center text-center space-y-8 py-12">
            <div className="relative">
              <div className="absolute inset-0 blur-3xl bg-primary/30 rounded-full animate-pulse" />
              <div className="relative w-32 h-32 rounded-3xl gradient-primary flex items-center justify-center shadow-2xl">
                <OwlLogo size={80} />
              </div>
            </div>
            <div className="space-y-4 max-w-lg">
              <h2 className="text-3xl font-bold text-foreground">
                Hola, soy tu CEO digital 🧠
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                En los próximos minutos voy a armar tu <strong className="text-foreground">Brain</strong> personalizado. 
                Cada respuesta mejora mis recomendaciones.
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-primary">
                <Clock className="w-4 h-4" />
                <span>Estimado: 5-8 minutos</span>
              </div>
            </div>
          </div>
        );

      case 'mode':
        return (
          <div className="space-y-6">
            <div 
              className={cn(
                "p-6 rounded-2xl border-2 cursor-pointer transition-all",
                setupMode === 'fast' 
                  ? "border-primary bg-primary/5" 
                  : "border-border hover:border-primary/50"
              )}
              onClick={() => { setSetupMode('fast'); setSetupData(d => ({ ...d, mode: 'fast' })); }}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-1">Empezar rápido</h3>
                  <p className="text-muted-foreground">5-8 min • Lo esencial para un dashboard útil desde hoy</p>
                </div>
                {setupMode === 'fast' && <Check className="w-6 h-6 text-primary" />}
              </div>
            </div>

            <div 
              className={cn(
                "p-6 rounded-2xl border-2 cursor-pointer transition-all",
                setupMode === 'complete' 
                  ? "border-primary bg-primary/5" 
                  : "border-border hover:border-primary/50"
              )}
              onClick={() => { setSetupMode('complete'); setSetupData(d => ({ ...d, mode: 'complete' })); }}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Target className="w-6 h-6 text-accent" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-1">Completar más info</h3>
                  <p className="text-muted-foreground">10-15 min • Dashboard inicial mucho más preciso</p>
                </div>
                {setupMode === 'complete' && <Check className="w-6 h-6 text-primary" />}
              </div>
            </div>

            <p className="text-sm text-center text-muted-foreground">
              Podés completar más info después en cualquier momento.
            </p>
          </div>
        );

      case 'type':
        const businessTypes = [
          { value: 'restaurant', label: 'Restaurante', emoji: '🍽️' },
          { value: 'cafeteria', label: 'Cafetería', emoji: '☕' },
          { value: 'bar', label: 'Bar', emoji: '🍺' },
          { value: 'fast_casual', label: 'Fast Casual', emoji: '🍔' },
          { value: 'heladeria', label: 'Heladería', emoji: '🍦' },
          { value: 'panaderia', label: 'Panadería', emoji: '🥐' },
          { value: 'dark_kitchen', label: 'Dark Kitchen', emoji: '👨‍🍳' },
          { value: 'food_truck', label: 'Food Truck', emoji: '🚚' },
        ];
        return (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {businessTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => setSetupData(d => ({ ...d, primaryType: type.value }))}
                className={cn(
                  "p-4 rounded-xl border-2 text-center transition-all hover:scale-105",
                  setupData.primaryType === type.value 
                    ? "border-primary bg-primary/5" 
                    : "border-border hover:border-primary/50"
                )}
              >
                <span className="text-3xl block mb-2">{type.emoji}</span>
                <span className="text-sm font-medium text-foreground">{type.label}</span>
              </button>
            ))}
          </div>
        );

      case 'positioning':
        const positioningSuggestions = [
          'Café de especialidad para gente que trabaja cerca',
          'Restaurante familiar con menú ejecutivo',
          'Bar con tapas y tragos de autor',
          'Comida rápida saludable para oficinas',
        ];
        return (
          <div className="space-y-6">
            <textarea
              value={setupData.positioning}
              onChange={(e) => setSetupData(d => ({ ...d, positioning: e.target.value }))}
              placeholder="Ej: Café de especialidad para gente que trabaja cerca"
              className="w-full h-32 p-4 rounded-xl border border-border bg-card text-foreground resize-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Sugerencias:</p>
              <div className="flex flex-wrap gap-2">
                {positioningSuggestions.map((sug, i) => (
                  <button
                    key={i}
                    onClick={() => setSetupData(d => ({ ...d, positioning: sug }))}
                    className="px-3 py-1.5 text-xs bg-secondary rounded-full hover:bg-primary/10 transition-colors"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 'service_model':
        const models = ['Salón', 'Delivery-first', 'Take away', 'Híbrido'];
        return (
          <SetupStepChips
            options={models}
            selected={setupData.serviceModel ? [setupData.serviceModel] : []}
            onSelect={(val) => setSetupData(d => ({ ...d, serviceModel: val }))}
            multiple={false}
          />
        );

      case 'dayparts':
        return (
          <SetupStepChips
            options={countryPack?.dayparts || ['Desayuno', 'Almuerzo', 'Merienda', 'Cena', 'After']}
            selected={setupData.activeDayparts}
            onSelect={(val) => setSetupData(d => ({ 
              ...d, 
              activeDayparts: d.activeDayparts.includes(val) 
                ? d.activeDayparts.filter(v => v !== val)
                : [...d.activeDayparts, val]
            }))}
            multiple={true}
          />
        );

      case 'top_sellers':
        const sellerSuggestions = setupData.primaryType === 'cafeteria' 
          ? ['Café latte', 'Medialunas', 'Tostado', 'Brownie', 'Jugo natural']
          : setupData.primaryType === 'bar'
          ? ['Cerveza tirada', 'Gin tonic', 'Picada', 'Nachos', 'Hamburguesa']
          : ['Plato del día', 'Milanesa', 'Pizza', 'Ensalada', 'Postre'];
        return (
          <div className="space-y-4">
            <SetupStepChips
              options={sellerSuggestions}
              selected={setupData.topSellers}
              onSelect={(val) => setSetupData(d => ({ 
                ...d, 
                topSellers: d.topSellers.includes(val) 
                  ? d.topSellers.filter(v => v !== val)
                  : d.topSellers.length < 3 ? [...d.topSellers, val] : d.topSellers
              }))}
              multiple={true}
            />
            <p className="text-xs text-center text-muted-foreground">
              Seleccioná hasta 3 productos estrella
            </p>
          </div>
        );

      case 'ticket':
        const ticketRanges = countryCode === 'AR' 
          ? ['$5.000-10.000', '$10.000-20.000', '$20.000-35.000', '$35.000-50.000', '+$50.000']
          : countryCode === 'MX'
          ? ['$100-200', '$200-400', '$400-600', '$600-1000', '+$1000']
          : countryCode === 'US'
          ? ['$10-20', '$20-40', '$40-60', '$60-100', '+$100']
          : ['$10-20', '$20-40', '$40-60', '$60-100', '+$100'];
        return (
          <SetupStepChips
            options={ticketRanges}
            selected={setupData.ticketRange ? [setupData.ticketRange] : []}
            onSelect={(val) => setSetupData(d => ({ ...d, ticketRange: val }))}
            multiple={false}
          />
        );

      case 'focus':
        const focuses = [
          { value: 'ventas', label: 'Vender más', emoji: '💰' },
          { value: 'reputacion', label: 'Mejorar reputación', emoji: '⭐' },
          { value: 'eficiencia', label: 'Operar mejor', emoji: '⚙️' },
          { value: 'rentabilidad', label: 'Ser más rentable', emoji: '📈' },
          { value: 'delivery', label: 'Crecer en delivery', emoji: '🛵' },
          { value: 'marketing', label: 'Marketing', emoji: '📱' },
        ];
        return (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {focuses.map((focus) => (
              <button
                key={focus.value}
                onClick={() => setSetupData(d => ({ ...d, currentFocus: focus.value }))}
                className={cn(
                  "p-4 rounded-xl border-2 text-center transition-all hover:scale-105",
                  setupData.currentFocus === focus.value 
                    ? "border-primary bg-primary/5" 
                    : "border-border hover:border-primary/50"
                )}
              >
                <span className="text-2xl block mb-2">{focus.emoji}</span>
                <span className="text-sm font-medium text-foreground">{focus.label}</span>
              </button>
            ))}
          </div>
        );

      case 'constraints':
        const timeOptions = ['<5 hs/semana', '5-10 hs/semana', '10-20 hs/semana', '+20 hs/semana'];
        const teamOptions = ['Solo yo', '2-5 personas', '6-15 personas', '+15 personas'];
        const limitations = ['Tiempo', 'Dinero', 'Personal', 'Organización'];
        return (
          <div className="space-y-6">
            <div>
              <p className="text-sm font-medium text-foreground mb-3">Tiempo semanal disponible para UCEO:</p>
              <SetupStepChips
                options={timeOptions}
                selected={setupData.constraints.weeklyTime ? [setupData.constraints.weeklyTime] : []}
                onSelect={(val) => setSetupData(d => ({ 
                  ...d, 
                  constraints: { ...d.constraints, weeklyTime: val }
                }))}
                multiple={false}
              />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground mb-3">Tamaño del equipo:</p>
              <SetupStepChips
                options={teamOptions}
                selected={setupData.constraints.teamSize ? [setupData.constraints.teamSize] : []}
                onSelect={(val) => setSetupData(d => ({ 
                  ...d, 
                  constraints: { ...d.constraints, teamSize: val }
                }))}
                multiple={false}
              />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground mb-3">Principal limitante hoy:</p>
              <SetupStepChips
                options={limitations}
                selected={setupData.constraints.mainLimitation ? [setupData.constraints.mainLimitation] : []}
                onSelect={(val) => setSetupData(d => ({ 
                  ...d, 
                  constraints: { ...d.constraints, mainLimitation: val }
                }))}
                multiple={false}
              />
            </div>
          </div>
        );

      case 'channel_mix':
        return (
          <SetupStepMix
            data={setupData.channelMix}
            onUpdate={(mix) => setSetupData(d => ({ ...d, channelMix: mix }))}
          />
        );

      case 'complete':
        return (
          <div className="flex flex-col items-center justify-center text-center space-y-8 py-12">
            <div className="relative">
              <div className="absolute inset-0 blur-3xl bg-success/30 rounded-full animate-pulse" />
              <div className="relative w-24 h-24 rounded-2xl bg-success/20 flex items-center justify-center">
                <Check className="w-12 h-12 text-success" />
              </div>
            </div>
            <div className="space-y-4 max-w-lg">
              <h2 className="text-3xl font-bold text-foreground">
                ¡Tu Brain está activo! 🎉
              </h2>
              <p className="text-lg text-muted-foreground">
                Dashboard con <strong className="text-primary">{precisionScore}%</strong> de precisión inicial.
              </p>
              <div className="p-4 bg-primary/5 rounded-xl border border-primary/20">
                <p className="text-sm text-muted-foreground">
                  Mientras más uses UCEO, más preciso se vuelve. Podés agregar más info en cualquier momento.
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <OwlLogo size={40} variant="round" />
              <div>
                <p className="font-semibold text-foreground">Setup Inteligente</p>
                <p className="text-xs text-muted-foreground">
                  {countryPack?.flag} {currentBusiness?.name}
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="gap-1">
              <Sparkles className="w-3 h-3" />
              {precisionScore}% precisión
            </Badge>
          </div>
          
          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-muted-foreground mb-2">
              <span>Paso {currentStep + 1} de {totalSteps}</span>
              <span>{Math.round(progressPercent)}% completo</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8 max-w-2xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={stepConfig?.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            {/* Step Header */}
            {stepConfig?.id !== 'welcome' && stepConfig?.id !== 'complete' && (
              <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-4">
                  {stepConfig && <stepConfig.icon className="w-7 h-7 text-primary" />}
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                  {stepConfig?.title}
                </h1>
                <p className="text-muted-foreground">
                  {stepConfig?.subtitle}
                </p>
              </div>
            )}

            {/* Step Content */}
            <div className="min-h-[300px]">
              {renderStepContent()}
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer Actions */}
      <footer className="sticky bottom-0 bg-background/80 backdrop-blur-sm border-t border-border">
        <div className="container mx-auto px-4 py-4 max-w-2xl">
          <div className="flex items-center justify-between gap-4">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={currentStep === 0}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Atrás
            </Button>
            
            <Button
              onClick={handleNext}
              disabled={!canProceed() || loading}
              className="gap-2 gradient-primary flex-1 max-w-xs"
              size="lg"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : stepConfig?.id === 'complete' ? (
                <>
                  <Sparkles className="w-5 h-5" />
                  Ir al Dashboard
                </>
              ) : (
                <>
                  Siguiente
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Helper functions
function calculatePrecision(data: SetupData, mode: 'fast' | 'complete'): number {
  let score = 10; // Base
  
  if (data.primaryType) score += 10;
  if (data.positioning) score += 10;
  if (data.serviceModel) score += 10;
  if (data.activeDayparts.length > 0) score += 10;
  if (data.topSellers.length > 0) score += 10;
  if (data.ticketRange) score += 10;
  if (data.currentFocus) score += 10;
  if (data.constraints.weeklyTime) score += 5;
  if (data.constraints.teamSize) score += 5;
  
  if (mode === 'complete') {
    score += 10; // Bonus for complete mode
  }
  
  return Math.min(score, 100);
}

function mapTypeToCategory(type: string): string {
  const map: Record<string, string> = {
    'restaurant': 'restaurant',
    'cafeteria': 'cafeteria',
    'bar': 'bar',
    'fast_casual': 'fast_casual',
    'heladeria': 'heladeria',
    'panaderia': 'panaderia',
    'dark_kitchen': 'dark_kitchen',
    'food_truck': 'fast_casual',
  };
  return map[type] || 'restaurant';
}

export default SetupPage;