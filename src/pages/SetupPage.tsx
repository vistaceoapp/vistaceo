import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
  TrendingUp,
  Globe,
  ChevronRight
} from 'lucide-react';
import { OwlLogo } from '@/components/ui/OwlLogo';
import { useBusiness } from '@/contexts/BusinessContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { COUNTRY_PACKS, CountryCode } from '@/lib/countryPacks';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

// Import step components
import { SetupStepChips } from '@/components/app/SetupStepChips';
import { SetupStepSlider } from '@/components/app/SetupStepSlider';
import { SetupStepMix } from '@/components/app/SetupStepMix';
import { SetupStepSearch } from '@/components/app/SetupStepSearch';
import { CompetitorData } from '@/lib/setupSteps';

import type { Database } from "@/integrations/supabase/types";

type BusinessCategory = Database["public"]["Enums"]["business_category"];

// Step definitions for new flow
interface SetupStepDef {
  id: string;
  title: string;
  subtitle: string;
  icon: typeof Brain;
  required: boolean;
  fastTrack: boolean;
  section: 'intro' | 'identity' | 'operations' | 'strategy' | 'finish';
}

const SETUP_STEPS: SetupStepDef[] = [
  { id: 'welcome', title: 'Bienvenido', subtitle: 'Armemos tu dashboard en minutos', icon: Brain, required: true, fastTrack: true, section: 'intro' },
  { id: 'business_name', title: 'Tu negocio', subtitle: 'Nombre y tipo', icon: Store, required: true, fastTrack: true, section: 'identity' },
  { id: 'country', title: 'Ubicación', subtitle: 'País de operación', icon: Globe, required: true, fastTrack: true, section: 'identity' },
  { id: 'mode', title: 'Tu camino', subtitle: '¿Cuánto tiempo tenés?', icon: Zap, required: true, fastTrack: true, section: 'intro' },
  { id: 'google_business', title: 'Google Business', subtitle: 'Conectar reseñas', icon: MapPin, required: false, fastTrack: true, section: 'identity' },
  { id: 'positioning', title: 'Propuesta', subtitle: '¿Qué hacés y para quién?', icon: Target, required: true, fastTrack: true, section: 'strategy' },
  { id: 'service_model', title: 'Modelo', subtitle: 'Cómo vendés', icon: Users, required: true, fastTrack: true, section: 'operations' },
  { id: 'dayparts', title: 'Horarios', subtitle: 'Franjas principales', icon: Calendar, required: true, fastTrack: true, section: 'operations' },
  { id: 'top_sellers', title: 'Estrellas', subtitle: 'Productos top', icon: Utensils, required: true, fastTrack: true, section: 'operations' },
  { id: 'ticket', title: 'Ticket', subtitle: 'Promedio por venta', icon: DollarSign, required: true, fastTrack: true, section: 'operations' },
  { id: 'focus', title: 'Foco', subtitle: 'Prioridad actual', icon: Target, required: true, fastTrack: true, section: 'strategy' },
  { id: 'constraints', title: 'Contexto', subtitle: 'Restricciones reales', icon: Clock, required: true, fastTrack: true, section: 'strategy' },
  { id: 'competitors', title: 'Competencia', subtitle: 'Competidores cercanos', icon: Store, required: true, fastTrack: true, section: 'strategy' },
  { id: 'channel_mix', title: 'Canales', subtitle: 'Mix de ventas', icon: TrendingUp, required: false, fastTrack: false, section: 'operations' },
  { id: 'complete', title: 'Listo', subtitle: 'Brain activo', icon: Check, required: true, fastTrack: true, section: 'finish' },
];

const COUNTRIES: { value: CountryCode; label: string; flag: string }[] = [
  { value: "AR", label: "Argentina", flag: "🇦🇷" },
  { value: "MX", label: "México", flag: "🇲🇽" },
  { value: "CL", label: "Chile", flag: "🇨🇱" },
  { value: "CO", label: "Colombia", flag: "🇨🇴" },
  { value: "BR", label: "Brasil", flag: "🇧🇷" },
  { value: "UY", label: "Uruguay", flag: "🇺🇾" },
  { value: "CR", label: "Costa Rica", flag: "🇨🇷" },
  { value: "PA", label: "Panamá", flag: "🇵🇦" },
  { value: "US", label: "Estados Unidos", flag: "🇺🇸" },
];

