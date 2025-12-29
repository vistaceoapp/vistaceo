import { useState, useEffect, useMemo } from 'react';
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
  ChevronRight,
  Search,
  Building2,
  Briefcase
} from 'lucide-react';
import { VistaceoLogo } from '@/components/ui/VistaceoLogo';
import { useBusiness } from '@/contexts/BusinessContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

// Import step components
import { SetupStepChips } from '@/components/app/SetupStepChips';
import { SetupStepSlider } from '@/components/app/SetupStepSlider';
import { SetupStepMix } from '@/components/app/SetupStepMix';
import { SetupStepSearch } from '@/components/app/SetupStepSearch';
import { CompetitorData } from '@/lib/setupSteps';

// Import new business types helper
import {
  getCountries,
  getAreas,
  getBusinessTypes,
  searchBusinessTypes,
  getAreaById,
  getBusinessTypeById,
  type CountryCode,
  type Area,
  type BusinessType,
} from '@/lib/setupBusinessTypes';

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
  { id: 'country', title: 'País', subtitle: 'Dónde operás', icon: Globe, required: true, fastTrack: true, section: 'identity' },
  { id: 'area', title: 'Sector', subtitle: 'Tu industria', icon: Building2, required: true, fastTrack: true, section: 'identity' },
  { id: 'business_type', title: 'Tipo de negocio', subtitle: 'Qué hacés', icon: Briefcase, required: true, fastTrack: true, section: 'identity' },
  { id: 'business_name', title: 'Tu negocio', subtitle: 'Nombre y detalles', icon: Store, required: true, fastTrack: true, section: 'identity' },
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

interface SetupData {
  businessName: string;
  country: CountryCode;
  areaId: string;
  businessTypeId: string;
  businessTypeLabel: string;
  mode: 'fast' | 'complete';
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
  const [searchQuery, setSearchQuery] = useState('');
  
  const [setupData, setSetupData] = useState<SetupData>({
    businessName: currentBusiness?.name || '',
    country: (currentBusiness?.country as CountryCode) || 'AR',
    areaId: '',
    businessTypeId: '',
    businessTypeLabel: '',
    mode: 'fast',
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

  // Get countries, areas, and business types based on selection
  const countries = useMemo(() => getCountries(), []);
  const areas = useMemo(() => getAreas(setupData.country), [setupData.country]);
  const businessTypes = useMemo(() => 
    setupData.areaId ? getBusinessTypes(setupData.areaId, setupData.country) : [],
    [setupData.areaId, setupData.country]
  );
  const searchResults = useMemo(() => 
    searchQuery.length >= 2 ? searchBusinessTypes(searchQuery, setupData.country) : [],
    [searchQuery, setupData.country]
  );

  // Skip business creation steps if business already exists
  useEffect(() => {
    if (currentBusiness && !businessCreated) {
      setBusinessCreated(true);
      const modeIndex = activeSteps.findIndex(s => s.id === 'mode');
      if (modeIndex > 0) {
        setCurrentStep(modeIndex);
      }
    }
  }, [currentBusiness, businessCreated]);

  // Filter steps based on mode and business existence
  const activeSteps = SETUP_STEPS.filter(step => {
    if (currentBusiness && ['country', 'area', 'business_type', 'business_name'].includes(step.id)) {
      return false;
    }
    return setupMode === 'complete' || step.fastTrack;
  });
  
  const stepConfig = activeSteps[currentStep];
  const totalSteps = activeSteps.length;
  const progressPercent = ((currentStep + 1) / totalSteps) * 100;

  const precisionScore = calculatePrecision(setupData, setupMode);

  const handleNext = async () => {
    if (stepConfig?.id === 'business_name' && !currentBusiness) {
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
    if (!user || !setupData.businessName.trim() || !setupData.businessTypeId) return;
    setLoading(true);

    try {
      const { data: businessData, error } = await supabase.from("businesses").insert({
        name: setupData.businessName.trim(),
        category: 'restaurant' as const,
        country: setupData.country as any,
        owner_id: user.id,
        setup_completed: false,
      }).select().single();

      if (error) throw error;

      if (businessData) {
        await supabase.from("business_setup_progress").insert({
          business_id: businessData.id,
          current_step: 'mode',
          setup_data: {
            ...setupData,
            area_id: setupData.areaId,
            business_type_id: setupData.businessTypeId,
            business_type_label: setupData.businessTypeLabel,
          } as any,
          precision_score: 20,
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
          service_model: setupData.serviceModel,
          active_dayparts: setupData.activeDayparts,
          channel_mix: setupData.channelMix,
          precision_score: precisionScore,
          settings: {
            area_id: setupData.areaId,
            business_type_id: setupData.businessTypeId,
            business_type_label: setupData.businessTypeLabel,
          }
        })
        .eq('id', currentBusiness.id);

      await supabase
        .from('business_brains')
        .upsert({
          business_id: currentBusiness.id,
          primary_business_type: setupData.businessTypeId,
          current_focus: setupData.currentFocus || 'ventas',
          factual_memory: {
            positioning: setupData.positioning,
            top_sellers: setupData.topSellers,
            ticket_range: setupData.ticketRange,
            constraints: setupData.constraints,
            area_id: setupData.areaId,
            business_type_label: setupData.businessTypeLabel,
          },
          preferences_memory: {
            autopilot_mode: 'standard',
            language: setupData.country === 'BR' ? 'pt-BR' : 'es',
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
      case 'country': return !!setupData.country;
      case 'area': return !!setupData.areaId;
      case 'business_type': return !!setupData.businessTypeId;
      case 'business_name': return setupData.businessName.trim().length >= 2;
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

  const handleSearchUpdate = (updates: Partial<SetupData>) => {
    setSetupData(d => ({ ...d, ...updates }));
  };

  const selectBusinessType = (bt: BusinessType & { label: string; area?: Area & { label: string } }) => {
    setSetupData(d => ({
      ...d,
      areaId: bt.area_id,
      businessTypeId: bt.id,
      businessTypeLabel: bt.label,
    }));
    setSearchQuery('');
  };

  // Render step content
  const renderStepContent = () => {
    const stepId = stepConfig?.id;

    switch (stepId) {
      case 'welcome':
        return (
          <div className="flex flex-col items-center justify-center text-center space-y-8 py-8">
            <div className="relative">
              <div className="absolute inset-0 blur-3xl bg-primary/20 rounded-full animate-pulse" />
              <div className="relative w-28 h-28 rounded-3xl gradient-primary flex items-center justify-center shadow-2xl">
                <VistaceoLogo size={70} variant="icon" />
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

      case 'country':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-3">
              {countries.map((country) => (
                <button
                  key={country.code}
                  onClick={() => setSetupData(d => ({ ...d, country: country.code as CountryCode, areaId: '', businessTypeId: '', businessTypeLabel: '' }))}
                  className={cn(
                    "group p-5 rounded-xl border-2 text-center transition-all hover:scale-105",
                    setupData.country === country.code
                      ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <span className="text-4xl block mb-2 group-hover:scale-110 transition-transform">
                    {getCountryFlag(country.code)}
                  </span>
                  <p className="font-medium text-foreground text-sm">{country.name}</p>
                </button>
              ))}
            </div>
          </div>
        );

      case 'area':
        return (
          <div className="space-y-6">
            {/* Search bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscá tu tipo de negocio..."
                className="pl-12 h-14 text-lg bg-card border-border"
              />
            </div>

            {/* Search Results */}
            {searchQuery.length >= 2 && searchResults.length > 0 && (
              <div className="space-y-2 max-h-64 overflow-y-auto border border-border rounded-xl p-2 bg-card">
                {searchResults.slice(0, 8).map((result) => (
                  <button
                    key={result.id}
                    onClick={() => {
                      selectBusinessType(result);
                      setCurrentStep(prev => prev + 2); // Skip to business_name
                    }}
                    className="w-full p-3 rounded-lg text-left hover:bg-primary/5 transition-colors border border-transparent hover:border-primary/20"
                  >
                    <p className="font-medium text-foreground">{result.label}</p>
                    <p className="text-xs text-muted-foreground">{result.area.label}</p>
                    {result.definition && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{result.definition}</p>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Areas Grid */}
            {searchQuery.length < 2 && (
              <>
                <p className="text-sm text-muted-foreground text-center">O seleccioná tu sector</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto">
                  {areas.map((area) => (
                    <button
                      key={area.id}
                      onClick={() => setSetupData(d => ({ ...d, areaId: area.id, businessTypeId: '', businessTypeLabel: '' }))}
                      className={cn(
                        "p-4 rounded-xl border-2 text-left transition-all hover:scale-[1.02]",
                        setupData.areaId === area.id
                          ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <p className="font-medium text-foreground text-sm">{area.label}</p>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        );

      case 'business_type':
        const selectedArea = getAreaById(setupData.areaId, setupData.country);
        return (
          <div className="space-y-6">
            {selectedArea && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="secondary">{selectedArea.label}</Badge>
                <button 
                  onClick={() => {
                    setSetupData(d => ({ ...d, areaId: '', businessTypeId: '', businessTypeLabel: '' }));
                    setCurrentStep(prev => prev - 1);
                  }}
                  className="text-primary text-xs hover:underline"
                >
                  Cambiar sector
                </button>
              </div>
            )}

            {/* Search within area */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscá tu tipo de negocio..."
                className="pl-12 h-12 bg-card border-border"
              />
            </div>

            {/* Business Types Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto">
              {(searchQuery.length >= 2 ? searchResults.filter(r => r.area_id === setupData.areaId) : businessTypes).map((bt) => (
                <button
                  key={bt.id}
                  onClick={() => selectBusinessType(bt)}
                  className={cn(
                    "p-3 rounded-xl border-2 text-left transition-all hover:scale-[1.02]",
                    setupData.businessTypeId === bt.id
                      ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <p className="font-medium text-foreground text-sm">{bt.label}</p>
                  {bt.definition && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{bt.definition}</p>
                  )}
                </button>
              ))}
            </div>

            {/* Show all types option */}
            {searchQuery.length < 2 && (
              <button
                onClick={() => {
                  setSetupData(d => ({ ...d, areaId: '' }));
                  setCurrentStep(prev => prev - 1);
                }}
                className="w-full text-center text-sm text-primary hover:underline py-2"
              >
                Ver otros sectores
              </button>
            )}
          </div>
        );

      case 'business_name':
        return (
          <div className="space-y-6">
            {setupData.businessTypeLabel && (
              <div className="p-3 bg-primary/5 rounded-xl border border-primary/20">
                <p className="text-sm text-muted-foreground">Tipo seleccionado</p>
                <p className="font-medium text-foreground">{setupData.businessTypeLabel}</p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-foreground mb-3 block">
                ¿Cómo se llama tu negocio?
              </label>
              <Input
                value={setupData.businessName}
                onChange={(e) => setSetupData(d => ({ ...d, businessName: e.target.value }))}
                placeholder="Ej: Café Central, La Trattoria, Studio Fit..."
                className="h-14 text-lg bg-card border-border"
                autoFocus
              />
              <p className="text-xs text-muted-foreground mt-2">
                Podés cambiarlo después
              </p>
            </div>
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
            countryCode={setupData.country as any}
            data={setupData as any}
            onUpdate={handleSearchUpdate as any}
          />
        );

      case 'competitors':
        return (
          <SetupStepSearch
            stepId="competitors"
            countryCode={setupData.country as any}
            data={setupData as any}
            onUpdate={handleSearchUpdate as any}
            businessLat={setupData.googleLat}
            businessLng={setupData.googleLng}
            businessType={setupData.businessTypeId}
          />
        );

      case 'positioning':
        const positioningSuggestions = [
          'Café de especialidad para oficinistas',
          'Restaurante familiar con menú del día',
          'Bar con tapas y tragos de autor',
          'Comida rápida saludable',
          'Estudio de yoga para principiantes',
          'Clínica dental familiar',
        ];
        return (
          <div className="space-y-6">
            <textarea
              value={setupData.positioning}
              onChange={(e) => setSetupData(d => ({ ...d, positioning: e.target.value }))}
              placeholder="Ej: Café de especialidad para gente que trabaja cerca..."
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
        const models = ['Presencial', 'Online', 'Híbrido', 'Delivery-first', 'A domicilio'];
        return (
          <SetupStepChips
            options={models}
            selected={setupData.serviceModel ? [setupData.serviceModel] : []}
            onSelect={(val) => setSetupData(d => ({ ...d, serviceModel: val }))}
            multiple={false}
          />
        );

      case 'dayparts':
        const dayparts = setupData.country === 'BR' 
          ? ['Manhã', 'Almoço', 'Tarde', 'Jantar', 'Noite']
          : ['Mañana', 'Mediodía', 'Tarde', 'Noche', 'Madrugada'];
        return (
          <SetupStepChips
            options={dayparts}
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
        const sellerSuggestions = ['Servicio principal', 'Producto estrella', 'Oferta especial', 'Combo/Pack', 'Novedad'];
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
              Seleccioná hasta 3 productos/servicios estrella
            </p>
          </div>
        );

      case 'ticket':
        const ticketRanges = getTicketRanges(setupData.country);
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
          { value: 'clientes', label: 'Más clientes', emoji: '👥' },
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
              <p className="text-sm font-medium text-foreground mb-3">Tiempo semanal para vistaceo:</p>
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
                  Mientras más uses vistaceo, más preciso se vuelve.
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
          <VistaceoLogo size={40} variant="full" />
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
                <VistaceoLogo size={28} variant="icon" />
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
                ) : stepConfig?.id === 'business_name' && !currentBusiness ? (
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
  if (data.areaId) score += 5;
  if (data.businessTypeId) score += 10;
  if (data.positioning) score += 10;
  if (data.serviceModel) score += 10;
  if (data.activeDayparts.length > 0) score += 10;
  if (data.topSellers.length > 0) score += 10;
  if (data.ticketRange) score += 10;
  if (data.currentFocus) score += 10;
  if (data.constraints.weeklyTime) score += 5;
  if (data.constraints.teamSize) score += 5;
  if (data.competitors.length > 0) score += 5;
  
  if (mode === 'complete') score += 5;
  
  return Math.min(score, 100);
}

function getCountryFlag(code: string): string {
  const flags: Record<string, string> = {
    AR: '🇦🇷',
    UY: '🇺🇾',
    BR: '🇧🇷',
    CL: '🇨🇱',
    CO: '🇨🇴',
    EC: '🇪🇨',
    MX: '🇲🇽',
    CR: '🇨🇷',
    PA: '🇵🇦',
  };
  return flags[code] || '🌎';
}

function getTicketRanges(country: CountryCode): string[] {
  switch (country) {
    case 'AR':
      return ['$5.000-10.000', '$10.000-20.000', '$20.000-40.000', '$40.000-80.000', '+$80.000'];
    case 'MX':
      return ['$100-300', '$300-600', '$600-1000', '$1000-2000', '+$2000'];
    case 'BR':
      return ['R$30-80', 'R$80-150', 'R$150-300', 'R$300-500', '+R$500'];
    case 'CL':
      return ['$5.000-15.000', '$15.000-30.000', '$30.000-50.000', '$50.000-100.000', '+$100.000'];
    case 'CO':
      return ['$20.000-50.000', '$50.000-100.000', '$100.000-200.000', '$200.000-400.000', '+$400.000'];
    default:
      return ['$10-30', '$30-60', '$60-100', '$100-200', '+$200'];
  }
}

export default SetupPage;