interface SetupData {
  businessName: string;
  businessType: string;
  country: CountryCode;
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
  googlePlaceId?: string;
  googleRating?: number;
  googleReviewCount?: number;
  googleLat?: number;
  googleLng?: number;
  competitors: CompetitorData[];
}

const SetupPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentBusiness, refreshBusinesses } = useBusiness();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [setupMode, setSetupMode] = useState<'fast' | 'complete'>('fast');
  const [businessCreated, setBusinessCreated] = useState(false);
  
  // Use existing business data if available
  const countryCode = (currentBusiness?.country as CountryCode) || 'AR';
  const countryPack = COUNTRY_PACKS[countryCode];
  
  const [setupData, setSetupData] = useState<SetupData>({
    businessName: currentBusiness?.name || '',
    businessType: currentBusiness?.category || '',
    country: (currentBusiness?.country as CountryCode) || 'AR',
    mode: 'fast',
    primaryType: currentBusiness?.category || '',
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
    competitors: [],
  });

  // Skip business creation steps if business already exists
  useEffect(() => {
    if (currentBusiness && !businessCreated) {
      setBusinessCreated(true);
      // Find index of 'mode' step (after business creation)
      const modeIndex = activeSteps.findIndex(s => s.id === 'mode');
      if (modeIndex > 0) {
        setCurrentStep(modeIndex);
      }
    }
  }, [currentBusiness, businessCreated]);

  // Filter steps based on mode and business existence
  const activeSteps = SETUP_STEPS.filter(step => {
    // Skip business creation steps if business exists
    if (currentBusiness && (step.id === 'business_name' || step.id === 'country')) {
      return false;
    }
    return setupMode === 'complete' || step.fastTrack;
  });
  
  const stepConfig = activeSteps[currentStep];
  const totalSteps = activeSteps.length;
  const progressPercent = ((currentStep + 1) / totalSteps) * 100;

  // Section-based step grouping for sidebar
  const sectionLabels: Record<string, string> = {
    intro: 'Inicio',
    identity: 'Identidad',
    operations: 'Operación',
    strategy: 'Estrategia',
    finish: 'Finalizar',
  };

  // Precision score calculation
  const precisionScore = calculatePrecision(setupData, setupMode);

  const handleNext = async () => {
    // If we're at business creation step, create the business first
    if (stepConfig?.id === 'country' && !currentBusiness) {
      await createBusiness();
      return;
    }
    
    if (currentStep < totalSteps - 1) {
      await saveProgress();
      setCurrentStep(prev => prev + 1);
    } else {
      await completeSetup();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const createBusiness = async () => {
    if (!user || !setupData.businessName.trim() || !setupData.businessType) return;
    setLoading(true);

    try {
      const { data: businessData, error } = await supabase.from("businesses").insert({
        name: setupData.businessName.trim(),
        category: setupData.businessType as BusinessCategory,
        country: setupData.country,
        owner_id: user.id,
        setup_completed: false,
      }).select().single();

      if (error) throw error;

      if (businessData) {
        await supabase.from("business_setup_progress").insert({
          business_id: businessData.id,
          current_step: 'mode',
          setup_data: setupData as any,
          precision_score: 15,
        });
      }

      await refreshBusinesses();
      setBusinessCreated(true);
      setCurrentStep(prev => prev + 1);
      
      toast.success('Negocio creado. Continuemos con el setup.');
    } catch (error) {
      console.error("Error creating business:", error);
      toast.error("Error al crear el negocio");
    } finally {
      setLoading(false);
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
      const finalCountryPack = COUNTRY_PACKS[setupData.country] || countryPack;
      
      await supabase
        .from('business_setup_progress')
        .upsert({
          business_id: currentBusiness.id,
          current_step: 'complete',
          setup_data: setupData as any,
          precision_score: precisionScore,
          completed_at: new Date().toISOString(),
        }, { onConflict: 'business_id' });

      await supabase
        .from('businesses')
        .update({
          setup_completed: true,
          category: mapTypeToCategory(setupData.primaryType || setupData.businessType) as any,
          service_model: setupData.serviceModel,
          active_dayparts: setupData.activeDayparts,
          channel_mix: setupData.channelMix,
          precision_score: precisionScore,
        })
        .eq('id', currentBusiness.id);

      await supabase
        .from('business_brains')
        .upsert({
          business_id: currentBusiness.id,
          primary_business_type: setupData.primaryType || setupData.businessType,
          current_focus: setupData.currentFocus || 'ventas',
          factual_memory: {
            positioning: setupData.positioning,
            top_sellers: setupData.topSellers,
            ticket_range: setupData.ticketRange,
            constraints: setupData.constraints,
          },
          preferences_memory: {
            autopilot_mode: 'standard',
            language: finalCountryPack?.locale || 'es',
            currency: finalCountryPack?.currency || 'ARS',
          },
          mvc_completion_pct: precisionScore,
        }, { onConflict: 'business_id' });

      await supabase
        .from('snapshots')
        .insert({
          business_id: currentBusiness.id,
          source: 'setup_baseline',
          total_score: Math.round(precisionScore * 0.5),
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
      case 'business_name': return setupData.businessName.trim().length >= 2 && !!setupData.businessType;
      case 'country': return !!setupData.country;
      case 'mode': return true;
      case 'google_business': return true;
      case 'positioning': return setupData.positioning.length > 5;
      case 'service_model': return !!setupData.serviceModel;
      case 'dayparts': return setupData.activeDayparts.length > 0;
      case 'top_sellers': return setupData.topSellers.length > 0;
      case 'ticket': return !!setupData.ticketRange;
      case 'focus': return !!setupData.currentFocus;
      case 'constraints': return !!setupData.constraints.weeklyTime;
      case 'competitors': return setupData.competitors.length >= 1;
      case 'channel_mix': return true;
      case 'complete': return true;
      default: return true;
    }
  };

  const handleSearchUpdate = (updates: Partial<SetupData>, precisionDelta?: number) => {
    setSetupData(d => ({ ...d, ...updates }));
  };

  // Render step content
  const renderStepContent = () => {
    const stepId = stepConfig?.id;
    const effectiveCountryPack = COUNTRY_PACKS[setupData.country] || countryPack;

    switch (stepId) {
      case 'welcome':
        return (
          <div className="flex flex-col items-center justify-center text-center space-y-8 py-8">
            <div className="relative">
              <div className="absolute inset-0 blur-3xl bg-primary/30 rounded-full animate-pulse" />
              <div className="relative w-28 h-28 rounded-3xl gradient-primary flex items-center justify-center shadow-2xl shadow-primary/30">
                <OwlLogo size={70} />
              </div>
            </div>
            <div className="space-y-4 max-w-md">
              <h2 className="text-3xl font-bold text-foreground">
                Soy tu CEO digital 🧠
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                En los próximos minutos armaremos tu <strong className="text-foreground">Brain</strong> personalizado.
                Cada respuesta mejora mis recomendaciones.
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <Clock className="w-4 h-4" />
                <span>5-8 minutos</span>
              </div>
            </div>
          </div>
        );

      case 'business_name':
        const businessTypes = [
          { value: 'restaurant', label: 'Restaurante', emoji: '🍽️' },
          { value: 'cafeteria', label: 'Cafetería', emoji: '☕' },
          { value: 'bar', label: 'Bar', emoji: '🍺' },
          { value: 'fast_casual', label: 'Fast Casual', emoji: '🍔' },
          { value: 'heladeria', label: 'Heladería', emoji: '🍦' },
          { value: 'panaderia', label: 'Panadería', emoji: '🥐' },
          { value: 'dark_kitchen', label: 'Dark Kitchen', emoji: '👨‍🍳' },
        ];
        return (
          <div className="space-y-8">
            <div>
              <label className="text-sm font-medium text-foreground mb-3 block">
                Nombre de tu negocio
              </label>
              <Input
                value={setupData.businessName}
                onChange={(e) => setSetupData(d => ({ ...d, businessName: e.target.value }))}
                placeholder="Ej: Café Central, La Trattoria..."
                className="h-14 text-lg bg-card border-border"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-4 block">
                Tipo de negocio
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {businessTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setSetupData(d => ({ ...d, businessType: type.value, primaryType: type.value }))}
                    className={cn(
                      "p-4 rounded-xl border-2 text-center transition-all hover:scale-105",
                      setupData.businessType === type.value 
                        ? "border-primary bg-primary/5 shadow-lg shadow-primary/10" 
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <span className="text-3xl block mb-2">{type.emoji}</span>
                    <span className="text-sm font-medium text-foreground">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 'country':
        return (
          <div className="grid grid-cols-3 gap-3">
            {COUNTRIES.map((country) => (
              <button
                key={country.value}
                onClick={() => setSetupData(d => ({ ...d, country: country.value }))}
                className={cn(
                  "group p-5 rounded-xl border-2 text-center transition-all hover:scale-105",
                  setupData.country === country.value
                    ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                    : "border-border hover:border-primary/50"
                )}
              >
                <span className="text-4xl block mb-2 group-hover:scale-110 transition-transform">
                  {country.flag}
                </span>
                <p className="font-medium text-foreground text-sm">{country.label}</p>
              </button>
            ))}
          </div>
        );

      case 'mode':
        return (
          <div className="space-y-4">
            <div 
              className={cn(
                "p-6 rounded-2xl border-2 cursor-pointer transition-all hover:shadow-lg",
                setupMode === 'fast' 
                  ? "border-primary bg-primary/5 shadow-lg shadow-primary/10" 
                  : "border-border hover:border-primary/50"
              )}
              onClick={() => { setSetupMode('fast'); setSetupData(d => ({ ...d, mode: 'fast' })); }}
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Zap className="w-7 h-7 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-foreground mb-1">Empezar rápido</h3>
                  <p className="text-muted-foreground">5-8 min • Dashboard útil desde hoy</p>
                </div>
                {setupMode === 'fast' && <Check className="w-6 h-6 text-primary" />}
              </div>
            </div>

            <div 
              className={cn(
                "p-6 rounded-2xl border-2 cursor-pointer transition-all hover:shadow-lg",
                setupMode === 'complete' 
                  ? "border-primary bg-primary/5 shadow-lg shadow-primary/10" 
                  : "border-border hover:border-primary/50"
              )}
              onClick={() => { setSetupMode('complete'); setSetupData(d => ({ ...d, mode: 'complete' })); }}
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Target className="w-7 h-7 text-accent" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-foreground mb-1">Setup completo</h3>
                  <p className="text-muted-foreground">10-15 min • Máxima precisión inicial</p>
                </div>
                {setupMode === 'complete' && <Check className="w-6 h-6 text-primary" />}
              </div>
            </div>

            <p className="text-sm text-center text-muted-foreground pt-2">
              Podés completar más info después
            </p>
          </div>
        );

      case 'google_business':
        return (
          <SetupStepSearch
            stepId="google_business"
            countryCode={setupData.country}
            data={setupData}
            onUpdate={handleSearchUpdate}
          />
        );

      case 'competitors':
        return (
          <SetupStepSearch
            stepId="competitors"
            countryCode={setupData.country}
            data={setupData}
            onUpdate={handleSearchUpdate}
            businessLat={setupData.googleLat}
            businessLng={setupData.googleLng}
            businessType={setupData.primaryType || setupData.businessType}
          />
        );

      case 'positioning':
        const positioningSuggestions = [
          'Café de especialidad para oficinistas',
          'Restaurante familiar con menú del día',
          'Bar con tapas y tragos de autor',
          'Comida rápida saludable',
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
              <p className="text-xs text-muted-foreground">Ideas:</p>
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
            options={effectiveCountryPack?.dayparts || ['Desayuno', 'Almuerzo', 'Merienda', 'Cena', 'After']}
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
        const primaryType = setupData.primaryType || setupData.businessType;
        const sellerSuggestions = primaryType === 'cafeteria' 
          ? ['Café latte', 'Medialunas', 'Tostado', 'Brownie', 'Jugo natural']
          : primaryType === 'bar'
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
        const ticketRanges = setupData.country === 'AR' 
          ? ['$5.000-10.000', '$10.000-20.000', '$20.000-35.000', '$35.000-50.000', '+$50.000']
          : setupData.country === 'MX'
          ? ['$100-200', '$200-400', '$400-600', '$600-1000', '+$1000']
          : setupData.country === 'US'
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
                    ? "border-primary bg-primary/5 shadow-lg shadow-primary/10" 
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
              <p className="text-sm font-medium text-foreground mb-3">Tiempo semanal para UCEO:</p>
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
              <p className="text-sm font-medium text-foreground mb-3">Principal limitante:</p>
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
          <div className="flex flex-col items-center justify-center text-center space-y-8 py-8">
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
                  Mientras más uses UCEO, más preciso se vuelve.
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
    <div className="min-h-screen bg-background flex">
      {/* Sidebar - Step Navigator (Desktop) */}
      <aside className="hidden lg:flex w-80 bg-card border-r border-border flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 blur-xl bg-primary/30 rounded-full" />
              <OwlLogo size={48} className="relative z-10" />
            </div>
            <div>
              <p className="font-bold text-foreground">UCEO</p>
              <p className="text-xs text-muted-foreground">Setup Inteligente</p>
            </div>
          </div>
        </div>

        {/* Steps Navigator */}
        <div className="flex-1 py-6 px-4 overflow-y-auto">
          <div className="space-y-1">
            {activeSteps.map((step, idx) => {
              const isActive = idx === currentStep;
              const isCompleted = idx < currentStep;
              const Icon = step.icon;

              return (
                <button
                  key={step.id}
                  onClick={() => idx < currentStep && setCurrentStep(idx)}
                  disabled={idx > currentStep}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left",
                    isActive && "bg-primary/10 border border-primary/30",
                    isCompleted && "hover:bg-secondary cursor-pointer",
                    !isActive && !isCompleted && "opacity-40 cursor-not-allowed"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center transition-colors flex-shrink-0",
                    isActive && "gradient-primary shadow-lg shadow-primary/30",
                    isCompleted && "bg-success text-success-foreground",
                    !isActive && !isCompleted && "bg-secondary text-muted-foreground"
                  )}>
                    {isCompleted ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-sm font-medium truncate",
                      isActive ? "text-foreground" : "text-muted-foreground"
                    )}>
                      {step.title}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{step.subtitle}</p>
                  </div>
                  {isActive && (
                    <ChevronRight className="w-4 h-4 text-primary flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Precision Score Card */}
        <div className="p-4 border-t border-border">
          <div className="p-4 bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl border border-primary/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">Precisión</span>
              <Badge variant="secondary" className="text-primary">
                {precisionScore}%
              </Badge>
            </div>
            <Progress value={precisionScore} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              Cada respuesta mejora tu dashboard
            </p>
          </div>
        </div>

        {/* Theme Toggle */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Tema</span>
            <ThemeToggle />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <OwlLogo size={32} variant="round" />
                <span className="font-semibold text-foreground">Setup</span>
              </div>
              <Badge variant="secondary" className="gap-1">
                <Sparkles className="w-3 h-3" />
                {precisionScore}%
              </Badge>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>{currentStep + 1} de {totalSteps}</span>
              <span>{Math.round(progressPercent)}%</span>
            </div>
            <Progress value={progressPercent} className="h-1.5" />
          </div>
        </header>

        {/* Form Content */}
        <main className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={stepConfig?.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                {/* Step Header */}
                {stepConfig?.id !== 'welcome' && stepConfig?.id !== 'complete' && (
                  <div className="text-center space-y-3">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-2">
                      {stepConfig && <stepConfig.icon className="w-8 h-8 text-primary" />}
                    </div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
                      {stepConfig?.title}
                    </h1>
                    <p className="text-muted-foreground">
                      {stepConfig?.subtitle}
                    </p>
                  </div>
                )}

                {/* Step Content */}
                <div className="min-h-[280px]">
                  {renderStepContent()}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        {/* Footer Actions */}
        <footer className="sticky bottom-0 bg-background/80 backdrop-blur-sm border-t border-border">
          <div className="max-w-xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between gap-4">
              <Button
                variant="ghost"
                onClick={handleBack}
                disabled={currentStep === 0}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Atrás</span>
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
                    Ir a Inicio
                  </>
                ) : stepConfig?.id === 'country' && !currentBusiness ? (
                  <>
                    Crear negocio
                    <ArrowRight className="w-5 h-5" />
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
    </div>
  );
};

// Helper functions
function calculatePrecision(data: SetupData, mode: 'fast' | 'complete'): number {
  let score = 10;
  
  if (data.businessName) score += 5;
  if (data.businessType) score += 5;
  if (data.primaryType) score += 5;
  if (data.positioning) score += 10;
  if (data.serviceModel) score += 10;
  if (data.activeDayparts.length > 0) score += 10;
  if (data.topSellers.length > 0) score += 10;
  if (data.ticketRange) score += 10;
  if (data.currentFocus) score += 10;
  if (data.constraints.weeklyTime) score += 5;
  if (data.constraints.teamSize) score += 5;
  if (data.competitors.length > 0) score += 5;
  
  if (mode === 'complete') score += 10;
  
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
